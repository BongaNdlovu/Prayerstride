import { describe, expect, it } from 'vitest';
import {
  cleanOptionalHandle,
  cleanOptionalPhotoURL,
  cleanOptionalProfileText,
  formatProfileHandleForSave,
} from './profileFields';

describe('profile field cleanup', () => {
  it('hides null-ish profile text before rendering', () => {
    expect(cleanOptionalProfileText(null)).toBe('');
    expect(cleanOptionalProfileText(' null ')).toBe('');
    expect(cleanOptionalProfileText('undefined')).toBe('');
    expect(cleanOptionalProfileText('Demo User')).toBe('Demo User');
  });

  it('normalizes handles for display and saving', () => {
    expect(cleanOptionalHandle('@demo')).toBe('demo');
    expect(cleanOptionalHandle(' null ')).toBe('');
    expect(formatProfileHandleForSave('demo')).toBe('@demo');
    expect(formatProfileHandleForSave('')).toBe(null);
  });

  it('does not pass null-ish photo URLs into Image sources', () => {
    expect(cleanOptionalPhotoURL(' null ')).toBe('');
    expect(cleanOptionalPhotoURL('https://example.test/profile.jpg')).toBe('https://example.test/profile.jpg');
  });
});
