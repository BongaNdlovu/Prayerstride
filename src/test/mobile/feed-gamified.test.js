import { describe, expect, it } from 'vitest';

describe('gamified feed source contract', () => {
  it('HomeScreen exposes carousel, search, compose, and production actions', async () => {
    const source = await import('../../mobile/screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/currentFeedIndex/);
    expect(source.default).toMatch(/goToPrayerIndex/);
    expect(source.default).toMatch(/prayerMatchesQuery/);
    expect(source.default).not.toMatch(/PanResponder/);
    expect(source.default).not.toMatch(/isIntentionalVerticalSwipe/);
    expect(source.default).not.toMatch(/swipeDirection/);
    expect(source.default).not.toMatch(/onMoveShouldSetPanResponderCapture/);
    expect(source.default).toMatch(/progressDots/);
    expect(source.default).toMatch(/searchOpen/);
    expect(source.default).toMatch(/searchQuery/);
    expect(source.default).toMatch(/searchResults/);
    expect(source.default).toMatch(/composeOpen/);
    expect(source.default).toMatch(/submitComposePrayer/);
    expect(source.default).not.toMatch(/prayForRequest/);
    expect(source.default).toMatch(/bookmarkPrayer/);
    expect(source.default).toMatch(/addPrayer/);
    expect(source.default).not.toMatch(/addTestimony/);
    expect(source.default).toMatch(/markAnswered/);
    expect(source.default).toMatch(/useAppFeedback/);
    expect(source.default).toMatch(/useNotifications/);
    expect(source.default).toMatch(/const hasUnreadNotifications = unread\.length > 0/);
    expect(source.default).toMatch(/hasUnreadNotifications \? <View style=\{styles\.notifDot\} \/> : null/);
    expect(source.default).toMatch(/go\('timer'/);
    expect(source.default).toMatch(/PRAYER_DETAILS_LIMIT/);
    expect(source.default).toMatch(/PRAYER_CATEGORIES/);
    expect(source.default).toMatch(/composeScriptureRef/);
    expect(source.default).not.toMatch(/gesture\.dy/);
    expect(source.default).toMatch(/setCurrentFeedIndex/);
    expect(source.default).not.toMatch(/document\./);
    expect(source.default).not.toMatch(/LEADERBOARD_DATA/);
    expect(source.default).not.toMatch(/recentPrayers\.map/);
    expect(source.default).not.toMatch(/PrayerCard key=/);
  });
});
