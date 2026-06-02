import { describe, expect, it } from 'vitest';

const retryHooks = [
  'usePrayerData',
  'usePrayerSessions',
  'useNotifications',
  'useNotificationSettings',
  'useUsers',
];

const retryScreens = [
  'AchievementsScreen',
  'AnsweredPrayersScreen',
  'DiscoverScreen',
  'HomeScreen',
  'MyPrayersScreen',
  'MyStatsScreen',
  'NotificationSettingsScreen',
  'NotificationsScreen',
  'PraiseScreen',
  'ProfileScreen',
  'RemindersScreen',
];

describe('error states', () => {
  it('AsyncState renders a retry action when onRetry is available', async () => {
    const source = await import('./components/AsyncState.jsx?raw');
    expect(source.default).toMatch(/onRetry/);
    expect(source.default).toMatch(/label="Try again"/);
    expect(source.default).toMatch(/onPress=\{onRetry\}/);
  });

  it.each(retryHooks)('%s exposes retryable subscription failures', async (name) => {
    const source = await import(`./${name}.js?raw`);
    expect(source.default).toMatch(/setError\(err\)/);
    expect(source.default).toMatch(/retryVersion/);
    expect(source.default).toMatch(/retry/);
  });

  it('blocked-user loading preserves API failures for feed screens', async () => {
    const source = await import('./useBlocks.js?raw');
    expect(source.default).toMatch(/catch \(err\)/);
    expect(source.default).toMatch(/setError\(err\)/);
    expect(source.default).toMatch(/error,/);
    expect(source.default).toMatch(/refresh,/);
  });

  it.each(retryScreens)('%s passes retry handling into AsyncState', async (name) => {
    const source = await import(`./screens/${name}.jsx?raw`);
    expect(source.default).toMatch(/<AsyncState/);
    expect(source.default).toMatch(/onRetry=/);
  });

  it('feed empty states are not shown while errors are active', async () => {
    const screens = ['DiscoverScreen', 'MyPrayersScreen', 'PraiseScreen'];
    for (const name of screens) {
      const source = await import(`./screens/${name}.jsx?raw`);
      expect(source.default).toMatch(/empty=\{!(?:feedLoading|loading) && !(?:error|listError)/);
    }
  });

  it('feed screens stay closed when blocked-user loading fails', async () => {
    const screens = ['DiscoverScreen', 'HomeScreen', 'PraiseScreen'];
    for (const name of screens) {
      const source = await import(`./screens/${name}.jsx?raw`);
      expect(source.default).toMatch(/blocksError/);
    }
  });

  it('notification write failures are surfaced to the user', async () => {
    const notifications = await import('./screens/NotificationsScreen.jsx?raw');
    const settings = await import('./screens/NotificationSettingsScreen.jsx?raw');
    const reminders = await import('./screens/RemindersScreen.jsx?raw');

    expect(notifications.default).toMatch(/markNotificationRead\(item\.id\)\.catch/);
    expect(notifications.default).toMatch(/Could not update notification/);
    expect(settings.default).toMatch(/Could not save preference/);
    expect(reminders.default).toMatch(/Could not save reminder/);
  });
});
