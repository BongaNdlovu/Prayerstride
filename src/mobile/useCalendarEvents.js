import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';

export function toDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function mapCalendarEvent(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ownerUid: data.ownerUid,
    title: data.title || '',
    notes: data.notes || '',
    dateKey: data.dateKey,
    startsAt: data.startsAt ?? null,
    endsAt: data.endsAt ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function mapCalendarBookmark(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ownerUid: data.ownerUid,
    dateKey: data.dateKey,
    createdAt: data.createdAt,
  };
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

  useEffect(() => {
    if (!userId || !enabled) {
      setEvents([]);
      setBookmarks([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const unsubEvents = onSnapshot(
      query(
        collection(db, 'calendarEvents'),
        where('ownerUid', '==', userId),
        orderBy('dateKey', 'asc'),
      ),
      (snapshot) => {
        setEvents(snapshot.docs.map(mapCalendarEvent));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    const unsubBookmarks = onSnapshot(
      query(
        collection(db, 'calendarBookmarks'),
        where('ownerUid', '==', userId),
      ),
      (snapshot) => {
        setBookmarks(snapshot.docs.map(mapCalendarBookmark));
      },
      (err) => setError(err),
    );

    return () => {
      unsubEvents();
      unsubBookmarks();
    };
  }, [userId, enabled]);

  const bookmarkedDateKeys = useMemo(
    () => new Set(bookmarks.map((item) => item.dateKey)),
    [bookmarks],
  );

  return { events, bookmarks, bookmarkedDateKeys, loading, error };
}

export async function createCalendarEvent({ title, notes, dateKey, startsAt, endsAt }, user) {
  if (!user?.uid) throw new Error('Please sign in to add calendar events.');
  if (!title?.trim()) throw new Error('Enter an event title.');
  if (!dateKey) throw new Error('Choose a date for this event.');

  return addDoc(collection(db, 'calendarEvents'), {
    ownerUid: user.uid,
    title: title.trim(),
    notes: notes?.trim() || null,
    dateKey,
    startsAt: startsAt || null,
    endsAt: endsAt || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCalendarEvent(eventId, { title, notes, dateKey, startsAt, endsAt }) {
  if (!eventId) throw new Error('Missing event id.');
  return updateDoc(doc(db, 'calendarEvents', eventId), {
    title: title.trim(),
    notes: notes?.trim() || null,
    dateKey,
    startsAt: startsAt || null,
    endsAt: endsAt || null,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCalendarEvent(eventId) {
  if (!eventId) throw new Error('Missing event id.');
  return deleteDoc(doc(db, 'calendarEvents', eventId));
}

export async function bookmarkDate(dateKey, user) {
  if (!user?.uid) throw new Error('Please sign in to bookmark dates.');
  if (!dateKey) throw new Error('Missing date key.');
  const bookmarkId = `${user.uid}_${dateKey}`;
  return setDoc(doc(db, 'calendarBookmarks', bookmarkId), {
    ownerUid: user.uid,
    dateKey,
    createdAt: serverTimestamp(),
  });
}

export async function unbookmarkDate(dateKey, user) {
  if (!user?.uid) throw new Error('Please sign in to remove bookmarks.');
  const bookmarkId = `${user.uid}_${dateKey}`;
  return deleteDoc(doc(db, 'calendarBookmarks', bookmarkId));
}
