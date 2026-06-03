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
  const blob = await response.blob();
  if (blob.size >= MAX_AVATAR_BYTES) {
    throw new AvatarTooLargeError();
  }
  return { uri: manipulated.uri, blob };
}

export async function uploadAvatarFile(file, signal) {
  const result = await uploadMyAvatar(file, signal);
  return result.photoURL || result.profile?.photoURL;
}
