import { describe, expect, it } from 'vitest';

const staticScreens = [
  'AnnouncementsScreen',
  'LeaderboardScreen',
  'RemindersScreen',
  'AchievementsScreen',
];

describe('static feature screens', () => {
  it('all static screens export successfully', { timeout: 15000 }, async () => {
    for (const name of staticScreens) {
      const source = await import(`./screens/${name}.jsx?raw`);
      expect(source.default).toMatch(/export default/);
    }
  });

  it('static screens import native components only', async () => {
    for (const name of staticScreens) {
      const source = await import(`./screens/${name}.jsx?raw`);
      expect(source.default).not.toMatch(/from ['"]react-dom['"]/);
      expect(source.default).not.toMatch(/window\.confirm/);
      expect(source.default).not.toMatch(/document\./);
    }
  });

  it('Reminders screen uses persisted notification settings', async () => {
    const source = await import('./screens/RemindersScreen.jsx?raw');
    expect(source.default).toMatch(/useNotificationSettings/);
    expect(source.default).not.toMatch(/AsyncStorage/);
  });

  it('real-data screens do not import mockData', async () => {
    const screens = [
      'AchievementsScreen',
      'AnnouncementsScreen',
      'HomeScreen',
      'LeaderboardScreen',
      'RemindersScreen',
    ];
    for (const name of screens) {
      const source = await import(`./screens/${name}.jsx?raw`);
      expect(source.default).not.toMatch(/mockData/);
    }
  });

  it('PrayerStopwatch uses confirm-before-log flow', async () => {
    const source = await import('./screens/PrayerStopwatchScreen.jsx?raw');
    expect(source.default).toMatch(/Log Prayer/);
    expect(source.default).toMatch(/readyToLog/);
    expect(source.default).toMatch(/disabled=\{busy\}/);
  });

  it('notification quiet hours are presented as static text until configuration is implemented', async () => {
    const source = await import('./screens/NotificationSettingsScreen.jsx?raw');
    expect(source.default).toMatch(/<View style=\{styles\.quietRow\}>/);
    expect(source.default).not.toMatch(/<Pressable style=\{styles\.quietRow\}>/);
  });

  it('AppFeedbackProvider is mounted in app shell', async () => {
    const app = await import('../../app/index.jsx?raw');
    const navigation = await import('./navigation.js?raw');
    expect(app.default).toMatch(/AppFeedbackProvider/);
    expect(app.default).toMatch(/MAIN_TAB_ROUTES/);
    expect(navigation.default).toMatch(/MAIN_TAB_ROUTES = \['home', 'leaderboard', 'stride', 'profile'\]/);
    expect(app.default).not.toMatch(/case 'discover'/);
    expect(app.default).not.toMatch(/case 'praise'/);
    expect(app.default).not.toMatch(/case 'dailyChallenge'/);
  });

  it('AppFeedbackProvider exports without browser APIs', async () => {
    const source = await import('./AppFeedbackProvider.jsx?raw');
    expect(source.default).toMatch(/export function AppFeedbackProvider/);
    expect(source.default).not.toMatch(/document\./);
    expect(source.default).not.toMatch(/window\./);
  });
});
