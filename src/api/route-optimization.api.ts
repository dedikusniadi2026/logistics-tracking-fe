import api from "./axios";

export interface Coordinate { latitude: number; longitude: number; }

export interface OptimizeRoutePayload {
  origin: Coordinate;
  destinations: Coordinate[];
  optimizeFor?: "distance" | "time" | "fuel";
  driverId?: number;
}

export interface OptimizeRouteResult {
  totalDistance?: number;
  estimatedTime?: number;
  fuelEstimate?: number;
  savings?: number;
  orderedRoute?: Array<{ index: number; latitude: number; longitude: number; label?: string }>;
  [key: string]: unknown;
}

export interface AutoDispatchPayload {
  shipmentIds: number[];
  strategy?: "nearest" | "balanced" | "priority";
}

export const optimizeRouteApi = async (data: OptimizeRoutePayload): Promise<OptimizeRouteResult> => {
  const res = await api.post("/route-optimization/optimize", data);
  return res.data;
};

export const autoDispatchApi = async (data: AutoDispatchPayload): Promise<unknown> => {
  const res = await api.post("/route-optimization/auto-dispatch", data);
  return res.data;
};
