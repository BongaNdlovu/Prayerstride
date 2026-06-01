import { describe, expect, it } from 'vitest';
import {
  ENCOURAGEMENT_PRESETS,
  getEncouragementPreset,
  isValidEncouragementPreset,
} from '../../shared/encouragementPresets.js';

describe('encouragementPresets', () => {
  it('includes reviewed preset messages', () => {
    expect(ENCOURAGEMENT_PRESETS.map((preset) => preset.id)).toEqual([
      'praying-with-you',
      'not-alone',
      'standing-with-you',
    ]);
    expect(getEncouragementPreset('not-alone')?.message).toBe('You are not alone.');
  });

  it('rejects unknown preset ids', () => {
    expect(isValidEncouragementPreset('custom-text')).toBe(false);
    expect(isValidEncouragementPreset('praying-with-you')).toBe(true);
  });
});
