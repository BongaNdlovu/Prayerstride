import { utcNowIso } from './db/time.js';
import { commitFirestoreWithD1 } from './db/commit.js';
import { invalidateUserNotificationStream } from './notification-stream.js';
import {
  getNotificationSettingsFromD1,
  listNotificationsForRecipient,
  markAllNotificationsReadD1,
  markNotificationReadD1,
  notificationSettingsRow,
  upsertNotificationSettings,
} from './db/notifications-repository.js';

const SETTINGS_KEYS = new Set(['prayerActivity', 'testimonyReactions', 'pushEnabled', 'announcements']);

function serializeNotificationFromFirestore(id, data) {
  return {
    id,
    recipientUid: data.recipientUid,
    type: data.type ?? null,
    message: data.message ?? null,
    relatedId: data.relatedId ?? null,
    actorUid: data.actorUid ?? null,
    read: data.read === true,
    createdAt: data.createdAt,
  };
}

async function listNotificationsFromFirestore(env, user, firestoreApi) {
  const docs = await firestoreApi.runCollectionQuery(env, 'notifications', [
    {
      fieldFilter: {
        field: { fieldPath: 'recipientUid' },
        op: 'EQUAL',
        value: { stringValue: user.uid },
      },
    },
  ], [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }]);

  return docs.map((doc) => {
    const id = doc.name.split('/').pop();
    return serializeNotificationFromFirestore(id, firestoreApi.fromFirestoreFields(doc.fields));
  });
}

export async function getMyNotifications(env, user, firestoreApi) {
  let notifications = await listNotificationsForRecipient(env, user.uid);
  if (notifications == null || notifications.length === 0) {
    notifications = await listNotificationsFromFirestore(env, user, firestoreApi);
  }
  return { status: 200, body: { notifications } };
}

export async function getMyNotificationSettings(env, user, firestoreApi) {
  let settings = await getNotificationSettingsFromD1(env, user.uid);
  if (settings == null) {
    const doc = await firestoreApi.getDocument(env, firestoreApi.docName(env, 'notificationSettings', user.uid));
    settings = doc.exists ? firestoreApi.fromFirestoreFields(doc.fields) : {};
  }
  return { status: 200, body: { settings } };
}

export async function markNotificationRead(env, user, notificationId, firestoreApi) {
  const doc = await firestoreApi.getDocument(env, firestoreApi.docName(env, 'notifications', notificationId));
  if (!doc.exists) return { status: 404, body: { error: 'Notification not found.' } };
  const data = firestoreApi.fromFirestoreFields(doc.fields);
  if (data.recipientUid !== user.uid) return { status: 403, body: { error: 'Access denied.' } };
  if (data.read === true) return { status: 200, body: { ok: true, alreadyRead: true } };

  const fields = { ...data, read: true };

  await commitFirestoreWithD1(env, firestoreApi, {
    feature: 'notifications',
    entityType: 'notifications',
    entityId: notificationId,
    operation: 'mark-read',
    writes: [{
      update: {
        name: doc.name,
        fields: firestoreApi.toFirestoreFields(fields),
      },
    }],
    syncD1: () => markNotificationReadD1(env, notificationId, user.uid),
  });

  await invalidateUserNotificationStream(env, user.uid);
  return { status: 200, body: { ok: true } };
}

export async function markAllNotificationsRead(env, user, firestoreApi) {
  const docs = await firestoreApi.runCollectionQuery(env, 'notifications', [
    {
      fieldFilter: {
        field: { fieldPath: 'recipientUid' },
        op: 'EQUAL',
        value: { stringValue: user.uid },
      },
    },
    {
      fieldFilter: {
        field: { fieldPath: 'read' },
        op: 'EQUAL',
        value: { booleanValue: false },
      },
    },
  ]);

  if (!docs.length) return { status: 200, body: { ok: true, count: 0 } };

  const chunkSize = 400;
  for (let index = 0; index < docs.length; index += chunkSize) {
    const slice = docs.slice(index, index + chunkSize);
    const writes = slice.map((document) => {
      const data = firestoreApi.fromFirestoreFields(document.fields);
      return {
        update: {
          name: document.name,
          fields: firestoreApi.toFirestoreFields({ ...data, read: true }),
        },
      };
    });

    await commitFirestoreWithD1(env, firestoreApi, {
      feature: 'notifications',
      entityType: 'notifications',
      entityId: user.uid,
      operation: 'mark-all-read',
      metadata: { chunk: index / chunkSize, count: writes.length },
      writes,
      syncD1: index === 0 ? () => markAllNotificationsReadD1(env, user.uid) : undefined,
    });
  }

  await invalidateUserNotificationStream(env, user.uid);
  return { status: 200, body: { ok: true, count: docs.length } };
}

export async function updateNotificationSettings(env, user, body, firestoreApi) {
  const patch = {};
  for (const [key, value] of Object.entries(body || {})) {
    if (!SETTINGS_KEYS.has(key)) continue;
    if (typeof value !== 'boolean') continue;
    patch[key] = value;
  }
  if (!Object.keys(patch).length) return { status: 400, body: { error: 'No valid settings provided.' } };

  const existingDoc = await firestoreApi.getDocument(env, firestoreApi.docName(env, 'notificationSettings', user.uid));
  const existing = existingDoc.exists ? firestoreApi.fromFirestoreFields(existingDoc.fields) : {};
  const now = utcNowIso();
  const fields = { ...existing, ...patch, updatedAt: now };

  await commitFirestoreWithD1(env, firestoreApi, {
    feature: 'notifications',
    entityType: 'notification_settings',
    entityId: user.uid,
    operation: 'update-settings',
    writes: [{
      update: {
        name: firestoreApi.docName(env, 'notificationSettings', user.uid),
        fields: firestoreApi.toFirestoreFields(fields),
      },
    }],
    syncD1: () => upsertNotificationSettings(env, notificationSettingsRow(user.uid, fields)),
  });

  return { status: 200, body: { ok: true, settings: fields } };
}
