export const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function firestoreDate(value) {
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'number' || typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

export function dateKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function sessionDate(session) {
  return firestoreDate(session?.createdAt);
}

export function calculateStreak(sessions, today = new Date()) {
  const activeDates = new Set(
    (sessions || [])
      .map(sessionDate)
      .filter(Boolean)
      .map((date) => dateKey(date)),
  );

  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  let streak = 0;

  while (activeDates.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function todaySeconds(sessions, today = new Date()) {
  const todayKey = dateKey(today);
  return (sessions || []).reduce((sum, session) => {
    const date = sessionDate(session);
    if (!date || dateKey(date) !== todayKey) return sum;
    return sum + Number(session.seconds || 0);
  }, 0);
}

export function formatPrayerTime(totalSeconds) {
  if (!totalSeconds) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function buildWeeklyStats(sessions, today = new Date(), dayLabels = WEEKDAY_LABELS) {
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const counts = new Map();
  (sessions || []).forEach((session) => {
    const date = sessionDate(session);
    if (!date) return;
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    const offset = Math.floor((day - weekStart) / 86400000);
    if (offset >= 0 && offset < 7) {
      counts.set(offset, (counts.get(offset) || 0) + 1);
    }
  });

  return dayLabels.map((day, index) => ({ day, prayers: counts.get(index) || 0 }));
}

export function isInCalendarMonth(date, today = new Date()) {
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
}

export function countUniqueAuthorsThisMonth(prayers, today = new Date()) {
  const authors = new Set();
  for (const prayer of prayers) {
    const date = firestoreDate(prayer?.createdAt);
    if (!date || !isInCalendarMonth(date, today)) continue;
    if (prayer.authorUid) authors.add(prayer.authorUid);
  }
  return authors.size;
}
