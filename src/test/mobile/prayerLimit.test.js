import { describe, expect, it } from 'vitest';
import { prayedButtonLabel, prayedStorageKey } from '../../mobile/prayerLimit.js';

describe('prayerLimit helpers', () => {
  it('builds weekly storage keys', () => {
    expect(prayedStorageKey('p1', 'weekly', new Date('2026-05-31T12:00:00Z'))).toMatch(/^prayed:p1:\d{4}-W\d{2}$/);
  });

  it('labels weekly prayers correctly', () => {
    expect(prayedButtonLabel('weekly', true)).toBe('Prayed This Week');
    expect(prayedButtonLabel('daily', true)).toBe('Prayed Today');
    expect(prayedButtonLabel('once', true)).toBe('Already Prayed');
  });
});
