import { describe, expect, it } from 'vitest';

describe('profile settings', () => {
  it('ProfileScreen includes routes to required major sections', async () => {
    const source = await import('./screens/ProfileScreen.jsx?raw');
    expect(source.default).toMatch(/stride/);
    expect(source.default).toMatch(/leaderboard/);
    expect(source.default).toMatch(/achievements/);
    expect(source.default).toMatch(/reminderSettings/);
    expect(source.default).toMatch(/settings/);
    expect(source.default).toMatch(/notifications/);
  });

  it('EditProfileScreen imports auth/profile update logic', async () => {
    const source = await import('./screens/EditProfileScreen.jsx?raw');
    const avatarUpload = await import('./avatarUploadErrors.js?raw');
    expect(source.default).toMatch(/updateProfile/);
    expect(source.default).toMatch(/updateMyProfile/);
    expect(source.default).not.toMatch(/updateDoc/);
    expect(source.default).not.toMatch(/firebase\/storage/);
    expect(source.default).not.toMatch(/showOnEncouragementBoard/);
    expect(source.default).toMatch(/expo-image-picker/);
    expect(source.default).not.toMatch(/MediaTypeOptions/);
    expect(source.default).toMatch(/changePassword/);
    expect(source.default).toMatch(/resetPassword/);
    expect(source.default).toMatch(/handle/);
    expect(source.default).toMatch(/prepareAvatarBlob/);
    expect(source.default).toMatch(/uploadAvatarFile/);
    expect(source.default).toMatch(/Profile photo upload failed/);
    expect(source.default).toMatch(/onError=\{\(\) => setPhotoLoadFailed\(true\)\}/);
    const apiSource = await import('./api.js?raw');
    expect(apiSource.default).toMatch(/navigator\?\.product === 'ReactNative'/);
    expect(apiSource.default).toMatch(/file\.uri/);
    expect(apiSource.default).toMatch(/file\.blob/);
    expect(apiSource.default).toMatch(/formData\.append\('avatar', file\.blob/);
    expect(avatarUpload.default).toMatch(/storage\/quota-exceeded/);
    expect(source.default).toMatch(/onBack=\{onBack\}/);
  });

  it('ProfileScreen falls back to initials when a saved avatar URL fails to load', async () => {
    const source = await import('./screens/ProfileScreen.jsx?raw');
    expect(source.default).toMatch(/avatarLoadFailed/);
    expect(source.default).toMatch(/onError=\{\(\) => setAvatarLoadFailed\(true\)\}/);
  });

  it('HomeScreen header avatar follows the saved profile photo', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/useUserProfile/);
    expect(source.default).toMatch(/headerAvatarUri/);
    expect(source.default).toMatch(/onError=\{\(\) => setHeaderAvatarLoadFailed\(true\)\}/);
  });

  it('HomeScreen hides bottom tabs while feed overlays are open', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    const app = await import('../../app/index.jsx?raw');
    expect(source.default).toMatch(/onTabBarHiddenChange\?\. \(overlayOpen\)|onTabBarHiddenChange\?\.\(overlayOpen\)/);
    expect(source.default).toMatch(/BackHandler\.addEventListener\('hardwareBackPress'/);
    expect(app.default).toMatch(/tabBarHidden/);
    expect(app.default).toMatch(/isMainTab && !tabBarHidden/);
  });

  it('LeaderboardScreen renders profile photos from leaderboard rows', async () => {
    const source = await import('./screens/LeaderboardScreen.jsx?raw');
    expect(source.default).toMatch(/LeaderboardAvatar/);
    expect(source.default).toMatch(/cleanOptionalPhotoURL\(row\?\.photoURL\)/);
    expect(source.default).toMatch(/onError=\{\(\) => setImageLoadFailed\(true\)\}/);
  });

  it('mock leaderboard rows include the current user profile photo', async () => {
    const source = await import('./mockData.js?raw');
    expect(source.default).toMatch(/gamification\/leaderboard/);
    expect(source.default).toMatch(/leaderboardFor/);
    expect(source.default).toMatch(/photoURL: state\.profile\.photoURL \|\| null/);
    expect(source.default).toMatch(/state\.users = state\.users\.map/);
  });

  it('SettingsScreen links to about and copyright routes', async () => {
    const source = await import('./screens/SettingsScreen.jsx?raw');
    expect(source.default).toMatch(/about/);
    expect(source.default).toMatch(/copyright/);
  });

  it('Admin dashboard uses Worker announcement APIs only', async () => {
    const source = await import('./screens/AdminDashboardScreen.jsx?raw');
    expect(source.default).toMatch(/adminCreateAnnouncement/);
    expect(source.default).toMatch(/adminArchiveAnnouncement/);
    expect(source.default).not.toMatch(/collection\(db, ['"]announcements['"]\)/);
  });

  it('NotificationsScreen imports notification hook', async () => {
    const source = await import('./screens/NotificationsScreen.jsx?raw');
    expect(source.default).toMatch(/useNotifications/);
  });

  it('NotificationSettingsScreen imports settings hook', async () => {
    const source = await import('./screens/NotificationSettingsScreen.jsx?raw');
    expect(source.default).toMatch(/useNotificationSettings/);
  });

  it('Delete account uses AuthProvider deleteAccount', async () => {
    const source = await import('./screens/SettingsScreen.jsx?raw');
    expect(source.default).toMatch(/deleteAccount/);
  });

  it('Delete confirmation uses Alert.alert', async () => {
    const source = await import('./screens/SettingsScreen.jsx?raw');
    expect(source.default).toMatch(/Alert\.alert/);
    expect(source.default).not.toMatch(/window\.confirm/);
  });

  it('Support donation is removed from prototype navigation', async () => {
    const app = await import('../../app/index.jsx?raw');
    expect(app.default).not.toMatch(/case 'support'/);
  });
});
