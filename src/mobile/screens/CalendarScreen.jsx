import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { alpha, colors, fonts, sharedStyles, spacing } from '../theme';
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
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import AsyncState from '../components/AsyncState';
import { getErrorMessage } from '../errors';

export default function CalendarScreen({ user, onBack }) {
  const { events, bookmarkedDateKeys, loading, error, retry } = useCalendarEvents(user?.uid, Boolean(user?.uid));
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dateKey, setDateKey] = useState(toDateKey());
  const [editingId, setEditingId] = useState(null);
  const [editingTimes, setEditingTimes] = useState({ startsAt: null, endsAt: null });
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
    setEditingTimes({ startsAt: null, endsAt: null });
  };

  const saveEvent = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Add a title for this calendar event.');
      return;
    }
    setBusy(true);
    try {
      if (editingId) {
        await updateCalendarEvent(editingId, { title, notes, dateKey, ...editingTimes });
      } else {
        await createCalendarEvent({ title, notes, dateKey, startsAt: null, endsAt: null }, user);
      }
      resetForm();
    } catch (err) {
      Alert.alert('Could not save', getErrorMessage(err));
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
          Alert.alert('Could not delete', getErrorMessage(err));
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
      Alert.alert('Bookmark failed', getErrorMessage(err));
    }
  };

  return (
    <ScreenScaffold scroll={false} style={styles.shell}>
      <AppHeader title="Your rhythm" subtitle="Personal prayer events and bookmarked dates." onBack={onBack} />
      <AsyncState loading={loading} error={error} onRetry={retry} empty={false}>
      <FlatList
        data={sortedEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={(
          <GlassCard style={styles.formCard}>
            <BodyText variant="label" style={styles.fieldLabel}>Date (YYYY-MM-DD)</BodyText>
            <TextInput value={dateKey} onChangeText={setDateKey} style={styles.input} placeholderTextColor={colors.textMuted} />
            <TextInput value={title} onChangeText={setTitle} placeholder="Event title" style={styles.input} placeholderTextColor={colors.textMuted} />
            <TextInput value={notes} onChangeText={setNotes} placeholder="Notes (optional)" multiline style={[styles.input, styles.textArea]} placeholderTextColor={colors.textMuted} />
            <View style={styles.row}>
              <PrimaryButton
                label={busy ? 'Saving...' : editingId ? 'Update Event' : 'Add Event'}
                onPress={saveEvent}
                disabled={busy}
                busy={busy}
                style={styles.primaryBtn}
              />
              <PrimaryButton
                label={bookmarkedDateKeys.has(dateKey) ? 'Unbookmark' : 'Bookmark date'}
                onPress={toggleBookmark}
                variant="ghost"
                style={styles.outlineBtn}
              />
            </View>
            {editingId ? (
              <Pressable onPress={resetForm} style={styles.linkButton}>
                <BodyText variant="small" style={styles.linkText}>Cancel edit</BodyText>
              </Pressable>
            ) : null}
          </GlassCard>
        )}
        ListEmptyComponent={(
          <GlassCard>
            <BodyText variant="body">No calendar events yet.</BodyText>
          </GlassCard>
        )}
        renderItem={({ item }) => (
          <GlassCard style={styles.eventCard}>
            <View style={styles.eventRow}>
              <Heading level="h4" style={styles.date}>{formatDateKeyLabel(item.dateKey)}</Heading>
              <View style={styles.info}>
                <BodyText variant="label">{item.title}</BodyText>
                <BodyText variant="caption">
                  {formatEventTime(item.startsAt) || 'All day'}
                  {item.notes ? ` · ${item.notes}` : ''}
                  {bookmarkedDateKeys.has(item.dateKey) ? ' · Bookmarked' : ''}
                </BodyText>
              </View>
            </View>
            <View style={styles.actions}>
              <PrimaryButton
                label="Edit"
                onPress={() => { setEditingId(item.id); setTitle(item.title); setNotes(item.notes || ''); setDateKey(item.dateKey); setEditingTimes({ startsAt: item.startsAt, endsAt: item.endsAt }); }}
                style={styles.smallBtn}
                textStyle={styles.smallBtnText}
              />
              <PrimaryButton label="Delete" onPress={() => removeEvent(item)} variant="ghost" style={styles.smallBtnOutline} />
            </View>
          </GlassCard>
        )}
      />
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.tabBar, gap: spacing.md },
  formCard: { marginBottom: spacing.md },
  fieldLabel: { marginBottom: spacing.xs },
  input: { ...sharedStyles.input, marginTop: spacing.sm },
  textArea: { ...sharedStyles.textArea, minHeight: 72 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  primaryBtn: { flex: 1, minWidth: 140 },
  outlineBtn: { flex: 1, minWidth: 140 },
  linkButton: { alignSelf: 'flex-start', marginTop: spacing.sm, paddingVertical: spacing.xs },
  linkText: { color: colors.gold, fontFamily: fonts.sansSemiBold },
  eventCard: { marginBottom: 0 },
  eventRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  date: { color: colors.gold, minWidth: 56 },
  info: { flex: 1, minWidth: 140 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  smallBtn: { flex: 1, minHeight: 40 },
  smallBtnText: { fontSize: 13 },
  smallBtnOutline: { flex: 1, minHeight: 40 },
});
