import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { alpha, colors, radii, spacing } from '../theme';
import { useNotifications, markAllNotificationsRead, markNotificationRead } from '../useNotifications';
import { formatFirestoreDate } from '../sessionStats';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import EmptyState from '../components/EmptyState';
import AsyncState from '../components/AsyncState';
import PrimaryButton from '../components/PrimaryButton';
import { getErrorMessage } from '../errors';

export default function NotificationsScreen({ user, onBack }) {
  const { notifications, unread, read, loading, error, retry } = useNotifications(user?.uid, true);
  const markAllRead = () => {
    markAllNotificationsRead(user?.uid).then(() => retry()).catch((error) => {
      Alert.alert('Could not update notifications', getErrorMessage(error));
    });
  };

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => markNotificationRead(item.id).then(() => retry()).catch((err) => {
        Alert.alert('Could not update notification', getErrorMessage(err));
      })}
      style={({ pressed }) => [styles.itemWrap, pressed && styles.pressed]}
    >
      <GlassCard style={[styles.notifCard, !item.read && styles.notifUnread]}>
        <View style={styles.notifRow}>
          <View style={[styles.dot, item.read ? styles.dotRead : styles.dotUnread]} />
          <View style={styles.notifContent}>
            <BodyText variant="body" style={styles.notifText}>{item.message || item.type}</BodyText>
            <BodyText variant="caption" style={styles.notifTime}>
              {formatFirestoreDate(item.createdAt)}
            </BodyText>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );

  return (
    <ScreenScaffold scroll={false} pageContent style={styles.screen}>
      <AppHeader title="Notifications" subtitle="Stay up to date with prayer and praise." onBack={onBack} centered showLogo />
      <AsyncState loading={loading} error={error} onRetry={retry}>
        {notifications.length === 0 && !loading ? (
          <EmptyState label="No notifications." />
        ) : (
          <FlatList
            data={[...unread, ...read]}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              unread.length > 0 ? (
                <View style={styles.listHeader}>
                  <Heading level="eyebrow" style={styles.sectionLabel}>New ({unread.length})</Heading>
                  <PrimaryButton label="Mark all read" variant="ghost" onPress={markAllRead} style={styles.markAllButton} />
                </View>
              ) : null
            }
            renderItem={renderItem}
          />
        )}
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingBottom: spacing.tabBar, gap: spacing.sm },
  sectionLabel: { marginBottom: spacing.md },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  markAllButton: { minHeight: 36, paddingHorizontal: spacing.md },
  itemWrap: { marginBottom: spacing.xs },
  notifCard: { marginBottom: 0, paddingVertical: spacing.lg },
  notifUnread: { borderColor: alpha.gold30, backgroundColor: alpha.gold18 },
  notifRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  dot: { width: 10, height: 10, borderRadius: radii.pill, marginTop: 6 },
  dotUnread: { backgroundColor: colors.gold },
  dotRead: { backgroundColor: alpha.navy16 },
  notifContent: { flex: 1 },
  notifText: { color: colors.textPrimary },
  notifTime: { marginTop: spacing.xs },
  pressed: { opacity: 0.92 },
});
