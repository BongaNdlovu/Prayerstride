import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { alpha, spacing } from '../theme';
import { deleteOwnAccount } from '../api';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import BodyText from '../components/BodyText';

const ITEMS = [
  { label: 'Notification Settings', route: 'notificationSettings' },
  { label: 'About PrayerStride', route: 'about' },
  { label: 'Privacy Policy', route: 'privacyPolicy' },
  { label: 'Terms of Service', route: 'termsOfService' },
  { label: 'Copyright', route: 'copyright' },
  { label: 'Help Center', route: 'helpCenter' },
  { label: 'Support / Donation', route: 'support' },
];

export default function SettingsScreen({ go, signOut, onBack }) {
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
    <ScreenScaffold pageContent>
      <AppHeader title="Settings" subtitle="Notifications, privacy, and account controls." onBack={onBack} />
      <GlassCard style={styles.menuCard}>
        {ITEMS.map((item, index) => (
          <Pressable
            key={item.route}
            onPress={() => go(item.route)}
            style={[styles.menuItem, index === ITEMS.length - 1 && styles.menuItemLast]}
          >
            <BodyText variant="label">{item.label}</BodyText>
            <ChevronRight size={18} color={alpha.ivory55} />
          </Pressable>
        ))}
      </GlassCard>
      <PrimaryButton label="Delete Account" onPress={deleteAccount} variant="ghost" style={styles.deleteButton} />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  menuCard: { paddingVertical: spacing.sm },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: alpha.ivory10,
  },
  menuItemLast: { borderBottomWidth: 0 },
  deleteButton: { marginTop: spacing.xl, borderColor: alpha.gold30 },
});
