export {
  DAILY_PRAY_GOAL,
  DAILY_CHALLENGE_GOAL,
  XP_PER_LEVEL,
  EARLY_RISER_HOUR,
  XP_AWARDS,
  BADGE_DEFS,
  JOURNEY_STAGES,
} from '../../shared/gamificationConstants.js';

export {
  levelFromXP,
  xpLevelProgress,
  journeyStageForLevel,
  countEarlySessions,
  buildBadgeMetrics,
  badgeState,
  computeBadges,
  formatBadgeProgress,
  buildGamificationSummaryFromData,
  dayKeyInTimeZone,
  resolveTimeZone,
  calculateStreakInTimeZone,
  buildWeeklyStatsInTimeZone,
  activeWeekdayIndexes,
} from '../../shared/gamificationLogic.js';

import { dateKey, firestoreDate, sessionDate, buildWeeklyStats, calculateStreak } from './sessionStats';
import { buildGamificationSummaryFromData } from '../../shared/gamificationLogic.js';

export function countSessionsOnDay(sessions, dayKey) {
  return (sessions || []).filter((session) => {
    const date = sessionDate(session);
    return date && dateKey(date) === dayKey;
  }).length;
}

export function countTestimoniesOnDay(testimonies, dayKey) {
  return (testimonies || []).filter((item) => {
    const date = firestoreDate(item?.createdAt);
    return date && dateKey(date) === dayKey;
  }).length;
}

export function dailyPrayCountForDay(dailyPrayLog, dayKey) {
  return new Set(dailyPrayLog?.[dayKey] || []).size;
}

export function recordDailyPrayAction(dailyPrayLog, prayerId, dayKey = dateKey(new Date())) {
  const next = { ...(dailyPrayLog || {}) };
  const existing = new Set(next[dayKey] || []);
  existing.add(prayerId);
  next[dayKey] = [...existing];
  return next;
}

/** @deprecated Phase 1 local summary — prefer server `getGamificationSummary`. */
export function buildGamificationSummary(input) {
  const today = input.today || new Date();
  const sessions = input.sessions || [];
  const myPrayers = input.myPrayers || [];
  const myTestimonies = input.myTestimonies || [];

  return buildGamificationSummaryFromData({
    xpEvents: [],
    sessions,
    myPrayers,
    myTestimonies,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    today,
  });
}

export { calculateStreak, buildWeeklyStats, dateKey };
