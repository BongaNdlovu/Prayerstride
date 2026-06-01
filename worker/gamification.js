import {
  DAILY_CHALLENGE_GOAL,
  XP_AWARDS,
  XP_EVENT_TYPES,
} from '../shared/gamificationConstants.js';
import {
  buildGamificationSummaryFromData,
  dayKeyInTimeZone,
  isoWeekKeyFromDayKey,
  resolveTimeZone,
  xpEventId,
} from '../shared/gamificationLogic.js';
import { countEncouragementsSent } from './encouragements.js';

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

export async function awardXpEvent(fs, env, {
  uid,
  type,
  points,
  sourceId,
  dayKey,
  weekKey,
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
        createdAt: now,
      }),
    },
    currentDocument: { exists: false },
  }], { allowAlreadyExists: true });

  if (result.alreadyExists) return { awarded: false, duplicate: true, eventId };
  return { awarded: true, duplicate: false, eventId };
}

async function countPrayActionsForDay(fs, env, uid, dayKey) {
  const docs = await fs.runCollectionGroupQuery(env, 'xpEvents', [{
    fieldFilter: {
      field: { fieldPath: 'uid' },
      op: 'EQUAL',
      value: { stringValue: uid },
    },
  }]);
  return docs.filter((doc) => {
    const data = fs.fromFirestoreFields(doc.fields || {});
    return data.type === XP_EVENT_TYPES.prayAction && data.dayKey === dayKey;
  }).length;
}

export async function evaluateBonusRewards(fs, env, {
  uid,
  timeZone,
  sessions,
  now = new Date(),
}) {
  const tz = resolveTimeZone(timeZone);
  const dayKey = dayKeyInTimeZone(now, tz);
  const weekKey = isoWeekKeyFromDayKey(dayKey);
  const awarded = [];

  const prayCount = await countPrayActionsForDay(fs, env, uid, dayKey);
  if (prayCount >= DAILY_CHALLENGE_GOAL) {
    const daily = await awardXpEvent(fs, env, {
      uid,
      type: XP_EVENT_TYPES.dailyChallenge,
      points: XP_AWARDS.dailyChallenge,
      sourceId: dayKey,
      dayKey,
      weekKey,
      now: now.toISOString ? now.toISOString() : now,
    });
    if (daily.awarded) awarded.push('dailyChallenge');
  }

  const streak = buildGamificationSummaryFromData({
    xpEvents: [],
    sessions,
    timeZone: tz,
    today: now instanceof Date ? now : new Date(now),
  }).streak;

  if (streak >= 7) {
    const streakEvent = await awardXpEvent(fs, env, {
      uid,
      type: XP_EVENT_TYPES.streak7,
      points: XP_AWARDS.streak7,
      sourceId: 'once',
      dayKey,
      weekKey,
      now: now.toISOString ? now.toISOString() : now,
    });
    if (streakEvent.awarded) awarded.push('streak7');
  }

  return awarded;
}

export async function awardPrayActionXp(fs, env, { uid, prayerId, timeZone, now = new Date() }) {
  const tz = resolveTimeZone(timeZone);
  const dayKey = dayKeyInTimeZone(now, tz);
  const weekKey = isoWeekKeyFromDayKey(dayKey);
  const isoNow = now.toISOString ? now.toISOString() : now;

  const result = await awardXpEvent(fs, env, {
    uid,
    type: XP_EVENT_TYPES.prayAction,
    points: XP_AWARDS.prayAction,
    sourceId: `${prayerId}_${dayKey}`,
    dayKey,
    weekKey,
    now: isoNow,
  });

  if (!result.awarded) return { ...result, bonuses: [] };

  const sessions = await loadUserSessions(fs, env, uid);
  const bonuses = await evaluateBonusRewards(fs, env, {
    uid,
    timeZone: tz,
    sessions,
    now,
  });

  return { ...result, bonuses };
}

export async function awardSessionXp(fs, env, { uid, sessionId, timeZone, now = new Date() }) {
  const tz = resolveTimeZone(timeZone);
  const dayKey = dayKeyInTimeZone(now, tz);
  const weekKey = isoWeekKeyFromDayKey(dayKey);
  const isoNow = now.toISOString ? now.toISOString() : now;

  const result = await awardXpEvent(fs, env, {
    uid,
    type: XP_EVENT_TYPES.prayerSession,
    points: XP_AWARDS.prayerSession,
    sourceId: sessionId,
    dayKey,
    weekKey,
    now: isoNow,
  });

  if (!result.awarded) return { ...result, bonuses: [] };

  const sessions = await loadUserSessions(fs, env, uid);
  const bonuses = await evaluateBonusRewards(fs, env, {
    uid,
    timeZone: tz,
    sessions,
    now,
  });

  return { ...result, bonuses };
}

export async function awardTestimonyXp(fs, env, { uid, testimonyId, timeZone, now = new Date() }) {
  const tz = resolveTimeZone(timeZone);
  const dayKey = dayKeyInTimeZone(now, tz);
  const weekKey = isoWeekKeyFromDayKey(dayKey);
  const isoNow = now.toISOString ? now.toISOString() : now;

  return awardXpEvent(fs, env, {
    uid,
    type: XP_EVENT_TYPES.testimony,
    points: XP_AWARDS.testimony,
    sourceId: testimonyId,
    dayKey,
    weekKey,
    now: isoNow,
  });
}

async function loadUserSessions(fs, env, uid) {
  const docs = await fs.runCollectionGroupQuery(env, 'prayerSessions', [{
    fieldFilter: {
      field: { fieldPath: 'authorUid' },
      op: 'EQUAL',
      value: { stringValue: uid },
    },
  }], [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }]);
  return docs.map((doc) => ({
    id: doc.name.split('/').pop(),
    ...fs.fromFirestoreFields(doc.fields || {}),
  }));
}

async function loadUserXpEvents(fs, env, uid) {
  const docs = await fs.runCollectionGroupQuery(env, 'xpEvents', [{
    fieldFilter: {
      field: { fieldPath: 'uid' },
      op: 'EQUAL',
      value: { stringValue: uid },
    },
  }]);
  return docs.map((doc) => fs.fromFirestoreFields(doc.fields || {}));
}

async function loadUserPrayers(fs, env, uid) {
  const docs = await fs.runCollectionGroupQuery(env, 'prayers', [{
    fieldFilter: {
      field: { fieldPath: 'authorUid' },
      op: 'EQUAL',
      value: { stringValue: uid },
    },
  }]);
  return docs.map((doc) => ({
    id: doc.name.split('/').pop(),
    ...fs.fromFirestoreFields(doc.fields || {}),
  }));
}

async function loadUserTestimonies(fs, env, uid) {
  const docs = await fs.runCollectionGroupQuery(env, 'testimonies', [{
    fieldFilter: {
      field: { fieldPath: 'authorUid' },
      op: 'EQUAL',
      value: { stringValue: uid },
    },
  }]);
  return docs.map((doc) => ({
    id: doc.name.split('/').pop(),
    ...fs.fromFirestoreFields(doc.fields || {}),
  }));
}

async function countPeoplePrayedFor(fs, env, uid) {
  const docs = await fs.runCollectionGroupQuery(env, 'prays', [{
    fieldFilter: {
      field: { fieldPath: 'uid' },
      op: 'EQUAL',
      value: { stringValue: uid },
    },
  }], [], ['authorUid']);
  const authors = new Set();
  for (const doc of docs) {
    const data = fs.fromFirestoreFields(doc.fields || {});
    if (data.authorUid) authors.add(data.authorUid);
  }
  return authors.size;
}

export async function buildGamificationSummary(fs, env, uid, requestedTimeZone) {
  const timeZone = await resolveUserTimeZone(fs, env, uid, requestedTimeZone);
  const [sessions, xpEvents, myPrayers, myTestimonies, peoplePrayedFor, encouragementsSent] = await Promise.all([
    loadUserSessions(fs, env, uid),
    loadUserXpEvents(fs, env, uid),
    loadUserPrayers(fs, env, uid),
    loadUserTestimonies(fs, env, uid),
    countPeoplePrayedFor(fs, env, uid),
    countEncouragementsSent(fs, env, uid),
  ]);

  return buildGamificationSummaryFromData({
    xpEvents,
    sessions,
    myPrayers,
    myTestimonies,
    peoplePrayedFor,
    encouragements: encouragementsSent,
    timeZone,
  });
}

export async function backfillGamificationXp(fs, env, uid, requestedTimeZone) {
  const timeZone = await resolveUserTimeZone(fs, env, uid, requestedTimeZone);
  const [sessions, prayers, testimonies, prays] = await Promise.all([
    loadUserSessions(fs, env, uid),
    loadUserPrayers(fs, env, uid),
    loadUserTestimonies(fs, env, uid),
    fs.runCollectionGroupQuery(env, 'prays', [{
      fieldFilter: {
        field: { fieldPath: 'uid' },
        op: 'EQUAL',
        value: { stringValue: uid },
      },
    }]),
  ]);

  let created = 0;
  let skipped = 0;

  for (const session of sessions) {
    const createdAt = session.createdAt ? new Date(session.createdAt) : new Date();
    const dayKey = dayKeyInTimeZone(createdAt, timeZone);
    const weekKey = isoWeekKeyFromDayKey(dayKey);
    const result = await awardXpEvent(fs, env, {
      uid,
      type: XP_EVENT_TYPES.prayerSession,
      points: XP_AWARDS.prayerSession,
      sourceId: session.id,
      dayKey,
      weekKey,
      now: session.createdAt || createdAt.toISOString(),
    });
    if (result.awarded) created += 1;
    else skipped += 1;
  }

  for (const prayDoc of prays) {
    const data = fs.fromFirestoreFields(prayDoc.fields || {});
    if (!data.prayerId) {
      skipped += 1;
      continue;
    }
    const createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    const dayKey = dayKeyInTimeZone(createdAt, timeZone);
    const weekKey = isoWeekKeyFromDayKey(dayKey);
    const result = await awardXpEvent(fs, env, {
      uid,
      type: XP_EVENT_TYPES.prayAction,
      points: XP_AWARDS.prayAction,
      sourceId: `${data.prayerId}_${dayKey}`,
      dayKey,
      weekKey,
      now: data.createdAt || createdAt.toISOString(),
    });
    if (result.awarded) created += 1;
    else skipped += 1;
  }

  for (const testimony of testimonies) {
    const createdAt = testimony.createdAt ? new Date(testimony.createdAt) : new Date();
    const result = await awardTestimonyXp(fs, env, {
      uid,
      testimonyId: testimony.id,
      timeZone,
      now: createdAt,
    });
    if (result.awarded) created += 1;
    else skipped += 1;
  }

  void prayers;

  const summary = await buildGamificationSummary(fs, env, uid, timeZone);
  return { ok: true, created, skipped, summary };
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
    timeZone,
    now,
  });

  return { ok: true, sessionId, xpAwarded: xp.awarded, bonuses: xp.bonuses || [] };
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
  const docs = await fs.runCollectionGroupQuery(env, 'xpEvents', [{
    fieldFilter: {
      field: { fieldPath: 'uid' },
      op: 'EQUAL',
      value: { stringValue: uid },
    },
  }]);
  const writes = docs.map((doc) => ({ delete: doc.name }));
  return writes;
}
