import { describe, expect, it } from 'vitest';
import {
  PRAYER_DETAILS_LIMIT,
  PRAYER_PRIVACY_OPTIONS,
  prayerFrequencyHelper,
  privacyOptionsWithIcons,
} from './prayerFormOptions';

describe('create-edit prayers', () => {
  it('create/edit screens import expected functions', async () => {
    const createSrc = await import('./screens/CreatePrayerScreen.jsx?raw');
    expect(createSrc.default).toMatch(/addPrayer/);
    expect(createSrc.default).toMatch(/prayerFormOptions/);

    const editSrc = await import('./screens/EditRequestScreen.jsx?raw');
    expect(editSrc.default).toMatch(/updatePrayer/);
    expect(editSrc.default).toMatch(/deletePrayer/);
    expect(editSrc.default).toMatch(/prayerFormOptions/);
  });

  it('edit screen uses Alert.alert not window.confirm', async () => {
    const source = await import('./screens/EditRequestScreen.jsx?raw');
    expect(source.default).toMatch(/Alert\.alert/);
    expect(source.default).not.toMatch(/window\.confirm/);
  });

  it('prayer form options export shared constants', () => {
    expect(PRAYER_DETAILS_LIMIT).toBe(1000);
    expect(PRAYER_PRIVACY_OPTIONS).toHaveLength(3);
    expect(prayerFrequencyHelper('once')).toMatch(/once/);
    expect(privacyOptionsWithIcons({ Users: 'u', Lock: 'l', EyeOff: 'e' })).toEqual([
      { value: 'community', label: 'Community', icon: 'u' },
      { value: 'private', label: 'Private', icon: 'l' },
      { value: 'hidden', label: 'Hidden', icon: 'e' },
    ]);
  });
});
