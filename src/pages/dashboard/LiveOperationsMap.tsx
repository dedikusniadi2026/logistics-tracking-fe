import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { Map as MapLibre } from "react-map-gl/maplibre";
import { ScatterplotLayer, PathLayer, PolygonLayer, TextLayer, IconLayer } from "@deck.gl/layers";
import type { MapViewState } from "@deck.gl/core";
import { useLiveTrackingFull } from "../../hooks/useLiveTracking";
import type { LiveVehicle } from "../../types/livetracking";
import {
  Moon, Sun, Layers, Maximize2, Crosshair, Warehouse, MapPin,
  Wifi, WifiOff, AlertTriangle,
} from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLES = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark:  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

const WAREHOUSES = [
  { id: "jkt", name: "WH Jakarta",  lat: -6.175,  lng: 106.827 },
  { id: "bdg", name: "WH Bandung",  lat: -6.917,  lng: 107.619 },
  { id: "sby", name: "WH Surabaya", lat: -7.257,  lng: 112.752 },
];

const GEOFENCES = WAREHOUSES.map((w) => ({
  id: w.id, name: w.name,
  polygon: [
    [w.lng - 0.012, w.lat - 0.010],
    [w.lng + 0.012, w.lat - 0.010],
    [w.lng + 0.012, w.lat + 0.010],
    [w.lng - 0.012, w.lat + 0.010],
    [w.lng - 0.012, w.lat - 0.010],
  ] as [number,number][],
  color: [59, 130, 246, 25] as [number,number,number,number],
}));

const INITIAL_VIEW: MapViewState = { longitude: 106.827, latitude: -6.175, zoom: 6, pitch: 0, bearing: 0, minZoom: 2, maxZoom: 20 };

interface Props { dark?: boolean }

export default function LiveOperationsMap({ dark = false }: Props) {
  const { vehicles, wsStatus } = useLiveTrackingFull();
  const [viewState, setViewState]         = useState<MapViewState>(INITIAL_VIEW);
  const [mapDark, setMapDark]             = useState(dark);
  const [showGeofence, setShowGeofence]   = useState(true);
  const [showWarehouses, setShowWarehouses] = useState(true);
  const [showTraffic, setShowTraffic]     = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<LiveVehicle | null>(null);
  const prevDark = useRef(dark);

  // sync outer dark → map dark
  useEffect(() => {
    if (prevDark.current !== dark) { setMapDark(dark); prevDark.current = dark; }
  }, [dark]);

  const mapStyle = mapDark ? MAP_STYLES.dark : MAP_STYLES.light;

  const layers = useMemo(() => {
    const list = [];

    if (showGeofence) {
      list.push(new PolygonLayer({
        id: "gf", data: GEOFENCES,
        getPolygon: (d) => d.polygon,
        getFillColor: (d) => d.color,
        getLineColor: [59, 130, 246, 150],
        getLineWidth: 2, lineWidthMinPixels: 1, pickable: false, stroked: true, filled: true,
      }));
    }

    if (showWarehouses) {
      list.push(new ScatterplotLayer({
        id: "wh-dots", data: WAREHOUSES,
        getPosition: (d) => [d.lng, d.lat],
        getFillColor: [234, 179, 8, 255],
        getLineColor: [255,255,255,255],
        getRadius: 8000, radiusMinPixels: 10, lineWidthMinPixels: 2, stroked: true, pickable: false,
      }));
      list.push(new TextLayer({
        id: "wh-labels", data: WAREHOUSES,
        getPosition: (d) => [d.lng, d.lat],
        getText: (d) => `🏭 ${d.name}`,
        getSize: 11, getPixelOffset: [0, -22],
        getColor: mapDark ? [255,255,255,255] : [30,41,59,255],
        background: true,
        getBackgroundColor: mapDark ? [30,41,59,220] : [255,255,255,220],
        getBorderColor: [209,213,219,200], getBorderWidth: 1,
        backgroundPadding: [4,2], fontWeight: "bold", pickable: false,
      }));
    }

    // Vehicle route paths (thin)
    const withRoute = vehicles.filter((v) => v.routePath && v.routePath.length >= 2);
    if (withRoute.length > 0) {
      list.push(new PathLayer({
        id: "routes", data: withRoute,
        getPath: (d: LiveVehicle) => d.routePath!,
        getColor: (_d: LiveVehicle) => [59, 130, 246, 60] as [number,number,number,number],
        getWidth: 2, widthMinPixels: 1.5, pickable: false,
      }));
    }

    // Selected vehicle route (thick)
    if (selectedVehicle?.routePath && selectedVehicle.routePath.length >= 2) {
      list.push(new PathLayer({
        id: "sel-route", data: [selectedVehicle],
        getPath: (d: LiveVehicle) => d.routePath!,
        getColor: (_d: LiveVehicle) => [37, 99, 235, 230] as [number,number,number,number],
        getWidth: 5, widthMinPixels: 3, pickable: false,
      }));
    }

    // Halo
    list.push(new ScatterplotLayer({
      id: "halos", data: vehicles,
      getPosition: (d: LiveVehicle) => [d.lng, d.lat],
      getFillColor: (d: LiveVehicle) =>
        d.status === "INACTIVE" ? [156,163,175,50] : [59,130,246,55],
      getRadius: 18, radiusMinPixels: 12, pickable: false,
    }));

    // Selected halo
    if (selectedVehicle) {
      list.push(new ScatterplotLayer({
        id: "sel-halo", data: [selectedVehicle],
        getPosition: (d: LiveVehicle) => [d.lng, d.lat],
        getFillColor: [255,255,255,0],
        getLineColor: [37,99,235,255],
        getRadius: 28, radiusMinPixels: 20, lineWidthMinPixels: 3, stroked: true, filled: false, pickable: false,
      }));
    }

    // Truck icons
    list.push(new IconLayer<LiveVehicle>({
      id: "trucks", data: vehicles, pickable: true,
      getIcon: () => ({ url: "/truck.png", width: 128, height: 128, anchorY: 128 }),
      getPosition: (d) => [d.lng, d.lat],
      getSize: 36, getAngle: (d) => -(d.heading ?? 0),
      onClick: (info) => {
        const v = info.object as LiveVehicle | undefined;
        if (v) { setSelectedVehicle(v); setViewState((s) => ({ ...s, longitude: v.lng, latitude: v.lat, zoom: 13 })); }
      },
    }));

    // Speed labels
    list.push(new TextLayer<LiveVehicle>({
      id: "speed-lbl", data: vehicles.filter((v) => v.speed > 0),
      getPosition: (d) => [d.lng, d.lat],
      getText: (d) => `${d.speed} km/h`,
      getSize: 10, getColor: mapDark ? [255,255,255,255] : [15,23,42,255],
      getPixelOffset: [0, -62],
      background: true,
      getBackgroundColor: mapDark ? [15,23,42,220] : [255,255,255,220],
      getBorderColor: [209,213,219,200], getBorderWidth: 1, backgroundPadding: [3,1], fontWeight: "bold", pickable: false,
    }));

    // Vehicle ID labels
    list.push(new TextLayer<LiveVehicle>({
      id: "id-lbl", data: vehicles,
      getPosition: (d) => [d.lng, d.lat],
      getText: (d) => d.vehicleId,
      getSize: 11, getColor: mapDark ? [226,232,240,255] : [30,41,59,255],
      getPixelOffset: [0, -48], fontWeight: "bold",
      background: true,
      getBackgroundColor: mapDark ? [30,41,59,220] : [255,255,255,220],
      getBorderColor: [209,213,219,200], getBorderWidth: 1, backgroundPadding: [4,2], pickable: false,
    }));

    return list;
  }, [vehicles, mapDark, showGeofence, showWarehouses, selectedVehicle]);

  const fitAll = useCallback(() => {
    if (vehicles.length === 0) return;
    const lngs = vehicles.map((v) => v.lng);
    const lats = vehicles.map((v) => v.lat);
    setViewState((s) => ({
      ...s,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitude:  (Math.min(...lats) + Math.max(...lats)) / 2,
      zoom: 7,
    }));
  }, [vehicles]);

  const ctrlBtn = (active: boolean, onClick: () => void, icon: React.ReactNode, title: string) =>
    <button onClick={onClick} title={title}
      className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : mapDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-600 hover:bg-gray-50"
      }`}>
      {icon}
    </button>;

  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm border flex flex-col ${mapDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}
      style={{ height: "100%" }}>

      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2.5 shrink-0 border-b ${mapDark ? "border-gray-800" : "border-gray-100"}`}>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-blue-500" />
          <span className={`text-sm font-semibold ${mapDark ? "text-white" : "text-gray-900"}`}>Live Operations Map</span>
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            wsStatus === "connected" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}>
            {wsStatus === "connected" ? <Wifi size={10}/> : <WifiOff size={10}/>}
            {vehicles.length} vehicles
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {ctrlBtn(mapDark, () => setMapDark((d) => !d), mapDark ? <Sun size={13}/> : <Moon size={13}/>, "Dark mode")}
          {ctrlBtn(showTraffic,    () => setShowTraffic((t) => !t),       <Layers size={13}/>,    "Traffic")}
          {ctrlBtn(showGeofence,   () => setShowGeofence((g) => !g),      <span className="text-[10px] font-bold">GF</span>, "Geofences")}
          {ctrlBtn(showWarehouses, () => setShowWarehouses((w) => !w),    <Warehouse size={13}/>, "Warehouses")}
          {ctrlBtn(false, fitAll, <Maximize2 size={13}/>, "Fit all")}
          {selectedVehicle && ctrlBtn(true,
            () => setViewState((s) => ({ ...s, longitude: selectedVehicle.lng, latitude: selectedVehicle.lat, zoom: 14 })),
            <Crosshair size={13}/>, `Fly to ${selectedVehicle.vehicleId}`
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <DeckGL
          viewState={viewState}
          onViewStateChange={(p: any) => {
            const vs = p?.viewState as MapViewState | undefined;
            if (vs && typeof vs.longitude === "number") setViewState(vs);
          }}
          controller={true}
          layers={layers as any}
          style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%" }}
          onClick={(info) => { if (!info.picked) setSelectedVehicle(null); }}
        >
          <MapLibre mapStyle={mapStyle} style={{ width: "100%", height: "100%" }} />
        </DeckGL>

        {/* Legend */}
        <div className={`absolute top-3 left-3 z-10 rounded-xl px-3 py-2 shadow-md text-[10px] space-y-1 pointer-events-none ${mapDark ? "bg-gray-900/90 text-gray-300" : "bg-white/90 text-gray-600"}`}>
          {[
            { color: "bg-blue-500", label: "On Delivery" },
            { color: "bg-green-500", label: "Delivered" },
            { color: "bg-red-500", label: "Delayed" },
            { color: "bg-yellow-400", label: "Warehouse" },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-1.5 rounded-full ${r.color}`} />
              {r.label}
            </div>
          ))}
        </div>

        {/* Selected vehicle speed HUD */}
        {selectedVehicle && (
          <div className={`absolute bottom-3 right-3 z-10 rounded-2xl shadow-lg px-4 py-3 ${mapDark ? "bg-gray-900/95 border border-gray-700 text-white" : "bg-white/95 border border-gray-100 text-gray-800"}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${mapDark ? "text-gray-400" : "text-gray-400"}`}>
              {selectedVehicle.vehicleId}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums">{selectedVehicle.speed ?? 0}</span>
              <span className={`text-sm ${mapDark ? "text-gray-400" : "text-gray-400"}`}>km/h</span>
            </div>
            {selectedVehicle.fuel != null && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${mapDark ? "bg-gray-700" : "bg-gray-100"}`}>
                  <div className={`h-full rounded-full ${selectedVehicle.fuel < 20 ? "bg-red-500" : selectedVehicle.fuel < 40 ? "bg-yellow-400" : "bg-green-500"}`}
                    style={{ width: `${selectedVehicle.fuel}%` }} />
                </div>
                <span className="text-[10px] font-semibold">{selectedVehicle.fuel}%</span>
              </div>
            )}
          </div>
        )}

        {showTraffic && (
          <div className="absolute top-3 right-3 z-10 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow pointer-events-none">
            🚦 Traffic Mode
          </div>
        )}

        {vehicles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`flex flex-col items-center gap-2 ${mapDark ? "text-gray-600" : "text-gray-400"}`}>
              <AlertTriangle size={24} className="opacity-40" />
              <p className="text-xs">No active vehicles</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
