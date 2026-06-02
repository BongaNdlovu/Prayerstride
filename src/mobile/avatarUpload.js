import * as ImageManipulator from 'expo-image-manipulator';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
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
  return blob;
}

export function uploadAvatarBlob(storage, uid, blob, signal) {
  const fileRef = ref(storage, `avatars/${uid}/profile.jpg`);
  const task = uploadBytesResumable(fileRef, blob, { contentType: AVATAR_CONTENT_TYPE });

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      task.cancel();
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
    }

    task.on(
      'state_changed',
      null,
      (error) => {
        if (signal) signal.removeEventListener('abort', onAbort);
        reject(error);
      },
      async () => {
        if (signal) signal.removeEventListener('abort', onAbort);
        resolve(getDownloadURL(fileRef));
      },
    );
  });
}
