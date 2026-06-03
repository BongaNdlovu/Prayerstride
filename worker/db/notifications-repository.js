import { utcNowIso } from './time.js';

export function notificationRow(id, data) {
  return {
    id,
    recipient_uid: data.recipientUid,
    type: data.type ?? null,
    message: data.message ?? null,
    related_id: data.relatedId ?? null,
    actor_uid: data.actorUid ?? null,
    read: data.read === true ? 1 : 0,
    created_at: data.createdAt || utcNowIso(),
  };
}

export function notificationSettingsRow(uid, data) {
  return {
    uid,
    prayer_activity: data.prayerActivity === false ? 0 : data.prayerActivity === true ? 1 : null,
    testimony_reactions: data.testimonyReactions === false ? 0 : data.testimonyReactions === true ? 1 : null,
    push_enabled: data.pushEnabled === false ? 0 : data.pushEnabled === true ? 1 : null,
    announcements: data.announcements === false ? 0 : data.announcements === true ? 1 : null,
    updated_at: data.updatedAt || utcNowIso(),
  };
}

export async function upsertNotification(env, row) {
  if (!env.DB) return;
  await env.DB.prepare(
    `INSERT INTO notifications (
      id, recipient_uid, type, message, related_id, actor_uid, read, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      recipient_uid = excluded.recipient_uid,
      type = excluded.type,
      message = excluded.message,
      related_id = excluded.related_id,
      actor_uid = excluded.actor_uid,
      read = excluded.read,
      created_at = excluded.created_at`,
  ).bind(
    row.id, row.recipient_uid, row.type, row.message,
    row.related_id, row.actor_uid, row.read, row.created_at,
  ).run();
}

export async function markNotificationReadD1(env, id, recipientUid) {
  if (!env.DB) return;
  await env.DB.prepare(
    'UPDATE notifications SET read = 1 WHERE id = ? AND recipient_uid = ?',
  ).bind(id, recipientUid).run();
}

export async function markAllNotificationsReadD1(env, recipientUid) {
  if (!env.DB) return;
  await env.DB.prepare(
    'UPDATE notifications SET read = 1 WHERE recipient_uid = ? AND read = 0',
  ).bind(recipientUid).run();
}

export async function upsertNotificationSettings(env, row) {
  if (!env.DB) return;
  await env.DB.prepare(
    `INSERT INTO notification_settings (
      uid, prayer_activity, testimony_reactions, push_enabled, announcements, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(uid) DO UPDATE SET
      prayer_activity = COALESCE(excluded.prayer_activity, notification_settings.prayer_activity),
      testimony_reactions = COALESCE(excluded.testimony_reactions, notification_settings.testimony_reactions),
      push_enabled = COALESCE(excluded.push_enabled, notification_settings.push_enabled),
      announcements = COALESCE(excluded.announcements, notification_settings.announcements),
      updated_at = excluded.updated_at`,
  ).bind(
    row.uid,
    row.prayer_activity,
    row.testimony_reactions,
    row.push_enabled,
    row.announcements,
    row.updated_at,
  ).run();
}
