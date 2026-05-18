import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { mockDevotions } from '../../data/mockData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';

export default function DevotionsScreen({ go }) {
  return (
    <CinematicScreen>
      <PageHero scene="bible" eyebrow="Devotion" title="Daily Devotions" subtitle="Read, reflect, and grow in faith." compact />
      <FlatList
        data={mockDevotions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState label="No devotions available." />}
        renderItem={({ item }) => (
          <Pressable onPress={() => go('guideDetail', { guideId: item.id })} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.ref}>{item.reference}</Text>
            <Text style={styles.date}>{item.date}{item.day ? ` - ${item.day}` : ''}</Text>
          </Pressable>
        )}
      />
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', borderRadius: 18, padding: 16, backgroundColor: 'rgba(248,243,234,0.05)' },
  title: { color: colors.ivory, fontSize: 16, fontWeight: '700' },
  ref: { marginTop: 6, color: 'rgba(248,243,234,0.62)', fontSize: 13 },
  date: { marginTop: 4, color: 'rgba(248,243,234,0.4)', fontSize: 11 },
});
