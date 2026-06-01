import { useCallback, useEffect, useState } from 'react';
import { getDeviceTimeZone, getWeeklyEncouragers } from './api';

export function useWeeklyEncouragers(userId, enabled = true) {
  const active = Boolean(userId && enabled);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(active);
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);

  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!active) {
      setData(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getWeeklyEncouragers(getDeviceTimeZone())
      .then((next) => {
        if (!cancelled) setData(next);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [active, retryVersion]);

  return { data, loading, error, retry };
}
