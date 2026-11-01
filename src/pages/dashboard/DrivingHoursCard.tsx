import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useDrivers } from "../../hooks/useDashboard";
import { CardSkeleton } from "../../components/common/Loader";

export default function DrivingHoursCard() {
  const { data: drivers, isLoading } = useDrivers();

  if (isLoading) return <CardSkeleton />;

  const available = drivers?.filter((d) => d.status === "AVAILABLE").length ?? 0;
  const onDelivery = drivers?.filter((d) => d.status === "ON_DELIVERY").length ?? 0;
  const inactive = drivers?.filter((d) => d.status === "INACTIVE").length ?? 0;
  const total = (drivers?.length ?? 0) || 1; // avoid div/0

  const chartData = [
    { name: "Available", value: available, color: "#3b82f6" },
    { name: "On Delivery", value: onDelivery, color: "#86efac" },
    { name: "Inactive", value: inactive, color: "#d1d5db" },
  ].filter((d) => d.value > 0);

  // If no drivers at all, show placeholder slice
  const displayData =
    chartData.length > 0
      ? chartData
      : [{ name: "No data", value: 1, color: "#e5e7eb" }];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#3b82f6" strokeWidth="2" />
            <path
              d="M12 7v5l4 2"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-gray-500 text-sm font-medium">Driver status</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 mb-1 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[11px] text-gray-500">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-300" />
          <span className="text-[11px] text-gray-500">On Delivery</span>
        </div>
        {inactive > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="text-[11px] text-gray-500">Inactive</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {/* Count Text */}
        <div className="flex items-end gap-1">
          <span className="text-4xl font-bold text-gray-900 leading-none">{onDelivery}</span>
          <span className="text-base font-semibold text-gray-400 mb-1">active</span>
          <span className="text-4xl font-bold text-gray-900 leading-none ml-1">{available}</span>
          <span className="text-base font-semibold text-gray-400 mb-1">free</span>
        </div>

        {/* Donut Chart */}
        <div className="w-20 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={24}
                outerRadius={36}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {drivers && drivers.length === 0 && (
        <p className="text-xs text-gray-400 mt-1">No driver data available</p>
      )}

      {/* Total indicator */}
      {total > 0 && drivers && drivers.length > 0 && (
        <p className="text-[11px] text-gray-400 mt-1">
          {total} total driver{total !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
