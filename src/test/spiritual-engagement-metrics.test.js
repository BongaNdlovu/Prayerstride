import { describe, expect, it } from 'vitest';

function computeMetrics(prayers, prays, days = 30) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 86400000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000).toISOString();
  const eightDaysAgo = new Date(now.getTime() - 8 * 86400000).toISOString();

  const inWindowPrayers = prayers.filter(
    (p) => p.createdAt && p.createdAt >= cutoff,
  );
  const inWindowPrays = prays.filter(
    (p) => p.createdAt && p.createdAt >= cutoff,
  );

  const prayedPrayerIds = new Set(inWindowPrays.map((p) => p.prayerId).filter(Boolean));
  const requestCount = inWindowPrayers.length;
  const respondedCount = inWindowPrayers.filter((p) => prayedPrayerIds.has(p.id)).length;
  const responseRate = requestCount > 0 ? Math.round((respondedCount / requestCount) * 100) : 0;
  const totalPrayActions = inWindowPrays.length;
  const density = requestCount > 0 ? parseFloat((totalPrayActions / requestCount).toFixed(2)) : 0;

  const activePrayingUserIds = new Set();
  for (const p of inWindowPrays) {
    if (p.createdAt >= sevenDaysAgo) activePrayingUserIds.add(p.uid);
  }
  const activePrayingUsers7d = activePrayingUserIds.size;

  const requestAuthorIds = new Set(inWindowPrayers.map((p) => p.authorUid).filter(Boolean));
  const prayUserIds = new Set(inWindowPrays.map((p) => p.uid).filter(Boolean));
  const requestOnly = [...requestAuthorIds].filter((uid) => !prayUserIds.has(uid)).length;
  const prayOnly = [...prayUserIds].filter((uid) => !requestAuthorIds.has(uid)).length;
  const both = [...requestAuthorIds].filter((uid) => prayUserIds.has(uid)).length;

  const prayByPrayer = {};
  for (const p of inWindowPrays) {
    if (!p.prayerId) continue;
    if (!prayByPrayer[p.prayerId] || p.createdAt < prayByPrayer[p.prayerId]) {
      prayByPrayer[p.prayerId] = p.createdAt;
    }
  }
  const timeDeltas = [];
  for (const p of inWindowPrayers) {
    const firstPray = prayByPrayer[p.id];
    if (!firstPray || !p.createdAt) continue;
    const created = new Date(p.createdAt).getTime();
    const first = new Date(firstPray).getTime();
    if (Number.isFinite(created) && Number.isFinite(first) && first >= created) {
      timeDeltas.push((first - created) / 60000);
    }
  }
  let medianTimeToFirstPrayerMinutes = null;
  let averageTimeToFirstPrayerMinutes = null;
  if (timeDeltas.length > 0) {
    const sorted = [...timeDeltas].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    medianTimeToFirstPrayerMinutes = sorted.length % 2 === 0
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : Math.round(sorted[mid]);
    averageTimeToFirstPrayerMinutes = Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length);
  }

  const activityByUser = {};
  for (const p of inWindowPrayers) {
    if (p.authorUid) {
      if (!activityByUser[p.authorUid]) activityByUser[p.authorUid] = { created: new Set(), prayed: new Set() };
      const day = (p.createdAt || '').slice(0, 10);
      if (day) activityByUser[p.authorUid].created.add(day);
    }
  }
  for (const p of inWindowPrays) {
    if (p.uid) {
      if (!activityByUser[p.uid]) activityByUser[p.uid] = { created: new Set(), prayed: new Set() };
      const day = (p.createdAt || '').slice(0, 10);
      if (day) activityByUser[p.uid].prayed.add(day);
    }
  }
  const isActiveInRange = (uid, start, end) => {
    const act = activityByUser[uid];
    if (!act) return false;
    const startDay = start.slice(0, 10);
    const endDay = end.slice(0, 10);
    for (const day of [...act.created, ...act.prayed]) {
      if (day >= startDay && day <= endDay) return true;
    }
    return false;
  };
  let retentionEligible = 0;
  let retentionCount = 0;
  for (const uid of Object.keys(activityByUser)) {
    if (isActiveInRange(uid, fourteenDaysAgo, eightDaysAgo)) {
      retentionEligible++;
      if (isActiveInRange(uid, sevenDaysAgo, now.toISOString())) {
        retentionCount++;
      }
    }
  }
  const windowTooShortForRetention = days < 14;
  const retentionRate = windowTooShortForRetention
    ? null
    : retentionEligible > 0 ? Math.round((retentionCount / retentionEligible) * 100) : 0;

  return {
    requestCount, respondedCount, responseRate, totalPrayActions, density,
    activePrayingUsers7d, requestOnly, prayOnly, both,
    medianTimeToFirstPrayerMinutes, averageTimeToFirstPrayerMinutes,
    retentionRate, retentionEligible, retentionCount, windowTooShortForRetention,
  };
}

describe('spiritual engagement metrics', () => {
  it('100 requests / 80 with prayers = 80% response rate', () => {
    const now = new Date().toISOString();
    const prayers = Array.from({ length: 100 }, (_, i) => ({
      id: `p${i}`,
      authorUid: `user${i}`,
      createdAt: now,
    }));
    const prays = Array.from({ length: 80 }, (_, i) => ({
      id: `pr${i}`,
      prayerId: `p${i}`,
      uid: `other${i}`,
      createdAt: now,
    }));
    const m = computeMetrics(prayers, prays);
    expect(m.requestCount).toBe(100);
    expect(m.responseRate).toBe(80);
    expect(m.respondedCount).toBe(80);
  });

  it('density = total pray actions / request count', () => {
    const now = new Date().toISOString();
    const prayers = Array.from({ length: 10 }, (_, i) => ({
      id: `p${i}`, authorUid: `u${i}`, createdAt: now,
    }));
    const prays = Array.from({ length: 25 }, (_, i) => ({
      id: `pr${i}`, prayerId: `p${i % 10}`, uid: `o${i}`, createdAt: now,
    }));
    const m = computeMetrics(prayers, prays);
    expect(m.totalPrayActions).toBe(25);
    expect(m.density).toBe(2.5);
  });

  it('reciprocity splits request-only, pray-only, and both correctly', () => {
    const now = new Date().toISOString();
    const prayers = [
      { id: 'p1', authorUid: 'uA', createdAt: now },
      { id: 'p2', authorUid: 'uB', createdAt: now },
      { id: 'p3', authorUid: 'uC', createdAt: now },
    ];
    const prays = [
      { id: 'pr1', prayerId: 'p1', uid: 'uB', createdAt: now },
      { id: 'pr2', prayerId: 'p1', uid: 'uD', createdAt: now },
    ];
    const m = computeMetrics(prayers, prays);
    expect(m.requestOnly).toBe(2); // uA and uC created requests but never prayed
    expect(m.prayOnly).toBe(1); // uD prayed but never created
    expect(m.both).toBe(1); // uB did both
  });

  it('time-to-first-prayer ignores invalid timestamps', () => {
    const now = new Date();
    const createdAt = new Date(now.getTime() - 600000).toISOString(); // 10 min ago
    const firstPray = new Date(now.getTime() - 120000).toISOString(); // 2 min ago
    const prayers = [
      { id: 'p1', authorUid: 'u1', createdAt },
      { id: 'p2', authorUid: 'u2', createdAt: null },
      { id: 'p3', authorUid: 'u3', createdAt: 'invalid' },
    ];
    const prays = [
      { id: 'pr1', prayerId: 'p1', uid: 'uX', createdAt: firstPray },
      { id: 'pr2', prayerId: 'p2', uid: 'uY', createdAt: now.toISOString() },
      { id: 'pr3', prayerId: 'p3', uid: 'uZ', createdAt: 'bad-timestamp' },
    ];
    const m = computeMetrics(prayers, prays);
    expect(m.averageTimeToFirstPrayerMinutes).toBe(8); // ~8 min for the one valid delta
    expect(m.medianTimeToFirstPrayerMinutes).toBe(8);
  });

  it('retention uses 8-14 day to last-7-day definition', () => {
    const now = new Date();
    const dayStr = (offset) => new Date(now.getTime() - offset * 86400000).toISOString();
    // User active on day 10 and day 3 -> eligible + retained
    const prayers = [
      { id: 'p1', authorUid: 'uR', createdAt: dayStr(10) },
    ];
    const prays = [
      { id: 'pr1', prayerId: 'p1', uid: 'uR', createdAt: dayStr(3) },
    ];
    const m = computeMetrics(prayers, prays);
    expect(m.retentionEligible).toBe(1);
    expect(m.retentionCount).toBe(1);
    expect(m.retentionRate).toBe(100);
  });

  it('empty datasets produce safe zero/fallback metrics', () => {
    const m = computeMetrics([], []);
    expect(m.requestCount).toBe(0);
    expect(m.responseRate).toBe(0);
    expect(m.density).toBe(0);
    expect(m.activePrayingUsers7d).toBe(0);
    expect(m.requestOnly).toBe(0);
    expect(m.prayOnly).toBe(0);
    expect(m.both).toBe(0);
    expect(m.retentionRate).toBe(0);
    expect(m.averageTimeToFirstPrayerMinutes).toBeNull();
    expect(m.medianTimeToFirstPrayerMinutes).toBeNull();
  });

  it('marks retention unavailable for windows shorter than 14 days', () => {
    const m = computeMetrics([], [], 7);
    expect(m.retentionRate).toBeNull();
    expect(m.windowTooShortForRetention).toBe(true);
  });
});
