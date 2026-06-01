import { FlatList, StyleSheet, View } from 'react-native';
import { Heart, Trophy } from 'lucide-react-native';
import { alpha, colors, spacing } from '../theme';
import { useWeeklyEncouragers } from '../useWeeklyEncouragers';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import AsyncState from '../components/AsyncState';
import EmptyState from '../components/EmptyState';

export default function WeeklyEncouragersScreen({ user, onBack }) {
  const { data, loading, error, retry } = useWeeklyEncouragers(user?.uid, Boolean(user?.uid));

  return (
    <ScreenScaffold scroll={false} pageContent style={styles.screen}>
      <AppHeader
        title="Weekly Encouragers"
        subtitle="Gentle recognition for supportive words this week."
        onBack={onBack}
        centered
        showLogo
      />
      <AsyncState loading={loading} error={error} onRetry={retry}>
        <GlassCard style={styles.viewerCard}>
          <View style={styles.viewerRow}>
            <Heart size={20} color={colors.gold} />
            <View style={styles.viewerCopy}>
              <Heading level="eyebrow">Your Week</Heading>
              <Heading level="h4">
                {data?.viewer?.count || 0} encouragement{(data?.viewer?.count || 0) === 1 ? '' : 's'} sent
              </Heading>
              <BodyText variant="caption">
                {data?.viewer?.rank
                  ? `You are #${data.viewer.rank} this week`
                  : 'Send encouragement from a prayer request to appear here'}
              </BodyText>
            </View>
          </View>
        </GlassCard>

        <FlatList
          data={data?.entries || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={(
            <EmptyState label="No encouragements yet this week. Be the first to lift someone up." />
          )}
          renderItem={({ item }) => (
            <GlassCard style={styles.rowCard}>
              <View style={styles.row}>
                <View style={styles.rankBadge}>
                  <BodyText variant="label">#{item.rank}</BodyText>
                </View>
                <View style={styles.rowCopy}>
                  <Heading level="h4">{item.displayName}</Heading>
                  <BodyText variant="caption">
                    {item.count} encouragement{item.count === 1 ? '' : 's'}
                    {item.isSelf ? ' · You' : ''}
                  </BodyText>
                </View>
                {item.rank === 1 ? <Trophy size={18} color={colors.gold} /> : null}
              </View>
            </GlassCard>
          )}
        />
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  viewerCard: { marginBottom: spacing.lg },
  viewerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  viewerCopy: { flex: 1 },
  list: { paddingBottom: spacing.tabBar, gap: spacing.sm },
  rowCard: { marginBottom: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
  },
  rowCopy: { flex: 1 },
});
