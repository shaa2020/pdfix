
import { useState, useEffect } from 'react';

export const useAdFree = () => {
  const [isAdFree, setIsAdFree] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdFreeStatus = () => {
      const adFreeStatus = localStorage.getItem('isAdFree');
      setIsAdFree(adFreeStatus === 'true');
      setLoading(false);
    };

    checkAdFreeStatus();
  }, []);

  const enableAdFree = () => {
    localStorage.setItem('isAdFree', 'true');
    setIsAdFree(true);
  };

  const disableAdFree = () => {
    localStorage.setItem('isAdFree', 'false');
    setIsAdFree(false);
  };

  return {
    isAdFree,
    loading,
    enableAdFree,
    disableAdFree
  };
};
