import { utcNowIso } from './db/time.js';
import { commitFirestoreWithD1 } from './db/commit.js';
import {
  calendarBookmarkRow,
  calendarEventRow,
  deleteCalendarBookmark,
  deleteCalendarEvent,
  upsertCalendarBookmark,
  upsertCalendarEvent,
} from './db/calendar-repository.js';

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidCalendarDateKey(value) {
  if (typeof value !== 'string' || !DATE_KEY_RE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function normalizeIsoTimestamp(value) {
  if (value == null || value === '') return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export async function createCalendarEvent(env, user, body, firestoreApi) {
  const title = body.title != null ? String(body.title).trim() : '';
  const dateKey = body.dateKey != null ? String(body.dateKey).trim() : '';
  if (!title) return { status: 400, body: { error: 'Enter an event title.' } };
  if (!isValidCalendarDateKey(dateKey)) return { status: 400, body: { error: 'Enter a valid date as YYYY-MM-DD.' } };

  const id = crypto.randomUUID();
  const now = utcNowIso();
  const fields = {
    ownerUid: user.uid,
    title: title.slice(0, 120),
    notes: body.notes != null ? (String(body.notes).trim() || null) : null,
    dateKey,
    startsAt: normalizeIsoTimestamp(body.startsAt),
    endsAt: normalizeIsoTimestamp(body.endsAt),
    createdAt: now,
    updatedAt: now,
  };

  await commitFirestoreWithD1(env, firestoreApi, {
    feature: 'calendar',
    entityType: 'calendar_events',
    entityId: id,
    operation: 'create',
    writes: [{
      update: {
        name: firestoreApi.docName(env, 'calendarEvents', id),
        fields: firestoreApi.toFirestoreFields(fields),
      },
      currentDocument: { exists: false },
    }],
    syncD1: () => upsertCalendarEvent(env, calendarEventRow(id, fields)),
  });

  return { status: 200, body: { ok: true, eventId: id } };
}

export async function updateCalendarEvent(env, user, eventId, body, firestoreApi) {
  const title = body.title != null ? String(body.title).trim() : '';
  const dateKey = body.dateKey != null ? String(body.dateKey).trim() : '';
  if (!title) return { status: 400, body: { error: 'Enter an event title.' } };
  if (!isValidCalendarDateKey(dateKey)) return { status: 400, body: { error: 'Enter a valid date as YYYY-MM-DD.' } };

  const doc = await firestoreApi.getDocument(env, firestoreApi.docName(env, 'calendarEvents', eventId));
  if (!doc.exists) return { status: 404, body: { error: 'Event not found.' } };
  const existing = firestoreApi.fromFirestoreFields(doc.fields);
  if (existing.ownerUid !== user.uid) return { status: 403, body: { error: 'You cannot modify this event.' } };

  const now = utcNowIso();
  const fields = {
    ...existing,
    ownerUid: user.uid,
    title: title.slice(0, 120),
    notes: body.notes != null ? (String(body.notes).trim() || null) : existing.notes ?? null,
    dateKey,
    startsAt: body.startsAt !== undefined ? normalizeIsoTimestamp(body.startsAt) : (existing.startsAt ?? null),
    endsAt: body.endsAt !== undefined ? normalizeIsoTimestamp(body.endsAt) : (existing.endsAt ?? null),
    updatedAt: now,
  };

  await commitFirestoreWithD1(env, firestoreApi, {
    feature: 'calendar',
    entityType: 'calendar_events',
    entityId: eventId,
    operation: 'update',
    writes: [{
      update: {
        name: doc.name,
        fields: firestoreApi.toFirestoreFields(fields),
      },
    }],
    syncD1: () => upsertCalendarEvent(env, calendarEventRow(eventId, fields)),
  });

  return { status: 200, body: { ok: true, eventId } };
}

export async function deleteCalendarEventApi(env, user, eventId, firestoreApi) {
  const doc = await firestoreApi.getDocument(env, firestoreApi.docName(env, 'calendarEvents', eventId));
  if (!doc.exists) return { status: 404, body: { error: 'Event not found.' } };
  const existing = firestoreApi.fromFirestoreFields(doc.fields);
  if (existing.ownerUid !== user.uid) return { status: 403, body: { error: 'You cannot delete this event.' } };

  await commitFirestoreWithD1(env, firestoreApi, {
    feature: 'calendar',
    entityType: 'calendar_events',
    entityId: eventId,
    operation: 'delete',
    writes: [{ delete: doc.name }],
    syncD1: () => deleteCalendarEvent(env, eventId),
  });

  return { status: 200, body: { ok: true } };
}

export async function bookmarkCalendarDate(env, user, dateKey, firestoreApi) {
  if (!isValidCalendarDateKey(dateKey)) return { status: 400, body: { error: 'Enter a valid date as YYYY-MM-DD.' } };
  const id = `${user.uid}_${dateKey}`;
  const now = utcNowIso();
  const fields = { ownerUid: user.uid, dateKey, createdAt: now };

  await commitFirestoreWithD1(env, firestoreApi, {
    feature: 'calendar',
    entityType: 'calendar_bookmarks',
    entityId: id,
    operation: 'create',
    writes: [{
      update: {
        name: firestoreApi.docName(env, 'calendarBookmarks', id),
        fields: firestoreApi.toFirestoreFields(fields),
      },
      currentDocument: { exists: false },
    }],
    commitOptions: { allowAlreadyExists: true },
    syncD1: () => upsertCalendarBookmark(env, calendarBookmarkRow(id, fields)),
  });

  return { status: 200, body: { ok: true, bookmarkId: id } };
}

export async function unbookmarkCalendarDate(env, user, dateKey, firestoreApi) {
  if (!isValidCalendarDateKey(dateKey)) return { status: 400, body: { error: 'Enter a valid date as YYYY-MM-DD.' } };
  const id = `${user.uid}_${dateKey}`;
  const doc = await firestoreApi.getDocument(env, firestoreApi.docName(env, 'calendarBookmarks', id));
  if (!doc.exists) return { status: 200, body: { ok: true, removed: false } };
  const existing = firestoreApi.fromFirestoreFields(doc.fields);
  if (existing.ownerUid !== user.uid) return { status: 403, body: { error: 'You cannot remove this bookmark.' } };

  await commitFirestoreWithD1(env, firestoreApi, {
    feature: 'calendar',
    entityType: 'calendar_bookmarks',
    entityId: id,
    operation: 'delete',
    writes: [{ delete: doc.name }],
    syncD1: () => deleteCalendarBookmark(env, id),
  });

  return { status: 200, body: { ok: true, removed: true } };
}
