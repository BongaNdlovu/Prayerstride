import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { useFollowing } from '../useContentCollections';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';
import AsyncState from '../components/AsyncState';

export default function FollowingScreen({ user }) {
  const { following, loading, error } = useFollowing(user?.uid, true);

  return (
    <CinematicScreen>
      <PageHero scene="community" eyebrow="Community" title="Following" subtitle="People and groups you follow." compact />
      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && following.length === 0}
        emptyLabel="Not following anyone yet."
      >
        <FlatList
          data={following}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState label="Not following anyone yet." />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(item.displayName || item.name || 'U').slice(0, 1)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.displayName || item.name || item.handle || 'Follower'}</Text>
                <Text style={styles.title}>{item.subtitle || item.title || item.handle || 'Community member'}</Text>
              </View>
            </View>
          )}
        />
      </AsyncState>
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
