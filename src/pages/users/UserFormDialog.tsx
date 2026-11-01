import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import type { User, CreateUserPayload, UpdateUserPayload } from "../../api/users.api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => void;
  isLoading: boolean;
  editData?: User | null;
}

type FormValues = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "ADMIN" | "DRIVER" | "CUSTOMER";
};

const ROLES = ["ADMIN", "DRIVER", "CUSTOMER"] as const;

export default function UserFormDialog({ open, onClose, onSubmit, isLoading, editData }: Props) {
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
      password: "",
      phone: "",
      role: "DRIVER",
    },
  });

  useEffect(() => {
    if (open) {
      if (editData) {
        reset({
          name: editData.name,
          email: editData.email,
          password: "",
          phone: editData.phone,
          role: editData.role,
        });
      } else {
        reset({ name: "", email: "", password: "", phone: "", role: "DRIVER" });
      }
    }
  }, [open, editData, reset]);

  const onValid = (values: FormValues) => {
    if (isEdit) {
      // only send password if filled
      const payload: UpdateUserPayload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        ...(values.password ? { password: values.password } : {}),
      };
      onSubmit(payload);
    } else {
      onSubmit(values as CreateUserPayload);
    }
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
            {isEdit ? "Edit User" : "Add New User"}
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
              placeholder="John Doe"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
              })}
              type="email"
              placeholder="john@example.com"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Password {!isEdit && <span className="text-red-500">*</span>}
              {isEdit && <span className="text-gray-400">(leave blank to keep current)</span>}
            </label>
            <input
              {...register("password", {
                required: isEdit ? false : "Password is required",
                minLength: { value: 6, message: "Min 6 characters" },
              })}
              type="password"
              placeholder="••••••"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
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

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              {...register("role", { required: "Role is required" })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
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
              {isEdit ? "Save Changes" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
