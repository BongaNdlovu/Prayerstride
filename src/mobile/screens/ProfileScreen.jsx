import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { useUserProfile } from '../useUsers';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import MotionPressable from '../components/MotionPressable';

const MENU = [
  { label: 'Edit Profile', route: 'editProfile' },
  { label: 'My Prayers', route: 'myPrayers' },
  { label: 'Answered Prayers', route: 'answeredPrayers' },
  { label: 'My Stats', route: 'myStats' },
  { label: 'Prayer Stopwatch', route: 'prayerStopwatch' },
  { label: 'Notifications', route: 'notifications' },
  { label: 'Announcements', route: 'announcements' },
  { label: 'Calendar', route: 'calendar' },
  { label: 'Settings', route: 'settings' },
];

export default function ProfileScreen({ user, signOut, go }) {
  const { profile } = useUserProfile(user?.uid, Boolean(user?.uid));
  const displayName = profile?.displayName || user.displayName || 'PrayerStride User';
  const handle = profile?.handle || '';
  const bio = profile?.bio || '';
  const photoURL = profile?.photoURL || user.photoURL;

  return (
    <CinematicScreen pageContent>
      <PageHero scene="community" eyebrow="Profile" title="Your place in the walk" subtitle="Settings, identity, and the path you are keeping with PrayerStride." compact />
      <View style={styles.card}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.title}>{displayName}</Text>
        {handle ? <Text style={styles.handle}>{handle}</Text> : null}
        <Text style={styles.meta}>{user.email}</Text>
        {bio ? <Text style={styles.bio}>{bio}</Text> : null}
      </View>
      {MENU.map((item) => (
        <MotionPressable key={item.route} onPress={() => go(item.route)} style={styles.menuItem}>
          <Text style={styles.menuText}>{item.label}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </MotionPressable>
      ))}
      <MotionPressable onPress={signOut} style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </MotionPressable>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18, marginBottom: 16 },
  avatar: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand, marginBottom: 12 },
  avatarImage: { width: 70, height: 70, borderRadius: 35, marginBottom: 12 },
  avatarText: { color: colors.navy, fontSize: 28, fontWeight: '800' },
  title: { color: colors.ivory, fontSize: 21, lineHeight: 26, fontWeight: '800' },
  handle: { color: colors.gold, fontSize: 13, fontWeight: '700', marginTop: 4 },
  meta: { flexShrink: 1, color: 'rgba(248,243,234,0.55)', fontSize: 12, marginTop: 4 },
  bio: { marginTop: 10, color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 22 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(248,243,234,0.08)' },
  menuText: { color: colors.ivory, fontSize: 16, fontWeight: '600' },
  menuArrow: { color: 'rgba(248,243,234,0.4)', fontSize: 24 },
  signOutButton: { marginTop: 24, minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.08)' },
  signOutText: { color: colors.ivory, fontSize: 16, fontWeight: '800' },
});
