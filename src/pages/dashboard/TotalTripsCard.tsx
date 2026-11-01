import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import { ArrowUpRight } from "lucide-react";
import { useDashboardStats, useShipments } from "../../hooks/useDashboard";
import { CardSkeleton } from "../../components/common/Loader";

const FALLBACK_DATA = [
  { month: "Dec", trips: 55, trips2: 30 },
  { month: "Jan", trips: 70, trips2: 40 },
  { month: "Feb", trips: 60, trips2: 35 },
  { month: "Mar", trips: 78, trips2: 50 },
  { month: "Apr", trips: 84, trips2: 60 },
];

export default function TotalTripsCard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: shipments, isLoading: shipmentsLoading } = useShipments();

  const isLoading = statsLoading || shipmentsLoading;

  if (isLoading) return <CardSkeleton />;

  // Prefer stats.totalShipments, fallback to shipments array length, fallback to 0
  const total =
    stats?.totalShipments ?? stats?.total_shipments ?? shipments?.length ?? 0;

  // Build bar chart data from shipment statuses if available
  const chartData =
    shipments && shipments.length > 0
      ? (() => {
          const months: Record<string, { trips: number; trips2: number }> = {};
          shipments.forEach((s) => {
            const key = s.createdAt
              ? new Date(s.createdAt).toLocaleString("en", { month: "short" })
              : "N/A";
            if (!months[key]) months[key] = { trips: 0, trips2: 0 };
            months[key].trips += 1;
            if (s.status === "DELIVERED") months[key].trips2 += 1;
          });
          const entries = Object.entries(months).slice(-5);
          return entries.map(([month, v]) => ({ month, ...v }));
        })()
      : FALLBACK_DATA;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 17l4-8 4 4 4-6 4 10"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-gray-500 text-sm font-medium">Total Shipments</span>
      </div>

      <div className="flex items-end gap-3 mt-2 mb-1">
        <span className="text-4xl font-bold text-gray-900 leading-none">{total}</span>
        <span className="flex items-center gap-0.5 text-xs font-semibold text-green-500 mb-1 bg-green-50 px-1.5 py-0.5 rounded-full">
          <ArrowUpRight size={11} />
          live
        </span>
        <span className="text-xs text-gray-400 mb-1">all time</span>
      </div>

      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={chartData} barCategoryGap="20%">
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
          />
          <Bar dataKey="trips" fill="#3b82f6" radius={[3, 3, 0, 0]} barSize={12} />
          <Bar dataKey="trips2" fill="#86efac" radius={[3, 3, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
