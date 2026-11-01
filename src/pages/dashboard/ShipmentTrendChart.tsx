import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { useShipments } from "../../hooks/useDashboard";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function ShipmentTrendChart({ dark = false }: { dark?: boolean }) {
  const { data: shipments = [], isLoading } = useShipments();

  const chartData = useMemo(() => {
    const map: Record<string, { total: number; delivered: number; cancelled: number }> = {};
    shipments.forEach((s) => {
      const m = s.createdAt ? MONTHS[new Date(s.createdAt).getMonth()] : "N/A";
      if (!map[m]) map[m] = { total: 0, delivered: 0, cancelled: 0 };
      map[m].total++;
      if (s.status === "DELIVERED")  map[m].delivered++;
      if (s.status === "CANCELLED")  map[m].cancelled++;
    });
    // Return only months that have data, or last 6 months
    const months = Object.keys(map).length > 0 ? Object.keys(map) : MONTHS.slice(0, 3);
    return months.map((m) => ({ month: m, ...( map[m] ?? { total: 0, delivered: 0, cancelled: 0 }) }));
  }, [shipments]);

  const tickColor   = dark ? "#94a3b8" : "#9ca3af";
  const gridColor   = dark ? "#1e293b" : "#f3f4f6";
  const tooltipBg   = dark ? "#1e293b" : "#fff";
  const tooltipBorder = dark ? "#334155" : "#e5e7eb";

  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
            <TrendingUp size={15} className="text-blue-600" />
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-900"}`}>Shipment Trend</h3>
            <p className={`text-[11px] ${dark ? "text-gray-500" : "text-gray-400"}`}>Monthly shipment activity</p>
          </div>
        </div>
        <button className={`w-6 h-6 rounded-full border flex items-center justify-center ${dark ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"}`}>
          <ArrowUpRight size={12} className={dark ? "text-gray-500" : "text-gray-400"} />
        </button>
      </div>

      {isLoading ? (
        <div className={`h-48 rounded-xl animate-pulse ${dark ? "bg-gray-800" : "bg-gray-100"}`} />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDelivered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: dark ? "#e2e8f0" : "#374151", fontWeight: 600 }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="total" name="Total" stroke="#3b82f6" strokeWidth={2} fill="url(#gradTotal)" dot={false} />
            <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#22c55e" strokeWidth={2} fill="url(#gradDelivered)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
