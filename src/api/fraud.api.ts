import api from "./axios";

function normalise<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray((raw as any)?.value)) return (raw as any).value as T[];
  if (Array.isArray((raw as any)?.data)) return (raw as any).data as T[];
  return [];
}

export interface FraudAlert {
  id: number;
  shipmentId?: number;
  rule: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "RESOLVED" | "FALSE_POSITIVE" | "INVESTIGATED";
  description?: string;
  createdAt?: string;
}

export interface FraudSummary {
  total: number;
  open: number;
  critical: number;
  high: number;
  byRule: { rule: string; count: number }[];
}

export type ResolveStatus = "RESOLVED" | "FALSE_POSITIVE" | "INVESTIGATED";

export const getFraudSummaryApi = async (): Promise<FraudSummary> => {
  const res = await api.get("/fraud/summary");
  return res.data as FraudSummary;
};

export const getFraudAlertsApi = async (): Promise<FraudAlert[]> => {
  const res = await api.get("/fraud/alerts");
  return normalise<FraudAlert>(res.data);
};

export const analyzeFraudApi = async (shipmentId: number): Promise<unknown> => {
  const res = await api.get(`/fraud/analyze/${shipmentId}`);
  return res.data;
};

export const resolveFraudAlertApi = async (alertId: number, status: ResolveStatus): Promise<FraudAlert> => {
  const res = await api.patch(`/fraud/alerts/${alertId}/resolve`, { status });
  return res.data;
};
