import { describe, expect, it } from 'vitest';
import { getUploadErrorMessage } from './avatarUploadErrors';

describe('avatar upload errors', () => {
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
});
