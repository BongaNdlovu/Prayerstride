import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { useIsAdmin } from './useIsAdmin';

const CATEGORY_LABELS = {
  events: 'Events',
  prayer: 'Prayer',
  updates: 'Updates',
};

export function mapAnnouncement(docSnap) {
  const data = docSnap.data();
  const startsAt = data.startsAt?.toDate?.() || (data.startsAt ? new Date(data.startsAt) : null);
  const endsAt = data.endsAt?.toDate?.() || (data.endsAt ? new Date(data.endsAt) : null);
  return {
    id: docSnap.id,
    title: data.title || '',
    body: data.body || '',
    category: data.category || 'updates',
    categoryLabel: CATEGORY_LABELS[data.category] || 'Updates',
    startsAt,
    endsAt,
    status: data.status || 'active',
    createdByUid: data.createdByUid,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    displayDate: startsAt && !Number.isNaN(startsAt.getTime())
      ? startsAt.toLocaleDateString([], { month: 'short', day: 'numeric' })
      : '',
    displayTime: startsAt && !Number.isNaN(startsAt.getTime())
      ? startsAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : '',
  };
}

export function useAnnouncements(enabled = true, options = {}) {
  const { isAdmin } = useIsAdmin(options.user);
  const includeArchived = Boolean(options.includeArchived && isAdmin);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const announcementsRef = collection(db, 'announcements');
    const announcementsQuery = includeArchived
      ? query(announcementsRef, orderBy('startsAt', 'desc'))
      : query(
          announcementsRef,
          where('status', '==', 'active'),
          orderBy('startsAt', 'desc'),
        );

    return onSnapshot(
      announcementsQuery,
      (snapshot) => {
        setItems(snapshot.docs.map(mapAnnouncement));
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [enabled, includeArchived, retryVersion]);

  const activeAnnouncements = useMemo(
    () => items.filter((item) => item.status === 'active' && (!item.endsAt || item.endsAt > new Date())),
    [items],
  );

  return {
    announcements: includeArchived ? items : activeAnnouncements,
    allAnnouncements: items,
    loading,
    error,
    retry,
  };
}
