export const OWNER_EMAIL = 'fanelesibonge50@gmail.com';
export const OWNER_DISPLAY_NAME = 'Bonga Ndlovu';

export function isOwnerEmail(email) {
  return String(email || '').trim().toLowerCase() === OWNER_EMAIL;
}
