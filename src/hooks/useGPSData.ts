import { useState, useEffect, useCallback } from 'react';
import { GPSLocation } from '@/types/gps';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error: sbError } = await supabase
        .from('latest_device_locations')
        .select('*');
      
      if (sbError) {
        throw new Error(sbError.message);
      }
      
      if (data) {
        setLocations(data.map((loc) => ({
          device_id: loc.device_id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          timestamp: loc.created_at,
          ax: loc.ax || 0,
          ay: loc.ay || 0,
          az: loc.az || 0,
          locationSource: loc.src || 'GPS',
          peerDistance: loc.p_dist || 0,
          pairId: loc.pair_id || 0,
        })));
        setLastUpdate(new Date());
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
