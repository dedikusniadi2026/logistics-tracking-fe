import { Wifi, WifiOff, Gauge, Fuel, User } from "lucide-react";
import type { LiveVehicle } from "../../types/livetracking";
import { calcProgress } from "../../hooks/useLiveTracking";

interface Props {
  vehicles: LiveVehicle[];
  selectedId: string | null;
  onSelect: (v: LiveVehicle) => void;
}

const STATUS_DOT: Record<string, string> = {
  ON_DELIVERY: "bg-blue-500",
  IN_TRANSIT:  "bg-blue-500",
  PICKED_UP:   "bg-purple-500",
  AVAILABLE:   "bg-green-500",
  DELIVERED:   "bg-emerald-500",
  INACTIVE:    "bg-gray-400",
};

const DRIVER_LABEL: Record<string, { cls: string; label: string }> = {
  ON_DELIVERY: { cls: "text-blue-500",  label: "On Route" },
  IN_TRANSIT:  { cls: "text-blue-500",  label: "Driving" },
  PICKED_UP:   { cls: "text-purple-500",label: "Pickup" },
  AVAILABLE:   { cls: "text-green-500", label: "Standby" },
  INACTIVE:    { cls: "text-gray-400",  label: "Off Duty" },
};

export default function VehicleListPanel({ vehicles, selectedId, onSelect }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 shrink-0">
        <h3 className="text-sm font-semibold text-gray-900">Vehicles</h3>
        <p className="text-[11px] text-gray-400">{vehicles.length} tracked</p>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {vehicles.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm text-gray-400">
            No vehicles
          </div>
        )}

        {vehicles.map((v) => {
          const online = v.status !== "INACTIVE";
          const isSelected = v.vehicleId === selectedId;
          const fuel = v.fuel ?? 75;
          const progress = calcProgress(v);
          const drvLabel = DRIVER_LABEL[v.status] ?? { cls: "text-gray-400", label: "Unknown" };
          const fuelColor = fuel < 20 ? "bg-red-500" : fuel < 40 ? "bg-yellow-400" : "bg-green-400";

          return (
            <button
              key={v.vehicleId}
              onClick={() => onSelect(v)}
              className={`w-full text-left px-3 py-2.5 border-b border-gray-50 transition-colors hover:bg-blue-50/40 ${
                isSelected ? "bg-blue-50" : ""
              }`}
            >
              {/* Row 1: ID + online badge */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[v.status] ?? "bg-gray-400"}`} />
                  <span className="text-xs font-bold text-gray-800 truncate">{v.vehicleId}</span>
                </div>
                <div className={`flex items-center gap-0.5 ${online ? "text-green-600" : "text-gray-400"}`}>
                  {online ? <Wifi size={10} /> : <WifiOff size={10} />}
                  <span className="text-[10px] font-medium">{online ? "Online" : "Offline"}</span>
                </div>
              </div>

              {/* Row 2: Driver + status */}
              <div className="flex items-center gap-1 mb-1.5">
                <User size={10} className="text-gray-400 shrink-0" />
                <span className="text-[11px] text-gray-500 truncate flex-1">{v.driver}</span>
                <span className={`text-[10px] font-semibold ${drvLabel.cls}`}>{drvLabel.label}</span>
              </div>

              {/* Row 3: Speed + Fuel */}
              <div className="flex items-center gap-2 mb-1.5">
                {v.speed > 0 && (
                  <div className="flex items-center gap-0.5 text-gray-500">
                    <Gauge size={10} />
                    <span className="text-[10px]">{v.speed} km/h</span>
                  </div>
                )}
                <div className="flex items-center gap-1 flex-1">
                  <Fuel size={10} className={fuel < 20 ? "text-red-400" : "text-gray-400"} />
                  <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${fuelColor}`} style={{ width: `${fuel}%` }} />
                  </div>
                  <span className={`text-[10px] font-semibold ${fuel < 20 ? "text-red-500" : "text-gray-500"}`}>
                    {fuel}%
                  </span>
                </div>
              </div>

              {/* Row 4: Trip progress bar */}
              {progress > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-[10px] text-blue-500 font-medium">{progress}%</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
