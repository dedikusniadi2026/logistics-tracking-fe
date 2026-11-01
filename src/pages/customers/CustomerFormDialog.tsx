import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import type { Customer, CreateCustomerPayload, UpdateCustomerPayload } from "../../api/customers.api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerPayload | UpdateCustomerPayload) => void;
  isLoading: boolean;
  editData?: Customer | null;
}

type FormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
  latitude: string;
  longitude: string;
};

export default function CustomerFormDialog({ open, onClose, onSubmit, isLoading, editData }: Props) {
  const isEdit = !!editData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      latitude: "",
      longitude: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (editData) {
        reset({
          name: editData.name,
          email: editData.email ?? "",
          phone: editData.phone,
          address: editData.address,
          latitude: editData.latitude != null ? String(editData.latitude) : "",
          longitude: editData.longitude != null ? String(editData.longitude) : "",
        });
      } else {
        reset({ name: "", email: "", phone: "", address: "", latitude: "", longitude: "" });
      }
    }
  }, [open, editData, reset]);

  const onValid = (values: FormValues) => {
    const payload: CreateCustomerPayload | UpdateCustomerPayload = {
      name: values.name,
      phone: values.phone,
      address: values.address,
      ...(values.email ? { email: values.email } : {}),
      ...(values.latitude !== "" ? { latitude: parseFloat(values.latitude) } : {}),
      ...(values.longitude !== "" ? { longitude: parseFloat(values.longitude) } : {}),
    };
    onSubmit(payload);
  };

  if (!open) return null;

  return (
    /* backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Edit Customer" : "Add New Customer"}
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
              Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              placeholder="John Doe"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email <span className="text-gray-400">(optional)</span>
            </label>
            <input
              {...register("email", {
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
              })}
              type="email"
              placeholder="john@example.com"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
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

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("address", { required: "Address is required" })}
              placeholder="Jl. Contoh No. 1, Jakarta"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 resize-none"
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
          </div>

          {/* Latitude & Longitude */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Latitude <span className="text-gray-400">(optional)</span>
              </label>
              <input
                {...register("latitude", {
                  validate: (v) =>
                    v === "" || !isNaN(parseFloat(v)) || "Must be a number",
                })}
                placeholder="-6.2088"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
              />
              {errors.latitude && <p className="text-xs text-red-500 mt-1">{errors.latitude.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Longitude <span className="text-gray-400">(optional)</span>
              </label>
              <input
                {...register("longitude", {
                  validate: (v) =>
                    v === "" || !isNaN(parseFloat(v)) || "Must be a number",
                })}
                placeholder="106.8456"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
              />
              {errors.longitude && <p className="text-xs text-red-500 mt-1">{errors.longitude.message}</p>}
            </div>
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
              {isEdit ? "Save Changes" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
