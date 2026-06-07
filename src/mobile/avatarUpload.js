import * as ImageManipulator from 'expo-image-manipulator';
import { uploadMyAvatar } from './api';
import { AvatarReadError, AvatarTooLargeError } from './avatarUploadErrors';

export { AvatarTooLargeError, getUploadErrorMessage } from './avatarUploadErrors';

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const AVATAR_CONTENT_TYPE = 'image/jpeg';

function isReactNativeRuntime() {
  return globalThis.navigator?.product === 'ReactNative';
}

function readBlobWithXhr(uri) {
  if (typeof XMLHttpRequest !== 'function') {
    return Promise.reject(new AvatarReadError());
  }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new AvatarReadError());
    xhr.onabort = () => reject(new AvatarReadError());
    xhr.responseType = 'blob';
    xhr.open('GET', uri);
    xhr.send();
  });
}

async function readBlobFromUri(uri) {
  try {
    const response = await fetch(uri);
    return await response.blob();
  } catch {
    return readBlobWithXhr(uri);
  }
}

export async function prepareAvatarBlob(assetUri) {
  const manipulated = await ImageManipulator.manipulateAsync(
    assetUri,
    [{ resize: { width: 512 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
  );
  if (isReactNativeRuntime()) {
    return { uri: manipulated.uri, type: AVATAR_CONTENT_TYPE };
  }
  const rawBlob = await readBlobFromUri(manipulated.uri);
  if (!rawBlob || typeof rawBlob.size !== 'number') {
    throw new AvatarReadError();
  }
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
