import { useState, useEffect, useCallback } from 'react';
import { GPSLocation } from '@/types/gps';
import { API_ENDPOINTS } from '@/config/api';

interface UseGPSDataOptions {
  refreshIntervalSeconds?: number;
}

interface UseGPSDataReturn {
  locations: GPSLocation[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
  isAutoRefresh: boolean;
  setAutoRefresh: (enabled: boolean) => void;
}

export const useGPSData = (options: UseGPSDataOptions = {}): UseGPSDataReturn => {
  const { refreshIntervalSeconds = 5 } = options;
  const [locations, setLocations] = useState<GPSLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isAutoRefresh, setAutoRefresh] = useState(true);

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.getLocations, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.devices)) {
        setLocations(data.devices.map((loc: any) => ({
          device_id: loc.device_id,
          latitude: parseFloat(loc.lat || loc.latitude),
          longitude: parseFloat(loc.lon || loc.longitude),
          timestamp: loc.reading_time || loc.timestamp,
          ax: parseFloat(loc.ax) || 0,
          ay: parseFloat(loc.ay) || 0,
          az: parseFloat(loc.az) || 0,
          locationSource: loc.src || 'GPS',
          peerDistance: parseFloat(loc.p_dist) || 0,
          pairId: parseInt(loc.Pair_id) || 0,
        })));
        setLastUpdate(new Date());
      } else {
        throw new Error(data.message || 'Failed to fetch locations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Auto-refresh with configurable interval
  useEffect(() => {
    if (!isAutoRefresh) return;
    
    const intervalMs = refreshIntervalSeconds * 1000;
    const interval = setInterval(fetchLocations, intervalMs);
    return () => clearInterval(interval);
  }, [isAutoRefresh, fetchLocations, refreshIntervalSeconds]);

  return {
    locations,
    isLoading,
    error,
    lastUpdate,
    refresh: fetchLocations,
    isAutoRefresh,
    setAutoRefresh,
  };
};
