import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-toastify";
import { Zap, Plus, Trash2, Loader2, Route, Clock, Fuel, CheckCircle2, ArrowRight } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import { optimizeRouteApi, autoDispatchApi, type OptimizeRouteResult } from "../../api/route-optimization.api";
import { useShipments } from "../../hooks/useShipments";

const cls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400";
const lbl = "block text-xs font-medium text-gray-600 mb-1";

// ── Optimize Route Form ──────────────────────────────────────────────────
type OptFormValues = {
  originLat: string;
  originLng: string;
  optimizeFor: "distance" | "time" | "fuel";
  driverId: string;
  destinations: { lat: string; lng: string }[];
};

function OptimizeForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizeRouteResult | null>(null);

  const { register, control, handleSubmit, formState: { errors } } = useForm<OptFormValues>({
    defaultValues: {
      originLat: "-6.2088", originLng: "106.8456",
      optimizeFor: "distance", driverId: "",
      destinations: [{ lat: "", lng: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "destinations" });

  const onSubmit = async (v: OptFormValues) => {
    const validDest = v.destinations.filter(d => d.lat && d.lng);
    if (validDest.length === 0) { toast.error("Add at least one destination"); return; }
    setLoading(true);
    try {
      const res = await optimizeRouteApi({
        origin: { latitude: parseFloat(v.originLat), longitude: parseFloat(v.originLng) },
        destinations: validDest.map(d => ({ latitude: parseFloat(d.lat), longitude: parseFloat(d.lng) })),
        optimizeFor: v.optimizeFor,
        ...(v.driverId ? { driverId: Number(v.driverId) } : {}),
      });
      setResult(res);
      toast.success("Route optimized!");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === "string" ? msg : "Route optimization failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Origin */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">📍 Origin (Depot / Warehouse)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Latitude <span className="text-red-500">*</span></label>
              <input {...register("originLat", { required: "Required" })} placeholder="-6.2088" className={cls} />
              {errors.originLat && <p className="text-xs text-red-500 mt-1">{errors.originLat.message}</p>}
            </div>
            <div>
              <label className={lbl}>Longitude <span className="text-red-500">*</span></label>
              <input {...register("originLng", { required: "Required" })} placeholder="106.8456" className={cls} />
              {errors.originLng && <p className="text-xs text-red-500 mt-1">{errors.originLng.message}</p>}
            </div>
          </div>
        </div>

        {/* Destinations */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">🎯 Destinations</p>
            <button type="button" onClick={() => append({ lat: "", lng: "" })}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
              <Plus size={12} /> Add Destination
            </button>
          </div>
          <div className="space-y-2">
            {fields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-5 shrink-0">{i + 1}.</span>
                <input {...register(`destinations.${i}.lat`)} placeholder="Lat" className={`${cls} flex-1`} />
                <input {...register(`destinations.${i}.lng`)} placeholder="Lng" className={`${cls} flex-1`} />
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(i)}
                    className="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg shrink-0">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Optimize For</label>
            <select {...register("optimizeFor")} className={`${cls} bg-white`}>
              <option value="distance">📏 Distance</option>
              <option value="time">⏱️ Time</option>
              <option value="fuel">⛽ Fuel</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Driver ID (optional)</label>
            <input {...register("driverId")} type="number" placeholder="e.g. 1" className={cls} />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
          {loading ? "Optimizing..." : "Optimize Route"}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-600" />
            <p className="text-sm font-bold text-green-800">Route Optimized Successfully</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {result.totalDistance != null && (
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <Route size={16} className="mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-bold text-gray-900">{Number(result.totalDistance).toFixed(1)}<span className="text-xs font-medium ml-0.5">km</span></p>
                <p className="text-[10px] text-gray-400">Total Distance</p>
              </div>
            )}
            {result.estimatedTime != null && (
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <Clock size={16} className="mx-auto mb-1 text-purple-500" />
                <p className="text-lg font-bold text-gray-900">{result.estimatedTime}<span className="text-xs font-medium ml-0.5">min</span></p>
                <p className="text-[10px] text-gray-400">Est. Time</p>
              </div>
            )}
            {result.fuelEstimate != null && (
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <Fuel size={16} className="mx-auto mb-1 text-orange-500" />
                <p className="text-lg font-bold text-gray-900">{Number(result.fuelEstimate).toFixed(1)}<span className="text-xs font-medium ml-0.5">L</span></p>
                <p className="text-[10px] text-gray-400">Fuel Est.</p>
              </div>
            )}
          </div>
          {Array.isArray(result.orderedRoute) && result.orderedRoute.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-700 mb-2">Optimized Waypoints</p>
              <ol className="space-y-1">
                {result.orderedRoute.map((pt, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-green-800">
                    <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center font-bold text-[10px]">{i + 1}</span>
                    {pt.label ?? `(${pt.latitude?.toFixed(4)}, ${pt.longitude?.toFixed(4)})`}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {result.savings != null && (
            <p className="text-xs text-green-700 font-medium">💚 Estimated savings: {result.savings}%</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Auto Dispatch Form ────────────────────────────────────────────────────
function AutoDispatchForm() {
  const { data: shipments = [], isLoading } = useShipments();
  const pendingShipments = shipments.filter(s => s.status === "PENDING" || s.status === "ASSIGNED");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [strategy, setStrategy] = useState<"nearest" | "balanced" | "priority">("nearest");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  const toggle = (id: number) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleDispatch = async () => {
    if (selectedIds.length === 0) { toast.error("Select at least one shipment"); return; }
    setLoading(true);
    try {
      const res = await autoDispatchApi({ shipmentIds: selectedIds, strategy });
      setResult(res);
      toast.success("Auto-dispatch completed!");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === "string" ? msg : "Auto-dispatch failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {/* Strategy */}
      <div>
        <label className={lbl}>Dispatch Strategy</label>
        <select value={strategy} onChange={e => setStrategy(e.target.value as typeof strategy)} className={`${cls} bg-white`}>
          <option value="nearest">📍 Nearest Driver</option>
          <option value="balanced">⚖️ Balanced Load</option>
          <option value="priority">🔴 Priority First</option>
        </select>
      </div>

      {/* Shipment selection */}
      <div>
        <label className={lbl}>Select Shipments to Dispatch</label>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-4"><Loader2 size={14} className="animate-spin" /> Loading...</div>
        ) : pendingShipments.length === 0 ? (
          <p className="text-sm text-gray-400 bg-gray-50 rounded-xl p-4 text-center">No pending shipments available</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-2">
            {pendingShipments.map(s => (
              <label key={s.id} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selectedIds.includes(s.id) ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggle(s.id)}
                  className="mt-0.5 accent-blue-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">{s.shipmentNumber ?? `#${s.id}`}</p>
                  <p className="text-[11px] text-gray-500 truncate">{s.originAddress}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <ArrowRight size={10} className="text-gray-400" />
                    <p className="text-[11px] text-gray-500 truncate">{s.destinationAddress}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold shrink-0">{s.status}</span>
              </label>
            ))}
          </div>
        )}
        {selectedIds.length > 0 && (
          <p className="text-xs text-blue-600 font-medium mt-1">{selectedIds.length} shipment(s) selected</p>
        )}
      </div>

      <button onClick={handleDispatch} disabled={loading || selectedIds.length === 0}
        className="w-full py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2">
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
        {loading ? "Dispatching..." : "Auto Dispatch"}
      </button>

      {result != null && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-green-600" />
            <p className="text-sm font-bold text-green-800">Dispatch Completed</p>
          </div>
          <pre className="text-xs text-green-800 bg-green-100 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function RouteOptimization() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Route Optimization</h1>
          <p className="text-xs text-gray-400 mt-0.5">AI-powered route planning & auto-dispatch system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><Zap size={16} className="text-blue-600" /></div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">AI Route Optimizer</h2>
                <p className="text-xs text-gray-400">Optimize multi-stop delivery routes</p>
              </div>
            </div>
            <OptimizeForm />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><Route size={16} className="text-green-600" /></div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Auto Dispatch</h2>
                <p className="text-xs text-gray-400">Automatically assign drivers to shipments</p>
              </div>
            </div>
            <AutoDispatchForm />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
