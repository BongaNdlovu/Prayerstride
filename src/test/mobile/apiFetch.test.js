import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../../mobile/api.js';
import { createFetchAbortContext } from '../../mobile/api.js';
import { auth } from '../../mobile/firebase.js';

describe('createFetchAbortContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('aborts after timeout when no external signal is provided', () => {
    const context = createFetchAbortContext(undefined, 1000);
    expect(context.signal.aborted).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(context.signal.aborted).toBe(true);
    expect(context.timedOut()).toBe(true);
    context.cleanup();
  });

  it('aborts when an external signal aborts', () => {
    const external = new AbortController();
    const context = createFetchAbortContext(external.signal, 15000);
    external.abort();
    expect(context.signal.aborted).toBe(true);
    expect(context.timedOut()).toBe(false);
    context.cleanup();
  });

  it('removes external abort listener on cleanup', () => {
    const external = new AbortController();
    const removeListener = vi.spyOn(external.signal, 'removeEventListener');
    const context = createFetchAbortContext(external.signal, 15000);
    context.cleanup();
    expect(removeListener).toHaveBeenCalled();
  });
});

const API_WRAPPER_CASES = [
  { name: 'getMyProfile', run: () => api.getMyProfile(), path: '/api/me/profile' },
  {
    name: 'updateMyProfile',
    run: () => api.updateMyProfile({ displayName: 'Alex' }),
    path: '/api/me/profile',
    method: 'POST',
    body: { displayName: 'Alex' },
  },
  {
    name: 'createCalendarEvent',
    run: () => api.createCalendarEvent({ title: 'Prayer walk', dateKey: '2026-06-06' }),
    path: '/api/calendar-events',
    method: 'POST',
    body: { title: 'Prayer walk', dateKey: '2026-06-06' },
  },
  {
    name: 'updateCalendarEvent',
    run: () => api.updateCalendarEvent('event/1', { title: 'Updated' }),
    path: '/api/calendar-events/event%2F1/update',
    method: 'POST',
    body: { title: 'Updated' },
  },
  { name: 'deleteCalendarEvent', run: () => api.deleteCalendarEvent('event/1'), path: '/api/calendar-events/event%2F1', method: 'DELETE' },
  { name: 'bookmarkCalendarDate', run: () => api.bookmarkCalendarDate('2026-06-06'), path: '/api/calendar-bookmarks/2026-06-06', method: 'POST', body: {} },
  { name: 'unbookmarkCalendarDate', run: () => api.unbookmarkCalendarDate('2026-06-06'), path: '/api/calendar-bookmarks/2026-06-06', method: 'DELETE' },
  { name: 'markNotificationRead', run: () => api.markNotificationRead('note/1'), path: '/api/notifications/note%2F1/read', method: 'POST', body: {} },
  { name: 'markAllNotificationsRead', run: () => api.markAllNotificationsRead(), path: '/api/notifications/read-all', method: 'POST', body: {} },
  {
    name: 'updateNotificationSettings',
    run: () => api.updateNotificationSettings({ pushEnabled: false }),
    path: '/api/notification-settings',
    method: 'POST',
    body: { pushEnabled: false },
  },
  {
    name: 'getPrayers',
    run: () => api.getPrayers({ scope: 'mine', status: 'active', category: 'health', urgent: true, cursor: 'cursor-1', limit: 15 }),
    path: '/api/prayers?scope=mine&status=active&category=health&urgent=1&cursor=cursor-1&limit=15',
  },
  { name: 'getCalendarEvents', run: () => api.getCalendarEvents(), path: '/api/calendar-events' },
  { name: 'getCalendarBookmarks', run: () => api.getCalendarBookmarks(), path: '/api/calendar-bookmarks' },
  { name: 'getNotifications', run: () => api.getNotifications(), path: '/api/notifications' },
  { name: 'getNotificationSettings', run: () => api.getNotificationSettings(), path: '/api/notification-settings' },
  { name: 'getTestimonies', run: () => api.getTestimonies({ limit: 7 }), path: '/api/testimonies?limit=7' },
  { name: 'getAnnouncements', run: () => api.getAnnouncements({ includeArchived: true }), path: '/api/announcements?includeArchived=1' },
  { name: 'getDevotions', run: () => api.getDevotions(), path: '/api/devotions' },
  { name: 'getStudyGuide', run: () => api.getStudyGuide('guide one'), path: '/api/study-guides/guide%20one' },
  { name: 'getStudyGuideLesson', run: () => api.getStudyGuideLesson('guide one', 'lesson/1'), path: '/api/study-guides/guide%20one/lessons/lesson%2F1' },
  { name: 'getStudyGuideLessonList', run: () => api.getStudyGuideLesson('guide one'), path: '/api/study-guides/guide%20one/lessons' },
  { name: 'getPrayerSessions', run: () => api.getPrayerSessions(), path: '/api/prayer-sessions' },
  { name: 'getAdminReports', run: () => api.getAdminReports(), path: '/api/admin/reports' },
  { name: 'getAdminUsers', run: () => api.getAdminUsers(), path: '/api/admin/users' },
  { name: 'bootstrapOwner', run: () => api.bootstrapOwner(), path: '/api/account/bootstrap-owner', method: 'POST', body: {} },
  {
    name: 'completeRegistration',
    run: () => api.completeRegistration({ acceptedTerms: true }),
    path: '/api/account/complete-registration',
    method: 'POST',
    body: { acceptedTerms: true },
  },
  { name: 'resendGuardianApproval', run: () => api.resendGuardianApproval(), path: '/api/account/resend-guardian-approval', method: 'POST', body: {} },
  {
    name: 'registerDevice',
    run: () => api.registerDevice({ token: 'device-token' }),
    path: '/api/devices/register',
    method: 'POST',
    body: { token: 'device-token' },
  },
  { name: 'createPrayer', run: () => api.createPrayer({ body: 'Please pray' }), path: '/api/prayers', method: 'POST', body: { body: 'Please pray' } },
  { name: 'updatePrayer', run: () => api.updatePrayer('prayer/1', { privacy: 'private' }), path: '/api/prayers/prayer%2F1/update', method: 'POST', body: { privacy: 'private' } },
  { name: 'markPrayerAnswered', run: () => api.markPrayerAnswered('prayer/1'), path: '/api/prayers/prayer%2F1/mark-answered', method: 'POST', body: {} },
  { name: 'deletePrayer', run: () => api.deletePrayer('prayer/1'), path: '/api/prayers/prayer%2F1', method: 'DELETE' },
  { name: 'prayForRequest', run: () => api.prayForRequest('prayer/1'), path: '/api/prayers/prayer%2F1/pray', method: 'POST', body: {} },
  { name: 'createTestimony', run: () => api.createTestimony({ body: 'Answered' }), path: '/api/testimonies', method: 'POST', body: { body: 'Answered' } },
  { name: 'updateTestimony', run: () => api.updateTestimony('testimony/1', { body: 'Updated' }), path: '/api/testimonies/testimony%2F1/update', method: 'POST', body: { body: 'Updated' } },
  { name: 'deleteTestimony', run: () => api.deleteTestimony('testimony/1'), path: '/api/testimonies/testimony%2F1', method: 'DELETE' },
  { name: 'reactToTestimony', run: () => api.reactToTestimony('testimony/1', 'amen'), path: '/api/testimonies/testimony%2F1/react', method: 'POST', body: { reaction: 'amen' } },
  { name: 'listBlocks', run: () => api.listBlocks(), path: '/api/blocks' },
  { name: 'blockUser', run: () => api.blockUser('blocked/user'), path: '/api/blocks/blocked%2Fuser', method: 'POST', body: {} },
  { name: 'unblockUser', run: () => api.unblockUser('blocked/user'), path: '/api/blocks/blocked%2Fuser', method: 'DELETE' },
  { name: 'bookmarkPrayer', run: () => api.bookmarkPrayer('prayer/1'), path: '/api/prayer-bookmarks/prayer%2F1', method: 'POST', body: {} },
  { name: 'getPrayerBookmark', run: () => api.getPrayerBookmark('prayer/1'), path: '/api/prayer-bookmarks/prayer%2F1' },
  { name: 'unbookmarkPrayer', run: () => api.unbookmarkPrayer('prayer/1'), path: '/api/prayer-bookmarks/prayer%2F1', method: 'DELETE' },
  { name: 'submitContentReport', run: () => api.submitContentReport({ targetId: 'p1' }), path: '/api/reports', method: 'POST', body: { targetId: 'p1' } },
  { name: 'adminUpdateReport', run: () => api.adminUpdateReport('report/1', 'resolved'), path: '/api/admin/reports/update', method: 'POST', body: { reportId: 'report/1', status: 'resolved' } },
  { name: 'adminDeleteContent', run: () => api.adminDeleteContent('prayer/1', 'prayer'), path: '/api/admin/delete-content', method: 'POST', body: { targetId: 'prayer/1', targetType: 'prayer' } },
  { name: 'adminSuspendUser', run: () => api.adminSuspendUser('user/1', 'spam'), path: '/api/admin/suspend-user', method: 'POST', body: { targetUid: 'user/1', reason: 'spam' } },
  { name: 'adminUnsuspendUser', run: () => api.adminUnsuspendUser('user/1'), path: '/api/admin/unsuspend-user', method: 'POST', body: { targetUid: 'user/1' } },
  { name: 'adminDeleteAccount', run: () => api.adminDeleteAccount('user/1'), path: '/api/admin/delete-account', method: 'POST', body: { targetUid: 'user/1' } },
  { name: 'deleteOwnAccount', run: () => api.deleteOwnAccount(), path: '/api/account', method: 'DELETE' },
  { name: 'getSpiritualEngagementMetrics', run: () => api.getSpiritualEngagementMetrics(14), path: '/api/admin/spiritual-engagement?days=14' },
  { name: 'adminCreateAnnouncement', run: () => api.adminCreateAnnouncement({ title: 'News' }), path: '/api/admin/announcements/create', method: 'POST', body: { title: 'News' } },
  { name: 'adminUpdateAnnouncement', run: () => api.adminUpdateAnnouncement({ announcementId: 'a1' }), path: '/api/admin/announcements/update', method: 'POST', body: { announcementId: 'a1' } },
  { name: 'adminArchiveAnnouncement', run: () => api.adminArchiveAnnouncement('a1'), path: '/api/admin/announcements/archive', method: 'POST', body: { announcementId: 'a1' } },
  { name: 'getGamificationSummary', run: () => api.getGamificationSummary('Africa/Johannesburg'), path: '/api/gamification/summary?timeZone=Africa%2FJohannesburg' },
  { name: 'getGamificationPreferences', run: () => api.getGamificationPreferences(), path: '/api/gamification/preferences' },
  { name: 'updateGamificationPreferences', run: () => api.updateGamificationPreferences({ showRank: false }), path: '/api/gamification/preferences', method: 'POST', body: { showRank: false } },
  { name: 'getGamificationLeaderboard', run: () => api.getGamificationLeaderboard('monthly', 10), path: '/api/gamification/leaderboard?scope=monthly&limit=10' },
  { name: 'updateGamificationTimeZone', run: () => api.updateGamificationTimeZone('UTC'), path: '/api/gamification/timezone', method: 'POST', body: { timeZone: 'UTC' } },
  { name: 'backfillGamification', run: () => api.backfillGamification('UTC'), path: '/api/gamification/backfill', method: 'POST', body: { timeZone: 'UTC' } },
  {
    name: 'createPrayerSession',
    run: () => api.createPrayerSession({ durationSeconds: 90, timeZone: 'UTC' }),
    path: '/api/prayer-sessions',
    method: 'POST',
    body: { durationSeconds: 90, timeZone: 'UTC' },
  },
];

function jsonResponse(body = { ok: true }, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: vi.fn(async () => body),
  };
}

function lastFetchCall() {
  const [url, options] = fetch.mock.calls.at(-1);
  return { url: String(url), options: options || {} };
}

describe('mobile API backend wiring', () => {
  beforeEach(() => {
    vi.useRealTimers();
    auth.currentUser = { getIdToken: vi.fn(async () => 'test-token') };
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse()));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(API_WRAPPER_CASES)('$name calls the expected backend route', async ({ run, path, method = 'GET', body }) => {
    await run();

    const { url, options } = lastFetchCall();
    expect(url.endsWith(path)).toBe(true);
    expect(options.method || 'GET').toBe(method);
    expect(options.headers.Authorization).toBe('Bearer test-token');
    if (body !== undefined) {
      expect(JSON.parse(options.body)).toEqual(body);
    }
  });

  it('apiFetch maps backend failures to status-bearing errors', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ error: 'blocked' }, { ok: false, status: 403 }));

    await expect(api.apiFetch('/api/secure')).rejects.toMatchObject({ status: 403 });
  });

  it('apiFetch rejects unauthenticated calls before hitting fetch', async () => {
    auth.currentUser = null;

    await expect(api.apiFetch('/api/secure')).rejects.toThrow('You must be signed in.');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('apiFetch does not allow caller headers to override the Firebase token', async () => {
    await api.apiFetch('/api/secure', {
      headers: { Authorization: 'Bearer attacker-token' },
    });

    const { options } = lastFetchCall();
    expect(options.headers.Authorization).toBe('Bearer test-token');
  });

  it('buildNotificationStreamUrl does not include bearer tokens in the URL', () => {
    const url = api.buildNotificationStreamUrl('test-token');
    if (url) expect(url).not.toContain('test-token');
    expect(api.buildNotificationStreamOptions('test-token')).toEqual({
      headers: { Authorization: 'Bearer test-token' },
    });
  });
});
