import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export function usePrayerSessions(userId, enabled = true) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId && enabled));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !enabled) {
      setSessions([]);
      setLoading(false);
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
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [userId, enabled]);

  const totalSeconds = useMemo(
    () => sessions.reduce((sum, session) => sum + Number(session.seconds || 0), 0),
    [sessions],
  );

  return { sessions, totalSeconds, loading, error };
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
