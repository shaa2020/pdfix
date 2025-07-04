
import { useState, useEffect } from 'react';

interface UseAdTimerProps {
  refreshInterval?: number; // in seconds
  isAdFree: boolean;
}

export const useAdTimer = ({ refreshInterval = 30, isAdFree }: UseAdTimerProps) => {
  const [adKey, setAdKey] = useState(0);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(refreshInterval);

  useEffect(() => {
    if (isAdFree) return;

    const timer = setInterval(() => {
      setTimeUntilRefresh((prev) => {
        if (prev <= 1) {
          setAdKey((prevKey) => prevKey + 1);
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshInterval, isAdFree]);

  return {
    adKey,
    timeUntilRefresh,
    refreshAd: () => {
      setAdKey((prev) => prev + 1);
      setTimeUntilRefresh(refreshInterval);
    }
  };
};
