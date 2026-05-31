import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export function useNotifications(userId, enabled = true) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId && enabled));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !enabled) {
      setNotifications([]);
      setLoading(false);
      return undefined;
    }

    return onSnapshot(
      query(
        collection(db, 'notifications'),
        where('recipientUid', '==', userId),
        orderBy('createdAt', 'desc'),
      ),
      (snapshot) => {
        setNotifications(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [userId, enabled]);

  const unread = notifications.filter((item) => !item.read);
  const read = notifications.filter((item) => item.read);

  return { notifications, unread, read, loading, error };
}

export async function markNotificationRead(notificationId) {
  return updateDoc(doc(db, 'notifications', notificationId), {
    read: true,
  });
}

export async function markAllNotificationsRead(userId) {
  return true;
}
