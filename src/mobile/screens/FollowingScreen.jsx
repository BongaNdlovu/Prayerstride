import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { mockFollowing } from '../../data/mockData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';

export default function FollowingScreen() {
  return (
    <CinematicScreen>
      <PageHero scene="community" eyebrow="Community" title="Following" subtitle="People and groups you follow." compact />
      <FlatList
        data={mockFollowing}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState label="Not following anyone yet." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.name || 'U').slice(0, 1)}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.title}>{item.title}</Text>
            </View>
          </View>
        )}
      />
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', borderRadius: 18, padding: 14, backgroundColor: 'rgba(248,243,234,0.05)' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand },
  avatarText: { color: colors.navy, fontSize: 20, fontWeight: '800' },
  info: { flex: 1 },
  name: { color: colors.ivory, fontSize: 16, fontWeight: '700' },
  title: { color: 'rgba(248,243,234,0.5)', fontSize: 12, marginTop: 2 },
});
