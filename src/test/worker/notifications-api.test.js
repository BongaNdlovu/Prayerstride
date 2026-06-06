import { describe, expect, it, vi } from 'vitest';
import { getMyNotifications } from '../../../worker/notifications-api.js';

function makeD1(rows) {
  return {
    DB: {
      prepare: vi.fn(() => ({
        bind: vi.fn(() => ({
          all: vi.fn(async () => ({ results: rows })),
        })),
      })),
    },
  };
}

function makeFirestoreApi(docs) {
  return {
    fromFirestoreFields: vi.fn((fields) => fields),
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
});
