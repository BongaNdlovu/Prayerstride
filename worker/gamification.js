import {
  DAILY_CHALLENGE_GOAL,
  DAILY_PRAY_GOAL,
  EARLY_RISER_HOUR,
  XP_AWARDS,
  XP_EVENT_TYPES,
  XP_PER_LEVEL,
} from '../shared/gamificationConstants.js';
import {
  computeBadges,
  dayKeyInTimeZone,
  hourInTimeZone,
  isoWeekKeyFromDayKey,
  journeyStageForLevel,
  monthKeyFromDayKey,
  previousDayKey,
  resolveTimeZone,
  WEEKDAY_LABELS,
  xpEventId,
  xpLevelProgress,
} from '../shared/gamificationLogic.js';

const SUMMARY_COLLECTION = 'gamificationSummaries';
const PREFERENCES_COLLECTION = 'gamificationPreferences';
const SUMMARY_WRITE_ATTEMPTS = 3;
const SUMMARY_RETRY_MS = 25;
const MAX_ACTIVE_DAY_KEYS = 60;

export const DEFAULT_GAMIFICATION_PREFERENCES = {
  darkModeEnabled: false,
  soundHapticsEnabled: true,
  xpNotificationsEnabled: true,
  streakRemindersEnabled: true,
};

export async function resolveUserTimeZone(fs, env, uid, requestedTimeZone) {
  const profile = await fs.getUserProfile(env, uid);
  const profileTz = resolveTimeZone(profile?.timeZone);
  if (!requestedTimeZone) return profileTz;

  const requested = resolveTimeZone(requestedTimeZone);
  if (requested === profileTz || !profile) return requested;

  await fs.firestoreCommit(env, [{
    update: {
      name: fs.docName(env, 'users', uid),
      fields: fs.toFirestoreFields({
        ...profile,
        timeZone: requested,
        updatedAt: new Date().toISOString(),
      }),
    },
  }]);
  return requested;
}

function safeNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map((value) => String(value || '').trim())
    .filter(Boolean))];
}

function todayDateFromKey(dayKey) {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function buildWeeklyStatsFromDayKeys(dayKeys, todayKey, dayLabels = WEEKDAY_LABELS) {
  const todayDate = todayDateFromKey(todayKey);
  const weekStart = new Date(todayDate);
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
  const activeDays = new Set(dayKeys);

  return dayLabels.map((label, index) => {
    const next = new Date(weekStart);
    next.setUTCDate(weekStart.getUTCDate() + index);
    const dayKey = next.toISOString().slice(0, 10);
    return { day: label, prayers: activeDays.has(dayKey) ? 1 : 0 };
  });
}

function calculateStreakFromDayKeys(dayKeys, todayKey) {
  const activeDays = new Set(dayKeys);
  let cursorKey = todayKey;
  let streak = 0;
  while (activeDays.has(cursorKey)) {
    streak += 1;
    cursorKey = previousDayKey(cursorKey);
  }
  return streak;
}

function emptyStoredSummary(uid, timeZone, dayKey, nowIso) {
  const weekKey = isoWeekKeyFromDayKey(dayKey);
  const monthKey = monthKeyFromDayKey(dayKey);
  return {
    uid,
    timeZone,
    dayKey,
    weekKey,
    monthKey,
    totalXP: 0,
    weekXP: 0,
    monthXP: 0,
    todayXP: 0,
    dailyPrayCount: 0,
    dailyChallengeComplete: false,
    prayedTodayIds: [],
    prayersCreated: 0,
    prayerSessions: 0,
    prayerMinutes: 0,
    earlySessions: 0,
    nightSessions: 0,
    longSessions: 0,
    prayersCarried: 0,
    answeredPrayers: 0,
    testimonies: 0,
    bookmarksCreated: 0,
    activeDayKeys: [],
    streak7Awarded: false,
    updatedAt: nowIso,
  };
}

function normalizeStoredSummary(stored, uid, timeZone, now = new Date()) {
  const tz = resolveTimeZone(timeZone || stored?.timeZone);
  const todayKey = dayKeyInTimeZone(now, tz);
  const currentWeekKey = isoWeekKeyFromDayKey(todayKey);
  const currentMonthKey = monthKeyFromDayKey(todayKey);
  const nowIso = now.toISOString ? now.toISOString() : new Date(now).toISOString();
  const base = {
    ...emptyStoredSummary(uid, tz, todayKey, nowIso),
    ...(stored || {}),
    uid,
    timeZone: tz,
  };
  const storedDayKey = base.dayKey || todayKey;
  const storedWeekKey = base.weekKey || isoWeekKeyFromDayKey(storedDayKey);
  const storedMonthKey = base.monthKey || monthKeyFromDayKey(storedDayKey);
  base.totalXP = safeNumber(base.totalXP);
  base.weekXP = storedWeekKey === currentWeekKey ? safeNumber(base.weekXP) : 0;
  base.monthXP = storedMonthKey === currentMonthKey ? safeNumber(base.monthXP) : 0;
  base.todayXP = base.dayKey === todayKey ? safeNumber(base.todayXP) : 0;
  base.dailyPrayCount = base.dayKey === todayKey ? safeNumber(base.dailyPrayCount) : 0;
  base.dailyChallengeComplete = base.dayKey === todayKey ? Boolean(base.dailyChallengeComplete) : false;
  base.prayedTodayIds = base.dayKey === todayKey ? uniqueStrings(base.prayedTodayIds) : [];
  base.prayersCreated = safeNumber(base.prayersCreated);
  base.prayerSessions = safeNumber(base.prayerSessions);
  base.prayerMinutes = safeNumber(base.prayerMinutes);
  base.earlySessions = safeNumber(base.earlySessions);
  base.nightSessions = safeNumber(base.nightSessions);
  base.longSessions = safeNumber(base.longSessions);
  base.prayersCarried = safeNumber(base.prayersCarried);
  base.answeredPrayers = safeNumber(base.answeredPrayers);
  base.testimonies = safeNumber(base.testimonies);
  base.bookmarksCreated = safeNumber(base.bookmarksCreated);
  base.activeDayKeys = uniqueStrings(base.activeDayKeys)
    .sort()
    .slice(-MAX_ACTIVE_DAY_KEYS);
  base.dayKey = todayKey;
  base.weekKey = currentWeekKey;
  base.monthKey = currentMonthKey;
  base.updatedAt = base.updatedAt || nowIso;
  return base;
}

function publicSummaryFromStored(stored, uid, requestedTimeZone, today = new Date()) {
  const normalized = normalizeStoredSummary(stored, uid, requestedTimeZone, today);
  const todayKey = normalized.dayKey;
  const streak = calculateStreakFromDayKeys(normalized.activeDayKeys, todayKey);
  const weeklyStats = buildWeeklyStatsFromDayKeys(normalized.activeDayKeys, todayKey);
  const activeDayIndexes = weeklyStats
    .map((item, index) => (item.prayers > 0 ? index : null))
    .filter((index) => index !== null);
  const levelInfo = xpLevelProgress(normalized.totalXP);
  const journey = journeyStageForLevel(levelInfo.level);
  const badges = computeBadges({
    prayers: normalized.prayersCreated,
    streak,
    sessions: normalized.prayerSessions,
    earlySessions: normalized.earlySessions,
    answeredPrayers: normalized.answeredPrayers,
    testimonies: normalized.testimonies,
    peoplePrayedFor: normalized.prayersCarried,
    minutes: normalized.prayerMinutes,
    bookmarks: normalized.bookmarksCreated,
    nightSessions: normalized.nightSessions,
    longSessions: normalized.longSessions,
  });

  return {
    streak,
    dailyPrayCount: normalized.dailyPrayCount,
    dailyGoalProgress: Math.min(normalized.dailyPrayCount / DAILY_PRAY_GOAL, 1),
    dailyChallengeComplete: normalized.dailyChallengeComplete,
    dailyChallengeGoal: DAILY_CHALLENGE_GOAL,
    dailyPrayGoal: DAILY_PRAY_GOAL,
    todayXP: normalized.todayXP,
    weekXP: normalized.weekXP,
    monthXP: normalized.monthXP,
    totalXP: normalized.totalXP,
    levelInfo,
    journey,
    weeklyStats,
    activeDayIndexes,
    weeklyCompletion: activeDayIndexes.length / 7,
    currentDayIndex: todayDateFromKey(todayKey).getUTCDay(),
    badges,
    prayedTodayIds: normalized.prayedTodayIds,
    impact: {
      prayerSessions: normalized.prayerSessions,
      peoplePrayedFor: normalized.prayersCarried,
      answeredPrayers: normalized.answeredPrayers,
    },
    timeZone: normalized.timeZone,
  };
}

function addXp(summary, points) {
  const safePoints = safeNumber(points);
  summary.totalXP += safePoints;
  summary.todayXP += safePoints;
  summary.weekXP += safePoints;
  summary.monthXP += safePoints;
}

function addActiveDay(summary, dayKey) {
  summary.activeDayKeys = uniqueStrings([...summary.activeDayKeys, dayKey])
    .sort()
    .slice(-MAX_ACTIVE_DAY_KEYS);
}

export function normalizeGamificationPreferences(preferences) {
  const source = preferences || {};
  return {
    darkModeEnabled: source.darkModeEnabled === true,
    soundHapticsEnabled: source.soundHapticsEnabled !== false,
    xpNotificationsEnabled: source.xpNotificationsEnabled !== false,
    streakRemindersEnabled: source.streakRemindersEnabled !== false,
  };
}

export async function getGamificationPreferences(fs, env, uid) {
  const doc = await fs.getDocument(env, fs.docName(env, PREFERENCES_COLLECTION, uid));
  if (!doc.exists) return normalizeGamificationPreferences(null);
  return normalizeGamificationPreferences(fs.fromFirestoreFields(doc.fields || {}));
}

export async function updateGamificationPreferences(fs, env, uid, patch = {}) {
  const allowedKeys = Object.keys(DEFAULT_GAMIFICATION_PREFERENCES);
  const sanitizedPatch = Object.fromEntries(
    Object.entries(patch).filter(([key, value]) => allowedKeys.includes(key) && typeof value === 'boolean'),
  );
  const current = await getGamificationPreferences(fs, env, uid);
  const next = normalizeGamificationPreferences({ ...current, ...sanitizedPatch });
  const now = new Date().toISOString();

  await fs.firestoreCommit(env, [{
    update: {
      name: fs.docName(env, PREFERENCES_COLLECTION, uid),
      fields: fs.toFirestoreFields({
        uid,
        ...next,
        updatedAt: now,
      }),
    },
  }]);

  return next;
}

export function buildXpPayload(result, points = 0) {
  return {
    awarded: result?.awarded === true,
    points: result?.awarded === true ? safeNumber(points) : 0,
    duplicate: result?.duplicate === true,
    bonuses: result?.bonuses || [],
  };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateStoredSummary(fs, env, uid, requestedTimeZone, now, applyUpdate) {
  const date = now instanceof Date ? now : new Date(now);
  const timeZone = resolveTimeZone(requestedTimeZone);
  const name = fs.docName(env, SUMMARY_COLLECTION, uid);

  for (let attempt = 1; attempt <= SUMMARY_WRITE_ATTEMPTS; attempt += 1) {
    const current = await fs.getDocument(env, name);
    const stored = current.exists ? fs.fromFirestoreFields(current.fields || {}) : {};
    const next = normalizeStoredSummary(stored, uid, timeZone, date);
    const meta = { bonuses: [] };
    applyUpdate(next, meta);
    next.updatedAt = date.toISOString();

    const result = await fs.firestoreCommit(env, [{
      update: {
        name,
        fields: fs.toFirestoreFields(next),
      },
    }], { precondition: current.exists ? { updateTime: current.updateTime } : { exists: false } });

    if (!result.preconditionFailed) {
      return {
        bonuses: meta.bonuses,
        summary: publicSummaryFromStored(next, uid, timeZone, date),
      };
    }
    await wait(attempt * SUMMARY_RETRY_MS);
  }

  throw new Error('Gamification summary update failed');
}

async function recordSummaryAction(fs, env, { uid, timeZone, now = new Date(), applyUpdate }) {
  try {
    return await updateStoredSummary(fs, env, uid, timeZone, now, applyUpdate);
  } catch (error) {
    return { bonuses: [], summaryError: error.message };
  }
}

export async function awardXpEvent(fs, env, {
  uid,
  type,
  points,
  sourceId,
  dayKey,
  weekKey,
  monthKey,
  now = new Date().toISOString(),
}) {
  const eventId = xpEventId(uid, type, sourceId);
  const docPath = fs.docName(env, 'xpEvents', eventId);
  const existing = await fs.getDocument(env, docPath);
  if (existing.exists) return { awarded: false, duplicate: true, eventId };

  const result = await fs.firestoreCommit(env, [{
    update: {
      name: docPath,
      fields: fs.toFirestoreFields({
        uid,
        type,
        points,
        sourceId,
        dayKey,
        weekKey,
        monthKey: monthKey || monthKeyFromDayKey(dayKey),
        createdAt: now,
      }),
    },
    currentDocument: { exists: false },
  }], { allowAlreadyExists: true });

  if (result.alreadyExists) return { awarded: false, duplicate: true, eventId };
  return { awarded: true, duplicate: false, eventId };
}

export async function awardPrayActionXp(fs, env, { uid, prayerId, timeZone, now = new Date() }) {
  const tz = resolveTimeZone(timeZone);
  const dayKey = dayKeyInTimeZone(now, tz);
  const weekKey = isoWeekKeyFromDayKey(dayKey);
  const monthKey = monthKeyFromDayKey(dayKey);
  const isoNow = now.toISOString ? now.toISOString() : now;

  try {
    const result = await awardXpEvent(fs, env, {
      uid,
      type: XP_EVENT_TYPES.prayAction,
      points: XP_AWARDS.prayAction,
      sourceId: `${prayerId}_${dayKey}`,
      dayKey,
      weekKey,
      monthKey,
      now: isoNow,
    });

    if (!result.awarded) return { ...result, bonuses: [] };

    const summaryResult = await recordSummaryAction(fs, env, {
      uid,
      timeZone: tz,
      now,
      applyUpdate(summary, meta) {
        addXp(summary, XP_AWARDS.prayAction);
        summary.prayersCarried += 1;
        summary.dailyPrayCount += 1;
        summary.prayedTodayIds = uniqueStrings([...summary.prayedTodayIds, prayerId]);
        if (summary.dailyPrayCount >= DAILY_CHALLENGE_GOAL && !summary.dailyChallengeComplete) {
          summary.dailyChallengeComplete = true;
          addXp(summary, XP_AWARDS.dailyChallenge);
          meta.bonuses.push('dailyChallenge');
        }
      },
    });

    return { ...result, bonuses: summaryResult.bonuses || [] };
  } catch (error) {
    return { awarded: false, duplicate: false, bonuses: [], error: error.message };
  }
}

export async function awardSessionXp(fs, env, { uid, sessionId, timeZone, seconds = 0, now = new Date() }) {
  const tz = resolveTimeZone(timeZone);
  const dayKey = dayKeyInTimeZone(now, tz);
  const weekKey = isoWeekKeyFromDayKey(dayKey);
  const monthKey = monthKeyFromDayKey(dayKey);
  const isoNow = now.toISOString ? now.toISOString() : now;

  try {
    const result = await awardXpEvent(fs, env, {
      uid,
      type: XP_EVENT_TYPES.prayerSession,
      points: XP_AWARDS.prayerSession,
      sourceId: sessionId,
      dayKey,
      weekKey,
      monthKey,
      now: isoNow,
    });

    if (!result.awarded) return { ...result, bonuses: [] };

    const summaryResult = await recordSummaryAction(fs, env, {
      uid,
      timeZone: tz,
      now,
      applyUpdate(summary, meta) {
        addXp(summary, XP_AWARDS.prayerSession);
        summary.prayerSessions += 1;
        summary.prayerMinutes += Math.max(1, Math.ceil(Number(seconds || 0) / 60));
        if (hourInTimeZone(now, tz) < EARLY_RISER_HOUR) summary.earlySessions += 1;
        if (hourInTimeZone(now, tz) >= 22) summary.nightSessions += 1;
        if (Number(seconds || 0) >= 15 * 60) summary.longSessions += 1;
        addActiveDay(summary, dayKey);
        const streak = calculateStreakFromDayKeys(summary.activeDayKeys, summary.dayKey);
        if (streak >= 7 && !summary.streak7Awarded) {
          summary.streak7Awarded = true;
          addXp(summary, XP_AWARDS.streak7);
          meta.bonuses.push('streak7');
        }
      },
    });

    return { ...result, bonuses: summaryResult.bonuses || [] };
  } catch (error) {
    return { awarded: false, duplicate: false, bonuses: [], error: error.message };
  }
}

export async function awardTestimonyXp(fs, env, { uid, testimonyId, timeZone, now = new Date() }) {
  const tz = resolveTimeZone(timeZone);
  const dayKey = dayKeyInTimeZone(now, tz);
  const weekKey = isoWeekKeyFromDayKey(dayKey);
  const monthKey = monthKeyFromDayKey(dayKey);
  const isoNow = now.toISOString ? now.toISOString() : now;

  try {
    const result = await awardXpEvent(fs, env, {
      uid,
      type: XP_EVENT_TYPES.testimony,
      points: XP_AWARDS.testimony,
      sourceId: testimonyId,
      dayKey,
      weekKey,
      monthKey,
      now: isoNow,
    });

    if (!result.awarded) return result;

    await recordSummaryAction(fs, env, {
      uid,
      timeZone: tz,
      now,
      applyUpdate(summary) {
        addXp(summary, XP_AWARDS.testimony);
        summary.testimonies += 1;
      },
    });

    return result;
  } catch (error) {
    return { awarded: false, duplicate: false, error: error.message };
  }
}

export async function buildGamificationSummary(fs, env, uid, requestedTimeZone) {
  const timeZone = resolveTimeZone(requestedTimeZone);
  const summaryDoc = await fs.getDocument(env, fs.docName(env, SUMMARY_COLLECTION, uid));
  const stored = summaryDoc.exists ? fs.fromFirestoreFields(summaryDoc.fields || {}) : {};
  return publicSummaryFromStored(stored, uid, timeZone);
}

export async function awardBookmarkXp(fs, env, { uid, prayerId, timeZone, now = new Date() }) {
  const tz = resolveTimeZone(timeZone);
  const dayKey = dayKeyInTimeZone(now, tz);
  const weekKey = isoWeekKeyFromDayKey(dayKey);
  const monthKey = monthKeyFromDayKey(dayKey);
  const isoNow = now.toISOString ? now.toISOString() : now;

  try {
    const result = await awardXpEvent(fs, env, {
      uid,
      type: XP_EVENT_TYPES.bookmarkPrayer,
      points: XP_AWARDS.bookmarkPrayer,
      sourceId: prayerId,
      dayKey,
      weekKey,
      monthKey,
      now: isoNow,
    });
    if (!result.awarded) return { ...result, bonuses: [] };
    await recordSummaryAction(fs, env, {
      uid,
      timeZone: tz,
      now,
      applyUpdate(summary) {
        addXp(summary, XP_AWARDS.bookmarkPrayer);
        summary.bookmarksCreated += 1;
      },
    });
    return { ...result, bonuses: [] };
  } catch (error) {
    return { awarded: false, duplicate: false, bonuses: [], error: error.message };
  }
}

export async function awardProfileUpdateXp(fs, env, { uid, timeZone, now = new Date() }) {
  const tz = resolveTimeZone(timeZone);
  const dayKey = dayKeyInTimeZone(now, tz);
  const weekKey = isoWeekKeyFromDayKey(dayKey);
  const monthKey = monthKeyFromDayKey(dayKey);
  const isoNow = now.toISOString ? now.toISOString() : now;

  try {
    const result = await awardXpEvent(fs, env, {
      uid,
      type: XP_EVENT_TYPES.profileUpdate,
      points: XP_AWARDS.profileUpdate,
      sourceId: uid,
      dayKey,
      weekKey,
      monthKey,
      now: isoNow,
    });
    if (!result.awarded) return { ...result, bonuses: [] };
    await recordSummaryAction(fs, env, {
      uid,
      timeZone: tz,
      now,
      applyUpdate(summary) {
        addXp(summary, XP_AWARDS.profileUpdate);
      },
    });
    return { ...result, bonuses: [] };
  } catch (error) {
    return { awarded: false, duplicate: false, bonuses: [], error: error.message };
  }
}

export async function backfillGamificationXp(fs, env, uid, requestedTimeZone) {
  const summary = await buildGamificationSummary(fs, env, uid, requestedTimeZone);
  return { ok: true, created: 0, skipped: 0, summary };
}

export function deleteUserGamificationSummary(fs, env, uid) {
  return [{ delete: fs.docName(env, SUMMARY_COLLECTION, uid) }];
}

export function recordPrayerCreated(fs, env, uid, requestedTimeZone) {
  return recordSummaryAction(fs, env, {
    uid,
    timeZone: requestedTimeZone,
    applyUpdate(summary) {
      summary.prayersCreated += 1;
    },
  });
}

export function recordPrayerAnswered(fs, env, uid, requestedTimeZone) {
  return recordSummaryAction(fs, env, {
    uid,
    timeZone: requestedTimeZone,
    applyUpdate(summary) {
      summary.answeredPrayers += 1;
    },
  });
}

export async function createPrayerSessionRecord(fs, env, user, body) {
  const prayerId = body.prayerId != null ? String(body.prayerId).trim() : '';
  const title = body.title != null ? String(body.title).trim().slice(0, 140) : 'Prayer session';
  const seconds = Number(body.seconds);
  if (!prayerId) return { error: 'Missing prayerId', status: 400 };
  if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 86400) {
    return { error: 'Invalid session duration', status: 400 };
  }

  const prayer = await fs.getDocument(env, fs.docName(env, 'prayers', prayerId));
  if (!prayer.exists) return { error: 'Prayer not found', status: 404 };
  const prayerData = fs.fromFirestoreFields(prayer.fields);
  if (prayerData.privacy === 'private' && prayerData.authorUid !== user.uid) {
    return { error: 'Prayer not found', status: 404 };
  }

  const sessionId = crypto.randomUUID();
  const now = new Date();
  const timeZone = await resolveUserTimeZone(fs, env, user.uid, body.timeZone);

  await fs.firestoreCommit(env, [{
    update: {
      name: fs.docName(env, 'prayerSessions', sessionId),
      fields: fs.toFirestoreFields({
        authorUid: user.uid,
        prayerId,
        title: title || 'Prayer session',
        seconds,
        createdAt: now.toISOString(),
      }),
    },
    currentDocument: { exists: false },
  }]);

  const xp = await awardSessionXp(fs, env, {
    uid: user.uid,
    sessionId,
    seconds,
    timeZone,
    now,
  });

  return {
    ok: true,
    sessionId,
    xpAwarded: xp.awarded,
    bonuses: xp.bonuses || [],
    xp: buildXpPayload(xp, XP_AWARDS.prayerSession),
  };
}

export async function updateGamificationTimeZone(fs, env, uid, timeZone) {
  const resolved = resolveTimeZone(timeZone);
  const profile = await fs.getUserProfile(env, uid);
  if (!profile) return { error: 'Profile not found', status: 404 };
  await fs.firestoreCommit(env, [{
    update: {
      name: fs.docName(env, 'users', uid),
      fields: fs.toFirestoreFields({
        ...profile,
        timeZone: resolved,
        updatedAt: new Date().toISOString(),
      }),
    },
  }]);
  return { ok: true, timeZone: resolved };
}

export async function deleteUserXpEvents(fs, env, uid) {
  let docs;
  try {
    docs = await fs.runCollectionQuery(env, 'xpEvents', [{
      fieldFilter: {
        field: { fieldPath: 'uid' },
        op: 'EQUAL',
        value: { stringValue: uid },
      },
    }]);
  } catch {
    docs = await fs.listDocuments(env, fs.docName(env, 'xpEvents'));
  }
  const writes = docs
    .filter((doc) => fs.fromFirestoreFields(doc.fields || {}).uid === uid)
    .map((doc) => ({ delete: doc.name }));
  return writes;
}
