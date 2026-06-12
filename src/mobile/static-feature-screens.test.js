import { describe, expect, it } from 'vitest';

const staticScreens = [
  'AnnouncementsScreen',
  'CommunityScreen',
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
      'CommunityScreen',
      'HomeScreen',
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
    expect(navigation.default).toMatch(/MAIN_TAB_ROUTES = \['home', 'community', 'stride', 'profile'\]/);
    expect(app.default).not.toMatch(/case 'discover'/);
    expect(app.default).not.toMatch(/case 'praise'/);
    expect(app.default).not.toMatch(/case 'dailyChallenge'/);
    expect(app.default).not.toMatch(/case 'leaderboard'/);
  });

  it('AppFeedbackProvider exports without browser APIs', async () => {
    const source = await import('./AppFeedbackProvider.jsx?raw');
    expect(source.default).toMatch(/export function AppFeedbackProvider/);
    expect(source.default).not.toMatch(/document\./);
    expect(source.default).not.toMatch(/window\./);
  });

  it('settings preferences drive feedback cues and local streak reminders', async () => {
    const app = await import('../../app/index.jsx?raw');
    const feedback = await import('./AppFeedbackProvider.jsx?raw');
    const settings = await import('./screens/SettingsScreen.jsx?raw');
    const timer = await import('./screens/PrayerStopwatchScreen.jsx?raw');
    const notifications = await import('./notifications.js?raw');

    expect(app.default).toMatch(/milestoneCuesEnabled=\{appPreferences\.xpNotificationsEnabled !== false\}/);
    expect(feedback.default).toMatch(/milestoneCuesEnabled/);
    expect(settings.default).toMatch(/configureStreakReminderNotifications/);
    expect(timer.default).toMatch(/preferences\.xpNotificationsEnabled !== false/);
    expect(timer.default).toMatch(/triggerFeedbackCue\('celebrate'\)/);
    expect(notifications.default).toMatch(/scheduleNotificationAsync/);
    expect(notifications.default).toMatch(/STREAK_REMINDER_NOTIFICATION_ID/);
  });

  it('push notification setup requests sound and vibration on Android', async () => {
    const source = await import('./notifications.js?raw');
    expect(source.default).toMatch(/setNotificationChannelAsync\(DEFAULT_NOTIFICATION_CHANNEL_ID/);
    expect(source.default).toMatch(/sound:\s*'default'/);
    expect(source.default).toMatch(/vibrationPattern:\s*\[0, 250, 250, 250\]/);
    expect(source.default).toMatch(/enableVibrate:\s*true/);
  });

  it('notification settings exposes every user notification category', async () => {
    const source = await import('./screens/NotificationSettingsScreen.jsx?raw');
    expect(source.default).toMatch(/save\('prayerActivity'/);
    expect(source.default).toMatch(/save\('testimonyReactions'/);
    expect(source.default).toMatch(/save\('announcements'/);
    expect(source.default).toMatch(/save\('pushEnabled'/);
    expect(source.default).toMatch(/registerForPushNotifications\(\{ requirePermission: true \}\)/);
  });
});
