import api from "./axios";

function normalise<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray((raw as any)?.value)) return (raw as any).value as T[];
  if (Array.isArray((raw as any)?.data)) return (raw as any).data as T[];
  return [];
}

export interface SlaPolicy {
  id: number;
  name: string;
  maxDeliveryHours: number;
  warningThresholdPercent?: number;
  createdAt?: string;
}

export interface SlaShipment {
  shipmentId: number;
  shipmentNumber: string;
  status: string;
  slaStatus: "ON_TIME" | "WARNING" | "BREACHED";
  elapsedHours: number;
  remainingHours: number;
  slaMaxHours: number;
  percentElapsed: number;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

export interface SlaDashboard {
  policy: { id: number | null; name: string; maxDeliveryHours: number };
  summary: { total: number; breached: number; warning: number; onTime: number; breachRate: number };
  breached: SlaShipment[];
  warning: SlaShipment[];
  onTime: SlaShipment[];
  generatedAt: string;
}

export interface CreateSlaPolicyPayload {
  name: string;
  maxDeliveryHours: number;
  warningThresholdPercent?: number;
}

export const getSlaDashboardApi = async (): Promise<SlaDashboard> => {
  const res = await api.get("/sla/dashboard");
  return res.data as SlaDashboard;
};

export const getSlaPoliciesApi = async (): Promise<SlaPolicy[]> => {
  const res = await api.get("/sla/policies");
  return normalise<SlaPolicy>(res.data);
};

export const createSlaPolicyApi = async (data: CreateSlaPolicyPayload): Promise<SlaPolicy> => {
  const res = await api.post("/sla/policies", data);
  return res.data;
};

export const getSlaByShipmentApi = async (shipmentId: number): Promise<SlaShipment> => {
  const res = await api.get(`/sla/shipments/${shipmentId}`);
  return res.data;
};
