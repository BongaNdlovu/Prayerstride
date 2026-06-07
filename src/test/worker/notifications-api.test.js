import { describe, expect, it, vi } from 'vitest';
import { getMyNotifications, markNotificationRead } from '../../../worker/notifications-api.js';

function makeD1(rows) {
  const run = vi.fn(async () => ({ success: true }));
  return {
    run,
    DB: {
      prepare: vi.fn(() => ({
        bind: vi.fn(() => ({
          all: vi.fn(async () => ({ results: rows })),
          run,
        })),
      })),
    },
  };
}

function makeFirestoreApi(docs, doc = { exists: false }) {
  return {
    docName: vi.fn((_env, ...parts) => parts.join('/')),
    fromFirestoreFields: vi.fn((fields) => fields),
    getDocument: vi.fn(async () => doc),
    toFirestoreFields: vi.fn((fields) => fields),
    firestoreCommit: vi.fn(async () => ({ ok: true })),
    runCollectionQuery: vi.fn(async () => docs),
  };
}

describe('notifications API', () => {
  it('merges Firestore notifications over D1 rows so fresh notifications remain visible', async () => {
    const env = makeD1([
      {
        id: 'n1',
        recipient_uid: 'u1',
        type: 'old',
        message: 'Old message',
        read: 0,
        created_at: '2026-06-01T00:00:00.000Z',
      },
    ]);
    const firestoreApi = makeFirestoreApi([
      {
        name: 'projects/demo/databases/(default)/documents/notifications/n2',
        fields: {
          recipientUid: 'u1',
          type: 'new',
          message: 'New message',
          read: false,
          createdAt: '2026-06-02T00:00:00.000Z',
        },
      },
      {
        name: 'projects/demo/databases/(default)/documents/notifications/n1',
        fields: {
          recipientUid: 'u1',
          type: 'updated',
          message: 'Updated message',
          read: true,
          createdAt: '2026-06-01T00:00:00.000Z',
        },
      },
    ]);

    const result = await getMyNotifications(env, { uid: 'u1' }, firestoreApi);

    expect(result.body.notifications.map((item) => [item.id, item.message, item.read])).toEqual([
      ['n2', 'New message', false],
      ['n1', 'Updated message', true],
    ]);
  });

  it('keeps D1 fields when a Firestore notification is partial during backfill', async () => {
    const env = makeD1([
      {
        id: 'n1',
        recipient_uid: 'u1',
        type: 'announcement',
        message: 'Full message',
        read: 0,
        created_at: '2026-06-01T00:00:00.000Z',
      },
    ]);
    const firestoreApi = makeFirestoreApi([
      {
        name: 'projects/demo/databases/(default)/documents/notifications/n1',
        fields: {
          recipientUid: 'u1',
          read: true,
        },
      },
    ]);

    const result = await getMyNotifications(env, { uid: 'u1' }, firestoreApi);

    expect(result.body.notifications[0]).toMatchObject({
      id: 'n1',
      recipientUid: 'u1',
      type: 'announcement',
      message: 'Full message',
      read: true,
      createdAt: '2026-06-01T00:00:00.000Z',
    });
  });

  it('marks D1-only notifications as read', async () => {
    const env = makeD1([
      {
        id: 'n-d1',
        recipient_uid: 'u1',
        type: 'announcement',
        message: 'D1 only',
        read: 0,
        created_at: '2026-06-01T00:00:00.000Z',
      },
    ]);
    const firestoreApi = makeFirestoreApi([], { exists: false });

    const result = await markNotificationRead(env, { uid: 'u1' }, 'n-d1', firestoreApi);

    expect(result).toEqual({ status: 200, body: { ok: true } });
    expect(env.run).toHaveBeenCalled();
  });
});
