import { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../theme';
import { useNotificationSettings, updateNotificationSettings } from '../useNotificationSettings';
import { registerForPushNotifications } from '../notifications';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function NotificationSettingsScreen({ user }) {
  const { settings, loading } = useNotificationSettings(user?.uid, true);
  const [prayerActivity, setPrayerActivity] = useState(true);
  const [testimonyReactions, setTestimonyReactions] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  useEffect(() => {
    if (settings) {
      setPrayerActivity(settings.prayerActivity !== false);
      setTestimonyReactions(settings.testimonyReactions !== false);
      setPushEnabled(settings.pushEnabled !== false);
    }
  }, [settings]);

  const save = async (key, value) => {
    try {
      await updateNotificationSettings(user.uid, { [key]: value });
      if (key === 'pushEnabled' && value) {
        registerForPushNotifications().catch(() => {});
      }
    } catch (error) {
      // revert on error handled by snapshot listener
    }
  };

  return (
    <CinematicScreen pageContent>
      <PageHero scene="community" eyebrow="Settings" title="Notifications" subtitle="Choose what you want to hear about." compact />
      <View style={styles.card}>
        <ToggleRow label="Prayer Activity" value={prayerActivity} onToggle={(v) => { setPrayerActivity(v); save('prayerActivity', v); }} />
        <ToggleRow label="Testimony Reactions" value={testimonyReactions} onToggle={(v) => { setTestimonyReactions(v); save('testimonyReactions', v); }} />
        <ToggleRow label="Push Notifications" value={pushEnabled} onToggle={(v) => { setPushEnabled(v); save('pushEnabled', v); }} />
      </View>
    </CinematicScreen>
  );
}

function ToggleRow({ label, value, onToggle }) {
  return (
    <Pressable onPress={() => onToggle(!value)} style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: 'rgba(248,243,234,0.2)', true: colors.gold }} thumbColor={value ? colors.ink : colors.ivory} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(248,243,234,0.1)' },
  toggleLabel: { color: colors.ivory, fontSize: 15, fontWeight: '600', flex: 1 },
});
