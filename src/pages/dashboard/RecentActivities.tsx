import { Package, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useShipments } from "../../hooks/useDashboard";
import { useMemo } from "react";

const STATUS_CFG: Record<string, { icon: React.ElementType; cls: string; bg: string }> = {
  PENDING:          { icon: Clock,        cls: "text-orange-500", bg: "bg-orange-50" },
  ASSIGNED:         { icon: Package,      cls: "text-blue-500",   bg: "bg-blue-50"   },
  PICKED_UP:        { icon: Truck,        cls: "text-purple-500", bg: "bg-purple-50" },
  IN_TRANSIT:       { icon: Truck,        cls: "text-cyan-500",   bg: "bg-cyan-50"   },
  OUT_FOR_DELIVERY: { icon: Truck,        cls: "text-indigo-500", bg: "bg-indigo-50" },
  DELIVERED:        { icon: CheckCircle2, cls: "text-green-500",  bg: "bg-green-50"  },
  CANCELLED:        { icon: XCircle,      cls: "text-red-500",    bg: "bg-red-50"    },
};

function fmt(iso?: string) {
  if (!iso) return "—";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1)   return "Just now";
  if (diff < 60)  return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function RecentActivities({ dark = false }: { dark?: boolean }) {
  const { data: shipments = [], isLoading } = useShipments();

  const activities = useMemo(() =>
    [...shipments]
      .sort((a, b) => new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() - new Date(a.updatedAt ?? a.createdAt ?? 0).getTime())
      .slice(0, 8),
    [shipments]
  );

  const cardBg  = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const textPri = dark ? "text-white" : "text-gray-900";
  const textSec = dark ? "text-gray-400" : "text-gray-500";
  const rowHov  = dark ? "hover:bg-gray-800" : "hover:bg-gray-50";

  return (
    <div className={`rounded-2xl shadow-sm border ${cardBg}`}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100/10">
        <h3 className={`text-sm font-semibold ${textPri}`}>Recent Activities</h3>
        <span className={`text-[11px] ${textSec}`}>{activities.length} recent</span>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`h-10 rounded-xl animate-pulse ${dark ? "bg-gray-800" : "bg-gray-100"}`} />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className={`text-sm text-center py-8 ${textSec}`}>No recent activity</p>
      ) : (
        <div className="divide-y divide-gray-100/10">
          {activities.map((s) => {
            const cfg = STATUS_CFG[s.status] ?? STATUS_CFG.PENDING;
            const Icon = cfg.icon;
            return (
              <div key={s.id} className={`flex items-center gap-3 px-4 py-2.5 ${rowHov} transition-colors`}>
                <div className={`w-7 h-7 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={13} className={cfg.cls} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${textPri}`}>
                    {s.shipmentNumber ?? `Shipment #${s.id}`}
                  </p>
                  <p className={`text-[10px] truncate ${textSec}`}>
                    {s.originAddress?.slice(0, 20)} → {s.destinationAddress?.slice(0, 20)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold ${cfg.bg} ${cfg.cls}`}>
                    {s.status.replace(/_/g, " ")}
                  </span>
                  <p className={`text-[10px] mt-0.5 ${textSec}`}>{fmt(s.updatedAt ?? s.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
