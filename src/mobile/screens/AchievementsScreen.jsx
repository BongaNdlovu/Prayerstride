import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Award } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { useGamification } from '../useGamification';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import ProgressRing from '../components/ProgressRing';
import BadgeTile from '../components/BadgeTile';
import AsyncState from '../components/AsyncState';

export default function AchievementsScreen({ user, onBack }) {
  const {
    summary,
    loading,
    error,
    retry,
  } = useGamification(user?.uid, Boolean(user?.uid));

  const badges = useMemo(() => summary.badges || [], [summary.badges]);
  const earnedCount = badges.filter((badge) => badge.state === 'earned').length;
  const overallProgress = badges.length ? earnedCount / badges.length : 0;

  return (
    <ScreenScaffold scroll={false} pageContent style={styles.screen}>
      <AppHeader title="Badges" subtitle="Gentle milestones for consistency and care." onBack={onBack} centered showLogo />
      <AsyncState loading={loading} error={error} onRetry={retry}>
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryInfo}>
              <Heading level="eyebrow">Badge Collection</Heading>
              <Heading level="stat" style={styles.summaryPercent}>{earnedCount}/{badges.length}</Heading>
              <BodyText variant="caption">{Math.round(overallProgress * 100)}% earned</BodyText>
            </View>
            <ProgressRing progress={overallProgress} size={72} strokeWidth={6} accent={colors.violet}>
              <Award size={22} color={colors.violet} />
            </ProgressRing>
          </View>
        </GlassCard>
        <FlatList
          data={badges}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <BadgeTile badge={item} />
            </View>
          )}
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
  list: { paddingBottom: spacing.tabBar, gap: spacing.md },
  gridRow: { gap: spacing.md },
  gridItem: { flex: 1 },
});
