import { auth } from './firebase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

export async function apiFetch(path, options = {}) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('You must be signed in.');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

export function bootstrapOwner() {
  return apiFetch('/api/account/bootstrap-owner', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function completeRegistration(payload) {
  return apiFetch('/api/account/complete-registration', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resendGuardianApproval() {
  return apiFetch('/api/account/resend-guardian-approval', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function registerDevice(payload) {
  return apiFetch('/api/devices/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createPrayer(payload) {
  return apiFetch('/api/prayers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePrayer(prayerId, payload) {
  return apiFetch(`/api/prayers/${encodeURIComponent(prayerId)}/update`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function markPrayerAnswered(prayerId) {
  return apiFetch(`/api/prayers/${encodeURIComponent(prayerId)}/mark-answered`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function deletePrayer(prayerId) {
  return apiFetch(`/api/prayers/${encodeURIComponent(prayerId)}`, {
    method: 'DELETE',
  });
}

export function prayForRequest(prayerId) {
  return apiFetch(`/api/prayers/${encodeURIComponent(prayerId)}/pray`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function createTestimony(payload) {
  return apiFetch('/api/testimonies', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTestimony(testimonyId, payload) {
  return apiFetch(`/api/testimonies/${encodeURIComponent(testimonyId)}/update`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteTestimony(testimonyId) {
  return apiFetch(`/api/testimonies/${encodeURIComponent(testimonyId)}`, {
    method: 'DELETE',
  });
}

export function reactToTestimony(testimonyId, reaction) {
  return apiFetch(`/api/testimonies/${encodeURIComponent(testimonyId)}/react`, {
    method: 'POST',
    body: JSON.stringify({ reaction }),
  });
}

export function listBlocks() {
  return apiFetch('/api/blocks');
}

export function blockUser(blockedUid) {
  return apiFetch(`/api/blocks/${encodeURIComponent(blockedUid)}`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function unblockUser(blockedUid) {
  return apiFetch(`/api/blocks/${encodeURIComponent(blockedUid)}`, {
    method: 'DELETE',
  });
}

export function followUser(followedUid) {
  return apiFetch(`/api/following/${encodeURIComponent(followedUid)}`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function unfollowUser(followedUid) {
  return apiFetch(`/api/following/${encodeURIComponent(followedUid)}`, {
    method: 'DELETE',
  });
}

export function bookmarkPrayer(prayerId) {
  return apiFetch(`/api/prayer-bookmarks/${encodeURIComponent(prayerId)}`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function getPrayerBookmark(prayerId) {
  return apiFetch(`/api/prayer-bookmarks/${encodeURIComponent(prayerId)}`);
}

export function unbookmarkPrayer(prayerId) {
  return apiFetch(`/api/prayer-bookmarks/${encodeURIComponent(prayerId)}`, {
    method: 'DELETE',
  });
}

export function submitContentReport(payload) {
  return apiFetch('/api/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function adminUpdateReport(reportId, status) {
  return apiFetch('/api/admin/reports/update', {
    method: 'POST',
    body: JSON.stringify({ reportId, status }),
  });
}

export function adminDeleteContent(targetId, targetType) {
  return apiFetch('/api/admin/delete-content', {
    method: 'POST',
    body: JSON.stringify({ targetId, targetType }),
  });
}

export function adminSuspendUser(targetUid, reason) {
  return apiFetch('/api/admin/suspend-user', {
    method: 'POST',
    body: JSON.stringify({ targetUid, reason }),
  });
}

export function adminUnsuspendUser(targetUid) {
  return apiFetch('/api/admin/unsuspend-user', {
    method: 'POST',
    body: JSON.stringify({ targetUid }),
  });
}

export function adminDeleteAccount(targetUid) {
  return apiFetch('/api/admin/delete-account', {
    method: 'POST',
    body: JSON.stringify({ targetUid }),
  });
}

export function deleteOwnAccount() {
  return apiFetch('/api/account', {
    method: 'DELETE',
  });
}

export function getSpiritualEngagementMetrics(days = 30) {
  return apiFetch(`/api/admin/spiritual-engagement?days=${encodeURIComponent(days)}`);
}

export function adminCreateAnnouncement(payload) {
  return apiFetch('/api/admin/announcements/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function adminUpdateAnnouncement(payload) {
  return apiFetch('/api/admin/announcements/update', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function adminArchiveAnnouncement(announcementId) {
  return apiFetch('/api/admin/announcements/archive', {
    method: 'POST',
    body: JSON.stringify({ announcementId }),
  });
}

export function getDeviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function getGamificationSummary(timeZone = getDeviceTimeZone()) {
  const query = timeZone ? `?timeZone=${encodeURIComponent(timeZone)}` : '';
  return apiFetch(`/api/gamification/summary${query}`);
}

export function updateGamificationTimeZone(timeZone) {
  return apiFetch('/api/gamification/timezone', {
    method: 'POST',
    body: JSON.stringify({ timeZone }),
  });
}

export function backfillGamification(timeZone = getDeviceTimeZone()) {
  return apiFetch('/api/gamification/backfill', {
    method: 'POST',
    body: JSON.stringify({ timeZone }),
  });
}

export function createPrayerSession(payload) {
  return apiFetch('/api/prayer-sessions', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      timeZone: payload.timeZone || getDeviceTimeZone(),
    }),
  });
}

export function createEncouragement(payload) {
  return apiFetch('/api/encouragements', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      timeZone: payload.timeZone || getDeviceTimeZone(),
    }),
  });
}

export function getWeeklyEncouragers(timeZone = getDeviceTimeZone()) {
  const query = timeZone ? `?timeZone=${encodeURIComponent(timeZone)}` : '';
  return apiFetch(`/api/encouragers/weekly${query}`);
}
