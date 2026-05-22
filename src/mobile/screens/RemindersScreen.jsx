import { FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../theme';
import { useNotificationSettings, updateNotificationSettings } from '../useNotificationSettings';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';
import AsyncState from '../components/AsyncState';

const REMINDER_SETTINGS = [
  { id: 'prayerActivity', title: 'Prayer activity', schedule: 'When someone prays or responds' },
  { id: 'testimonyReactions', title: 'Testimony reactions', schedule: 'When the community celebrates with you' },
  { id: 'pushEnabled', title: 'Push reminders', schedule: 'Device notifications for prayer moments' },
];

export default function RemindersScreen({ user }) {
  const { settings, loading } = useNotificationSettings(user?.uid, true);
  const data = REMINDER_SETTINGS.map((item) => ({
    ...item,
    enabled: settings[item.id] === true,
  }));

  const toggle = async (id, value) => {
    if (!user?.uid) return;
    await updateNotificationSettings(user.uid, {
      prayerActivity: settings.prayerActivity === true,
      testimonyReactions: settings.testimonyReactions === true,
      pushEnabled: settings.pushEnabled === true,
      [id]: value,
    });
  };

  return (
    <CinematicScreen>
      <PageHero scene="community" eyebrow="Habits" title="Reminders" subtitle="Stay consistent with prayer reminders." compact />
      <AsyncState loading={loading} empty={!loading && data.length === 0} emptyLabel="No reminders set.">
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState label="No reminders set." />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>{item.schedule}</Text>
              </View>
              <Switch
                value={item.enabled}
                onValueChange={(v) => toggle(item.id, v)}
                trackColor={{ false: 'rgba(248,243,234,0.2)', true: colors.gold }}
                thumbColor={item.enabled ? colors.ink : colors.ivory}
              />
            </View>
          )}
        />
      </AsyncState>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 8 },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', borderRadius: 18, padding: 14, backgroundColor: 'rgba(248,243,234,0.05)' },
  info: { flex: 1 },
  title: { color: colors.ivory, fontSize: 15, fontWeight: '700' },
  meta: { marginTop: 2, color: 'rgba(248,243,234,0.5)', fontSize: 12 },
});
