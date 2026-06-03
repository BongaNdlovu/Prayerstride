import { describe, expect, it } from 'vitest';

describe('admin flow', () => {
  it('AdminDashboardScreen imports useIsAdmin', async () => {
    const source = await import('./screens/AdminDashboardScreen.jsx?raw');
    expect(source.default).toMatch(/useIsAdmin/);
  });

  it('AdminDashboardScreen imports report/user hooks', async () => {
    const source = await import('./screens/AdminDashboardScreen.jsx?raw');
    expect(source.default).toMatch(/useReports/);
    expect(source.default).toMatch(/useUsers/);
  });

  it('AdminDashboardScreen imports moderation API helpers', async () => {
    const source = await import('./screens/AdminDashboardScreen.jsx?raw');
    expect(source.default).toMatch(/adminDeleteContent/);
    expect(source.default).toMatch(/adminSuspendUser/);
    expect(source.default).toMatch(/adminDeleteAccount/);
  });

  it('ReportDetailsScreen imports resolve/dismiss helpers', async () => {
    const source = await import('./screens/ReportDetailsScreen.jsx?raw');
    expect(source.default).toMatch(/resolveReport/);
    expect(source.default).toMatch(/dismissReport/);
  });

  it('Admin screens use Alert.alert for destructive actions', async () => {
    const sources = await Promise.all([
      import('./screens/AdminDashboardScreen.jsx?raw'),
      import('./screens/ReportDetailsScreen.jsx?raw'),
    ]);
    for (const { default: src } of sources) {
      expect(src).toMatch(/Alert\.alert/);
      expect(src).not.toMatch(/window\.confirm/);
    }
  });

  it('Admin source includes non-admin gate logic', async () => {
    const source = await import('./screens/AdminDashboardScreen.jsx?raw');
    expect(source.default).toMatch(/isAdmin/);
    expect(source.default).toMatch(/denied/);
  });

  it('Admin dashboard passes the signed-in user to admin data hooks', async () => {
    const source = await import('./screens/AdminDashboardScreen.jsx?raw');
    expect(source.default).toMatch(/useReports\(user,\s*true\)/);
    expect(source.default).toMatch(/useUsers\(user,\s*true\)/);
  });

  it('Analytics panel guards stale requests and limits chart labels', async () => {
    const source = await import('./screens/AdminDashboardScreen.jsx?raw');
    expect(source.default).toMatch(/requestIdRef/);
    expect(source.default).toMatch(/disabled=\{loading\}/);
    expect(source.default).toMatch(/slice\(-14\)/);
  });

  it('Admin and suspended hooks are separate', async () => {
    const source = await import('./useIsAdmin.js?raw');
    expect(source.default).toMatch(/export function useIsAdmin/);
    expect(source.default).toMatch(/export function useSuspendedStatus/);
  });

  it('Admin loading and data failures render shared async states before content', async () => {
    const source = await import('./screens/AdminDashboardScreen.jsx?raw');
    expect(source.default).toMatch(/adminLoading/);
    expect(source.default).toMatch(/dataError/);
    expect(source.default).toMatch(/<AsyncState/);
  });

  it('Admin mutations surface rejected actions', async () => {
    const dashboard = await import('./screens/AdminDashboardScreen.jsx?raw');
    const details = await import('./screens/ReportDetailsScreen.jsx?raw');
    expect(dashboard.default).toMatch(/runAdminAction/);
    expect(details.default).toMatch(/runReportAction/);
    expect(details.default).not.toMatch(/Alert\.alert\('Error'/);
  });

  it('Archived announcement loading checks the signed-in admin user', async () => {
    const hook = await import('./useAnnouncements.js?raw');
    const dashboard = await import('./screens/AdminDashboardScreen.jsx?raw');
    expect(hook.default).toMatch(/useIsAdmin\(options\.user\)/);
    expect(dashboard.default).toMatch(/includeArchived:\s*true,\s*user/);
  });

  it('Client admin state excludes suspended profiles', async () => {
    const source = await import('./useIsAdmin.js?raw');
    expect(source.default).toMatch(/profile\?\.role === 'admin' && profile\?\.suspended !== true/);
  });
});
