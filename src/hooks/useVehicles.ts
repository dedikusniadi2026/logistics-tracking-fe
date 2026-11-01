import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  vehiclesApi,
  createVehicleApi,
  updateVehicleApi,
  deleteVehicleApi,
  type CreateVehiclePayload,
  type UpdateVehiclePayload,
} from "../api/vehicles.api";

const QUERY_KEY = ["vehicles"];

export const useVehicles = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: vehiclesApi,
  });

export const useCreateVehicle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVehiclePayload) => createVehicleApi(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateVehicle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVehiclePayload }) =>
      updateVehicleApi(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteVehicle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteVehicleApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
