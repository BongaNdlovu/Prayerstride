import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { useAnnouncements } from '../useAnnouncements';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import AsyncState from '../components/AsyncState';

export default function AnnouncementsScreen() {
  const { announcements, loading, error } = useAnnouncements(true);

  return (
    <CinematicScreen>
      <PageHero scene="community" eyebrow="Updates" title="Announcements" subtitle="Community updates from PrayerStride leaders." compact />
      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && announcements.length === 0}
        emptyLabel="No active announcements right now."
      >
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.type}>{item.categoryLabel}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.date}>
                {item.displayDate}{item.displayTime ? ` · ${item.displayTime}` : ''}
              </Text>
            </View>
          )}
        />
      </AsyncState>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', borderRadius: 18, padding: 16, backgroundColor: 'rgba(248,243,234,0.05)' },
  type: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { marginTop: 8, color: colors.ivory, fontSize: 16, fontWeight: '700' },
  body: { marginTop: 8, color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 22 },
  date: { marginTop: 8, color: 'rgba(248,243,234,0.5)', fontSize: 12 },
});
