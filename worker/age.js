/** Age helpers for 16+ registration with guardian approval for 16–17. */

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
  const [year, month, day] = dateOfBirth.split('-').map(Number);
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
  if (ageBand === 'under_16') return 'blocked';
  if (ageBand === 'minor') return 'pending_guardian';
  return 'active';
}

export function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
