import { describe, expect, it } from 'vitest';

describe('native UI kit', () => {
  it('theme exports expected keys', async () => {
    const source = await import('../theme.js?raw');
    expect(source.default).toMatch(/export const colors/);
    expect(source.default).toMatch(/#B8924A/);
    expect(source.default).toMatch(/#111827/);
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
      'ScreenScaffold',
      'GlassCard',
      'AppHeader',
      'BottomTabs',
      'EmptyState',
      'ToggleRow',
      'StatCard',
      'PrayerCard',
      'WeeklyBarChart',
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

  it('shared native components do not import react-dom or browser APIs', async () => {
    const names = ['ScreenScaffold', 'GlassCard', 'AppHeader', 'BottomTabs', 'EmptyState', 'ToggleRow', 'StatCard', 'PrayerCard', 'WeeklyBarChart', 'AsyncState', 'MotionPressable'];

    for (const name of names) {
      const source = await import(`../components/${name}.jsx?raw`);
      expect(source.default).not.toMatch(/from ['"]react-dom['"]/);
      expect(source.default).not.toMatch(/window\.confirm/);
      expect(source.default).not.toMatch(/document\./);
      expect(source.default).not.toMatch(/localStorage/);
      expect(source.default).not.toMatch(/tailwind/);
    }
  });

  it('ScreenScaffold constrains content to the smartphone viewport', async () => {
    const source = await import('../components/ScreenScaffold.jsx?raw');
    expect(source.default).toMatch(/style=\{styles\.scroll\}/);
    expect(source.default).toMatch(/horizontal=\{false\}/);
    expect(source.default).toMatch(/flexGrow:\s*1/);
    expect(source.default).toMatch(/width:\s*'100%'/);
    expect(source.default).toMatch(/centerContent/);
    expect(source.default).toMatch(/justifyContent:\s*'center'/);
  });

  it('uses the supplied transparent logo for in-app branding', async () => {
    const source = await import('../components/LogoMark.jsx?raw');
    expect(source.default).toMatch(/logo-transparent\.png/);
    expect(source.default).toMatch(/<Image/);
    expect(source.default).toMatch(/resizeMode="contain"/);
    expect(source.default).not.toMatch(/react-native-svg/);
  });

  it('configures bundled and web logo assets without duplicating native Android config', async () => {
    const source = await import('../../../app.json?raw');
    expect(source.default).toMatch(/"assets\/icon\.png"/);
    expect(source.default).toMatch(/"assets\/adaptive-icon\.png"/);
    expect(source.default).toMatch(/"assets\/logo-transparent\.png"/);
    expect(source.default).toMatch(/"favicon": "\.\/assets\/favicon\.png"/);
    expect(source.default).not.toMatch(/"adaptiveIcon"/);
    expect(source.default).not.toMatch(/"splash"/);
  });
});
