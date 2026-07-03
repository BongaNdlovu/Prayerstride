import { describe, expect, it } from 'vitest';

describe('leaderboard screen source contract', () => {
  it('renders production-backed tabs, podium, opt-in, and ranked rows', async () => {
    const source = await import('../../mobile/screens/LeaderboardScreen.jsx?raw');
    expect(source.default).toMatch(/useLeaderboard/);
    expect(source.default).toMatch(/LeaderboardPodium/);
    expect(source.default).toMatch(/topThree/);
    expect(source.default).toMatch(/remainingRows/);
    expect(source.default).toMatch(/podiumOrder/);
    expect(source.default).toMatch(/updateGamificationPreferences/);
    expect(source.default).toMatch(/Show Me on Leaderboard/);
    expect(source.default).not.toMatch(/LEADERBOARD_DATA/);
  });
});
