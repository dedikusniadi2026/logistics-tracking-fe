import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomersApi,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
  type CreateCustomerPayload,
  type UpdateCustomerPayload,
} from "../api/customers.api";

const QUERY_KEY = ["customers"];

export const useCustomers = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: getCustomersApi,
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerPayload) => createCustomerApi(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCustomerPayload }) =>
      updateCustomerApi(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCustomerApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
