import { Clock, Gauge, Fuel, Navigation, User } from "lucide-react";
import type { LiveVehicle } from "../../types/livetracking";
import { calcEta, calcProgress } from "../../hooks/useLiveTracking";

interface Props {
  vehicles: LiveVehicle[];
  onSelect: (v: LiveVehicle) => void;
  timeSince: (iso?: string) => string;
}

const STATUS_STYLE: Record<string, string> = {
  ON_DELIVERY: "bg-blue-100 text-blue-700",
  IN_TRANSIT:  "bg-blue-100 text-blue-700",
  PICKED_UP:   "bg-purple-100 text-purple-700",
  AVAILABLE:   "bg-green-100 text-green-700",
  DELIVERED:   "bg-emerald-100 text-emerald-700",
  INACTIVE:    "bg-gray-100 text-gray-500",
};

const DRIVER_STATUS: Record<string, { cls: string; label: string }> = {
  ON_DELIVERY: { cls: "text-blue-600",  label: "On Route" },
  IN_TRANSIT:  { cls: "text-blue-600",  label: "Driving" },
  PICKED_UP:   { cls: "text-purple-600",label: "Picked Up" },
  AVAILABLE:   { cls: "text-green-600", label: "Standby" },
  INACTIVE:    { cls: "text-gray-400",  label: "Off Duty" },
};

function FuelMini({ level }: { level: number }) {
  const color = level < 20 ? "bg-red-500" : level < 40 ? "bg-yellow-400" : "bg-green-500";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${level}%` }} />
      </div>
      <span className={`text-[11px] font-semibold ${level < 20 ? "text-red-600" : "text-gray-600"}`}>
        {level}%
      </span>
    </div>
  );
}

function EtaMini({ vehicle }: { vehicle: LiveVehicle }) {
  const eta = calcEta(vehicle);
  if (!eta) return <span className="text-xs text-gray-400">—</span>;
  const label = eta.etaMin < 60
    ? `${eta.etaMin}m`
    : `${Math.floor(eta.etaMin / 60)}h ${eta.etaMin % 60}m`;
  return (
    <div className="text-xs">
      <span className="font-semibold text-gray-800">{label}</span>
      <span className="text-gray-400 ml-1">({eta.distKm} km)</span>
    </div>
  );
}

function ProgressMini({ vehicle }: { vehicle: LiveVehicle }) {
  const pct = calcProgress(vehicle);
  return (
    <div className="flex items-center gap-1.5 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-gray-500">{pct}%</span>
    </div>
  );
}

export default function VehicleTableList({ vehicles, onSelect, timeSince }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Vehicle List</h3>
        <span className="text-xs text-gray-400">{vehicles.length} tracked</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                { label: "Vehicle",        icon: <Navigation size={11} /> },
                { label: "Driver",         icon: <User size={11} /> },
                { label: "Driver Status",  icon: null },
                { label: "Speed",          icon: <Gauge size={11} /> },
                { label: "Fuel",           icon: <Fuel size={11} /> },
                { label: "Trip Progress",  icon: null },
                { label: "ETA / Distance", icon: null },
                { label: "Status",         icon: null },
                { label: "Last Update",    icon: <Clock size={11} /> },
              ].map((h) => (
                <th key={h.label} className="text-left text-xs font-semibold text-gray-400 px-4 py-3">
                  <span className="flex items-center gap-1">{h.icon}{h.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-sm text-gray-400">
                  No vehicles tracked
                </td>
              </tr>
            )}
            {vehicles.map((v) => {
              const drvStatus = DRIVER_STATUS[v.status] ?? { cls: "text-gray-400", label: "Unknown" };
              return (
                <tr
                  key={v.vehicleId}
                  onClick={() => onSelect(v)}
                  className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer transition-colors"
                >
                  {/* Vehicle */}
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-800">{v.vehicleId}</div>
                    {v.model && <div className="text-[11px] text-gray-400">{v.model}</div>}
                  </td>

                  {/* Driver */}
                  <td className="px-4 py-3 text-sm text-gray-600">{v.driver}</td>

                  {/* Driver Status */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${drvStatus.cls}`}>
                      {drvStatus.label}
                    </span>
                  </td>

                  {/* Speed */}
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${v.speed > 0 ? "text-gray-800" : "text-gray-400"}`}>
                      {v.speed > 0 ? `${v.speed} km/h` : "—"}
                    </span>
                  </td>

                  {/* Fuel */}
                  <td className="px-4 py-3">
                    <FuelMini level={v.fuel ?? 75} />
                  </td>

                  {/* Trip Progress */}
                  <td className="px-4 py-3">
                    <ProgressMini vehicle={v} />
                  </td>

                  {/* ETA */}
                  <td className="px-4 py-3">
                    <EtaMini vehicle={v} />
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      STATUS_STYLE[v.status] ?? "bg-gray-100 text-gray-500"
                    }`}>
                      {v.status.replace(/_/g, " ")}
                    </span>
                  </td>

                  {/* Last Update */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} />
                      {timeSince(v.updatedAt)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
