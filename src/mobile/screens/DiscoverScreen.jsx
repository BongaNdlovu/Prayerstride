import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Filter, Search, X } from 'lucide-react-native';
import { alpha, colors, radii, spacing } from '../theme';
import { usePrayers } from '../usePrayerData';
import { filterBlockedItems, useBlocks } from '../useBlocks';
import ScreenScaffold from '../components/ScreenScaffold';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import PillTabs from '../components/PillTabs';
import PrayerCard from '../components/PrayerCard';
import AsyncState from '../components/AsyncState';
import GlassCard from '../components/GlassCard';

const CATEGORIES = ['All', 'Health', 'Family', 'Finances', 'Relationships'];

const CATEGORY_KEYWORDS = {
  Health: ['health', 'healing', 'sick', 'hospital', 'medical', 'cancer', 'surgery'],
  Family: ['family', 'marriage', 'child', 'parent', 'spouse', 'son', 'daughter'],
  Finances: ['finance', 'money', 'job', 'debt', 'provision', 'financial', 'work'],
  Relationships: ['relationship', 'friend', 'conflict', 'forgive', 'lonely', 'breakup'],
};

function matchesCategory(prayer, category) {
  if (category === 'All') return true;
  const stored = prayer.category?.toLowerCase();
  if (stored === category.toLowerCase()) return true;
  const text = `${prayer.title} ${prayer.body}`.toLowerCase();
  return (CATEGORY_KEYWORDS[category] || []).some((keyword) => text.includes(keyword));
}

export default function DiscoverScreen({ onOpenPrayer }) {
  const { prayers, loading, error, retry } = usePrayers(true);
  const { blockedUids, error: blocksError, refresh: retryBlocks } = useBlocks(true);
  const listError = error || blocksError;
  const retryAll = () => {
    retry();
    retryBlocks();
  };
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const visible = filterBlockedItems(prayers, blockedUids);
    const normalized = query.trim().toLowerCase();
    return visible.filter((prayer) => {
      const matchesSearch = !normalized
        || `${prayer.title} ${prayer.body} ${prayer.authorName}`.toLowerCase().includes(normalized);
      return matchesSearch && matchesCategory(prayer, category);
    });
  }, [prayers, blockedUids, query, category]);

  const header = (
    <View style={styles.header}>
      <Heading level="h2">Pray</Heading>
      <BodyText variant="small" style={styles.subtitle}>
        Search requests and find a prayer to carry today.
      </BodyText>

      <View style={styles.searchRow}>
        <Search size={18} color={colors.gold} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search prayers..."
          placeholderTextColor={alpha.ivory55}
          style={styles.searchInput}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} accessibilityLabel="Clear search">
            <X size={18} color={alpha.ivory55} />
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => setShowFilters((open) => !open)}
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          accessibilityLabel="Toggle filters"
        >
          <Filter size={16} color={showFilters ? colors.ink : colors.gold} />
        </Pressable>
      </View>

      {showFilters ? (
        <GlassCard style={styles.filterPanel}>
          <BodyText variant="caption" style={styles.filterLabel}>Category</BodyText>
          <PillTabs tabs={CATEGORIES} active={category} onChange={setCategory} style={styles.pills} />
        </GlassCard>
      ) : (
        <PillTabs tabs={CATEGORIES} active={category} onChange={setCategory} style={styles.pills} />
      )}
    </View>
  );

  return (
    <ScreenScaffold scroll={false} pageContent style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={header}
        ListEmptyComponent={(
          <AsyncState
            loading={loading}
            error={listError}
            onRetry={retryAll}
            empty={!loading && !listError}
            emptyLabel="No matching prayers."
          />
        )}
        renderItem={({ item }) => (
          <PrayerCard prayer={item} onPress={() => onOpenPrayer(item)} variant="glass" />
        )}
        showsVerticalScrollIndicator={false}
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingTop: spacing.sm, paddingBottom: spacing.md },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.lg },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    borderWidth: 1,
    borderColor: alpha.ivory16,
    backgroundColor: alpha.ivory11,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
  },
  searchInput: { flex: 1, color: colors.ivory, fontSize: 15 },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.ivory12,
  },
  filterBtnActive: { backgroundColor: colors.gold },
  filterPanel: { marginTop: spacing.sm, marginBottom: spacing.xs },
  filterLabel: { marginBottom: spacing.xs, color: colors.gold, letterSpacing: 1.2, textTransform: 'uppercase' },
  pills: { marginTop: spacing.sm },
  listContent: { paddingBottom: spacing.tabBar, gap: spacing.md },
});
