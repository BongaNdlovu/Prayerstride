import { useMemo } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
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
    <ScreenScaffold
      pageContent
      refreshControl={<RefreshControl refreshing={loading} onRefresh={retry} />}
    >
      <AppHeader title="Prayer stride" subtitle="Your weekly rhythm at a glance." onBack={onBack} centered showLogo />
      <AsyncState loading={loading} error={error} onRetry={retry}>
        <View style={styles.summaryPanel}>
          <View style={styles.summaryCopy}>
            <Heading level="eyebrow" style={styles.summaryEyebrow}>Weekly stride</Heading>
            <Heading level="stat" style={styles.summaryValue}>{weeklyTotal}</Heading>
            <BodyText variant="small" style={styles.summaryText}>
              {weeklyTotal === 1 ? 'session logged this week' : 'sessions logged this week'}
            </BodyText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRingWrap}>
            <ProgressRing progress={streakProgress} size={92} strokeWidth={7} accent={colors.goldLight}>
              <View style={styles.ringCenter}>
                <Flame size={22} color={colors.goldLight} />
                <Heading level="h4" style={styles.ringValue}>{streak}</Heading>
              </View>
            </ProgressRing>
            <BodyText variant="caption" style={styles.summaryRingLabel}>
              streak
            </BodyText>
          </View>
        </View>

        <GlassCard style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartHeaderCopy}>
              <Heading level="eyebrow">Prayer activity</Heading>
              <Heading level="h4" style={styles.chartTitle}>This week</Heading>
              <BodyText variant="caption" style={styles.chartSubtitle}>Sessions completed each day</BodyText>
            </View>
            <View style={styles.weekTotalPill}>
              <Timer size={13} color={colors.teal} />
              <BodyText variant="caption" style={styles.weekTotal}>{weeklyTotal}</BodyText>
            </View>
          </View>
          <WeeklyBarChart data={weeklyPrayerData} />
        </GlassCard>

        <View style={styles.statsGrid}>
          <StatCard icon={Flame} value={`${myPrayers.length}`} label="prayers shared" accent={colors.gold} />
          <StatCard icon={Heart} value={`${answered.length}`} label="answered" accent={colors.redSoft} />
        </View>
        <View style={styles.statsGrid}>
          <StatCard icon={Timer} value={`${weeklyTotal}`} label="sessions this week" />
          <StatCard icon={Users} value={`${sessions.length}`} label="total sessions" accent={colors.purple} />
        </View>

        <View style={styles.timeCardWrap}>
          <View style={styles.timeCard}>
            <View style={styles.timeRow}>
              <View style={styles.timeInfo}>
                <Heading level="eyebrow" style={styles.timeEyebrow}>Prayer time</Heading>
                <Heading level="stat" style={styles.timeValue}>{formatPrayerTime(totalSeconds)}</Heading>
                <BodyText variant="small" style={styles.timeBody}>Time spent in prayer.</BodyText>
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
                <Heading level="h4">Keep your stride strong</Heading>
                <BodyText variant="small">Return to the feed and pray through the next request.</BodyText>
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
  summaryPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.ink,
    padding: spacing.xl,
  },
  summaryCopy: { flex: 1 },
  summaryEyebrow: { color: colors.goldLight },
  summaryValue: { marginTop: spacing.sm, color: colors.white, fontSize: 38, lineHeight: 43 },
  summaryText: { color: 'rgba(255,255,255,0.76)' },
  summaryDivider: { width: 1, height: 82, backgroundColor: 'rgba(255,255,255,0.12)' },
  summaryRingWrap: { alignItems: 'center', gap: spacing.xs },
  summaryRingLabel: { color: 'rgba(255,255,255,0.72)' },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringValue: { marginTop: 2, fontSize: 18, color: colors.white },
  chartCard: { marginBottom: spacing.md },
  chartHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  chartHeaderCopy: { flex: 1 },
  chartTitle: { marginTop: spacing.xs },
  chartSubtitle: { marginTop: 2, color: colors.ink3 },
  weekTotalPill: {
    minWidth: 56,
    height: 32,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.tealPale,
  },
  weekTotal: { color: colors.teal, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  timeCardWrap: { marginBottom: spacing.md },
  timeCard: {
    backgroundColor: colors.ink,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg },
  timeInfo: { flex: 1 },
  timeEyebrow: { color: colors.goldLight },
  timeValue: { marginTop: spacing.sm, marginBottom: spacing.xs, color: colors.white },
  timeBody: { color: 'rgba(255,255,255,0.72)' },
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
