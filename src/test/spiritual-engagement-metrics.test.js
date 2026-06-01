import { describe, expect, it } from 'vitest';
import {
  computeSpiritualEngagementMetrics,
  normalizeEngagementDays,
} from '../../worker/spiritual-engagement.js';

function computeMetrics(prayers, prays, days = 30, now = new Date()) {
  const cutoff = new Date(now.getTime() - days * 86400000).toISOString();
  const inWindowPrayers = prayers.filter((p) => p.createdAt && p.createdAt >= cutoff);
  const inWindowPrays = prays.filter((p) => p.createdAt && p.createdAt >= cutoff);
  const result = computeSpiritualEngagementMetrics(inWindowPrayers, inWindowPrays, days, now);
  return {
    ...result.metrics,
    windowTooShortForRetention: result.windowTooShortForRetention,
  };
}

describe('spiritual engagement metrics', () => {
  it('100 requests / 80 with prayers = 80% response rate', () => {
    const now = new Date().toISOString();
    const prayers = Array.from({ length: 100 }, (_, i) => ({
      id: `p${i}`,
      authorUid: `user${i}`,
      createdAt: now,
    }));
    const prays = Array.from({ length: 80 }, (_, i) => ({
      id: `pr${i}`,
      prayerId: `p${i}`,
      uid: `other${i}`,
      createdAt: now,
    }));
    const m = computeMetrics(prayers, prays);
    expect(m.requestCount).toBe(100);
    expect(m.responseRate).toBe(80);
    expect(m.respondedCount).toBe(80);
  });

  it('density = total pray actions / request count', () => {
    const now = new Date().toISOString();
    const prayers = Array.from({ length: 10 }, (_, i) => ({
      id: `p${i}`, authorUid: `u${i}`, createdAt: now,
    }));
    const prays = Array.from({ length: 25 }, (_, i) => ({
      id: `pr${i}`, prayerId: `p${i % 10}`, uid: `o${i}`, createdAt: now,
    }));
    const m = computeMetrics(prayers, prays);
    expect(m.totalPrayActions).toBe(25);
    expect(m.density).toBe(2.5);
  });

  it('reciprocity splits request-only, pray-only, and both correctly', () => {
    const now = new Date().toISOString();
    const prayers = [
      { id: 'p1', authorUid: 'uA', createdAt: now },
      { id: 'p2', authorUid: 'uB', createdAt: now },
      { id: 'p3', authorUid: 'uC', createdAt: now },
    ];
    const prays = [
      { id: 'pr1', prayerId: 'p1', uid: 'uB', createdAt: now },
      { id: 'pr2', prayerId: 'p1', uid: 'uD', createdAt: now },
    ];
    const m = computeMetrics(prayers, prays);
    expect(m.requestOnly).toBe(2);
    expect(m.prayOnly).toBe(1);
    expect(m.both).toBe(1);
  });

  it('time-to-first-prayer ignores invalid timestamps', () => {
    const now = new Date();
    const createdAt = new Date(now.getTime() - 600000).toISOString();
    const firstPray = new Date(now.getTime() - 120000).toISOString();
    const prayers = [
      { id: 'p1', authorUid: 'u1', createdAt },
      { id: 'p2', authorUid: 'u2', createdAt: null },
      { id: 'p3', authorUid: 'u3', createdAt: 'invalid' },
    ];
    const prays = [
      { id: 'pr1', prayerId: 'p1', uid: 'uX', createdAt: firstPray },
      { id: 'pr2', prayerId: 'p2', uid: 'uY', createdAt: now.toISOString() },
      { id: 'pr3', prayerId: 'p3', uid: 'uZ', createdAt: 'bad-timestamp' },
    ];
    const m = computeMetrics(prayers, prays);
    expect(m.averageTimeToFirstPrayerMinutes).toBe(8);
    expect(m.medianTimeToFirstPrayerMinutes).toBe(8);
  });

  it('retention uses 8-14 day to last-7-day definition', () => {
    const now = new Date();
    const dayStr = (offset) => new Date(now.getTime() - offset * 86400000).toISOString();
    const prayers = [
      { id: 'p1', authorUid: 'uR', createdAt: dayStr(10) },
    ];
    const prays = [
      { id: 'pr1', prayerId: 'p1', uid: 'uR', createdAt: dayStr(3) },
    ];
    const m = computeMetrics(prayers, prays, 30, now);
    expect(m.retentionEligible).toBe(1);
    expect(m.retentionCount).toBe(1);
    expect(m.retentionRate).toBe(100);
  });

  it('empty datasets produce safe zero/fallback metrics', () => {
    const m = computeMetrics([], []);
    expect(m.requestCount).toBe(0);
    expect(m.responseRate).toBe(0);
    expect(m.density).toBe(0);
    expect(m.activePrayingUsers7d).toBe(0);
    expect(m.requestOnly).toBe(0);
    expect(m.prayOnly).toBe(0);
    expect(m.both).toBe(0);
    expect(m.retentionRate).toBe(0);
    expect(m.averageTimeToFirstPrayerMinutes).toBeNull();
    expect(m.medianTimeToFirstPrayerMinutes).toBeNull();
  });

  it('marks retention unavailable for windows shorter than 14 days', () => {
    const m = computeMetrics([], [], 7);
    expect(m.retentionRate).toBeNull();
    expect(m.windowTooShortForRetention).toBe(true);
  });

  it('normalizeEngagementDays clamps and defaults safely', () => {
    expect(normalizeEngagementDays(null)).toBe(30);
    expect(normalizeEngagementDays('7')).toBe(7);
    expect(normalizeEngagementDays('0')).toBe(1);
    expect(normalizeEngagementDays('120')).toBe(90);
    expect(normalizeEngagementDays('abc')).toBe(30);
  });
});
