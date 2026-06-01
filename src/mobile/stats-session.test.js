import { describe, expect, it } from 'vitest';
import { calculateStreak, formatPrayerTime } from './sessionStats';

function aggregateStats(prayers, testimonies, sessions) {
  return {
    prayers: prayers.length,
    testimonies: testimonies.length,
    totalSeconds: sessions.reduce((sum, session) => sum + (session.seconds || 0), 0),
  };
}

describe('stats session', () => {
  it('formatPrayerTime returns expected values', () => {
    expect(formatPrayerTime(0)).toBe('0m');
    expect(formatPrayerTime(60)).toBe('1m');
    expect(formatPrayerTime(3661)).toBe('1h 1m');
    expect(formatPrayerTime(7200)).toBe('2h 0m');
  });

  it('aggregateStats counts correctly', () => {
    const result = aggregateStats(
      [{ id: '1' }, { id: '2' }],
      [{ id: '3' }],
      [{ seconds: 120 }, { seconds: 180 }],
    );
    expect(result.prayers).toBe(2);
    expect(result.testimonies).toBe(1);
    expect(result.totalSeconds).toBe(300);
  });

  it('calculateStreak handles empty sessions', () => {
    const today = new Date('2026-05-31T12:00:00');
    expect(calculateStreak([], today)).toBe(0);
    expect(calculateStreak(null, today)).toBe(0);
    expect(calculateStreak([
      { createdAt: '2026-05-31T08:00:00.000Z' },
      { createdAt: '2026-05-30T08:00:00.000Z' },
    ], today)).toBe(2);
  });

  it('stopwatch screen imports addPrayerSession', async () => {
    const source = await import('./screens/PrayerStopwatchScreen.jsx?raw');
    expect(source.default).toMatch(/addPrayerSession/);
  });

  it('stats screen imports ProgressRing and WeeklyBarChart', async () => {
    const source = await import('./screens/MyStatsScreen.jsx?raw');
    expect(source.default).toMatch(/ProgressRing/);
    expect(source.default).toMatch(/WeeklyBarChart/);
  });
});
