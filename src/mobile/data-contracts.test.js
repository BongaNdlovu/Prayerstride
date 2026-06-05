import { describe, expect, it } from 'vitest';

describe('data contracts', () => {
  it('api.js exports expected helpers', async () => {
    const source = await import('./api.js?raw');
    expect(source.default).toMatch(/export async function apiFetch/);
    expect(source.default).toMatch(/export function registerDevice/);
    expect(source.default).toMatch(/export function buildNotificationStreamUrl/);
    expect(source.default).toMatch(/export function prayForRequest/);
    expect(source.default).toMatch(/export function bookmarkPrayer/);
    expect(source.default).toMatch(/export function reactToTestimony/);
    expect(source.default).toMatch(/export function adminDeleteContent/);
    expect(source.default).toMatch(/export function adminSuspendUser/);
    expect(source.default).toMatch(/export function adminDeleteAccount/);
    expect(source.default).toMatch(/export function adminCreateAnnouncement/);
    expect(source.default).toMatch(/export function adminUpdateAnnouncement/);
    expect(source.default).toMatch(/export function adminArchiveAnnouncement/);
    expect(source.default).toMatch(/export function deleteOwnAccount/);
    expect(source.default).toMatch(/export function getPrayers/);
    expect(source.default).toMatch(/export function getCalendarEvents/);
    expect(source.default).toMatch(/export function getNotifications/);
    expect(source.default).toMatch(/export function getTestimonies/);
    expect(source.default).toMatch(/export function getAnnouncements/);
    expect(source.default).toMatch(/export function getDevotions/);
    expect(source.default).toMatch(/export function getPrayerSessions/);
    expect(source.default).toMatch(/export function getAdminReports/);
    expect(source.default).toMatch(/export function getAdminUsers/);
    expect(source.default).toMatch(/export function getGamificationSummary/);
    expect(source.default).toMatch(/export function getGamificationPreferences/);
    expect(source.default).toMatch(/export function updateGamificationPreferences/);
    expect(source.default).toMatch(/export function getGamificationLeaderboard/);
    expect(source.default).toMatch(/export function createPrayerSession/);
    expect(source.default).toMatch(/export function backfillGamification/);
    expect(source.default).not.toMatch(/createEncouragement/);
    expect(source.default).not.toMatch(/getWeeklyEncouragers/);
    expect(source.default).not.toMatch(/followUser/);
    expect(source.default).not.toMatch(/unfollowUser/);
    expect(source.default).not.toMatch(/addDoc\(collection\(db, ['"]announcements['"]\)/);
  });

  it('apiFetch includes Firebase ID token attachment', async () => {
    const source = await import('./api.js?raw');
    expect(source.default).toMatch(/getIdToken/);
    expect(source.default).toMatch(/Authorization.*Bearer/);
  });

  it('usePrayerData exports expected functions', async () => {
    const source = await import('./usePrayerData.js?raw');
    expect(source.default).toMatch(/export function usePrayers/);
    expect(source.default).toMatch(/export function useTestimonies/);
    expect(source.default).toMatch(/export async function addPrayer/);
    expect(source.default).toMatch(/export async function updatePrayer/);
    expect(source.default).toMatch(/export async function deletePrayer/);
    expect(source.default).toMatch(/export async function markAnswered/);
    expect(source.default).toMatch(/export async function addTestimony/);
  });

  it('usePrayerSessions exports expected functions', async () => {
    const source = await import('./usePrayerSessions.js?raw');
    expect(source.default).toMatch(/export function usePrayerSessions/);
    expect(source.default).toMatch(/export async function addPrayerSession/);
    expect(source.default).toMatch(/createPrayerSession/);
    expect(source.default).not.toMatch(/addDoc\(collection\(db, ['"]prayerSessions['"]\)/);
  });

  it('useReports exports expected functions', async () => {
    const source = await import('./useReports.js?raw');
    expect(source.default).toMatch(/export async function submitReport/);
    expect(source.default).toMatch(/export function useReports/);
    expect(source.default).toMatch(/export async function resolveReport/);
    expect(source.default).toMatch(/export async function dismissReport/);
  });

  it('useUsers exports expected functions', async () => {
    const source = await import('./useUsers.js?raw');
    expect(source.default).toMatch(/export function useUsers/);
    expect(source.default).toMatch(/export function useUserProfile/);
  });

  it('useNotifications exports expected functions', async () => {
    const source = await import('./useNotifications.js?raw');
    expect(source.default).toMatch(/export function useNotifications/);
    expect(source.default).toMatch(/export async function markNotificationRead/);
    expect(source.default).toMatch(/export async function markAllNotificationsRead/);
  });

  it('useNotificationSettings exports expected functions', async () => {
    const source = await import('./useNotificationSettings.js?raw');
    expect(source.default).toMatch(/export function useNotificationSettings/);
    expect(source.default).toMatch(/export async function updateNotificationSettings/);
  });

  it('gamification preferences and leaderboard hooks export expected functions', async () => {
    const preferences = await import('./useGamificationPreferences.js?raw');
    const leaderboard = await import('./useLeaderboard.js?raw');
    expect(preferences.default).toMatch(/export function useGamificationPreferences/);
    expect(preferences.default).toMatch(/export async function updateGamificationPreferences/);
    expect(leaderboard.default).toMatch(/export function useLeaderboard/);
    expect(leaderboard.default).toMatch(/getGamificationLeaderboard/);
  });

  it('useCalendarEvents exports real calendar contract helpers', async () => {
    const source = await import('./useCalendarEvents.js?raw');
    expect(source.default).toMatch(/export function useCalendarEvents/);
    expect(source.default).toMatch(/export async function createCalendarEvent/);
    expect(source.default).toMatch(/export async function updateCalendarEvent/);
    expect(source.default).toMatch(/export async function deleteCalendarEvent/);
    expect(source.default).toMatch(/export async function bookmarkDate/);
    expect(source.default).toMatch(/export async function unbookmarkDate/);
    expect(source.default).toMatch(/dateKey/);
    expect(source.default).toMatch(/getCalendarEvents/);
    expect(source.default).toMatch(/getCalendarBookmarks/);
    expect(source.default).not.toMatch(/onSnapshot/);
  });

  it('useAnnouncements exports read-only announcement hook', async () => {
    const source = await import('./useAnnouncements.js?raw');
    expect(source.default).toMatch(/export function useAnnouncements/);
    expect(source.default).toMatch(/status/);
    expect(source.default).toMatch(/startsAt/);
    expect(source.default).toMatch(/category/);
    expect(source.default).not.toMatch(/mockAnnouncements/);
    expect(source.default).not.toMatch(/type: 'Events'/);
    expect(source.default).not.toMatch(/date: 'May/);
  });

  it('AuthProvider exposes password management helpers', async () => {
    const source = await import('./AuthProvider.jsx?raw');
    expect(source.default).toMatch(/changePassword/);
    expect(source.default).toMatch(/resetPassword/);
    expect(source.default).toMatch(/reauthenticateWithCredential/);
    expect(source.default).toMatch(/termsAccepted/);
    expect(source.default).toMatch(/termsVersion/);
    expect(source.default).toMatch(/privacyVersion/);
    expect(source.default).toMatch(/deleteOwnAccount/);
    expect(source.default).toMatch(/deleteUser/);
  });

  it('notification helpers route mark-all through the Worker API', async () => {
    const source = await import('./useNotifications.js?raw');
    expect(source.default).toMatch(/markAllNotificationsReadApi/);
    expect(source.default).toMatch(/getNotifications/);
    expect(source.default).toMatch(/subscribeNotificationsInvalidated/);
    expect(source.default).not.toMatch(/writeBatch/);
    expect(source.default).not.toMatch(/onSnapshot/);
    expect(source.default).not.toMatch(/updateDoc\(doc\(db, 'notifications'/);
  });

  it('notification stream connects after auth', async () => {
    const api = await import('./api.js?raw');
    const gate = await import('./NotificationStreamGate.jsx?raw');
    const stream = await import('./notificationStream.js?raw');
    expect(api.default).toMatch(/access_token/);
    expect(gate.default).toMatch(/connectNotificationStream/);
    expect(stream.default).toMatch(/buildNotificationStreamUrl/);
    expect(stream.default).toMatch(/type === 'invalidate'/);
  });

  it('usePrayerData loads prayers from the Worker API', async () => {
    const source = await import('./usePrayerData.js?raw');
    expect(source.default).toMatch(/getPrayers/);
    expect(source.default).toMatch(/getTestimonies/);
    expect(source.default).not.toMatch(/collection\(db, 'prayers'\)/);
    expect(source.default).not.toMatch(/collection\(db, 'testimonies'\)/);
  });

  it('useAnnouncements loads from the Worker API', async () => {
    const source = await import('./useAnnouncements.js?raw');
    expect(source.default).toMatch(/getAnnouncements/);
    expect(source.default).not.toMatch(/onSnapshot/);
  });

  it('useContentCollections loads devotions from the Worker API', async () => {
    const source = await import('./useContentCollections.js?raw');
    expect(source.default).toMatch(/getDevotions/);
    expect(source.default).not.toMatch(/onSnapshot/);
  });

  it('useReports and useUsers load admin lists from the Worker API', async () => {
    const reports = await import('./useReports.js?raw');
    const users = await import('./useUsers.js?raw');
    expect(reports.default).toMatch(/getAdminReports/);
    expect(users.default).toMatch(/getAdminUsers/);
    expect(reports.default).not.toMatch(/onSnapshot/);
    expect(users.default).not.toMatch(/onSnapshot/);
  });

  it('usePrayerSessions loads from the Worker API', async () => {
    const source = await import('./usePrayerSessions.js?raw');
    expect(source.default).toMatch(/getPrayerSessions/);
    expect(source.default).not.toMatch(/onSnapshot/);
  });

  it('useIsAdmin has separate admin and suspended hooks', async () => {
    const source = await import('./useIsAdmin.js?raw');
    expect(source.default).toMatch(/export function useIsAdmin/);
    expect(source.default).toMatch(/export function useSuspendedStatus/);
    expect(source.default).toMatch(/getMyProfile/);
    expect(source.default).not.toMatch(/onSnapshot/);
  });

  it('native hooks do not import web-only libraries', async () => {
    const sources = await Promise.all([
      import('./api.js?raw'),
      import('./usePrayerData.js?raw'),
      import('./usePrayerSessions.js?raw'),
      import('./useReports.js?raw'),
      import('./useUsers.js?raw'),
      import('./useNotifications.js?raw'),
      import('./useNotificationSettings.js?raw'),
      import('./useIsAdmin.js?raw'),
      import('./useCalendarEvents.js?raw'),
      import('./useAnnouncements.js?raw'),
    ]);

    for (const { default: source } of sources) {
      expect(source).not.toMatch(/from ['"]react-dom['"]/);
      expect(source).not.toMatch(/window\.confirm/);
      expect(source).not.toMatch(/document\./);
      expect(source).not.toMatch(/localStorage/);
    }
  });
});
