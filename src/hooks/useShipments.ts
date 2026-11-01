import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  shipmentsApi,
  createShipmentApi,
  updateShipmentApi,
  deleteShipmentApi,
  getDeliveryHistoryApi,
  type CreateShipmentPayload,
  type UpdateShipmentPayload,
} from "../api/shipments.api";

const QUERY_KEY = ["shipments"];

export const useShipments = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: shipmentsApi,
  });

export const useCreateShipment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShipmentPayload) => createShipmentApi(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateShipment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateShipmentPayload }) =>
      updateShipmentApi(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteShipment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteShipmentApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeliveryHistory = (shipmentId: number) =>
  useQuery({
    queryKey: ["delivery-history", shipmentId],
    queryFn: () => getDeliveryHistoryApi(shipmentId),
    enabled: shipmentId > 0,
  });
