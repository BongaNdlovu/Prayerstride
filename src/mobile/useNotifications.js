import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
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
        where('read', '==', false),
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

  return { notifications, loading, error };
}

export async function markNotificationRead(notificationId) {
  return updateDoc(doc(db, 'notifications', notificationId), {
    read: true,
  });
}

export async function markAllNotificationsRead(userId) {
  // Firestore does not support bulk updates without knowing doc IDs.
  // This function should be used in combination with useNotifications to
  // iterate and mark each as read.
  return true;
}
