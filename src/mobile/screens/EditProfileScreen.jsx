import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { updateProfile } from '@firebase/auth';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { colors } from '../theme';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function EditProfileScreen({ user, onDone }) {
  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Enter your display name.');
      return;
    }
    setBusy(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: name.trim(),
        bio: bio.trim() || null,
        updatedAt: serverTimestamp(),
      });
      if (onDone) onDone();
      Alert.alert('Profile updated', 'Your profile has been saved.');
    } catch (error) {
      Alert.alert('Could not save', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CinematicScreen pageContent>
      <PageHero scene="community" eyebrow="Edit" title="Your profile" subtitle="Update your name and bio." compact />
      <View style={styles.card}>
        <TextInput value={name} onChangeText={setName} placeholder="Display name" style={styles.input} placeholderTextColor="rgba(248,243,234,0.56)" />
        <TextInput value={bio} onChangeText={setBio} placeholder="Bio" multiline style={[styles.input, styles.textArea]} placeholderTextColor="rgba(248,243,234,0.56)" />
        <Pressable disabled={busy} onPress={save} style={styles.button}>
          <Text style={styles.buttonText}>{busy ? 'Saving...' : 'Save Profile'}</Text>
        </Pressable>
      </View>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18 },
  input: { marginTop: 12, minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', paddingHorizontal: 16, color: colors.ivory, fontSize: 15 },
  textArea: { minHeight: 100, paddingTop: 16, textAlignVertical: 'top' },
  button: { marginTop: 20, minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
});
