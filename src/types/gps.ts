export interface GPSLocation {
  id?: number;
  device_id: string;
  latitude: number;
  longitude: number;
  ax: number;
  ay: number;
  az: number;
  timestamp: string;
  locationSource?: 'GPS' | 'PEER' | 'NONE';
  peerDistance?: number;
  pairId?: number;
}

export interface Geofence {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  radius: number;
  color: string;
}

export interface PolygonFence {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number }[];
  color: string;
  shiftStart: string;
  shiftEnd: string;
}

export interface WorkerAssignment {
  id: string;
  workerId: string;
  fenceId: string;
  jobLabel: string;
}

export interface DeviceStatus {
  device_id: string;
  isOnline: boolean;
  lastUpdate: Date;
  currentPosition: { lat: number; lng: number };
  accelerometer: { ax: number; ay: number; az: number };
}
