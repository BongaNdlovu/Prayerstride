/** Age helpers for 18+ registration. Users under 18 cannot access the app. */

export function parseDateOfBirth(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return null;
  }
  const [year, month, day] = value.trim().split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }
  return value.trim();
}

export function calculateAge(dateOfBirth, today = new Date()) {
  if (typeof dateOfBirth !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
    return null;
  }
  const [year, month, day] = dateOfBirth.trim().split('-').map(Number);
  let age = today.getUTCFullYear() - year;
  const monthDiff = today.getUTCMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < day)) {
    age -= 1;
  }
  return age;
}

export function ageBandFromAge(age) {
  if (age < 16) return 'under_16';
  if (age < 18) return 'minor';
  return 'adult';
}

export function communityAccessForAgeBand(ageBand) {
  if (ageBand === 'adult') return 'active';
  return 'blocked';
}

export function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
