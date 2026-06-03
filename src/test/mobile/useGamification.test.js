import { describe, expect, it } from 'vitest';
import { normalizeGamificationSummary } from '../../mobile/useGamification.js';

describe('normalizeGamificationSummary', () => {
  it('returns full defaults for null summary', () => {
    const summary = normalizeGamificationSummary(null);
    expect(summary.badges).toEqual([]);
    expect(summary.weeklyStats).toEqual([]);
    expect(summary.activeDayIndexes).toEqual([]);
    expect(summary.prayedTodayIds).toEqual([]);
    expect(summary.levelInfo.level).toBe(1);
    expect(summary.journey.id).toBe('first-steps');
    expect(summary.impact).toEqual({
      prayerSessions: 0,
      peoplePrayedFor: 0,
      answeredPrayers: 0,
    });
  });

  it('returns full defaults for empty object', () => {
    const summary = normalizeGamificationSummary({});
    expect(summary.badges).toEqual([]);
    expect(summary.streak).toBe(0);
    expect(summary.levelInfo.xpToNextLevel).toBe(500);
  });

  it('merges partial API summary without losing safe array defaults', () => {
    const summary = normalizeGamificationSummary({
      streak: 4,
      badges: null,
      weeklyStats: undefined,
      levelInfo: { level: 3 },
      impact: { prayerSessions: 2 },
    });
    expect(summary.streak).toBe(4);
    expect(summary.badges).toEqual([]);
    expect(summary.weeklyStats).toEqual([]);
    expect(summary.levelInfo.level).toBe(3);
    expect(summary.levelInfo.xpToNextLevel).toBe(500);
    expect(summary.impact).toEqual({
      prayerSessions: 2,
      peoplePrayedFor: 0,
      answeredPrayers: 0,
    });
  });
});
