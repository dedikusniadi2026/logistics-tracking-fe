import api from "./axios";

export interface Driver {
  id: number;
  name: string;
  phone: string;
  licenseNumber: string;
  status: "AVAILABLE" | "ON_DELIVERY" | "INACTIVE";
  createdAt?: string;
}

export interface CreateDriverPayload {
  name: string;
  phone: string;
  licenseNumber: string;
  status?: "AVAILABLE" | "ON_DELIVERY" | "INACTIVE";
}

export interface UpdateDriverPayload {
  name?: string;
  phone?: string;
  licenseNumber?: string;
  status?: "AVAILABLE" | "ON_DELIVERY" | "INACTIVE";
}

function normaliseList<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw?.value)) return raw.value as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  return [];
}

export const driversApi = async (): Promise<Driver[]> => {
  const res = await api.get("/drivers");
  return normaliseList<Driver>(res.data);
};

export const driverByIdApi = async (id: number): Promise<Driver> => {
  const res = await api.get(`/drivers/${id}`);
  return res.data;
};

export const createDriverApi = async (data: CreateDriverPayload): Promise<Driver> => {
  const res = await api.post("/drivers", data);
  return res.data;
};

export const updateDriverApi = async (id: number, data: UpdateDriverPayload): Promise<Driver> => {
  const res = await api.patch(`/drivers/${id}`, data);
  return res.data;
};

export const deleteDriverApi = async (id: number): Promise<void> => {
  await api.delete(`/drivers/${id}`);
};
