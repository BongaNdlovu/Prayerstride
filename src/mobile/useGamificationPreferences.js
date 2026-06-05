import { useCallback, useEffect, useState } from 'react';
import {
  getGamificationPreferences as getGamificationPreferencesApi,
  updateGamificationPreferences as updateGamificationPreferencesApi,
} from './api';

const DEFAULT_PREFERENCES = {
  leaderboardVisible: false,
  darkModeEnabled: false,
  soundHapticsEnabled: true,
  xpNotificationsEnabled: true,
  streakRemindersEnabled: true,
};

export function useGamificationPreferences(userId, enabled = true) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(Boolean(userId && enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!userId || !enabled) {
      setPreferences(DEFAULT_PREFERENCES);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getGamificationPreferencesApi();
        if (cancelled) return;
        setPreferences({ ...DEFAULT_PREFERENCES, ...(result.preferences || {}) });
      } catch (nextError) {
        if (cancelled) return;
        setError(nextError);
        setPreferences(DEFAULT_PREFERENCES);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, retryVersion, userId]);

  return { preferences, loading, error, retry, setPreferences };
}

export async function updateGamificationPreferences(userId, patch) {
  if (!userId) throw new Error('Please sign in before changing gamification preferences.');
  const result = await updateGamificationPreferencesApi(patch);
  return { ...DEFAULT_PREFERENCES, ...(result.preferences || {}) };
}
