import { getEncouragementPreset } from '../shared/encouragementPresets.js';
import {
  dayKeyInTimeZone,
  isoWeekKeyFromDayKey,
  resolveTimeZone,
} from '../shared/gamificationLogic.js';
import { resolveUserTimeZone } from './gamification.js';

export async function countEncouragementsSent(fs, env, uid) {
  const docs = await fs.runCollectionGroupQuery(env, 'encouragements', [{
    fieldFilter: {
      field: { fieldPath: 'senderUid' },
      op: 'EQUAL',
      value: { stringValue: uid },
    },
  }]);
  return docs.length;
}

export async function createEncouragementRecord(fs, env, user, body, deps) {
  const prayerId = body.prayerId != null ? String(body.prayerId).trim() : '';
  const presetId = body.presetId != null ? String(body.presetId).trim() : '';
  const preset = getEncouragementPreset(presetId);
  if (!prayerId) return { error: 'Missing prayerId', status: 400 };
  if (!preset) return { error: 'Unsupported encouragement preset', status: 400 };

  await deps.checkCommunityAccess(env, user.uid);
  const prayer = await fs.getDocument(env, fs.docName(env, 'prayers', prayerId));
  if (!prayer.exists) return { error: 'Prayer not found', status: 404 };

  const prayerData = fs.fromFirestoreFields(prayer.fields);
  if (prayerData.privacy === 'private' && prayerData.authorUid !== user.uid) {
    return { error: 'Prayer not found', status: 404 };
  }

  const receiverUid = prayerData.authorUid;
  if (!receiverUid) return { error: 'Prayer not found', status: 404 };
  if (receiverUid === user.uid) {
    return { error: 'You cannot encourage your own prayer request.', status: 403 };
  }

  if (await deps.recipientBlockedActor(env, receiverUid, user.uid)) {
    return { error: 'Prayer not found', status: 404 };
  }

  const now = new Date();
  const timeZone = await resolveUserTimeZone(fs, env, user.uid, body.timeZone);
  const dayKey = dayKeyInTimeZone(now, timeZone);
  const weekKey = isoWeekKeyFromDayKey(dayKey);
  const encouragementId = `${user.uid}_${prayerId}_${dayKey}`;
  const encouragementDoc = fs.docName(env, 'encouragements', encouragementId);
  const existing = await fs.getDocument(env, encouragementDoc);
  if (existing.exists) {
    return { ok: true, duplicate: true, encouragementId, weekKey, dayKey };
  }

  await deps.enforceCooldown(env, user.uid, `encourage:${prayerId}`, 2);

  const profile = await fs.getUserProfile(env, user.uid);
  const senderName = profile?.displayName || user.email || 'PrayerStride member';
  const isoNow = now.toISOString();

  const writes = [{
    update: {
      name: encouragementDoc,
      fields: fs.toFirestoreFields({
        senderUid: user.uid,
        senderName,
        receiverUid,
        prayerId,
        presetId: preset.id,
        message: preset.message,
        dayKey,
        weekKey,
        createdAt: isoNow,
      }),
    },
    currentDocument: { exists: false },
  }];

  const prefs = await deps.getNotificationSettings(env, receiverUid);
  const notifyAllowed = prefs.prayerActivity !== false
    && !(await deps.recipientBlockedActor(env, receiverUid, user.uid));

  if (notifyAllowed) {
    writes.push(deps.notificationWrite(env, receiverUid, {
      type: 'encouragement',
      message: preset.message,
      relatedId: prayerId,
      actorUid: user.uid,
    }));
  }

  const result = await fs.firestoreCommit(env, writes, { allowAlreadyExists: true });
  if (result.alreadyExists) {
    return { ok: true, duplicate: true, encouragementId, weekKey, dayKey };
  }

  if (notifyAllowed && prefs.pushEnabled !== false) {
    await deps.sendPushToUser(env, receiverUid, {
      title: 'PrayerStride',
      body: preset.message,
      data: { type: 'encouragement', relatedId: prayerId },
    });
  }

  return {
    ok: true,
    duplicate: false,
    encouragementId,
    weekKey,
    dayKey,
    message: preset.message,
  };
}

function buildWeeklyRankings(encouragements, profilesByUid, viewerUid) {
  const counts = new Map();
  for (const item of encouragements) {
    counts.set(item.senderUid, (counts.get(item.senderUid) || 0) + 1);
  }

  const entries = [...counts.entries()]
    .map(([uid, count]) => {
      const profile = profilesByUid.get(uid) || {};
      const isSelf = uid === viewerUid;
      const showName = isSelf || profile.showOnEncouragementBoard === true;
      return {
        sourceUid: uid,
        count,
        displayName: showName
          ? (profile.displayName || 'Community member')
          : 'Anonymous',
        isSelf,
      };
    })
    .sort((a, b) => b.count - a.count || a.displayName.localeCompare(b.displayName));

  return entries.map((entry, index) => {
    const rank = index + 1;
    const { sourceUid, ...publicEntry } = entry;
    return {
      ...publicEntry,
      id: entry.isSelf || entry.displayName !== 'Anonymous'
        ? sourceUid
        : `anonymous-${rank}`,
      rank,
    };
  });
}

export async function getWeeklyEncouragers(fs, env, viewerUid, requestedTimeZone) {
  const timeZone = await resolveUserTimeZone(fs, env, viewerUid, requestedTimeZone);
  const dayKey = dayKeyInTimeZone(new Date(), resolveTimeZone(timeZone));
  const weekKey = isoWeekKeyFromDayKey(dayKey);

  const docs = await fs.runCollectionGroupQuery(env, 'encouragements', [{
    fieldFilter: {
      field: { fieldPath: 'weekKey' },
      op: 'EQUAL',
      value: { stringValue: weekKey },
    },
  }]);

  const encouragements = docs.map((doc) => fs.fromFirestoreFields(doc.fields || {}));
  const uids = [...new Set(encouragements.map((item) => item.senderUid).filter(Boolean))];
  const profilesByUid = new Map();
  await Promise.all(uids.map(async (uid) => {
    const profile = await fs.getUserProfile(env, uid);
    if (profile) profilesByUid.set(uid, profile);
  }));

  const ranked = buildWeeklyRankings(encouragements, profilesByUid, viewerUid);
  const viewer = ranked.find((entry) => entry.isSelf) || null;

  return {
    weekKey,
    timeZone: resolveTimeZone(timeZone),
    entries: ranked.slice(0, 25),
    viewer: viewer
      ? {
        rank: viewer.rank,
        count: viewer.count,
        displayName: viewer.displayName,
      }
      : { rank: null, count: 0, displayName: profilesByUid.get(viewerUid)?.displayName || 'You' },
  };
}
