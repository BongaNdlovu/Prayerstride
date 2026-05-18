import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { useNotifications, markNotificationRead } from '../useNotifications';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';

export default function NotificationsScreen({ user }) {
  const { notifications, loading } = useNotifications(user?.uid, true);

  return (
    <CinematicScreen>
      <PageHero scene="community" eyebrow="Activity" title="Notifications" subtitle="Stay up to date with prayer and praise." compact />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState label="No notifications." />}
        renderItem={({ item }) => (
          <Pressable onPress={() => markNotificationRead(item.id)} style={styles.notifItem}>
            <View style={[styles.dot, item.read ? styles.dotRead : styles.dotUnread]} />
            <View style={styles.notifContent}>
              <Text style={styles.notifText}>{item.message || item.type}</Text>
              <Text style={styles.notifTime}>{item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : ''}</Text>
            </View>
          </Pressable>
        )}
      />
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 8 },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(248,243,234,0.08)', borderRadius: 16, backgroundColor: 'rgba(248,243,234,0.05)' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  dotUnread: { backgroundColor: colors.gold },
  dotRead: { backgroundColor: 'rgba(248,243,234,0.3)' },
  notifContent: { flex: 1 },
  notifText: { color: colors.ivory, fontSize: 14, lineHeight: 21 },
  notifTime: { marginTop: 4, color: 'rgba(248,243,234,0.4)', fontSize: 11 },
});
