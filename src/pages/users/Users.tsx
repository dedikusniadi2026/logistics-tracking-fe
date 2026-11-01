import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "../../hooks/useUsers";
import type { User, CreateUserPayload, UpdateUserPayload } from "../../api/users.api";
import UserFormDialog from "./UserFormDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import Pagination from "../../components/common/Pagination";

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  DRIVER: "bg-blue-100 text-blue-700",
  CUSTOMER: "bg-green-100 text-green-700",
};

export default function Users() {
  const { data: users = [], isLoading, isError } = useUsers();

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  /* ── dialog state ── */
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  /* ── search & pagination ── */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.phone.includes(q)
    );
  }, [users, search]);

  const paginated = perPage === "all" ? filtered : filtered.slice((page - 1) * perPage, page * perPage);

  /* ── handlers ── */
  const openAdd = () => {
    setEditUser(null);
    setFormOpen(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateUserPayload | UpdateUserPayload) => {
    try {
      if (editUser) {
        await updateMutation.mutateAsync({ id: editUser.id, data: data as UpdateUserPayload });
        toast.success("User berhasil diupdate");
      } else {
        await createMutation.mutateAsync(data as CreateUserPayload);
        toast.success("User berhasil ditambahkan");
      }
      setFormOpen(false);
    } catch {
      toast.error(editUser ? "Gagal mengupdate user" : "Gagal menambahkan user");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`User "${deleteTarget.name}" berhasil dihapus`);
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus user");
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Users</h1>
            <p className="text-xs text-gray-400 mt-0.5">Kelola data pengguna sistem</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            Add User
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">
              Total <span className="font-semibold text-gray-800">{filtered.length}</span> users
            </p>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, role..."
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
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Created</th>
                  <th className="text-right text-xs font-semibold text-gray-400 px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                )}

                {isError && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-red-500">
                      Gagal memuat data users
                    </td>
                  </tr>
                )}

                {!isLoading && !isError && paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                      {search ? "Tidak ada user yang cocok" : "Belum ada data user"}
                    </td>
                  </tr>
                )}

                {!isLoading && paginated.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {perPage === "all" ? idx + 1 : (page - 1) * perPage + idx + 1}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{user.email}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{user.phone}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_BADGE[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                            day: "2-digit", month: "short", year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(user)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
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
      <UserFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isMutating}
        editData={editUser}
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
