import api from "./axios";

export type UserRole = "ADMIN" | "DRIVER" | "CUSTOMER";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: UserRole;
}

export const getUsersApi = async (): Promise<User[]> => {
  const res = await api.get("/users");
  const raw = res.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.value)) return raw.value;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};

export const getUserByIdApi = async (id: number): Promise<User> => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const createUserApi = async (data: CreateUserPayload): Promise<User> => {
  const res = await api.post("/users", data);
  return res.data;
};

export const updateUserApi = async (id: number, data: UpdateUserPayload): Promise<User> => {
  const res = await api.patch(`/users/${id}`, data);
  return res.data;
};

export const deleteUserApi = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};
