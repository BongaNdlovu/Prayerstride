import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { addPrayer } from '../usePrayerData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function CreatePrayerScreen({ user }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [privacy, setPrivacy] = useState('community');
  const [prayerLimit, setPrayerLimit] = useState('daily');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing details', 'Add a title and prayer request.');
      return;
    }

    setBusy(true);
    try {
      await addPrayer({ title: title.trim(), body: body.trim(), privacy, prayerLimit }, user);
      setTitle('');
      setBody('');
      Alert.alert('Prayer shared', 'Your request is now in the community feed.');
    } catch (error) {
      Alert.alert('Could not share prayer', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CinematicScreen pageContent>
      <PageHero scene="dawn" eyebrow="Create" title="Share a prayer with care" subtitle="Name the need, keep it clear, and invite the community to walk with you." compact />
      <View style={styles.card}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Prayer title" style={styles.input} placeholderTextColor="rgba(248,243,234,0.56)" />
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="What should people pray for?"
          multiline
          style={[styles.input, styles.textArea]}
          placeholderTextColor="rgba(248,243,234,0.56)"
        />
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
        <Pressable disabled={busy} onPress={submit} style={styles.button}>
          <Text style={styles.buttonText}>{busy ? 'Sharing...' : 'Share Prayer'}</Text>
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
  button: { marginTop: 20, minHeight: 52, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
});
