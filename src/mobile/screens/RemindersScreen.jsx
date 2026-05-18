import { useState, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';
import { mockReminders } from '../../data/mockData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';

const STORAGE_KEY = 'reminder-toggles';

export default function RemindersScreen() {
  const [toggles, setToggles] = useState({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value) setToggles(JSON.parse(value));
    }).catch(() => {});
  }, []);

  const toggle = async (id, value) => {
    const next = { ...toggles, [id]: value };
    setToggles(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const data = mockReminders.map((r) => ({
    ...r,
    enabled: toggles[`reminder-toggle:${r.id}`] !== undefined ? toggles[`reminder-toggle:${r.id}`] : r.enabled,
  }));

  return (
    <CinematicScreen>
      <PageHero scene="community" eyebrow="Habits" title="Reminders" subtitle="Stay consistent with prayer reminders." compact />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState label="No reminders set." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{item.time ? `${item.time} - ` : ''}{item.schedule}</Text>
            </View>
            <Switch
              value={item.enabled}
              onValueChange={(v) => toggle(`reminder-toggle:${item.id}`, v)}
              trackColor={{ false: 'rgba(248,243,234,0.2)', true: colors.gold }}
              thumbColor={item.enabled ? colors.ink : colors.ivory}
            />
          </View>
        )}
      />
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
