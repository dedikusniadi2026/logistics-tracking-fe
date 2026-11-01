import api from "./axios";

export interface TrackingPoint {
  id?: number;
  shipmentId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp?: string;
  status?: string;
}

// GET /tracking/live — returns array of all live positions
export const liveTrackingApi = async (): Promise<TrackingPoint[]> => {
  const res = await api.get("/tracking/live");
  // Backend may return array or wrapped object; normalise to array
  const data = res.data;
  return Array.isArray(data) ? data : (data?.data ?? []);
};

// GET /tracking/live/shipment/{shipmentId}
export const liveTrackingByShipmentApi = async (
  shipmentId: number
): Promise<TrackingPoint> => {
  const res = await api.get(`/tracking/live/shipment/${shipmentId}`);
  return res.data;
};

// GET /tracking/route/shipment/{shipmentId}
export const routeByShipmentApi = async (
  shipmentId: number
): Promise<TrackingPoint[]> => {
  const res = await api.get(`/tracking/route/shipment/${shipmentId}`);
  const data = res.data;
  return Array.isArray(data) ? data : (data?.data ?? []);
};
