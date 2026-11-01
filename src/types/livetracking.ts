export interface LiveVehicle {
  vehicleId: string;
  driver: string;
  driverId?: number;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  status: "ON_DELIVERY" | "AVAILABLE" | "INACTIVE" | "IN_TRANSIT" | "PICKED_UP" | "DELIVERED" | string;
  updatedAt?: string;
  shipmentId?: number;
  originAddress?: string;
  destinationAddress?: string;
  originLat?: number;
  originLng?: number;
  destLat?: number;
  destLng?: number;
  plateNumber?: string;
  model?: string;
  routePath?: [number, number][];
  // enriched fields
  fuel?: number;          // % fuel level (mock when no IoT)
  engineTemp?: number;    // °C
  estimatedDelivery?: string;
  driverPhone?: string;
  driverLicense?: string;
  vehicleType?: string;
  vehicleCapacity?: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  polygon: [number, number][];
  color: [number, number, number, number];
}

export interface GeofenceAlert {
  id: string;
  vehicleId: string;
  zoneId: string;
  zoneName: string;
  type: "ENTERED" | "EXITED";
  timestamp: string;
}

export interface TripWaypoint {
  timestamp: number;
  coordinates: [number, number];
}

export type WsStatus = "connecting" | "connected" | "disconnected" | "error";
