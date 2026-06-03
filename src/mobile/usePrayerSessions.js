import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPrayerSession as createPrayerSessionApi, getDeviceTimeZone, getPrayerSessions } from './api';

export function usePrayerSessions(userId, enabled = true) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId && enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!userId || !enabled) {
      setSessions([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getPrayerSessions();
        if (cancelled) return;
        setSessions(result.sessions || []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setSessions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, enabled, retryVersion]);

  const totalSeconds = useMemo(
    () => sessions.reduce((sum, session) => sum + Number(session.seconds || 0), 0),
    [sessions],
  );

  return { sessions, totalSeconds, loading, error, retry };
}

export async function addPrayerSession({ prayerId, title, seconds, timeZone }, user) {
  if (!user) throw new Error('Please sign in before saving prayer time.');
  if (!seconds) throw new Error('Start the timer before completing a session.');
  if (!prayerId) throw new Error('Open a real prayer request before saving prayer time.');

  const result = await createPrayerSessionApi({
    prayerId,
    title: title || 'Prayer session',
    seconds,
    timeZone: timeZone || getDeviceTimeZone(),
  });
  return result;
}
