import { useEffect, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from '@firebase/auth';
import { auth } from '../firebase';
import {
  AvatarTooLargeError,
  getUploadErrorMessage,
  prepareAvatarBlob,
  uploadAvatarFile,
} from '../avatarUpload';
import { updateMyProfile } from '../api';
import { isMockDataEnabled } from '../mockData';
import { getCachedProfile, setCachedProfile } from '../profileCache';
import {
  cleanOptionalHandle,
  cleanOptionalPhotoURL,
  cleanOptionalProfileText,
  formatProfileHandleForSave,
  imageUriWithCacheBuster,
} from '../profileFields';
import { alpha, colors, fonts, sharedStyles, spacing } from '../theme';
import { useAuth } from '../AuthProvider';
import { useUserProfile } from '../useUsers';
import { error as logError } from '../logger';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';
import { getErrorMessage } from '../errors';

const BIO_MAX = 150;

export default function EditProfileScreen({ user, onBack, onDone }) {
  const { resetPassword, changePassword } = useAuth();
  const { profile } = useUserProfile(user?.uid, Boolean(user?.uid));
  const [name, setName] = useState(cleanOptionalProfileText(user?.displayName));
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState(cleanOptionalPhotoURL(user?.photoURL));
  const [photoVersion, setPhotoVersion] = useState('');
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const uploadControllerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => () => {
    mountedRef.current = false;
    uploadControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!profile) return;
    setName(cleanOptionalProfileText(profile.displayName) || cleanOptionalProfileText(user?.displayName));
    setBio(cleanOptionalProfileText(profile.bio));
    setHandle(cleanOptionalHandle(profile.handle));
    setPhotoURL(cleanOptionalPhotoURL(profile.photoURL) || cleanOptionalPhotoURL(user?.photoURL));
    setPhotoVersion(profile.updatedAt || '');
  }, [profile, user?.displayName, user?.photoURL]);

  useEffect(() => {
    setPhotoLoadFailed(false);
  }, [photoURL, photoVersion]);

  const cacheProfilePatch = (patch) => {
    if (!user?.uid) return;
    const cached = getCachedProfile(user.uid) || profile || {};
    setCachedProfile(user.uid, {
      ...cached,
      uid: user.uid,
      id: cached.id || user.uid,
      email: cached.email ?? user?.email ?? null,
      displayName: cleanOptionalProfileText(name) || cleanOptionalProfileText(cached.displayName) || cleanOptionalProfileText(user?.displayName) || null,
      ...patch,
    });
  };

  const applyPhotoUpdate = async (nextPhotoURL) => {
    const sanitizedPhotoURL = cleanOptionalPhotoURL(nextPhotoURL);
    if (!sanitizedPhotoURL) throw new Error('Could not upload your profile photo. Please try again.');
    const updatedAt = new Date().toISOString();
    cacheProfilePatch({ photoURL: sanitizedPhotoURL, updatedAt });
    if (mountedRef.current) {
      setPhotoURL(sanitizedPhotoURL);
      setPhotoVersion(updatedAt);
    }
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { photoURL: sanitizedPhotoURL });
      } catch (error) {
        logError('Auth profile photo sync failed', error);
      }
    }
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to update your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;

    setBusy(true);
    try {
      const asset = result.assets[0];
      if (isMockDataEnabled()) {
        const profileResult = await updateMyProfile({ photoURL: asset.uri });
        await applyPhotoUpdate(profileResult.profile?.photoURL || asset.uri);
        return;
      }
      uploadControllerRef.current?.abort();
      const controller = new AbortController();
      uploadControllerRef.current = controller;
      const prepared = await prepareAvatarBlob(asset.uri);
      const downloadUrl = await uploadAvatarFile(prepared, controller.signal);
      await applyPhotoUpdate(downloadUrl);
    } catch (error) {
      logError('Profile photo upload failed', error);
      if (error?.name === 'AbortError') return;
      if (error instanceof AvatarTooLargeError) {
        Alert.alert('Photo too large', getUploadErrorMessage(error));
        return;
      }
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
      displayName: cleanOptionalProfileText(profile?.displayName) || cleanOptionalProfileText(user?.displayName) || '',
      handle: formatProfileHandleForSave(profile?.handle),
      bio: cleanOptionalProfileText(profile?.bio) || null,
      photoURL: cleanOptionalPhotoURL(profile?.photoURL) || cleanOptionalPhotoURL(user?.photoURL) || null,
    };
    try {
      const nextHandle = formatProfileHandleForSave(handle);
      const nextBio = cleanOptionalProfileText(bio) || null;
      const nextPhotoURL = cleanOptionalPhotoURL(photoURL) || null;
      const result = await updateMyProfile({
        displayName: name.trim(),
        handle: nextHandle,
        bio: nextBio,
        photoURL: nextPhotoURL,
      });
      const savedProfile = result.profile || {
        ...previousProfile,
        displayName: name.trim(),
        handle: nextHandle,
        bio: nextBio,
        photoURL: nextPhotoURL,
      };
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, {
            displayName: cleanOptionalProfileText(savedProfile.displayName) || name.trim(),
            photoURL: cleanOptionalPhotoURL(savedProfile.photoURL) || null,
          });
        } catch (error) {
          await updateMyProfile(previousProfile).catch((rollbackError) => {
            logError('Profile rollback failed', rollbackError);
          });
          throw error;
        }
      }
      cacheProfilePatch({
        displayName: cleanOptionalProfileText(savedProfile.displayName) || name.trim(),
        handle: formatProfileHandleForSave(savedProfile.handle),
        bio: cleanOptionalProfileText(savedProfile.bio) || null,
        photoURL: cleanOptionalPhotoURL(savedProfile.photoURL) || null,
      });
      if (onDone) onDone();
      Alert.alert('Profile updated', 'Your profile has been saved.');
    } catch (error) {
      Alert.alert('Could not save', getErrorMessage(error));
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
      Alert.alert('Could not send reset email', getErrorMessage(error));
    }
  };

  const savePassword = async () => {
    if (passwordBusy) return;
    setPasswordBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Password updated', 'Your password has been changed.');
    } catch (error) {
      Alert.alert('Could not change password', getErrorMessage(error));
    } finally {
      setPasswordBusy(false);
    }
  };

  const displayHandle = cleanOptionalHandle(handle);
  const avatarUri = imageUriWithCacheBuster(photoURL, photoVersion);

  return (
    <ScreenScaffold pageContent scroll>
      <AppHeader centered showLogo title="Edit Profile" subtitle="Photo, identity, and bio." onBack={onBack} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <GlassCard style={styles.profileCard}>
          <Pressable disabled={busy} onPress={pickPhoto} style={styles.avatarButton} accessibilityRole="button" accessibilityLabel="Change profile photo">
            {avatarUri && !photoLoadFailed ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} onError={() => setPhotoLoadFailed(true)} />
            ) : (
              <View style={styles.avatarFallback}>
                <Camera size={28} color={colors.ink} />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Camera size={14} color={colors.ink} />
            </View>
          </Pressable>
          <BodyText variant="caption" style={styles.avatarHint}>Tap to change profile photo</BodyText>

          <Heading level="eyebrow" style={styles.fieldLabel}>Display Name</Heading>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            style={styles.input}
            placeholderTextColor={colors.ink3}
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
              placeholderTextColor={colors.ink3}
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
            placeholderTextColor={colors.ink3}
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
            placeholderTextColor={colors.ink3}
          />
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            secureTextEntry
            style={styles.input}
            placeholderTextColor={colors.ink3}
          />
          <PrimaryButton label="Change Password" onPress={savePassword} busy={passwordBusy} disabled={passwordBusy} style={styles.saveButton} />
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
    backgroundColor: colors.surface2,
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
    backgroundColor: colors.night2,
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
  handlePrefix: { color: colors.ink3 },
  handleInput: { flex: 1, color: colors.ink, fontFamily: fonts.sans, fontSize: 15, paddingVertical: spacing.md },
  textArea: { ...sharedStyles.textArea, minHeight: 100 },
  charCount: { marginTop: spacing.xs, textAlign: 'right' },
  saveButton: { marginTop: spacing.xl },
  sectionTitle: { marginBottom: spacing.md },
  outlineButton: { marginBottom: spacing.sm },
});
