import type { ReactNode } from "react";
import { ArrowUpRight, CheckCircle2, Navigation, Calendar, XCircle, Clock } from "lucide-react";
import { useShipments } from "../../hooks/useDashboard";
import type { Shipment } from "../../api/shipments.api";

type ShipmentStatus = Shipment["status"];

const statusConfig: Record<
  ShipmentStatus,
  { bg: string; text: string; icon: ReactNode }
> = {
  PENDING: {
    bg: "bg-orange-100 text-orange-600",
    text: "Pending",
    icon: <Calendar size={12} />,
  },
  ASSIGNED: {
    bg: "bg-blue-100 text-blue-700",
    text: "Assigned",
    icon: <Clock size={12} />,
  },
  PICKED_UP: {
    bg: "bg-purple-100 text-purple-700",
    text: "Picked Up",
    icon: <Navigation size={12} />,
  },
  IN_TRANSIT: {
    bg: "bg-blue-100 text-blue-700",
    text: "In Transit",
    icon: <Navigation size={12} />,
  },
  DELIVERED: {
    bg: "bg-green-100 text-green-700",
    text: "Delivered",
    icon: <CheckCircle2 size={12} />,
  },
  CANCELLED: {
    bg: "bg-gray-100 text-gray-500",
    text: "Cancelled",
    icon: <XCircle size={12} />,
  },
};

function shortAddr(addr: string, max = 18): string {
  if (!addr) return "—";
  return addr.length > max ? addr.slice(0, max) + "…" : addr;
}

function formatDate(dateStr?: string): { date: string; time: string } {
  if (!dateStr) return { date: "—", time: "—" };
  try {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString("en", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
    };
  } catch {
    return { date: dateStr, time: "" };
  }
}

export default function ScheduleOfTripsTable() {
  const { data: shipments, isLoading, isError } = useShipments();

  const rows = shipments?.slice(0, 5) ?? [];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Schedule of trips</h3>
        <button className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ArrowUpRight size={12} className="text-gray-400" />
        </button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded h-8 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-400">Failed to load shipments</p>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No shipments found</p>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <table className="w-full">
          <tbody className="divide-y divide-gray-50">
            {rows.map((trip) => {
              const cfg = statusConfig[trip.status] ?? statusConfig.PENDING;
              const { date, time } = formatDate(trip.createdAt);
              return (
                <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-3 text-sm font-medium text-gray-900 w-20 truncate max-w-[96px]">
                    {shortAddr(trip.originAddress)}
                  </td>
                  <td className="py-3 pr-3">
                    <span className="text-xs text-blue-500 font-medium">→</span>
                  </td>
                  <td className="py-3 pr-3 text-sm font-medium text-gray-900 w-20 truncate max-w-[96px]">
                    {shortAddr(trip.destinationAddress)}
                  </td>
                  <td className="py-3 pr-3 text-xs text-gray-400">{date}</td>
                  <td className="py-3 pr-3 text-xs text-gray-400">{time}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg}`}
                    >
                      {cfg.icon}
                      {cfg.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
