import api from "./axios";

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const updateProfileApi = async (data: UpdateProfilePayload) => {
  const res = await api.patch("/auth/profile", data);
  return res.data;
};

export const changePasswordApi = async (data: ChangePasswordPayload) => {
  const res = await api.post("/auth/change-password", data);
  return res.data;
};

export const uploadAvatarApi = async (file: File): Promise<{ avatarUrl?: string; avatar?: string; user?: any }> => {
  const formData = new FormData();
  formData.append("file", file);
  // Axios auto-sets multipart/form-data with boundary when body is FormData
  const res = await api.post("/auth/avatar", formData);
  return res.data;
};
