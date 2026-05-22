import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from '@firebase/auth';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { colors } from '../theme';
import { useAuth } from '../AuthProvider';
import { useUserProfile } from '../useUsers';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import MotionPressable from '../components/MotionPressable';

function normalizeHandle(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const handle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  return handle.slice(0, 40);
}

export default function EditProfileScreen({ user, onDone }) {
  const { resetPassword, changePassword } = useAuth();
  const { profile } = useUserProfile(user?.uid, Boolean(user?.uid));
  const [name, setName] = useState(user?.displayName || '');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setBio(profile.bio || '');
    setHandle(profile.handle || '');
    setPhotoURL(profile.photoURL || user?.photoURL || '');
  }, [profile, user?.photoURL]);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to update your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;

    setBusy(true);
    try {
      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const fileRef = ref(storage, `avatars/${user.uid}/profile.jpg`);
      await uploadBytes(fileRef, blob, { contentType: blob.type || 'image/jpeg' });
      const downloadUrl = await getDownloadURL(fileRef);
      setPhotoURL(downloadUrl);
    } catch (error) {
      Alert.alert('Upload failed', error.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Enter your display name.');
      return;
    }
    setBusy(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: name.trim(),
        photoURL: photoURL || null,
      });
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: name.trim(),
        handle: normalizeHandle(handle),
        bio: bio.trim() || null,
        photoURL: photoURL || null,
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

  const requestPasswordReset = async () => {
    if (!user?.email) {
      Alert.alert('No email', 'This account does not have an email address.');
      return;
    }
    try {
      await resetPassword(user.email);
      Alert.alert('Email sent', 'Check your inbox for password reset instructions.');
    } catch (error) {
      Alert.alert('Could not send reset email', error.message);
    }
  };

  const savePassword = async () => {
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Password updated', 'Your password has been changed.');
    } catch (error) {
      Alert.alert('Could not change password', error.message);
    }
  };

  return (
    <CinematicScreen pageContent>
      <PageHero scene="community" eyebrow="Edit" title="Your profile" subtitle="Photo, identity, bio, and password." compact />
      <View style={styles.card}>
        <MotionPressable onPress={pickPhoto} style={styles.avatarButton}>
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{(name || 'P').slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
        </MotionPressable>
        <Text style={styles.avatarHint}>Tap to change profile photo</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Display name" style={styles.input} placeholderTextColor="rgba(248,243,234,0.56)" />
        <TextInput value={handle} onChangeText={setHandle} placeholder="@username" autoCapitalize="none" style={styles.input} placeholderTextColor="rgba(248,243,234,0.56)" />
        <TextInput value={bio} onChangeText={setBio} placeholder="Bio" multiline style={[styles.input, styles.textArea]} placeholderTextColor="rgba(248,243,234,0.56)" />
        <MotionPressable disabled={busy} onPress={save} style={styles.button}>
          <Text style={styles.buttonText}>{busy ? 'Saving...' : 'Save Profile'}</Text>
        </MotionPressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Password</Text>
        <MotionPressable onPress={requestPasswordReset} style={styles.outlineButton}>
          <Text style={styles.outlineText}>Send password reset email</Text>
        </MotionPressable>
        <TextInput value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" secureTextEntry style={styles.input} placeholderTextColor="rgba(248,243,234,0.56)" />
        <TextInput value={newPassword} onChangeText={setNewPassword} placeholder="New password" secureTextEntry style={styles.input} placeholderTextColor="rgba(248,243,234,0.56)" />
        <MotionPressable onPress={savePassword} style={styles.button}>
          <Text style={styles.buttonText}>Change Password</Text>
        </MotionPressable>
      </View>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18, marginBottom: 16 },
  avatarButton: { alignSelf: 'center', marginBottom: 8 },
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand },
  avatarText: { color: colors.navy, fontSize: 32, fontWeight: '800' },
  avatarHint: { textAlign: 'center', color: 'rgba(248,243,234,0.55)', fontSize: 12, marginBottom: 12 },
  sectionTitle: { color: colors.ivory, fontSize: 16, fontWeight: '800', marginBottom: 10 },
  input: { marginTop: 12, minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', paddingHorizontal: 16, color: colors.ivory, fontSize: 15 },
  textArea: { minHeight: 100, paddingTop: 16, textAlignVertical: 'top' },
  button: { marginTop: 20, minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  outlineButton: { minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(248,243,234,0.2)', marginBottom: 8 },
  outlineText: { color: colors.ivory, fontSize: 14, fontWeight: '700' },
});
