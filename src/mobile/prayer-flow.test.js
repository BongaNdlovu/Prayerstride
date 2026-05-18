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
});
