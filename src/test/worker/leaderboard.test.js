import { describe, expect, it } from 'vitest';
import { buildLeaderboard } from '../../../worker/gamification.js';

function createFs() {
  const summaries = [
    {
      uid: 'user-visible-1',
      leaderboardVisible: true,
      totalXP: 400,
      weekXP: 20,
      monthXP: 80,
      prayersCreated: 2,
      prayerSessions: 4,
      prayerMinutes: 20,
      prayersCarried: 7,
      answeredPrayers: 1,
      testimonies: 1,
      bookmarksCreated: 2,
      activeDayKeys: ['2026-06-04', '2026-06-05'],
      dayKey: '2026-06-05',
      timeZone: 'UTC',
    },
    {
      uid: 'user-visible-2',
      leaderboardVisible: true,
      totalXP: 250,
      weekXP: 90,
      monthXP: 120,
      prayersCreated: 1,
      prayerSessions: 2,
      prayerMinutes: 12,
      prayersCarried: 3,
      answeredPrayers: 0,
      testimonies: 0,
      bookmarksCreated: 1,
      activeDayKeys: ['2026-06-05'],
      dayKey: '2026-06-05',
      timeZone: 'UTC',
    },
    {
      uid: 'user-hidden',
      leaderboardVisible: false,
      totalXP: 999,
      weekXP: 999,
      monthXP: 999,
      prayersCreated: 8,
      prayerSessions: 8,
      prayerMinutes: 80,
      prayersCarried: 9,
      answeredPrayers: 2,
      testimonies: 1,
      bookmarksCreated: 5,
      activeDayKeys: ['2026-06-05'],
      dayKey: '2026-06-05',
      timeZone: 'UTC',
    },
  ];

  return {
    async runCollectionQuery() {
      return summaries
        .filter((summary) => summary.leaderboardVisible === true)
        .map((summary) => ({ name: `gamificationSummaries/${summary.uid}`, fields: summary }));
    },
    fromFirestoreFields(fields = {}) {
      return { ...fields };
    },
    async getUserProfile(_env, uid) {
      return { uid, displayName: uid.replace(/-/g, ' '), handle: `@${uid}`, photoURL: null };
    },
    async getDocument(_env, name) {
      const uid = name.split('/').pop();
      const summary = summaries.find((item) => item.uid === uid);
      return summary ? { exists: true, fields: summary } : { exists: false };
    },
    docName(_env, ...parts) {
      return parts.join('/');
    },
  };
}

describe('leaderboard', () => {
  it('shows only visible users in public rows and still returns me state', async () => {
    const result = await buildLeaderboard(createFs(), {}, 'user-hidden', 'all', 10);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].uid).toBe('user-visible-1');
    expect(result.rows.find((row) => row.uid === 'user-hidden')).toBeUndefined();
    expect(result.me).toMatchObject({ visible: false, totalXP: 0 });
  });

  it('sorts monthly scope by monthXP', async () => {
    const result = await buildLeaderboard(createFs(), {}, 'user-visible-1', 'monthly', 10);
    expect(result.rows[0].uid).toBe('user-visible-2');
    expect(result.rows[0].scopeXP).toBe(120);
  });

  it('sorts weekly scope by weekXP', async () => {
    const result = await buildLeaderboard(createFs(), {}, 'user-visible-1', 'weekly', 10);
    expect(result.rows[0].uid).toBe('user-visible-2');
    expect(result.rows[0].scopeXP).toBe(90);
  });
});
