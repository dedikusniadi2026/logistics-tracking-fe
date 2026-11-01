import api from "./axios";

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCustomerPayload {
  name: string;
  email?: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateCustomerPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

function normaliseList<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw?.value)) return raw.value as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  return [];
}

export const getCustomersApi = async (): Promise<Customer[]> => {
  const res = await api.get("/customers");
  return normaliseList<Customer>(res.data);
};

export const getCustomerByIdApi = async (id: number): Promise<Customer> => {
  const res = await api.get(`/customers/${id}`);
  return res.data;
};

export const createCustomerApi = async (data: CreateCustomerPayload): Promise<Customer> => {
  const res = await api.post("/customers", data);
  return res.data;
};

export const updateCustomerApi = async (id: number, data: UpdateCustomerPayload): Promise<Customer> => {
  const res = await api.patch(`/customers/${id}`, data);
  return res.data;
};

export const deleteCustomerApi = async (id: number): Promise<void> => {
  await api.delete(`/customers/${id}`);
};
