import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bookmarkCalendarDate as bookmarkCalendarDateApi,
  createCalendarEvent as createCalendarEventApi,
  deleteCalendarEvent as deleteCalendarEventApi,
  getCalendarBookmarks,
  getCalendarEvents,
  unbookmarkCalendarDate as unbookmarkCalendarDateApi,
  updateCalendarEvent as updateCalendarEventApi,
} from './api';

export function toDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidCalendarDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day;
}

function assertValidCalendarDateKey(dateKey) {
  if (!isValidCalendarDateKey(dateKey)) {
    throw new Error('Enter a valid date as YYYY-MM-DD.');
  }
}

export function formatEventTime(startsAt) {
  if (!startsAt) return '';
  const value = startsAt?.toDate?.() || new Date(startsAt);
  if (Number.isNaN(value.getTime())) return '';
  return value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDateKeyLabel(dateKey) {
  if (!dateKey) return '';
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function useCalendarEvents(userId, enabled = true) {
  const [events, setEvents] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId && enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!userId || !enabled) {
      setEvents([]);
      setBookmarks([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [eventsResult, bookmarksResult] = await Promise.all([
          getCalendarEvents(),
          getCalendarBookmarks(),
        ]);
        if (cancelled) return;
        setEvents(eventsResult.events || []);
        setBookmarks(bookmarksResult.bookmarks || []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setEvents([]);
        setBookmarks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, enabled, retryVersion]);

  const bookmarkedDateKeys = useMemo(
    () => new Set(bookmarks.map((item) => item.dateKey)),
    [bookmarks],
  );

  return { events, bookmarks, bookmarkedDateKeys, loading, error, retry };
}

export async function createCalendarEvent({ title, notes, dateKey, startsAt, endsAt }, user) {
  if (!user?.uid) throw new Error('Please sign in to add calendar events.');
  if (!title?.trim()) throw new Error('Enter an event title.');
  assertValidCalendarDateKey(dateKey);
  const result = await createCalendarEventApi({
    title,
    notes,
    dateKey,
    startsAt: startsAt || null,
    endsAt: endsAt || null,
  });
  return result.eventId;
}

export async function updateCalendarEvent(eventId, { title, notes, dateKey, startsAt, endsAt }) {
  if (!eventId) throw new Error('Missing event id.');
  if (!title?.trim()) throw new Error('Enter an event title.');
  assertValidCalendarDateKey(dateKey);
  return updateCalendarEventApi(eventId, {
    title,
    notes,
    dateKey,
    startsAt: startsAt || null,
    endsAt: endsAt || null,
  });
}

export async function deleteCalendarEvent(eventId) {
  if (!eventId) throw new Error('Missing event id.');
  return deleteCalendarEventApi(eventId);
}

export async function bookmarkDate(dateKey, user) {
  if (!user?.uid) throw new Error('Please sign in to bookmark dates.');
  assertValidCalendarDateKey(dateKey);
  return bookmarkCalendarDateApi(dateKey);
}

export async function unbookmarkDate(dateKey, user) {
  if (!user?.uid) throw new Error('Please sign in to remove bookmarks.');
  assertValidCalendarDateKey(dateKey);
  return unbookmarkCalendarDateApi(dateKey);
}
