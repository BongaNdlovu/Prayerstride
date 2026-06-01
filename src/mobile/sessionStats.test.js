import { describe, expect, it } from 'vitest';
import {
  buildWeeklyStats,
  calculateStreak,
  countUniqueAuthorsThisMonth,
  formatPrayerTime,
  formatFirestoreDate,
  todaySeconds,
} from './sessionStats';

describe('sessionStats', () => {
  const today = new Date('2026-05-31T12:00:00');

  it('formatPrayerTime returns expected values', () => {
    expect(formatPrayerTime(0)).toBe('0m');
    expect(formatPrayerTime(60)).toBe('1m');
    expect(formatPrayerTime(3661)).toBe('1h 1m');
  });

  it('formatFirestoreDate accepts Firestore timestamps and ISO strings', () => {
    expect(formatFirestoreDate({ toDate: () => new Date('2026-05-31T00:00:00.000Z') })).not.toBe('');
    expect(formatFirestoreDate('2026-05-31T00:00:00.000Z')).not.toBe('');
    expect(formatFirestoreDate('invalid', 'date unavailable')).toBe('date unavailable');
  });

  it('todaySeconds only counts sessions from today', () => {
    const sessions = [
      { seconds: 120, createdAt: '2026-05-31T08:00:00.000Z' },
      { seconds: 300, createdAt: '2026-05-30T08:00:00.000Z' },
    ];
    expect(todaySeconds(sessions, today)).toBe(120);
  });

  it('countUniqueAuthorsThisMonth counts distinct authorUid values', () => {
    const prayers = [
      { authorUid: 'a', createdAt: '2026-05-10T00:00:00.000Z' },
      { authorUid: 'a', createdAt: '2026-05-20T00:00:00.000Z' },
      { authorUid: 'b', createdAt: '2026-05-15T00:00:00.000Z' },
      { authorUid: 'c', createdAt: '2026-04-30T00:00:00.000Z' },
    ];
    expect(countUniqueAuthorsThisMonth(prayers, today)).toBe(2);
  });

  it('calculateStreak counts consecutive active days', () => {
    const sessions = [
      { createdAt: '2026-05-31T08:00:00.000Z' },
      { createdAt: '2026-05-30T08:00:00.000Z' },
      { createdAt: '2026-05-28T08:00:00.000Z' },
    ];
    expect(calculateStreak(sessions, today)).toBe(2);
  });

  it('buildWeeklyStats counts sessions per weekday in the current week', () => {
    const weekAnchor = new Date('2026-06-03T12:00:00');
    const sessions = [
      { createdAt: '2026-06-01T08:00:00.000Z' },
      { createdAt: '2026-06-03T09:00:00.000Z' },
      { createdAt: '2026-06-03T18:00:00.000Z' },
      { createdAt: '2026-05-30T08:00:00.000Z' },
    ];
    expect(buildWeeklyStats(sessions, weekAnchor)).toEqual([
      { day: 'S', prayers: 0 },
      { day: 'M', prayers: 1 },
      { day: 'T', prayers: 0 },
      { day: 'W', prayers: 2 },
      { day: 'T', prayers: 0 },
      { day: 'F', prayers: 0 },
      { day: 'S', prayers: 0 },
    ]);
  });

  it('buildWeeklyStats counts sessions by local calendar day across DST transitions', () => {
    const weekAnchor = new Date(2026, 2, 11, 12, 0, 0);
    const sessions = [
      { createdAt: new Date(2026, 2, 8, 10, 0, 0) },
      { createdAt: new Date(2026, 2, 9, 10, 0, 0) },
      { createdAt: new Date(2026, 2, 11, 10, 0, 0) },
    ];
    expect(buildWeeklyStats(sessions, weekAnchor)).toEqual([
      { day: 'S', prayers: 1 },
      { day: 'M', prayers: 1 },
      { day: 'T', prayers: 0 },
      { day: 'W', prayers: 1 },
      { day: 'T', prayers: 0 },
      { day: 'F', prayers: 0 },
      { day: 'S', prayers: 0 },
    ]);
  });

  it('HomeScreen uses gamification summary for streak and daily goal', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/useGamification/);
    expect(source.default).toMatch(/dailyGoalProgress/);
    expect(source.default).toMatch(/dailyChallenge/);
  });
});
