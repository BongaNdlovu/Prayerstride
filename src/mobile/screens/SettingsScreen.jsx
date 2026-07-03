import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { alpha, colors, fonts, sharedStyles, spacing } from '../theme';
import { useGamificationPreferences, updateGamificationPreferences } from '../useGamificationPreferences';
import { triggerFeedbackCue } from '../AppFeedbackProvider';
import { configureStreakReminderNotifications } from '../notifications';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import BodyText from '../components/BodyText';
import ToggleRow from '../components/ToggleRow';
import { getErrorMessage } from '../errors';

const ITEMS = [
  { label: 'Notification Settings', route: 'notificationSettings' },
  { label: 'About PrayerStride', route: 'about' },
  { label: 'Privacy Policy', route: 'privacyPolicy' },
  { label: 'Terms and Conditions', route: 'termsOfService' },
  { label: 'Legal & Copyright', route: 'copyright' },
  { label: 'Help Center', route: 'helpCenter' },
];

export default function SettingsScreen({ user, go, deleteAccount, onBack }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const {
    preferences,
    loading: preferencesLoading,
    setPreferences,
  } = useGamificationPreferences(user?.uid, Boolean(user?.uid));

  const savePreference = async (key, value) => {
    try {
      if (key === 'streakRemindersEnabled' && value === true) {
        await configureStreakReminderNotifications(true);
      }
      const next = await updateGamificationPreferences(user?.uid, { [key]: value });
      setPreferences(next);
      if (key === 'soundHapticsEnabled' && value === true) triggerFeedbackCue('celebrate');
      if (key === 'streakRemindersEnabled' && value === false) {
        await configureStreakReminderNotifications(false);
      }
    } catch (error) {
      Alert.alert('Could not update preference', getErrorMessage(error));
    }
  };

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
            <ChevronRight size={18} color={colors.ink3} />
          </Pressable>
        ))}
      </GlassCard>
      <GlassCard style={styles.preferencesCard}>
        <ToggleRow
          label="Show on Leaderboard"
          subtext="Appear in public prayer rankings only when enabled."
          value={preferences.leaderboardVisible === true}
          onToggle={(value) => savePreference('leaderboardVisible', value)}
        />
        <ToggleRow
          label="Dark Mode"
          subtext="Use the darker prayer surfaces for quieter focus."
          value={preferences.darkModeEnabled === true}
          onToggle={(value) => savePreference('darkModeEnabled', value)}
        />
        <ToggleRow
          label="Sound and Haptics"
          subtext="Play tactile prayer feedback and milestone cues."
          value={preferences.soundHapticsEnabled !== false}
          onToggle={(value) => savePreference('soundHapticsEnabled', value)}
        />
        <ToggleRow
          label="XP Notifications"
          subtext="Show XP gain feedback when actions earn progress."
          value={preferences.xpNotificationsEnabled !== false}
          onToggle={(value) => savePreference('xpNotificationsEnabled', value)}
        />
        <ToggleRow
          label="Streak Reminders"
          subtext="Keep reminders active to steady your prayer rhythm."
          value={preferences.streakRemindersEnabled !== false}
          onToggle={(value) => savePreference('streakRemindersEnabled', value)}
          style={styles.preferenceLast}
        />
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
            placeholderTextColor={colors.ink3}
          />
          <PrimaryButton label={busy ? 'Deleting...' : 'Delete my account'} onPress={submitDelete} busy={busy} style={styles.deleteConfirm} />
          <Pressable onPress={() => setConfirmingDelete(false)}>
            <BodyText variant="small" style={styles.cancelDelete}>Cancel</BodyText>
          </Pressable>
        </GlassCard>
      ) : (
        <PrimaryButton
          label={preferencesLoading ? 'Loading Preferences...' : 'Delete Account'}
          onPress={deleteAccountFlow}
          variant="ghost"
          style={styles.deleteButton}
        />
      )}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  menuCard: { paddingVertical: spacing.sm },
  preferencesCard: { marginTop: spacing.lg, paddingVertical: spacing.sm },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: { borderBottomWidth: 0 },
  preferenceLast: { borderBottomWidth: 0 },
  deleteButton: { marginTop: spacing.xl, borderColor: alpha.gold30 },
  deleteCard: { marginTop: spacing.xl, gap: spacing.md },
  deleteLabel: { color: colors.gold },
  passwordInput: {
    ...sharedStyles.input,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
  deleteConfirm: { marginTop: spacing.sm },
  cancelDelete: { textAlign: 'center', color: colors.gold, marginTop: spacing.sm },
});
