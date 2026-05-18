import { describe, expect, it } from 'vitest';

describe('native UI kit', () => {
  it('theme exports expected keys', async () => {
    const source = await import('../theme.js?raw');
    expect(source.default).toMatch(/export const colors/);
    expect(source.default).toMatch(/#C8892B/);
    expect(source.default).toMatch(/#F8F3EA/);
    expect(source.default).toMatch(/#101820/);
    expect(source.default).toMatch(/export const shadow/);
    expect(source.default).toMatch(/export const glass/);
    expect(source.default).toMatch(/export const cinematicScreen/);
    expect(source.default).toMatch(/export const scenes/);
    expect(source.default).toMatch(/dawn/);
    expect(source.default).toMatch(/bible/);
    expect(source.default).toMatch(/community/);
    expect(source.default).toMatch(/chapel/);
    expect(source.default).toMatch(/answered/);
    expect(source.default).toMatch(/texture/);
  });

  it('shared components export successfully', async () => {
    const modules = [
      'CinematicScreen',
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
      'StreakCalendar',
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
    const names = ['CinematicScreen', 'PageHero', 'GlassCard', 'AppHeader', 'BottomTabs', 'EmptyState', 'ToggleRow', 'StatCard', 'PrayerCard', 'TestimonyCard', 'MiniLineChart', 'StreakCalendar'];

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
