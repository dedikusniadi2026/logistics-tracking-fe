import api from "./axios";
import type { Driver } from "./drivers.api";
import type { Vehicle } from "./vehicles.api";

export interface Customer {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export interface Shipment {
  id: number;
  shipmentNumber?: string;
  customerId: number;
  driverId?: number;
  vehicleId?: number;
  originAddress: string;
  destinationAddress: string;
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  estimatedDelivery?: string;
  actualDelivery?: string;
  status: "PENDING" | "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED" | "OUT_FOR_DELIVERY" | string;
  createdAt?: string;
  updatedAt?: string;
  driver?: Driver;
  vehicle?: Vehicle;
  customer?: Customer;
}

/** Normalise berbagai bentuk response: array, { value: [] }, { data: [] } */
function normaliseList<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw?.value)) return raw.value as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  return [];
}

export const shipmentsApi = async (): Promise<Shipment[]> => {
  const res = await api.get("/shipments");
  return normaliseList<Shipment>(res.data);
};

export const shipmentByIdApi = async (id: number): Promise<Shipment> => {
  const res = await api.get(`/shipments/${id}`);
  return res.data;
};

export interface CreateShipmentPayload {
  customerId: number;
  driverId?: number;
  vehicleId?: number;
  originAddress: string;
  destinationAddress: string;
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  estimatedDelivery?: string;
}

export interface UpdateShipmentPayload {
  driverId?: number;
  vehicleId?: number;
  status?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

export const createShipmentApi = async (data: CreateShipmentPayload): Promise<Shipment> => {
  const res = await api.post("/shipments", data);
  return res.data;
};

export const updateShipmentApi = async (id: number, data: UpdateShipmentPayload): Promise<Shipment> => {
  const res = await api.patch(`/shipments/${id}`, data);
  return res.data;
};

export const deleteShipmentApi = async (id: number): Promise<void> => {
  await api.delete(`/shipments/${id}`);
};

export interface DeliveryHistory {
  id: number;
  shipmentId: number;
  status: string;
  description?: string;
  createdAt?: string;
}

export const getDeliveryHistoryApi = async (shipmentId: number): Promise<DeliveryHistory[]> => {
  const res = await api.get(`/delivery-history/shipment/${shipmentId}`);
  return normaliseList<DeliveryHistory>(res.data);
};
