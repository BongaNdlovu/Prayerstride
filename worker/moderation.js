/** Conservative default blocklist — review with counsel before launch. Update via MODERATION_BLOCKLIST env (comma-separated). */
export const DEFAULT_MODERATION_BLOCKLIST = [
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'cunt',
  'nigger',
  'nigga',
  'faggot',
  'retard',
];

export function parseBlocklistConfig(raw) {
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return [...DEFAULT_MODERATION_BLOCKLIST];
  }
  return raw
    .split(',')
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
}

export function normalizeModerationText(value) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findBlockedTerm(text, blocklist) {
  const normalized = normalizeModerationText(text);
  if (!normalized) return null;
  const padded = ` ${normalized} `;
  for (const term of blocklist) {
    const needle = ` ${term.toLowerCase()} `;
    if (padded.includes(needle)) return term;
  }
  return null;
}

export function assertModerationAllowed(fields, blocklist) {
  const combined = [fields.title, fields.body, fields.text].filter(Boolean).join(' ');
  const hit = findBlockedTerm(combined, blocklist);
  if (hit) {
    const error = new Error('Your message contains language that is not allowed in this community.');
    error.status = 400;
    error.publicMessage = error.message;
    throw error;
  }
}
