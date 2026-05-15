const FIREBASE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FIREBASE_SCOPE = 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.messaging';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }), env);
    }

    try {
      if (url.pathname.startsWith('/api/')) {
        return withCors(await handleApi(request, env, url), env);
      }

      return json({ ok: true, service: 'prayerstride-api' });
    } catch (error) {
      console.error('Worker request failed', error);
      const status = Number(error.status || 500);
      const message = status >= 500 ? 'Unexpected server error' : (error.publicMessage || error.message || 'Request failed');
      return withCors(json({ error: message }, status), env);
    }
  },
};

async function handleApi(request, env, url) {
  const user = await verifyFirebaseUser(request, env);
  const body = request.method === 'GET' ? {} : await request.json().catch(() => ({}));

  let match = url.pathname.match(/^\/api\/devices\/register$/);
  if (match && request.method === 'POST') {
    return registerDevice(env, user, body);
  }

  match = url.pathname.match(/^\/api\/prayers\/([^/]+)\/pray$/);
  if (match && request.method === 'POST') {
    return prayForRequest(env, user, decodeURIComponent(match[1]));
  }

  match = url.pathname.match(/^\/api\/testimonies\/([^/]+)\/react$/);
  if (match && request.method === 'POST') {
    return reactToTestimony(env, user, decodeURIComponent(match[1]), body.reaction);
  }

  return json({ error: 'Not found' }, 404);
}

async function registerDevice(env, user, body) {
  if (!body.token) return json({ error: 'Missing device token' }, 400);
  const deviceId = await hashToken(body.token);

  await firestoreCommit(env, [
    {
      update: {
        name: docName(env, 'users', user.uid, 'devices', deviceId),
        fields: toFirestoreFields({
          token: body.token,
          platform: body.platform || 'android',
          updatedAt: new Date().toISOString(),
        }),
      },
    },
  ]);

  return json({ ok: true });
}

async function prayForRequest(env, user, prayerId) {
  const prayer = await getDocument(env, docName(env, 'prayers', prayerId));
  if (!prayer.exists) return json({ error: 'Prayer not found' }, 404);

  const data = fromFirestoreFields(prayer.fields);
  const now = new Date().toISOString();
  const prayDoc = docName(env, 'prayers', prayerId, 'prays', user.uid);
  const existingPray = await getDocument(env, prayDoc);
  if (existingPray.exists) return json({ ok: true, duplicate: true });
  await enforceCooldown(env, user.uid, 'pray', 1);

  const writes = [
    {
      update: {
        name: prayDoc,
        fields: toFirestoreFields({
          uid: user.uid,
          createdAt: now,
        }),
      },
      currentDocument: { exists: false },
    },
    {
      transform: {
        document: prayer.name,
        fieldTransforms: [
          { fieldPath: 'prayedCount', increment: { integerValue: '1' } },
          { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
        ],
      },
    },
  ];

  const prefs = await getNotificationSettings(env, data.authorUid);
  if (data.authorUid && data.authorUid !== user.uid && prefs.prayerActivity !== false) {
    writes.push(notificationWrite(env, data.authorUid, {
      type: 'prayer_prayed',
      message: 'Someone prayed for your request.',
      relatedId: prayerId,
      actorUid: user.uid,
    }));
  }

  const result = await firestoreCommit(env, writes, { allowAlreadyExists: true });
  if (result.alreadyExists) return json({ ok: true, duplicate: true });

  if (data.authorUid && data.authorUid !== user.uid && prefs.prayerActivity !== false && prefs.pushEnabled !== false) {
    await sendPushToUser(env, data.authorUid, {
      title: 'PrayerStride',
      body: 'Someone prayed for your request.',
      data: { type: 'prayer_prayed', relatedId: prayerId },
    });
  }

  return json({ ok: true });
}

async function reactToTestimony(env, user, testimonyId, reaction) {
  if (!['praiseGod', 'amen'].includes(reaction)) {
    return json({ error: 'Unsupported reaction' }, 400);
  }

  const testimony = await getDocument(env, docName(env, 'testimonies', testimonyId));
  if (!testimony.exists) return json({ error: 'Testimony not found' }, 404);

  const data = fromFirestoreFields(testimony.fields);
  const now = new Date().toISOString();
  const reactionDoc = docName(env, 'testimonies', testimonyId, 'reactions', `${user.uid}_${reaction}`);
  const message = reaction === 'amen' ? 'Someone said Amen to your testimony.' : 'Someone praised God for your testimony.';
  const existingReaction = await getDocument(env, reactionDoc);
  if (existingReaction.exists) return json({ ok: true, duplicate: true });
  await enforceCooldown(env, user.uid, `react:${reaction}`, 1);

  const writes = [
    {
      update: {
        name: reactionDoc,
        fields: toFirestoreFields({
          uid: user.uid,
          reaction,
          createdAt: now,
        }),
      },
      currentDocument: { exists: false },
    },
    {
      transform: {
        document: testimony.name,
        fieldTransforms: [
          { fieldPath: reaction, increment: { integerValue: '1' } },
          { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
        ],
      },
    },
  ];

  const prefs = await getNotificationSettings(env, data.authorUid);
  if (data.authorUid && data.authorUid !== user.uid && prefs.testimonyReactions !== false) {
    writes.push(notificationWrite(env, data.authorUid, {
      type: 'testimony_reaction',
      message,
      relatedId: testimonyId,
      actorUid: user.uid,
      reaction,
    }));
  }

  const result = await firestoreCommit(env, writes, { allowAlreadyExists: true });
  if (result.alreadyExists) return json({ ok: true, duplicate: true });

  if (data.authorUid && data.authorUid !== user.uid && prefs.testimonyReactions !== false && prefs.pushEnabled !== false) {
    await sendPushToUser(env, data.authorUid, {
      title: 'PrayerStride',
      body: message,
      data: { type: 'testimony_reaction', relatedId: testimonyId, reaction },
    });
  }

  return json({ ok: true });
}

function notificationWrite(env, recipientUid, notification) {
  return {
    update: {
      name: docName(env, 'notifications', crypto.randomUUID()),
      fields: toFirestoreFields({
        ...notification,
        recipientUid,
        read: false,
        createdAt: new Date().toISOString(),
      }),
    },
  };
}

async function sendPushToUser(env, uid, payload) {
  const devices = await listDocuments(env, docName(env, 'users', uid, 'devices'));
  const tokens = devices
    .map((document) => ({ token: fromFirestoreFields(document.fields).token, name: document.name }))
    .filter((device) => device.token)
    .filter(Boolean);

  await Promise.all(tokens.map(async (device) => {
    try {
      await sendFcm(env, device.token, payload);
    } catch (error) {
      console.error('FCM send failed', error);
      if (error.invalidToken) {
        await firestoreCommit(env, [{ delete: device.name }]);
      }
    }
  }));
}

async function sendFcm(env, token, payload) {
  const accessToken = await getGoogleAccessToken(env);
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/messages:send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: payload.title, body: payload.body },
        data: stringifyData(payload.data || {}),
      },
    }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    const status = result.error?.status || '';
    if (['NOT_FOUND', 'INVALID_ARGUMENT', 'UNREGISTERED'].includes(status)) {
      throw Object.assign(new Error('Invalid FCM token'), { invalidToken: true });
    }
    throw new Error(result.error?.message || 'FCM send failed');
  }
}

async function verifyFirebaseUser(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const idToken = authHeader.replace(/^Bearer\s+/i, '');
  if (!idToken) throw new Error('Missing Firebase ID token');

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_WEB_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const result = await response.json();
  if (!response.ok || !result.users?.[0]) throw new Error('Invalid Firebase ID token');
  return { uid: result.users[0].localId, email: result.users[0].email };
}

async function getDocument(env, name) {
  const accessToken = await getGoogleAccessToken(env);
  const response = await fetch(`https://firestore.googleapis.com/v1/${name}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.status === 404) return { exists: false };
  const document = await response.json();
  if (!response.ok) throw new Error(document.error?.message || 'Firestore read failed');
  return { ...document, exists: true };
}

async function firestoreCommit(env, writes, options = {}) {
  const accessToken = await getGoogleAccessToken(env);
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:commit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ writes }),
  });
  const result = await response.json();
  if (!response.ok) {
    if (options.allowAlreadyExists && result.error?.status === 'ALREADY_EXISTS') {
      return { alreadyExists: true };
    }
    throw new Error(result.error?.message || 'Firestore commit failed');
  }
  return result;
}

async function listDocuments(env, parentName) {
  const accessToken = await getGoogleAccessToken(env);
  const response = await fetch(`https://firestore.googleapis.com/v1/${parentName}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.status === 404) return [];
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Firestore list failed');
  return result.documents || [];
}

async function getNotificationSettings(env, uid) {
  if (!uid) return {};
  const settings = await getDocument(env, docName(env, 'notificationSettings', uid));
  return settings.exists ? fromFirestoreFields(settings.fields) : {};
}

async function enforceCooldown(env, uid, action, seconds) {
  const key = await hashToken(`${uid}:${action}`);
  const name = docName(env, 'apiRateLimits', key);
  const now = new Date();
  const current = await getDocument(env, name);
  if (current.exists) {
    const data = fromFirestoreFields(current.fields);
    const last = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
    if (Number.isFinite(last) && now.getTime() - last < seconds * 1000) {
      throw Object.assign(new Error('Please wait a moment before trying again.'), { status: 429 });
    }
  }
  await firestoreCommit(env, [{
    update: {
      name,
      fields: toFirestoreFields({ uid, action, updatedAt: now.toISOString() }),
    },
  }]);
}

async function getGoogleAccessToken(env) {
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

async function sign(input, privateKey) {
  const pem = privateKey.replace(/\\n/g, '\n');
  const keyData = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const binary = Uint8Array.from(atob(keyData), (char) => char.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', binary, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(input));
  return base64UrlBytes(new Uint8Array(signature));
}

function docName(env, ...parts) {
  return `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${parts.join('/')}`;
}

function toFirestoreFields(value) {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toFirestoreValue(item)]));
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === 'object') return { mapValue: { fields: toFirestoreFields(value) } };
  if (String(value).match(/^\d{4}-\d{2}-\d{2}T/)) return { timestampValue: value };
  return { stringValue: String(value) };
}

function fromFirestoreFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromFirestoreValue(value)]));
}

function fromFirestoreValue(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ('mapValue' in value) return fromFirestoreFields(value.mapValue.fields);
  return null;
}

async function hashToken(token) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return base64UrlBytes(new Uint8Array(digest));
}

function stringifyData(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)]));
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function withCors(response, env) {
  const next = new Response(response.body, response);
  next.headers.set('Access-Control-Allow-Origin', env.CORS_ORIGIN || 'https://prayerstride.app');
  next.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  next.headers.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
  return next;
}

function base64Url(value) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlBytes(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
