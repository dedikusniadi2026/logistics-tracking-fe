import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import { useDashboardStats } from "../../hooks/useDashboard";
import { CardSkeleton } from "../../components/common/Loader";

const FALLBACK_DATA = [
  { month: "Dec", d1: 900, d2: 500 },
  { month: "Jan", d1: 1100, d2: 700 },
  { month: "Feb", d1: 800, d2: 600 },
  { month: "Mar", d1: 1300, d2: 900 },
  { month: "Apr", d1: 1628, d2: 1000 },
];

export default function DistanceDrivenCard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <CardSkeleton />;

  const totalKm =
    stats?.totalDistance ??
    stats?.total_distance ??
    stats?.distanceDriven ??
    stats?.distance_driven ??
    1628;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#3b82f6" strokeWidth="2" />
            <path
              d="M12 8v4l3 3"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="text-gray-500 text-sm font-medium">Distance driven</span>
      </div>

      <div className="flex items-end gap-2 mt-2 mb-1">
        <span className="text-4xl font-bold text-gray-900 leading-none">
          {Number(totalKm).toLocaleString()}
        </span>
        <span className="text-xl font-semibold text-gray-400 mb-0.5">km</span>
      </div>

      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={FALLBACK_DATA} barCategoryGap="20%">
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
          />
          <Bar dataKey="d1" fill="#3b82f6" radius={[3, 3, 0, 0]} barSize={12} />
          <Bar dataKey="d2" fill="#86efac" radius={[3, 3, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
