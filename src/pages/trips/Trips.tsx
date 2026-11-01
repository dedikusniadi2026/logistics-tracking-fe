import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import { useShipments } from "../../hooks/useShipments";
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

function truncate(text: string, max = 28) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function Trips() {
  const { data: shipments = [], isLoading, isError } = useShipments();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return shipments.filter(
      (s) =>
        (s.shipmentNumber ?? "").toLowerCase().includes(q) ||
        s.originAddress.toLowerCase().includes(q) ||
        s.destinationAddress.toLowerCase().includes(q) ||
        String(s.driverId ?? "").includes(q) ||
        String(s.vehicleId ?? "").includes(q)
    );
  }, [shipments, search]);

  const paginated = perPage === "all" ? filtered : filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-gray-900">Trips</h1>
          <p className="text-xs text-gray-400 mt-0.5">Data perjalanan pengiriman</p>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">
              Total <span className="font-semibold text-gray-800">{filtered.length}</span> trips
            </p>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search trips..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-4 py-1.5 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">#</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Trip No
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Driver
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Vehicle
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Origin
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Destination
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Departure
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Est. Arrival
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {isError && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-10 text-center text-sm text-red-500"
                    >
                      Gagal memuat data trips
                    </td>
                  </tr>
                )}

                {!isLoading && !isError && paginated.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-10 text-center text-sm text-gray-400"
                    >
                      {search ? "Tidak ada trip yang cocok" : "Belum ada data trip"}
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  paginated.map((s, idx) => (
                    <tr
                      key={s.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm text-gray-400">
                        {perPage === "all" ? idx + 1 : (page - 1) * perPage + idx + 1}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-800">
                        {s.shipmentNumber ?? `#${s.id}`}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {s.driver?.name ?? (s.driverId ? `Driver #${s.driverId}` : "—")}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {s.vehicle?.plateNumber ?? (s.vehicleId ? `Vehicle #${s.vehicleId}` : "—")}
                      </td>
                      <td
                        className="px-5 py-3 text-sm text-gray-500 max-w-36"
                        title={s.originAddress}
                      >
                        {truncate(s.originAddress)}
                      </td>
                      <td
                        className="px-5 py-3 text-sm text-gray-500 max-w-36"
                        title={s.destinationAddress}
                      >
                        {truncate(s.destinationAddress)}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-400">
                        {fmtDate(s.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-400">
                        {fmtDate(s.estimatedDelivery)}
                      </td>
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
