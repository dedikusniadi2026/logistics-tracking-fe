import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  driversApi,
  createDriverApi,
  updateDriverApi,
  deleteDriverApi,
  type CreateDriverPayload,
  type UpdateDriverPayload,
} from "../api/drivers.api";

const QUERY_KEY = ["drivers"];

export const useDrivers = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: driversApi,
  });

export const useCreateDriver = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDriverPayload) => createDriverApi(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateDriver = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDriverPayload }) =>
      updateDriverApi(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteDriver = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDriverApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
