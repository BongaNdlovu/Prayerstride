import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { usePrayers } from '../usePrayerData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import PrayerCard from '../components/PrayerCard';
import EmptyState from '../components/EmptyState';

export default function MyPrayersScreen({ user, onOpenPrayer }) {
  const { prayers } = usePrayers(true);
  const [tab, setTab] = useState('Active');
  const mine = prayers.filter((p) => p.authorUid === user.uid);
  const active = mine.filter((p) => p.status === 'active');
  const answered = mine.filter((p) => p.status === 'answered');

  const data = tab === 'Answered' ? answered : active;
  const tabs = ['Active', 'Answered'];

  return (
    <CinematicScreen>
      <PageHero scene="bible" eyebrow="My Prayers" title="Your prayer walk" subtitle="Track your requests and answered prayers." compact />
      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState label={tab === 'Answered' ? 'No answered prayers yet.' : 'No active prayers.'} />}
        renderItem={({ item }) => <PrayerCard prayer={item} onPress={() => onOpenPrayer(item)} variant="glass" />}
      />
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  tab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.08)' },
  tabActive: { borderColor: colors.gold, backgroundColor: 'rgba(200,137,43,0.18)' },
  tabText: { color: 'rgba(248,243,234,0.62)', fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: colors.gold },
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
});
