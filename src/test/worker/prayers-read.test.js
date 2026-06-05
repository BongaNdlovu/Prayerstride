import { describe, expect, it } from 'vitest';
import {
  serializePrayerFromFirestore,
  serializePrayerRow,
} from '../../../worker/prayers-read.js';

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
});
