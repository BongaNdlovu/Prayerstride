import { describe, expect, it } from 'vitest';

describe('gamified feed source contract', () => {
  it('HomeScreen exposes carousel, search, compose, and production actions', async () => {
    const source = await import('../../mobile/screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/currentFeedIndex/);
    expect(source.default).toMatch(/goToPrayerIndex/);
    expect(source.default).toMatch(/prayerMatchesQuery/);
    expect(source.default).toMatch(/PanResponder/);
    expect(source.default).toMatch(/progressDots/);
    expect(source.default).toMatch(/searchOpen/);
    expect(source.default).toMatch(/searchQuery/);
    expect(source.default).toMatch(/searchResults/);
    expect(source.default).toMatch(/composeOpen/);
    expect(source.default).toMatch(/submitComposePrayer/);
    expect(source.default).toMatch(/prayForRequest/);
    expect(source.default).toMatch(/bookmarkPrayer/);
    expect(source.default).toMatch(/addPrayer/);
    expect(source.default).toMatch(/useAppFeedback/);
    expect(source.default).toMatch(/go\('prayerStopwatch'/);
    expect(source.default).toMatch(/PRAYER_DETAILS_LIMIT/);
    expect(source.default).toMatch(/setCurrentFeedIndex/);
    expect(source.default).not.toMatch(/document\./);
    expect(source.default).not.toMatch(/LEADERBOARD_DATA/);
    expect(source.default).not.toMatch(/recentPrayers\.map/);
    expect(source.default).not.toMatch(/PrayerCard key=/);
  });
});
