import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Award, CheckCircle, Lock, Target } from 'lucide-react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import { useGamification } from '../useGamification';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import ProgressRing from '../components/ProgressRing';
import BadgeTile from '../components/BadgeTile';
import AsyncState from '../components/AsyncState';

function BadgeSection({ title, subtitle, badges, emptyLabel }) {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeader}>
        <View>
          <Heading level="h4" style={styles.sectionTitle}>{title}</Heading>
          <BodyText variant="caption">{subtitle}</BodyText>
        </View>
        <BodyText variant="caption" style={styles.sectionCount}>{badges.length}</BodyText>
      </View>
      {badges.length ? (
        <FlatList
          data={badges}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.badgeGrid}
          renderItem={({ item: badge }) => (
            <View key={badge.id} style={styles.gridItem}>
              <BadgeTile badge={badge} />
            </View>
          )}
        />
      ) : (
        <View style={styles.emptySection}>
          <BodyText variant="small" style={styles.emptyText}>{emptyLabel}</BodyText>
        </View>
      )}
    </View>
  );
}

export default function AchievementsScreen({ user, onBack }) {
  const {
    summary,
    loading,
    error,
    retry,
  } = useGamification(user?.uid, Boolean(user?.uid));

  const badges = useMemo(() => summary.badges || [], [summary.badges]);
  const earnedCount = badges.filter((badge) => badge.state === 'earned').length;
  const earnedBadges = useMemo(() => badges.filter((badge) => badge.state === 'earned'), [badges]);
  const inProgressBadges = useMemo(() => badges.filter((badge) => badge.state === 'in-progress'), [badges]);
  const lockedBadges = useMemo(
    () => badges.filter((badge) => badge.state !== 'earned' && badge.state !== 'in-progress'),
    [badges],
  );
  const overallProgress = badges.length ? earnedCount / badges.length : 0;

  return (
    <ScreenScaffold pageContent style={styles.screen}>
      <AppHeader title="Badges" subtitle="Gentle milestones for consistency and care." onBack={onBack} centered showLogo />
      <AsyncState loading={loading} error={error} onRetry={retry}>
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryInfo}>
              <Heading level="eyebrow">Badge Collection</Heading>
              <Heading level="stat" style={styles.summaryPercent}>{earnedCount}/{badges.length}</Heading>
              <BodyText variant="caption">{Math.round(overallProgress * 100)}% earned</BodyText>
              <View style={styles.summaryTrack}>
                <View style={[styles.summaryFill, { width: `${Math.round(overallProgress * 100)}%` }]} />
              </View>
            </View>
            <ProgressRing progress={overallProgress} size={72} strokeWidth={6} accent={colors.violet}>
              <Award size={22} color={colors.violet} />
            </ProgressRing>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <CheckCircle size={14} color={colors.gold} />
              <BodyText variant="caption" style={styles.statusText}>{earnedBadges.length} earned</BodyText>
            </View>
            <View style={styles.statusPill}>
              <Target size={14} color={colors.violet} />
              <BodyText variant="caption" style={styles.statusText}>{inProgressBadges.length} active</BodyText>
            </View>
            <View style={styles.statusPill}>
              <Lock size={14} color={colors.textMuted} />
              <BodyText variant="caption" style={styles.statusText}>{lockedBadges.length} locked</BodyText>
            </View>
          </View>
        </GlassCard>
        <BadgeSection
          title="Earned"
          subtitle="Milestones already added to your walk."
          badges={earnedBadges}
          emptyLabel="No earned badges yet."
        />
        <BadgeSection
          title="In Progress"
          subtitle="Badges currently moving forward."
          badges={inProgressBadges}
          emptyLabel="Start a prayer session to begin making progress."
        />
        <BadgeSection
          title="Locked"
          subtitle="Future milestones to grow toward."
          badges={lockedBadges}
          emptyLabel="No locked badges."
        />
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  summaryCard: { marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  summaryInfo: { flex: 1 },
  summaryPercent: { marginTop: spacing.sm, marginBottom: spacing.xs },
  summaryTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: alpha.navy10,
    marginTop: spacing.md,
  },
  summaryFill: { height: 7, borderRadius: 4, backgroundColor: colors.violet },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  statusPill: {
    minHeight: 32,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: alpha.navy06,
  },
  statusText: { color: colors.navy, fontFamily: fonts.sansSemiBold },
  sectionBlock: { marginBottom: spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 19, lineHeight: 24 },
  sectionCount: {
    minWidth: 28,
    minHeight: 28,
    borderRadius: 14,
    overflow: 'hidden',
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.navy,
    fontFamily: fonts.sansExtraBold,
    backgroundColor: alpha.gold18,
  },
  badgeGrid: { gap: spacing.md },
  gridRow: { gap: spacing.md },
  gridItem: { flex: 1 },
  emptySection: {
    minHeight: 72,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyText: { textAlign: 'center' },
});
