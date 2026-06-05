import { describe, expect, it } from 'vitest';
import { prayerRowFromFirestore } from '../../../worker/db/prayers-repository.js';

describe('prayers repository', () => {
  it('maps firestore prayer fields into d1 columns', () => {
    const row = prayerRowFromFirestore('prayer-1', {
      title: 'Heal',
      body: 'Please pray',
      category: 'Healing',
      scriptureRef: 'Psalm 34:17',
      authorUid: 'uid-1',
      authorName: 'Alex',
      prayedCount: 3,
      status: 'active',
      privacy: 'community',
      prayerLimit: 'daily',
      urgent: true,
      allowShare: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });

    expect(row).toMatchObject({
      id: 'prayer-1',
      title: 'Heal',
      body: 'Please pray',
      category: 'Healing',
      scripture_ref: 'Psalm 34:17',
      author_uid: 'uid-1',
      prayed_count: 3,
      urgent: 1,
      allow_share: 0,
    });
  });
});
