import { useMemo } from "react";
import { Car, Wifi, Navigation, Users, Package, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { useShipments, useVehicles, useDrivers } from "../../hooks/useDashboard";

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  dark?: boolean;
}

function KpiCard({ icon: Icon, label, value, sub, iconBg, iconColor, valueColor = "", dark = false }: KpiCardProps) {
  const bg  = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const txt = dark ? "text-white" : "text-gray-900";
  const sub2 = dark ? "text-gray-500" : "text-gray-400";
  return (
    <div className={`rounded-2xl p-4 shadow-sm border ${bg} flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className={`text-[11px] font-medium truncate ${sub2}`}>{label}</p>
        <p className={`text-2xl font-bold leading-tight ${valueColor || txt}`}>{value}</p>
        {sub && <p className={`text-[10px] ${sub2}`}>{sub}</p>}
      </div>
    </div>
  );
}

export default function KpiCards({ dark = false }: { dark?: boolean }) {
  const { data: shipments = [], isLoading: sLoad } = useShipments();
  const { data: vehicles  = [], isLoading: vLoad } = useVehicles();
  const { data: drivers   = [], isLoading: dLoad } = useDrivers();

  const metrics = useMemo(() => {
    const totalVehicles    = vehicles.length;
    const vehiclesOnline   = vehicles.filter((v) => v.status === "ACTIVE").length;
    const activeTrips      = shipments.filter((s) => ["IN_TRANSIT","PICKED_UP","OUT_FOR_DELIVERY"].includes(s.status)).length;
    const totalDrivers     = drivers.length;
    const totalShipments   = shipments.length;
    const delayed          = shipments.filter((s) => s.status === "CANCELLED").length;
    const completed        = shipments.filter((s) => s.status === "DELIVERED").length;
    const successRate      = totalShipments > 0 ? `${Math.round((completed / totalShipments) * 100)}%` : "—";
    return { totalVehicles, vehiclesOnline, activeTrips, totalDrivers, totalShipments, delayed, completed, successRate };
  }, [shipments, vehicles, drivers]);

  const isLoading = sLoad || vLoad || dLoad;

  const kpis: KpiCardProps[] = [
    { icon: Car,          label: "Total Vehicles",   value: isLoading ? "…" : metrics.totalVehicles,  iconBg: "bg-blue-50",    iconColor: "text-blue-600"   },
    { icon: Wifi,         label: "Vehicles Online",  value: isLoading ? "…" : metrics.vehiclesOnline, iconBg: "bg-green-50",   iconColor: "text-green-600", valueColor: "text-green-600" },
    { icon: Navigation,   label: "Active Trips",     value: isLoading ? "…" : metrics.activeTrips,    iconBg: "bg-purple-50",  iconColor: "text-purple-600" },
    { icon: Users,        label: "Total Drivers",    value: isLoading ? "…" : metrics.totalDrivers,   iconBg: "bg-indigo-50",  iconColor: "text-indigo-600" },
    { icon: Package,      label: "Total Shipments",  value: isLoading ? "…" : metrics.totalShipments, iconBg: "bg-cyan-50",    iconColor: "text-cyan-600"   },
    { icon: AlertTriangle,label: "Cancelled",        value: isLoading ? "…" : metrics.delayed,        iconBg: "bg-red-50",     iconColor: "text-red-500",   valueColor: metrics.delayed > 0 ? "text-red-600" : "" },
    { icon: CheckCircle2, label: "Delivered",        value: isLoading ? "…" : metrics.completed,      iconBg: "bg-emerald-50", iconColor: "text-emerald-600", valueColor: "text-emerald-600" },
    { icon: TrendingUp,   label: "Success Rate",     value: isLoading ? "…" : metrics.successRate,    iconBg: "bg-orange-50",  iconColor: "text-orange-500" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
      {kpis.map((k) => (
        <KpiCard key={k.label} {...k} dark={dark} />
      ))}
    </div>
  );
}
