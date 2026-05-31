import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Award, Star } from 'lucide-react-native';
import { alpha, colors, radii, spacing } from '../theme';
import { usePrayers, useTestimonies } from '../usePrayerData';
import { usePrayerSessions } from '../usePrayerSessions';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import ProgressRing from '../components/ProgressRing';
import EmptyState from '../components/EmptyState';
import AsyncState from '../components/AsyncState';

const ACHIEVEMENT_DEFS = [
  { id: 'first-prayer', name: 'First prayer shared', description: 'Share your first prayer request.', total: 1, metric: 'prayers' },
  { id: 'five-sessions', name: 'Consistent rhythm', description: 'Log five prayer sessions.', total: 5, metric: 'sessions' },
  { id: 'one-hour', name: 'One hour in prayer', description: 'Record 60 minutes of prayer time.', total: 3600, metric: 'seconds', format: 'time' },
  { id: 'testimony', name: 'Tell of goodness', description: 'Share an answered-prayer testimony.', total: 1, metric: 'testimonies' },
];

function formatProgress(item) {
  if (item.format === 'time') {
    return `${Math.floor(item.current / 60)}/${Math.floor(item.total / 60)}m`;
  }
  return `${item.current}/${item.total}`;
}

export default function AchievementsScreen({ user, onBack }) {
  const { prayers, loading: prayersLoading } = usePrayers(Boolean(user?.uid), { userId: user?.uid });
  const { sessions, totalSeconds, loading: sessionsLoading, error: sessionsError } = usePrayerSessions(user?.uid, true);
  const { testimonies, loading: testimoniesLoading } = useTestimonies(Boolean(user?.uid));
  const myPrayers = prayers.filter((item) => item.authorUid === user?.uid);
  const myTestimonies = testimonies.filter((item) => item.authorUid === user?.uid);
  const loading = prayersLoading || sessionsLoading || testimoniesLoading;
  const error = sessionsError;

  const achievements = useMemo(() => ACHIEVEMENT_DEFS.map((item) => {
    const currentByMetric = {
      prayers: myPrayers.length,
      sessions: sessions.length,
      seconds: totalSeconds,
      testimonies: myTestimonies.length,
    };
    const current = currentByMetric[item.metric] || 0;
    return {
      ...item,
      current,
      completed: current >= item.total,
    };
  }), [myPrayers.length, myTestimonies.length, sessions.length, totalSeconds]);

  const completedCount = achievements.filter((item) => item.completed).length;
  const overallProgress = achievements.length ? completedCount / achievements.length : 0;

  return (
    <ScreenScaffold scroll={false} pageContent style={styles.screen}>
      <AppHeader title="Achievements" subtitle="Your growth and consistency tracked." onBack={onBack} centered showLogo />
      <AsyncState loading={loading} error={error} empty={!loading && !error && achievements.length === 0} emptyLabel="No achievements yet.">
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryInfo}>
              <Heading level="eyebrow">Overall Progress</Heading>
              <Heading level="stat" style={styles.summaryPercent}>{Math.round(overallProgress * 100)}%</Heading>
              <BodyText variant="caption">{completedCount} of {achievements.length} completed</BodyText>
            </View>
            <ProgressRing progress={overallProgress} size={72} strokeWidth={6}>
              <Award size={22} color={colors.gold} />
            </ProgressRing>
          </View>
        </GlassCard>
        <FlatList
          data={achievements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState label="No achievements yet." />}
          renderItem={({ item }) => {
            const pct = Math.min(100, (item.current / item.total) * 100);
            return (
              <GlassCard style={[styles.card, item.completed && styles.cardCompleted]}>
                <View style={styles.cardRow}>
                  <View style={[styles.iconWrap, item.completed && styles.iconWrapCompleted]}>
                    {item.completed ? (
                      <Star size={20} color={colors.gold} fill={colors.gold} />
                    ) : (
                      <Award size={20} color={alpha.ivory55} />
                    )}
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.titleRow}>
                      <Heading level="h4" style={styles.cardTitle}>{item.name}</Heading>
                      <BodyText variant="caption" style={styles.progressLabel}>{formatProgress(item)}</BodyText>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${pct}%` }, item.completed && styles.progressFillCompleted]} />
                    </View>
                    <BodyText variant="caption" style={styles.description}>{item.description}</BodyText>
                    {item.completed ? (
                      <View style={styles.laurelRow}>
                        <View style={styles.laurelLine} />
                        <Star size={10} color={colors.gold} fill={colors.gold} />
                        <BodyText variant="caption" style={styles.completedBadge}>Completed</BodyText>
                        <Star size={10} color={colors.gold} fill={colors.gold} />
                        <View style={styles.laurelLine} />
                      </View>
                    ) : null}
                  </View>
                </View>
              </GlassCard>
            );
          }}
        />
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  summaryCard: { marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg },
  summaryInfo: { flex: 1 },
  summaryPercent: { marginTop: spacing.sm, marginBottom: spacing.xs },
  list: { paddingBottom: spacing.tabBar, gap: spacing.md },
  card: { marginBottom: 0 },
  cardCompleted: { borderColor: alpha.gold30, backgroundColor: alpha.gold18 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.ivory12,
  },
  iconWrapCompleted: { backgroundColor: alpha.gold22 },
  cardBody: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  cardTitle: { flex: 1, fontSize: 16 },
  progressLabel: { color: colors.gold },
  progressBar: {
    marginTop: spacing.sm,
    height: 6,
    borderRadius: 3,
    backgroundColor: alpha.ivory12,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },
  progressFillCompleted: { backgroundColor: colors.goldLight },
  description: { marginTop: spacing.xs },
  laurelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  laurelLine: { flex: 1, height: 1, backgroundColor: alpha.gold30 },
  completedBadge: { color: colors.gold, letterSpacing: 1.2, textTransform: 'uppercase', fontSize: 10 },
});
