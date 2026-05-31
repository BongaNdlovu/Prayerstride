import { describe, expect, it } from 'vitest';

describe('native UI kit', () => {
  it('theme exports expected keys', async () => {
    const source = await import('../theme.js?raw');
    expect(source.default).toMatch(/export const colors/);
    expect(source.default).toMatch(/#D7A552/);
    expect(source.default).toMatch(/#F7F0E4/);
    expect(source.default).toMatch(/#101014/);
    expect(source.default).toMatch(/export const shadow/);
    expect(source.default).toMatch(/export const glass/);
    expect(source.default).toMatch(/export const cinematicScreen/);
    expect(source.default).toMatch(/export const scenes/);
    expect(source.default).toMatch(/export const fonts/);
    expect(source.default).toMatch(/export const typography/);
    expect(source.default).toMatch(/dawn/);
    expect(source.default).toMatch(/bible/);
    expect(source.default).toMatch(/community/);
    expect(source.default).toMatch(/chapel/);
    expect(source.default).toMatch(/answered/);
    expect(source.default).toMatch(/texture/);
  });

  it('shared components export successfully', { timeout: 15000 }, async () => {
    const modules = [
      'CinematicScreen',
      'ScreenScaffold',
      'PageHero',
      'GlassCard',
      'AppHeader',
      'BottomTabs',
      'EmptyState',
      'ToggleRow',
      'StatCard',
      'PrayerCard',
      'TestimonyCard',
      'MiniLineChart',
      'WeeklyBarChart',
      'StreakCalendar',
      'AsyncState',
      'MotionPressable',
      'Heading',
      'BodyText',
      'PrimaryButton',
      'SegmentedControl',
      'PillTabs',
      'ProgressRing',
      'SectionDivider',
      'LogoMark',
    ];

    for (const name of modules) {
      const source = await import(`../components/${name}.jsx?raw`);
      expect(source.default).toMatch(/export default/);
    }
  });

  it('MiniLineChart imports react-native-svg', async () => {
    const source = await import('../components/MiniLineChart.jsx?raw');
    expect(source.default).toMatch(/react-native-svg/);
  });

  it('shared native components do not import react-dom or browser APIs', async () => {
    const names = ['CinematicScreen', 'ScreenScaffold', 'PageHero', 'GlassCard', 'AppHeader', 'BottomTabs', 'EmptyState', 'ToggleRow', 'StatCard', 'PrayerCard', 'TestimonyCard', 'MiniLineChart', 'WeeklyBarChart', 'StreakCalendar', 'AsyncState', 'MotionPressable'];

    for (const name of names) {
      const source = await import(`../components/${name}.jsx?raw`);
      expect(source.default).not.toMatch(/from ['"]react-dom['"]/);
      expect(source.default).not.toMatch(/window\.confirm/);
      expect(source.default).not.toMatch(/document\./);
      expect(source.default).not.toMatch(/localStorage/);
      expect(source.default).not.toMatch(/tailwind/);
    }
  });
});
