import { describe, expect, it } from 'vitest';
import {
  BADGE_DEFS,
  DAILY_CHALLENGE_GOAL,
  XP_AWARDS,
  XP_PER_LEVEL,
} from '../../shared/gamificationConstants.js';
import {
  buildGamificationSummaryFromData,
  computeBadges,
  formatBadgeProgress,
  journeyStageForLevel,
  levelFromXP,
  summarizeXpEvents,
  xpLevelProgress,
} from '../../shared/gamificationLogic.js';
import { formatBadgeProgress as formatBadgeProgressForMobile, recordDailyPrayAction } from './gamification';

describe('gamification', () => {
  it('deduplicates daily pray actions within the same local day', () => {
    const dayKey = '2026-06-01';
    let log = {};
    log = recordDailyPrayAction(log, 'prayer-a', dayKey);
    log = recordDailyPrayAction(log, 'prayer-a', dayKey);
    log = recordDailyPrayAction(log, 'prayer-b', dayKey);

    expect(log[dayKey]).toEqual(['prayer-a', 'prayer-b']);
    expect(log[dayKey].length).toBe(2);
  });

  it('summarizes pray actions from authoritative xp events', () => {
    const dayKey = '2026-06-01';
    const xpEvents = [
      { type: 'pray_action', points: XP_AWARDS.prayAction, dayKey },
      { type: 'pray_action', points: XP_AWARDS.prayAction, dayKey },
    ];

    const summary = summarizeXpEvents(xpEvents, 'UTC', new Date(`${dayKey}T15:00:00.000Z`));
    expect(summary.dailyPrayCount).toBe(2);
    expect(summary.dailyChallengeComplete).toBe(false);
  });

  it('marks the daily challenge complete when bonus event exists', () => {
    const dayKey = '2026-06-01';
    const xpEvents = Array.from({ length: DAILY_CHALLENGE_GOAL }, (_, index) => ({
      type: 'pray_action',
      points: XP_AWARDS.prayAction,
      dayKey,
      sourceId: `prayer-${index}`,
    }));
    xpEvents.push({
      type: 'daily_challenge',
      points: XP_AWARDS.dailyChallenge,
      dayKey,
    });

    const summary = buildGamificationSummaryFromData({
      xpEvents,
      timeZone: 'UTC',
      today: new Date(`${dayKey}T20:00:00.000Z`),
    });

    expect(summary.dailyChallengeComplete).toBe(true);
    expect(summary.todayXP).toBe(DAILY_CHALLENGE_GOAL * XP_AWARDS.prayAction + XP_AWARDS.dailyChallenge);
  });

  it('calculates level thresholds from total XP', () => {
    expect(levelFromXP(0)).toBe(1);
    expect(levelFromXP(499)).toBe(1);
    expect(levelFromXP(500)).toBe(2);
    expect(levelFromXP(1499)).toBe(3);

    const progress = xpLevelProgress(750);
    expect(progress.level).toBe(2);
    expect(progress.xpIntoLevel).toBe(250);
    expect(progress.xpToNextLevel).toBe(250);
    expect(progress.progress).toBe(0.5);
    expect(XP_PER_LEVEL).toBe(500);
  });

  it('derives journey stages from level without persistence', () => {
    expect(journeyStageForLevel(1).id).toBe('first-steps');
    expect(journeyStageForLevel(3).id).toBe('steady-path');
    expect(journeyStageForLevel(8).id).toBe('prayer-companion');
    expect(journeyStageForLevel(20).id).toBe('summit-seeker');
  });

  it('computes badge progress across earned, in-progress, and locked states', () => {
    const badges = computeBadges({
      prayers: 1,
      streak: 3,
      sessions: 12,
      earlySessions: 2,
      answeredPrayers: 0,
      testimonies: 0,
    });

    expect(badges.find((badge) => badge.id === 'first-prayer')?.state).toBe('earned');
    expect(badges.find((badge) => badge.id === 'streak-7')?.state).toBe('in-progress');
    expect(badges.find((badge) => badge.id === 'faithful-heart')?.state).toBe('in-progress');
    expect(badges.find((badge) => badge.id === 'answered-prayer')?.state).toBe('locked');
    expect(badges.find((badge) => badge.id === 'compassion-helper')?.state).toBe('locked');
    expect(BADGE_DEFS.length).toBeGreaterThan(6);
  });

  it('formats badge progress for the mobile badge tile path', () => {
    const badges = computeBadges({
      prayers: 1,
      streak: 3,
      sessions: 0,
    });

    expect(formatBadgeProgress(badges.find((badge) => badge.id === 'first-prayer'))).toBe('Earned');
    expect(formatBadgeProgressForMobile(badges.find((badge) => badge.id === 'streak-7'))).toBe('3 / 7');
    expect(formatBadgeProgressForMobile(badges.find((badge) => badge.id === 'faithful-heart'))).toBe('0 / 100');
  });

  it('buildGamificationSummaryFromData exposes weekly completion and streak data', () => {
    const sessions = [
      { createdAt: new Date(2026, 5, 1, 9, 0, 0) },
      { createdAt: new Date(2026, 4, 31, 9, 0, 0) },
    ];
    const xpEvents = [
      { type: 'prayer_session', points: XP_AWARDS.prayerSession, dayKey: '2026-06-01' },
    ];

    const summary = buildGamificationSummaryFromData({
      xpEvents,
      sessions,
      timeZone: 'UTC',
      today: new Date(2026, 5, 1, 12, 0, 0),
    });

    expect(summary.streak).toBe(2);
    expect(summary.weeklyCompletion).toBeGreaterThan(0);
    expect(summary.activeDayIndexes.length).toBeGreaterThan(0);
    expect(summary.todayXP).toBe(XP_AWARDS.prayerSession);
  });
});
