import { useEffect, useState } from 'react';

export const DASHBOARD_PRESETS_LOADING_DELAY_MS = 2000;

export const useDashboardPresets = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLoading(false);
    }, DASHBOARD_PRESETS_LOADING_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return {
    presets: [],
    loading,
  };
};
