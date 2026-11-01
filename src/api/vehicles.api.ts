import api from "./axios";

export interface Vehicle {
  id: number;
  plateNumber: string;
  model: string;
  type: string;
  capacity: number;
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehiclePayload {
  plateNumber: string;
  model: string;
  type: string;
  capacity: number;
  status?: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
}

export interface UpdateVehiclePayload {
  plateNumber?: string;
  model?: string;
  type?: string;
  capacity?: number;
  status?: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
}

function normaliseList<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw?.value)) return raw.value as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  return [];
}

export const vehiclesApi = async (): Promise<Vehicle[]> => {
  const res = await api.get("/vehicles");
  return normaliseList<Vehicle>(res.data);
};

export const vehicleByIdApi = async (id: number): Promise<Vehicle> => {
  const res = await api.get(`/vehicles/${id}`);
  return res.data;
};

export const createVehicleApi = async (data: CreateVehiclePayload): Promise<Vehicle> => {
  const res = await api.post("/vehicles", data);
  return res.data;
};

export const updateVehicleApi = async (id: number, data: UpdateVehiclePayload): Promise<Vehicle> => {
  const res = await api.patch(`/vehicles/${id}`, data);
  return res.data;
};

export const deleteVehicleApi = async (id: number): Promise<void> => {
  await api.delete(`/vehicles/${id}`);
};
