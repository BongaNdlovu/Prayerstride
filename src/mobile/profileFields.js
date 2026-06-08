const NULLISH_PROFILE_VALUES = new Set(['null', 'undefined', 'none', 'n/a', 'na']);

export function cleanOptionalProfileText(value) {
  if (value == null) return '';
  const text = String(value).trim();
  if (!text) return '';
  return NULLISH_PROFILE_VALUES.has(text.toLowerCase()) ? '' : text;
}

export function cleanOptionalPhotoURL(value) {
  return cleanOptionalProfileText(value);
}

export function imageUriWithCacheBuster(value, version) {
  const uri = cleanOptionalPhotoURL(value);
  if (!uri || !version || !/^https?:\/\//i.test(uri)) return uri;
  const separator = uri.includes('?') ? '&' : '?';
  return `${uri}${separator}v=${encodeURIComponent(String(version))}`;
}

export function cleanOptionalHandle(value) {
  const handle = cleanOptionalProfileText(value).replace(/^@+/, '').trim();
  return handle || '';
}

export function formatProfileHandleForSave(value) {
  const handle = cleanOptionalHandle(value);
  return handle ? `@${handle}`.slice(0, 40) : null;
}
