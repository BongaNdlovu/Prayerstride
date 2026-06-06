export async function deleteUserMirrorData(env, uid) {
  if (!env.DB) return;

  await env.DB.batch([
    env.DB.prepare('DELETE FROM prayer_prays WHERE uid = ? OR author_uid = ?').bind(uid, uid),
    env.DB.prepare('DELETE FROM prayer_prays WHERE prayer_id IN (SELECT id FROM prayers WHERE author_uid = ?)').bind(uid),
    env.DB.prepare('DELETE FROM prayers WHERE author_uid = ?').bind(uid),
    env.DB.prepare('DELETE FROM calendar_events WHERE owner_uid = ?').bind(uid),
    env.DB.prepare('DELETE FROM calendar_bookmarks WHERE owner_uid = ?').bind(uid),
    env.DB.prepare('DELETE FROM notifications WHERE recipient_uid = ? OR actor_uid = ?').bind(uid, uid),
    env.DB.prepare('DELETE FROM notification_settings WHERE uid = ?').bind(uid),
    env.DB.prepare('DELETE FROM push_tokens WHERE uid = ?').bind(uid),
    env.DB.prepare('DELETE FROM users WHERE uid = ?').bind(uid),
  ]);
}
