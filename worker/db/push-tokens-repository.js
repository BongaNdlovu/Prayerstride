import { utcNowIso } from './time.js';

export async function upsertPushToken(env, { id, uid, token, platform }) {
  if (!env.DB) return;
  const now = utcNowIso();
  await env.DB.prepare(
    `INSERT INTO push_tokens (id, uid, token, platform, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       token = excluded.token,
       platform = excluded.platform,
       updated_at = excluded.updated_at`,
  ).bind(id, uid, token, platform || 'android', now).run();
}

export async function listPushTokensForUid(env, uid) {
  if (!env.DB) return null;
  const result = await env.DB.prepare(
    'SELECT * FROM push_tokens WHERE uid = ? ORDER BY updated_at DESC',
  ).bind(uid).all();
  return (result.results || []).map((row) => ({
    id: row.id,
    uid: row.uid,
    token: row.token,
    platform: row.platform,
    updatedAt: row.updated_at,
  }));
}

export async function deletePushTokenById(env, id) {
  if (!env.DB) return;
  await env.DB.prepare('DELETE FROM push_tokens WHERE id = ?').bind(id).run();
}
