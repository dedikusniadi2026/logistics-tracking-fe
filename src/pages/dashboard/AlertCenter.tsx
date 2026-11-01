import { AlertTriangle, CheckCircle2, Info, XCircle, Bell, Wifi } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { shipmentsApi } from "../../api/shipments.api";
import { useMemo } from "react";

type AlertLevel = "critical" | "warning" | "info" | "success";

interface DashAlert {
  id: string;
  level: AlertLevel;
  message: string;
  detail: string;
  time: string;
}

const LEVEL_CFG: Record<AlertLevel, {
  icon: React.ElementType;
  iconCls: string;
  bg: string;
  border: string;
  label: string;
}> = {
  critical: { icon: XCircle,       iconCls: "text-red-500",    bg: "bg-red-50",     border: "border-red-100",    label: "Critical" },
  warning:  { icon: AlertTriangle, iconCls: "text-orange-500", bg: "bg-orange-50",  border: "border-orange-100", label: "Warning"  },
  info:     { icon: Info,          iconCls: "text-blue-500",   bg: "bg-blue-50",    border: "border-blue-100",   label: "Info"     },
  success:  { icon: CheckCircle2,  iconCls: "text-green-600",  bg: "bg-green-50",   border: "border-green-100",  label: "OK"       },
};

const BADGE: Record<AlertLevel, string> = {
  critical: "bg-red-100 text-red-700",
  warning:  "bg-orange-100 text-orange-700",
  info:     "bg-blue-100 text-blue-700",
  success:  "bg-green-100 text-green-700",
};

function fmt(iso?: string) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1)  return "just now";
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

export default function AlertCenter({ dark = false }: { dark?: boolean }) {
  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["shipments"],
    queryFn: shipmentsApi,
    refetchInterval: 30_000,
  });

  const alerts = useMemo<DashAlert[]>(() => {
    const list: DashAlert[] = [];
    shipments.forEach((s) => {
      const id = s.shipmentNumber ?? `#${s.id}`;
      if (s.status === "CANCELLED") {
        list.push({ id: `cancel-${s.id}`, level: "critical", message: "Shipment Cancelled", detail: id, time: fmt(s.updatedAt) });
      } else if (s.status === "DELIVERED") {
        list.push({ id: `del-${s.id}`, level: "success", message: "Shipment Delivered", detail: id, time: fmt(s.updatedAt) });
      } else if (s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY") {
        list.push({ id: `transit-${s.id}`, level: "info", message: "In Transit", detail: id, time: fmt(s.updatedAt) });
      } else if (s.status === "PICKED_UP") {
        list.push({ id: `pickup-${s.id}`, level: "info", message: "Picked Up", detail: id, time: fmt(s.updatedAt) });
      } else if (s.status === "PENDING" || s.status === "ASSIGNED") {
        list.push({ id: `pend-${s.id}`, level: "warning", message: "Awaiting Dispatch", detail: id, time: fmt(s.createdAt) });
      }
    });
    // Sort: critical first, then by recency
    const order: AlertLevel[] = ["critical", "warning", "info", "success"];
    return list.sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level)).slice(0, 8);
  }, [shipments]);

  const criticalCount = alerts.filter((a) => a.level === "critical").length;
  const bg    = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const txt   = dark ? "text-white" : "text-gray-900";
  const sub   = dark ? "text-gray-500" : "text-gray-400";
  const rowHov = dark ? "hover:bg-gray-800/60" : "hover:bg-gray-50/80";

  return (
    <div className={`rounded-2xl shadow-sm border flex flex-col ${bg}`}>
      {/* ── Header ── */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${dark ? "border-gray-800" : "border-gray-100"}`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${criticalCount > 0 ? "bg-red-50" : "bg-gray-50"}`}>
            <Bell size={14} className={criticalCount > 0 ? "text-red-500" : "text-gray-400"} />
          </div>
          <h3 className={`text-sm font-semibold ${txt}`}>Alert Center</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {criticalCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
              {criticalCount} critical
            </span>
          )}
          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${dark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
            {alerts.length} total
          </span>
        </div>
      </div>

      {/* ── Alert List ── */}
      <div className="overflow-y-auto" style={{ maxHeight: 600 }}>
        {isLoading && (
          <div className="px-4 py-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-12 rounded-xl animate-pulse ${dark ? "bg-gray-800" : "bg-gray-100"}`} />
            ))}
          </div>
        )}

        {!isLoading && alerts.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-10 gap-2 ${sub}`}>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-500" />
            </div>
            <p className="text-xs font-medium">All systems operational</p>
            <p className={`text-[10px] ${sub}`}>No active alerts</p>
          </div>
        )}

        {!isLoading && alerts.map((a, idx) => {
          const cfg = LEVEL_CFG[a.level];
          const Icon = cfg.icon;
          const isLast = idx === alerts.length - 1;
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${rowHov} ${
                !isLast ? (dark ? "border-b border-gray-800/60" : "border-b border-gray-50") : ""
              }`}
            >
              {/* Icon */}
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <Icon size={13} className={cfg.iconCls} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-semibold ${txt}`}>{a.message}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${BADGE[a.level]}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className={`text-[10px] truncate ${sub}`}>{a.detail}</p>
              </div>

              {/* Time */}
              <p className={`text-[10px] shrink-0 ${sub}`}>{a.time}</p>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      {!isLoading && alerts.length > 0 && (
        <div className={`px-4 py-2.5 border-t flex items-center justify-between ${dark ? "border-gray-800" : "border-gray-100"}`}>
          <div className={`flex items-center gap-1 text-[10px] ${sub}`}>
            <Wifi size={10} />
            <span>Live — updates every 30s</span>
          </div>
          <span className={`text-[10px] font-semibold text-blue-500`}>View all →</span>
        </div>
      )}
    </div>
  );
}
