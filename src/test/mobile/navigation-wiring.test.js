import { describe, expect, it } from 'vitest';
import { AUTH_ROUTES } from '../../../src/mobile/navigation';

const ROUTED_SCREENS = [
  'home', 'leaderboard', 'stride', 'profile',
  'detail', 'timer', 'prayerStopwatch',
  'settings', 'editProfile',
  'notifications', 'notificationSettings',
  'privacyPolicy', 'termsOfService', 'helpCenter',
  'announcements', 'about', 'copyright',
  'reminderSettings', 'achievements',
  'adminDashboard', 'reportDetails',
  'accountSuspended',
];

describe('navigation wiring', () => {
  it('app shell routes all expected screen names', async () => {
    const app = await import('../../../app/index.jsx?raw');
    const source = app.default;

    for (const route of ROUTED_SCREENS) {
      expect(source).toMatch(new RegExp(`case '${route}':`));
    }

    for (const route of AUTH_ROUTES) {
      expect(source.includes(`'${route}'`)).toBe(true);
    }
  });

  it('app shell has no dead routes', async () => {
    const app = await import('../../../app/index.jsx?raw');
    const source = app.default;

    expect(source).not.toMatch(/case 'editRequest'/);
    expect(source).not.toMatch(/case 'support'/);
    expect(source).not.toMatch(/case 'discover'/);
    expect(source).not.toMatch(/case 'myPrayers'/);
    expect(source).not.toMatch(/case 'create'/);
    expect(source).not.toMatch(/case 'praise'/);
    expect(source).not.toMatch(/case 'dailyChallenge'/);
  });

  it('PrayerDetailScreen go targets are valid routes', async () => {
    const source = (await import('../../../src/mobile/screens/PrayerDetailScreen.jsx?raw')).default;

    const goCalls = source.match(/go\('(\w+)'/g) || [];
    const targets = goCalls.map((c) => c.match(/'(\w+)'/)[1]);

    for (const target of targets) {
      expect([...ROUTED_SCREENS, ...AUTH_ROUTES]).toContain(target);
    }

    expect(source).not.toMatch(/go\('editRequest'/);
  });

  it('SettingsScreen go targets are valid routes', async () => {
    const source = (await import('../../../src/mobile/screens/SettingsScreen.jsx?raw')).default;

    expect(source).not.toMatch(/['"]support['"]/);
    expect(source).not.toMatch(/route:\s*'support'/);
  });

  it('HomeScreen go targets route to valid screens', async () => {
    const source = (await import('../../../src/mobile/screens/HomeScreen.jsx?raw')).default;

    const goCalls = source.match(/go\('(\w+)'/g) || [];
    const targets = goCalls.map((c) => c.match(/'(\w+)'/)[1]);

    const validTargets = ['timer', 'detail', 'settings', 'leaderboard', 'stride', 'profile',
      'notifications', 'achievements', 'reminderSettings', 'adminDashboard'];
    for (const target of targets) {
      expect(validTargets).toContain(target);
    }
  });
});
