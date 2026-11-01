import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Package, Clock, DollarSign } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import { useShipments } from "../../hooks/useShipments";
import { useDashboardStats } from "../../hooks/useDashboard";

const PIE_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#6b7280"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function StatCard({
  icon,
  title,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Analytics() {
  const { data: shipments = [], isLoading } = useShipments();
  const { data: _stats } = useDashboardStats();

  const metrics = useMemo(() => {
    const total = shipments.length;
    const delivered = shipments.filter((s) => s.status === "DELIVERED").length;
    const cancelled = shipments.filter((s) => s.status === "CANCELLED").length;
    const successRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : "0";
    return { total, delivered, cancelled, successRate };
  }, [shipments]);

  const monthlyData = useMemo(() => {
    const counts: Record<number, number> = {};
    shipments.forEach((s) => {
      if (s.createdAt) {
        const m = new Date(s.createdAt).getMonth();
        counts[m] = (counts[m] ?? 0) + 1;
      }
    });
    return MONTHS.map((name, i) => ({ name, count: counts[i] ?? 0 }));
  }, [shipments]);

  const pieData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      PENDING: 0,
      IN_TRANSIT: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    shipments.forEach((s) => {
      const key = s.status in statusCounts ? s.status : "PENDING";
      statusCounts[key] = (statusCounts[key] ?? 0) + 1;
    });
    return Object.entries(statusCounts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [shipments]);

  const cumulativeData = useMemo(() => {
    const sorted = [...shipments]
      .filter((s) => s.createdAt)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());

    const byDate: Record<string, number> = {};
    sorted.forEach((s) => {
      const d = new Date(s.createdAt!).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      });
      byDate[d] = (byDate[d] ?? 0) + 1;
    });

    let cumulative = 0;
    return Object.entries(byDate).map(([date, count]) => {
      cumulative += count;
      return { date, cumulative };
    });
  }, [shipments]);

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-gray-900">Analytics</h1>
          <p className="text-xs text-gray-400 mt-0.5">Statistik dan analitik pengiriman</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Row 1 — Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<TrendingUp size={18} className="text-green-600" />}
                title="Delivery Success Rate"
                value={`${metrics.successRate}%`}
                sub={`${metrics.delivered} of ${metrics.total} delivered`}
                color="bg-green-50"
              />
              <StatCard
                icon={<Package size={18} className="text-blue-600" />}
                title="Total Shipments"
                value={String(metrics.total)}
                sub={`${metrics.cancelled} cancelled`}
                color="bg-blue-50"
              />
              <StatCard
                icon={<Clock size={18} className="text-purple-600" />}
                title="In Transit"
                value={String(shipments.filter(s => ["IN_TRANSIT","PICKED_UP","OUT_FOR_DELIVERY"].includes(s.status)).length)}
                sub="Active deliveries"
                color="bg-purple-50"
              />
              <StatCard
                icon={<DollarSign size={18} className="text-orange-600" />}
                title="Pending"
                value={String(shipments.filter(s => s.status === "PENDING" || s.status === "ASSIGNED").length)}
                sub="Awaiting pickup"
                color="bg-orange-50"
              />
            </div>

            {/* Row 2 — Bar + Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Monthly Bar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                  Monthly Shipments
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #f3f4f6",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Shipments" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                  Status Distribution
                </h3>
                {pieData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                    No data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: "11px" }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "10px",
                          border: "1px solid #f3f4f6",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Row 3 — Cumulative Line */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                Cumulative Shipments Over Time
              </h3>
              {cumulativeData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={cumulativeData}
                    margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #f3f4f6",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name="Total Shipments"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
