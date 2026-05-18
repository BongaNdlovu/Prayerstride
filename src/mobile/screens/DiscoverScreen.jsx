import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { colors } from '../theme';
import { usePrayers } from '../usePrayerData';
import EmptyState from '../components/EmptyState';
import PageHero from '../components/PageHero';
import PrayerCard from '../components/PrayerCard';

export default function DiscoverScreen({ onOpenPrayer }) {
  const { prayers } = usePrayers(true);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => prayers.filter((prayer) => `${prayer.title} ${prayer.body}`.toLowerCase().includes(query.toLowerCase())), [prayers, query]);

  return (
    <View style={styles.screen}>
      <PageHero scene="community" eyebrow="Explore" title="Find a prayer to carry" subtitle="Search requests, people, and praise reports in a quieter, warmer space." compact bleed={false} />
      <View style={styles.searchPanel}>
        <Search size={18} color="rgba(248,243,234,0.62)" />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search prayers..." style={styles.searchInput} placeholderTextColor="rgba(248,243,234,0.58)" />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState label="No matching prayers." />}
        renderItem={({ item }) => <PrayerCard prayer={item} onPress={() => onOpenPrayer(item)} variant="glass" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080b13' },
  searchPanel: { marginHorizontal: 16, marginBottom: 12, minHeight: 52, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 18, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, color: colors.ivory, fontSize: 15 },
  listContent: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
});
