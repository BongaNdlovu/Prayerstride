import { describe, expect, it } from 'vitest';
import { selectFreshestProfileForCache } from './useUsers';

describe('user profile cache freshness', () => {
  it('keeps a newer cached avatar when a stale profile request resolves later', () => {
    const cachedProfile = {
      uid: 'uid-1',
      photoURL: 'https://api.prayerstride.test/avatars/uid-1/profile.jpg',
      updatedAt: '2026-06-08T09:30:00.000Z',
    };
    const staleProfile = {
      uid: 'uid-1',
      photoURL: null,
      updatedAt: '2026-06-08T09:00:00.000Z',
    };

    expect(selectFreshestProfileForCache(staleProfile, cachedProfile)).toBe(cachedProfile);
  });

  it('accepts a newer server profile over cached profile data', () => {
    const cachedProfile = {
      uid: 'uid-1',
      photoURL: null,
      updatedAt: '2026-06-08T09:00:00.000Z',
    };
    const nextProfile = {
      uid: 'uid-1',
      photoURL: 'https://api.prayerstride.test/avatars/uid-1/profile.jpg',
      updatedAt: '2026-06-08T09:30:00.000Z',
    };

    expect(selectFreshestProfileForCache(nextProfile, cachedProfile)).toBe(nextProfile);
  });
});
