import { Plus, Minus, ArrowUpRight } from "lucide-react";
import { useRef, useState, useMemo, useCallback } from "react";
import Map from "react-map-gl/maplibre";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import type { MapViewState } from "@deck.gl/core";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLiveTracking } from "../../hooks/useDashboard";

const INITIAL_VIEW: MapViewState = {
  longitude: 106.827,
  latitude: -6.175,
  zoom: 10,
  pitch: 0,
  bearing: 0,
  minZoom: 1,
  maxZoom: 20,
};

export default function MapWidget() {
  const { data: rawData } = useLiveTracking();

  const trackingPoints = useMemo(() => {
    if (!rawData) return [];
    const arr = Array.isArray(rawData)
      ? rawData
      : ((rawData as { data?: unknown[] })?.data ?? []);
    return (
      arr as { latitude: number; longitude: number; shipmentId?: number }[]
    ).filter(
      (p) => typeof p.latitude === "number" && typeof p.longitude === "number"
    );
  }, [rawData]);

  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW);
  const centredRef = useRef(false);

  if (trackingPoints.length > 0 && !centredRef.current) {
    centredRef.current = true;
    const lng =
      trackingPoints.reduce((s, p) => s + p.longitude, 0) /
      trackingPoints.length;
    const lat =
      trackingPoints.reduce((s, p) => s + p.latitude, 0) /
      trackingPoints.length;
    setTimeout(
      () => setViewState((v) => ({ ...v, longitude: lng, latitude: lat })),
      0
    );
  }

  const layers = useMemo(
    () => [
      new ScatterplotLayer({
        id: "dashboard-markers",
        data: trackingPoints,
        getPosition: (d: { longitude: number; latitude: number }) => [
          d.longitude,
          d.latitude,
        ],
        getFillColor: [59, 130, 246, 255],
        getLineColor: [255, 255, 255, 255],
        getRadius: 6000,
        lineWidthMinPixels: 2,
        stroked: true,
        pickable: false,
      }),
    ],
    [trackingPoints]
  );

  const handleViewStateChange = useCallback((params: any) => {
    const vs = params?.viewState as MapViewState | undefined;
    if (vs && typeof vs.longitude === "number") setViewState(vs);
  }, []);

  const zoom = (delta: number) =>
    setViewState((v) => ({
      ...v,
      zoom: Math.min(20, Math.max(1, (v.zoom ?? 10) + delta)),
    }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
        <h3 className="text-base font-semibold text-gray-900">Live Map</h3>
        <button className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ArrowUpRight size={12} className="text-gray-400" />
        </button>
      </div>

      {/* ── Map area — fixed height so DeckGL can measure it ── */}
      {/* We use a fixed pixel height instead of flex-1 to guarantee DeckGL works */}
      <div className="relative shrink-0" style={{ height: 290 }}>
        <DeckGL
          viewState={viewState}
          onViewStateChange={handleViewStateChange}
          controller={true}
          layers={layers}
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
          }}
        >
          <Map
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            style={{ width: "100%", height: "100%" }}
          />
        </DeckGL>

        {/* Status badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="bg-white/90 text-xs font-semibold text-gray-700 px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full inline-block ${
                trackingPoints.length > 0 ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            {trackingPoints.length > 0
              ? `${trackingPoints.length} vehicle${
                  trackingPoints.length !== 1 ? "s" : ""
                } live`
              : "Jakarta, ID"}
          </span>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col">
          <button
            onClick={() => zoom(1)}
            className="w-7 h-7 bg-white rounded-t-lg shadow flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <Plus size={13} className="text-gray-600" />
          </button>
          <button
            onClick={() => zoom(-1)}
            className="w-7 h-7 bg-white rounded-b-lg shadow flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-100 border-t-0"
          >
            <Minus size={13} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
