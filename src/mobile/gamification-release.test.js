import { describe, expect, it } from 'vitest';
import { prayActionPrayerIdsForDay } from '../../shared/gamificationLogic.js';
import { gamificationBackfillKey } from './useGamification.js';

describe('gamification release hardening', () => {
  it('HomeScreen renders gamified streak, journey, and weekly encouragers entry', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/useGamification/);
    expect(source.default).toMatch(/dailyChallenge/);
    expect(source.default).toMatch(/weeklyEncouragers/);
    expect(source.default).toMatch(/StreakCalendar/);
  });

  it('DailyChallengeScreen uses server summary with loading and retry states', async () => {
    const source = await import('./screens/DailyChallengeScreen.jsx?raw');
    expect(source.default).toMatch(/useGamification/);
    expect(source.default).toMatch(/AsyncState/);
    expect(source.default).toMatch(/onRetry=\{retry\}/);
    expect(source.default).toMatch(/prayedTodayIds/);
  });

  it('AchievementsScreen uses authoritative server badge grid', async () => {
    const source = await import('./screens/AchievementsScreen.jsx?raw');
    expect(source.default).toMatch(/useGamification/);
    expect(source.default).toMatch(/BadgeTile/);
    expect(source.default).toMatch(/numColumns=\{2\}/);
    expect(source.default).not.toMatch(/buildBadgeMetrics/);
  });

  it('ProfileScreen shows gamification impact stats', async () => {
    const source = await import('./screens/ProfileScreen.jsx?raw');
    expect(source.default).toMatch(/useGamification/);
    expect(source.default).toMatch(/impact\.peoplePrayedFor/);
    expect(source.default).toMatch(/impact\.encouragementsSent/);
    expect(source.default).toMatch(/XP total/);
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

  it('EditProfileScreen persists encouragement board opt-in', async () => {
    const source = await import('./screens/EditProfileScreen.jsx?raw');
    expect(source.default).toMatch(/showOnEncouragementBoard/);
    expect(source.default).toMatch(/ToggleRow/);
  });

  it('WeeklyEncouragersScreen handles loading, empty, and retry states', async () => {
    const source = await import('./screens/WeeklyEncouragersScreen.jsx?raw');
    expect(source.default).toMatch(/useWeeklyEncouragers/);
    expect(source.default).toMatch(/AsyncState/);
    expect(source.default).toMatch(/EmptyState/);
    expect(source.default).toMatch(/onRetry=\{retry\}/);
  });

  it('PrayerDetailScreen sends preset encouragements through the worker API', async () => {
    const source = await import('./screens/PrayerDetailScreen.jsx?raw');
    expect(source.default).toMatch(/createEncouragement/);
    expect(source.default).toMatch(/ENCOURAGEMENT_PRESETS/);
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
    expect(source.default).toMatch(/SUMMARY_CACHE_TTL_MS/);
  });
});
