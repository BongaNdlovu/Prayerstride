import { describe, expect, it } from 'vitest';
import {
  canServePublicAvatar,
  profileFromFirestore,
} from '../../../worker/db/users-repository.js';

describe('users repository', () => {
  it('maps firestore profile fields into d1 columns', () => {
    const record = profileFromFirestore('uid-1', {
      displayName: 'Alex',
      handle: '@alex',
      photoURL: 'https://api.prayerstride.app/avatars/uid-1/profile.jpg',
      role: 'admin',
      owner: true,
      suspended: false,
      registrationState: 'complete',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });

    expect(record.uid).toBe('uid-1');
    expect(record.display_name).toBe('Alex');
    expect(record.handle).toBe('@alex');
    expect(record.role).toBe('admin');
    expect(record.owner).toBe(1);
    expect(record.suspended).toBe(0);
  });

  it('blocks public avatar serving for suspended or deleted users', () => {
    expect(canServePublicAvatar({
      photoURL: 'https://api.prayerstride.app/avatars/u1/profile.jpg',
      suspended: true,
    })).toBe(false);
    expect(canServePublicAvatar({
      photoURL: 'https://api.prayerstride.app/avatars/u1/profile.jpg',
      deletedAt: '2026-01-01T00:00:00.000Z',
    })).toBe(false);
    expect(canServePublicAvatar({
      photoURL: 'https://api.prayerstride.app/avatars/u1/profile.jpg',
      avatarPublic: false,
    })).toBe(false);
    expect(canServePublicAvatar({
      photoURL: 'https://api.prayerstride.app/avatars/u1/profile.jpg',
      suspended: false,
    })).toBe(true);
  });
});
