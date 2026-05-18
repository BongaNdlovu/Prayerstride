import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { mockCalendarEvents } from '../../data/mockData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';

export default function CalendarScreen() {
  return (
    <CinematicScreen>
      <PageHero scene="community" eyebrow="Calendar" title="Your rhythm" subtitle="Upcoming prayer events and reminders." compact />
      <FlatList
        data={mockCalendarEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState label="No upcoming events." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{item.date}</Text>
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{item.time} - {item.type}</Text>
            </View>
          </View>
        )}
      />
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
  card: { flexDirection: 'row', gap: 14, borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', borderRadius: 18, padding: 14, backgroundColor: 'rgba(248,243,234,0.05)' },
  date: { color: colors.gold, fontSize: 14, fontWeight: '800', minWidth: 50, textAlign: 'center' },
  info: { flex: 1 },
  title: { color: colors.ivory, fontSize: 15, fontWeight: '700' },
  meta: { marginTop: 2, color: 'rgba(248,243,234,0.5)', fontSize: 12 },
});
