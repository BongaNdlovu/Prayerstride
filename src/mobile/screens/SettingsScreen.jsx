import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { alpha, colors, fonts, sharedStyles, spacing } from '../theme';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import BodyText from '../components/BodyText';
import { getErrorMessage } from '../errors';

const ITEMS = [
  { label: 'Notification Settings', route: 'notificationSettings' },
  { label: 'About PrayerStride', route: 'about' },
  { label: 'Privacy Policy', route: 'privacyPolicy' },
  { label: 'Terms of Service', route: 'termsOfService' },
  { label: 'Legal & Copyright', route: 'copyright' },
  { label: 'Help Center', route: 'helpCenter' },
  { label: 'Support / Donation', route: 'support' },
];

export default function SettingsScreen({ go, deleteAccount, onBack }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const deleteAccountFlow = () => {
    Alert.alert('Delete Account', 'This action cannot be undone. All your data will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', style: 'destructive', onPress: () => setConfirmingDelete(true) },
    ]);
  };

  const submitDelete = async () => {
    if (!password) {
      Alert.alert('Password required', 'Enter your password to confirm deletion.');
      return;
    }
    setBusy(true);
    try {
      await deleteAccount(password);
      setPassword('');
      setConfirmingDelete(false);
    } catch (error) {
      Alert.alert('Could not delete account', getErrorMessage(error));
    } finally {
      setBusy(false);
    }
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
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </GlassCard>
      {confirmingDelete ? (
        <GlassCard style={styles.deleteCard}>
          <BodyText variant="label" style={styles.deleteLabel}>Confirm with your password</BodyText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.passwordInput}
            placeholderTextColor={colors.textMuted}
          />
          <PrimaryButton label={busy ? 'Deleting...' : 'Delete my account'} onPress={submitDelete} busy={busy} style={styles.deleteConfirm} />
          <Pressable onPress={() => setConfirmingDelete(false)}>
            <BodyText variant="small" style={styles.cancelDelete}>Cancel</BodyText>
          </Pressable>
        </GlassCard>
      ) : (
        <PrimaryButton label="Delete Account" onPress={deleteAccountFlow} variant="ghost" style={styles.deleteButton} />
      )}
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
    borderBottomColor: colors.border,
  },
  menuItemLast: { borderBottomWidth: 0 },
  deleteButton: { marginTop: spacing.xl, borderColor: alpha.gold30 },
  deleteCard: { marginTop: spacing.xl, gap: spacing.md },
  deleteLabel: { color: colors.gold },
  passwordInput: {
    ...sharedStyles.input,
    color: colors.textPrimary,
    fontFamily: fonts.sans,
  },
  deleteConfirm: { marginTop: spacing.sm },
  cancelDelete: { textAlign: 'center', color: colors.gold, marginTop: spacing.sm },
});
