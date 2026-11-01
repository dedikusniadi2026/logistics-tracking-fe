import { useState, useEffect } from "react";
import { Moon, Sun, Wifi, WifiOff, Activity, AlertTriangle, Plus, Truck, User } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useWsStore, type WsConnectedState } from "../../store/wsStore";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const WS_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3002").replace(/\/+$/, "");

type SysState = "healthy" | "issue" | "checking";

interface Props {
  dark: boolean;
  onToggleDark: () => void;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function mapWsDisplay(status: WsConnectedState): "connected" | "disconnected" | "checking" {
  switch (status) {
    case "online": return "connected";
    case "offline":
    case "error": return "disconnected";
    default: return "checking";
  }
}

export default function DashboardHeader({ dark, onToggleDark }: Props) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const now = useClock();
  const wsStatus = useWsStore((s) => s.wsStatus);
  const setWsStatus = useWsStore((s) => s.setWsStatus);
  const wsDisplay = mapWsDisplay(wsStatus);

  const [sysState, setSysState] = useState<SysState>("checking");

  // WebSocket probe
  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ["websocket"],
      auth: { token: localStorage.getItem("token") },
      reconnectionAttempts: 2,
      timeout: 4000,
    });

    socket.on("connect",       () => { setWsStatus("online");   setSysState("healthy"); });
    socket.on("disconnect",    () => setWsStatus("offline"));
    socket.on("connect_error", () => { setWsStatus("offline");  setSysState("healthy"); });

    const t = setTimeout(() => {
      if (!socket.connected) { setWsStatus("offline"); setSysState("healthy"); }
    }, 5000);

    return () => {
      clearTimeout(t);
      socket.disconnect();
    };
  }, [setWsStatus]);

  const name = user?.name ?? "Admin";
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const bg    = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const txt   = dark ? "text-white" : "text-gray-900";
  const sub   = dark ? "text-gray-400" : "text-gray-500";
  const chip  = dark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200";

  return (
    <div className={`rounded-2xl px-5 py-4 shadow-sm border ${bg} mb-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">

        {/* LEFT: Greeting */}
        <div>
          <p className={`text-xs font-medium ${sub}`}>{greeting()},</p>
          <h2 className={`text-xl font-bold leading-tight ${txt}`}>{name}</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>{dateStr} · {timeStr}</p>
        </div>

        {/* RIGHT: Status chips + quick actions + dark toggle */}
        <div className="flex items-center flex-wrap gap-2">
          {/* System Status */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${chip} ${sysState === "healthy" ? "text-green-600" : sysState === "issue" ? "text-red-500" : "text-yellow-600"}`}>
            {sysState === "healthy" ? <Activity size={12} /> : <AlertTriangle size={12} />}
            {sysState === "checking" ? "Checking…" : sysState === "healthy" ? "Healthy" : "Issue Detected"}
          </div>

          {/* WebSocket Status */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${chip} ${wsDisplay === "connected" ? "text-green-600" : wsDisplay === "disconnected" ? "text-gray-400" : "text-yellow-600"}`}>
            {wsDisplay === "connected" ? <Wifi size={12} /> : <WifiOff size={12} />}
            WS {wsDisplay === "checking" ? "…" : wsDisplay === "connected" ? "Connected" : "Offline"}
          </div>

          {/* Quick Actions */}
          <button onClick={() => navigate("/shipments")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            <Plus size={12} /> New Shipment
          </button>
          <button onClick={() => navigate("/drivers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold rounded-xl transition-colors ${chip} ${dark ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"}`}>
            <User size={12} /> Add Driver
          </button>
          <button onClick={() => navigate("/vehicles")}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold rounded-xl transition-colors ${chip} ${dark ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"}`}>
            <Truck size={12} /> Add Vehicle
          </button>

          {/* Dark toggle */}
          <button onClick={onToggleDark}
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${
              dark ? "bg-blue-600 border-blue-500 text-white" : `${chip} text-gray-600 hover:bg-gray-100`
            }`}
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
