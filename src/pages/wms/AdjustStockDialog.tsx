import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import type { InventoryItem } from "../../api/wms.api";

interface Props {
  open: boolean;
  item: InventoryItem | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: { adjustment: number; reason: string }) => void;
}

export default function AdjustStockDialog({ open, item, isLoading, onClose, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ adjustment: string; reason: string }>();

  const onValid = (v: { adjustment: string; reason: string }) => {
    onSubmit({ adjustment: Number(v.adjustment), reason: v.reason });
    reset();
  };

  if (!open || !item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Adjust Stock</h2>
            <p className="text-xs text-gray-400 mt-0.5">{item.productName} — Current: <span className="font-semibold text-gray-700">{item.quantity}</span></p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={15} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit(onValid)} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Adjustment <span className="text-red-500">*</span>
              <span className="ml-1 text-gray-400 font-normal">(+ add, - reduce)</span>
            </label>
            <input
              {...register("adjustment", { required: "Required", validate: v => !isNaN(Number(v)) || "Must be a number" })}
              type="number" placeholder="e.g. 10 or -5"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.adjustment && <p className="text-xs text-red-500 mt-1">{errors.adjustment.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reason <span className="text-red-500">*</span></label>
            <input
              {...register("reason", { required: "Required" })}
              placeholder="e.g. Stock opname, damaged goods"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
