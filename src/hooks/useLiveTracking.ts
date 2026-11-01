import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { routeByShipmentApi } from "../api/tracking.api";
import { shipmentsApi } from "../api/shipments.api";
import type { LiveVehicle, GeofenceAlert, WsStatus } from "../types/livetracking";

const WS_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ?? "http://localhost:3002";
const POLL_MS = 15_000;

// Jakarta geofence (demo)
const WAREHOUSE_ZONES = [
  { id: "wh-jakarta", name: "Warehouse Jakarta", lat: -6.175, lng: 106.827, radius: 0.01 },
  { id: "wh-bandung", name: "Warehouse Bandung",  lat: -6.917, lng: 107.619, radius: 0.01 },
];

export function timeSince(iso?: string): string {
  if (!iso) return "—";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function mapStatus(status: string): string {
  const map: Record<string, string> = {
    PICKED_UP: "PICKED_UP",
    IN_TRANSIT: "IN_TRANSIT",
    OUT_FOR_DELIVERY: "IN_TRANSIT",
    DELIVERED: "DELIVERED",
    PENDING: "AVAILABLE",
    ASSIGNED: "AVAILABLE",
    CANCELLED: "INACTIVE",
  };
  return map[status] ?? status;
}

// Haversine distance in km
function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Estimate ETA in minutes based on current speed
function calcEta(vehicle: LiveVehicle): { distKm: number; etaMin: number } | null {
  if (!vehicle.destLat || !vehicle.destLng) return null;
  const dist = haversine(vehicle.lat, vehicle.lng, vehicle.destLat, vehicle.destLng);
  const speed = Math.max(vehicle.speed || 0, 5); // assume min 5 km/h
  const etaMin = Math.round((dist / speed) * 60);
  return { distKm: Math.round(dist * 10) / 10, etaMin };
}

// Trip progress 0–100
function calcProgress(vehicle: LiveVehicle): number {
  if (!vehicle.originLat || !vehicle.originLng || !vehicle.destLat || !vehicle.destLng) return 0;
  const total = haversine(vehicle.originLat, vehicle.originLng, vehicle.destLat, vehicle.destLng);
  if (total === 0) return 100;
  const remaining = haversine(vehicle.lat, vehicle.lng, vehicle.destLat, vehicle.destLng);
  return Math.min(100, Math.max(0, Math.round(((total - remaining) / total) * 100)));
}

function buildFromShipments(ships: Awaited<ReturnType<typeof shipmentsApi>>): LiveVehicle[] {
  const active = ships.filter((s) =>
    ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(s.status)
  );

  return active.map((s, idx) => {
    const veh = s.vehicle;
    const drv = s.driver;
    const oLat = Number(s.originLatitude);
    const oLng = Number(s.originLongitude);
    const dLat = Number(s.destinationLatitude);
    const dLng = Number(s.destinationLongitude);

    return {
      vehicleId: veh?.plateNumber ?? s.shipmentNumber ?? `SHP-${s.id}`,
      driver: drv?.name ?? "—",
      driverId: drv?.id,
      driverPhone: drv?.phone,
      driverLicense: drv?.licenseNumber,
      lat: oLat,
      lng: oLng,
      originLat: oLat,
      originLng: oLng,
      destLat: dLat,
      destLng: dLng,
      speed: 0,
      heading: 0,
      status: mapStatus(s.status),
      updatedAt: s.updatedAt ?? new Date().toISOString(),
      estimatedDelivery: s.estimatedDelivery,
      shipmentId: s.id,
      originAddress: s.originAddress,
      destinationAddress: s.destinationAddress,
      plateNumber: veh?.plateNumber,
      model: veh?.model,
      vehicleType: veh?.type,
      vehicleCapacity: veh?.capacity,
      // Mock fuel level — decreasing with shipment progress
      fuel: Math.max(10, 90 - idx * 15),
      engineTemp: 85 + Math.floor(Math.random() * 10),
      routePath: [[oLng, oLat], [dLng, dLat]],
    };
  });
}

export function useLiveTrackingFull() {
  const [vehicles, setVehicles] = useState<LiveVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState<WsStatus>("connecting");
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const prevZoneRef = useRef<Record<string, string>>({});

  // ── Geofence check ──────────────────────────────────────────────────────────
  const checkGeofences = useCallback((updatedVehicles: LiveVehicle[]) => {
    const newAlerts: GeofenceAlert[] = [];
    updatedVehicles.forEach((v) => {
      WAREHOUSE_ZONES.forEach((z) => {
        const dist = haversine(v.lat, v.lng, z.lat, z.lng);
        const inside = dist <= z.radius;
        const prevKey = `${v.vehicleId}-${z.id}`;
        const wasInside = prevZoneRef.current[prevKey] === "in";

        if (inside && !wasInside) {
          prevZoneRef.current[prevKey] = "in";
          newAlerts.push({ id: `${prevKey}-${Date.now()}`, vehicleId: v.vehicleId, zoneId: z.id, zoneName: z.name, type: "ENTERED", timestamp: new Date().toISOString() });
        } else if (!inside && wasInside) {
          prevZoneRef.current[prevKey] = "out";
          newAlerts.push({ id: `${prevKey}-${Date.now()}`, vehicleId: v.vehicleId, zoneId: z.id, zoneName: z.name, type: "EXITED", timestamp: new Date().toISOString() });
        }
      });
    });

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 50));
    }
  }, []);

  // ── REST fetch ──────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const ships = await shipmentsApi();
      const enriched = buildFromShipments(ships);
      setVehicles((prev) => {
        const merged = enriched.map((newV) => {
          const existing = prev.find((p) => p.vehicleId === newV.vehicleId);
          return existing ? { ...newV, lat: existing.lat, lng: existing.lng, speed: existing.speed, heading: existing.heading } : newV;
        });
        checkGeofences(merged);
        return merged;
      });
    } catch (err) {
      console.error("[LiveTracking] fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [checkGeofences]);

  useEffect(() => {
    fetchAll();
    const id = window.setInterval(fetchAll, POLL_MS);
    return () => window.clearInterval(id);
  }, [fetchAll]);

  // ── WebSocket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ["websocket"],
      auth: { token: localStorage.getItem("token") },
      reconnectionAttempts: 5,
      timeout: 5000,
    });
    socketRef.current = socket;

    socket.on("connect", () => setWsStatus("connected"));
    socket.on("disconnect", () => setWsStatus("disconnected"));
    socket.on("connect_error", () => setWsStatus("error"));

    socket.on("vehicle-location", (data: Partial<LiveVehicle>) => {
      setVehicles((prev) => {
        const idx = prev.findIndex((v) => v.vehicleId === data.vehicleId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...data, updatedAt: new Date().toISOString() };
        checkGeofences(updated);
        return updated;
      });
    });

    // After 2s without connect → mark as disconnected (backend might not have WS)
    const t = setTimeout(() => {
      if (!socket.connected) setWsStatus("disconnected");
    }, 2000);

    return () => {
      clearTimeout(t);
      socket.disconnect();
    };
  }, [checkGeofences]);

  // ── Load route ──────────────────────────────────────────────────────────────
  const loadRoute = useCallback(
    async (shipmentId: number): Promise<[number, number][]> => {
      try {
        const pts = await routeByShipmentApi(shipmentId);
        if (pts.length >= 2) return pts.map((p) => [p.longitude, p.latitude]);
      } catch { /* fallback */ }
      const veh = vehicles.find((v) => v.shipmentId === shipmentId);
      return veh?.routePath ?? [];
    },
    [vehicles]
  );

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    online:      vehicles.filter((v) => v.status !== "INACTIVE").length,
    offline:     vehicles.filter((v) => v.status === "INACTIVE").length,
    activeTrips: vehicles.filter((v) => ["IN_TRANSIT", "ON_DELIVERY", "PICKED_UP", "IN_TRANSIT"].includes(v.status)).length,
    avgSpeed:    vehicles.length > 0
      ? Math.round(vehicles.reduce((s, v) => s + (v.speed ?? 0), 0) / vehicles.length) : 0,
  };

  return { vehicles, loading, wsStatus, alerts, stats, loadRoute, timeSince, calcEta, calcProgress };
}

export { calcEta, calcProgress };
