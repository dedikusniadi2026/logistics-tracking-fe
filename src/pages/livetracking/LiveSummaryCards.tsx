import { Wifi, WifiOff, Navigation, Gauge } from "lucide-react";

interface Props {
  online: number;
  offline: number;
  activeTrips: number;
  avgSpeed: number;
}

const cards = [
  {
    key: "online",
    label: "Vehicles Online",
    icon: Wifi,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    valueColor: "text-green-600",
  },
  {
    key: "offline",
    label: "Vehicles Offline",
    icon: WifiOff,
    iconBg: "bg-red-50",
    iconColor: "text-red-400",
    valueColor: "text-red-500",
  },
  {
    key: "activeTrips",
    label: "Active Trips",
    icon: Navigation,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    valueColor: "text-blue-600",
  },
  {
    key: "avgSpeed",
    label: "Average Speed",
    icon: Gauge,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    valueColor: "text-orange-600",
    suffix: " km/h",
  },
] as const;

export default function LiveSummaryCards({ online, offline, activeTrips, avgSpeed }: Props) {
  const values: Record<string, number> = { online, offline, activeTrips, avgSpeed };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.key} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={c.iconColor} />
            </div>
            <div>
              <p className="text-xs text-gray-400 leading-none mb-1">{c.label}</p>
              <p className={`text-xl font-bold leading-none ${c.valueColor}`}>
                {values[c.key]}
                {"suffix" in c && <span className="text-sm font-medium ml-0.5">{c.suffix}</span>}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
