import { X, MapPin, ArrowRight, Clock, CheckCircle2, Package, Truck } from "lucide-react";
import { useDeliveryHistory } from "../../hooks/useShipments";
import type { Shipment } from "../../api/shipments.api";

interface Props {
  shipment: Shipment;
  open: boolean;
  onClose: () => void;
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

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "DELIVERED":
      return <CheckCircle2 size={14} className="text-green-500" />;
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
      return <Truck size={14} className="text-blue-500" />;
    default:
      return <Package size={14} className="text-orange-500" />;
  }
}

function formatDate(val?: string) {
  if (!val) return "—";
  return new Date(val).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeTime(val?: string) {
  if (!val) return "";
  const diff = Date.now() - new Date(val).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

export default function ShipmentTrackingDialog({ shipment, open, onClose }: Props) {
  const { data: history = [], isLoading: histLoading } = useDeliveryHistory(
    open ? shipment.id : 0
  );

  if (!open) return null;

  const badgeCls = STATUS_BADGE[shipment.status] ?? "bg-gray-100 text-gray-600";
  const title = shipment.shipmentNumber ?? `Shipment #${shipment.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeCls}`}>
              {shipment.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Current Status */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Current Status
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex px-3 py-1.5 rounded-xl text-sm font-bold ${badgeCls}`}
              >
                {shipment.status}
              </span>
            </div>
          </div>

          {/* Route */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Route
            </p>
            <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
              <MapPin size={14} className="text-green-500 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-700 flex-1">{shipment.originAddress}</span>
              <ArrowRight size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <MapPin size={14} className="text-red-500 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-700 flex-1">{shipment.destinationAddress}</span>
            </div>
          </div>

          {/* Estimated Delivery */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Estimated Delivery
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock size={14} className="text-blue-500" />
              {formatDate(shipment.estimatedDelivery)}
            </div>
          </div>

          {/* Delivery History */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Delivery History
            </p>

            {histLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-gray-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
                      <div className="h-2.5 bg-gray-100 rounded animate-pulse w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-400">
                <Package size={28} className="mx-auto mb-2 text-gray-300" />
                Belum ada riwayat pengiriman
              </div>
            ) : (
              <ol className="relative border-l border-gray-200 ml-3 space-y-4">
                {history.map((h) => (
                  <li key={h.id} className="ml-4">
                    <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
                    <div className="flex items-start gap-2">
                      <StatusIcon status={h.status} />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{h.status}</p>
                        {h.description && (
                          <p className="text-xs text-gray-500">{h.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {h.createdAt ? relativeTime(h.createdAt) : ""}
                          {h.createdAt ? ` · ${formatDate(h.createdAt)}` : ""}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
