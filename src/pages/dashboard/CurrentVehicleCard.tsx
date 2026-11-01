import { Truck, Tag, Package, Activity, RefreshCw, Gauge, Fuel } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "../../api/vehicles.api";
import { shipmentsApi } from "../../api/shipments.api";

const STATUS_CFG: Record<string, { text: string; dot: string; badge: string }> = {
  ACTIVE:      { text: "Active",      dot: "bg-green-500",  badge: "bg-green-100 text-green-700"  },
  MAINTENANCE: { text: "Maintenance", dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
  INACTIVE:    { text: "Inactive",    dot: "bg-gray-400",   badge: "bg-gray-100 text-gray-500"    },
};

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">{icon}</div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="text-xs font-semibold text-gray-800 text-right">{value}</div>
    </div>
  );
}

export default function CurrentVehicleCard() {
  // Direct query with refetch — not relying on useDashboard cache
  const { data: vehicles = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehiclesApi,
    refetchInterval: 30_000,
  });

  const { data: shipments = [] } = useQuery({
    queryKey: ["shipments"],
    queryFn: shipmentsApi,
    refetchInterval: 30_000,
  });

  // Pick the first ACTIVE vehicle, or any vehicle
  const vehicle = vehicles.find((v) => v.status === "ACTIVE") ?? vehicles[0] ?? null;

  // Find active shipment assigned to this vehicle
  const activeShipment = vehicle
    ? shipments.find((s) =>
        s.vehicleId === vehicle.id &&
        ["IN_TRANSIT", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(s.status)
      )
    : null;

  const statusCfg = STATUS_CFG[vehicle?.status ?? "INACTIVE"];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
            <Truck size={15} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Current Vehicle</h3>
            <p className="text-[11px] text-gray-400">{isLoading ? "Loading…" : `${vehicles.length} total`}</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={12} className={`text-gray-400 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading && (
        <div className="flex-1 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex-1 flex items-center justify-center text-sm text-red-400">
          Failed to load vehicle
        </div>
      )}

      {!isLoading && !isError && !vehicle && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          No vehicles registered
        </div>
      )}

      {!isLoading && !isError && vehicle && (
        <div className="flex-1 flex flex-col gap-3">
          {/* Vehicle identity card */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <img
              src="/truck.png"
              alt={vehicle.model}
              className="w-16 h-12 object-contain shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{vehicle.model}</p>
              <p className="text-[11px] text-gray-500 font-mono">{vehicle.plateNumber}</p>
              <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.text}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <Row icon={<Tag size={12} className="text-gray-400" />} label="Type" value={vehicle.type} />
            <Row
              icon={<Package size={12} className="text-gray-400" />}
              label="Capacity"
              value={`${vehicle.capacity.toLocaleString()} kg`}
            />
            <Row
              icon={<Gauge size={12} className="text-gray-400" />}
              label="Current Speed"
              value={activeShipment ? "In Transit" : "—"}
            />
            <Row
              icon={<Activity size={12} className="text-gray-400" />}
              label="Shipment"
              value={
                activeShipment
                  ? <span className="text-blue-600 font-semibold">{activeShipment.shipmentNumber ?? `#${activeShipment.id}`}</span>
                  : <span className="text-gray-400">No active trip</span>
              }
            />
            <Row
              icon={<Fuel size={12} className="text-gray-400" />}
              label="Fuel Est."
              value={
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[75%] bg-green-500 rounded-full" />
                  </div>
                  <span>75%</span>
                </div>
              }
            />
          </div>

          {/* Last updated */}
          <p className="text-[10px] text-gray-400 text-right">
            Updated: {vehicle.updatedAt
              ? new Date(vehicle.updatedAt).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" })
              : "—"}
          </p>
        </div>
      )}
    </div>
  );
}
