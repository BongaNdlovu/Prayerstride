import { readFileSync } from 'node:fs';

function loadEnv(path = '.env.local') {
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
      .filter(({ line }) => line && !line.startsWith('#'))
      .map(({ line, lineNumber }) => {
        const separator = line.indexOf('=');
        if (separator === -1) {
          throw new Error(`Invalid environment entry in ${path}:${lineNumber}: expected KEY=VALUE`);
        }
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

async function requestJson(url, options = {}, allowedStatuses = [200]) {
  const response = await fetch(url, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!allowedStatuses.includes(response.status)) {
    throw new Error(`${response.status} ${body.error?.message || body.error || response.statusText}`);
  }
  return body;
}

const env = loadEnv();
const apiKey = env.EXPO_PUBLIC_FIREBASE_API_KEY;
const apiUrl = env.EXPO_PUBLIC_API_URL;
const projectId = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

if (![apiKey, apiUrl, projectId].every(Boolean)) {
  throw new Error('Missing required EXPO_PUBLIC_* values in .env.local');
}

const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
const email = `production-smoke-${suffix}@example.com`;
const password = `Smoke-${crypto.randomUUID()}!`;
let idToken = '';
let uid = '';
let workerDeleted = false;
const failures = [];

async function deleteAuthUser() {
  if (!idToken) return;
  await requestJson(
    `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
    [200],
  );
}

async function deleteWithWorker() {
  await requestJson(
    `${apiUrl}/api/account`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${idToken}` },
    },
    [200],
  );
  workerDeleted = true;
}

try {
  const auth = await requestJson(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
    [200],
  );
  idToken = auth.idToken;
  uid = auth.localId;
  console.log('firebase auth signup: PASS');

  const now = new Date().toISOString();
  await requestJson(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/users/${encodeURIComponent(uid)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          uid: { stringValue: uid },
          email: { stringValue: email },
          displayName: { stringValue: 'Production Smoke Test' },
          role: { stringValue: 'user' },
          owner: { booleanValue: false },
          createdAt: { timestampValue: now },
          photoURL: { nullValue: null },
          registrationState: { stringValue: 'pending_completion' },
        },
      }),
    },
    [200],
  );
  console.log('firestore profile create: PASS');

  const summary = await requestJson(
    `${apiUrl}/api/gamification/summary?timeZone=UTC`,
    { headers: { Authorization: `Bearer ${idToken}` } },
    [200],
  );
  console.log(`gamification summary: PASS (${summary.badges?.length || 0} badges)`);

  try {
    const formData = new FormData();
    formData.append('avatar', new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' }), 'profile.jpg');
    const avatarResult = await requestJson(
      `${apiUrl}/api/me/avatar`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      },
      [200],
    );
    if (!avatarResult.photoURL) throw new Error('Avatar upload did not return photoURL');
    const avatarResponse = await fetch(avatarResult.photoURL);
    if (!avatarResponse.ok) throw new Error(`Avatar URL returned ${avatarResponse.status}`);
    console.log('worker avatar upload: PASS');
  } catch (error) {
    failures.push(`worker avatar upload: FAILED (${error.message})`);
    console.warn(failures.at(-1));
  }

  await deleteWithWorker();
  console.log('worker account delete: PASS');
} finally {
  if (!workerDeleted) {
    await deleteWithWorker().catch((error) => {
      console.warn(`worker account cleanup: FAILED (${error.message})`);
    });
    if (!workerDeleted) {
      await deleteAuthUser().catch((error) => {
        console.warn(`auth cleanup: FAILED (${error.message})`);
      });
    }
  }
}

if (failures.length) {
  throw new Error(failures.join('\n'));
}
