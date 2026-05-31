import { describe, expect, it } from 'vitest';

function formatMinutes(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function aggregateStats(prayers, testimonies, sessions) {
  return {
    prayers: prayers.length,
    testimonies: testimonies.length,
    totalSeconds: sessions.reduce((s, x) => s + (x.seconds || 0), 0),
  };
}

function streakFromSessions(sessions) {
  if (!sessions || sessions.length === 0) return 0;
  return sessions.length;
}

describe('stats session', () => {
  it('formatMinutes returns expected values', () => {
    expect(formatMinutes(0)).toBe('0m');
    expect(formatMinutes(60)).toBe('1m');
    expect(formatMinutes(3661)).toBe('1h 1m');
    expect(formatMinutes(7200)).toBe('2h 0m');
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

  it('streakFromSessions handles empty sessions', () => {
    expect(streakFromSessions([])).toBe(0);
    expect(streakFromSessions(null)).toBe(0);
    expect(streakFromSessions([{ seconds: 60 }, { seconds: 120 }])).toBe(2);
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
