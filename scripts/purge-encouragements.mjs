import { requireFirebasePurgeCredentials } from './firebase-purge-credentials.mjs';

const FIREBASE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FIREBASE_SCOPE = 'https://www.googleapis.com/auth/datastore';

function base64Url(value) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(input, privateKey) {
  const pem = privateKey.replace(/\\n/g, '\n');
  const keyData = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const binary = Uint8Array.from(atob(keyData), (char) => char.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', binary, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(input));
  return base64Url(String.fromCharCode(...new Uint8Array(signature)));
}

async function getAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64Url(JSON.stringify({
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: FIREBASE_SCOPE,
    aud: FIREBASE_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  }));
  const signature = await sign(`${header}.${claim}`, env.FIREBASE_PRIVATE_KEY);
  const response = await fetch(FIREBASE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claim}.${signature}`,
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error_description || 'Google auth failed');
  return result.access_token;
}

async function listCollection(accessToken, projectId, collectionId, pageToken = '') {
  const url = new URL(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionId}`);
  url.searchParams.set('pageSize', '300');
  if (pageToken) url.searchParams.set('pageToken', pageToken);
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || `List failed for ${collectionId}`);
  return result;
}

async function listAllDocuments(accessToken, projectId, collectionId) {
  const documents = [];
  let pageToken = '';
  do {
    const page = await listCollection(accessToken, projectId, collectionId, pageToken);
    documents.push(...(page.documents || []));
    pageToken = page.nextPageToken || '';
  } while (pageToken);
  return documents;
}

function fromFirestoreValue(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ('mapValue' in value) return fromFirestoreFields(value.mapValue.fields || {});
  return null;
}

function fromFirestoreFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromFirestoreValue(value)]));
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === 'object') return { mapValue: { fields: toFirestoreFields(value) } };
  return { stringValue: String(value) };
}

function toFirestoreFields(value) {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toFirestoreValue(item)]));
}

async function commitWrites(accessToken, projectId, writes) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ writes }),
    },
  );
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Firestore commit failed');
}

async function commitInChunks(accessToken, projectId, writes, chunkSize = 400) {
  for (let i = 0; i < writes.length; i += chunkSize) {
    await commitWrites(accessToken, projectId, writes.slice(i, i + chunkSize));
  }
}

const execute = process.argv.includes('--execute');
const { projectId, clientEmail, privateKey, source } = requireFirebasePurgeCredentials({
  envFile: process.env.ENCOURAGEMENT_PURGE_ENV || '.env.local',
});

const accessToken = await getAccessToken({ FIREBASE_CLIENT_EMAIL: clientEmail, FIREBASE_PRIVATE_KEY: privateKey });
console.log(`Using Firebase credentials from ${source}.`);
const summary = {
  encouragementsDeleted: 0,
  summariesUpdated: 0,
  profilesUpdated: 0,
};

const encouragementDocs = await listAllDocuments(accessToken, projectId, 'encouragements');
summary.encouragementsDeleted = encouragementDocs.length;

const summaryDocs = await listAllDocuments(accessToken, projectId, 'gamificationSummaries');
const summaryWrites = summaryDocs
  .map((doc) => {
    const data = fromFirestoreFields(doc.fields || {});
    if (!('encouragementsSent' in data)) return null;
    const next = { ...data };
    delete next.encouragementsSent;
    return {
      update: {
        name: doc.name,
        fields: toFirestoreFields(next),
      },
    };
  })
  .filter(Boolean);
summary.summariesUpdated = summaryWrites.length;

const userDocs = await listAllDocuments(accessToken, projectId, 'users');
const profileWrites = userDocs
  .map((doc) => {
    const data = fromFirestoreFields(doc.fields || {});
    if (!('showOnEncouragementBoard' in data)) return null;
    const next = { ...data };
    delete next.showOnEncouragementBoard;
    return {
      update: {
        name: doc.name,
        fields: toFirestoreFields(next),
      },
    };
  })
  .filter(Boolean);
summary.profilesUpdated = profileWrites.length;

console.log(execute ? 'Executing encouragement purge...' : 'Dry run for encouragement purge:');
console.log(JSON.stringify(summary, null, 2));

if (!execute) {
  console.log('No changes made. Re-run with --execute to apply.');
  process.exit(0);
}

const writes = [
  ...encouragementDocs.map((doc) => ({ delete: doc.name })),
  ...summaryWrites,
  ...profileWrites,
];

if (writes.length) await commitInChunks(accessToken, projectId, writes);
console.log('Encouragement purge complete.');
