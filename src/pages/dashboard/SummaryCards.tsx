import { useEffect, useState } from "react";
import {
  Truck,
  CheckCircle,
  PauseCircle,
  Wrench,
} from "lucide-react";
import { dashboardStatsApi } from "../../api/dashboard.api";

const cardsMeta = [
  {
    title: "Total Vehicle",
    valueKey: "totalVehicle",
    fallbackKey: "total_vehicles",
    icon: Truck,
    bg: "bg-indigo-100",
    text: "text-indigo-600",
  },
  {
    title: "Active Vehicle",
    valueKey: "activeVehicle",
    fallbackKey: "active_vehicles",
    icon: CheckCircle,
    bg: "bg-green-100",
    text: "text-green-600",
  },
  {
    title: "Idle Vehicle",
    valueKey: "idleVehicle",
    fallbackKey: "idle_vehicles",
    icon: PauseCircle,
    bg: "bg-yellow-100",
    text: "text-yellow-600",
  },
  {
    title: "Maintenance",
    valueKey: "maintenanceVehicle",
    fallbackKey: "maintenance_vehicles",
    icon: Wrench,
    bg: "bg-red-100",
    text: "text-red-600",
  },
];

export default function SummaryCards() {
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await dashboardStatsApi();
        if (mounted) setStats(data as any);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {cardsMeta.map((card) => {
        const Icon = card.icon;
        const value =
          stats?.[card.valueKey] ?? stats?.[card.fallbackKey] ?? 0;

        return (
          <div
            key={card.title}
            className="bg-white rounded-xl p-5 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <h2 className="text-3xl font-bold mt-2">
                  {loading ? "..." : value}
                </h2>
              </div>

              <div className={`${card.bg} p-3 rounded-full`}>
                <Icon className={card.text} size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
