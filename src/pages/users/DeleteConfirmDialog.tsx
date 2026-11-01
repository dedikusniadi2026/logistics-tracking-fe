import { AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  name: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({ open, name, isLoading, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 z-10">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-base font-semibold text-gray-900 text-center mb-1">
          Hapus User
        </h2>
        <p className="text-sm text-gray-500 text-center">
          Apakah Anda yakin ingin menghapus{" "}
          <span className="font-semibold text-gray-800">{name}</span>?{" "}
          Tindakan ini tidak dapat dibatalkan.
        </p>

        {/* Actions */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Tidak
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
