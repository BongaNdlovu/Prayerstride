import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAnnouncements } from './api';
import { useIsAdmin } from './useIsAdmin';

const CATEGORY_LABELS = {
  events: 'Events',
  prayer: 'Prayer',
  updates: 'Updates',
};

export function mapAnnouncement(item) {
  const startsAt = item.startsAt ? new Date(item.startsAt) : null;
  const endsAt = item.endsAt ? new Date(item.endsAt) : null;
  const category = item.category || 'updates';
  return {
    ...item,
    category,
    categoryLabel: CATEGORY_LABELS[category] || 'Updates',
    startsAt,
    endsAt,
    displayDate: startsAt && !Number.isNaN(startsAt.getTime())
      ? startsAt.toLocaleDateString([], { month: 'short', day: 'numeric' })
      : item.displayDate || '',
    displayTime: startsAt && !Number.isNaN(startsAt.getTime())
      ? startsAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : item.displayTime || '',
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

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getAnnouncements({ includeArchived });
        if (cancelled) return;
        setItems((result.announcements || []).map(mapAnnouncement));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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
