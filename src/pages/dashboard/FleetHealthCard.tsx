import { Car, CheckCircle2, Wrench, AlertTriangle, XCircle } from "lucide-react";
import { useVehicles, useDrivers } from "../../hooks/useDashboard";

function HealthBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-5 text-right">{value}</span>
    </div>
  );
}

export default function FleetHealthCard({ dark = false }: { dark?: boolean }) {
  const { data: vehicles = [], isLoading: vLoading } = useVehicles();
  const { data: drivers = [],  isLoading: dLoading  } = useDrivers();

  const vStats = {
    total:       vehicles.length,
    active:      vehicles.filter((v) => v.status === "ACTIVE").length,
    maintenance: vehicles.filter((v) => v.status === "MAINTENANCE").length,
    inactive:    vehicles.filter((v) => v.status === "INACTIVE").length,
  };
  const dStats = {
    total:      drivers.length,
    available:  drivers.filter((d) => d.status === "AVAILABLE").length,
    onDelivery: drivers.filter((d) => d.status === "ON_DELIVERY").length,
    inactive:   drivers.filter((d) => d.status === "INACTIVE").length,
  };

  const healthScore = vStats.total > 0
    ? Math.round((vStats.active / vStats.total) * 100)
    : 0;

  const cardBg  = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const textPri = dark ? "text-white" : "text-gray-900";
  const textSec = dark ? "text-gray-400" : "text-gray-500";
  const sectBg  = dark ? "bg-gray-800" : "bg-gray-50";

  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${cardBg}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
          <Car size={15} className="text-green-600" />
        </div>
        <div>
          <h3 className={`text-sm font-semibold ${textPri}`}>Fleet Health</h3>
          <p className={`text-[11px] ${textSec}`}>{vStats.total} vehicles · {dStats.total} drivers</p>
        </div>
        {/* Score ring */}
        <div className="ml-auto flex items-center gap-1.5">
          <div className={`text-2xl font-bold ${healthScore >= 80 ? "text-green-500" : healthScore >= 50 ? "text-yellow-500" : "text-red-500"}`}>
            {healthScore}%
          </div>
          <div className={`text-[10px] font-semibold ${textSec}`}>health</div>
        </div>
      </div>

      {vLoading || dLoading ? (
        <div className={`h-28 rounded-xl animate-pulse ${dark ? "bg-gray-800" : "bg-gray-100"}`} />
      ) : (
        <div className="space-y-3">
          {/* Vehicles */}
          <div className={`${sectBg} rounded-xl p-3`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${textSec}`}>Vehicles</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                <span className={`text-xs flex-1 ${textSec}`}>Active</span>
                <HealthBar value={vStats.active} max={vStats.total} color="bg-green-500" />
              </div>
              <div className="flex items-center gap-2">
                <Wrench size={12} className="text-orange-500 shrink-0" />
                <span className={`text-xs flex-1 ${textSec}`}>Maintenance</span>
                <HealthBar value={vStats.maintenance} max={vStats.total} color="bg-orange-400" />
              </div>
              <div className="flex items-center gap-2">
                <XCircle size={12} className="text-gray-400 shrink-0" />
                <span className={`text-xs flex-1 ${textSec}`}>Inactive</span>
                <HealthBar value={vStats.inactive} max={vStats.total} color="bg-gray-300" />
              </div>
            </div>
          </div>

          {/* Drivers */}
          <div className={`${sectBg} rounded-xl p-3`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${textSec}`}>Drivers</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-blue-500 shrink-0" />
                <span className={`text-xs flex-1 ${textSec}`}>Available</span>
                <HealthBar value={dStats.available} max={dStats.total} color="bg-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={12} className="text-purple-500 shrink-0" />
                <span className={`text-xs flex-1 ${textSec}`}>On Delivery</span>
                <HealthBar value={dStats.onDelivery} max={dStats.total} color="bg-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
