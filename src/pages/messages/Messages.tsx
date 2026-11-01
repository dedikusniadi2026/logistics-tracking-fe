import { useState, useMemo } from "react";
import {
  MessageSquare,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ArrowRight,
} from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import { useShipments } from "../../hooks/useShipments";
import type { Shipment } from "../../api/shipments.api";

function relativeTime(val?: string) {
  if (!val) return "";
  const diff = Date.now() - new Date(val).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

function fmtDate(val?: string) {
  if (!val) return "—";
  return new Date(val).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "DELIVERED":
      return <CheckCircle2 size={16} className="text-green-500" />;
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
    case "PICKED_UP":
      return <Truck size={16} className="text-blue-500" />;
    case "CANCELLED":
      return <XCircle size={16} className="text-red-500" />;
    case "ASSIGNED":
      return <Clock size={16} className="text-orange-500" />;
    default:
      return <Package size={16} className="text-gray-500" />;
  }
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  PICKED_UP: "bg-purple-100 text-purple-700",
  IN_TRANSIT: "bg-blue-100 text-blue-700",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

function isRecent(val?: string) {
  if (!val) return false;
  return Date.now() - new Date(val).getTime() < 3600_000;
}

export default function Messages() {
  const { data: shipments = [], isLoading } = useShipments();
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  const notifications = useMemo(
    () =>
      [...shipments]
        .sort(
          (a, b) =>
            new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() -
            new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
        )
        .slice(0, 50),
    [shipments]
  );

  const unreadCount = notifications.filter(
    (s) => !readIds.has(s.id) && isRecent(s.updatedAt ?? s.createdAt)
  ).length;

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((s) => s.id)));
  };

  const handleSelect = (s: Shipment) => {
    setSelected(s);
    setReadIds((prev) => new Set([...prev, s.id]));
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-gray-900">Messages</h1>
          <p className="text-xs text-gray-400 mt-0.5">Notifikasi status pengiriman</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden h-[calc(100vh-200px)] min-h-96">
          {/* Left panel */}
          <div className="w-80 shrink-0 border-r border-gray-100 flex flex-col">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">Inbox</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark All Read
              </button>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-0">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex gap-3 items-start px-4 py-3 border-b border-gray-50">
                      <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-40" />
                        <div className="h-2.5 bg-gray-100 rounded animate-pulse w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2 py-12">
                  <MessageSquare size={28} className="text-gray-300" />
                  Tidak ada notifikasi
                </div>
              ) : (
                notifications.map((s) => {
                  const unread = !readIds.has(s.id) && isRecent(s.updatedAt ?? s.createdAt);
                  const isActive = selected?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelect(s)}
                      className={`w-full flex items-start gap-3 px-4 py-3 border-b border-gray-50 text-left transition-colors ${
                        isActive ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                        <StatusIcon status={s.status} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-gray-800 truncate flex-1">
                            Shipment {s.shipmentNumber ?? `#${s.id}`}
                          </p>
                          {unread && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{s.status}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {relativeTime(s.updatedAt ?? s.createdAt)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col">
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                <MessageSquare size={40} className="text-gray-200" />
                <p className="text-sm">Pilih notifikasi untuk melihat detail</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Title */}
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-semibold text-gray-900">
                    {selected.shipmentNumber ?? `Shipment #${selected.id}`}
                  </h2>
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      STATUS_BADGE[selected.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selected.status}
                  </span>
                </div>

                {/* Route */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Route
                  </p>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Origin</p>
                      <p className="text-sm text-gray-700">{selected.originAddress}</p>
                    </div>
                  </div>
                  <div className="ml-1.5 pl-4 border-l border-dashed border-gray-300">
                    <ArrowRight size={12} className="text-gray-400" />
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Destination</p>
                      <p className="text-sm text-gray-700">{selected.destinationAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-medium">Driver ID</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {selected.driverId ?? "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-medium">Vehicle ID</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {selected.vehicleId ?? "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-medium">Est. Delivery</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {fmtDate(selected.estimatedDelivery)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-medium">Created At</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {fmtDate(selected.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Actual delivery */}
                {selected.actualDelivery && (
                  <div className="bg-green-50 rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <div>
                      <p className="text-xs text-green-600 font-medium">Delivered</p>
                      <p className="text-sm text-green-800 font-semibold">
                        {fmtDate(selected.actualDelivery)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
