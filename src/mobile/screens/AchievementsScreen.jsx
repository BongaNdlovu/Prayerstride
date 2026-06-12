import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Award, CheckCircle, Lock, Star, Target, X } from 'lucide-react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import { useGamification } from '../useGamification';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import BadgeTile from '../components/BadgeTile';
import AsyncState from '../components/AsyncState';

function BadgeSection({ title, subtitle, badges, emptyLabel, onSelectBadge }) {
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
              <BadgeTile badge={badge} onPress={() => onSelectBadge(badge)} />
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
  const [selectedBadge, setSelectedBadge] = useState(null);
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
      <AppHeader title="Encouragements" subtitle="Gentle milestones for consistency and care." onBack={onBack} centered showLogo />
      <AsyncState loading={loading} error={error} onRetry={retry}>
        <View style={styles.achBanner}>
          <BodyText variant="caption" style={styles.achBannerLabel}>Your Progress</BodyText>
          <Heading level="stat" style={styles.achBannerCount}>{earnedCount}<BodyText variant="caption" style={styles.achBannerTotal}> / {badges.length} Encouragements</BodyText></Heading>
          <View style={styles.achBannerTrack}>
            <View style={[styles.achBannerFill, { width: `${Math.round(overallProgress * 100)}%` }]} />
          </View>
        </View>
        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <CheckCircle size={14} color={colors.gold} />
            <BodyText variant="caption" style={styles.statusText}>{earnedBadges.length} earned</BodyText>
          </View>
          <View style={styles.statusPill}>
            <Target size={14} color={colors.teal} />
            <BodyText variant="caption" style={styles.statusText}>{inProgressBadges.length} active</BodyText>
          </View>
          <View style={styles.statusPill}>
            <Lock size={14} color={colors.ink3} />
            <BodyText variant="caption" style={styles.statusText}>{lockedBadges.length} locked</BodyText>
          </View>
        </View>
        <BadgeSection
          title="Earned"
          subtitle="Milestones already added to your walk."
          badges={earnedBadges}
          emptyLabel="No encouragements earned yet."
          onSelectBadge={setSelectedBadge}
        />
        <BadgeSection
          title="In Progress"
          subtitle="Encouragements currently moving forward."
          badges={inProgressBadges}
          emptyLabel="Start a prayer session to begin making progress."
          onSelectBadge={setSelectedBadge}
        />
        <BadgeSection
          title="Locked"
          subtitle="Future milestones to grow toward."
          badges={lockedBadges}
          emptyLabel="No locked encouragements."
          onSelectBadge={setSelectedBadge}
        />
      </AsyncState>

      {selectedBadge ? (
        <View style={styles.detailOverlay}>
          <Pressable style={styles.detailBackdrop} onPress={() => setSelectedBadge(null)} accessibilityLabel="Close encouragement details" />
          <View style={styles.detailSheet}>
            <View style={styles.detailHandle} />
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Encouragement</Text>
              <Pressable onPress={() => setSelectedBadge(null)} style={styles.detailClose} accessibilityLabel="Close encouragement details">
                <X size={18} color={colors.ink} />
              </Pressable>
            </View>
            <View style={styles.detailIconWrap}>
              {selectedBadge.state === 'earned' ? (
                <Star size={28} color={colors.gold} fill={colors.gold} />
              ) : selectedBadge.state === 'locked' ? (
                <Lock size={26} color={colors.ink3} />
              ) : (
                <Award size={28} color={colors.teal} />
              )}
            </View>
            <Heading level="h3" style={styles.detailName}>{selectedBadge.name}</Heading>
            <BodyText variant="body" style={styles.detailDescription}>{selectedBadge.description}</BodyText>
            <View style={styles.detailStatusPill}>
              {selectedBadge.state === 'earned' ? <CheckCircle size={14} color={colors.gold} /> : null}
              {selectedBadge.state === 'locked' ? <Lock size={14} color={colors.ink3} /> : null}
              {selectedBadge.state === 'in-progress' ? <Target size={14} color={colors.teal} /> : null}
              <BodyText variant="caption" style={styles.detailStatusText}>
                {selectedBadge.state === 'earned' ? 'Earned' : selectedBadge.state === 'locked' ? 'Locked' : 'In progress'}
              </BodyText>
            </View>
            {selectedBadge.state === 'in-progress' ? (
              <View style={styles.detailProgressWrap}>
                <View style={styles.detailProgressTrack}>
                  <View style={[styles.detailProgressFill, { width: `${Math.round(selectedBadge.progress * 100)}%` }]} />
                </View>
                <BodyText variant="caption" style={styles.detailProgressText}>{Math.round(selectedBadge.progress * 100)}% complete</BodyText>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  achBanner: {
    marginBottom: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.night,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  achBannerLabel: {
    fontFamily: fonts.sansExtraBold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.50)',
    marginBottom: spacing.xs,
  },
  achBannerCount: { color: colors.white, marginBottom: spacing.sm },
  achBannerTotal: { color: 'rgba(255,255,255,0.40)', fontSize: 16 },
  achBannerTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  achBannerFill: { height: 6, borderRadius: 3, backgroundColor: colors.goldLight },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  statusPill: {
    minHeight: 32,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: alpha.ink06,
  },
  statusText: { color: colors.ink, fontFamily: fonts.sansSemiBold },
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
    color: colors.ink,
    fontFamily: fonts.sansExtraBold,
    backgroundColor: alpha.gold18,
  },
  badgeGrid: { gap: spacing.md },
  gridRow: { gap: spacing.md },
  gridItem: { flex: 1 },
  emptySection: {
    minHeight: 72,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyText: { textAlign: 'center' },
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 70,
    justifyContent: 'flex-end',
  },
  detailBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  detailSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.tabBar,
  },
  detailHandle: {
    width: 36,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.surface3,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  detailTitle: { fontFamily: fonts.displaySemi, fontSize: 18, color: colors.ink },
  detailClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.ink08,
  },
  detailIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
    marginBottom: spacing.md,
  },
  detailName: { marginBottom: spacing.sm },
  detailDescription: { color: colors.ink2 },
  detailStatusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 32,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: alpha.ink06,
    marginTop: spacing.lg,
  },
  detailStatusText: { color: colors.ink, fontFamily: fonts.sansSemiBold },
  detailProgressWrap: { marginTop: spacing.lg, gap: spacing.sm },
  detailProgressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: alpha.ink10,
  },
  detailProgressFill: { height: 6, borderRadius: 3, backgroundColor: colors.teal },
  detailProgressText: { color: colors.ink3 },
});
