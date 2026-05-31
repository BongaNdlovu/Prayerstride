import { describe, expect, it } from 'vitest';
import {
  assertModerationAllowed,
  findBlockedTerm,
  normalizeModerationText,
  parseBlocklistConfig,
} from '../../../worker/moderation.js';

describe('moderation blocklist', () => {
  it('uses default terms when config is empty', () => {
    const list = parseBlocklistConfig('');
    expect(list).toContain('fuck');
    expect(list.length).toBeGreaterThan(5);
  });

  it('parses comma-separated override config', () => {
    expect(parseBlocklistConfig('badword, another')).toEqual(['badword', 'another']);
  });

  it('matches whole words only', () => {
    const list = ['bad'];
    expect(findBlockedTerm('this is bad today', list)).toBe('bad');
    expect(findBlockedTerm('badminton', list)).toBeNull();
  });

  it('normalizes punctuation and casing', () => {
    expect(normalizeModerationText('FuCk!!!')).toBe('fuck');
  });

  it('rejects blocked content', () => {
    expect(() => assertModerationAllowed({ title: 'hello', body: 'what the fuck' }, ['fuck'])).toThrow(/not allowed/);
    expect(() => assertModerationAllowed({ title: 'Praying', body: 'God is good' }, ['fuck'])).not.toThrow();
  });
});
