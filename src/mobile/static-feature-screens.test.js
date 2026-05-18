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
  it('all static screens export successfully', async () => {
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

  it('Reminders screen uses AsyncStorage', async () => {
    const source = await import('./screens/RemindersScreen.jsx?raw');
    expect(source.default).toMatch(/AsyncStorage/);
  });

  it('mock data imports resolve', async () => {
    const screens = ['FollowingScreen', 'AnnouncementsScreen', 'DevotionsScreen', 'CalendarScreen', 'AchievementsScreen'];
    for (const name of screens) {
      const source = await import(`./screens/${name}.jsx?raw`);
      expect(source.default).toMatch(/mockData/);
    }
  });
});
