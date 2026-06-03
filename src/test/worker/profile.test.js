import { describe, expect, it } from 'vitest';
import { avatarUrlForUid, serializeProfile } from '../../../worker/profile.js';

describe('profile helpers', () => {
  it('builds canonical avatar urls from API_PUBLIC_URL', () => {
    const request = new Request('https://api.prayerstride.app/api/me/profile');
    const url = avatarUrlForUid({ API_PUBLIC_URL: 'https://api.prayerstride.app' }, request, 'uid-9');
    expect(url).toBe('https://api.prayerstride.app/avatars/uid-9/profile.jpg');
  });

  it('serializes profile fields for mobile clients', () => {
    const profile = serializeProfile({
      uid: 'uid-9',
      displayName: 'Alex',
      handle: '@alex',
      photoURL: 'https://api.prayerstride.app/avatars/uid-9/profile.jpg',
      role: 'user',
      owner: false,
      suspended: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });

    expect(profile).toMatchObject({
      id: 'uid-9',
      uid: 'uid-9',
      displayName: 'Alex',
      handle: '@alex',
      owner: false,
      suspended: false,
    });
  });
});
