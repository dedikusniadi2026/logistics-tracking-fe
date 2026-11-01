import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWarehousesApi, createWarehouseApi, updateWarehouseApi, deleteWarehouseApi,
  getLowStockApi, getDistributionApi, createInventoryApi, adjustStockApi,
  type CreateWarehousePayload, type CreateInventoryPayload, type AdjustStockPayload,
} from "../api/wms.api";

export const useWarehouses = () =>
  useQuery({ queryKey: ["warehouses"], queryFn: getWarehousesApi });

export const useLowStock = () =>
  useQuery({ queryKey: ["low-stock"], queryFn: getLowStockApi });

export const useDistribution = () =>
  useQuery({ queryKey: ["distribution"], queryFn: getDistributionApi });

export const useCreateWarehouse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWarehousePayload) => createWarehouseApi(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["warehouses"] }),
  });
};

export const useUpdateWarehouse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateWarehousePayload> }) =>
      updateWarehouseApi(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["warehouses"] }),
  });
};

export const useDeleteWarehouse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteWarehouseApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["warehouses"] }),
  });
};

export const useCreateInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInventoryPayload) => createInventoryApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["warehouses"] });
      qc.invalidateQueries({ queryKey: ["low-stock"] });
    },
  });
};

export const useAdjustStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdjustStockPayload }) =>
      adjustStockApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["warehouses"] });
      qc.invalidateQueries({ queryKey: ["low-stock"] });
    },
  });
};
