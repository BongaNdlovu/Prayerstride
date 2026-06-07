import {
  BADGE_DEFS,
  DAILY_CHALLENGE_GOAL,
  DAILY_PRAY_GOAL,
  EARLY_RISER_HOUR,
  JOURNEY_STAGES,
  XP_AWARDS,
  XP_PER_LEVEL,
} from './gamificationConstants.js';

export const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function parseTimestamp(value) {
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'number' || typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

export function resolveTimeZone(timeZone) {
  if (!timeZone || typeof timeZone !== 'string') return 'UTC';
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return timeZone;
  } catch {
    return 'UTC';
  }
}

export function dayKeyInTimeZone(date, timeZone = 'UTC') {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: resolveTimeZone(timeZone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function hourInTimeZone(date, timeZone = 'UTC') {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: resolveTimeZone(timeZone),
    hour: 'numeric',
    hour12: false,
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === 'hour')?.value;
  return Number(hour ?? 0);
}

export function isoWeekKeyFromDayKey(dayKey) {
  return isoWeekKey(`${dayKey}T12:00:00.000Z`);
}

export function monthKeyFromDayKey(dayKey) {
  return String(dayKey || '').slice(0, 7);
}

export function isoWeekKey(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date');
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function previousDayKey(dayKey) {
  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day - 1, 12));
  return date.toISOString().slice(0, 10);
}

export function levelFromXP(totalXP) {
  return Math.floor(Math.max(0, totalXP) / XP_PER_LEVEL) + 1;
}

export function xpLevelProgress(totalXP) {
  const safeXP = Math.max(0, totalXP);
  const level = levelFromXP(safeXP);
  const xpIntoLevel = safeXP % XP_PER_LEVEL;
  return {
    level,
    totalXP: safeXP,
    xpIntoLevel,
    xpToNextLevel: XP_PER_LEVEL - xpIntoLevel,
    progress: xpIntoLevel / XP_PER_LEVEL,
  };
}

export function journeyStageForLevel(level) {
  const sorted = [...JOURNEY_STAGES].sort((a, b) => b.minLevel - a.minLevel);
  return sorted.find((stage) => level >= stage.minLevel) || JOURNEY_STAGES[0];
}

export function countEarlySessions(sessions, timeZone = 'UTC') {
  return (sessions || []).filter((session) => {
    const date = parseTimestamp(session?.createdAt);
    return date && hourInTimeZone(date, timeZone) < EARLY_RISER_HOUR;
  }).length;
}

export function calculateStreakInTimeZone(sessions, timeZone = 'UTC', today = new Date()) {
  const activeDates = new Set(
    (sessions || [])
      .map((session) => {
        const date = parseTimestamp(session?.createdAt);
        return date ? dayKeyInTimeZone(date, timeZone) : null;
      })
      .filter(Boolean),
  );

  let cursorKey = dayKeyInTimeZone(today, timeZone);
  let streak = 0;

  while (activeDates.has(cursorKey)) {
    streak += 1;
    cursorKey = previousDayKey(cursorKey);
  }

  return streak;
}

export function buildWeeklyStatsInTimeZone(sessions, timeZone = 'UTC', today = new Date(), dayLabels = WEEKDAY_LABELS) {
  const todayKey = dayKeyInTimeZone(today, timeZone);
  const [year, month, day] = todayKey.split('-').map(Number);
  const todayDate = new Date(Date.UTC(year, month - 1, day, 12));
  const weekStart = new Date(todayDate);
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());

  const weekKeys = Array.from({ length: 7 }, (_, index) => {
    const next = new Date(weekStart);
    next.setUTCDate(weekStart.getUTCDate() + index);
    return next.toISOString().slice(0, 10);
  });

  const counts = new Map();
  (sessions || []).forEach((session) => {
    const date = parseTimestamp(session?.createdAt);
    if (!date) return;
    const key = dayKeyInTimeZone(date, timeZone);
    const offset = weekKeys.indexOf(key);
    if (offset >= 0) counts.set(offset, (counts.get(offset) || 0) + 1);
  });

  return dayLabels.map((label, index) => ({ day: label, prayers: counts.get(index) || 0 }));
}

export function activeWeekdayIndexes(sessions, timeZone = 'UTC', today = new Date()) {
  return buildWeeklyStatsInTimeZone(sessions, timeZone, today)
    .map((item, index) => (item.prayers > 0 ? index : null))
    .filter((index) => index !== null);
}

export function buildBadgeMetrics({
  myPrayers = [],
  sessions = [],
  myTestimonies = [],
  streak = 0,
  timeZone = 'UTC',
  peoplePrayedFor = 0,
  bookmarks = 0,
}) {
  const answeredPrayers = myPrayers.filter((prayer) => prayer.status === 'answered').length;
  const totalMinutes = (sessions || []).reduce((sum, session) => sum + Math.floor(Number(session?.seconds || 0) / 60), 0);
  const nightSessions = (sessions || []).filter((session) => {
    const date = parseTimestamp(session?.createdAt);
    return date && hourInTimeZone(date, timeZone) >= 22;
  }).length;
  const longSessions = (sessions || []).filter((session) => Number(session?.seconds || 0) >= 15 * 60).length;

  return {
    prayers: myPrayers.length,
    streak,
    sessions: sessions.length,
    earlySessions: countEarlySessions(sessions, timeZone),
    answeredPrayers,
    testimonies: myTestimonies.length,
    peoplePrayedFor,
    minutes: totalMinutes,
    bookmarks,
    nightSessions,
    longSessions,
  };
}

export function badgeState(badge, current) {
  if (badge.lockedUntilPhase) return 'locked';
  if (current >= badge.total) return 'earned';
  if (current > 0) return 'in-progress';
  return 'locked';
}

export function computeBadges(metrics) {
  return BADGE_DEFS.map((badge) => {
    const current = metrics[badge.metric] ?? 0;
    const state = badgeState(badge, current);
    const progress = badge.total ? Math.min(current / badge.total, 1) : 0;
    return {
      ...badge,
      current,
      completed: state === 'earned',
      state,
      progress,
    };
  });
}

export function formatBadgeProgress(badge) {
  const current = Math.max(0, Number(badge?.current || 0));
  const total = Math.max(0, Number(badge?.total || 0));
  if (badge?.state === 'earned' || (total > 0 && current >= total)) return 'Earned';
  if (!total) return '0 / 0';
  return `${Math.min(current, total)} / ${total}`;
}

export function xpEventId(uid, type, sourceId) {
  return `${uid}_${type}_${sourceId}`;
}

export function prayActionPrayerIdsForDay(events, dayKey) {
  const ids = [];
  for (const event of events) {
    if (event.type !== 'pray_action' || event.dayKey !== dayKey) continue;
    const sourceId = String(event.sourceId || '');
    const suffix = `_${dayKey}`;
    const prayerId = sourceId.endsWith(suffix)
      ? sourceId.slice(0, -suffix.length)
      : sourceId.split('_')[0];
    if (prayerId) ids.push(prayerId);
  }
  return ids;
}

export function summarizeXpEvents(events, timeZone = 'UTC', today = new Date()) {
  const todayKey = dayKeyInTimeZone(today, timeZone);
  const currentMonthKey = monthKeyFromDayKey(todayKey);
  let totalXP = 0;
  let todayXP = 0;
  let monthXP = 0;
  let dailyPrayCount = 0;
  let dailyChallengeComplete = false;

  for (const event of events) {
    const points = Number(event.points || 0);
    totalXP += points;
    const eventMonthKey = event.monthKey || monthKeyFromDayKey(event.dayKey || '');
    if (eventMonthKey === currentMonthKey) monthXP += points;
    if (event.dayKey === todayKey) {
      todayXP += points;
      if (event.type === 'pray_action') dailyPrayCount += 1;
      if (event.type === 'daily_challenge') dailyChallengeComplete = true;
    }
  }

  return {
    totalXP,
    todayXP,
    monthXP,
    dailyPrayCount,
    dailyChallengeComplete,
    dailyGoalProgress: Math.min(dailyPrayCount / DAILY_PRAY_GOAL, 1),
    dailyChallengeGoal: DAILY_CHALLENGE_GOAL,
    dailyPrayGoal: DAILY_PRAY_GOAL,
    prayedTodayIds: prayActionPrayerIdsForDay(events, todayKey),
  };
}

export function buildGamificationSummaryFromData({
  xpEvents = [],
  sessions = [],
  myPrayers = [],
  myTestimonies = [],
  peoplePrayedFor = 0,
  bookmarks = 0,
  timeZone = 'UTC',
  today = new Date(),
}) {
  const tz = resolveTimeZone(timeZone);
  const xpSummary = summarizeXpEvents(xpEvents, tz, today);
  const streak = calculateStreakInTimeZone(sessions, tz, today);
  const levelInfo = xpLevelProgress(xpSummary.totalXP);
  const journey = journeyStageForLevel(levelInfo.level);
  const weeklyStats = buildWeeklyStatsInTimeZone(sessions, tz, today);
  const activeDayIndexes = activeWeekdayIndexes(sessions, tz, today);
  const badgeMetrics = buildBadgeMetrics({
    myPrayers,
    sessions,
    myTestimonies,
    streak,
    timeZone: tz,
    peoplePrayedFor,
    bookmarks,
  });
  const badges = computeBadges(badgeMetrics);
  const todayKey = dayKeyInTimeZone(today, tz);
  const [year, month, day] = todayKey.split('-').map(Number);
  const todayDate = new Date(Date.UTC(year, month - 1, day, 12));

  return {
    ...xpSummary,
    streak,
    levelInfo,
    journey,
    weeklyStats,
    activeDayIndexes,
    weeklyCompletion: activeDayIndexes.length / 7,
    currentDayIndex: todayDate.getUTCDay(),
    badges,
    impact: {
      prayerSessions: sessions.length,
      peoplePrayedFor,
      answeredPrayers: myPrayers.filter((prayer) => prayer.status === 'answered').length,
    },
    timeZone: tz,
  };
}

export { XP_AWARDS, DAILY_PRAY_GOAL, DAILY_CHALLENGE_GOAL, XP_PER_LEVEL };
