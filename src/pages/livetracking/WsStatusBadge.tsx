import { Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react";
import type { WsStatus } from "../../types/livetracking";

interface Props { status: WsStatus }

const cfg: Record<WsStatus, { icon: React.ReactNode; label: string; cls: string }> = {
  connected:    { icon: <Wifi size={12} />,         label: "WS Connected",    cls: "bg-green-100 text-green-700" },
  connecting:   { icon: <Loader2 size={12} className="animate-spin" />, label: "Connecting…", cls: "bg-yellow-100 text-yellow-700" },
  disconnected: { icon: <WifiOff size={12} />,      label: "WS Offline",      cls: "bg-gray-100 text-gray-500" },
  error:        { icon: <AlertTriangle size={12} />, label: "WS Error",        cls: "bg-red-100 text-red-600" },
};

export default function WsStatusBadge({ status }: Props) {
  const c = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.cls}`}>
      {c.icon}{c.label}
    </span>
  );
}
