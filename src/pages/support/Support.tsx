import { useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { Plus, X, Loader2, HeadphonesIcon, TicketCheck, Clock } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}

const PRIORITY_BADGE: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-green-100 text-green-700",
};

const STATUS_BADGE: Record<string, string> = {
  OPEN: "bg-orange-100 text-orange-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
};

const MOCK_TICKETS: Ticket[] = [
  {
    id: "TKT-001",
    subject: "Shipment tidak ditemukan",
    description: "Shipment dengan nomor SHP-2024-001 tidak dapat dilacak.",
    priority: "HIGH",
    status: "OPEN",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "TKT-002",
    subject: "Driver tidak responsif",
    description: "Driver belum mengkonfirmasi pengambilan barang.",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "TKT-003",
    subject: "Permintaan perubahan alamat",
    description: "Mohon ubah alamat pengiriman ke alamat baru.",
    priority: "LOW",
    status: "RESOLVED",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

type FormValues = {
  subject: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
};

interface CreateTicketDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
}

function CreateTicketDialog({ open, onClose, onSubmit }: CreateTicketDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { subject: "", description: "", priority: "MEDIUM" },
  });

  const onValid = (values: FormValues) => {
    onSubmit(values);
    reset();
  };

  if (!open) return null;

  const inputCls =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Create Ticket</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              {...register("subject", { required: "Subject is required" })}
              placeholder="Describe your issue briefly"
              className={inputCls}
            />
            {errors.subject && (
              <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description", { required: "Description is required" })}
              rows={4}
              placeholder="Provide more details about the issue..."
              className={`${inputCls} resize-none`}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              {...register("priority")}
              className={`${inputCls} bg-white`}
            >
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function fmtDate(val: string) {
  return new Date(val).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [dialogOpen, setDialogOpen] = useState(false);

  const stats = {
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  };

  const handleCreateTicket = (data: FormValues) => {
    const newTicket: Ticket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    setTickets((prev) => [newTicket, ...prev]);
    setDialogOpen(false);
    toast.success("Tiket berhasil dibuat!");
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Support Center</h1>
            <p className="text-xs text-gray-400 mt-0.5">Kelola tiket bantuan</p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            Create Ticket
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <HeadphonesIcon size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <TicketCheck size={18} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>

        {/* Ticket Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">All Tickets</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Ticket #", "Subject", "Priority", "Status", "Created"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-400 px-5 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-sm text-gray-400 py-10">
                      Belum ada tiket
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm font-mono font-medium text-gray-800">
                        {t.id}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700 max-w-xs">
                        <p className="font-medium text-gray-800 truncate">{t.subject}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{t.description}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            PRIORITY_BADGE[t.priority]
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            STATUS_BADGE[t.status]
                          }`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-400">
                        {fmtDate(t.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateTicketDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </MainLayout>
  );
}
