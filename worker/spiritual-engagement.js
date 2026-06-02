export function normalizeEngagementDays(requestedDaysParam) {
  const requestedDays = requestedDaysParam === null ? 30 : Number(requestedDaysParam);
  return Number.isFinite(requestedDays)
    ? Math.min(90, Math.max(1, Math.floor(requestedDays)))
    : 30;
}

export function computeSpiritualEngagementMetrics(prayers, prays, days, now = new Date()) {
  const cutoffISO = new Date(now.getTime() - days * 86400000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000).toISOString();
  const eightDaysAgo = new Date(now.getTime() - 8 * 86400000).toISOString();

  const activityByDay = {};
  for (const p of prayers) {
    const day = isoDay(p.createdAt);
    if (!day) continue;
    activityByDay[day] = (activityByDay[day] || 0) + 1;
  }
  const activityByDaySorted = Object.entries(activityByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count]) => ({ day, count }));

  const prayedPrayerIds = new Set(prays.map((p) => p.prayerId).filter(Boolean));
  const requestCount = prayers.length;
  const respondedCount = prayers.filter((p) => prayedPrayerIds.has(p.id)).length;
  const responseRate = requestCount > 0 ? Math.round((respondedCount / requestCount) * 100) : 0;

  const totalPrayActions = prays.length;
  const density = requestCount > 0 ? parseFloat((totalPrayActions / requestCount).toFixed(2)) : 0;

  const activePrayingUserIds = new Set();
  for (const p of prays) {
    if (p.createdAt && p.createdAt >= sevenDaysAgo) {
      activePrayingUserIds.add(p.uid);
    }
  }
  const activePrayingUsers = activePrayingUserIds.size;

  const requestAuthorIds = new Set(prayers.map((p) => p.authorUid).filter(Boolean));
  const prayUserIds = new Set(prays.map((p) => p.uid).filter(Boolean));
  const requestOnly = [...requestAuthorIds].filter((uid) => !prayUserIds.has(uid)).length;
  const prayOnly = [...prayUserIds].filter((uid) => !requestAuthorIds.has(uid)).length;
  const both = [...requestAuthorIds].filter((uid) => prayUserIds.has(uid)).length;

  const prayByPrayer = {};
  for (const p of prays) {
    if (!p.prayerId) continue;
    if (!prayByPrayer[p.prayerId] || (p.createdAt && p.createdAt < prayByPrayer[p.prayerId])) {
      prayByPrayer[p.prayerId] = p.createdAt;
    }
  }

  const timeDeltas = [];
  for (const p of prayers) {
    const firstPray = prayByPrayer[p.id];
    if (!firstPray || !p.createdAt) continue;
    const created = new Date(p.createdAt).getTime();
    const first = new Date(firstPray).getTime();
    if (Number.isFinite(created) && Number.isFinite(first) && first >= created) {
      timeDeltas.push((first - created) / 60000);
    }
  }

  let medianTimeToFirstPrayer = null;
  let averageTimeToFirstPrayer = null;
  if (timeDeltas.length > 0) {
    const sorted = [...timeDeltas].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    medianTimeToFirstPrayer = sorted.length % 2 === 0
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : Math.round(sorted[mid]);
    averageTimeToFirstPrayer = Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length);
  }

  const activityByUser = {};
  for (const p of prayers) {
    if (p.authorUid) {
      if (!activityByUser[p.authorUid]) activityByUser[p.authorUid] = { created: new Set(), prayed: new Set() };
      const day = isoDay(p.createdAt);
      if (day) activityByUser[p.authorUid].created.add(day);
    }
  }
  for (const p of prays) {
    if (p.uid) {
      if (!activityByUser[p.uid]) activityByUser[p.uid] = { created: new Set(), prayed: new Set() };
      const day = isoDay(p.createdAt);
      if (day) activityByUser[p.uid].prayed.add(day);
    }
  }

  const isActiveInRange = (uid, startISO, endISO) => {
    const act = activityByUser[uid];
    if (!act) return false;
    const start = startISO.slice(0, 10);
    const end = endISO.slice(0, 10);
    for (const day of [...act.created, ...act.prayed]) {
      if (day >= start && day <= end) return true;
    }
    return false;
  };

  let retentionCount = 0;
  let retentionEligible = 0;
  const todayStr = now.toISOString().slice(0, 10);
  const eightDaysAgoStr = eightDaysAgo.slice(0, 10);
  const fourteenDaysAgoStr = fourteenDaysAgo.slice(0, 10);
  const sevenDaysAgoStr = sevenDaysAgo.slice(0, 10);

  for (const uid of Object.keys(activityByUser)) {
    if (isActiveInRange(uid, fourteenDaysAgoStr, eightDaysAgoStr)) {
      retentionEligible++;
      if (isActiveInRange(uid, sevenDaysAgoStr, todayStr)) {
        retentionCount++;
      }
    }
  }

  const windowTooShortForRetention = days < 14;
  const retentionRate = windowTooShortForRetention
    ? null
    : retentionEligible > 0 ? Math.round((retentionCount / retentionEligible) * 100) : 0;

  return {
    window: { days, cutoff: cutoffISO, generatedAt: now.toISOString() },
    metrics: {
      requestCount,
      respondedCount,
      responseRate,
      totalPrayActions,
      density,
      activePrayingUsers7d: activePrayingUsers,
      requestOnly,
      prayOnly,
      both,
      medianTimeToFirstPrayerMinutes: medianTimeToFirstPrayer,
      averageTimeToFirstPrayerMinutes: averageTimeToFirstPrayer,
      retentionRate,
      retentionEligible,
      retentionCount,
      activityByDay: activityByDaySorted,
    },
    groupingAvailable: false,
    windowTooShortForRetention,
  };
}

function isoDay(value) {
  return typeof value === 'string' ? value.slice(0, 10) : '';
}
