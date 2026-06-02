import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getDeviceTimeZone,
  getGamificationSummary,
} from './api';
import { subscribeGamificationRefresh } from './gamificationRefresh';

const BACKFILL_KEY = 'gamificationBackfillV2';
const EMPTY_LIST = [];
const SUMMARY_CACHE_TTL_MS = 60000;
const summaryCache = new Map();
const summaryRequests = new Map();

export function gamificationBackfillKey(userId) {
  return `${BACKFILL_KEY}:${userId}`;
}

function cacheKey(userId, timeZone) {
  return `${userId}:${timeZone || 'UTC'}`;
}

async function loadGamificationSummary(userId, timeZone, force = false) {
  const key = cacheKey(userId, timeZone);
  const cached = summaryCache.get(key);
  if (!force && cached && Date.now() - cached.loadedAt < SUMMARY_CACHE_TTL_MS) {
    return cached.summary;
  }
  if (!force && summaryRequests.has(key)) {
    return summaryRequests.get(key);
  }

  const request = getGamificationSummary(timeZone)
    .then((summary) => {
      summaryCache.set(key, { summary, loadedAt: Date.now() });
      return summary;
    })
    .finally(() => {
      summaryRequests.delete(key);
    });
  summaryRequests.set(key, request);
  return request;
}

export function useGamification(userId, enabled = true) {
  const active = Boolean(userId && enabled);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(active);
  const [summaryError, setSummaryError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const requestIdRef = useRef(0);

  const refreshSummary = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    if (!active) {
      setSummary(null);
      setSummaryLoading(false);
      setSummaryError(null);
      return;
    }

    setSummaryLoading(true);
    setSummaryError(null);
    const timeZone = getDeviceTimeZone();

    try {
      const next = await loadGamificationSummary(userId, timeZone, retryVersion > 0);
      if (requestId === requestIdRef.current) setSummary(next);
    } catch (error) {
      if (requestId === requestIdRef.current) setSummaryError(error);
    } finally {
      if (requestId === requestIdRef.current) setSummaryLoading(false);
    }
  }, [active, retryVersion, userId]);

  useEffect(() => {
    refreshSummary();
    return () => {
      requestIdRef.current += 1;
    };
  }, [refreshSummary, retryVersion]);

  useEffect(() => subscribeGamificationRefresh(() => {
    setRetryVersion((version) => version + 1);
  }), []);

  const retry = () => {
    if (userId) summaryCache.delete(cacheKey(userId, getDeviceTimeZone()));
    setRetryVersion((version) => version + 1);
  };

  return {
    summary: summary || {
      streak: 0,
      dailyPrayCount: 0,
      dailyGoalProgress: 0,
      dailyChallengeComplete: false,
      dailyChallengeGoal: 5,
      dailyPrayGoal: 5,
      todayXP: 0,
      totalXP: 0,
      levelInfo: { level: 1, totalXP: 0, xpIntoLevel: 0, xpToNextLevel: 500, progress: 0 },
      journey: { id: 'first-steps', title: 'First Steps', subtitle: 'Beginning your prayer walk' },
      weeklyStats: [],
      activeDayIndexes: [],
      currentDayIndex: new Date().getDay(),
      badges: [],
      prayedTodayIds: [],
      impact: {
        prayerSessions: 0,
        peoplePrayedFor: 0,
        encouragementsSent: 0,
        answeredPrayers: 0,
      },
    },
    loading: summaryLoading,
    error: summaryError,
    retry,
    myPrayers: EMPTY_LIST,
    myTestimonies: EMPTY_LIST,
    sessions: EMPTY_LIST,
    refreshSummary,
  };
}
