import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { alpha, colors, spacing } from '../theme';
import { useFollowing } from '../useContentCollections';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import BodyText from '../components/BodyText';
import EmptyState from '../components/EmptyState';
import AsyncState from '../components/AsyncState';
import PrimaryButton from '../components/PrimaryButton';
import { unfollowUser } from '../api';
import { getErrorMessage } from '../errors';

export default function FollowingScreen({ user, onBack }) {
  const { following, loading, error, retry } = useFollowing(user?.uid, true);

  return (
    <ScreenScaffold scroll={false} style={styles.shell}>
      <AppHeader title="Following" subtitle="People and groups you follow." onBack={onBack} />
      <AsyncState
        loading={loading}
        error={error}
        onRetry={retry}
        empty={!loading && !error && following.length === 0}
        emptyLabel="Not following anyone yet."
      >
        <FlatList
          data={following}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState label="Not following anyone yet." />}
          renderItem={({ item }) => (
            <GlassCard style={styles.card}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <BodyText variant="label" style={styles.avatarText}>{(item.displayName || item.name || 'U').slice(0, 1)}</BodyText>
                </View>
                <View style={styles.info}>
                  <BodyText variant="label">{item.displayName || item.name || item.handle || 'Follower'}</BodyText>
                  <BodyText variant="caption">{item.subtitle || item.title || item.handle || 'Community member'}</BodyText>
                </View>
                <PrimaryButton
                  label="Unfollow"
                  variant="ghost"
                  onPress={() => unfollowUser(item.followedUid || item.id).catch((err) => Alert.alert('Could not unfollow', getErrorMessage(err)))}
                  style={styles.unfollow}
                />
              </View>
            </GlassCard>
          )}
        />
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.tabBar, gap: spacing.md },
  card: { marginBottom: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold22,
  },
  avatarText: { color: colors.navy },
  info: { flex: 1 },
  unfollow: { minHeight: 36, paddingHorizontal: spacing.sm },
});
