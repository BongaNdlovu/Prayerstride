import { useCallback, useEffect, useState } from 'react';
import { getGamificationLeaderboard } from './api';

const EMPTY_LEADERBOARD = {
  scope: 'weekly',
  resetAt: null,
  rows: [],
  me: null,
};

export function useLeaderboard(scope = 'weekly', userId, enabled = true) {
  const [leaderboard, setLeaderboard] = useState({ ...EMPTY_LEADERBOARD, scope });
  const [loading, setLoading] = useState(Boolean(userId && enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!userId || !enabled) {
      setLeaderboard({ ...EMPTY_LEADERBOARD, scope });
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getGamificationLeaderboard(scope);
        if (cancelled) return;
        setLeaderboard({
          scope: result.scope || scope,
          resetAt: result.resetAt || null,
          rows: result.rows || [],
          me: result.me || null,
        });
      } catch (nextError) {
        if (cancelled) return;
        setError(nextError);
        setLeaderboard({ ...EMPTY_LEADERBOARD, scope });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, retryVersion, scope, userId]);

  return { leaderboard, loading, error, retry };
}
