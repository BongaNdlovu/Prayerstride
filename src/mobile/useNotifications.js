import { useCallback, useEffect, useState } from 'react';
import {
  getNotifications,
  markAllNotificationsRead as markAllNotificationsReadApi,
  markNotificationRead as markNotificationReadApi,
} from './api';
import { subscribeNotificationsInvalidated } from './notificationStream';

export function useNotifications(userId, enabled = true) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId && enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!userId || !enabled) return undefined;
    return subscribeNotificationsInvalidated(retry);
  }, [userId, enabled, retry]);

  useEffect(() => {
    if (!userId || !enabled) {
      setNotifications([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getNotifications();
        if (cancelled) return;
        setNotifications(result.notifications || []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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
