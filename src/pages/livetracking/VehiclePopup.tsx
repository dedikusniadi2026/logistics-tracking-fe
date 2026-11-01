import {
  X, Truck, User, Gauge, Activity, Clock, MapPin, Phone,
  Fuel, Thermometer, Package, Route, ChevronRight, Calendar, Crosshair,
} from "lucide-react";
import type { LiveVehicle } from "../../types/livetracking";
import type { calcEta as CalcEtaType, calcProgress as CalcProgressType } from "../../hooks/useLiveTracking";

interface Props {
  vehicle: LiveVehicle;
  timeSince: (iso?: string) => string;
  calcEta: typeof CalcEtaType;
  calcProgress: typeof CalcProgressType;
  darkMode?: boolean;
  onClose: () => void;
  onLoadRoute: () => void;
  onFlyTo?: () => void;
}

const STATUS_CFG: Record<string, { cls: string; dot: string }> = {
  ON_DELIVERY: { cls: "bg-blue-100 text-blue-700",       dot: "bg-blue-500" },
  IN_TRANSIT:  { cls: "bg-blue-100 text-blue-700",       dot: "bg-blue-500" },
  PICKED_UP:   { cls: "bg-purple-100 text-purple-700",   dot: "bg-purple-500" },
  AVAILABLE:   { cls: "bg-green-100 text-green-700",     dot: "bg-green-500" },
  DELIVERED:   { cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  INACTIVE:    { cls: "bg-gray-100 text-gray-500",       dot: "bg-gray-400" },
};

function Row({
  icon, label, value, dark = false,
}: {
  icon: React.ReactNode; label: string; value: React.ReactNode; dark?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className={`flex items-center gap-1.5 shrink-0 ${dark ? "text-gray-500" : "text-gray-400"}`}>
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>
      <div className={`text-xs font-medium text-right ${dark ? "text-gray-200" : "text-gray-800"}`}>
        {value}
      </div>
    </div>
  );
}

function FuelBar({ level, dark = false }: { level: number; dark?: boolean }) {
  const barColor = level < 20 ? "bg-red-500" : level < 40 ? "bg-yellow-400" : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 h-2 rounded-full overflow-hidden ${dark ? "bg-gray-700" : "bg-gray-100"}`}>
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${level}%` }} />
      </div>
      <span className={`text-xs font-semibold w-8 text-right ${level < 20 ? "text-red-500" : dark ? "text-gray-300" : "text-gray-700"}`}>
        {level}%
      </span>
    </div>
  );
}

function ProgressBar({ pct, dark = false }: { pct: number; dark?: boolean }) {
  return (
    <div className="space-y-1">
      <div className={`flex justify-between text-[10px] ${dark ? "text-gray-500" : "text-gray-400"}`}>
        <span>Origin</span><span>Destination</span>
      </div>
      <div className={`h-2 rounded-full overflow-hidden relative ${dark ? "bg-gray-700" : "bg-gray-100"}`}>
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 border-2 border-white rounded-full shadow"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      <p className="text-[10px] text-blue-500 font-semibold">{pct}% completed</p>
    </div>
  );
}

export default function VehiclePopup({
  vehicle, timeSince, calcEta, calcProgress,
  darkMode = false, onClose, onLoadRoute, onFlyTo,
}: Props) {
  const statusCfg = STATUS_CFG[vehicle.status] ?? STATUS_CFG.INACTIVE;
  const eta       = calcEta(vehicle);
  const progress  = calcProgress(vehicle);
  const fuel      = vehicle.fuel ?? 75;

  const fmtEta = (min: number) =>
    min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${min % 60}m`;

  const fmtDelivery = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
      : "—";

  const bg   = darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100";
  const secBg = darkMode ? "bg-gray-800" : "bg-gray-50";
  const etaBg  = darkMode ? "bg-green-900/40" : "bg-green-50";
  const div    = darkMode ? "border-gray-700" : "border-gray-100";

  return (
    <div className={`rounded-2xl shadow-2xl border w-72 overflow-hidden ${bg}`}>

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <Truck size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">{vehicle.vehicleId}</p>
              {vehicle.model && (
                <p className="text-[11px] text-blue-200 leading-tight">
                  {vehicle.model} · {vehicle.vehicleType ?? "Truck"}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onFlyTo && (
              <button
                onClick={onFlyTo}
                title="Fly to vehicle"
                className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <Crosshair size={11} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Status + last update */}
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {vehicle.status.replace(/_/g, " ")}
          </span>
          <span className="text-[10px] text-blue-200">{timeSince(vehicle.updatedAt)}</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 py-3 space-y-3 max-h-[60vh] overflow-y-auto">

        {/* Trip Progress */}
        {vehicle.originAddress && (
          <div className={`${secBg} rounded-xl p-3 space-y-2`}>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Trip Progress</p>
            <ProgressBar pct={progress} dark={darkMode} />
          </div>
        )}

        {/* Speed & Fuel */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`${secBg} rounded-xl p-2.5 text-center`}>
            <Gauge size={14} className="mx-auto mb-1 text-blue-500" />
            <p className={`text-lg font-bold leading-none ${darkMode ? "text-white" : "text-gray-900"}`}>
              {vehicle.speed ?? 0}
            </p>
            <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>km/h</p>
          </div>
          <div className={`${secBg} rounded-xl p-2.5`}>
            <div className="flex items-center gap-1 mb-1.5">
              <Fuel size={12} className="text-orange-500" />
              <p className={`text-[10px] font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Fuel</p>
            </div>
            <FuelBar level={fuel} dark={darkMode} />
          </div>
        </div>

        {/* ETA & Distance */}
        {eta && (
          <div className={`${etaBg} rounded-xl p-3 grid grid-cols-2 gap-2`}>
            <div className="text-center">
              <p className={`text-[10px] mb-0.5 ${darkMode ? "text-gray-400" : "text-gray-400"}`}>ETA</p>
              <p className={`text-sm font-bold ${darkMode ? "text-green-400" : "text-green-700"}`}>
                {fmtEta(eta.etaMin)}
              </p>
            </div>
            <div className={`text-center border-l ${darkMode ? "border-green-800" : "border-green-200"}`}>
              <p className={`text-[10px] mb-0.5 ${darkMode ? "text-gray-400" : "text-gray-400"}`}>Remaining</p>
              <p className={`text-sm font-bold ${darkMode ? "text-green-400" : "text-green-700"}`}>
                {eta.distKm} km
              </p>
            </div>
          </div>
        )}

        {/* Driver */}
        <div className="space-y-2">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Driver</p>
          <Row icon={<User size={12} />} label="Name" value={vehicle.driver} dark={darkMode} />
          {vehicle.driverPhone && (
            <Row
              icon={<Phone size={12} />}
              label="Phone"
              value={<a href={`tel:${vehicle.driverPhone}`} className="text-blue-400 hover:underline">{vehicle.driverPhone}</a>}
              dark={darkMode}
            />
          )}
          {vehicle.driverLicense && (
            <Row icon={<Activity size={12} />} label="License" value={vehicle.driverLicense} dark={darkMode} />
          )}
        </div>

        {/* Shipment */}
        {vehicle.shipmentId && (
          <div className={`border-t ${div} pt-3 space-y-2`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Shipment</p>
            <Row icon={<Package size={12} />} label="ID" value={`#${vehicle.shipmentId}`} dark={darkMode} />
            {vehicle.estimatedDelivery && (
              <Row icon={<Calendar size={12} />} label="Est. Delivery" value={fmtDelivery(vehicle.estimatedDelivery)} dark={darkMode} />
            )}
            {vehicle.vehicleCapacity && (
              <Row icon={<Truck size={12} />} label="Capacity" value={`${vehicle.vehicleCapacity} kg`} dark={darkMode} />
            )}
          </div>
        )}

        {/* Route */}
        {vehicle.originAddress && (
          <div className={`border-t ${div} pt-3 space-y-1.5`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Route</p>
            <div className="flex items-start gap-2">
              <MapPin size={11} className="text-green-500 mt-0.5 shrink-0" />
              <p className={`text-xs line-clamp-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{vehicle.originAddress}</p>
            </div>
            <div className="ml-1.5 pl-2 border-l-2 border-dashed border-gray-500/30 py-0.5">
              <ChevronRight size={10} className="text-gray-400" />
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={11} className="text-red-500 mt-0.5 shrink-0" />
              <p className={`text-xs line-clamp-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{vehicle.destinationAddress}</p>
            </div>
          </div>
        )}

        {/* Engine temp */}
        {vehicle.engineTemp && (
          <div className={`border-t ${div} pt-2`}>
            <Row
              icon={<Thermometer size={12} className="text-red-400" />}
              label="Engine Temp"
              value={
                <span className={vehicle.engineTemp > 95 ? "text-red-500 font-bold" : ""}>
                  {vehicle.engineTemp}°C
                </span>
              }
              dark={darkMode}
            />
          </div>
        )}

        <Row icon={<Clock size={12} />} label="Last Update" value={timeSince(vehicle.updatedAt)} dark={darkMode} />
      </div>

      {/* ── Footer ── */}
      {vehicle.shipmentId && (
        <div className={`px-4 pb-3 pt-1 border-t ${div}`}>
          <button
            onClick={onLoadRoute}
            className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Route size={12} /> Show Route & Playback
          </button>
        </div>
      )}
    </div>
  );
}
