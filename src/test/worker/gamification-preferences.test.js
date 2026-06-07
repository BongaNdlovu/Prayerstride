import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GAMIFICATION_PREFERENCES,
  buildGamificationSummary,
  buildXpPayload,
  normalizeGamificationPreferences,
  updateGamificationPreferences,
} from '../../../worker/gamification.js';

function createFs() {
  const docs = new Map();
  return {
    docs,
    docName(_env, ...parts) {
      return parts.join('/');
    },
    async getDocument(_env, name) {
      if (!docs.has(name)) return { exists: false };
      return { exists: true, fields: docs.get(name) };
    },
    fromFirestoreFields(fields = {}) {
      return { ...fields };
    },
    toFirestoreFields(fields = {}) {
      return { ...fields };
    },
    async firestoreCommit(_env, writes) {
      for (const write of writes) {
        if (write.update) docs.set(write.update.name, { ...write.update.fields });
      }
      return { ok: true };
    },
  };
}

describe('gamification preferences', () => {
  it('normalizes safe defaults', () => {
    expect(normalizeGamificationPreferences(null)).toEqual(DEFAULT_GAMIFICATION_PREFERENCES);
    expect(normalizeGamificationPreferences({ leaderboardVisible: true, soundHapticsEnabled: false }))
      .toMatchObject({ leaderboardVisible: true, soundHapticsEnabled: false, darkModeEnabled: false });
  });

  it('persists preferences and mirrors leaderboard visibility into the summary', async () => {
    const fs = createFs();
    fs.docs.set('gamificationSummaries/user-1', {
      uid: 'user-1',
      timeZone: 'UTC',
      dayKey: '2026-06-05',
      updatedAt: '2026-06-05T00:00:00.000Z',
    });

    const preferences = await updateGamificationPreferences(fs, {}, 'user-1', {
      leaderboardVisible: true,
      darkModeEnabled: true,
      ignored: 'nope',
    });

    expect(preferences).toMatchObject({ leaderboardVisible: true, darkModeEnabled: true });
    expect(fs.docs.get('gamificationPreferences/user-1')).toMatchObject({
      uid: 'user-1',
      leaderboardVisible: true,
      darkModeEnabled: true,
    });
    expect(fs.docs.get('gamificationSummaries/user-1')).toMatchObject({
      leaderboardVisible: true,
    });
  });

  it('builds structured XP payloads for the mobile contract', () => {
    expect(buildXpPayload({ awarded: true, duplicate: false, bonuses: ['dailyChallenge'] }, 15)).toEqual({
      awarded: true,
      points: 15,
      duplicate: false,
      bonuses: ['dailyChallenge'],
    });
    expect(buildXpPayload({ awarded: false, duplicate: true }, 15)).toEqual({
      awarded: false,
      points: 0,
      duplicate: true,
      bonuses: [],
    });
  });

  it('includes all stored counters in public badge progress', async () => {
    const fs = createFs();
    fs.docs.set('gamificationSummaries/user-1', {
      uid: 'user-1',
      timeZone: 'UTC',
      prayersCreated: 1,
      prayersCarried: 20,
      prayerMinutes: 120,
      bookmarksCreated: 10,
      nightSessions: 5,
      longSessions: 4,
      updatedAt: '2026-06-06T00:00:00.000Z',
    });

    const summary = await buildGamificationSummary(fs, {}, 'user-1', 'UTC');
    const earnedIds = summary.badges
      .filter((badge) => badge.state === 'earned')
      .map((badge) => badge.id);

    expect(earnedIds).toContain('first-prayer');
    expect(earnedIds).toContain('compassion-helper');
    expect(earnedIds).toContain('faithful-minutes');
    expect(earnedIds).toContain('keeper-of-requests');
    expect(earnedIds).toContain('night-watch');
    expect(earnedIds).toContain('steadfast-hour');
  });
});
