export const LEGAL_BASE_URL = process.env.EXPO_PUBLIC_LEGAL_URL
  || process.env.EXPO_PUBLIC_API_URL
  || 'https://prayerstride.fanelesibonge50.workers.dev';

export const TERMS_VERSION = '2026-05-31';
export const PRIVACY_VERSION = '2026-05-31';
export const PRIVACY_URL = `${LEGAL_BASE_URL}/privacy`;
export const TERMS_URL = `${LEGAL_BASE_URL}/terms`;
export const DELETE_ACCOUNT_URL = `${LEGAL_BASE_URL}/delete-account`;
