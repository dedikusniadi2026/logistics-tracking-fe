import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { useShipments } from "../../hooks/useDashboard";

const STATUS_COLORS: Record<string, string> = {
  PENDING:          "#f97316",
  ASSIGNED:         "#3b82f6",
  PICKED_UP:        "#a855f7",
  IN_TRANSIT:       "#06b6d4",
  OUT_FOR_DELIVERY: "#6366f1",
  DELIVERED:        "#22c55e",
  CANCELLED:        "#6b7280",
};

export default function DeliveryStatusChart({ dark = false }: { dark?: boolean }) {
  const { data: shipments = [], isLoading } = useShipments();

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    shipments.forEach((s) => {
      counts[s.status] = (counts[s.status] ?? 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [shipments]);

  const tooltipBg = dark ? "#1e293b" : "#fff";
  const tooltipBorder = dark ? "#334155" : "#e5e7eb";

  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center">
          <PieIcon size={15} className="text-purple-600" />
        </div>
        <div>
          <h3 className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-900"}`}>Delivery Status</h3>
          <p className={`text-[11px] ${dark ? "text-gray-500" : "text-gray-400"}`}>{shipments.length} total shipments</p>
        </div>
      </div>

      {isLoading ? (
        <div className={`h-48 rounded-xl animate-pulse ${dark ? "bg-gray-800" : "bg-gray-100"}`} />
      ) : pieData.length === 0 ? (
        <div className={`h-48 flex items-center justify-center text-sm ${dark ? "text-gray-600" : "text-gray-400"}`}>
          No data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={pieData} dataKey="value" nameKey="name"
              cx="50%" cy="45%" outerRadius={65} innerRadius={35}
              strokeWidth={0}
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 10, fontSize: 12 }}
              formatter={(v, name) => [`${v} shipments`, String(name).replace(/_/g, " ")]}
            />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} formatter={(v) => v.replace(/_/g, " ")} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
