import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Clock, Flame, Footprints, Heart, Timer, Users } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme';
import { usePrayers } from '../usePrayerData';
import { usePrayerSessions } from '../usePrayerSessions';
import {
  buildWeeklyStats,
  calculateStreak,
  formatPrayerTime,
} from '../sessionStats';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import StatCard from '../components/StatCard';
import ProgressRing from '../components/ProgressRing';
import WeeklyBarChart from '../components/WeeklyBarChart';
import SectionDivider from '../components/SectionDivider';
import AsyncState from '../components/AsyncState';

const WEEKLY_STREAK_GOAL = 7;

export default function MyStatsScreen({ user, onBack, go }) {
  const { prayers, loading: prayersLoading, error: prayersError, retry: retryPrayers } = usePrayers(true, { userId: user?.uid });
  const { sessions, totalSeconds, loading: sessionsLoading, error: sessionsError, retry: retrySessions } = usePrayerSessions(user?.uid, true);
  const loading = prayersLoading || sessionsLoading;
  const error = prayersError || sessionsError;
  const retry = () => {
    retryPrayers();
    retrySessions();
  };
  const myPrayers = prayers.filter((p) => p.authorUid === user?.uid);
  const answered = myPrayers.filter((p) => p.status === 'answered');
  const weeklyPrayerData = useMemo(() => buildWeeklyStats(sessions), [sessions]);
  const streak = useMemo(() => calculateStreak(sessions), [sessions]);
  const weeklyTotal = weeklyPrayerData.reduce((sum, item) => sum + item.prayers, 0);
  const streakProgress = Math.min(streak / WEEKLY_STREAK_GOAL, 1);

  return (
    <ScreenScaffold pageContent>
      <AppHeader title="Your prayer walk" subtitle="Consistency, care, and people carried in prayer." onBack={onBack} centered showLogo />
      <AsyncState loading={loading} error={error} onRetry={retry}>
      <GlassCard style={styles.streakCard}>
        <View style={styles.streakRow}>
          <View style={styles.streakInfo}>
            <Heading level="eyebrow">Prayer Streak</Heading>
            <Heading level="h3" style={styles.streakTitle}>
              {streak} {streak === 1 ? 'day' : 'days'}
            </Heading>
            <BodyText variant="small">Walking with God, one day at a time.</BodyText>
          </View>
          <ProgressRing progress={streakProgress} size={96} strokeWidth={7} accent={colors.redSoft}>
            <View style={styles.ringCenter}>
              <Flame size={22} color={colors.redSoft} />
              <Heading level="h4" style={styles.ringValue}>{streak}</Heading>
            </View>
          </ProgressRing>
        </View>
      </GlassCard>

      <GlassCard style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Heading level="eyebrow">Prayer Activity</Heading>
            <Heading level="h4" style={styles.chartTitle}>This week</Heading>
          </View>
          <BodyText variant="caption" style={styles.weekTotal}>{weeklyTotal} sessions</BodyText>
        </View>
        <WeeklyBarChart data={weeklyPrayerData} />
      </GlassCard>

      <View style={styles.statsGrid}>
        <StatCard icon={Flame} value={`${myPrayers.length}`} label="prayers shared" />
        <StatCard icon={Heart} value={`${answered.length}`} label="answered" />
      </View>
      <View style={styles.statsGrid}>
        <StatCard icon={Timer} value={`${weeklyTotal}`} label="sessions this week" />
        <StatCard icon={Users} value={`${sessions.length}`} label="prayer sessions" />
      </View>

      <View style={styles.timeCardWrap}>
        <View style={styles.timeCard}>
          <View style={styles.timeRow}>
            <View style={styles.timeInfo}>
              <Heading level="eyebrow">Prayer Time</Heading>
              <Heading level="stat" style={styles.timeValue}>{formatPrayerTime(totalSeconds)}</Heading>
              <BodyText variant="small">Time spent in prayer.</BodyText>
            </View>
            <View style={styles.timeIcon}>
              <Clock size={24} color={colors.white} />
            </View>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() => go?.('home')}
        style={({ pressed }) => [styles.strideLink, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        <GlassCard style={styles.strideCard}>
          <View style={styles.strideRow}>
            <View style={styles.strideIcon}>
              <Footprints size={20} color={colors.white} />
            </View>
            <View style={styles.strideText}>
              <Heading level="h4">Keep your stride strong.</Heading>
              <BodyText variant="small">Every minute with God moves you forward.</BodyText>
            </View>
          </View>
        </GlassCard>
      </Pressable>

      <SectionDivider style={styles.footerDivider} />
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  streakCard: { marginBottom: spacing.md },
  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg },
  streakInfo: { flex: 1 },
  streakTitle: { marginTop: spacing.sm, marginBottom: spacing.xs },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringValue: { marginTop: 2, fontSize: 18 },
  chartCard: { marginBottom: spacing.md },
  chartHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  chartTitle: { marginTop: spacing.xs },
  weekTotal: { color: colors.ink, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  timeCardWrap: { marginBottom: spacing.md },
  timeCard: {
    backgroundColor: colors.ink,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg },
  timeInfo: { flex: 1 },
  timeValue: { marginTop: spacing.sm, marginBottom: spacing.xs, color: colors.white },
  timeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  strideLink: { marginBottom: spacing.md },
  strideCard: { marginBottom: 0 },
  strideRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  strideIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
  strideText: { flex: 1 },
  pressed: { opacity: 0.92 },
  footerDivider: { marginTop: spacing.sm },
});
