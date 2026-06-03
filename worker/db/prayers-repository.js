import { utcNowIso } from './time.js';

export function prayerRowFromFirestore(id, data = {}) {
  const now = utcNowIso();
  return {
    id,
    title: data.title || '',
    body: data.body || '',
    author_uid: data.authorUid || null,
    author_name: data.authorName ?? null,
    is_anonymous: data.isAnonymous === true ? 1 : 0,
    prayed_count: Number(data.prayedCount || 0),
    status: data.status || 'active',
    privacy: data.privacy || 'community',
    prayer_limit: data.prayerLimit || 'daily',
    urgent: data.urgent === true ? 1 : 0,
    allow_share: data.allowShare === false ? 0 : 1,
    created_at: data.createdAt || now,
    updated_at: data.updatedAt || now,
  };
}

export async function upsertPrayer(env, row) {
  if (!env.DB) return;
  await env.DB.prepare(
    `INSERT INTO prayers (
      id, title, body, author_uid, author_name, is_anonymous, prayed_count, status,
      privacy, prayer_limit, urgent, allow_share, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      body = excluded.body,
      author_uid = excluded.author_uid,
      author_name = excluded.author_name,
      is_anonymous = excluded.is_anonymous,
      prayed_count = excluded.prayed_count,
      status = excluded.status,
      privacy = excluded.privacy,
      prayer_limit = excluded.prayer_limit,
      urgent = excluded.urgent,
      allow_share = excluded.allow_share,
      updated_at = excluded.updated_at`,
  ).bind(
    row.id,
    row.title,
    row.body,
    row.author_uid,
    row.author_name,
    row.is_anonymous,
    row.prayed_count,
    row.status,
    row.privacy,
    row.prayer_limit,
    row.urgent,
    row.allow_share,
    row.created_at,
    row.updated_at,
  ).run();
}

export async function deletePrayerById(env, id) {
  if (!env.DB) return;
  await env.DB.prepare('DELETE FROM prayer_prays WHERE prayer_id = ?').bind(id).run();
  await env.DB.prepare('DELETE FROM prayers WHERE id = ?').bind(id).run();
}

export async function insertPrayerPray(env, row) {
  if (!env.DB) return;
  await env.DB.prepare(
    `INSERT OR IGNORE INTO prayer_prays (
      id, prayer_id, uid, day_key, week_key, prayer_limit, author_uid, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    row.id,
    row.prayer_id,
    row.uid,
    row.day_key ?? null,
    row.week_key ?? null,
    row.prayer_limit ?? null,
    row.author_uid ?? null,
    row.created_at,
  ).run();
}

export async function incrementPrayerPrayedCount(env, prayerId, updatedAt) {
  if (!env.DB) return;
  const now = updatedAt || utcNowIso();
  await env.DB.prepare(
    `UPDATE prayers SET prayed_count = prayed_count + 1, updated_at = ? WHERE id = ?`,
  ).bind(now, prayerId).run();
}
