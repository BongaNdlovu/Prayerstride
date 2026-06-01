import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  Award,
  Bell,
  ChevronRight,
  Flame,
  Heart,
  Map,
  Sparkles,
  Target,
  Timer,
  Zap,
} from 'lucide-react-native';
import { alpha, colors, fonts, spacing } from '../theme';
import { DAILY_PRAY_GOAL, XP_AWARDS } from '../gamification';
import { auth } from '../firebase';
import { usePrayers } from '../usePrayerData';
import { useGamification } from '../useGamification';
import ScreenScaffold from '../components/ScreenScaffold';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import GlassCard from '../components/GlassCard';
import PrayerCard from '../components/PrayerCard';
import PrimaryButton from '../components/PrimaryButton';
import AsyncState from '../components/AsyncState';
import ProgressRing from '../components/ProgressRing';
import StreakCalendar from '../components/StreakCalendar';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function PrayerSessionButton({ onPress }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.025, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [scale]);

  return (
    <Animated.View style={[styles.sessionPulse, animatedStyle]}>
      <PrimaryButton label="Have a Prayer Session" icon={Timer} onPress={onPress} />
    </Animated.View>
  );
}

export default function HomeScreen({ onOpenPrayer, go }) {
  const uid = auth.currentUser?.uid;
  const { prayers, loading: prayersLoading, error: prayersError, retry: retryPrayers } = usePrayers(true);
  const {
    summary: gamified,
    loading: statsLoading,
    error: statsError,
    retry: retryStats,
  } = useGamification(uid, Boolean(uid));

  const featured = prayers[0];
  const recentPrayers = prayers.slice(0, 3);
  const listLoading = prayersLoading || statsLoading;
  const listError = prayersError || statsError;
  const retry = () => {
    retryPrayers();
    retryStats();
  };

  const earnedBadges = useMemo(
    () => gamified.badges.filter((badge) => badge.state === 'earned').length,
    [gamified.badges],
  );

  return (
    <ScreenScaffold pageContent>
      <View style={styles.topBar}>
        <View>
          <BodyText variant="caption" style={styles.greeting}>{greeting()}</BodyText>
          <Heading level="h2" style={styles.headline}>Who can you carry in prayer today?</Heading>
        </View>
        <Pressable onPress={() => go('notifications')} style={styles.bellBtn}>
          <Bell size={20} color={colors.navy} />
        </Pressable>
      </View>

      <AsyncState loading={listLoading} error={listError} onRetry={retry}>
        <GlassCard style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <View style={styles.streakCopy}>
              <Heading level="eyebrow">Current Streak</Heading>
              <View style={styles.streakValueRow}>
                <Flame size={22} color={colors.coral} />
                <Heading level="stat" style={styles.streakValue}>{gamified.streak}</Heading>
                <BodyText variant="label">days</BodyText>
              </View>
            </View>
            <ProgressRing progress={gamified.dailyGoalProgress} size={88} strokeWidth={7} accent={colors.gold}>
              <View style={styles.ringCenter}>
                <Target size={18} color={colors.gold} />
                <Heading level="h4" style={styles.ringValue}>
                  {gamified.dailyPrayCount}/{DAILY_PRAY_GOAL}
                </Heading>
              </View>
            </ProgressRing>
          </View>
          <BodyText variant="caption" style={styles.goalCaption}>Today&apos;s prayer goal</BodyText>
          <StreakCalendar
            streak={gamified.streak}
            currentDayIndex={gamified.currentDayIndex}
            activeDayIndexes={gamified.activeDayIndexes}
          />
        </GlassCard>

        <View style={styles.inlineStats}>
          <GlassCard style={styles.inlineStatCard}>
            <Zap size={18} color={colors.gold} />
            <Heading level="h4" style={styles.inlineStatValue}>+{gamified.todayXP} XP</Heading>
            <BodyText variant="caption">Today</BodyText>
          </GlassCard>
          <GlassCard style={styles.inlineStatCard}>
            <Award size={18} color={colors.violet} />
            <Heading level="h4" style={styles.inlineStatValue}>Level {gamified.levelInfo.level}</Heading>
            <BodyText variant="caption">{earnedBadges} badges earned</BodyText>
          </GlassCard>
        </View>

        <Pressable onPress={() => go('achievements')}>
          <GlassCard style={styles.journeyCard}>
            <View style={styles.journeyRow}>
              <View style={styles.journeyIcon}>
                <Map size={22} color={colors.community} />
              </View>
              <View style={styles.journeyCopy}>
                <Heading level="eyebrow">Prayer Journey</Heading>
                <Heading level="h4">{gamified.journey.title}</Heading>
                <BodyText variant="small">{gamified.journey.subtitle}</BodyText>
                <View style={styles.levelBar}>
                  <View style={[styles.levelFill, { width: `${Math.round(gamified.levelInfo.progress * 100)}%` }]} />
                </View>
                <BodyText variant="caption">
                  {gamified.levelInfo.xpIntoLevel}/500 XP to next level
                </BodyText>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </View>
          </GlassCard>
        </Pressable>

        <Pressable onPress={() => go('dailyChallenge')}>
          <GlassCard style={styles.challengeCard}>
            <View style={styles.challengeRow}>
              <View style={styles.challengeIcon}>
                <Sparkles size={20} color={colors.gold} />
              </View>
              <View style={styles.challengeCopy}>
                <Heading level="eyebrow">Daily Challenge</Heading>
                <Heading level="h4">Pray for 5 People</Heading>
                <BodyText variant="small">
                  {gamified.dailyChallengeComplete
                    ? 'Completed today'
                    : `${gamified.dailyPrayCount}/${gamified.dailyChallengeGoal} carried so far`}
                </BodyText>
              </View>
              <BodyText variant="caption" style={styles.challengeXp}>+{XP_AWARDS.dailyChallenge} XP</BodyText>
            </View>
          </GlassCard>
        </Pressable>

        <Pressable onPress={() => go('weeklyEncouragers')}>
          <GlassCard style={styles.challengeCard}>
            <View style={styles.challengeRow}>
              <View style={styles.challengeIcon}>
                <Heart size={20} color={colors.coral} />
              </View>
              <View style={styles.challengeCopy}>
                <Heading level="eyebrow">Weekly Encouragers</Heading>
                <Heading level="h4">Lift others with kind words</Heading>
                <BodyText variant="small">
                  See who shared the most encouragement this week
                </BodyText>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </View>
          </GlassCard>
        </Pressable>

        {featured ? (
          <GlassCard style={styles.missionCard}>
            <BodyText variant="caption" style={styles.missionEyebrow}>TODAY&apos;S PRAYER MISSION</BodyText>
            <Heading level="h4">{featured.title}</Heading>
            <BodyText variant="body" style={styles.missionBody}>{featured.body}</BodyText>
            <PrimaryButton label="Pray Now" onPress={() => onOpenPrayer(featured)} icon={ChevronRight} style={styles.missionCta} />
          </GlassCard>
        ) : null}

        <PrayerSessionButton onPress={() => go('prayerStopwatch')} />

        <View style={styles.sectionRow}>
          <Heading level="h4">Prayer Requests</Heading>
          <Pressable onPress={() => go('discover')}>
            <BodyText variant="small" style={styles.viewAll}>View All</BodyText>
          </Pressable>
        </View>

        <View style={styles.list}>
          {recentPrayers.map((prayer) => (
            <PrayerCard key={prayer.id} prayer={prayer} onPress={() => onOpenPrayer(prayer)} variant="list" />
          ))}
        </View>
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.lg, paddingTop: spacing.sm },
  greeting: { color: colors.gold, marginBottom: spacing.xs, fontFamily: fonts.sansSemiBold, letterSpacing: 1 },
  headline: { fontSize: 26, lineHeight: 32, maxWidth: 280 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha.navy08 },
  streakCard: { marginBottom: spacing.lg },
  streakHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg, marginBottom: spacing.sm },
  streakCopy: { flex: 1 },
  streakValueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  streakValue: { fontSize: 34, lineHeight: 38 },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringValue: { marginTop: 2, fontSize: 15 },
  goalCaption: { marginBottom: spacing.md, color: colors.textMuted },
  inlineStats: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  inlineStatCard: { flex: 1, alignItems: 'flex-start', gap: spacing.xs },
  inlineStatValue: { fontSize: 22, lineHeight: 28 },
  journeyCard: { marginBottom: spacing.lg },
  journeyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  journeyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.navy08,
  },
  journeyCopy: { flex: 1 },
  levelBar: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    height: 6,
    borderRadius: 3,
    backgroundColor: alpha.navy10,
    overflow: 'hidden',
  },
  levelFill: { height: 6, borderRadius: 3, backgroundColor: colors.community },
  challengeCard: { marginBottom: spacing.lg },
  challengeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  challengeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
  },
  challengeCopy: { flex: 1 },
  challengeXp: { color: colors.gold, fontFamily: fonts.sansSemiBold },
  missionCard: { marginBottom: spacing.lg },
  missionEyebrow: { letterSpacing: 2, color: colors.gold, marginBottom: spacing.md, fontFamily: fonts.sansSemiBold },
  missionBody: { marginTop: spacing.sm, marginBottom: spacing.md },
  missionCta: { marginTop: spacing.sm },
  sessionPulse: { marginBottom: spacing.lg },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  viewAll: { color: colors.navy, fontFamily: fonts.sansSemiBold },
  list: { marginTop: spacing.xs, gap: spacing.xs },
});
