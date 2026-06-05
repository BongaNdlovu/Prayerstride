import { describe, expect, it } from 'vitest';

describe('prayer flow', () => {
  it('PrayerDetailScreen imports pray API helper', async () => {
    const source = await import('./screens/PrayerDetailScreen.jsx?raw');
    expect(source.default).toMatch(/prayForRequest/);
  });

  it('HomeScreen imports usePrayers', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/usePrayers/);
  });

  it('HomeScreen opens prayer stopwatch from the focused feed card', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/PrayerFocusCard/);
    expect(source.default).toMatch(/go\('timer', \{ prayerId: currentPrayer\.id, title: currentPrayer\.title \}\)/);
    expect(source.default).toMatch(/accessibilityLabel="Start prayer timer"/);
  });

  it('app shell no longer exposes legacy prayer feed routes', async () => {
    const source = await import('../../app/index.jsx?raw');
    expect(source.default).not.toMatch(/case 'discover'/);
    expect(source.default).not.toMatch(/case 'myPrayers'/);
    expect(source.default).not.toMatch(/case 'create'/);
    expect(source.default).not.toMatch(/case 'editRequest'/);
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
