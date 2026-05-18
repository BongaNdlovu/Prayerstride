import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { addPrayer } from '../usePrayerData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function CreatePrayerScreen({ user }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing details', 'Add a title and prayer request.');
      return;
    }

    setBusy(true);
    try {
      await addPrayer({ title: title.trim(), body: body.trim() }, user);
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
  button: { marginTop: 20, minHeight: 52, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
});
