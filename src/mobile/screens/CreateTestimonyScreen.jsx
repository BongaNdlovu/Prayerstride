import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { addTestimony, usePrayers } from '../usePrayerData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';

export default function CreateTestimonyScreen({ user, linkedPrayerId, onDone }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [prayerId, setPrayerId] = useState(linkedPrayerId || null);
  const [busy, setBusy] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const { prayers } = usePrayers(true, { userId: user?.uid });
  const myPrayers = prayers.filter((p) => p.authorUid === user?.uid && p.status === 'active');

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing details', 'Add a title and testimony.');
      return;
    }
    setBusy(true);
    try {
      await addTestimony({ title: title.trim(), body: body.trim(), prayerId, shared: true }, user);
      setTitle('');
      setBody('');
      setPrayerId(null);
      if (onDone) onDone();
      Alert.alert('Testimony shared', 'Your praise report is now in the community feed.');
    } catch (error) {
      Alert.alert('Could not share testimony', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CinematicScreen pageContent>
      <PageHero scene="answered" eyebrow="Testimony" title="Share what God has done" subtitle="Your story of answered prayer encourages the whole community." compact />
      <View style={styles.card}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Testimony title" style={styles.input} placeholderTextColor="rgba(248,243,234,0.56)" />
        <TextInput value={body} onChangeText={setBody} placeholder="Tell your story..." multiline style={[styles.input, styles.textArea]} placeholderTextColor="rgba(248,243,234,0.56)" />
        <Pressable onPress={() => setShowPicker(!showPicker)} style={styles.pickerButton}>
          <Text style={styles.pickerText}>{prayerId ? `Linked to: ${myPrayers.find((p) => p.id === prayerId)?.title || 'Prayer'}` : 'Link to a prayer (optional)'}</Text>
        </Pressable>
        {showPicker ? (
          <FlatList
            data={[{ id: null, title: 'No linked prayer' }, ...myPrayers]}
            keyExtractor={(item) => item.id || 'none'}
            style={styles.pickerList}
            ListEmptyComponent={<EmptyState label="No active prayers to link." />}
            renderItem={({ item }) => (
              <Pressable onPress={() => { setPrayerId(item.id); setShowPicker(false); }} style={styles.pickerItem}>
                <Text style={[styles.pickerItemText, prayerId === item.id && { color: colors.gold }]}>{item.title}</Text>
              </Pressable>
            )}
          />
        ) : null}
        <Pressable disabled={busy} onPress={submit} style={styles.button}>
          <Text style={styles.buttonText}>{busy ? 'Sharing...' : 'Share Testimony'}</Text>
        </Pressable>
      </View>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18 },
  input: { marginTop: 12, minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', paddingHorizontal: 16, color: colors.ivory, fontSize: 15 },
  textArea: { minHeight: 150, paddingTop: 16, textAlignVertical: 'top' },
  button: { marginTop: 20, minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  pickerButton: { marginTop: 12, minHeight: 44, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.08)', paddingHorizontal: 14, justifyContent: 'center' },
  pickerText: { color: 'rgba(248,243,234,0.62)', fontSize: 14 },
  pickerList: { maxHeight: 200, marginTop: 8, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', backgroundColor: 'rgba(8,11,19,0.95)', overflow: 'hidden' },
  pickerItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(248,243,234,0.08)' },
  pickerItemText: { color: 'rgba(248,243,234,0.72)', fontSize: 14 },
});
