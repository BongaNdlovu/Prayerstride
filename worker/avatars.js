import { hydrateUserFromFirestore, updateMyProfilePhoto } from './profile.js';
import {
  canServePublicAvatar,
  getUserByUid,
} from './db/users-repository.js';

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const AVATAR_CONTENT_TYPE = 'image/jpeg';
const ACCEPTED_AVATAR_CONTENT_TYPES = new Set([
  '',
  'application/octet-stream',
  'image/jpg',
  AVATAR_CONTENT_TYPE,
]);
const AVATAR_OBJECT_KEY = (uid) => `avatars/${uid}/profile.jpg`;

export function avatarObjectKey(uid) {
  return AVATAR_OBJECT_KEY(uid);
}

export async function uploadMyAvatar(env, user, request, firestoreApi, profileApi) {
  if (!env.AVATARS) {
    return { status: 503, body: { error: 'Avatar storage is not configured.' } };
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return { status: 400, body: { error: 'Expected multipart form data.' } };
  }

  const file = formData.get('avatar') || formData.get('file');
  if (!file || typeof file.arrayBuffer !== 'function') {
    return { status: 400, body: { error: 'Missing avatar file.' } };
  }

  const contentType = String(file.type || '').split(';', 1)[0].trim().toLowerCase();
  if (!ACCEPTED_AVATAR_CONTENT_TYPES.has(contentType)) {
    return { status: 400, body: { error: 'Avatar must be a JPEG image.' } };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength === 0) {
    return { status: 400, body: { error: 'Avatar file is empty.' } };
  }
  if (bytes.byteLength >= MAX_AVATAR_BYTES) {
    return { status: 400, body: { error: 'Avatar must be smaller than 2 MB.' } };
  }

  const key = avatarObjectKey(user.uid);
  await env.AVATARS.put(key, bytes, {
    httpMetadata: { contentType: AVATAR_CONTENT_TYPE },
  });

  const photoURL = profileApi.avatarUrlForUid(env, request, user.uid);
  const result = await updateMyProfilePhoto(env, user, photoURL, firestoreApi);
  return {
    status: result.status,
    body: {
      ...result.body,
      photoURL,
    },
  };
}

export async function serveAvatar(env, uid, firestoreApi) {
  if (!env.AVATARS) {
    return new Response('Avatar storage is not configured.', { status: 503 });
  }

  let profile = await getUserByUid(env, uid);
  if (!profile) {
    profile = await hydrateUserFromFirestore(env, uid, firestoreApi);
  }

  if (!canServePublicAvatar(profile)) {
    return new Response('Not found', { status: 404 });
  }

  const object = await env.AVATARS.get(avatarObjectKey(uid));
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers();
  headers.set('Content-Type', AVATAR_CONTENT_TYPE);
  headers.set('Cache-Control', 'public, max-age=300');
  return new Response(object.body, { status: 200, headers });
}
