import { describe, expect, it } from 'vitest';

describe('HelpCenterScreen content', () => {
  it('documents user-facing app areas without exposing admin-only tools', async () => {
    const source = (await import('../../../src/mobile/screens/HelpCenterScreen.jsx?raw')).default;

    [
      'Feed and Prayer Requests',
      'Praying With The Timer',
      'Ranks',
      'Stride and Achievements',
      'Profile and Prayer Times',
      'Notifications and Settings',
      'Privacy and Safety',
      'support@prayerstride.app',
    ].forEach((expectedText) => {
      expect(source).toContain(expectedText);
    });

    [
      'Admin Dashboard',
      'adminDashboard',
      'AdminAnalytics',
      'AdminReports',
      'ReportDetailsScreen',
    ].forEach((adminOnlyText) => {
      expect(source).not.toContain(adminOnlyText);
    });
  });
});
