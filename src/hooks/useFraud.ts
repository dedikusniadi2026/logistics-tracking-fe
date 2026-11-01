import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFraudSummaryApi, getFraudAlertsApi, resolveFraudAlertApi,
  type ResolveStatus,
} from "../api/fraud.api";

export const useFraudSummary = () =>
  useQuery({ queryKey: ["fraud-summary"], queryFn: getFraudSummaryApi, refetchInterval: 30_000 });

export const useFraudAlerts = () =>
  useQuery({ queryKey: ["fraud-alerts"], queryFn: getFraudAlertsApi, refetchInterval: 30_000 });

export const useResolveFraudAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ResolveStatus }) =>
      resolveFraudAlertApi(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fraud-alerts"] });
      qc.invalidateQueries({ queryKey: ["fraud-summary"] });
    },
  });
};
