import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Server, Database, Wifi, WifiOff, CheckCircle2,
  AlertTriangle, Loader2, Activity,
} from "lucide-react";
import { useShipments } from "../../hooks/useDashboard";
import { useWsStore } from "../../store/wsStore";

const WS_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3002").replace(/\/+$/, "");

type SvcStatus = "online" | "checking" | "offline" | "error";

interface Service {
  label: string;
  icon: React.ElementType;
  status: SvcStatus;
  latency?: number;
}

function StatusDot({ status }: { status: SvcStatus }) {
  if (status === "online")   return <CheckCircle2 size={13} className="text-green-500" />;
  if (status === "checking") return <Loader2      size={13} className="text-yellow-500 animate-spin" />;
  if (status === "offline")  return <WifiOff      size={13} className="text-gray-400" />;
  return                            <AlertTriangle size={13} className="text-red-500" />;
}

function latencyColor(ms?: number) {
  if (!ms)     return "text-gray-400";
  if (ms < 100) return "text-green-600";
  if (ms < 500) return "text-yellow-600";
  return               "text-red-600";
}

export default function SystemStatus({ dark = false }: { dark?: boolean }) {
  const { isError: apiError } = useShipments();
  const wsStatus = useWsStore((s) => s.wsStatus);
  const setWsStatus = useWsStore((s) => s.setWsStatus);
  const [apiStatus, setApiStatus] = useState<SvcStatus>("checking");
  const [apiLatency, setApiLatency] = useState<number | undefined>();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  // Probe API
  useEffect(() => {
    const probe = async () => {
      const t0 = Date.now();
      try {
        await fetch(`${WS_URL}/api-json`, { method: "HEAD" });
        setApiStatus("online");
        setApiLatency(Date.now() - t0);
      } catch {
        setApiStatus(apiError ? "error" : "offline");
      }
    };
    probe();
    const id = setInterval(probe, 30000);
    return () => clearInterval(id);
  }, [apiError]);

  // WebSocket check
  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ["websocket"],
      auth: { token: localStorage.getItem("token") },
      reconnectionAttempts: 2,
      timeout: 4000,
    });
    socketRef.current = socket;

    socket.on("connect",       () => setWsStatus("online"));
    socket.on("disconnect",    () => setWsStatus("offline"));
    socket.on("connect_error", () => setWsStatus("offline"));

    const t = setTimeout(() => {
      if (!socket.connected) setWsStatus("offline");
    }, 5000);

    return () => {
      clearTimeout(t);
      socket.disconnect();
    };
  }, [setWsStatus]);

  const services: Service[] = [
    { label: "REST API",   icon: Server,   status: apiStatus, latency: apiLatency },
    { label: "Database",   icon: Database, status: apiStatus === "online" ? "online" : "offline" },
    { label: "WebSocket",  icon: Wifi,     status: wsStatus },
    { label: "Tracking",   icon: Activity, status: wsStatus === "online" ? "online" : "offline" },
  ];

  const allOk = services.every((s) => s.status === "online");

  const cardBg  = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const textPri = dark ? "text-white" : "text-gray-900";
  const textSec = dark ? "text-gray-500" : "text-gray-400";
  const rowBg   = dark ? "bg-gray-800" : "bg-gray-50";

  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${cardBg}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${allOk ? "bg-green-50" : "bg-red-50"}`}>
            <Activity size={15} className={allOk ? "text-green-600" : "text-red-500"} />
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${textPri}`}>System Status</h3>
            <p className={`text-[11px] ${allOk ? "text-green-500" : "text-red-500"}`}>
              {allOk ? "All systems operational" : "Degraded service"}
            </p>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${allOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {allOk ? "HEALTHY" : "ISSUES"}
        </span>
      </div>

      <div className="space-y-2">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <div key={svc.label} className={`flex items-center gap-3 ${rowBg} rounded-xl px-3 py-2`}>
              <Icon size={14} className={textSec} />
              <span className={`text-xs flex-1 font-medium ${textPri}`}>{svc.label}</span>
              <StatusDot status={svc.status} />
              {svc.latency != null && (
                <span className={`text-[10px] font-semibold ${latencyColor(svc.latency)}`}>
                  {svc.latency}ms
                </span>
              )}
              {svc.status === "online" && !svc.latency && (
                <span className="text-[10px] text-green-600 font-semibold">Online</span>
              )}
              {svc.status === "offline" && (
                <span className="text-[10px] text-gray-400 font-semibold">Offline</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
