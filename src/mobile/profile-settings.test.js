import { describe, expect, it } from 'vitest';

describe('profile settings', () => {
  it('ProfileScreen includes routes to required major sections', async () => {
    const source = await import('./screens/ProfileScreen.jsx?raw');
    expect(source.default).toMatch(/myPrayers/);
    expect(source.default).toMatch(/answeredPrayers/);
    expect(source.default).toMatch(/myStats/);
    expect(source.default).toMatch(/settings/);
    expect(source.default).toMatch(/notifications/);
  });

  it('EditProfileScreen imports auth/profile update logic', async () => {
    const source = await import('./screens/EditProfileScreen.jsx?raw');
    expect(source.default).toMatch(/updateProfile/);
    expect(source.default).toMatch(/updateDoc/);
  });

  it('NotificationsScreen imports notification hook', async () => {
    const source = await import('./screens/NotificationsScreen.jsx?raw');
    expect(source.default).toMatch(/useNotifications/);
  });

  it('NotificationSettingsScreen imports settings hook', async () => {
    const source = await import('./screens/NotificationSettingsScreen.jsx?raw');
    expect(source.default).toMatch(/useNotificationSettings/);
  });

  it('Delete account uses Worker helper', async () => {
    const source = await import('./screens/SettingsScreen.jsx?raw');
    expect(source.default).toMatch(/deleteOwnAccount/);
  });

  it('Delete confirmation uses Alert.alert', async () => {
    const source = await import('./screens/SettingsScreen.jsx?raw');
    expect(source.default).toMatch(/Alert\.alert/);
    expect(source.default).not.toMatch(/window\.confirm/);
  });

  it('Support donation text remains disabled', async () => {
    const source = await import('./screens/SupportDonationScreen.jsx?raw');
    expect(source.default).toMatch(/not enabled yet/);
  });
});
