import { useMemo } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { CheckCircle, Flame, Heart, Sparkles, Target, Users } from 'lucide-react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import { usePrayers } from '../usePrayerData';
import { useGamification } from '../useGamification';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import AsyncState from '../components/AsyncState';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import StatCard from '../components/StatCard';

const MONTHLY_PEOPLE_GOAL = 50;

function communityTotals(prayers) {
  const list = Array.isArray(prayers) ? prayers : [];
  return {
    active: list.filter((prayer) => prayer.status !== 'answered').length,
    answered: list.filter((prayer) => prayer.status === 'answered').length,
    urgent: list.filter((prayer) => prayer.urgent === true).length,
    prayerLogs: list.reduce((sum, prayer) => sum + Math.max(0, Number(prayer.prayedCount || 0)), 0),
  };
}

function formatPrayerCount(value) {
  return Math.max(0, Number(value) || 0).toLocaleString();
}

function SharedPrayerItem({ prayer, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wallItem, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open prayer: ${prayer.category || prayer.title || 'Prayer request'}`}
    >
      <View style={styles.wallIcon}>
        <Heart size={15} color={colors.teal} />
      </View>
      <View style={styles.wallCopy}>
        <Heading level="h4" numberOfLines={1} style={styles.wallTitle}>
          {prayer.category || prayer.title || 'Prayer request'}
        </Heading>
        <BodyText variant="small" numberOfLines={2}>
          {prayer.body || prayer.text || 'Someone in the community asked for prayer.'}
        </BodyText>
      </View>
    </Pressable>
  );
}

export default function CommunityScreen({ user, onBack, go }) {
  const { prayers, loading: prayersLoading, error: prayersError, retry: retryPrayers } = usePrayers(true);
  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
    retry: retrySummary,
  } = useGamification(user?.uid, Boolean(user?.uid));

  const totals = useMemo(() => communityTotals(prayers), [prayers]);
  const wallPrayers = useMemo(
    () => (Array.isArray(prayers) ? prayers.filter((prayer) => prayer.status !== 'answered').slice(0, 4) : []),
    [prayers],
  );
  const peoplePrayedFor = Math.max(Number(summary.impact?.peoplePrayedFor || 0), totals.prayerLogs, totals.active);
  const goalProgress = Math.min(peoplePrayedFor / MONTHLY_PEOPLE_GOAL, 1);
  const activeDaysThisWeek = Array.isArray(summary.activeDayIndexes) ? summary.activeDayIndexes.length : 0;

  const retry = () => {
    retryPrayers();
    retrySummary();
  };

  const refreshing = prayersLoading || summaryLoading;

  return (
    <ScreenScaffold
      pageContent
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={retry} />}
    >
      <AppHeader title="Prayer Chain" subtitle="Shared prayer without comparison." onBack={onBack} centered showLogo />
      <AsyncState loading={prayersLoading || summaryLoading} error={prayersError || summaryError} onRetry={retry}>
        <View style={styles.flameCard}>
          <View style={styles.flameIcon}>
            <Flame size={26} color={colors.goldLight} />
          </View>
          <Heading level="h3" style={styles.flameTitle}>Together, {formatPrayerCount(totals.prayerLogs || totals.active)} prayers were carried this week.</Heading>
          <BodyText variant="small" style={styles.flameCopy}>
            No names, no comparison, just a quiet picture of a church family showing up in prayer.
          </BodyText>
        </View>

        <GlassCard style={styles.rhythmCard}>
          <View style={styles.rhythmRow}>
            <View style={styles.rhythmIcon}>
              <Sparkles size={20} color={colors.teal} />
            </View>
            <View style={styles.rhythmCopy}>
              <Heading level="eyebrow">Your prayer rhythm this week</Heading>
              <Heading level="h4" style={styles.rhythmTitle}>
                You showed up in prayer {activeDaysThisWeek} {activeDaysThisWeek === 1 ? 'day' : 'days'} this week.
              </Heading>
              <BodyText variant="small">Keep walking with God at a faithful pace.</BodyText>
            </View>
          </View>
        </GlassCard>

        <GlassCard style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View style={styles.goalIcon}>
              <Target size={20} color={colors.gold} />
            </View>
            <View style={styles.goalCopy}>
              <Heading level="h4">Cooperative Goal</Heading>
              <BodyText variant="small">Your church family is praying for {MONTHLY_PEOPLE_GOAL} people this month.</BodyText>
            </View>
          </View>
          <View style={styles.goalTrack}>
            <View style={[styles.goalFill, { width: `${Math.round(goalProgress * 100)}%` }]} />
          </View>
          <BodyText variant="caption" style={styles.goalCaption}>
            {formatPrayerCount(peoplePrayedFor)} people carried in prayer so far.
          </BodyText>
        </GlassCard>

        <View style={styles.statsGrid}>
          <StatCard icon={Users} value={formatPrayerCount(totals.active)} label="Open Requests" accent={colors.community} style={styles.statCard} />
          <StatCard icon={CheckCircle} value={formatPrayerCount(totals.answered)} label="Answered Prayers" accent={colors.teal} style={styles.statCard} />
          <StatCard icon={Flame} value={String(summary.streak)} label="Private Streak" sublabel="Only you see this" accent={colors.redSoft} style={styles.statCard} />
          <StatCard icon={Heart} value={formatPrayerCount(totals.urgent)} label="Needs Care" accent={colors.violet} style={styles.statCard} />
        </View>

        <Heading level="h4" style={styles.sectionTitle}>Shared Prayer Wall</Heading>
        <GlassCard style={styles.wallCard}>
          {wallPrayers.length ? (
            wallPrayers.map((prayer, index) => (
              <SharedPrayerItem
                key={prayer.id || `${prayer.category}-${index}`}
                prayer={prayer}
                onPress={() => go?.('detail', { prayer })}
              />
            ))
          ) : (
            <View style={styles.emptyWall}>
              <BodyText variant="small" style={styles.emptyWallText}>No shared requests are open right now.</BodyText>
            </View>
          )}
        </GlassCard>
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  flameCard: {
    marginBottom: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.night,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  flameIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginBottom: spacing.md,
  },
  flameTitle: { color: colors.white, fontSize: 23, lineHeight: 30 },
  flameCopy: { marginTop: spacing.sm, color: 'rgba(255,255,255,0.74)' },
  rhythmCard: { marginBottom: spacing.md },
  rhythmRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rhythmIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealPale,
  },
  rhythmCopy: { flex: 1 },
  rhythmTitle: { marginTop: spacing.xs, marginBottom: 2, fontSize: 18, lineHeight: 24 },
  goalCard: { marginBottom: spacing.lg },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
  },
  goalCopy: { flex: 1 },
  goalTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: alpha.ink10,
    overflow: 'hidden',
  },
  goalFill: { height: 7, borderRadius: 4, backgroundColor: colors.teal },
  goalCaption: { marginTop: spacing.sm, color: colors.ink3, fontFamily: fonts.sansSemiBold },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { minWidth: '46%' },
  sectionTitle: { marginBottom: spacing.sm },
  wallCard: { paddingVertical: spacing.xs, marginBottom: spacing.tabBar },
  wallItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  wallIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealPale,
    marginTop: 2,
  },
  wallCopy: { flex: 1 },
  wallTitle: { fontSize: 17, lineHeight: 22, marginBottom: 2 },
  emptyWall: { minHeight: 72, alignItems: 'center', justifyContent: 'center' },
  emptyWallText: { textAlign: 'center' },
  pressed: { opacity: 0.9 },
});
