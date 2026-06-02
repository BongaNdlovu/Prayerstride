import { describe, expect, it } from 'vitest';
import { getApiErrorMessage, getErrorMessage, toUserFacingError } from './errors';

describe('friendly errors', () => {
  it('explains wrong-password authentication failures', () => {
    expect(getErrorMessage({ code: 'auth/invalid-credential' }))
      .toBe('The email or password is incorrect. Please try again.');
    expect(getErrorMessage({ code: 'auth/wrong-password' }))
      .toBe('The email or password is incorrect. Please try again.');
  });

  it('explains offline, expired-session, and throttled requests', () => {
    expect(getErrorMessage(new Error('Network request failed')))
      .toBe('Check your internet connection and try again.');
    expect(getApiErrorMessage(401, 'Invalid authentication token'))
      .toBe('Your session has expired. Please sign in again.');
    expect(getApiErrorMessage(429, 'Rate limit exceeded'))
      .toBe('Too many requests. Please wait a moment and try again.');
  });

  it('preserves actionable server messages for 500 responses', () => {
    expect(getApiErrorMessage(500, 'Account deletion failed. Please try again or contact support.'))
      .toBe('Account deletion failed. Please try again or contact support.');
    expect(getApiErrorMessage(500, 'Unexpected server error'))
      .toBe('PrayerStride is temporarily unavailable. Please try again shortly.');
  });

  it('wraps SDK failures without losing the friendly message', () => {
    const error = toUserFacingError({ code: 'auth/email-already-in-use' });
    expect(error.message).toContain('already exists');
    expect(error.code).toBe('auth/email-already-in-use');
  });
});
