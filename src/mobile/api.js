import { auth } from './firebase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

async function apiFetch(path, options = {}) {
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

export function registerDeviceToken(token, platform = 'android') {
  return apiFetch('/api/devices/register', {
    method: 'POST',
    body: JSON.stringify({ token, platform }),
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
