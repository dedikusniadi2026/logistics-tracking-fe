import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import { useShipments } from "../../hooks/useShipments";
import type { Shipment } from "../../api/shipments.api";
import Pagination from "../../components/common/Pagination";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  PICKED_UP: "bg-purple-100 text-purple-700",
  IN_TRANSIT: "bg-blue-100 text-blue-700",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

function fmtDate(val?: string) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtTime(val?: string) {
  if (!val) return "—";
  return new Date(val).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string, max = 28) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

type Tab = "departure" | "pickup";

function DepartureTable({ data }: { data: Shipment[] }) {
  const sorted = [...data].sort(
    (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
  );
  if (sorted.length === 0)
    return (
      <p className="text-center text-sm text-gray-400 py-10">Tidak ada data jadwal keberangkatan</p>
    );
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Shipment No</th>
          <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Origin</th>
          <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Destination</th>
          <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Departure Date</th>
          <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Departure Time</th>
          <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Status</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((s) => (
          <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
            <td className="px-5 py-3 text-sm font-medium text-gray-800">
              {s.shipmentNumber ?? `#${s.id}`}
            </td>
            <td className="px-5 py-3 text-sm text-gray-500" title={s.originAddress}>
              {truncate(s.originAddress)}
            </td>
            <td className="px-5 py-3 text-sm text-gray-500" title={s.destinationAddress}>
              {truncate(s.destinationAddress)}
            </td>
            <td className="px-5 py-3 text-sm text-gray-400">{fmtDate(s.createdAt)}</td>
            <td className="px-5 py-3 text-sm text-gray-400">{fmtTime(s.createdAt)}</td>
            <td className="px-5 py-3">
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  STATUS_BADGE[s.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {s.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PickupDeliveryTable({ data }: { data: Shipment[] }) {
  if (data.length === 0)
    return (
      <p className="text-center text-sm text-gray-400 py-10">Tidak ada data pickup & delivery</p>
    );
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Shipment No</th>
          <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Origin (Pickup)</th>
          <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
            Destination (Delivery)
          </th>
          <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
            Est. Delivery Date
          </th>
          <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
            Est. Delivery Time
          </th>
          <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((s) => (
          <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
            <td className="px-5 py-3 text-sm font-medium text-gray-800">
              {s.shipmentNumber ?? `#${s.id}`}
            </td>
            <td className="px-5 py-3 text-sm text-gray-500" title={s.originAddress}>
              {truncate(s.originAddress)}
            </td>
            <td className="px-5 py-3 text-sm text-gray-500" title={s.destinationAddress}>
              {truncate(s.destinationAddress)}
            </td>
            <td className="px-5 py-3 text-sm text-gray-400">{fmtDate(s.estimatedDelivery)}</td>
            <td className="px-5 py-3 text-sm text-gray-400">{fmtTime(s.estimatedDelivery)}</td>
            <td className="px-5 py-3">
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  STATUS_BADGE[s.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {s.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Schedule() {
  const { data: shipments = [], isLoading, isError } = useShipments();
  const [tab, setTab] = useState<Tab>("departure");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return shipments.filter(
      (s) =>
        (s.shipmentNumber ?? "").toLowerCase().includes(q) ||
        s.originAddress.toLowerCase().includes(q) ||
        s.destinationAddress.toLowerCase().includes(q)
    );
  }, [shipments, search]);

  const paginated = perPage === "all" ? filtered : filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-gray-900">Schedule</h1>
          <p className="text-xs text-gray-400 mt-0.5">Jadwal keberangkatan dan pengiriman</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Tabs */}
          <div className="flex items-center justify-between px-5 pt-4 border-b border-gray-100">
            <div className="flex gap-1">
              {(
                [
                  { key: "departure", label: "Departure Schedule" },
                  { key: "pickup", label: "Pickup & Delivery" },
                ] as { key: Tab; label: string }[]
              ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    tab === t.key
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative pb-4">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-8 pr-4 py-1.5 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Content */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="space-y-2 p-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : isError ? (
              <p className="text-center text-sm text-red-500 py-10">Gagal memuat data jadwal</p>
            ) : tab === "departure" ? (
              <DepartureTable data={paginated} />
            ) : (
              <PickupDeliveryTable data={paginated} />
            )}
          </div>

          {/* Pagination */}
          {!isLoading && (
            <Pagination
              page={page}
              totalItems={filtered.length}
              perPage={perPage}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
