import { describe, expect, it } from 'vitest';
import { prayActionPrayerIdsForDay } from '../../shared/gamificationLogic.js';
import { gamificationBackfillKey } from './useGamification.js';

describe('gamification release hardening', () => {
  it('HomeScreen renders gamified streak and journey without encouragement entry points', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/useGamification/);
    expect(source.default).toMatch(/JourneyProgressPanel/);
    expect(source.default).toMatch(/PrayerFocusCard/);
    expect(source.default).not.toMatch(/weeklyEncouragers/);
    expect(source.default).not.toMatch(/Weekly Encouragers/);
    expect(source.default).not.toMatch(/go\('dailyChallenge'/);
  });

  it('CommunityScreen replaces ranking with shared impact and cooperative goals', async () => {
    const source = await import('./screens/CommunityScreen.jsx?raw');
    expect(source.default).toMatch(/Prayer Chain/);
    expect(source.default).toMatch(/Cooperative Goal/);
    expect(source.default).toMatch(/Shared Prayer Wall/);
    expect(source.default).not.toMatch(/Leaderboard/);
    expect(source.default).not.toMatch(/rank/i);
  });

  it('AchievementsScreen uses authoritative server badge grid', async () => {
    const source = await import('./screens/AchievementsScreen.jsx?raw');
    expect(source.default).toMatch(/useGamification/);
    expect(source.default).toMatch(/BadgeTile/);
    expect(source.default).toMatch(/numColumns=\{2\}/);
    expect(source.default).not.toMatch(/buildBadgeMetrics/);
  });

  it('ProfileScreen shows gamification impact stats without encouragement counters', async () => {
    const source = await import('./screens/ProfileScreen.jsx?raw');
    expect(source.default).toMatch(/useGamification/);
    expect(source.default).toMatch(/impact\.peoplePrayedFor/);
    expect(source.default).not.toMatch(/encouragementsSent/);
    expect(source.default).not.toMatch(/weeklyEncouragers/);
    expect(source.default).toMatch(/Prayer Journey/);
    expect(source.default).not.toMatch(/Total XP/);
  });

  it('keeps core screens open when only gamification stats fail', async () => {
    const home = await import('./screens/HomeScreen.jsx?raw');
    const profile = await import('./screens/ProfileScreen.jsx?raw');
    expect(home.default).toMatch(/const listError = prayersError \|\| blocksError/);
    expect(home.default).not.toMatch(/listError = .*statsError/);
    expect(profile.default).toMatch(/const statsUnavailable = Boolean\(gamificationError\)/);
    expect(profile.default).toMatch(/error=\{profileError\}/);
    expect(profile.default).not.toMatch(/error=\{profileError \|\| gamificationError\}/);
  });

  it('EditProfileScreen no longer persists encouragement board settings', async () => {
    const source = await import('./screens/EditProfileScreen.jsx?raw');
    expect(source.default).not.toMatch(/showOnEncouragementBoard/);
    expect(source.default).not.toMatch(/Weekly Encouragers/);
  });

  it('prototype gamification screens are reachable without legacy daily challenge or praise routes', async () => {
    const app = await import('../../app/index.jsx?raw');
    expect(app.default).toMatch(/case 'home'/);
    expect(app.default).toMatch(/case 'community'/);
    expect(app.default).toMatch(/case 'stride'/);
    expect(app.default).toMatch(/case 'profile'/);
    expect(app.default).toMatch(/case 'achievements'/);
    expect(app.default).not.toMatch(/case 'dailyChallenge'/);
    expect(app.default).not.toMatch(/case 'praise'/);
    expect(app.default).not.toMatch(/case 'leaderboard'/);
  });

  it('PrayerDetailScreen no longer sends encouragements or follow actions through the worker API', async () => {
    const source = await import('./screens/PrayerDetailScreen.jsx?raw');
    expect(source.default).not.toMatch(/createEncouragement/);
    expect(source.default).not.toMatch(/ENCOURAGEMENT_PRESETS/);
    expect(source.default).not.toMatch(/Encourage/);
    expect(source.default).not.toMatch(/followUser/);
    expect(source.default).not.toMatch(/Follow Author/);
  });

  it('derives prayedTodayIds from authoritative pray-action XP events', () => {
    const ids = prayActionPrayerIdsForDay([
      { type: 'pray_action', dayKey: '2026-06-01', sourceId: 'prayer-a_2026-06-01' },
      { type: 'pray_action', dayKey: '2026-06-01', sourceId: 'prayer-b_2026-06-01' },
      { type: 'pray_action', dayKey: '2026-05-31', sourceId: 'prayer-c_2026-05-31' },
    ], '2026-06-01');
    expect(ids).toEqual(['prayer-a', 'prayer-b']);
  });

  it('scopes the backfill marker to the signed-in account', () => {
    expect(gamificationBackfillKey('user-a')).toBe('gamificationBackfillV2:user-a');
    expect(gamificationBackfillKey('user-b')).toBe('gamificationBackfillV2:user-b');
  });

  it('loads authoritative gamification summaries without duplicate live collection listeners', async () => {
    const source = await import('./useGamification.js?raw');
    expect(source.default).not.toMatch(/usePrayers/);
    expect(source.default).not.toMatch(/usePrayerSessions/);
    expect(source.default).not.toMatch(/useTestimonies/);
    expect(source.default).not.toMatch(/updateGamificationTimeZone/);
    expect(source.default).not.toMatch(/backfillGamification/);
    expect(source.default).not.toMatch(/AsyncStorage/);
    expect(source.default).toMatch(/SUMMARY_CACHE_TTL_MS/);
    expect(source.default).toMatch(/summaryRequests/);
    expect(source.default).toMatch(/loadGamificationSummary/);
    expect(source.default).toMatch(/summaryCache\.delete/);
  });
});
