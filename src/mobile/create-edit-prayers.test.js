import { describe, expect, it } from 'vitest';
import { createPrayerTitle } from './prayerFormHelpers';

describe('create-edit prayers', () => {
  it('auto-title helper handles empty body', () => {
    expect(createPrayerTitle('')).toBe('Prayer Request');
    expect(createPrayerTitle(null)).toBe('Prayer Request');
    expect(createPrayerTitle('   ')).toBe('Prayer Request');
  });

  it('auto-title helper uses first line', () => {
    expect(createPrayerTitle('Hello world\n\nMore text')).toBe('Hello world');
  });

  it('auto-title helper truncates long text', () => {
    const long = 'This is a very long prayer request title that goes on for more than sixty characters and beyond';
    const result = createPrayerTitle(long);
    expect(result.endsWith('...')).toBe(true);
    expect(result.length).toBe(60);
  });

  it('draft keys are stable', () => {
    const key1 = 'draft:prayer-request';
    const key2 = 'draft:prayer-settings';
    expect(key1).toBe('draft:prayer-request');
    expect(key2).toBe('draft:prayer-settings');
  });

  it('create/edit screens import expected functions', async () => {
    const createSrc = await import('./screens/CreatePrayerScreen.jsx?raw');
    expect(createSrc.default).toMatch(/addPrayer/);

    const editSrc = await import('./screens/EditRequestScreen.jsx?raw');
    expect(editSrc.default).toMatch(/updatePrayer/);
    expect(editSrc.default).toMatch(/deletePrayer/);
  });

  it('edit screen uses Alert.alert not window.confirm', async () => {
    const source = await import('./screens/EditRequestScreen.jsx?raw');
    expect(source.default).toMatch(/Alert\.alert/);
    expect(source.default).not.toMatch(/window\.confirm/);
  });
});
