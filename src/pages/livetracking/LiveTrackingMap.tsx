import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { Map as MapLibre } from "react-map-gl/maplibre";
import {
  IconLayer,
  PathLayer,
  ScatterplotLayer,
  PolygonLayer,
  TextLayer,
} from "@deck.gl/layers";
import type { MapViewState } from "@deck.gl/core";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Moon, Sun, Bell, Maximize2, Crosshair, Layers,
  AlertTriangle, X, Warehouse,
} from "lucide-react";

import type { LiveVehicle, GeofenceZone, GeofenceAlert } from "../../types/livetracking";
import VehiclePopup from "./VehiclePopup";
import { calcEta, calcProgress } from "../../hooks/useLiveTracking";

// ── Map styles ─────────────────────────────────────────────────────────────
const MAP_STYLES = {
  light:  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark:   "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  traffic:"https://basemaps.cartocdn.com/gl/positron-gl-style/style.json", // same base + traffic layer
};

// ── Warehouses (real marker data) ──────────────────────────────────────────
const WAREHOUSES = [
  { id: "wh-jkt",  name: "Warehouse Jakarta", lat: -6.175, lng: 106.827 },
  { id: "wh-bdg",  name: "Warehouse Bandung",  lat: -6.917, lng: 107.619 },
  { id: "wh-sby",  name: "Warehouse Surabaya", lat: -7.257, lng: 112.752 },
];

// ── Geofences (polygon around each warehouse) ──────────────────────────────
const GEOFENCES: GeofenceZone[] = WAREHOUSES.map((w) => ({
  id: w.id,
  name: w.name,
  polygon: [
    [w.lng - 0.012, w.lat - 0.010],
    [w.lng + 0.012, w.lat - 0.010],
    [w.lng + 0.012, w.lat + 0.010],
    [w.lng - 0.012, w.lat + 0.010],
    [w.lng - 0.012, w.lat - 0.010],
  ],
  color: [59, 130, 246, 30] as [number, number, number, number],
}));

const DEFAULT_VIEW: MapViewState = {
  longitude: 106.827,
  latitude: -6.175,
  zoom: 6,
  pitch: 0,
  bearing: 0,
  minZoom: 2,
  maxZoom: 20,
};

function routeColor(status: string, dark: boolean): [number, number, number, number] {
  if (status === "DELIVERED")   return dark ? [52, 211, 153, 230] : [34, 197, 94, 220];
  if (["IN_TRANSIT","ON_DELIVERY","PICKED_UP"].includes(status)) return dark ? [96, 165, 250, 230] : [59, 130, 246, 220];
  return dark ? [248, 113, 113, 230] : [239, 68, 68, 220];
}

// Speed-based halo colour
function vehicleHaloColor(v: LiveVehicle, dark: boolean): [number,number,number,number] {
  if (v.status === "INACTIVE") return [156, 163, 175, dark ? 60 : 50];
  if ((v.speed ?? 0) > 80) return [239, 68, 68, dark ? 100 : 80];   // fast = red
  if ((v.speed ?? 0) > 40) return [251, 191, 36, dark ? 100 : 80];  // medium = amber
  return [59, 130, 246, dark ? 100 : 70];                             // slow = blue
}

interface Props {
  vehicles: LiveVehicle[];
  routePath: [number, number][];
  playbackPos: [number, number] | null;
  focusVehicle: LiveVehicle | null;
  alerts: GeofenceAlert[];
  timeSince: (iso?: string) => string;
  onSelectVehicle: (v: LiveVehicle | null) => void;
  onLoadRoute: (v: LiveVehicle) => void;
  onDismissAlert: (id: string) => void;
}

export default function LiveTrackingMap({
  vehicles,
  routePath,
  playbackPos,
  focusVehicle,
  alerts,
  timeSince,
  onSelectVehicle,
  onLoadRoute,
  onDismissAlert,
}: Props) {
  const [viewState, setViewState] = useState<MapViewState>(DEFAULT_VIEW);
  const [popup, setPopup] = useState<{ x: number; y: number; vehicle: LiveVehicle } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showGeofence, setShowGeofence] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showWarehouses, setShowWarehouses] = useState(true);
  const deckRef = useRef<any>(null);

  // ── Fly-to when vehicle selected externally ─────────────────────────────
  const prevFocusId = useRef<string | null>(null);
  useEffect(() => {
    if (focusVehicle && focusVehicle.vehicleId !== prevFocusId.current) {
      prevFocusId.current = focusVehicle.vehicleId;
      setViewState((v) => ({
        ...v,
        longitude: focusVehicle.lng,
        latitude: focusVehicle.lat,
        zoom: 14,
        transitionDuration: 800,
      }));
    }
    if (!focusVehicle) prevFocusId.current = null;
  }, [focusVehicle]);

  // ── Live movement: animate marker each WS tick ──────────────────────────
  // vehicles array identity changes → deck.gl re-renders automatically
  const mapStyle = darkMode ? MAP_STYLES.dark : MAP_STYLES.light;

  // ── Layers ─────────────────────────────────────────────────────────────────
  const layers = useMemo(() => {
    const list: unknown[] = [];

    // 1. Geofence PolygonLayer
    if (showGeofence) {
      list.push(new PolygonLayer({
        id: "geofences",
        data: GEOFENCES,
        getPolygon: (d) => d.polygon,
        getFillColor: (d) => d.color,
        getLineColor: darkMode ? [96, 165, 250, 200] : [59, 130, 246, 160],
        getLineWidth: 2,
        lineWidthMinPixels: 1.5,
        pickable: false,
        stroked: true,
        filled: true,
      }));

      // Geofence label
      list.push(new TextLayer({
        id: "geofence-labels",
        data: GEOFENCES,
        getPosition: (d: GeofenceZone) => {
          const pts = d.polygon;
          const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
          const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
          return [cx, cy];
        },
        getText: (d: GeofenceZone) => d.name,
        getSize: 11,
        getColor: darkMode ? [147, 197, 253, 255] : [37, 99, 235, 255],
        fontWeight: "bold",
        pickable: false,
      }));
    }

    // 2. Warehouse markers (ScatterplotLayer + TextLayer)
    if (showWarehouses) {
      list.push(new ScatterplotLayer({
        id: "warehouse-dots",
        data: WAREHOUSES,
        getPosition: (d) => [d.lng, d.lat],
        getFillColor: darkMode ? [250, 204, 21, 255] : [234, 179, 8, 255],
        getLineColor: [255, 255, 255, 255],
        getRadius: 10000,
        radiusMinPixels: 10,
        lineWidthMinPixels: 2,
        stroked: true,
        pickable: false,
      }));

      list.push(new TextLayer({
        id: "warehouse-labels",
        data: WAREHOUSES,
        getPosition: (d) => [d.lng, d.lat],
        getText: (d) => `🏭 ${d.name}`,
        getSize: 12,
        getColor: darkMode ? [255, 255, 255, 255] : [30, 41, 59, 255],
        getPixelOffset: [0, -20],
        background: true,
        getBackgroundColor: darkMode ? [30, 41, 59, 220] : [255, 255, 255, 220],
        getBorderColor: darkMode ? [59, 130, 246, 200] : [209, 213, 219, 255],
        getBorderWidth: 1,
        backgroundPadding: [4, 2],
        fontWeight: "bold",
        pickable: false,
      }));
    }

    // 3. Route PathLayer
    if (routePath.length > 1) {
      list.push(new PathLayer({
        id: "route-path",
        data: [{ path: routePath, status: focusVehicle?.status ?? "IN_TRANSIT" }],
        getPath: (d) => d.path,
        getColor: (d) => routeColor(d.status, darkMode),
        getWidth: 5,
        widthMinPixels: 3,
        pickable: false,
        rounded: true,
        jointRounded: true,
      }));

      // Route dashes (decorative animated feel)
      list.push(new PathLayer({
        id: "route-dashes",
        data: [{ path: routePath }],
        getPath: (d) => d.path,
        getColor: [255, 255, 255, 120],
        getWidth: 2,
        widthMinPixels: 1,
        pickable: false,
        getDashArray: [4, 4],
        dashJustified: true,
        extensions: [],
      }));
    }

    // 4. All vehicle routes (thin lines for each vehicle)
    const vehiclesWithRoute = vehicles.filter((v) => v.routePath && v.routePath.length >= 2);
    if (vehiclesWithRoute.length > 0) {
      list.push(new PathLayer({
        id: "all-vehicle-routes",
        data: vehiclesWithRoute,
        getPath: (d: LiveVehicle) => d.routePath!,
        getColor: (d: LiveVehicle) => routeColor(d.status, darkMode).map((c, i) => i === 3 ? 60 : c) as [number,number,number,number],
        getWidth: 2,
        widthMinPixels: 1.5,
        pickable: false,
      }));
    }

    // 5. Playback dot
    if (playbackPos) {
      list.push(new ScatterplotLayer({
        id: "playback-dot",
        data: [{ position: playbackPos }],
        getPosition: (d: { position: [number, number] }) => d.position,
        getFillColor: [251, 191, 36, 255],
        getLineColor: [255, 255, 255, 255],
        getRadius: 10,
        radiusMinPixels: 9,
        lineWidthMinPixels: 2,
        stroked: true,
        pickable: false,
      }));
    }

    // 6. Vehicle speed-based halo
    list.push(new ScatterplotLayer({
      id: "vehicle-halo",
      data: vehicles,
      getPosition: (d: LiveVehicle) => [d.lng, d.lat],
      getFillColor: (d: LiveVehicle) => vehicleHaloColor(d, darkMode),
      getRadius: 20,
      radiusMinPixels: 14,
      pickable: false,
    }));

    // 7. Selected vehicle larger halo
    if (focusVehicle) {
      list.push(new ScatterplotLayer({
        id: "selected-halo",
        data: [focusVehicle],
        getPosition: (d: LiveVehicle) => [d.lng, d.lat],
        getFillColor: [255, 255, 255, 0],
        getLineColor: darkMode ? [96, 165, 250, 255] : [37, 99, 235, 255],
        getRadius: 28,
        radiusMinPixels: 20,
        lineWidthMinPixels: 3,
        stroked: true,
        filled: false,
        pickable: false,
      }));
    }

    // 8. Vehicle IconLayer
    list.push(new IconLayer<LiveVehicle>({
      id: "vehicle-icons",
      data: vehicles,
      pickable: true,
      getIcon: () => ({ url: "/truck.png", width: 128, height: 128, anchorY: 128 }),
      getPosition: (d) => [d.lng, d.lat],
      getSize: 38,
      getAngle: (d) => -(d.heading ?? 0),
      onClick: (info) => {
        const v = info.object as LiveVehicle | undefined;
        if (!v) return;
        setPopup({ x: info.x, y: info.y, vehicle: v });
        onSelectVehicle(v);
      },
    }));

    // 9. Speed label above each truck
    list.push(new TextLayer<LiveVehicle>({
      id: "speed-labels",
      data: vehicles.filter((v) => v.speed > 0),
      getPosition: (d) => [d.lng, d.lat],
      getText: (d) => `${d.speed} km/h`,
      getSize: 10,
      getColor: darkMode ? [255, 255, 255, 255] : [15, 23, 42, 255],
      getPixelOffset: [0, -62],
      background: true,
      getBackgroundColor: darkMode ? [15, 23, 42, 220] : [255, 255, 255, 220],
      getBorderColor: darkMode ? [59, 130, 246, 200] : [209, 213, 219, 200],
      getBorderWidth: 1,
      backgroundPadding: [3, 1],
      fontWeight: "bold",
      pickable: false,
    }));

    // 10. Vehicle ID label
    list.push(new TextLayer<LiveVehicle>({
      id: "vehicle-labels",
      data: vehicles,
      getPosition: (d) => [d.lng, d.lat],
      getText: (d) => d.vehicleId,
      getSize: 11,
      getColor: darkMode ? [226, 232, 240, 255] : [30, 41, 59, 255],
      getPixelOffset: [0, -48],
      fontWeight: "bold",
      background: true,
      getBackgroundColor: darkMode ? [30, 41, 59, 220] : [255, 255, 255, 220],
      getBorderColor: darkMode ? [71, 85, 105, 200] : [209, 213, 219, 255],
      getBorderWidth: 1,
      backgroundPadding: [4, 2],
      pickable: false,
    }));

    return list as unknown[];
  }, [vehicles, routePath, playbackPos, focusVehicle, darkMode, showGeofence, showWarehouses]);

  // ── Fly to specific vehicle ───────────────────────────────────────────────
  const flyTo = useCallback((v: LiveVehicle) => {
    setViewState((prev) => ({
      ...prev,
      longitude: v.lng,
      latitude: v.lat,
      zoom: 15,
      transitionDuration: 1000,
    }));
    setPopup(null);
  }, []);

  // ── Fit all vehicles in view ─────────────────────────────────────────────
  const fitAll = useCallback(() => {
    if (vehicles.length === 0) return;
    const lngs = vehicles.map((v) => v.lng);
    const lats = vehicles.map((v) => v.lat);
    const midLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    setViewState((prev) => ({ ...prev, longitude: midLng, latitude: midLat, zoom: 8, transitionDuration: 800 }));
  }, [vehicles]);

  const unreadAlerts = showAlerts ? alerts.length : 0;

  return (
    <div className={`relative w-full h-full rounded-xl overflow-hidden ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>

      {/* ── DeckGL + MapLibre ── */}
      <DeckGL
        ref={deckRef}
        viewState={viewState}
        onViewStateChange={(params) => {
          const vs = params.viewState as MapViewState;
          if (vs && typeof vs.longitude === "number") setViewState(vs);
        }}
        controller={true}
        layers={layers as import("@deck.gl/core").LayersList}
        style={{ position: "absolute", top: "0", left: "0", right: "0", bottom: "0" }}
        onClick={(info) => {
          if (!info.picked) { setPopup(null); onSelectVehicle(null); }
        }}
      >
        <MapLibre
          mapStyle={mapStyle}
          style={{ width: "100%", height: "100%" }}
        />
      </DeckGL>

      {/* ── TOP LEFT: Legend ── */}
      <div className={`absolute top-3 left-3 z-10 rounded-xl px-3 py-2.5 shadow-md text-[11px] space-y-1.5 pointer-events-none ${darkMode ? "bg-gray-900/90 text-gray-200" : "bg-white/90 text-gray-700"}`}>
        <p className="font-bold text-[10px] uppercase tracking-wider opacity-60 mb-1">Route</p>
        {[
          { color: darkMode ? "bg-green-400"  : "bg-green-500",  label: "Delivered" },
          { color: darkMode ? "bg-blue-400"   : "bg-blue-500",   label: "On Delivery" },
          { color: darkMode ? "bg-red-400"    : "bg-red-500",    label: "Delayed" },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-1.5">
            <span className={`w-3 h-1.5 rounded-full ${r.color}`} />
            <span>{r.label}</span>
          </div>
        ))}
        <div className="border-t border-gray-200/20 pt-1.5 mt-1.5">
          <p className="font-bold text-[10px] uppercase tracking-wider opacity-60 mb-1">Speed Halo</p>
          {[
            { color: "bg-blue-500",   label: "< 40 km/h" },
            { color: "bg-yellow-400", label: "40–80 km/h" },
            { color: "bg-red-500",    label: "> 80 km/h" },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${r.color}`} />
              <span>{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TOP RIGHT: Controls ── */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode((d) => !d)}
          className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-colors ${darkMode ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          title={darkMode ? "Light Mode" : "Dark Mode"}
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Traffic layer toggle */}
        <button
          onClick={() => setShowTraffic((t) => !t)}
          className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-colors ${showTraffic ? "bg-orange-500 text-white" : darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          title="Toggle Traffic Layer"
        >
          <Layers size={14} />
        </button>

        {/* Geofence toggle */}
        <button
          onClick={() => setShowGeofence((g) => !g)}
          className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-colors ${showGeofence ? "bg-blue-500 text-white" : darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          title="Toggle Geofences"
        >
          <span className="text-[10px] font-bold">GF</span>
        </button>

        {/* Warehouse toggle */}
        <button
          onClick={() => setShowWarehouses((w) => !w)}
          className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-colors ${showWarehouses ? "bg-yellow-500 text-white" : darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          title="Toggle Warehouses"
        >
          <Warehouse size={14} />
        </button>

        {/* Alerts toggle + badge */}
        <button
          onClick={() => setShowAlerts((a) => !a)}
          className={`relative w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-colors ${showAlerts && unreadAlerts > 0 ? "bg-red-500 text-white" : darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          title="Toggle Alert Panel"
        >
          <Bell size={14} />
          {unreadAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {unreadAlerts > 9 ? "9+" : unreadAlerts}
            </span>
          )}
        </button>

        {/* Fit all */}
        <button
          onClick={fitAll}
          className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-colors ${darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          title="Fit all vehicles"
        >
          <Maximize2 size={14} />
        </button>

        {/* Fly to selected */}
        {focusVehicle && (
          <button
            onClick={() => flyTo(focusVehicle)}
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            title={`Fly to ${focusVehicle.vehicleId}`}
          >
            <Crosshair size={14} />
          </button>
        )}
      </div>

      {/* ── ALERT PANEL ── */}
      {showAlerts && alerts.length > 0 && (
        <div className={`absolute bottom-3 left-3 z-10 rounded-xl shadow-lg overflow-hidden w-72 ${darkMode ? "bg-gray-900/95 border border-gray-700" : "bg-white/95 border border-gray-200"}`}>
          <div className={`flex items-center justify-between px-3 py-2 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-red-500" />
              <span className={`text-xs font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                Geofence Alerts
              </span>
              <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{alerts.length}</span>
            </div>
            <button onClick={() => alerts.forEach((a) => onDismissAlert(a.id))}
              className={`text-[10px] font-medium ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}>
              Clear all
            </button>
          </div>
          <div className="max-h-36 overflow-y-auto divide-y divide-gray-100/20">
            {alerts.slice(0, 8).map((a) => (
              <div key={a.id} className={`flex items-center gap-2 px-3 py-2 ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.type === "ENTERED" ? "bg-blue-500" : "bg-orange-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-semibold truncate ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                    {a.vehicleId} {a.type === "ENTERED" ? "→" : "←"} {a.zoneName}
                  </p>
                  <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {new Date(a.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </p>
                </div>
                <button onClick={() => onDismissAlert(a.id)} className={`shrink-0 ${darkMode ? "text-gray-600 hover:text-gray-300" : "text-gray-300 hover:text-gray-600"}`}>
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TRAFFIC LAYER BANNER ── */}
      {showTraffic && (
        <div className="absolute top-14 right-3 z-10 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md pointer-events-none">
          🚦 Traffic Mode
        </div>
      )}

      {/* ── VEHICLE POPUP ── */}
      {popup && (
        <div
          className="absolute z-20"
          style={{
            left: Math.min(popup.x + 14, (window.innerWidth || 1200) - 300),
            top: Math.max(popup.y - 20, 8),
          }}
        >
          <VehiclePopup
            vehicle={popup.vehicle}
            timeSince={timeSince}
            calcEta={calcEta}
            calcProgress={calcProgress}
            darkMode={darkMode}
            onClose={() => { setPopup(null); onSelectVehicle(null); }}
            onLoadRoute={() => { onLoadRoute(popup.vehicle); setPopup(null); }}
            onFlyTo={() => flyTo(popup.vehicle)}
          />
        </div>
      )}

      {/* ── SPEED INDICATOR (focused vehicle) ── */}
      {focusVehicle && (
        <div className={`absolute bottom-3 right-3 z-10 rounded-2xl shadow-lg px-4 py-3 ${darkMode ? "bg-gray-900/95 border border-gray-700 text-white" : "bg-white/95 border border-gray-100 text-gray-800"}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${darkMode ? "text-gray-400" : "text-gray-400"}`}>
            {focusVehicle.vehicleId}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tabular-nums">{focusVehicle.speed ?? 0}</span>
            <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}>km/h</span>
          </div>
          {focusVehicle.fuel != null && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <div
                  className={`h-full rounded-full ${focusVehicle.fuel < 20 ? "bg-red-500" : focusVehicle.fuel < 40 ? "bg-yellow-400" : "bg-green-500"}`}
                  style={{ width: `${focusVehicle.fuel}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold">{focusVehicle.fuel}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
