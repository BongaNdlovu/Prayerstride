import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

const MENU = [
  { label: 'My Prayers', route: 'myPrayers' },
  { label: 'Answered Prayers', route: 'answeredPrayers' },
  { label: 'My Stats', route: 'myStats' },
  { label: 'Prayer Stopwatch', route: 'prayerStopwatch' },
  { label: 'Notifications', route: 'notifications' },
  { label: 'Following', route: 'following' },
  { label: 'Announcements', route: 'announcements' },
  { label: 'Devotions', route: 'devotions' },
  { label: 'Calendar', route: 'calendar' },
  { label: 'Reminders', route: 'reminderSettings' },
  { label: 'Achievements', route: 'achievements' },
  { label: 'Quick Actions', route: 'quickActions' },
  { label: 'Settings', route: 'settings' },
];

export default function ProfileScreen({ user, signOut, go }) {
  return (
    <CinematicScreen pageContent>
      <PageHero scene="community" eyebrow="Profile" title="Your place in the walk" subtitle="Settings, identity, and the path you are keeping with PrayerStride." compact />
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.displayName || user.email || 'P').slice(0, 1).toUpperCase()}</Text>
        </View>
        <Text style={styles.title}>{user.displayName || 'PrayerStride User'}</Text>
        <Text style={styles.meta}>{user.email}</Text>
      </View>
      {MENU.map((item) => (
        <Pressable key={item.route} onPress={() => go(item.route)} style={styles.menuItem}>
          <Text style={styles.menuText}>{item.label}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
      ))}
      <Pressable onPress={signOut} style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18, marginBottom: 16 },
  avatar: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand, marginBottom: 12 },
  avatarText: { color: colors.navy, fontSize: 28, fontWeight: '800' },
  title: { color: colors.ivory, fontSize: 21, lineHeight: 26, fontWeight: '800' },
  meta: { flexShrink: 1, color: 'rgba(248,243,234,0.55)', fontSize: 12, marginTop: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(248,243,234,0.08)' },
  menuText: { color: colors.ivory, fontSize: 16, fontWeight: '600' },
  menuArrow: { color: 'rgba(248,243,234,0.4)', fontSize: 24 },
  signOutButton: { marginTop: 24, minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.08)' },
  signOutText: { color: colors.ivory, fontSize: 16, fontWeight: '800' },
});
