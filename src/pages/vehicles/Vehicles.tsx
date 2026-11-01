import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from "../../hooks/useVehicles";
import type { Vehicle, CreateVehiclePayload, UpdateVehiclePayload } from "../../api/vehicles.api";
import VehicleFormDialog from "./VehicleFormDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import Pagination from "../../components/common/Pagination";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  MAINTENANCE: "bg-orange-100 text-orange-700",
  INACTIVE: "bg-gray-100 text-gray-600",
};

export default function Vehicles() {
  const { data: vehicles = [], isLoading, isError } = useVehicles();

  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();

  /* ── dialog state ── */
  const [formOpen, setFormOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

  /* ── search & pagination ── */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.plateNumber.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q) ||
        v.status.toLowerCase().includes(q)
    );
  }, [vehicles, search]);

  const paginated = perPage === "all" ? filtered : filtered.slice((page - 1) * perPage, page * perPage);

  /* ── handlers ── */
  const openAdd = () => {
    setEditVehicle(null);
    setFormOpen(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateVehiclePayload | UpdateVehiclePayload) => {
    try {
      if (editVehicle) {
        await updateMutation.mutateAsync({ id: editVehicle.id, data: data as UpdateVehiclePayload });
        toast.success("Vehicle berhasil diupdate");
      } else {
        await createMutation.mutateAsync(data as CreateVehiclePayload);
        toast.success("Vehicle berhasil ditambahkan");
      }
      setFormOpen(false);
    } catch {
      toast.error(editVehicle ? "Gagal mengupdate vehicle" : "Gagal menambahkan vehicle");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`Vehicle "${deleteTarget.plateNumber}" berhasil dihapus`);
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus vehicle");
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Vehicles</h1>
            <p className="text-xs text-gray-400 mt-0.5">Kelola data kendaraan</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            Add Vehicle
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">
              Total <span className="font-semibold text-gray-800">{filtered.length}</span> vehicles
            </p>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search plate, model, type..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-8 pr-4 py-1.5 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">#</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Plate Number</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Model</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Capacity</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Created</th>
                  <th className="text-right text-xs font-semibold text-gray-400 px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {isError && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm text-red-500">
                      Gagal memuat data vehicles
                    </td>
                  </tr>
                )}

                {!isLoading && !isError && paginated.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">
                      {search ? "Tidak ada vehicle yang cocok" : "Belum ada data vehicle"}
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  paginated.map((vehicle, idx) => (
                    <tr
                      key={vehicle.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm text-gray-400">
                        {perPage === "all" ? idx + 1 : (page - 1) * perPage + idx + 1}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-gray-800 font-mono">
                        {vehicle.plateNumber}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700">{vehicle.model}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{vehicle.type}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {vehicle.capacity.toLocaleString("id-ID")} kg
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            STATUS_BADGE[vehicle.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-400">
                        {vehicle.createdAt
                          ? new Date(vehicle.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(vehicle)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(vehicle)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={13} />
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
      <VehicleFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isMutating}
        editData={editVehicle}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        name={deleteTarget?.plateNumber ?? ""}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </MainLayout>
  );
}
