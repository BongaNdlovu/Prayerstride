import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Moon, Plus, Sun, Sunrise } from 'lucide-react-native';
import { alpha, colors, radii, spacing } from '../theme';
import { useNotificationSettings, updateNotificationSettings } from '../useNotificationSettings';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import ToggleRow from '../components/ToggleRow';
import PrimaryButton from '../components/PrimaryButton';
import SectionDivider from '../components/SectionDivider';
import AsyncState from '../components/AsyncState';

const DAILY_REMINDERS = [
  { id: 'prayerActivity', title: 'Morning Prayer', time: '6:30 AM', schedule: 'Every day', icon: Sunrise },
  { id: 'testimonyReactions', title: 'Midday Pause', time: '12:00 PM', schedule: 'Every day', icon: Sun },
  { id: 'pushEnabled', title: 'Evening Prayer', time: '8:00 PM', schedule: 'Every day', icon: Moon },
];

const RECURRING_SCHEDULE = [
  { title: 'Pray for Families', time: '8:00 PM', schedule: 'Thursdays' },
  { title: 'Community Prayer Room', time: '7:00 PM', schedule: 'Sundays' },
  { title: 'Follow up on requests', schedule: 'Every 3 days' },
  { title: 'Thank God for answers', schedule: 'Every 7 days' },
];

export default function RemindersScreen({ user, onBack }) {
  const { settings, loading } = useNotificationSettings(user?.uid, true);

  const toggle = async (id, value) => {
    if (!user?.uid) return;
    await updateNotificationSettings(user.uid, {
      prayerActivity: settings.prayerActivity === true,
      testimonyReactions: settings.testimonyReactions === true,
      pushEnabled: settings.pushEnabled === true,
      [id]: value,
    });
  };

  const addReminder = () => {
    Alert.alert('Add Reminder', 'Custom reminders will be available in a future update.');
  };

  return (
    <ScreenScaffold scroll={false} pageContent style={styles.screen}>
      <AppHeader title="Reminders" subtitle="Stay consistent with prayer reminders." onBack={onBack} centered showLogo />
      <AsyncState loading={loading}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Heading level="eyebrow" style={styles.sectionLabel}>Daily Rhythm</Heading>
          {DAILY_REMINDERS.map((item) => {
            const Icon = item.icon;
            return (
              <GlassCard key={item.id} style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderIcon}>
                    <Icon size={20} color={colors.gold} />
                  </View>
                  <View style={styles.reminderMeta}>
                    <Heading level="h4">{item.title}</Heading>
                    <BodyText variant="caption">{item.time} · {item.schedule}</BodyText>
                  </View>
                </View>
                <ToggleRow
                  label="Enabled"
                  subtext={`Receive ${item.title.toLowerCase()} notifications`}
                  value={settings[item.id] === true}
                  onToggle={(value) => toggle(item.id, value)}
                  style={styles.toggleRow}
                />
              </GlassCard>
            );
          })}

          <SectionDivider style={styles.divider} />
          <Heading level="eyebrow" style={styles.sectionLabel}>Recurring Schedule</Heading>
          {RECURRING_SCHEDULE.map((item) => (
            <GlassCard key={item.title} style={styles.scheduleCard}>
              <View style={styles.scheduleRow}>
                <View style={styles.scheduleInfo}>
                  <BodyText variant="label">{item.title}</BodyText>
                  <BodyText variant="caption" style={styles.scheduleMeta}>
                    {item.time ? `${item.time} · ${item.schedule}` : item.schedule}
                  </BodyText>
                </View>
                <View style={styles.scheduleDot} />
              </View>
            </GlassCard>
          ))}

          <PrimaryButton label="Add Reminder" onPress={addReminder} icon={Plus} style={styles.addButton} />
        </ScrollView>
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: spacing.tabBar },
  sectionLabel: { marginBottom: spacing.md },
  reminderCard: { marginBottom: spacing.md },
  reminderHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
  },
  reminderMeta: { flex: 1 },
  toggleRow: { borderBottomWidth: 0, paddingBottom: 0 },
  divider: { marginVertical: spacing.lg },
  scheduleCard: { marginBottom: spacing.sm, paddingVertical: spacing.lg },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  scheduleInfo: { flex: 1 },
  scheduleMeta: { marginTop: 2 },
  scheduleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  addButton: { marginTop: spacing.xl },
});
