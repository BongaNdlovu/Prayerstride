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

export function registerDevice(payload) {
  return apiFetch('/api/devices/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function prayForRequest(prayerId) {
  return apiFetch(`/api/prayers/${encodeURIComponent(prayerId)}/pray`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function reactToTestimony(testimonyId, reaction) {
  return apiFetch(`/api/testimonies/${encodeURIComponent(testimonyId)}/react`, {
    method: 'POST',
    body: JSON.stringify({ reaction }),
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
