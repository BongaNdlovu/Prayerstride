import { describe, expect, it } from 'vitest';

describe('data contracts', () => {
  it('api.js exports expected helpers', async () => {
    const source = await import('./api.js?raw');
    expect(source.default).toMatch(/export async function apiFetch/);
    expect(source.default).toMatch(/export function registerDevice/);
    expect(source.default).toMatch(/export function prayForRequest/);
    expect(source.default).toMatch(/export function reactToTestimony/);
    expect(source.default).toMatch(/export function adminDeleteContent/);
    expect(source.default).toMatch(/export function adminSuspendUser/);
    expect(source.default).toMatch(/export function adminDeleteAccount/);
    expect(source.default).toMatch(/export function adminCreateAnnouncement/);
    expect(source.default).toMatch(/export function adminUpdateAnnouncement/);
    expect(source.default).toMatch(/export function adminArchiveAnnouncement/);
    expect(source.default).toMatch(/export function deleteOwnAccount/);
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
  });

  it('useEncouragements exports expected functions', async () => {
    const source = await import('./useEncouragements.js?raw');
    expect(source.default).toMatch(/export function useEncouragements/);
    expect(source.default).toMatch(/export async function addEncouragement/);
    expect(source.default).toMatch(/export async function updateEncouragement/);
    expect(source.default).toMatch(/export async function deleteEncouragement/);
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

  it('useCalendarEvents exports real calendar contract helpers', async () => {
    const source = await import('./useCalendarEvents.js?raw');
    expect(source.default).toMatch(/export function useCalendarEvents/);
    expect(source.default).toMatch(/export async function createCalendarEvent/);
    expect(source.default).toMatch(/export async function updateCalendarEvent/);
    expect(source.default).toMatch(/export async function deleteCalendarEvent/);
    expect(source.default).toMatch(/export async function bookmarkDate/);
    expect(source.default).toMatch(/export async function unbookmarkDate/);
    expect(source.default).toMatch(/ownerUid/);
    expect(source.default).toMatch(/dateKey/);
    expect(source.default).toMatch(/calendarEvents/);
    expect(source.default).toMatch(/calendarBookmarks/);
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
  });

  it('useIsAdmin has separate admin and suspended hooks', async () => {
    const source = await import('./useIsAdmin.js?raw');
    expect(source.default).toMatch(/export function useIsAdmin/);
    expect(source.default).toMatch(/export function useSuspendedStatus/);
  });

  it('native hooks do not import web-only libraries', async () => {
    const sources = await Promise.all([
      import('./api.js?raw'),
      import('./usePrayerData.js?raw'),
      import('./usePrayerSessions.js?raw'),
      import('./useEncouragements.js?raw'),
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
