import { useCallback, useEffect, useState } from 'react';
import {
  getNotificationSettings,
  updateNotificationSettings as updateNotificationSettingsApi,
} from './api';

export function useNotificationSettings(userId, enabled = true) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(Boolean(userId && enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!userId || !enabled) {
      setSettings({});
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getNotificationSettings();
        if (cancelled) return;
        setSettings(result.settings || {});
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setSettings({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, enabled, retryVersion]);

  return { settings, loading, error, retry };
}

export async function updateNotificationSettings(userId, patch) {
  const result = await updateNotificationSettingsApi(patch);
  return result.settings;
}
