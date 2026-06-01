export const PRAYER_DETAILS_LIMIT = 1000;

export const PRAYER_PRIVACY_OPTIONS = [
  { value: 'community', label: 'Community' },
  { value: 'private', label: 'Private' },
  { value: 'hidden', label: 'Hidden' },
];

export const PRAYER_FREQUENCY_OPTIONS = [
  { value: 'once', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

export function privacyOptionsWithIcons(icons) {
  const iconByValue = {
    community: icons.Users,
    private: icons.Lock,
    hidden: icons.EyeOff,
  };
  return PRAYER_PRIVACY_OPTIONS.map((option) => ({
    ...option,
    icon: iconByValue[option.value],
  }));
}

export function prayerFrequencyHelper(limit) {
  if (limit === 'once') return 'Each person can pray for this once.';
  if (limit === 'weekly') return 'Each person can pray for this once per week.';
  return 'Each person can pray for this once per day.';
}

export function resolvePrayerPrivacy(prayer) {
  if (prayer?.privacy === 'private' && prayer?.allowShare === false) return 'hidden';
  return prayer?.privacy || 'community';
}
