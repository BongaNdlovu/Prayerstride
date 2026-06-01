import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { createPrayerSession as createPrayerSessionApi, getDeviceTimeZone } from './api';
import { db } from './firebase';

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

    setLoading(true);
    setError(null);

    return onSnapshot(
      query(
        collection(db, 'prayerSessions'),
        where('authorUid', '==', userId),
        orderBy('createdAt', 'desc'),
      ),
      (snapshot) => {
        setSessions(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
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

  return createPrayerSessionApi({
    prayerId,
    title: title || 'Prayer session',
    seconds,
    timeZone: timeZone || getDeviceTimeZone(),
  });
}
