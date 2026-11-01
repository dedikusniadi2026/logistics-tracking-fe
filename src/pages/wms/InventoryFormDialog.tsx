import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import type { CreateInventoryPayload } from "../../api/wms.api";
import type { Warehouse } from "../../api/wms.api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInventoryPayload) => void;
  isLoading: boolean;
  warehouses: Warehouse[];
}

const cls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400";
const lbl = "block text-xs font-medium text-gray-600 mb-1";

type FormValues = {
  warehouseId: string; sku: string; productName: string;
  description: string; quantity: string; minStockLevel: string;
  location: string; barcodeValue: string;
};

export default function InventoryFormDialog({ open, onClose, onSubmit, isLoading, warehouses }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    if (open) reset({ warehouseId: "", sku: "", productName: "", description: "", quantity: "", minStockLevel: "", location: "", barcodeValue: "" });
  }, [open, reset]);

  const onValid = (v: FormValues) => {
    onSubmit({
      warehouseId: Number(v.warehouseId),
      sku: v.sku,
      productName: v.productName,
      quantity: Number(v.quantity),
      ...(v.description ? { description: v.description } : {}),
      ...(v.minStockLevel ? { minStockLevel: Number(v.minStockLevel) } : {}),
      ...(v.location ? { location: v.location } : {}),
      ...(v.barcodeValue ? { barcodeValue: v.barcodeValue } : {}),
    });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Add Inventory Item</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={15} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit(onValid)} className="space-y-3">
          <div>
            <label className={lbl}>Warehouse <span className="text-red-500">*</span></label>
            <select {...register("warehouseId", { required: "Required" })} className={`${cls} bg-white`}>
              <option value="">-- Select Warehouse --</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
            </select>
            {errors.warehouseId && <p className="text-xs text-red-500 mt-1">{errors.warehouseId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>SKU <span className="text-red-500">*</span></label>
              <input {...register("sku", { required: "Required" })} placeholder="SKU-BOX-001" className={cls} />
              {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku.message}</p>}
            </div>
            <div>
              <label className={lbl}>Product Name <span className="text-red-500">*</span></label>
              <input {...register("productName", { required: "Required" })} placeholder="Kardus 30x30" className={cls} />
              {errors.productName && <p className="text-xs text-red-500 mt-1">{errors.productName.message}</p>}
            </div>
          </div>
          <div>
            <label className={lbl}>Description</label>
            <input {...register("description")} placeholder="Optional description" className={cls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Quantity <span className="text-red-500">*</span></label>
              <input {...register("quantity", { required: "Required" })} type="number" placeholder="100" className={cls} />
              {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
            </div>
            <div>
              <label className={lbl}>Min Stock Level</label>
              <input {...register("minStockLevel")} type="number" placeholder="10" className={cls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Location</label>
              <input {...register("location")} placeholder="A-12-3" className={cls} />
            </div>
            <div>
              <label className={lbl}>Barcode / QR Value</label>
              <input {...register("barcodeValue")} placeholder="123456789012" className={cls} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
