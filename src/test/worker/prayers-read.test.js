import { describe, expect, it, vi } from 'vitest';
import {
  getPrayersFeed,
  serializePrayerFromFirestore,
  serializePrayerRow,
} from '../../../worker/prayers-read.js';

function makeCursor(createdAt, id) {
  return btoa(JSON.stringify({ createdAt, id }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function makeD1Env(rows) {
  const all = vi.fn(async () => ({ results: rows }));
  const bind = vi.fn(() => ({ all }));
  const prepare = vi.fn(() => ({ bind }));
  return { env: { DB: { prepare } }, prepare, bind, all };
}

function makeFirestoreApi(docsByCall = []) {
  return {
    fromFirestoreFields: vi.fn((fields) => fields),
    runCollectionQuery: vi.fn(async () => docsByCall.shift() || []),
  };
}

describe('prayers read helpers', () => {
  it('serializes d1 prayer rows for mobile clients', () => {
    const item = serializePrayerRow({
      id: 'p1',
      title: 'Heal',
      body: 'Please pray',
      author_uid: 'u1',
      author_name: 'Alex',
      is_anonymous: 0,
      prayed_count: 2,
      status: 'active',
      privacy: 'community',
      category: 'Healing',
      scripture_ref: 'Psalm 34:17',
      prayer_limit: 'daily',
      urgent: 1,
      allow_share: 1,
      created_at: '2026-01-01T00:00:00.000Z',
    });

    expect(item).toMatchObject({
      id: 'p1',
      authorUid: 'u1',
      authorName: 'Alex',
      category: 'Healing',
      scriptureRef: 'Psalm 34:17',
      prayedCount: 2,
      urgent: true,
    });
  });

  it('masks anonymous authors from firestore payloads', () => {
    const item = serializePrayerFromFirestore('p2', {
      title: 'Peace',
      body: 'Need peace',
      authorUid: 'u2',
      authorName: 'Sam',
      category: 'Guidance',
      scriptureRef: 'Philippians 4:6',
      isAnonymous: true,
      createdAt: '2026-01-02T00:00:00.000Z',
    });

    expect(item.authorName).toBe('Anonymous');
    expect(item.isAnonymous).toBe(true);
    expect(item.scriptureRef).toBe('Philippians 4:6');
  });

  it('rejects invalid feed scopes before querying storage', async () => {
    const firestoreApi = makeFirestoreApi();
    const requireAdmin = vi.fn();

    const result = await getPrayersFeed(
      {},
      { uid: 'u1' },
      new URL('https://worker.test/api/prayers?scope=private'),
      firestoreApi,
      requireAdmin,
    );

    expect(result).toMatchObject({ status: 400 });
    expect(firestoreApi.runCollectionQuery).not.toHaveBeenCalled();
    expect(requireAdmin).not.toHaveBeenCalled();
  });

  it('queries D1 with scope, filters, cursor, and pagination', async () => {
    const rows = [
      {
        id: 'p3',
        title: 'Healing',
        body: 'Pray for surgery',
        author_uid: 'u1',
        author_name: 'Alex',
        is_anonymous: 0,
        urgent: 1,
        allow_share: 1,
        created_at: '2026-06-06T10:00:00.000Z',
      },
      {
        id: 'p2',
        title: 'Second healing request',
        body: 'More surgery prayer',
        author_uid: 'u1',
        author_name: 'Alex',
        is_anonymous: 0,
        urgent: 1,
        allow_share: 1,
        created_at: '2026-06-05T10:00:00.000Z',
      },
    ];
    const { env, prepare, bind } = makeD1Env(rows);
    const cursor = makeCursor('2026-06-07T10:00:00.000Z', 'p9');

    const result = await getPrayersFeed(
      env,
      { uid: 'u1' },
      new URL(`https://worker.test/api/prayers?scope=mine&status=active&category=Health&urgent=true&cursor=${cursor}&limit=1`),
      makeFirestoreApi([[], []]),
      vi.fn(),
    );

    expect(result.status).toBe(200);
    expect(result.body.items).toHaveLength(1);
    expect(result.body.nextCursor).toEqual(expect.any(String));
    expect(prepare.mock.calls[0][0]).toContain('author_uid = ?');
    expect(prepare.mock.calls[0][0]).toContain('status = ?');
    expect(prepare.mock.calls[0][0]).toContain('urgent = 1');
    expect(prepare.mock.calls[0][0]).toContain('LOWER(COALESCE(category');
    expect(bind.mock.calls[0]).toEqual([
      'u1',
      'active',
      'health',
      '2026-06-07T10:00:00.000Z',
      '2026-06-07T10:00:00.000Z',
      'p9',
      2,
    ]);
  });

  it('merges Firestore items over D1 rows so partial mirror failures do not hide fresh data', async () => {
    const { env } = makeD1Env([
      {
        id: 'p1',
        title: 'Old title',
        body: 'Old body',
        author_uid: 'u2',
        author_name: 'Mia',
        is_anonymous: 0,
        urgent: 0,
        allow_share: 1,
        privacy: 'community',
        created_at: '2026-06-01T10:00:00.000Z',
      },
    ]);
    const firestoreApi = makeFirestoreApi([
      [
        {
          name: 'projects/demo/databases/(default)/documents/prayers/p2',
          fields: {
            title: 'Fresh prayer',
            body: 'Newly written',
            authorUid: 'u3',
            authorName: 'Noah',
            privacy: 'community',
            createdAt: '2026-06-08T10:00:00.000Z',
          },
        },
        {
          name: 'projects/demo/databases/(default)/documents/prayers/p1',
          fields: {
            title: 'Updated title',
            body: 'Updated body',
            authorUid: 'u2',
            authorName: 'Mia',
            privacy: 'community',
            createdAt: '2026-06-01T10:00:00.000Z',
          },
        },
      ],
    ]);

    const result = await getPrayersFeed(
      env,
      { uid: 'u1' },
      new URL('https://worker.test/api/prayers?scope=community&limit=10'),
      firestoreApi,
      vi.fn(),
    );

    expect(result.body.items.map((item) => [item.id, item.title])).toEqual([
      ['p2', 'Fresh prayer'],
      ['p1', 'Updated title'],
    ]);
  });

  it('falls back to Firestore, merges feed ownership, and applies urgent category filters', async () => {
    const firestoreApi = makeFirestoreApi([
      [
        {
          name: 'projects/demo/databases/(default)/documents/prayers/p1',
          fields: {
            title: 'Surgery recovery',
            body: 'Please pray for healing after surgery',
            authorUid: 'u2',
            authorName: 'Mia',
            urgent: true,
            privacy: 'community',
            createdAt: '2026-06-06T10:00:00.000Z',
          },
        },
        {
          name: 'projects/demo/databases/(default)/documents/prayers/p2',
          fields: {
            title: 'Slow week',
            body: 'Routine check-in',
            authorUid: 'u3',
            authorName: 'Noah',
            urgent: false,
            privacy: 'community',
            createdAt: '2026-06-05T10:00:00.000Z',
          },
        },
      ],
      [
        {
          name: 'projects/demo/databases/(default)/documents/prayers/p3',
          fields: {
            title: 'My medical appointment',
            body: 'Need peace',
            authorUid: 'u1',
            authorName: 'Alex',
            urgent: true,
            privacy: 'private',
            createdAt: '2026-06-07T10:00:00.000Z',
          },
        },
      ],
    ]);

    const result = await getPrayersFeed(
      {},
      { uid: 'u1' },
      new URL('https://worker.test/api/prayers?scope=feed&category=health&urgent=1&limit=10'),
      firestoreApi,
      vi.fn(),
    );

    expect(result.status).toBe(200);
    expect(result.body.nextCursor).toBeNull();
    expect(result.body.items.map((item) => item.id)).toEqual(['p3', 'p1']);
    expect(firestoreApi.runCollectionQuery).toHaveBeenCalledTimes(2);
    expect(firestoreApi.runCollectionQuery.mock.calls[1][2][0].fieldFilter.field.fieldPath).toBe('authorUid');
  });

  it('requires admin access for all-scope feeds', async () => {
    const requireAdmin = vi.fn(async () => {});
    const firestoreApi = makeFirestoreApi([[]]);

    const result = await getPrayersFeed(
      {},
      { uid: 'admin' },
      new URL('https://worker.test/api/prayers?scope=all&limit=0'),
      firestoreApi,
      requireAdmin,
    );

    expect(result).toMatchObject({ status: 200, body: { items: [] } });
    expect(requireAdmin).toHaveBeenCalledWith({}, { uid: 'admin' });
  });
});
