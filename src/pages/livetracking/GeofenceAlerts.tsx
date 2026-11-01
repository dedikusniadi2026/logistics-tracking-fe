import { AlertTriangle, LogIn, LogOut, X } from "lucide-react";
import type { GeofenceAlert } from "../../types/livetracking";

interface Props {
  alerts: GeofenceAlert[];
  onDismiss: (id: string) => void;
}

export default function GeofenceAlerts({ alerts, onDismiss }: Props) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {alerts.slice(0, 5).map((a) => (
        <div key={a.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
            a.type === "ENTERED"
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : "bg-orange-50 border-orange-200 text-orange-800"
          }`}>
          {a.type === "ENTERED"
            ? <LogIn size={13} className="shrink-0" />
            : <LogOut size={13} className="shrink-0" />}
          <AlertTriangle size={13} className="shrink-0" />
          <span className="flex-1">
            <span className="font-bold">{a.vehicleId}</span>
            {" "}{a.type === "ENTERED" ? "entered" : "exited"} {a.zoneName}
          </span>
          <span className="text-[10px] opacity-60">
            {new Date(a.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button onClick={() => onDismiss(a.id)}
            className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={11} />
          </button>
        </div>
      ))}
    </div>
  );
}
