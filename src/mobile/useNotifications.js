import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export function useNotifications(userId, enabled = true) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId && enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!userId || !enabled) {
      setNotifications([]);
      setLoading(false);
      setError(null);
      return undefined;
    }
    setLoading(true);
    setError(null);

    return onSnapshot(
      query(
        collection(db, 'notifications'),
        where('recipientUid', '==', userId),
        orderBy('createdAt', 'desc'),
      ),
      (snapshot) => {
        setNotifications(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [userId, enabled, retryVersion]);

  const unread = notifications.filter((item) => !item.read);
  const read = notifications.filter((item) => item.read);

  return { notifications, unread, read, loading, error, retry };
}

export async function markNotificationRead(notificationId) {
  return updateDoc(doc(db, 'notifications', notificationId), {
    read: true,
  });
}

export async function markAllNotificationsRead(userId) {
  if (!userId) throw new Error('Missing user id.');
  const snapshot = await getDocs(query(
    collection(db, 'notifications'),
    where('recipientUid', '==', userId),
    where('read', '==', false),
  ));
  if (snapshot.empty) return 0;
  for (let index = 0; index < snapshot.docs.length; index += 500) {
    const batch = writeBatch(db);
    snapshot.docs.slice(index, index + 500).forEach((item) => {
      batch.update(doc(db, 'notifications', item.id), { read: true });
    });
    await batch.commit();
  }
  return snapshot.size;
}
