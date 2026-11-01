import { useState } from "react";
import { toast } from "react-toastify";
import { ShieldAlert, ShieldCheck, AlertTriangle, Search, X, Loader2 } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import { useFraudSummary, useFraudAlerts, useResolveFraudAlert } from "../../hooks/useFraud";
import { analyzeFraudApi } from "../../api/fraud.api";
import type { FraudAlert, ResolveStatus } from "../../api/fraud.api";

const SEVERITY_BADGE: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-green-100 text-green-700",
};
const STATUS_BADGE: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  RESOLVED: "bg-green-100 text-green-700",
  FALSE_POSITIVE: "bg-gray-100 text-gray-500",
  INVESTIGATED: "bg-blue-100 text-blue-700",
};

function AnalyzeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [shipmentId, setShipmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  const handleAnalyze = async () => {
    if (!shipmentId) { toast.error("Enter a shipment ID"); return; }
    setLoading(true);
    try {
      const res = await analyzeFraudApi(Number(shipmentId));
      setResult(res);
    } catch { toast.error("Analysis failed"); }
    finally { setLoading(false); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Analyze Shipment for Fraud</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={15} className="text-gray-500" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Shipment ID</label>
            <input value={shipmentId} onChange={e => { setShipmentId(e.target.value); setResult(null); }}
              type="number" placeholder="e.g. 1"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={handleAnalyze} disabled={loading || !shipmentId}
            className="w-full py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>
          {result != null && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">Analysis Result</p>
              <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResolveMenu({ alert, onResolve }: { alert: FraudAlert; onResolve: (status: ResolveStatus) => void }) {
  const [open, setOpen] = useState(false);
  const options: { value: ResolveStatus; label: string }[] = [
    { value: "RESOLVED", label: "✅ Mark Resolved" },
    { value: "FALSE_POSITIVE", label: "🔕 False Positive" },
    { value: "INVESTIGATED", label: "🔍 Mark Investigated" },
  ];
  if (alert.status !== "OPEN") return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[alert.status]}`}>{alert.status.replace("_", " ")}</span>;
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">Resolve ▾</button>
      {open && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-40 overflow-hidden">
          {options.map(o => (
            <button key={o.value} onClick={() => { onResolve(o.value); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors">{o.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Fraud() {
  const { data: summary } = useFraudSummary();
  const { data: alerts = [], isLoading } = useFraudAlerts();
  const resolveMut = useResolveFraudAlert();
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = alerts.filter(a =>
    (a.rule ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (a.severity ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (a.status ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleResolve = async (alert: FraudAlert, status: ResolveStatus) => {
    try {
      await resolveMut.mutateAsync({ id: alert.id, status });
      toast.success(`Alert #${alert.id} marked as ${status}`);
    } catch { toast.error("Failed to resolve alert"); }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-lg font-bold text-gray-900">Fraud Detection</h1><p className="text-xs text-gray-400 mt-0.5">AI-powered anomaly & fraud monitoring</p></div>
          <button onClick={() => setAnalyzeOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
            <ShieldAlert size={14} /> Analyze Shipment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Alerts", value: summary?.total ?? 0, color: "text-gray-900", bg: "bg-gray-50", icon: <ShieldAlert size={16} className="text-gray-500" /> },
            { label: "Open", value: summary?.open ?? 0, color: "text-red-700", bg: "bg-red-50", icon: <AlertTriangle size={16} className="text-red-500" /> },
            { label: "Critical", value: summary?.critical ?? 0, color: "text-red-800", bg: "bg-red-100", icon: <ShieldAlert size={16} className="text-red-700" /> },
            { label: "High", value: summary?.high ?? 0, color: "text-orange-700", bg: "bg-orange-50", icon: <AlertTriangle size={16} className="text-orange-500" /> },
          ].map(c => (
            <div key={c.label} className={`rounded-2xl p-4 shadow-sm border border-gray-100 ${c.bg}`}>
              <div className="flex items-center gap-2 mb-1">{c.icon}<p className="text-xs text-gray-500 font-medium">{c.label}</p></div>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* By Rule */}
        {summary && summary.byRule.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Alerts by Rule</h3>
            <div className="space-y-2">
              {summary.byRule.map(r => (
                <div key={r.rule} className="flex items-center gap-3">
                  <p className="text-xs text-gray-600 w-40 truncate">{r.rule}</p>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(100, (r.count / (summary.total || 1)) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-6 text-right">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Fraud Alerts</p>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts..."
                className="pl-8 pr-4 py-1.5 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 placeholder:text-gray-400" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["#", "Rule", "Severity", "Status", "Shipment", "Description", "Created", "Action"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading && Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ShieldCheck size={32} className="opacity-30" />
                      <p className="text-sm">{search ? "No alerts match" : "No fraud alerts detected 🎉"}</p>
                    </div>
                  </td></tr>
                )}
                {!isLoading && filtered.map(alert => (
                  <tr key={alert.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-400">#{alert.id}</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-800 max-w-32 truncate">{alert.rule}</td>
                    <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${SEVERITY_BADGE[alert.severity]}`}>{alert.severity}</span></td>
                    <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[alert.status]}`}>{alert.status.replace("_", " ")}</span></td>
                    <td className="px-5 py-3 text-sm text-gray-500">{alert.shipmentId ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-gray-500 max-w-40 truncate">{alert.description ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">{alert.createdAt ? new Date(alert.createdAt).toLocaleDateString("id-ID") : "—"}</td>
                    <td className="px-5 py-3"><ResolveMenu alert={alert} onResolve={status => handleResolve(alert, status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AnalyzeDialog open={analyzeOpen} onClose={() => setAnalyzeOpen(false)} />
    </MainLayout>
  );
}
