import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import {
  markAllNotificationsRead as markAllNotificationsReadApi,
  markNotificationRead as markNotificationReadApi,
} from './api';
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
  return markNotificationReadApi(notificationId);
}

export async function markAllNotificationsRead(userId) {
  if (!userId) throw new Error('Missing user id.');
  const result = await markAllNotificationsReadApi();
  return result.count ?? 0;
}
