import { describe, expect, it } from 'vitest';

describe('security hardening', () => {
  it('disables Android release backups and keeps overlay permission out of production', async () => {
    const source = await import('../../android/app/src/main/AndroidManifest.xml?raw');
    expect(source.default).toMatch(/android:allowBackup="false"/);
    expect(source.default).not.toMatch(/android\.permission\.SYSTEM_ALERT_WINDOW/);
  });

  it('keeps overlay permission limited to the debug manifest', async () => {
    const source = await import('../../android/app/src/debug/AndroidManifest.xml?raw');
    expect(source.default).toMatch(/android\.permission\.SYSTEM_ALERT_WINDOW/);
  });

  it('prevents narrow admin metric columns on smartphone screens', async () => {
    const stats = await import('./components/StatCard.jsx?raw');
    const admin = await import('./screens/AdminDashboardScreen.jsx?raw');
    expect(stats.default).toMatch(/style=\{\[styles\.card, style\]\}/);
    expect(admin.default).toMatch(/adminStatCard:\s*\{\s*minWidth:\s*140\s*\}/);
  });

  it('limits avatar writes to the single profile image path used by the app', async () => {
    const source = await import('../../storage.rules?raw');
    expect(source.default).toMatch(/fileName == 'profile\.jpg'/);
    expect(source.default).toMatch(/request\.resource\.size < 2 \* 1024 \* 1024/);
  });

  it('denies suspended admins in the shared Worker authorization helper', async () => {
    const source = await import('../../worker/index.js?raw');
    expect(source.default).toMatch(/data\.role === 'admin' && data\.suspended !== true/);
  });

  it('cascades content deletion and removes account-owned interactions', async () => {
    const source = await import('../../worker/index.js?raw');
    expect(source.default).toMatch(/deleteContentAndActions/);
    expect(source.default).toMatch(/processOwnedActionCollection\('prays'\)/);
    expect(source.default).toMatch(/processOwnedActionCollection\('reactions'\)/);
  });

  it('allows account deletion retries after partial cleanup', async () => {
    const source = await import('../../worker/index.js?raw');
    expect(source.default).toMatch(/if \(userDoc\.exists\) addDelete\(userDoc\.name\)/);
    expect(source.default).toMatch(/String\(message\)\.includes\('USER_NOT_FOUND'\)/);
    expect(source.default).toMatch(/!targetUser\.exists && !existingDeletionJob\.exists/);
  });
});
