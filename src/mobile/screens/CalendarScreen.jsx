import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import {
  bookmarkDate,
  createCalendarEvent,
  deleteCalendarEvent,
  formatDateKeyLabel,
  formatEventTime,
  toDateKey,
  unbookmarkDate,
  updateCalendarEvent,
  useCalendarEvents,
} from '../useCalendarEvents';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import AsyncState from '../components/AsyncState';
import MotionPressable from '../components/MotionPressable';

export default function CalendarScreen({ user }) {
  const { events, bookmarkedDateKeys, loading, error } = useCalendarEvents(user?.uid, Boolean(user?.uid));
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dateKey, setDateKey] = useState(toDateKey());
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.dateKey.localeCompare(b.dateKey)),
    [events],
  );

  const resetForm = () => {
    setTitle('');
    setNotes('');
    setDateKey(toDateKey());
    setEditingId(null);
  };

  const saveEvent = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Add a title for this calendar event.');
      return;
    }
    setBusy(true);
    try {
      if (editingId) {
        await updateCalendarEvent(editingId, { title, notes, dateKey, startsAt: null, endsAt: null });
      } else {
        await createCalendarEvent({ title, notes, dateKey, startsAt: null, endsAt: null }, user);
      }
      resetForm();
    } catch (err) {
      Alert.alert('Could not save', err.message);
    } finally {
      setBusy(false);
    }
  };

  const removeEvent = (event) => {
    Alert.alert('Delete event', `Remove "${event.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteCalendarEvent(event.id);
          if (editingId === event.id) resetForm();
        } catch (err) {
          Alert.alert('Could not delete', err.message);
        }
      }},
    ]);
  };

  const toggleBookmark = async () => {
    try {
      if (bookmarkedDateKeys.has(dateKey)) {
        await unbookmarkDate(dateKey, user);
      } else {
        await bookmarkDate(dateKey, user);
      }
    } catch (err) {
      Alert.alert('Bookmark failed', err.message);
    }
  };

  return (
    <CinematicScreen>
      <PageHero scene="community" eyebrow="Calendar" title="Your rhythm" subtitle="Personal prayer events and bookmarked dates." compact />
      <View style={styles.formCard}>
        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput value={dateKey} onChangeText={setDateKey} style={styles.input} placeholderTextColor="rgba(248,243,234,0.5)" />
        <TextInput value={title} onChangeText={setTitle} placeholder="Event title" style={styles.input} placeholderTextColor="rgba(248,243,234,0.5)" />
        <TextInput value={notes} onChangeText={setNotes} placeholder="Notes (optional)" multiline style={[styles.input, styles.textArea]} placeholderTextColor="rgba(248,243,234,0.5)" />
        <View style={styles.row}>
          <MotionPressable disabled={busy} onPress={saveEvent} style={styles.primaryButton}>
            <Text style={styles.primaryText}>{busy ? 'Saving...' : editingId ? 'Update Event' : 'Add Event'}</Text>
          </MotionPressable>
          <MotionPressable onPress={toggleBookmark} style={styles.outlineButton}>
            <Text style={styles.outlineText}>{bookmarkedDateKeys.has(dateKey) ? 'Unbookmark' : 'Bookmark date'}</Text>
          </MotionPressable>
        </View>
        {editingId ? (
          <MotionPressable onPress={resetForm} style={styles.linkButton}>
            <Text style={styles.linkText}>Cancel edit</Text>
          </MotionPressable>
        ) : null}
      </View>
      <AsyncState loading={loading} error={error} empty={!loading && !error && sortedEvents.length === 0} emptyLabel="No calendar events yet.">
        <FlatList
          data={sortedEvents}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.date}>{formatDateKeyLabel(item.dateKey)}</Text>
              <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>
                  {formatEventTime(item.startsAt) || 'All day'}
                  {item.notes ? ` · ${item.notes}` : ''}
                  {bookmarkedDateKeys.has(item.dateKey) ? ' · Bookmarked' : ''}
                </Text>
              </View>
              <View style={styles.actions}>
                <MotionPressable onPress={() => { setEditingId(item.id); setTitle(item.title); setNotes(item.notes || ''); setDateKey(item.dateKey); }} style={styles.smallBtn}>
                  <Text style={styles.smallBtnText}>Edit</Text>
                </MotionPressable>
                <MotionPressable onPress={() => removeEvent(item)} style={styles.smallBtnOutline}>
                  <Text style={styles.smallBtnTextOutline}>Delete</Text>
                </MotionPressable>
              </View>
            </View>
          )}
        />
      </AsyncState>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  formCard: { marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', borderRadius: 18, padding: 14, backgroundColor: 'rgba(248,243,234,0.05)', gap: 8 },
  label: { color: 'rgba(248,243,234,0.62)', fontSize: 12, fontWeight: '700' },
  input: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.08)', paddingHorizontal: 14, color: colors.ivory, fontSize: 14 },
  textArea: { minHeight: 72, paddingTop: 12, textAlignVertical: 'top' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  primaryButton: { minHeight: 44, paddingHorizontal: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  primaryText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  outlineButton: { minHeight: 44, paddingHorizontal: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(248,243,234,0.2)' },
  outlineText: { color: colors.ivory, fontSize: 13, fontWeight: '700' },
  linkButton: { alignSelf: 'flex-start', paddingVertical: 6 },
  linkText: { color: colors.gold, fontSize: 13, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
  card: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', borderRadius: 18, padding: 14, backgroundColor: 'rgba(248,243,234,0.05)' },
  date: { color: colors.gold, fontSize: 14, fontWeight: '800', minWidth: 56 },
  info: { flex: 1, minWidth: 140 },
  title: { color: colors.ivory, fontSize: 15, fontWeight: '700' },
  meta: { marginTop: 2, color: 'rgba(248,243,234,0.5)', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8, width: '100%' },
  smallBtn: { minHeight: 36, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  smallBtnText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  smallBtnOutline: { minHeight: 36, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(248,243,234,0.2)' },
  smallBtnTextOutline: { color: colors.ivory, fontSize: 12, fontWeight: '700' },
});
