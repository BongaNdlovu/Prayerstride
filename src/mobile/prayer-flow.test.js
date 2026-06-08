import { describe, expect, it } from 'vitest';

describe('prayer flow', () => {
  it('PrayerDetailScreen routes prayed actions through the timer', async () => {
    const source = await import('./screens/PrayerDetailScreen.jsx?raw');
    expect(source.default).not.toMatch(/prayForRequest/);
    expect(source.default).toMatch(/handleTimer\(\)/);
  });

  it('PrayerStopwatchScreen records the pray action after a genuine timed session', async () => {
    const source = await import('./screens/PrayerStopwatchScreen.jsx?raw');
    expect(source.default).toMatch(/MIN_GENUINE_PRAYER_SECONDS/);
    expect(source.default).toMatch(/prayForRequest\(sessionPrayerId, \{ qualityPrayer: true, seconds \}\)/);
  });

  it('PrayerStopwatchScreen skips prayed-count updates for own requests while saving the session', async () => {
    const source = await import('./screens/PrayerStopwatchScreen.jsx?raw');
    expect(source.default).toMatch(/isOwnPrayerRequest/);
    expect(source.default).toMatch(/!isDirectPrivateSession && !isOwnPrayerRequest/);
    expect(source.default).toMatch(/await addPrayerSession/);
  });

  it('HomeScreen imports usePrayers', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/usePrayers/);
  });

  it('HomeScreen opens prayer stopwatch from the focused feed card', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/PrayerFocusCard/);
    expect(source.default).toMatch(/go\('timer', \{ prayerId: currentPrayer\.id, title: currentPrayer\.title, prayer: currentPrayer \}\)/);
    expect(source.default).toMatch(/accessibilityLabel="Start prayer timer"/);
  });

  it('app routes completed prayer sessions directly to Stride stats', async () => {
    const source = await import('../../app/index.jsx?raw');
    expect(source.default).toMatch(/resetFn: handleTabChange/);
    expect(source.default).toMatch(/onDone=\{\(\) => resetFn\('stride'\)\}/);
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
