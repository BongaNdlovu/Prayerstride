import { utcNowIso } from './time.js';

export function calendarEventRow(id, data) {
  const now = utcNowIso();
  return {
    id,
    owner_uid: data.ownerUid,
    title: data.title || '',
    notes: data.notes ?? null,
    date_key: data.dateKey,
    starts_at: data.startsAt ?? null,
    ends_at: data.endsAt ?? null,
    created_at: data.createdAt || now,
    updated_at: data.updatedAt || now,
  };
}

function rowToCalendarEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    ownerUid: row.owner_uid,
    title: row.title || '',
    notes: row.notes ?? '',
    dateKey: row.date_key,
    startsAt: row.starts_at ?? null,
    endsAt: row.ends_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToCalendarBookmark(row) {
  if (!row) return null;
  return {
    id: row.id,
    ownerUid: row.owner_uid,
    dateKey: row.date_key,
    createdAt: row.created_at,
  };
}

export async function listCalendarEventsForOwner(env, ownerUid) {
  if (!env.DB) return null;
  const result = await env.DB.prepare(
    'SELECT * FROM calendar_events WHERE owner_uid = ? ORDER BY date_key ASC, created_at ASC',
  ).bind(ownerUid).all();
  return (result.results || []).map(rowToCalendarEvent);
}

export async function listCalendarBookmarksForOwner(env, ownerUid) {
  if (!env.DB) return null;
  const result = await env.DB.prepare(
    'SELECT * FROM calendar_bookmarks WHERE owner_uid = ? ORDER BY date_key ASC',
  ).bind(ownerUid).all();
  return (result.results || []).map(rowToCalendarBookmark);
}

export function calendarBookmarkRow(id, data) {
  return {
    id,
    owner_uid: data.ownerUid,
    date_key: data.dateKey,
    created_at: data.createdAt || utcNowIso(),
  };
}

export async function upsertCalendarEvent(env, row) {
  if (!env.DB) return;
  await env.DB.prepare(
    `INSERT INTO calendar_events (
      id, owner_uid, title, notes, date_key, starts_at, ends_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      notes = excluded.notes,
      date_key = excluded.date_key,
      starts_at = excluded.starts_at,
      ends_at = excluded.ends_at,
      updated_at = excluded.updated_at`,
  ).bind(
    row.id, row.owner_uid, row.title, row.notes, row.date_key,
    row.starts_at, row.ends_at, row.created_at, row.updated_at,
  ).run();
}

export async function deleteCalendarEvent(env, id) {
  if (!env.DB) return;
  await env.DB.prepare('DELETE FROM calendar_events WHERE id = ?').bind(id).run();
}

export async function upsertCalendarBookmark(env, row) {
  if (!env.DB) return;
  await env.DB.prepare(
    `INSERT INTO calendar_bookmarks (id, owner_uid, date_key, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       owner_uid = excluded.owner_uid,
       date_key = excluded.date_key,
       created_at = excluded.created_at`,
  ).bind(row.id, row.owner_uid, row.date_key, row.created_at).run();
}

export async function deleteCalendarBookmark(env, id) {
  if (!env.DB) return;
  await env.DB.prepare('DELETE FROM calendar_bookmarks WHERE id = ?').bind(id).run();
}
