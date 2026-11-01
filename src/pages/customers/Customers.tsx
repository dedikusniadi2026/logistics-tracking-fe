import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "../../hooks/useCustomers";
import type { Customer, CreateCustomerPayload, UpdateCustomerPayload } from "../../api/customers.api";
import CustomerFormDialog from "./CustomerFormDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import Pagination from "../../components/common/Pagination";

export default function Customers() {
  const { data: customers = [], isLoading, isError } = useCustomers();

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  /* ── dialog state ── */
  const [formOpen, setFormOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  /* ── search & pagination ── */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false) ||
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const paginated = perPage === "all" ? filtered : filtered.slice((page - 1) * perPage, page * perPage);

  /* ── handlers ── */
  const openAdd = () => {
    setEditCustomer(null);
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateCustomerPayload | UpdateCustomerPayload) => {
    try {
      if (editCustomer) {
        await updateMutation.mutateAsync({ id: editCustomer.id, data: data as UpdateCustomerPayload });
        toast.success("Customer berhasil diupdate");
      } else {
        await createMutation.mutateAsync(data as CreateCustomerPayload);
        toast.success("Customer berhasil ditambahkan");
      }
      setFormOpen(false);
    } catch {
      toast.error(editCustomer ? "Gagal mengupdate customer" : "Gagal menambahkan customer");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`Customer "${deleteTarget.name}" berhasil dihapus`);
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus customer");
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Customers</h1>
            <p className="text-xs text-gray-400 mt-0.5">Kelola data customer</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            Add Customer
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">
              Total <span className="font-semibold text-gray-800">{filtered.length}</span> customers
            </p>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
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
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Phone</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Address</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Created</th>
                  <th className="text-right text-xs font-semibold text-gray-400 px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {isError && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-red-500">
                      Gagal memuat data customers
                    </td>
                  </tr>
                )}

                {!isLoading && !isError && paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                      {search ? "Tidak ada customer yang cocok" : "Belum ada data customer"}
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  paginated.map((customer, idx) => (
                    <tr
                      key={customer.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm text-gray-400">
                        {perPage === "all" ? idx + 1 : (page - 1) * perPage + idx + 1}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{customer.email ?? "—"}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{customer.phone}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        <span className="block truncate max-w-[200px]" title={customer.address}>
                          {customer.address}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-400">
                        {customer.createdAt
                          ? new Date(customer.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(customer)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(customer)}
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
      <CustomerFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isMutating}
        editData={editCustomer}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ""}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </MainLayout>
  );
}
