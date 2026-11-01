import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
} from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import {
  useShipments,
  useCreateShipment,
  useUpdateShipment,
  useDeleteShipment,
} from "../../hooks/useShipments";
import type {
  Shipment,
  CreateShipmentPayload,
  UpdateShipmentPayload,
} from "../../api/shipments.api";
import ShipmentFormDialog from "./ShipmentFormDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import ShipmentTrackingDialog from "./ShipmentTrackingDialog";
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

const ALL_STATUSES = [
  "ALL",
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

function truncate(text: string, max = 32) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function fmtDate(val?: string) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Shipments() {
  const { data: shipments = [], isLoading, isError } = useShipments();

  const createMutation = useCreateShipment();
  const updateMutation = useUpdateShipment();
  const deleteMutation = useDeleteShipment();

  const [formOpen, setFormOpen] = useState(false);
  const [editShipment, setEditShipment] = useState<Shipment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shipment | null>(null);
  const [trackTarget, setTrackTarget] = useState<Shipment | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return shipments.filter((s) => {
      const matchSearch =
        (s.shipmentNumber ?? "").toLowerCase().includes(q) ||
        s.originAddress.toLowerCase().includes(q) ||
        s.destinationAddress.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [shipments, search, statusFilter]);

  const paginated = perPage === "all" ? filtered : filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => {
    setEditShipment(null);
    setFormOpen(true);
  };

  const openEdit = (s: Shipment) => {
    setEditShipment(s);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateShipmentPayload | UpdateShipmentPayload) => {
    try {
      if (editShipment) {
        await updateMutation.mutateAsync({
          id: editShipment.id,
          data: data as UpdateShipmentPayload,
        });
        toast.success("Shipment berhasil diupdate");
      } else {
        await createMutation.mutateAsync(data as CreateShipmentPayload);
        toast.success("Shipment berhasil ditambahkan");
      }
      setFormOpen(false);
    } catch {
      toast.error(editShipment ? "Gagal mengupdate shipment" : "Gagal menambahkan shipment");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Shipment berhasil dihapus");
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus shipment");
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Shipments</h1>
            <p className="text-xs text-gray-400 mt-0.5">Kelola data pengiriman</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            Add Shipment
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">
              Total{" "}
              <span className="font-semibold text-gray-800">{filtered.length}</span> shipments
            </p>
            <div className="flex items-center gap-2">
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "ALL" ? "All Status" : s}
                  </option>
                ))}
              </select>

              {/* Search */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search shipments..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 pr-4 py-1.5 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">#</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Shipment No
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Origin
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Destination
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Driver
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Vehicle
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">
                    Est. Delivery
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-400 px-5 py-3">
                    Action
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
                      Gagal memuat data shipments
                    </td>
                  </tr>
                )}

                {!isLoading && !isError && paginated.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-10 text-center text-sm text-gray-400"
                    >
                      {search || statusFilter !== "ALL"
                        ? "Tidak ada shipment yang cocok"
                        : "Belum ada data shipment"}
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
                      <td
                        className="px-5 py-3 text-sm text-gray-500 max-w-40"
                        title={s.originAddress}
                      >
                        {truncate(s.originAddress)}
                      </td>
                      <td
                        className="px-5 py-3 text-sm text-gray-500 max-w-40"
                        title={s.destinationAddress}
                      >
                        {truncate(s.destinationAddress)}
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
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {s.driver?.name ?? (s.driverId ? `#${s.driverId}` : "—")}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {s.vehicle?.plateNumber ?? s.vehicle?.model ?? (s.vehicleId ? `#${s.vehicleId}` : "—")}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-400">
                        {fmtDate(s.estimatedDelivery)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(s)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={13} />
                          </button>
                          <button
                            onClick={() => setTrackTarget(s)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors"
                            title="Track"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
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

      {/* Dialogs */}
      <ShipmentFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isMutating}
        editData={editShipment}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {trackTarget && (
        <ShipmentTrackingDialog
          shipment={trackTarget}
          open={!!trackTarget}
          onClose={() => setTrackTarget(null)}
        />
      )}
    </MainLayout>
  );
}
