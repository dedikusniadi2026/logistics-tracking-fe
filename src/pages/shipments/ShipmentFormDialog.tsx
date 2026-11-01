import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import type { Shipment, CreateShipmentPayload, UpdateShipmentPayload } from "../../api/shipments.api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateShipmentPayload | UpdateShipmentPayload) => void;
  isLoading: boolean;
  editData?: Shipment | null;
}

type FormValues = {
  customerId: number;
  driverId: string;
  vehicleId: string;
  originAddress: string;
  destinationAddress: string;
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  estimatedDelivery: string;
  status: string;
};

const STATUSES = [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

export default function ShipmentFormDialog({ open, onClose, onSubmit, isLoading, editData }: Props) {
  const isEdit = !!editData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      customerId: 0,
      driverId: "",
      vehicleId: "",
      originAddress: "",
      destinationAddress: "",
      originLatitude: 0,
      originLongitude: 0,
      destinationLatitude: 0,
      destinationLongitude: 0,
      estimatedDelivery: "",
      status: "PENDING",
    },
  });

  useEffect(() => {
    if (open) {
      if (editData) {
        const estVal = editData.estimatedDelivery
          ? editData.estimatedDelivery.slice(0, 16)
          : "";
        reset({
          customerId: editData.customerId,
          driverId: editData.driverId != null ? String(editData.driverId) : "",
          vehicleId: editData.vehicleId != null ? String(editData.vehicleId) : "",
          originAddress: editData.originAddress,
          destinationAddress: editData.destinationAddress,
          originLatitude: editData.originLatitude,
          originLongitude: editData.originLongitude,
          destinationLatitude: editData.destinationLatitude,
          destinationLongitude: editData.destinationLongitude,
          estimatedDelivery: estVal,
          status: editData.status,
        });
      } else {
        reset({
          customerId: 0,
          driverId: "",
          vehicleId: "",
          originAddress: "",
          destinationAddress: "",
          originLatitude: 0,
          originLongitude: 0,
          destinationLatitude: 0,
          destinationLongitude: 0,
          estimatedDelivery: "",
          status: "PENDING",
        });
      }
    }
  }, [open, editData, reset]);

  const onValid = (values: FormValues) => {
    if (isEdit) {
      const payload: UpdateShipmentPayload = {
        ...(values.driverId ? { driverId: Number(values.driverId) } : {}),
        ...(values.vehicleId ? { vehicleId: Number(values.vehicleId) } : {}),
        status: values.status,
        ...(values.estimatedDelivery
          ? { estimatedDelivery: new Date(values.estimatedDelivery).toISOString() }
          : {}),
      };
      onSubmit(payload);
    } else {
      const payload: CreateShipmentPayload = {
        customerId: Number(values.customerId),
        ...(values.driverId ? { driverId: Number(values.driverId) } : {}),
        ...(values.vehicleId ? { vehicleId: Number(values.vehicleId) } : {}),
        originAddress: values.originAddress,
        destinationAddress: values.destinationAddress,
        originLatitude: Number(values.originLatitude),
        originLongitude: Number(values.originLongitude),
        destinationLatitude: Number(values.destinationLatitude),
        destinationLongitude: Number(values.destinationLongitude),
        ...(values.estimatedDelivery
          ? { estimatedDelivery: new Date(values.estimatedDelivery).toISOString() }
          : {}),
      };
      onSubmit(payload);
    }
  };

  if (!open) return null;

  const inputCls =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Edit Shipment" : "Add New Shipment"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          {/* Customer ID */}
          {!isEdit && (
            <div>
              <label className={labelCls}>
                Customer ID <span className="text-red-500">*</span>
              </label>
              <input
                {...register("customerId", {
                  required: "Customer ID is required",
                  min: { value: 1, message: "Must be > 0" },
                })}
                type="number"
                placeholder="1"
                className={inputCls}
              />
              {errors.customerId && (
                <p className="text-xs text-red-500 mt-1">{errors.customerId.message}</p>
              )}
            </div>
          )}

          {/* Driver ID */}
          <div>
            <label className={labelCls}>Driver ID (optional)</label>
            <input
              {...register("driverId")}
              type="number"
              placeholder="Leave blank if unassigned"
              className={inputCls}
            />
          </div>

          {/* Vehicle ID */}
          <div>
            <label className={labelCls}>Vehicle ID (optional)</label>
            <input
              {...register("vehicleId")}
              type="number"
              placeholder="Leave blank if unassigned"
              className={inputCls}
            />
          </div>

          {/* Origin & Destination Addresses */}
          {!isEdit && (
            <>
              <div>
                <label className={labelCls}>
                  Origin Address <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("originAddress", { required: "Origin address is required" })}
                  placeholder="Jl. Sudirman No. 1, Jakarta"
                  className={inputCls}
                />
                {errors.originAddress && (
                  <p className="text-xs text-red-500 mt-1">{errors.originAddress.message}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>
                  Destination Address <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("destinationAddress", { required: "Destination address is required" })}
                  placeholder="Jl. Gatot Subroto No. 5, Bandung"
                  className={inputCls}
                />
                {errors.destinationAddress && (
                  <p className="text-xs text-red-500 mt-1">{errors.destinationAddress.message}</p>
                )}
              </div>

              {/* Coordinates row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    Origin Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("originLatitude", { required: "Required" })}
                    type="number"
                    step="any"
                    placeholder="-6.2"
                    className={inputCls}
                  />
                  {errors.originLatitude && (
                    <p className="text-xs text-red-500 mt-1">{errors.originLatitude.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>
                    Origin Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("originLongitude", { required: "Required" })}
                    type="number"
                    step="any"
                    placeholder="106.8"
                    className={inputCls}
                  />
                  {errors.originLongitude && (
                    <p className="text-xs text-red-500 mt-1">{errors.originLongitude.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    Destination Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("destinationLatitude", { required: "Required" })}
                    type="number"
                    step="any"
                    placeholder="-6.9"
                    className={inputCls}
                  />
                  {errors.destinationLatitude && (
                    <p className="text-xs text-red-500 mt-1">{errors.destinationLatitude.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>
                    Destination Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("destinationLongitude", { required: "Required" })}
                    type="number"
                    step="any"
                    placeholder="107.6"
                    className={inputCls}
                  />
                  {errors.destinationLongitude && (
                    <p className="text-xs text-red-500 mt-1">{errors.destinationLongitude.message}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Estimated Delivery */}
          <div>
            <label className={labelCls}>Estimated Delivery (optional)</label>
            <input
              {...register("estimatedDelivery")}
              type="datetime-local"
              className={inputCls}
            />
          </div>

          {/* Status — edit only */}
          {isEdit && (
            <div>
              <label className={labelCls}>
                Status <span className="text-red-500">*</span>
              </label>
              <select
                {...register("status", { required: "Status is required" })}
                className={`${inputCls} bg-white`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>
              )}
            </div>
          )}

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
              {isEdit ? "Save Changes" : "Add Shipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
