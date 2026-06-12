import { describe, expect, it } from 'vitest';

describe('community screen source contract', () => {
  it('renders anonymous shared impact, cooperative goals, and no ranking UI', async () => {
    const source = await import('../../mobile/screens/CommunityScreen.jsx?raw');
    expect(source.default).toMatch(/usePrayers/);
    expect(source.default).toMatch(/useGamification/);
    expect(source.default).toMatch(/Prayer Chain/);
    expect(source.default).toMatch(/Cooperative Goal/);
    expect(source.default).toMatch(/Shared Prayer Wall/);
    expect(source.default).not.toMatch(/useLeaderboard/);
    expect(source.default).not.toMatch(/Leaderboard/);
    expect(source.default).not.toMatch(/rank/i);
    expect(source.default).not.toMatch(/podium/i);
  });
});
