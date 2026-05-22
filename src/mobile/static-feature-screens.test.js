import { describe, expect, it } from 'vitest';

const staticScreens = [
  'FollowingScreen',
  'AnnouncementsScreen',
  'DevotionsScreen',
  'GuideDetailScreen',
  'LessonReaderScreen',
  'CalendarScreen',
  'RemindersScreen',
  'AchievementsScreen',
  'QuickActionsScreen',
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

  it('Quick Actions includes expected route names', async () => {
    const source = await import('./screens/QuickActionsScreen.jsx?raw');
    expect(source.default).toMatch(/create/);
    expect(source.default).toMatch(/createTestimony/);
    expect(source.default).toMatch(/myPrayers/);
    expect(source.default).toMatch(/prayerStopwatch/);
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
      'CalendarScreen',
      'DevotionsScreen',
      'FollowingScreen',
      'GuideDetailScreen',
      'HomeScreen',
      'LessonReaderScreen',
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
});
