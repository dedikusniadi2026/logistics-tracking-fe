import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSlaDashboardApi, getSlaPoliciesApi, createSlaPolicyApi,
  type CreateSlaPolicyPayload,
} from "../api/sla.api";

export const useSlaDashboard = () =>
  useQuery({ queryKey: ["sla-dashboard"], queryFn: getSlaDashboardApi, refetchInterval: 30_000 });

export const useSlaPolicies = () =>
  useQuery({ queryKey: ["sla-policies"], queryFn: getSlaPoliciesApi });

export const useCreateSlaPolicy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSlaPolicyPayload) => createSlaPolicyApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sla-policies"] });
      qc.invalidateQueries({ queryKey: ["sla-dashboard"] });
    },
  });
};
