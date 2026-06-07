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

  it('does not label local photo read failures as internet problems', () => {
    expect(getUploadErrorMessage({ code: 'avatar/read-failed' }))
      .toMatch(/selected photo/i);
    expect(getUploadErrorMessage({ code: 'avatar/read-failed' }))
      .not.toMatch(/internet connection/i);
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

  it('falls back to XMLHttpRequest when React Native fetch cannot read a local file URI', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Network request failed');
    }));
    vi.stubGlobal('XMLHttpRequest', class {
      open = vi.fn();

      send = vi.fn(() => {
        this.response = new Blob(['avatar-bytes'], { type: 'image/jpeg' });
        this.onload();
      });
    });

    const prepared = await prepareAvatarBlob('file://source.png');

    expect(prepared.uri).toBe('file://mock-avatar.jpg');
    expect(prepared.type).toBe(AVATAR_CONTENT_TYPE);
    expect(prepared.blob.size).toBeGreaterThan(0);
  });

  it('does not read local gallery files before upload on React Native', async () => {
    const previousNavigator = global.navigator;
    vi.stubGlobal('navigator', { ...previousNavigator, product: 'ReactNative' });
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const prepared = await prepareAvatarBlob('file://source.png');

    expect(prepared).toEqual({ uri: 'file://mock-avatar.jpg', type: AVATAR_CONTENT_TYPE });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
