import * as ImageManipulator from 'expo-image-manipulator';
import { uploadMyAvatar } from './api';
import { AvatarTooLargeError } from './avatarUploadErrors';

export { AvatarTooLargeError, getUploadErrorMessage } from './avatarUploadErrors';

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const AVATAR_CONTENT_TYPE = 'image/jpeg';

export async function prepareAvatarBlob(assetUri) {
  const manipulated = await ImageManipulator.manipulateAsync(
    assetUri,
    [{ resize: { width: 512 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
  );
  const response = await fetch(manipulated.uri);
  const rawBlob = await response.blob();
  const blob = rawBlob.type === AVATAR_CONTENT_TYPE
    ? rawBlob
    : typeof rawBlob.slice === 'function'
      ? rawBlob.slice(0, rawBlob.size, AVATAR_CONTENT_TYPE)
      : new Blob([rawBlob], { type: AVATAR_CONTENT_TYPE });
  if (blob.size >= MAX_AVATAR_BYTES) {
    throw new AvatarTooLargeError();
  }
  return { uri: manipulated.uri, blob, type: AVATAR_CONTENT_TYPE };
}

export async function uploadAvatarFile(file, signal) {
  const result = await uploadMyAvatar(file, signal);
  return result.photoURL || result.profile?.photoURL;
}
