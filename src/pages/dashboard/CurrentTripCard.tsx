import { Clock, ArrowUpRight, MapPin, Gauge, Navigation, CheckCircle2 } from "lucide-react";
import { useShipments } from "../../hooks/useDashboard";

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function shorten(addr: string, max = 30) {
  return addr.length > max ? addr.slice(0, max) + "…" : addr;
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function CurrentTripCard({ dark = false }: { dark?: boolean }) {
  const { data: shipments, isLoading } = useShipments();

  const active = shipments?.find((s) =>
    ["IN_TRANSIT", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(s.status)
  );

  const totalDist = active
    ? haversine(
        Number(active.originLatitude), Number(active.originLongitude),
        Number(active.destinationLatitude), Number(active.destinationLongitude)
      )
    : 0;

  // Mock: assume current position = origin (no real GPS without IoT)
  const remainingDist = totalDist; // in real system subtract travelled
  const progress = totalDist > 0 ? Math.max(0, Math.min(95, Math.round((1 - remainingDist / totalDist) * 100))) : 0;
  // ETA based on mock 60 km/h avg
  const etaMin = totalDist > 0 ? Math.round((remainingDist / 60) * 60) : 0;
  const etaLabel = etaMin < 60 ? `${etaMin} min` : `${Math.floor(etaMin / 60)}h ${etaMin % 60}m`;

  const cardBg  = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const textPri = dark ? "text-white" : "text-gray-900";
  const textSec = dark ? "text-gray-400" : "text-gray-500";
  const sectBg  = dark ? "bg-gray-800" : "bg-blue-50";
  const metaBg  = dark ? "bg-gray-800" : "bg-gray-50";

  if (isLoading) return <div className={`rounded-2xl p-5 shadow-sm border h-full ${cardBg}`}><div className={`h-6 w-32 rounded animate-pulse mb-3 ${dark ? "bg-gray-800" : "bg-gray-100"}`} /></div>;

  return (
    <div className={`rounded-2xl p-5 shadow-sm border h-full flex flex-col ${cardBg}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-base font-semibold ${textPri}`}>Current Trip</h3>
        <button className={`w-6 h-6 rounded-full border flex items-center justify-center ${dark ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"}`}>
          <ArrowUpRight size={12} className={dark ? "text-gray-500" : "text-gray-400"} />
        </button>
      </div>

      {!active ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400">
          <CheckCircle2 size={28} className="opacity-30" />
          <p className="text-sm">No active trip</p>
        </div>
      ) : (
        <>
          {/* Shipment ID */}
          <p className={`text-[11px] font-mono font-semibold ${textSec} mb-3`}>
            {active.shipmentNumber ?? `#${active.id}`}
          </p>

          {/* Route Timeline */}
          <div className="space-y-0 mb-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white mt-0.5" />
                <div className={`w-px flex-1 my-1 ${dark ? "bg-gray-700" : "bg-gray-200"}`} />
              </div>
              <div className="pb-3">
                <p className={`text-[10px] uppercase tracking-wider leading-none mb-1 ${textSec}`}>Origin</p>
                <p className={`text-sm font-semibold ${textPri}`}>{shorten(active.originAddress)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                <MapPin size={13} className={dark ? "text-gray-400" : "text-gray-800"} />
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-wider leading-none mb-1 ${textSec}`}>Destination</p>
                <p className={`text-sm font-semibold ${textPri}`}>{shorten(active.destinationAddress)}</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className={`${sectBg} rounded-xl p-3 mb-3`}>
            <div className="flex justify-between text-[10px] mb-1.5">
              <span className={textSec}>Progress</span>
              <span className="text-blue-500 font-bold">{progress}%</span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${dark ? "bg-gray-700" : "bg-blue-100"}`}>
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* ETA + Distance + Speed */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: <Clock size={12} className="text-blue-500" />, label: "ETA", value: etaLabel },
              { icon: <Navigation size={12} className="text-green-500" />, label: "Distance", value: `${totalDist.toFixed(1)} km` },
              { icon: <Gauge size={12} className="text-purple-500" />, label: "Avg Speed", value: "60 km/h" },
            ].map((m) => (
              <div key={m.label} className={`${metaBg} rounded-xl p-2 text-center`}>
                <div className="flex justify-center mb-0.5">{m.icon}</div>
                <p className={`text-xs font-bold ${textPri}`}>{m.value}</p>
                <p className={`text-[10px] ${textSec}`}>{m.label}</p>
              </div>
            ))}
          </div>

          {/* ETA datetime */}
          <button className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${
            dark ? "bg-blue-900/50 text-blue-400 hover:bg-blue-900" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          } transition-colors`}>
            <Clock size={13} />
            Est. Arrival: {fmtDate(active.estimatedDelivery)}
          </button>
        </>
      )}
    </div>
  );
}
