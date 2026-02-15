import { useState, useCallback } from 'react';
import { GPSLocation } from '@/types/gps';
import { supabase } from '@/integrations/supabase/client';

interface UseDeviceHistoryReturn {
  history: GPSLocation[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: (deviceId: string) => Promise<void>;
  clearHistory: () => void;
}

export const useDeviceHistory = (): UseDeviceHistoryReturn => {
  const [history, setHistory] = useState<GPSLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (deviceId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: sbError } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (sbError) {
        throw new Error(sbError.message);
      }
      
      if (data) {
        setHistory(data.map((loc) => ({
          device_id: loc.device_id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          timestamp: loc.created_at,
          ax: loc.ax || 0,
          ay: loc.ay || 0,
          az: loc.az || 0,
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    isLoading,
    error,
    fetchHistory,
    clearHistory,
  };
};
