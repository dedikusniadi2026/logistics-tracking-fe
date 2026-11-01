import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Target, CheckCircle2, AlertTriangle, XCircle, Plus, X, Loader2 } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import { useSlaDashboard, useSlaPolicies, useCreateSlaPolicy } from "../../hooks/useSla";
import type { SlaShipment, CreateSlaPolicyPayload } from "../../api/sla.api";

type SlaTab = "on_time" | "warning" | "breached";

function SlaBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    ON_TIME: "bg-green-100 text-green-700",
    WARNING: "bg-yellow-100 text-yellow-700",
    BREACHED: "bg-red-100 text-red-700",
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg[status] ?? "bg-gray-100 text-gray-500"}`}>{status.replace("_", " ")}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    PENDING: "bg-orange-100 text-orange-700",
    ASSIGNED: "bg-blue-100 text-blue-700",
    PICKED_UP: "bg-purple-100 text-purple-700",
    IN_TRANSIT: "bg-blue-100 text-blue-700",
    OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${cfg[status] ?? "bg-gray-100 text-gray-500"}`}>{status}</span>;
}

function ShipmentTable({ items }: { items: SlaShipment[] }) {
  if (items.length === 0) return <p className="text-center text-sm text-gray-400 py-8">No shipments in this category</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {["Shipment No", "Status", "SLA Status", "Elapsed (h)", "Remaining (h)", "Progress", "Est. Delivery"].map(h => (
              <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(s => {
            const pct = Math.max(0, Math.min(100, s.percentElapsed));
            const barColor = s.slaStatus === "BREACHED" ? "bg-red-500" : s.slaStatus === "WARNING" ? "bg-yellow-400" : "bg-green-500";
            return (
              <tr key={s.shipmentId} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.shipmentNumber}</td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3"><SlaBadge status={s.slaStatus} /></td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.elapsedHours.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.remainingHours.toFixed(1)}</td>
                <td className="px-4 py-3 w-32">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{pct.toFixed(0)}%</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PolicyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMut = useCreateSlaPolicy();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateSlaPolicyPayload>();

  const onValid = async (data: CreateSlaPolicyPayload) => {
    try {
      await createMut.mutateAsync({ ...data, maxDeliveryHours: Number(data.maxDeliveryHours), warningThresholdPercent: data.warningThresholdPercent ? Number(data.warningThresholdPercent) : undefined });
      toast.success("SLA Policy created");
      reset(); onClose();
    } catch { toast.error("Failed to create policy"); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Add SLA Policy</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={15} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit(onValid)} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Policy Name <span className="text-red-500">*</span></label>
            <input {...register("name", { required: "Required" })} placeholder="Express" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Delivery Hours <span className="text-red-500">*</span></label>
            <input {...register("maxDeliveryHours", { required: "Required" })} type="number" placeholder="24" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.maxDeliveryHours && <p className="text-xs text-red-500 mt-1">{errors.maxDeliveryHours.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Warning Threshold % <span className="text-gray-400">(optional)</span></label>
            <input {...register("warningThresholdPercent")} type="number" placeholder="80" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createMut.isPending} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {createMut.isPending && <Loader2 size={13} className="animate-spin" />} Add Policy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Sla() {
  const { data: dashboard, isLoading } = useSlaDashboard();
  const { data: policies = [] } = useSlaPolicies();
  const [tab, setTab] = useState<SlaTab>("on_time");
  const [policyOpen, setPolicyOpen] = useState(false);

  const summary = dashboard?.summary;
  const breachRate = summary?.breachRate ?? 0;

  const tabItems: { key: SlaTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "on_time", label: "On Time", icon: <CheckCircle2 size={13} />, count: summary?.onTime ?? 0 },
    { key: "warning", label: "Warning", icon: <AlertTriangle size={13} />, count: summary?.warning ?? 0 },
    { key: "breached", label: "Breached", icon: <XCircle size={13} />, count: summary?.breached ?? 0 },
  ];

  const tabData = {
    on_time: dashboard?.onTime ?? [],
    warning: dashboard?.warning ?? [],
    breached: dashboard?.breached ?? [],
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div><h1 className="text-lg font-bold text-gray-900">SLA Monitoring</h1><p className="text-xs text-gray-400 mt-0.5">Service Level Agreement tracking</p></div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: "Total", value: summary?.total ?? 0, color: "text-gray-900", bg: "bg-gray-50", icon: <Target size={16} className="text-gray-500" /> },
              { label: "On Time", value: summary?.onTime ?? 0, color: "text-green-700", bg: "bg-green-50", icon: <CheckCircle2 size={16} className="text-green-500" /> },
              { label: "Warning", value: summary?.warning ?? 0, color: "text-yellow-700", bg: "bg-yellow-50", icon: <AlertTriangle size={16} className="text-yellow-500" /> },
              { label: "Breached", value: summary?.breached ?? 0, color: "text-red-700", bg: "bg-red-50", icon: <XCircle size={16} className="text-red-500" /> },
              { label: "Breach Rate", value: `${breachRate}%`, color: "text-orange-700", bg: "bg-orange-50", icon: <Target size={16} className="text-orange-500" /> },
            ].map(c => (
              <div key={c.label} className={`rounded-2xl p-4 shadow-sm border border-gray-100 ${c.bg}`}>
                <div className="flex items-center gap-2 mb-1">{c.icon}<p className="text-xs text-gray-500 font-medium">{c.label}</p></div>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Breach rate bar */}
        {!isLoading && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600">SLA Breach Rate</p>
              <p className="text-xs text-gray-500">{dashboard?.policy?.name ?? "Default"} — Max {dashboard?.policy?.maxDeliveryHours}h</p>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${breachRate > 20 ? "bg-red-500" : breachRate > 10 ? "bg-yellow-400" : "bg-green-500"}`} style={{ width: `${Math.min(100, breachRate)}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{breachRate}% breach rate</p>
          </div>
        )}

        {/* Shipments tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100 px-4 pt-3">
            {tabItems.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors mr-1 ${tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                {t.icon} {t.label}
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{t.count}</span>
              </button>
            ))}
          </div>
          <div className="p-2">
            {isLoading ? (
              <div className="space-y-2 p-3">{[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : (
              <ShipmentTable items={tabData[tab]} />
            )}
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">SLA Policies</h3>
            <button onClick={() => setPolicyOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <Plus size={13} /> Add Policy
            </button>
          </div>
          {policies.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No SLA policies defined</p>
          ) : (
            <div className="space-y-2">
              {policies.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">Max {p.maxDeliveryHours}h delivery{p.warningThresholdPercent ? ` • Warning at ${p.warningThresholdPercent}%` : ""}</p>
                  </div>
                  <Target size={16} className="text-blue-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <PolicyDialog open={policyOpen} onClose={() => setPolicyOpen(false)} />
    </MainLayout>
  );
}
