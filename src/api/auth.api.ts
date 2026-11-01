import api from "../api/axios";

export const loginApi = async (
  username: string,
  password: string
) => {
  const res = await api.post("/auth/login", {
    username,
    password,
  });

  return res.data;
};