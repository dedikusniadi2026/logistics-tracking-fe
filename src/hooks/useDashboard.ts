import { useQuery } from "@tanstack/react-query";
import { dashboardStatsApi } from "../api/dashboard.api";
import { shipmentsApi } from "../api/shipments.api";
import { vehiclesApi } from "../api/vehicles.api";
import { driversApi } from "../api/drivers.api";
import { liveTrackingApi } from "../api/tracking.api";

export const useDashboardStats = () =>
  useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardStatsApi,
    refetchInterval: 30_000,
  });

export const useShipments = () =>
  useQuery({
    queryKey: ["shipments"],
    queryFn: shipmentsApi,
    refetchInterval: 30_000,
  });

export const useVehicles = () =>
  useQuery({
    queryKey: ["vehicles"],
    queryFn: vehiclesApi,
  });

export const useDrivers = () =>
  useQuery({
    queryKey: ["drivers"],
    queryFn: driversApi,
  });

export const useLiveTracking = () =>
  useQuery({
    queryKey: ["live-tracking"],
    queryFn: liveTrackingApi,
    refetchInterval: 10_000,
  });
