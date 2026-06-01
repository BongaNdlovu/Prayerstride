import { describe, expect, it } from 'vitest';

describe('prayer flow', () => {
  it('PrayerDetailScreen imports pray API helper', async () => {
    const source = await import('./screens/PrayerDetailScreen.jsx?raw');
    expect(source.default).toMatch(/prayForRequest/);
  });

  it('PraiseScreen imports reaction API helper', async () => {
    const source = await import('./screens/PraiseScreen.jsx?raw');
    expect(source.default).toMatch(/reactToTestimony/);
  });

  it('HomeScreen imports usePrayers', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/usePrayers/);
  });

  it('HomeScreen offers a slowly pulsing direct prayer session action', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/Have a Prayer Session/);
    expect(source.default).toMatch(/go\('prayerStopwatch'\)/);
    expect(source.default).toMatch(/withRepeat/);
    expect(source.default).toMatch(/duration:\s*2400/);
    expect(source.default).toMatch(/1\.025/);
  });

  it('DiscoverScreen imports usePrayers', async () => {
    const source = await import('./screens/DiscoverScreen.jsx?raw');
    expect(source.default).toMatch(/usePrayers/);
  });

  it('PrayerDetailScreen source does not import web APIs', async () => {
    const source = await import('./screens/PrayerDetailScreen.jsx?raw');
    expect(source.default).not.toMatch(/from ['"]react-dom['"]/);
    expect(source.default).not.toMatch(/window\.confirm/);
    expect(source.default).not.toMatch(/localStorage/);
  });

  it('PrayerDetailScreen formats mixed Firestore date representations safely', async () => {
    const source = await import('./screens/PrayerDetailScreen.jsx?raw');
    expect(source.default).toMatch(/formatFirestoreDate/);
    expect(source.default).not.toMatch(/createdAt\.seconds/);
  });

  it('private stopwatch sessions explicitly disable sharing', async () => {
    const source = await import('./screens/PrayerStopwatchScreen.jsx?raw');
    expect(source.default).toMatch(/privacy:\s*'private',[\s\S]*allowShare:\s*false/);
  });

  it('PrayerStopwatchScreen remains scrollable on short phone screens', async () => {
    const source = await import('./screens/PrayerStopwatchScreen.jsx?raw');
    expect(source.default).toMatch(/<ScreenScaffold pageContent/);
    expect(source.default).not.toMatch(/<ScreenScaffold scroll=\{false\}/);
  });
});
