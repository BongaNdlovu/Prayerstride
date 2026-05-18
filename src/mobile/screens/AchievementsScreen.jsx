import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { mockAchievements } from '../../data/mockData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';

export default function AchievementsScreen() {
  return (
    <CinematicScreen>
      <PageHero scene="bible" eyebrow="Milestones" title="Achievements" subtitle="Your growth and consistency tracked." compact />
      <FlatList
        data={mockAchievements}
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
              <Text style={styles.progressText}>{item.current}/{item.total}</Text>
            </View>
          </View>
        )}
      />
    </CinematicScreen>
  );
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
