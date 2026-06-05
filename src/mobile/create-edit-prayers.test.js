import { describe, expect, it } from 'vitest';
import {
  PRAYER_DETAILS_LIMIT,
  PRAYER_PRIVACY_OPTIONS,
  prayerFrequencyHelper,
  privacyOptionsWithIcons,
} from './prayerFormOptions';

describe('create-edit prayers', () => {
  it('HomeScreen owns prototype prayer compose and answered-update flows', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/addPrayer/);
    expect(source.default).toMatch(/addTestimony/);
    expect(source.default).toMatch(/markAnswered/);
    expect(source.default).toMatch(/PRAYER_CATEGORIES/);
    expect(source.default).toMatch(/composeScriptureRef/);
    expect(source.default).toMatch(/scriptureRef/);
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
