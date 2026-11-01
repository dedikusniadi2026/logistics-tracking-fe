import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Cpu, Wifi, WifiOff, Plus, X, Loader2, Signal, Battery, MapPin } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import Pagination from "../../components/common/Pagination";
import { useIotDevices, useIotFleet, useRegisterIotDevice, useSubmitTelemetry } from "../../hooks/useIot";
import type { IotTelemetryPayload } from "../../api/iot.api";

const cls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400";
const lbl = "block text-xs font-medium text-gray-600 mb-1";

function RegisterDeviceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const registerMut = useRegisterIotDevice();
  type FormFields = {
    deviceId: string; imei: string;
    vehicleId: string; driverId: string;
    firmwareVersion: string; reportIntervalSecs: string;
  };
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormFields>();

  const onValid = async (v: FormFields) => {
    try {
      await registerMut.mutateAsync({
        deviceId: v.deviceId, imei: v.imei,
        ...(v.vehicleId ? { vehicleId: Number(v.vehicleId) } : {}),
        ...(v.driverId ? { driverId: Number(v.driverId) } : {}),
        ...(v.firmwareVersion ? { firmwareVersion: v.firmwareVersion } : {}),
        ...(v.reportIntervalSecs ? { reportIntervalSecs: Number(v.reportIntervalSecs) } : {}),
      });
      toast.success("IoT device registered");
      reset(); onClose();
    } catch { toast.error("Failed to register device"); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Register IoT Device</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={15} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit(onValid)} className="space-y-3">
          <div>
            <label className={lbl}>Device ID <span className="text-red-500">*</span></label>
            <input {...register("deviceId", { required: "Required" })} placeholder="TRACKER-001" className={cls} />
            {errors.deviceId && <p className="text-xs text-red-500 mt-1">{errors.deviceId.message}</p>}
          </div>
          <div>
            <label className={lbl}>IMEI <span className="text-red-500">*</span></label>
            <input {...register("imei", { required: "Required" })} placeholder="359273043905678" className={cls} />
            {errors.imei && <p className="text-xs text-red-500 mt-1">{errors.imei.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Vehicle ID</label>
              <input {...register("vehicleId")} type="number" placeholder="Optional" className={cls} />
            </div>
            <div>
              <label className={lbl}>Driver ID</label>
              <input {...register("driverId")} type="number" placeholder="Optional" className={cls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Firmware Version</label>
              <input {...register("firmwareVersion")} placeholder="1.2.3" className={cls} />
            </div>
            <div>
              <label className={lbl}>Report Interval (s)</label>
              <input {...register("reportIntervalSecs")} type="number" placeholder="30" className={cls} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={registerMut.isPending} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {registerMut.isPending && <Loader2 size={13} className="animate-spin" />} Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TelemetryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const submitMut = useSubmitTelemetry();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Record<string, string>>();

  const onValid = async (v: Record<string, string>) => {
    const payload: IotTelemetryPayload = {
      deviceId: v.deviceId,
      latitude: parseFloat(v.latitude),
      longitude: parseFloat(v.longitude),
      ...(v.speed ? { speed: parseFloat(v.speed) } : {}),
      ...(v.heading ? { heading: parseFloat(v.heading) } : {}),
      ...(v.batteryLevel ? { batteryLevel: parseFloat(v.batteryLevel) } : {}),
      ...(v.signalStrength ? { signalStrength: parseFloat(v.signalStrength) } : {}),
    };
    try {
      await submitMut.mutateAsync(payload);
      toast.success("Telemetry submitted");
      reset(); onClose();
    } catch { toast.error("Failed to submit telemetry"); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Submit IoT Telemetry</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={15} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit(onValid)} className="space-y-3">
          <div>
            <label className={lbl}>Device ID <span className="text-red-500">*</span></label>
            <input {...register("deviceId", { required: "Required" })} placeholder="TRACKER-001" className={cls} />
            {errors.deviceId && <p className="text-xs text-red-500 mt-1">{errors.deviceId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Latitude <span className="text-red-500">*</span></label>
              <input {...register("latitude", { required: "Required" })} placeholder="-6.2088" className={cls} />
              {errors.latitude && <p className="text-xs text-red-500 mt-1">{errors.latitude.message}</p>}
            </div>
            <div>
              <label className={lbl}>Longitude <span className="text-red-500">*</span></label>
              <input {...register("longitude", { required: "Required" })} placeholder="106.8456" className={cls} />
              {errors.longitude && <p className="text-xs text-red-500 mt-1">{errors.longitude.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Speed (km/h)</label><input {...register("speed")} placeholder="60.5" className={cls} /></div>
            <div><label className={lbl}>Heading (°)</label><input {...register("heading")} placeholder="180" className={cls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Battery (%)</label><input {...register("batteryLevel")} placeholder="85.5" className={cls} /></div>
            <div><label className={lbl}>Signal (dBm)</label><input {...register("signalStrength")} placeholder="-70" className={cls} /></div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitMut.isPending} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitMut.isPending && <Loader2 size={13} className="animate-spin" />} Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function IotTracking() {
  const { data: devices = [], isLoading: devLoading } = useIotDevices();
  const { data: fleet = [], isLoading: fleetLoading } = useIotFleet();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(10);

  const paginatedDevices = perPage === "all" ? devices : devices.slice((page - 1) * perPage, page * perPage);

  const online = devices.filter(d => d.status === "ACTIVE").length;
  const offline = devices.filter(d => d.status !== "ACTIVE").length;

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-lg font-bold text-gray-900">IoT Vehicle Tracking</h1><p className="text-xs text-gray-400 mt-0.5">Real-time GPS tracker management</p></div>
          <div className="flex gap-2">
            <button onClick={() => setTelemetryOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-green-700 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
              <Signal size={14} /> Submit Telemetry
            </button>
            <button onClick={() => setRegisterOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              <Plus size={14} /> Register Device
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Devices", value: devLoading ? "—" : devices.length, color: "text-gray-900", bg: "bg-gray-50", icon: <Cpu size={16} className="text-gray-500" /> },
            { label: "Online", value: devLoading ? "—" : online, color: "text-green-700", bg: "bg-green-50", icon: <Wifi size={16} className="text-green-500" /> },
            { label: "Offline", value: devLoading ? "—" : offline, color: "text-red-700", bg: "bg-red-50", icon: <WifiOff size={16} className="text-red-500" /> },
          ].map(c => (
            <div key={c.label} className={`rounded-2xl p-4 shadow-sm border border-gray-100 ${c.bg}`}>
              <div className="flex items-center gap-2 mb-1">{c.icon}<p className="text-xs text-gray-500 font-medium">{c.label}</p></div>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Devices Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100"><p className="text-sm font-semibold text-gray-900">Registered Devices</p></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Device ID", "IMEI", "Vehicle", "Driver", "Status", "Battery", "Coordinates", "Last Seen"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {devLoading && Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))}
                {!devLoading && devices.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Cpu size={36} className="opacity-30" />
                      <p className="text-sm">No IoT devices registered yet</p>
                      <button onClick={() => setRegisterOpen(true)} className="text-xs text-blue-600 hover:underline">+ Register first device</button>
                    </div>
                  </td></tr>
                )}
                {!devLoading && paginatedDevices.map(d => (
                  <tr key={d.deviceId} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3 text-sm font-mono font-semibold text-gray-800">{d.deviceId}</td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-500">{d.imei}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{d.vehicleId ? `#${d.vehicleId}` : "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{d.driverId ? `#${d.driverId}` : "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${d.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {d.status === "ACTIVE" ? <Wifi size={10} /> : <WifiOff size={10} />}{d.status ?? "UNKNOWN"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {d.batteryLevel != null ? (
                        <div className="flex items-center gap-1.5">
                          <Battery size={13} className={d.batteryLevel < 20 ? "text-red-500" : "text-green-500"} />
                          <span className="text-xs text-gray-600">{d.batteryLevel}%</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {d.latitude != null ? (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={11} className="text-blue-400" />
                          {Number(d.latitude).toFixed(4)}, {Number(d.longitude).toFixed(4)}
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {d.lastSeen ? new Date(d.lastSeen).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!devLoading && (
            <Pagination
              page={page}
              totalItems={devices.length}
              perPage={perPage}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
            />
          )}
        </div>

        {/* Fleet overview */}
        {(fleet.length > 0 || fleetLoading) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Fleet Overview</h3>
            {fleetLoading ? (
              <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {fleet.map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-1">
                    <p className="text-xs font-semibold text-gray-800 font-mono">{item.deviceId}</p>
                    {item.latitude != null && (
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <MapPin size={10} className="text-blue-400" />{Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)}
                      </p>
                    )}
                    {item.speed != null && <p className="text-[11px] text-gray-500">🚗 {item.speed} km/h</p>}
                    {item.batteryLevel != null && <p className="text-[11px] text-gray-500"><Battery size={10} className="inline mr-0.5" />{item.batteryLevel}%</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <RegisterDeviceDialog open={registerOpen} onClose={() => setRegisterOpen(false)} />
      <TelemetryDialog open={telemetryOpen} onClose={() => setTelemetryOpen(false)} />
    </MainLayout>
  );
}
