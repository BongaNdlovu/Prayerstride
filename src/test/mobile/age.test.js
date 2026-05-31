import { describe, expect, it } from 'vitest';
import {
  ageBandFromAge,
  calculateAge,
  communityAccessForAgeBand,
  parseDateOfBirth,
} from '../../mobile/age.js';

describe('age registration helpers', () => {
  it('parses valid ISO dates', () => {
    expect(parseDateOfBirth('2008-05-31')).toBe('2008-05-31');
    expect(parseDateOfBirth('2008-13-01')).toBeNull();
  });

  it('assigns age bands for 16+ policy', () => {
    expect(ageBandFromAge(15)).toBe('under_16');
    expect(ageBandFromAge(16)).toBe('minor');
    expect(ageBandFromAge(18)).toBe('adult');
  });

  it('maps community access from age band', () => {
    expect(communityAccessForAgeBand('minor')).toBe('pending_guardian');
    expect(communityAccessForAgeBand('adult')).toBe('active');
  });

  it('calculates age on birthday boundary', () => {
    const today = new Date('2026-05-31T12:00:00Z');
    expect(calculateAge('2010-05-31', today)).toBe(16);
    expect(calculateAge('2010-06-01', today)).toBe(15);
  });
});
