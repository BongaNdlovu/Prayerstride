import { describe, expect, it, vi } from 'vitest';
import {
  MAX_AVATAR_BYTES,
  uploadMyAvatar,
} from '../../../worker/avatars.js';

function createFirestoreStub(initialProfile) {
  let profile = { ...initialProfile };
  return {
    get profile() {
      return profile;
    },
    docName(_env, ...parts) {
      return parts.join('/');
    },
    async getDocument(_env, name) {
      if (name === `users/${initialProfile.uid}`) {
        return { exists: true, name, fields: profile };
      }
      return { exists: false, name, fields: null };
    },
    fromFirestoreFields(fields) {
      return fields;
    },
    toFirestoreFields(fields) {
      return fields;
    },
    async firestoreCommit(_env, writes) {
      const userWrite = writes.find((write) => write.update?.name === `users/${initialProfile.uid}`);
      if (userWrite) profile = userWrite.update.fields;
    },
  };
}

function avatarRequest(blob) {
  const form = new FormData();
  form.append('avatar', blob, 'profile.jpg');
  return {
    url: 'https://api.prayerstride.test/api/me/avatar',
    formData: async () => form,
  };
}

describe('avatar worker upload', () => {
  it('stores a JPEG avatar and persists the canonical profile URL', async () => {
    const put = vi.fn(async () => {});
    const env = {
      API_PUBLIC_URL: 'https://api.prayerstride.test',
      AVATARS: { put },
    };
    const user = { uid: 'uid-1', email: 'alex@example.test' };
    const firestoreApi = createFirestoreStub({
      uid: user.uid,
      email: user.email,
      displayName: 'Alex',
      role: 'user',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const result = await uploadMyAvatar(
      env,
      user,
      avatarRequest(new Blob(['avatar-bytes'], { type: 'image/jpeg' })),
      firestoreApi,
      {
        avatarUrlForUid: (nextEnv, _request, uid) => `${nextEnv.API_PUBLIC_URL}/avatars/${uid}/profile.jpg`,
      },
    );

    expect(result.status).toBe(200);
    expect(result.body.photoURL).toBe('https://api.prayerstride.test/avatars/uid-1/profile.jpg');
    expect(firestoreApi.profile.photoURL).toBe(result.body.photoURL);
    expect(put).toHaveBeenCalledWith(
      'avatars/uid-1/profile.jpg',
      expect.any(Uint8Array),
      { httpMetadata: { contentType: 'image/jpeg' } },
    );
  });

  it('rejects avatars at or above the size limit before writing storage', async () => {
    const put = vi.fn(async () => {});
    const env = {
      API_PUBLIC_URL: 'https://api.prayerstride.test',
      AVATARS: { put },
    };
    const user = { uid: 'uid-1', email: 'alex@example.test' };
    const firestoreApi = createFirestoreStub({
      uid: user.uid,
      email: user.email,
      displayName: 'Alex',
      role: 'user',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const result = await uploadMyAvatar(
      env,
      user,
      avatarRequest(new Blob([new Uint8Array(MAX_AVATAR_BYTES)], { type: 'image/jpeg' })),
      firestoreApi,
      {
        avatarUrlForUid: (nextEnv, _request, uid) => `${nextEnv.API_PUBLIC_URL}/avatars/${uid}/profile.jpg`,
      },
    );

    expect(result.status).toBe(400);
    expect(result.body.error).toMatch(/smaller than 2 MB/i);
    expect(put).not.toHaveBeenCalled();
  });

  it('accepts Android multipart uploads when the file part type is generic', async () => {
    const put = vi.fn(async () => {});
    const env = {
      API_PUBLIC_URL: 'https://api.prayerstride.test',
      AVATARS: { put },
    };
    const user = { uid: 'uid-1', email: 'alex@example.test' };
    const firestoreApi = createFirestoreStub({
      uid: user.uid,
      email: user.email,
      displayName: 'Alex',
      role: 'user',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const result = await uploadMyAvatar(
      env,
      user,
      avatarRequest(new Blob(['avatar-bytes'], { type: 'application/octet-stream' })),
      firestoreApi,
      {
        avatarUrlForUid: (nextEnv, _request, uid) => `${nextEnv.API_PUBLIC_URL}/avatars/${uid}/profile.jpg`,
      },
    );

    expect(result.status).toBe(200);
    expect(result.body.photoURL).toBe('https://api.prayerstride.test/avatars/uid-1/profile.jpg');
    expect(put).toHaveBeenCalled();
  });
});
