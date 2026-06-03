import { requireFirebasePurgeCredentials } from './firebase-purge-credentials.mjs';

const FIREBASE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FIREBASE_SCOPE = 'https://www.googleapis.com/auth/datastore';

function base64Url(value) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function documentId(documentName) {
  return documentName.split('/').pop();
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

async function listCollection(accessToken, parentPath, pageToken = '') {
  const url = new URL(`https://firestore.googleapis.com/v1/${parentPath}`);
  url.searchParams.set('pageSize', '300');
  if (pageToken) url.searchParams.set('pageToken', pageToken);
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || `List failed for ${parentPath}`);
  return result;
}

async function listAllDocuments(accessToken, parentPath) {
  const documents = [];
  let pageToken = '';
  do {
    const page = await listCollection(accessToken, parentPath, pageToken);
    documents.push(...(page.documents || []));
    pageToken = page.nextPageToken || '';
  } while (pageToken);
  return documents;
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
  envFile: process.env.FOLLOWING_PURGE_ENV || '.env.local',
});

const accessToken = await getAccessToken({ FIREBASE_CLIENT_EMAIL: clientEmail, FIREBASE_PRIVATE_KEY: privateKey });
console.log(`Using Firebase credentials from ${source}.`);
const usersPath = `projects/${projectId}/databases/(default)/documents/users`;
const userDocs = await listAllDocuments(accessToken, usersPath);

const followingDocs = [];
for (const userDoc of userDocs) {
  const uid = documentId(userDoc.name);
  const docs = await listAllDocuments(accessToken, `${userDoc.name}/following`);
  followingDocs.push(...docs.map((doc) => ({ uid, name: doc.name })));
}

const summary = {
  usersScanned: userDocs.length,
  followingDeleted: followingDocs.length,
  samplePaths: followingDocs.slice(0, 5).map((doc) => doc.name),
};

console.log(execute ? 'Executing following purge...' : 'Dry run for following purge:');
console.log(JSON.stringify(summary, null, 2));

if (!execute) {
  console.log('No changes made. Re-run with --execute to apply.');
  process.exit(0);
}

const writes = followingDocs.map((doc) => ({ delete: doc.name }));
if (writes.length) await commitInChunks(accessToken, projectId, writes);
console.log('Following purge complete.');
