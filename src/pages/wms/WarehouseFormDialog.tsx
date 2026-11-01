import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import type { Warehouse, CreateWarehousePayload } from "../../api/wms.api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWarehousePayload) => void;
  isLoading: boolean;
  editData?: Warehouse | null;
}

type FormValues = {
  name: string; code: string; address: string;
  latitude: string; longitude: string;
  totalCapacity: string; managerName: string; managerPhone: string;
};

const cls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400";
const lbl = "block text-xs font-medium text-gray-600 mb-1";

export default function WarehouseFormDialog({ open, onClose, onSubmit, isLoading, editData }: Props) {
  const isEdit = !!editData;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    if (!open) return;
    if (editData) {
      reset({
        name: editData.name, code: editData.code, address: editData.address,
        latitude: editData.latitude != null ? String(editData.latitude) : "",
        longitude: editData.longitude != null ? String(editData.longitude) : "",
        totalCapacity: String(editData.totalCapacity),
        managerName: editData.managerName, managerPhone: editData.managerPhone,
      });
    } else {
      reset({ name: "", code: "", address: "", latitude: "", longitude: "", totalCapacity: "", managerName: "", managerPhone: "" });
    }
  }, [open, editData, reset]);

  const onValid = (v: FormValues) => {
    onSubmit({
      name: v.name, code: v.code, address: v.address,
      totalCapacity: Number(v.totalCapacity),
      managerName: v.managerName, managerPhone: v.managerPhone,
      ...(v.latitude ? { latitude: parseFloat(v.latitude) } : {}),
      ...(v.longitude ? { longitude: parseFloat(v.longitude) } : {}),
    });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? "Edit Warehouse" : "Add Warehouse"}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={15} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit(onValid)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Name <span className="text-red-500">*</span></label>
              <input {...register("name", { required: "Required" })} placeholder="Gudang Jakarta" className={cls} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className={lbl}>Code <span className="text-red-500">*</span></label>
              <input {...register("code", { required: "Required" })} placeholder="WH-JKT-01" className={cls} />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
            </div>
          </div>
          <div>
            <label className={lbl}>Address <span className="text-red-500">*</span></label>
            <textarea {...register("address", { required: "Required" })} rows={2} placeholder="Jl. Gajah Mada No. 10, Jakarta" className={`${cls} resize-none`} />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Latitude</label>
              <input {...register("latitude")} placeholder="-6.1754" className={cls} />
            </div>
            <div>
              <label className={lbl}>Longitude</label>
              <input {...register("longitude")} placeholder="106.8272" className={cls} />
            </div>
          </div>
          <div>
            <label className={lbl}>Total Capacity (units) <span className="text-red-500">*</span></label>
            <input {...register("totalCapacity", { required: "Required" })} type="number" placeholder="5000" className={cls} />
            {errors.totalCapacity && <p className="text-xs text-red-500 mt-1">{errors.totalCapacity.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Manager Name <span className="text-red-500">*</span></label>
              <input {...register("managerName", { required: "Required" })} placeholder="Budi Santoso" className={cls} />
              {errors.managerName && <p className="text-xs text-red-500 mt-1">{errors.managerName.message}</p>}
            </div>
            <div>
              <label className={lbl}>Manager Phone <span className="text-red-500">*</span></label>
              <input {...register("managerPhone", { required: "Required" })} placeholder="08123456789" className={cls} />
              {errors.managerPhone && <p className="text-xs text-red-500 mt-1">{errors.managerPhone.message}</p>}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Add Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
