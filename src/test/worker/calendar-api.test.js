import { describe, expect, it } from 'vitest';
import { isValidCalendarDateKey } from '../../../worker/calendar-api.js';

describe('calendar api validation', () => {
  it('accepts valid date keys and rejects invalid ones', () => {
    expect(isValidCalendarDateKey('2026-06-01')).toBe(true);
    expect(isValidCalendarDateKey('2026-13-01')).toBe(false);
    expect(isValidCalendarDateKey('2026-02-30')).toBe(false);
    expect(isValidCalendarDateKey('06-01-2026')).toBe(false);
  });
});
