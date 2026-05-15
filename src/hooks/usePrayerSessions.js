import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext.jsx';

export function usePrayerSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    return onSnapshot(
      query(
        collection(db, 'prayerSessions'),
        where('authorUid', '==', user.uid),
        orderBy('createdAt', 'desc'),
      ),
      (snapshot) => {
        setSessions(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [reloadKey, user]);

  const retry = useCallback(() => setReloadKey((value) => value + 1), []);
  const totalSeconds = useMemo(
    () => sessions.reduce((sum, session) => sum + Number(session.seconds || 0), 0),
    [sessions],
  );

  return { sessions, totalSeconds, loading, error, retry };
}

export async function addPrayerSession({ prayerId, title, seconds }, user) {
  if (!user) throw new Error('Please sign in before saving prayer time.');
  if (!seconds) throw new Error('Start the timer before completing a session.');

  return addDoc(collection(db, 'prayerSessions'), {
    authorUid: user.uid,
    prayerId: prayerId || null,
    title: title || 'Prayer session',
    seconds,
    createdAt: serverTimestamp(),
  });
}
