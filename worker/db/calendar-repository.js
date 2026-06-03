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
