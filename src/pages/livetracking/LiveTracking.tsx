import { useCallback, useMemo, useState } from "react";
import MainLayout from "../../components/layouts/MainLayout";
import { useLiveTrackingFull } from "../../hooks/useLiveTracking";
import type { LiveVehicle, GeofenceAlert } from "../../types/livetracking";
import type { FilterState } from "./LiveFilterBar";

import LiveFilterBar from "./LiveFilterBar";
import LiveSummaryCards from "./LiveSummaryCards";
import LiveTrackingMap from "./LiveTrackingMap";
import VehicleListPanel from "./VehicleListPanel";
import VehicleTableList from "./VehicleTableList";
import TripPlayback from "./TripPlayback";
import WsStatusBadge from "./WsStatusBadge";
import GeofenceAlerts from "./GeofenceAlerts";

export default function LiveTracking() {
  const { vehicles, loading, wsStatus, alerts: rawAlerts, stats, loadRoute, timeSince } = useLiveTrackingFull();

  const [filters, setFilters] = useState<FilterState>({ vehicle: "", driver: "", status: "", date: "" });
  const [selectedVehicle, setSelectedVehicle] = useState<LiveVehicle | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [playbackIdx, setPlaybackIdx] = useState(0);
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);

  // Sync alerts from hook
  useMemo(() => setAlerts(rawAlerts), [rawAlerts]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (filters.vehicle && v.vehicleId !== filters.vehicle) return false;
      if (filters.driver && v.driver !== filters.driver) return false;
      if (filters.status && v.status !== filters.status) return false;
      return true;
    });
  }, [vehicles, filters]);

  const playbackPos: [number, number] | null =
    routePath.length > 0 && playbackIdx < routePath.length
      ? routePath[playbackIdx]
      : null;

  const handleSelectVehicle = useCallback((v: LiveVehicle | null) => {
    setSelectedVehicle(v);
    if (!v) { setRoutePath([]); setPlaybackIdx(0); }
  }, []);

  const handleLoadRoute = useCallback(async (v: LiveVehicle) => {
    if (!v.shipmentId) return;
    setSelectedVehicle(v);
    const path = await loadRoute(v.shipmentId);
    setRoutePath(path);
    setPlaybackIdx(0);
  }, [loadRoute]);

  const dismissAlert = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  return (
    <MainLayout>
      <div className="space-y-3">

        {/* ── Top bar: title + WS status ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Live Tracking</h1>
            <p className="text-xs text-gray-400 mt-0.5">Real-time fleet monitoring</p>
          </div>
          <WsStatusBadge status={wsStatus} />
        </div>

        {/* ── Geofence Alerts ── */}
        {alerts.length > 0 && (
          <GeofenceAlerts alerts={alerts} onDismiss={dismissAlert} />
        )}

        {/* ── Filter Bar ── */}
        <LiveFilterBar
          filters={filters}
          onChange={(f) => { setFilters(f); setSelectedVehicle(null); setRoutePath([]); }}
          vehicles={vehicles}
        />

        {/* ── Summary Cards ── */}
        <LiveSummaryCards
          online={stats.online}
          offline={stats.offline}
          activeTrips={stats.activeTrips}
          avgSpeed={stats.avgSpeed}
        />

        {/* ── Trip Playback ── */}
        {routePath.length > 0 && (
          <TripPlayback
            route={routePath}
            vehicle={selectedVehicle}
            onProgress={setPlaybackIdx}
          />
        )}

        {/* ── Map + Side Panel ── */}
        <div className="flex gap-3" style={{ height: "520px" }}>
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Loading live data…</p>
                </div>
              </div>
            ) : (
              <LiveTrackingMap
                vehicles={filteredVehicles}
                routePath={routePath}
                playbackPos={playbackPos}
                focusVehicle={selectedVehicle}
                alerts={alerts}
                timeSince={timeSince}
                onSelectVehicle={handleSelectVehicle}
                onLoadRoute={handleLoadRoute}
                onDismissAlert={dismissAlert}
              />
            )}
          </div>

          <div className="w-56 shrink-0">
            <VehicleListPanel
              vehicles={filteredVehicles}
              selectedId={selectedVehicle?.vehicleId ?? null}
              onSelect={(v) => { setSelectedVehicle(v); setRoutePath([]); }}
            />
          </div>
        </div>

        {/* ── Vehicle Table ── */}
        <VehicleTableList
          vehicles={filteredVehicles}
          onSelect={handleLoadRoute}
          timeSince={timeSince}
        />

      </div>
    </MainLayout>
  );
}
