import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import type { Vehicle, CreateVehiclePayload, UpdateVehiclePayload } from "../../api/vehicles.api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVehiclePayload | UpdateVehiclePayload) => void;
  isLoading: boolean;
  editData?: Vehicle | null;
}

type FormValues = {
  plateNumber: string;
  model: string;
  type: string;
  capacity: string;
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
};

const STATUSES = ["ACTIVE", "MAINTENANCE", "INACTIVE"] as const;

export default function VehicleFormDialog({ open, onClose, onSubmit, isLoading, editData }: Props) {
  const isEdit = !!editData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      plateNumber: "",
      model: "",
      type: "",
      capacity: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (open) {
      if (editData) {
        reset({
          plateNumber: editData.plateNumber,
          model: editData.model,
          type: editData.type,
          capacity: String(editData.capacity),
          status: editData.status,
        });
      } else {
        reset({ plateNumber: "", model: "", type: "", capacity: "", status: "ACTIVE" });
      }
    }
  }, [open, editData, reset]);

  const onValid = (values: FormValues) => {
    const payload: CreateVehiclePayload | UpdateVehiclePayload = {
      plateNumber: values.plateNumber,
      model: values.model,
      type: values.type,
      capacity: parseFloat(values.capacity),
      status: values.status,
    };
    onSubmit(payload);
  };

  if (!open) return null;

  return (
    /* backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Edit Vehicle" : "Add New Vehicle"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          {/* Plate Number */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Plate Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register("plateNumber", { required: "Plate number is required" })}
              placeholder="B 1234 ABC"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            {errors.plateNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.plateNumber.message}</p>
            )}
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              {...register("model", { required: "Model is required" })}
              placeholder="Toyota Dyna"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model.message}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <input
              {...register("type", { required: "Type is required" })}
              placeholder="Truck"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Capacity (kg) <span className="text-red-500">*</span>
            </label>
            <input
              {...register("capacity", {
                required: "Capacity is required",
                validate: (v) => !isNaN(parseFloat(v)) || "Must be a number",
              })}
              placeholder="5000"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            {errors.capacity && (
              <p className="text-xs text-red-500 mt-1">{errors.capacity.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              {...register("status", { required: "Status is required" })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
          </div>

          {/* Actions */}
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
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
