import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { mockAnnouncements } from '../../data/mockData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';

export default function AnnouncementsScreen() {
  return (
    <CinematicScreen>
      <PageHero scene="community" eyebrow="Updates" title="Announcements" subtitle="Stay informed about community events." compact />
      <FlatList
        data={mockAnnouncements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState label="No announcements." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.type}>{item.type}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{item.date}{item.time ? ` - ${item.time}` : ''}</Text>
          </View>
        )}
      />
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', borderRadius: 18, padding: 16, backgroundColor: 'rgba(248,243,234,0.05)' },
  type: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { marginTop: 8, color: colors.ivory, fontSize: 16, fontWeight: '700' },
  date: { marginTop: 4, color: 'rgba(248,243,234,0.5)', fontSize: 12 },
});
