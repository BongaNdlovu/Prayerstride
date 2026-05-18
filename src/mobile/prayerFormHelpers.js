export function createPrayerTitle(body) {
  const clean = String(body || '').trim();
  if (!clean) return 'Prayer Request';
  const firstLine = clean.split('\n').find(Boolean) || clean;
  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine;
}
