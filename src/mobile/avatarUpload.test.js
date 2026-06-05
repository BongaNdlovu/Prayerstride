import { afterEach, describe, expect, it, vi } from 'vitest';
import { AVATAR_CONTENT_TYPE, prepareAvatarBlob } from './avatarUpload';
import { getUploadErrorMessage } from './avatarUploadErrors';

vi.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  manipulateAsync: vi.fn(async () => ({ uri: 'file://mock-avatar.jpg' })),
}));

describe('avatar upload errors', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps real storage quota errors without matching unrelated quota messages', () => {
    expect(getUploadErrorMessage({ code: 'storage/quota-exceeded' }))
      .toMatch(/storage capacity has been reached/i);
    expect(getUploadErrorMessage({ message: 'Quota exceeded for quota metric WriteRequests' }))
      .not.toMatch(/storage capacity has been reached/i);
    expect(getUploadErrorMessage({ message: 'Quota exceeded for quota metric WriteRequests' }))
      .toMatch(/try again/i);
  });

  it('maps unauthorized uploads to a format hint', () => {
    expect(getUploadErrorMessage({ code: 'storage/unauthorized' }))
      .toMatch(/2 MB/i);
  });

  it('explains when Firebase Storage is disabled by the project plan', () => {
    expect(getUploadErrorMessage({
      message: 'Cloud Storage for Firebase no longer supports Firebase projects that are on the no-cost Spark pricing plan. Please upgrade to the pay-as-you-go Blaze pricing plan.',
    })).toMatch(/app storage is not enabled/i);
  });

  it('normalizes manipulated avatar blobs to JPEG before upload', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      new Blob(['avatar-bytes'], { type: 'application/octet-stream' }),
    )));

    const prepared = await prepareAvatarBlob('file://source.png');

    expect(prepared.uri).toBe('file://mock-avatar.jpg');
    expect(prepared.type).toBe(AVATAR_CONTENT_TYPE);
    expect(prepared.blob.type).toBe(AVATAR_CONTENT_TYPE);
    expect(prepared.blob.size).toBeGreaterThan(0);
  });
});
