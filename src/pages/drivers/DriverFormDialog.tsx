import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import type { Driver, CreateDriverPayload, UpdateDriverPayload } from "../../api/drivers.api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDriverPayload | UpdateDriverPayload) => void;
  isLoading: boolean;
  editData?: Driver | null;
}

type FormValues = {
  name: string;
  phone: string;
  licenseNumber: string;
  status: "AVAILABLE" | "ON_DELIVERY" | "INACTIVE";
};

const STATUSES = ["AVAILABLE", "ON_DELIVERY", "INACTIVE"] as const;

export default function DriverFormDialog({ open, onClose, onSubmit, isLoading, editData }: Props) {
  const isEdit = !!editData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      phone: "",
      licenseNumber: "",
      status: "AVAILABLE",
    },
  });

  useEffect(() => {
    if (open) {
      if (editData) {
        reset({
          name: editData.name,
          phone: editData.phone,
          licenseNumber: editData.licenseNumber,
          status: editData.status,
        });
      } else {
        reset({ name: "", phone: "", licenseNumber: "", status: "AVAILABLE" });
      }
    }
  }, [open, editData, reset]);

  const onValid = (values: FormValues) => {
    onSubmit(values);
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
            {isEdit ? "Edit Driver" : "Add New Driver"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              placeholder="Budi Santoso"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              {...register("phone", { required: "Phone is required" })}
              placeholder="081234567890"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          {/* License Number */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              License Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register("licenseNumber", { required: "License number is required" })}
              placeholder="1234567890123456"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            {errors.licenseNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.licenseNumber.message}</p>
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
                  {s.replace("_", " ")}
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
              {isEdit ? "Save Changes" : "Add Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
