export interface ManagerSettings {
  // Device Monitoring
  deviceTimeoutSeconds: number; // 10-60 seconds
  outOfZoneAlertDelaySeconds: number; // 10-120 seconds
  
  // Work Schedule
  breakDurationValue: number;
  breakDurationUnit: 'minutes' | 'hours';
  
  // Display Preferences
  autoRefreshIntervalSeconds: number; // 3-30 seconds
  defaultMapZoom: number; // 10-20
  showOfflineDevices: boolean;
}

export const DEFAULT_SETTINGS: ManagerSettings = {
  deviceTimeoutSeconds: 60,
  outOfZoneAlertDelaySeconds: 30,
  breakDurationValue: 15,
  breakDurationUnit: 'minutes',
  autoRefreshIntervalSeconds: 5,
  defaultMapZoom: 16,
  showOfflineDevices: true,
};

export const SETTINGS_STORAGE_KEY = 'homer-manager-settings';
