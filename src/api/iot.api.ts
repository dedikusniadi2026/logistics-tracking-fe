import api from "./axios";

function normalise<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray((raw as any)?.value)) return (raw as any).value as T[];
  if (Array.isArray((raw as any)?.data)) return (raw as any).data as T[];
  return [];
}

export interface IotDevice {
  id?: number;
  deviceId: string;
  imei: string;
  vehicleId?: number;
  driverId?: number;
  firmwareVersion?: string;
  reportIntervalSecs?: number;
  status?: "ACTIVE" | "INACTIVE" | "OFFLINE";
  batteryLevel?: number;
  lastSeen?: string;
  latitude?: number;
  longitude?: number;
  speed?: number;
}

export interface RegisterIotDevicePayload {
  deviceId: string;
  imei: string;
  vehicleId?: number;
  driverId?: number;
  firmwareVersion?: string;
  reportIntervalSecs?: number;
}

export interface IotTelemetryPayload {
  deviceId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  signalStrength?: number;
  timestamp?: string;
}

export const getIotDevicesApi = async (): Promise<IotDevice[]> => {
  const res = await api.get("/iot/devices");
  return normalise<IotDevice>(res.data);
};

export const getIotFleetApi = async (): Promise<IotDevice[]> => {
  const res = await api.get("/iot/fleet");
  return normalise<IotDevice>(res.data);
};

export const getIotDeviceByIdApi = async (deviceId: string): Promise<IotDevice> => {
  const res = await api.get(`/iot/devices/${deviceId}`);
  return res.data;
};

export const registerIotDeviceApi = async (data: RegisterIotDevicePayload): Promise<IotDevice> => {
  const res = await api.post("/iot/devices", data);
  return res.data;
};

export const submitTelemetryApi = async (data: IotTelemetryPayload): Promise<unknown> => {
  const res = await api.post("/iot/telemetry", data);
  return res.data;
};
