import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  backfillGamification,
  getDeviceTimeZone,
  getGamificationSummary,
  updateGamificationTimeZone,
} from './api';
import { subscribeGamificationRefresh } from './gamificationRefresh';
import { usePrayers, useTestimonies } from './usePrayerData';
import { usePrayerSessions } from './usePrayerSessions';

const BACKFILL_KEY = 'gamificationBackfillV2';

export function useGamification(userId, enabled = true) {
  const active = Boolean(userId && enabled);
  const { prayers, loading: prayersLoading, error: prayersError, retry: retryPrayers } = usePrayers(active, { userId });
  const { sessions, loading: sessionsLoading, error: sessionsError, retry: retrySessions } = usePrayerSessions(userId, active);
  const { testimonies, loading: testimoniesLoading, error: testimoniesError, retry: retryTestimonies } = useTestimonies(active);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(active);
  const [summaryError, setSummaryError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);

  const refreshSummary = useCallback(async () => {
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
      await updateGamificationTimeZone(timeZone).catch(() => {});
      const backfillDone = await AsyncStorage.getItem(BACKFILL_KEY);
      if (!backfillDone) {
        await backfillGamification(timeZone).catch(() => {});
        await AsyncStorage.setItem(BACKFILL_KEY, '1');
      }
      const next = await getGamificationSummary(timeZone);
      setSummary(next);
    } catch (error) {
      setSummaryError(error);
    } finally {
      setSummaryLoading(false);
    }
  }, [active]);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary, retryVersion]);

  useEffect(() => subscribeGamificationRefresh(() => {
    setRetryVersion((version) => version + 1);
  }), []);

  const myPrayers = useMemo(
    () => (active ? prayers.filter((prayer) => prayer.authorUid === userId) : []),
    [active, prayers, userId],
  );
  const myTestimonies = useMemo(
    () => (active ? testimonies.filter((item) => item.authorUid === userId) : []),
    [active, testimonies, userId],
  );

  const loading = prayersLoading || sessionsLoading || testimoniesLoading || summaryLoading;
  const error = prayersError || sessionsError || testimoniesError || summaryError;
  const retry = () => {
    retryPrayers();
    retrySessions();
    retryTestimonies();
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
        prayerSessions: sessions.length,
        peoplePrayedFor: 0,
        encouragementsSent: 0,
        answeredPrayers: myPrayers.filter((prayer) => prayer.status === 'answered').length,
      },
    },
    loading,
    error,
    retry,
    myPrayers,
    myTestimonies,
    sessions,
    refreshSummary,
  };
}
