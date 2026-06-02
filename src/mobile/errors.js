const CODE_MESSAGES = {
  'auth/email-already-in-use': 'An account already exists for this email address. Sign in or reset your password.',
  'auth/invalid-credential': 'The email or password is incorrect. Please try again.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/network-request-failed': 'Check your internet connection and try again.',
  'auth/operation-not-allowed': 'This sign-in method is currently unavailable. Please contact support.',
  'auth/requires-recent-login': 'For your security, sign in again before making this change.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'The email or password is incorrect. Please try again.',
  'auth/weak-password': 'Choose a stronger password with at least 12 characters.',
  'auth/wrong-password': 'The email or password is incorrect. Please try again.',
  'failed-precondition': 'Prayer data is still being prepared. Please try again shortly.',
  'firestore/permission-denied': 'You do not have permission to complete this action.',
  'permission-denied': 'You do not have permission to complete this action.',
  'storage/quota-exceeded': 'Profile photo uploads are temporarily unavailable. Please try again later.',
  'storage/unauthorized': 'This file could not be uploaded. Check the file and try again.',
};

function normalizedCode(error) {
  return String(error?.code || '').toLowerCase();
}

function hasNetworkFailure(error) {
  return /failed to fetch|network request failed|networkerror|offline|internet connection/i.test(error?.message || '');
}

export function getApiErrorMessage(status, serverMessage) {
  const message = String(serverMessage || '').trim();
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 429 && (!message || message === 'Rate limit exceeded')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (status >= 500) {
    if (message && message !== 'Unexpected server error') return message;
    return 'PrayerStride is temporarily unavailable. Please try again shortly.';
  }
  if (message) return message;
  if (status === 403) return 'You do not have permission to complete this action.';
  if (status === 404) return 'The requested item could not be found.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  return 'The request could not be completed. Please try again.';
}

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const code = normalizedCode(error);
  if (CODE_MESSAGES[code]) return CODE_MESSAGES[code];
  if (hasNetworkFailure(error)) return 'Check your internet connection and try again.';
  if (error?.name === 'AbortError' || /timed? out|timeout/i.test(error?.message || '')) {
    return 'The request took too long. Check your connection and try again.';
  }
  if (Number(error?.status) >= 400) {
    return getApiErrorMessage(Number(error.status), error?.message);
  }
  return String(error?.message || '').trim() || fallback;
}

export function toUserFacingError(error, fallback) {
  const next = new Error(getErrorMessage(error, fallback));
  next.code = error?.code;
  next.status = error?.status;
  return next;
}
