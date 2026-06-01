import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { useDevotions } from '../useContentCollections';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import EmptyState from '../components/EmptyState';
import AsyncState from '../components/AsyncState';

export default function DevotionsScreen({ go, onBack }) {
  const { devotions, loading, error } = useDevotions(true);

  return (
    <ScreenScaffold scroll={false} style={styles.shell}>
      <AppHeader title="Daily Devotions" subtitle="Read, reflect, and grow in faith." onBack={onBack} />
      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && devotions.length === 0}
        emptyLabel="No devotions available."
      >
        <FlatList
          data={devotions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState label="No devotions available." />}
          renderItem={({ item }) => (
            <Pressable onPress={() => go('guideDetail', { guideId: item.guideId || item.id })}>
              <GlassCard style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.cardInfo}>
                    <Heading level="h4">{item.title}</Heading>
                    <BodyText variant="small">{item.reference || item.subtitle || 'Daily reading'}</BodyText>
                    <BodyText variant="caption" style={styles.date}>
                      {item.dateLabel || item.date || ''}{item.day ? ` · Day ${item.day}` : ''}
                    </BodyText>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>
              </GlassCard>
            </Pressable>
          )}
        />
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.tabBar, gap: spacing.md },
  card: { marginBottom: 0 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardInfo: { flex: 1 },
  date: { marginTop: spacing.xs, color: colors.textMuted },
});
