import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "../api/users.api";

const QUERY_KEY = ["users"];

export const useUsers = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: getUsersApi,
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserPayload) => createUserApi(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserPayload }) =>
      updateUserApi(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUserApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
