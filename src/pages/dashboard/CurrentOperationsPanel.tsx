import { useMemo } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { Clock, Navigation, Gauge, Fuel, Package, User, Truck, MapPin } from "lucide-react";
import { useShipments, useVehicles, useDrivers } from "../../hooks/useDashboard";

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function InfoRow({ icon, label, value, dark }: { icon: React.ReactNode; label: string; value: React.ReactNode; dark: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className={`flex items-center gap-1.5 shrink-0 ${dark ? "text-gray-500" : "text-gray-400"}`}>
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>
      <div className={`text-xs font-semibold text-right ${dark ? "text-gray-200" : "text-gray-800"}`}>{value}</div>
    </div>
  );
}

export default function CurrentOperationsPanel({ dark = false }: { dark?: boolean }) {
  const { data: shipments = [] } = useShipments();
  const { data: vehicles  = [] } = useVehicles();
  const { data: drivers   = [] } = useDrivers();

  const active = useMemo(() =>
    shipments.find((s) => ["IN_TRANSIT","PICKED_UP","OUT_FOR_DELIVERY"].includes(s.status)),
    [shipments]
  );

  const dist = active
    ? haversine(Number(active.originLatitude), Number(active.originLongitude),
        Number(active.destinationLatitude), Number(active.destinationLongitude))
    : 0;
  const etaMin = dist > 0 ? Math.round((dist / 60) * 60) : 0;
  const etaLabel = etaMin < 60 ? `${etaMin} min` : `${Math.floor(etaMin / 60)}h ${etaMin % 60}m`;

  // Fleet health
  const vActive  = vehicles.filter((v) => v.status === "ACTIVE").length;
  const vMaint   = vehicles.filter((v) => v.status === "MAINTENANCE").length;
  const vOff     = vehicles.filter((v) => v.status === "INACTIVE").length;
  const healthPct = vehicles.length > 0 ? Math.round((vActive / vehicles.length) * 100) : 0;

  const activeDriver = active?.driver;
  const activeVehicle = active?.vehicle;

  const bg    = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const txt   = dark ? "text-white" : "text-gray-900";
  const sub   = dark ? "text-gray-500" : "text-gray-400";
  const sec   = dark ? "bg-gray-800" : "bg-gray-50";
  const prog  = dark ? "bg-gray-700" : "bg-gray-100";

  const radialData = [
    { name: "Health", value: healthPct, fill: healthPct >= 80 ? "#22c55e" : healthPct >= 50 ? "#f59e0b" : "#ef4444" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

      {/* Current Trip */}
      <div className={`rounded-2xl p-5 shadow-sm border ${bg}`}>
        <div className="flex items-center gap-2 mb-4">
          <Navigation size={15} className="text-blue-500" />
          <h3 className={`text-sm font-semibold ${txt}`}>Current Trip</h3>
        </div>

        {!active ? (
          <p className={`text-sm text-center py-6 ${sub}`}>No active trip</p>
        ) : (
          <div className="space-y-3">
            {/* IDs */}
            <div className={`${sec} rounded-xl p-3 space-y-2`}>
              <InfoRow dark={dark} icon={<Package size={12}/>} label="Shipment" value={active.shipmentNumber ?? `#${active.id}`} />
              <InfoRow dark={dark} icon={<User size={12}/>}    label="Driver"   value={activeDriver?.name ?? (active.driverId ? `#${active.driverId}` : "—")} />
              <InfoRow dark={dark} icon={<Truck size={12}/>}   label="Vehicle"  value={activeVehicle?.plateNumber ?? (active.vehicleId ? `#${active.vehicleId}` : "—")} />
            </div>

            {/* Route */}
            <div className={`${sec} rounded-xl p-3 space-y-1.5`}>
              <div className="flex items-start gap-2">
                <MapPin size={11} className="text-green-500 mt-0.5 shrink-0" />
                <p className={`text-xs truncate ${txt}`}>{active.originAddress}</p>
              </div>
              <div className="ml-1.5 pl-2 border-l border-dashed border-gray-400/30 py-0.5">
                <span className={`text-[10px] ${sub}`}>↓</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={11} className="text-red-500 mt-0.5 shrink-0" />
                <p className={`text-xs truncate ${txt}`}>{active.destinationAddress}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <Clock size={12} className="text-blue-500"/>,      label: "ETA",      value: etaLabel },
                { icon: <Navigation size={12} className="text-green-500"/>, label: "Distance", value: `${dist.toFixed(1)} km` },
                { icon: <Gauge size={12} className="text-purple-500"/>,    label: "Avg Speed", value: "60 km/h" },
                { icon: <Fuel size={12} className="text-orange-500"/>,     label: "Fuel",      value: "75%" },
              ].map((m) => (
                <div key={m.label} className={`${sec} rounded-xl p-2.5 flex items-center gap-2`}>
                  {m.icon}
                  <div>
                    <p className={`text-[10px] ${sub}`}>{m.label}</p>
                    <p className={`text-xs font-bold ${txt}`}>{m.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className={sub}>Trip Progress</span>
                <span className="text-blue-500 font-bold">~10%</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${prog}`}>
                <div className="h-full w-[10%] bg-blue-500 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fleet Health */}
      <div className={`rounded-2xl p-5 shadow-sm border ${bg}`}>
        <div className="flex items-center gap-2 mb-4">
          <Truck size={15} className="text-green-500" />
          <h3 className={`text-sm font-semibold ${txt}`}>Fleet Health</h3>
        </div>

        <div className="flex items-center justify-between mb-4">
          {/* Radial */}
          <div className="w-28 h-28 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="80%"
                data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-bold ${healthPct >= 80 ? "text-green-500" : healthPct >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                {healthPct}%
              </span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 flex-1 ml-4">
            {[
              { label: "Active",      count: vActive, color: "bg-green-500",  total: vehicles.length },
              { label: "Maintenance", count: vMaint,  color: "bg-orange-400", total: vehicles.length },
              { label: "Offline",     count: vOff,    color: "bg-gray-400",   total: vehicles.length },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className={sub}>{r.label}</span>
                  <span className={`font-semibold ${txt}`}>{r.count}</span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${prog}`}>
                  <div className={`h-full rounded-full ${r.color}`}
                    style={{ width: r.total > 0 ? `${(r.count / r.total) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Status */}
        <div className={`${sec} rounded-xl p-3`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${sub}`}>Drivers</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Available",  count: drivers.filter((d) => d.status === "AVAILABLE").length,  color: "text-green-600" },
              { label: "On Route",   count: drivers.filter((d) => d.status === "ON_DELIVERY").length, color: "text-blue-600"  },
              { label: "Inactive",   count: drivers.filter((d) => d.status === "INACTIVE").length,   color: "text-gray-400"  },
            ].map((d) => (
              <div key={d.label}>
                <p className={`text-lg font-bold ${d.color}`}>{d.count}</p>
                <p className={`text-[10px] ${sub}`}>{d.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
