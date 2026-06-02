import { getErrorMessage } from './errors';

export class AvatarTooLargeError extends Error {
  constructor() {
    super('AVATAR_TOO_LARGE');
    this.name = 'AvatarTooLargeError';
  }
}

export function getUploadErrorMessage(error) {
  if (error instanceof AvatarTooLargeError) {
    return 'Choose an image smaller than 2 MB and try again.';
  }
  const code = String(error?.code || '').toLowerCase();
  if (code === 'storage/quota-exceeded') {
    return 'Profile photo uploads are temporarily unavailable because storage capacity has been reached. You can still save your profile details and try the photo again later.';
  }
  if (/no-cost spark pricing plan|upgrade to the pay-as-you-go blaze pricing plan|maintain access to your default bucket/i.test(error?.message || '')) {
    return 'Profile photo uploads are temporarily unavailable because app storage is not enabled. You can still save your profile details and try the photo again later.';
  }
  if (/quota exceeded/i.test(error?.message || '') && code !== 'storage/quota-exceeded') {
    return 'Photo upload is busy right now. Please wait a moment and try again.';
  }
  if (code === 'storage/unauthorized') {
    return 'This photo could not be uploaded. Choose an image smaller than 2 MB and try again.';
  }
  return getErrorMessage(error, 'This photo could not be uploaded. Please try again.');
}
