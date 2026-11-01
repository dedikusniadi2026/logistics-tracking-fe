import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getIotDevicesApi, getIotFleetApi, registerIotDeviceApi, submitTelemetryApi,
  type RegisterIotDevicePayload, type IotTelemetryPayload,
} from "../api/iot.api";

export const useIotDevices = () =>
  useQuery({ queryKey: ["iot-devices"], queryFn: getIotDevicesApi, refetchInterval: 15_000 });

export const useIotFleet = () =>
  useQuery({ queryKey: ["iot-fleet"], queryFn: getIotFleetApi, refetchInterval: 10_000 });

export const useRegisterIotDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterIotDevicePayload) => registerIotDeviceApi(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["iot-devices"] }),
  });
};

export const useSubmitTelemetry = () =>
  useMutation({
    mutationFn: (data: IotTelemetryPayload) => submitTelemetryApi(data),
  });
