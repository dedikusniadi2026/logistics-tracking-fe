import { Filter } from "lucide-react";
import type { LiveVehicle } from "../../types/livetracking";

export interface FilterState {
  vehicle: string;
  driver: string;
  status: string;
  date: string;
}

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  vehicles: LiveVehicle[];
}

const STATUSES = [
  { value: "", label: "All Status" },
  { value: "ON_DELIVERY", label: "On Delivery" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "AVAILABLE", label: "Available" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function LiveFilterBar({ filters, onChange, vehicles }: Props) {
  const uniqueVehicles = Array.from(new Set(vehicles.map((v) => v.vehicleId))).sort();
  const uniqueDrivers = Array.from(new Set(vehicles.map((v) => v.driver).filter(Boolean))).sort();

  return (
    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
        <Filter size={14} />
        <span className="text-xs font-medium text-gray-500">Filter</span>
      </div>

      {/* Vehicle */}
      <select
        value={filters.vehicle}
        onChange={(e) => onChange({ ...filters, vehicle: e.target.value })}
        className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 min-w-[130px]"
      >
        <option value="">All Vehicles</option>
        {uniqueVehicles.map((v) => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>

      {/* Driver */}
      <select
        value={filters.driver}
        onChange={(e) => onChange({ ...filters, driver: e.target.value })}
        className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 min-w-[130px]"
      >
        <option value="">All Drivers</option>
        {uniqueDrivers.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 min-w-[130px]"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Date */}
      <input
        type="date"
        value={filters.date}
        onChange={(e) => onChange({ ...filters, date: e.target.value })}
        className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
      />

      {/* Clear */}
      {(filters.vehicle || filters.driver || filters.status || filters.date) && (
        <button
          onClick={() => onChange({ vehicle: "", driver: "", status: "", date: "" })}
          className="text-xs text-blue-500 hover:text-blue-700 font-medium ml-auto"
        >
          Clear
        </button>
      )}
    </div>
  );
}
