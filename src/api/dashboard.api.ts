import api from "./axios";

export interface DashboardStats {
  totalShipments?: number;
  activeShipments?: number;
  deliveredShipments?: number;
  pendingShipments?: number;
  totalDrivers?: number;
  activeDrivers?: number;
  totalVehicles?: number;
  activeVehicles?: number;
  totalDistance?: number;
  rating?: number;
  reviewCount?: number;
  [key: string]: any;
}

// GET /dashboard/stats
export const dashboardStatsApi = async (): Promise<DashboardStats> => {
  const res = await api.get("/dashboard/stats");
  return res.data;
};
