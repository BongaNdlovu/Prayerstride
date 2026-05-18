import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { deleteOwnAccount } from '../api';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

const ITEMS = [
  { label: 'Notification Settings', route: 'notificationSettings' },
  { label: 'Privacy Policy', route: 'privacyPolicy' },
  { label: 'Terms of Service', route: 'termsOfService' },
  { label: 'Help Center', route: 'helpCenter' },
  { label: 'Support / Donation', route: 'support' },
];

export default function SettingsScreen({ go, signOut }) {
  const deleteAccount = () => {
    Alert.alert('Delete Account', 'This action cannot be undone. All your data will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteOwnAccount();
          signOut();
        } catch (error) {
          Alert.alert('Could not delete account', error.message);
        }
      }},
    ]);
  };

  return (
    <CinematicScreen pageContent>
      <PageHero scene="community" eyebrow="Settings" title="Manage your account" subtitle="Notifications, privacy, and account controls." compact />
      {ITEMS.map((item) => (
        <Pressable key={item.route} onPress={() => go(item.route)} style={styles.menuItem}>
          <Text style={styles.menuText}>{item.label}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
      ))}
      <Pressable onPress={deleteAccount} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete Account</Text>
      </Pressable>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(248,243,234,0.08)' },
  menuText: { color: colors.ivory, fontSize: 16, fontWeight: '600' },
  menuArrow: { color: 'rgba(248,243,234,0.4)', fontSize: 24 },
  deleteButton: { marginTop: 24, minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(200,137,43,0.3)', backgroundColor: 'rgba(200,137,43,0.08)' },
  deleteText: { color: colors.gold, fontSize: 16, fontWeight: '700' },
});
