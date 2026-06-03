import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { updateNotificationSettings as updateNotificationSettingsApi } from './api';
import { db } from './firebase';

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
    setLoading(true);
    setError(null);

    return onSnapshot(doc(db, 'notificationSettings', userId),
      (snapshot) => {
        setSettings(snapshot.exists() ? snapshot.data() : {});
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [userId, enabled, retryVersion]);

  return { settings, loading, error, retry };
}

export async function updateNotificationSettings(userId, patch) {
  return updateNotificationSettingsApi(patch);
}
