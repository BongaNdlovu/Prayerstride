import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { updatePrayer, deletePrayer } from '../usePrayerData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function EditRequestScreen({ prayer, user, onDone }) {
  const [title, setTitle] = useState(prayer?.title || '');
  const [body, setBody] = useState(prayer?.body || '');
  const [privacy, setPrivacy] = useState(prayer?.privacy || 'community');
  const [prayerLimit, setPrayerLimit] = useState(prayer?.prayerLimit || 'daily');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing details', 'Add a title and prayer request.');
      return;
    }
    setBusy(true);
    try {
      await updatePrayer(prayer.id, { title: title.trim(), body: body.trim(), privacy, prayerLimit });
      if (onDone) onDone();
    } catch (error) {
      Alert.alert('Could not save', error.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    Alert.alert('Delete prayer', 'Are you sure you want to delete this prayer request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deletePrayer(prayer.id);
            if (onDone) onDone();
          } catch (error) {
            Alert.alert('Could not delete', error.message);
          }
        },
      },
    ]);
  };

  return (
    <CinematicScreen pageContent>
      <PageHero scene="dawn" eyebrow="Edit" title="Update your request" subtitle="Keep the community informed about your prayer needs." compact />
      <View style={styles.card}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Prayer title" style={styles.input} placeholderTextColor="rgba(248,243,234,0.56)" />
        <TextInput value={body} onChangeText={setBody} placeholder="What should people pray for?" multiline style={[styles.input, styles.textArea]} placeholderTextColor="rgba(248,243,234,0.56)" />
        <View style={styles.segmented}>
          {[
            ['community', 'Community'],
            ['private', 'Only me'],
          ].map(([value, label]) => (
            <Pressable key={value} onPress={() => setPrivacy(value)} style={[styles.segment, privacy === value && styles.segmentActive]}>
              <Text style={[styles.segmentText, privacy === value && styles.segmentTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.segmented}>
          {[
            ['daily', 'Daily'],
            ['once', 'Once'],
          ].map(([value, label]) => (
            <Pressable key={value} onPress={() => setPrayerLimit(value)} style={[styles.segment, prayerLimit === value && styles.segmentActive]}>
              <Text style={[styles.segmentText, prayerLimit === value && styles.segmentTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.helperText}>{prayerLimit === 'once' ? 'Each person can pray for this once.' : 'Each person can pray for this once per day.'}</Text>
        <Pressable disabled={busy} onPress={save} style={styles.button}>
          <Text style={styles.buttonText}>{busy ? 'Saving...' : 'Save Changes'}</Text>
        </Pressable>
        <Pressable onPress={remove} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete Prayer</Text>
        </Pressable>
      </View>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18 },
  input: { marginTop: 12, minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', paddingHorizontal: 16, color: colors.ivory, fontSize: 15 },
  textArea: { minHeight: 150, paddingTop: 16, textAlignVertical: 'top' },
  segmented: { marginTop: 12, minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.08)', padding: 4, flexDirection: 'row', gap: 4 },
  segment: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: 'rgba(200,137,43,0.22)' },
  segmentText: { color: 'rgba(248,243,234,0.62)', fontSize: 13, fontWeight: '800' },
  segmentTextActive: { color: colors.gold },
  helperText: { marginTop: 8, color: 'rgba(248,243,234,0.56)', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  button: { marginTop: 20, minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  deleteButton: { marginTop: 14, minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(200,137,43,0.3)', backgroundColor: 'rgba(200,137,43,0.08)' },
  deleteText: { color: colors.gold, fontSize: 15, fontWeight: '700' },
});
