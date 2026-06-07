import { useState, useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Moon } from 'lucide-react-native';
import { alpha, colors, spacing } from '../theme';
import { useNotificationSettings, updateNotificationSettings } from '../useNotificationSettings';
import { registerForPushNotifications } from '../notifications';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import ToggleRow from '../components/ToggleRow';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import AsyncState from '../components/AsyncState';
import { getErrorMessage } from '../errors';

export default function NotificationSettingsScreen({ user, onBack }) {
  const { settings, loading, error, retry } = useNotificationSettings(user?.uid, true);
  const [prayerActivity, setPrayerActivity] = useState(true);
  const [announcements, setAnnouncements] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  useEffect(() => {
    if (settings) {
      setPrayerActivity(settings.prayerActivity !== false);
      setAnnouncements(settings.announcements !== false);
      setPushEnabled(settings.pushEnabled !== false);
    }
  }, [settings]);

  const save = async (key, value, setValue) => {
    try {
      await updateNotificationSettings(user.uid, { [key]: value });
      if (key === 'pushEnabled' && value) {
        registerForPushNotifications().catch((error) => {
          setPushEnabled(false);
          updateNotificationSettings(user.uid, { pushEnabled: false }).catch((saveError) => {
            Alert.alert('Could not save preference', getErrorMessage(saveError));
          });
          Alert.alert('Push notifications unavailable', getErrorMessage(error));
        });
      }
    } catch (error) {
      setValue(!value);
      Alert.alert('Could not save preference', getErrorMessage(error));
    }
  };

  return (
    <ScreenScaffold pageContent>
      <AppHeader title="Notifications" subtitle="Choose what you want to hear about." onBack={onBack} />
      <AsyncState loading={loading} error={error} onRetry={retry}>
      <Heading level="eyebrow" style={styles.sectionLabel}>Activity</Heading>
      <GlassCard style={styles.card}>
        <ToggleRow
          label="Prayer Activity"
          subtext="When someone prays for your request."
          value={prayerActivity}
          onToggle={(v) => { setPrayerActivity(v); save('prayerActivity', v, setPrayerActivity); }}
        />
        <ToggleRow
          label="Announcements"
          subtext="Community updates from PrayerStride leaders."
          value={announcements}
          onToggle={(v) => { setAnnouncements(v); save('announcements', v, setAnnouncements); }}
          style={styles.toggleBorderless}
        />
      </GlassCard>
      <Heading level="eyebrow" style={styles.sectionLabel}>Channels</Heading>
      <GlassCard style={styles.card}>
        <ToggleRow
          label="Push Notifications"
          subtext="Device alerts for enabled activity."
          value={pushEnabled}
          onToggle={(v) => { setPushEnabled(v); save('pushEnabled', v, setPushEnabled); }}
          style={styles.toggleBorderless}
        />
        <View style={styles.quietRow}>
          <View style={styles.quietIcon}>
            <Moon size={18} color={colors.gold} />
          </View>
          <View style={styles.quietText}>
            <BodyText variant="label">Quiet Hours</BodyText>
            <BodyText variant="caption">10 PM – 7 AM · Notifications paused</BodyText>
          </View>
        </View>
      </GlassCard>
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { marginTop: spacing.md, marginBottom: spacing.sm },
  card: { paddingVertical: spacing.sm, marginBottom: spacing.sm },
  toggleBorderless: { borderBottomWidth: 0 },
  quietRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  quietIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
  },
  quietText: { flex: 1 },
});
