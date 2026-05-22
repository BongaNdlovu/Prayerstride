import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { usePrayers, useTestimonies } from '../usePrayerData';
import { usePrayerSessions } from '../usePrayerSessions';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';
import AsyncState from '../components/AsyncState';

const ACHIEVEMENT_DEFS = [
  { id: 'first-prayer', name: 'First prayer shared', description: 'Share your first prayer request.', total: 1, metric: 'prayers' },
  { id: 'five-sessions', name: 'Consistent rhythm', description: 'Log five prayer sessions.', total: 5, metric: 'sessions' },
  { id: 'one-hour', name: 'One hour in prayer', description: 'Record 60 minutes of prayer time.', total: 3600, metric: 'seconds', format: 'time' },
  { id: 'testimony', name: 'Tell of goodness', description: 'Share an answered-prayer testimony.', total: 1, metric: 'testimonies' },
];

export default function AchievementsScreen({ user }) {
  const { prayers, loading: prayersLoading } = usePrayers(Boolean(user?.uid), { userId: user?.uid });
  const { sessions, totalSeconds, loading: sessionsLoading, error: sessionsError } = usePrayerSessions(user?.uid, true);
  const { testimonies, loading: testimoniesLoading } = useTestimonies(Boolean(user?.uid));
  const myPrayers = prayers.filter((item) => item.authorUid === user?.uid);
  const myTestimonies = testimonies.filter((item) => item.authorUid === user?.uid);
  const loading = prayersLoading || sessionsLoading || testimoniesLoading;
  const error = sessionsError;

  const achievements = useMemo(() => ACHIEVEMENT_DEFS.map((item) => {
    const currentByMetric = {
      prayers: myPrayers.length,
      sessions: sessions.length,
      seconds: totalSeconds,
      testimonies: myTestimonies.length,
    };
    const current = currentByMetric[item.metric] || 0;
    return {
      ...item,
      current,
      completed: current >= item.total,
    };
  }), [myPrayers.length, myTestimonies.length, sessions.length, totalSeconds]);

  return (
    <CinematicScreen>
      <PageHero scene="bible" eyebrow="Milestones" title="Achievements" subtitle="Your growth and consistency tracked." compact />
      <AsyncState loading={loading} error={error} empty={!loading && !error && achievements.length === 0} emptyLabel="No achievements yet.">
        <FlatList
          data={achievements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState label="No achievements yet." />}
          renderItem={({ item }) => (
            <View style={[styles.card, item.completed && styles.cardCompleted]}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(100, (item.current / item.total) * 100)}%` }]} />
                </View>
                <Text style={styles.progressText}>{formatProgress(item)}</Text>
              </View>
            </View>
          )}
        />
      </AsyncState>
    </CinematicScreen>
  );
}

function formatProgress(item) {
  if (item.format === 'time') {
    return `${Math.floor(item.current / 60)}/${Math.floor(item.total / 60)}m`;
  }
  return `${item.current}/${item.total}`;
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', borderRadius: 18, padding: 16, backgroundColor: 'rgba(248,243,234,0.05)' },
  cardCompleted: { borderColor: 'rgba(200,137,43,0.3)', backgroundColor: 'rgba(200,137,43,0.08)' },
  name: { color: colors.ivory, fontSize: 16, fontWeight: '700' },
  description: { marginTop: 4, color: 'rgba(248,243,234,0.55)', fontSize: 13 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(248,243,234,0.12)' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },
  progressText: { color: 'rgba(248,243,234,0.5)', fontSize: 11, fontWeight: '700' },
});
