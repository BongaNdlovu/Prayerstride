import { describe, expect, it } from 'vitest';

describe('PraiseScreen pending reactions', () => {
  it('stores pending metadata with timeout clearing', async () => {
    const source = await import('../../mobile/screens/PraiseScreen.jsx?raw');
    expect(source.default).toMatch(/\{ baseline, createdAt: Date\.now\(\) \}/);
    expect(source.default).toMatch(/PENDING_REACTION_TIMEOUT_MS/);
    expect(source.default).toMatch(/pending\.createdAt >= PENDING_REACTION_TIMEOUT_MS/);
    expect(source.default).toMatch(/serverCount >= pending\.baseline \+ 1/);
  });
});
