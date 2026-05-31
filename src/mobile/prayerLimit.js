export function isoWeekKey(isoDate) {
  const date = new Date(isoDate);
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function prayedStorageKey(prayerId, prayerLimit = 'daily', now = new Date()) {
  if (prayerLimit === 'once') return `prayed:${prayerId}:once`;
  if (prayerLimit === 'weekly') return `prayed:${prayerId}:${isoWeekKey(now.toISOString())}`;
  return `prayed:${prayerId}:${now.toISOString().slice(0, 10)}`;
}

export function prayedButtonLabel(prayerLimit, prayed) {
  if (!prayed) return "I'll Pray";
  if (prayerLimit === 'once') return 'Already Prayed';
  if (prayerLimit === 'weekly') return 'Prayed This Week';
  return 'Prayed Today';
}
