import { useEffect, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from '@firebase/auth';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { alpha, colors, fonts, sharedStyles, spacing } from '../theme';
import { useAuth } from '../AuthProvider';
import { useUserProfile } from '../useUsers';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';

const BIO_MAX = 150;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function normalizeHandle(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const handle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  return handle.slice(0, 40);
}

function getUploadErrorMessage(error) {
  if (error?.code === 'storage/quota-exceeded' || /quota.*exceeded/i.test(error?.message || '')) {
    return 'Profile photo uploads are temporarily unavailable because storage capacity has been reached. You can still save your profile details and try the photo again later.';
  }
  if (error?.code === 'storage/unauthorized') {
    return 'This photo could not be uploaded. Choose an image smaller than 2 MB and try again.';
  }
  return error?.message || 'This photo could not be uploaded. Please try again.';
}

export default function EditProfileScreen({ user, onBack, onDone }) {
  const { resetPassword, changePassword } = useAuth();
  const { profile } = useUserProfile(user?.uid, Boolean(user?.uid));
  const [name, setName] = useState(user?.displayName || '');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const uploadControllerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => () => {
    mountedRef.current = false;
    uploadControllerRef.current?.abort();
  }, []);

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
      uploadControllerRef.current?.abort();
      const controller = new AbortController();
      uploadControllerRef.current = controller;
      const response = await fetch(asset.uri, { signal: controller.signal });
      const blob = await response.blob();
      if (blob.size >= MAX_AVATAR_BYTES) {
        Alert.alert('Photo too large', 'Choose an image smaller than 2 MB and try again.');
        return;
      }
      const fileRef = ref(storage, `avatars/${user.uid}/profile.jpg`);
      await uploadBytes(fileRef, blob, { contentType: blob.type || 'image/jpeg' });
      const downloadUrl = await getDownloadURL(fileRef);
      if (mountedRef.current) setPhotoURL(downloadUrl);
    } catch (error) {
      if (error?.name === 'AbortError') return;
      Alert.alert('Upload failed', getUploadErrorMessage(error));
    } finally {
      uploadControllerRef.current = null;
      if (mountedRef.current) setBusy(false);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Enter your display name.');
      return;
    }
    setBusy(true);
    const previousProfile = {
      displayName: profile?.displayName || user?.displayName || '',
      handle: profile?.handle || null,
      bio: profile?.bio || null,
      photoURL: profile?.photoURL || user?.photoURL || null,
    };
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: name.trim(),
        handle: normalizeHandle(handle),
        bio: bio.trim() || null,
        photoURL: photoURL || null,
        updatedAt: serverTimestamp(),
      });
      try {
        await updateProfile(auth.currentUser, {
          displayName: name.trim(),
          photoURL: photoURL || null,
        });
      } catch (error) {
        await updateDoc(doc(db, 'users', user.uid), {
          ...previousProfile,
          updatedAt: serverTimestamp(),
        }).catch(() => {});
        throw error;
      }
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

  const displayHandle = handle.startsWith('@') ? handle.slice(1) : handle;

  return (
    <ScreenScaffold pageContent scroll>
      <AppHeader centered showLogo title="Edit Profile" subtitle="Photo, identity, and bio." onBack={onBack} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <GlassCard style={styles.profileCard}>
          <Pressable disabled={busy} onPress={pickPhoto} style={styles.avatarButton} accessibilityRole="button" accessibilityLabel="Change profile photo">
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Camera size={28} color={colors.navy} />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Camera size={14} color={colors.textPrimary} />
            </View>
          </Pressable>
          <BodyText variant="caption" style={styles.avatarHint}>Tap to change profile photo</BodyText>

          <Heading level="eyebrow" style={styles.fieldLabel}>Display Name</Heading>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />

          <Heading level="eyebrow" style={styles.fieldLabel}>Username</Heading>
          <View style={styles.handleRow}>
            <BodyText variant="body" style={styles.handlePrefix}>@</BodyText>
            <TextInput
              value={displayHandle}
              onChangeText={(value) => setHandle(value.replace(/^@/, ''))}
              placeholder="username"
              autoCapitalize="none"
              style={styles.handleInput}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Heading level="eyebrow" style={styles.fieldLabel}>Bio</Heading>
          <TextInput
            value={bio}
            onChangeText={(value) => setBio(value.slice(0, BIO_MAX))}
            placeholder="Tell us about yourself..."
            multiline
            maxLength={BIO_MAX}
            style={[styles.input, styles.textArea]}
            placeholderTextColor={colors.textMuted}
          />
          <BodyText variant="caption" style={styles.charCount}>{bio.length}/{BIO_MAX}</BodyText>

          <PrimaryButton label="Save Profile" onPress={save} busy={busy} disabled={busy} style={styles.saveButton} />
        </GlassCard>

        <GlassCard>
          <Heading level="h4" style={styles.sectionTitle}>Password</Heading>
          <PrimaryButton label="Send password reset email" onPress={requestPasswordReset} variant="ghost" style={styles.outlineButton} />
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            secureTextEntry
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            secureTextEntry
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
          <PrimaryButton label="Change Password" onPress={savePassword} style={styles.saveButton} />
        </GlassCard>
      </KeyboardAvoidingView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  profileCard: { marginBottom: spacing.lg },
  avatarButton: { alignSelf: 'center', marginBottom: spacing.sm },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warm,
  },
  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navyMid,
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarHint: { textAlign: 'center', marginBottom: spacing.lg },
  fieldLabel: { marginTop: spacing.lg, marginBottom: spacing.sm },
  input: { ...sharedStyles.input, marginTop: 0 },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    ...sharedStyles.input,
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  handlePrefix: { color: colors.textMuted },
  handleInput: { flex: 1, color: colors.textPrimary, fontFamily: fonts.sans, fontSize: 15, paddingVertical: spacing.md },
  textArea: { ...sharedStyles.textArea, minHeight: 100 },
  charCount: { marginTop: spacing.xs, textAlign: 'right' },
  saveButton: { marginTop: spacing.xl },
  sectionTitle: { marginBottom: spacing.md },
  outlineButton: { marginBottom: spacing.sm },
});
