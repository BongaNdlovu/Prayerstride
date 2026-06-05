import { describe, expect, it } from 'vitest';

describe('HTML design parity', () => {
  it('theme uses HTML design token values', async () => {
    const source = await import('./theme.js?raw');
    expect(source.default).toMatch(/ink:\s*'#111827'/);
    expect(source.default).toMatch(/surface:\s*'#FAFAF8'/);
    expect(source.default).toMatch(/gold:\s*'#B8924A'/);
    expect(source.default).toMatch(/teal:\s*'#2A8C7E'/);
    expect(source.default).toMatch(/night:\s*'#0D1B2A'/);
    expect(source.default).toMatch(/amber:\s*'#D97706'/);
    expect(source.default).toMatch(/redSoft:\s*'#DC4F4F'/);
    expect(source.default).toMatch(/border:\s*'rgba\(0,0,0,0\.07\)'/);
  });

  it('theme uses HTML radii values', async () => {
    const source = await import('./theme.js?raw');
    expect(source.default).toMatch(/sm:\s*12/);
    expect(source.default).toMatch(/md:\s*18/);
    expect(source.default).toMatch(/lg:\s*24/);
    expect(source.default).toMatch(/xl:\s*32/);
  });

  it('fonts use Playfair Display and DM Sans', async () => {
    const source = await import('./theme.js?raw');
    expect(source.default).toMatch(/PlayfairDisplay_700Bold/);
    expect(source.default).toMatch(/PlayfairDisplay_600SemiBold/);
    expect(source.default).toMatch(/PlayfairDisplay_400Regular/);
    expect(source.default).toMatch(/DMSans_400Regular/);
    expect(source.default).toMatch(/DMSans_500Medium/);
    expect(source.default).toMatch(/DMSans_600SemiBold/);
    expect(source.default).toMatch(/DMSans_700Bold/);
  });

  it('font loading uses new google font packages', async () => {
    const source = await import('./useAppFonts.js?raw');
    expect(source.default).toMatch(/@expo-google-fonts\/playfair-display/);
    expect(source.default).toMatch(/@expo-google-fonts\/dm-sans/);
    expect(source.default).not.toMatch(/@expo-google-fonts\/sora/);
    expect(source.default).not.toMatch(/@expo-google-fonts\/inter/);
  });

  it('bottom nav uses Footprints icon for stride tab', async () => {
    const source = await import('./components/BottomTabs.jsx?raw');
    expect(source.default).toMatch(/Footprints/);
  });

  it('HomeScreen has dark verse card with night gradient', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/colors\.night2.*colors\.night/);
    expect(source.default).toMatch(/verseCard/);
  });

  it('HomeScreen uses the HTML brand header shape', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/brandMark/);
    expect(source.default).toMatch(/PrayerStride/);
    expect(source.default).toMatch(/notifDot/);
    expect(source.default).toMatch(/avatarRing/);
    expect(source.default).not.toMatch(/Who can you carry in prayer today/);
  });

  it('PrayerStopwatchScreen uses immersive HTML timer treatment', async () => {
    const source = await import('./screens/PrayerStopwatchScreen.jsx?raw');
    expect(source.default).toMatch(/backgroundColor:\s*colors\.night/);
    expect(source.default).toMatch(/timerGlow/);
    expect(source.default).toMatch(/timerNoise/);
    expect(source.default).toMatch(/particleOne/);
    expect(source.default).toMatch(/timerContextCard/);
    expect(source.default).toMatch(/timerContextAvatar/);
    expect(source.default).toMatch(/timerContextVerse/);
  });

  it('ProfileScreen has dark level card', async () => {
    const source = await import('./screens/ProfileScreen.jsx?raw');
    expect(source.default).toMatch(/colors\.night/);
    expect(source.default).toMatch(/Footprints/);
    expect(source.default).not.toMatch(/FootprintsIconSmall/);
  });

  it('LeaderboardScreen uses night tab active state', async () => {
    const source = await import('./screens/LeaderboardScreen.jsx?raw');
    expect(source.default).toMatch(/tabButtonActive.*colors\.night/);
  });

  it('AchievementsScreen has dark achievement banner', async () => {
    const source = await import('./screens/AchievementsScreen.jsx?raw');
    expect(source.default).toMatch(/achBanner[\s\S]*colors\.night/);
    expect(source.default).toMatch(/selectedBadge/);
    expect(source.default).toMatch(/detailOverlay/);
    expect(source.default).toMatch(/detailSheet/);
    expect(source.default).toMatch(/detailHandle/);
  });

  it('legal copy names the active HTML parity fonts', async () => {
    const source = await import('./screens/CopyrightScreen.jsx?raw');
    expect(source.default).toMatch(/Playfair Display and DM Sans fonts/);
    expect(source.default).not.toMatch(/Sora and Inter fonts/);
  });

  it('AppFeedbackProvider uses HTML palette for celebration', async () => {
    const source = await import('./AppFeedbackProvider.jsx?raw');
    expect(source.default).toMatch(/colors\.teal/);
    expect(source.default).toMatch(/colors\.goldLight/);
    expect(source.default).toMatch(/colors\.redSoft/);
  });
});
