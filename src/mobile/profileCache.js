const PROFILE_CACHE_TTL_MS = 60_000;
const cache = new Map();

export function getCachedProfile(uid) {
  const entry = cache.get(uid);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > PROFILE_CACHE_TTL_MS) {
    cache.delete(uid);
    return null;
  }
  return entry.profile;
}

export function setCachedProfile(uid, profile) {
  cache.set(uid, { profile, cachedAt: Date.now() });
}

export function clearCachedProfile(uid) {
  cache.delete(uid);
}
