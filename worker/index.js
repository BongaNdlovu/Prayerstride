const FIREBASE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FIREBASE_SCOPE = 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.messaging';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const requestId = crypto.randomUUID().slice(0, 8);
    const startTime = Date.now();
    log(env, 'info', { requestId, method: request.method, path: url.pathname }, 'request');

    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }), env, request);
    }

    try {
      await enforceGlobalRateLimit(env, request, requestId);

      if (url.pathname.startsWith('/api/')) {
        const response = await handleApi(request, env, url, requestId);
        log(env, 'info', { requestId, status: response.status, durationMs: Date.now() - startTime }, 'response');
        return withCors(response, env, request);
      }

      return withCors(json({ ok: true, service: 'prayerstride-api' }), env, request);
    } catch (error) {
      const status = Number(error.status || 500);
      const message = status >= 500 ? 'Unexpected server error' : (error.publicMessage || error.message || 'Request failed');
      log(env, status >= 500 ? 'error' : 'warn', { requestId, status, message: error.message, stack: error.stack }, 'error');
      return withCors(json({ error: message }, status), env, request);
    }
  },
};

async function handleApi(request, env, url, requestId) {
  const user = await verifyFirebaseUser(request, env);
  const body = request.method === 'GET' ? {} : await request.json().catch(() => ({}));

  let match = url.pathname.match(/^\/api\/devices\/register$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    return registerDevice(env, user, body);
  }

  match = url.pathname.match(/^\/api\/prayers\/([^/]+)\/pray$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    return prayForRequest(env, user, decodeURIComponent(match[1]));
  }

  match = url.pathname.match(/^\/api\/testimonies\/([^/]+)\/react$/);
  if (match && request.method === 'POST') {
    await checkNotSuspended(env, user.uid);
    return reactToTestimony(env, user, decodeURIComponent(match[1]), body.reaction);
  }

  match = url.pathname.match(/^\/api\/admin\/delete-content$/);
  if (match && request.method === 'POST') {
    await requireAdmin(env, user);
    return adminDeleteContent(env, user, body);
  }

  match = url.pathname.match(/^\/api\/admin\/suspend-user$/);
  if (match && request.method === 'POST') {
    await requireAdmin(env, user);
    return adminSuspendUser(env, user, body);
  }

  match = url.pathname.match(/^\/api\/admin\/delete-account$/);
  if (match && request.method === 'POST') {
    await requireAdmin(env, user);
    return adminDeleteAccount(env, user, body);
  }

  match = url.pathname.match(/^\/api\/account$/);
  if (match && request.method === 'DELETE') {
    return deleteOwnAccount(env, user);
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

async function adminDeleteContent(env, user, body) {
  await requireAdmin(env, user);
  if (!body.targetId || !body.targetType) {
    return json({ error: 'Missing targetId or targetType' }, 400);
  }
  if (!['prayer', 'testimony', 'encouragement'].includes(body.targetType)) {
    return json({ error: 'targetType must be prayer, testimony, or encouragement' }, 400);
  }
  const collectionMap = { prayer: 'prayers', testimony: 'testimonies', encouragement: 'encouragements' };
  const collection = collectionMap[body.targetType] || body.targetType + 's';
  const targetDoc = await getDocument(env, docName(env, collection, body.targetId));
  if (!targetDoc.exists) return json({ error: 'Content not found' }, 404);

  await firestoreCommit(env, [{ delete: targetDoc.name }]);
  return json({ ok: true });
}

async function adminSuspendUser(env, user, body) {
  await requireAdmin(env, user);
  if (!body.targetUid) return json({ error: 'Missing targetUid' }, 400);
  if (body.targetUid === user.uid) return json({ error: 'Cannot suspend yourself' }, 400);

  const targetUser = await getDocument(env, docName(env, 'users', body.targetUid));
  if (!targetUser.exists) return json({ error: 'User not found' }, 404);

  const targetData = fromFirestoreFields(targetUser.fields);
  if (targetData.role === 'admin') return json({ error: 'Cannot suspend another admin' }, 400);

  const reason = body.reason || 'Violation of community guidelines';
  const writes = [
    {
      update: {
        name: targetUser.name,
        fields: toFirestoreFields({
          suspended: true,
          suspendedReason: reason,
          suspendedAt: new Date().toISOString(),
          suspendedBy: user.uid,
        }),
      },
    },
    notificationWrite(env, body.targetUid, {
      type: 'account_suspended',
      message: `Your account has been suspended: ${reason}`,
      actorUid: user.uid,
    }),
  ];

  await firestoreCommit(env, writes);
  return json({ ok: true });
}

async function adminDeleteAccount(env, user, body) {
  await requireAdmin(env, user);
  if (!body.targetUid) return json({ error: 'Missing targetUid' }, 400);
  if (body.targetUid === user.uid) return json({ error: 'Cannot delete your own admin account via this endpoint. Use /api/account instead.' }, 400);

  const targetUser = await getDocument(env, docName(env, 'users', body.targetUid));
  if (!targetUser.exists) return json({ error: 'User not found' }, 404);

  const targetData = fromFirestoreFields(targetUser.fields);
  if (targetData.role === 'admin') return json({ error: 'Cannot delete another admin account' }, 400);

  return deleteUserData(env, body.targetUid);
}

async function deleteOwnAccount(env, user) {
  return deleteUserData(env, user.uid);
}

async function deleteUserData(env, uid) {
  const userDoc = await getDocument(env, docName(env, 'users', uid));
  if (!userDoc.exists) return json({ error: 'User not found' }, 404);

  const writes = [{ delete: userDoc.name }];

  const processCollection = async (collectionName, matchField) => {
    try {
      const docs = await listDocuments(env, docName(env, collectionName));
      for (const d of docs) {
        const data = fromFirestoreFields(d.fields || {});
        if (matchField(data)) {
          writes.push({ delete: d.name });
          if (collectionName === 'prayers' || collectionName === 'testimonies') {
            const subName = collectionName === 'prayers' ? 'prays' : 'reactions';
            try {
              const subs = await listDocuments(env, docName(env, collectionName, dataId(d), subName));
              for (const s of subs) writes.push({ delete: s.name });
            } catch {}
          }
        }
      }
    } catch (err) {
      log(env, 'warn', { uid, collection: collectionName, error: err.message }, 'deleteUserData:list-failed');
    }
  };

  await processCollection('prayers', (d) => d.authorUid === uid);
  await processCollection('testimonies', (d) => d.authorUid === uid);
  await processCollection('encouragements', (d) => d.authorUid === uid);
  await processCollection('prayerSessions', (d) => d.authorUid === uid);
  await processCollection('notifications', (d) => d.recipientUid === uid || d.actorUid === uid);
  await processCollection('reports', (d) => d.reportedByUid === uid || d.targetId === uid);

  try {
    const apiDocs = await listDocuments(env, docName(env, 'apiRateLimits'));
    for (const d of apiDocs) {
      const data = fromFirestoreFields(d.fields || {});
      if (data.uid === uid) writes.push({ delete: d.name });
    }
  } catch {}

  const deviceDocs = await listDocuments(env, docName(env, 'users', uid, 'devices'));
  for (const d of deviceDocs) writes.push({ delete: d.name });

  writes.push({ delete: docName(env, 'notificationSettings', uid) });

  await firestoreCommit(env, writes);
  return json({ ok: true });
}

function dataId(doc) {
  return doc.name.split('/').pop();
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
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await sendFcm(env, device.token, payload);
        return;
      } catch (error) {
        lastError = error;
        if (error.invalidToken) break;
        if (attempt < 2) await sleep(Math.pow(2, attempt) * 200);
      }
    }
    log(env, 'error', { uid, tokenPrefix: device.token.slice(0, 10), error: lastError?.message, attempts: lastError?.invalidToken ? 1 : 3 }, 'fcm-send-failed');
    if (lastError?.invalidToken) {
      await firestoreCommit(env, [{ delete: device.name }]);
      log(env, 'info', { uid, deviceName: device.name }, 'invalid-token-cleaned');
    }
  }));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  if (result.users[0].disabled) throw Object.assign(new Error('This account has been disabled.'), { status: 403, publicMessage: 'Account disabled' });
  return { uid: result.users[0].localId, email: result.users[0].email };
}

async function requireAdmin(env, user) {
  const userDoc = await getDocument(env, docName(env, 'users', user.uid));
  if (!userDoc.exists) throw Object.assign(new Error('User profile not found'), { status: 403 });
  const data = fromFirestoreFields(userDoc.fields);
  if (data.role !== 'admin') throw Object.assign(new Error('Admin access required'), { status: 403 });
}

async function checkNotSuspended(env, uid) {
  const userDoc = await getDocument(env, docName(env, 'users', uid));
  if (userDoc.exists) {
    const data = fromFirestoreFields(userDoc.fields);
    if (data.suspended === true) {
      throw Object.assign(new Error('Your account has been suspended.'), { status: 403, publicMessage: 'Account suspended' });
    }
  }
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
  const body = { writes };
  if (options.precondition) {
    for (const write of writes) {
      if (write.update && !write.currentDocument) {
        write.currentDocument = options.precondition;
      }
    }
  }
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:commit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) {
    if (options.allowAlreadyExists && result.error?.status === 'ALREADY_EXISTS') {
      return { alreadyExists: true };
    }
    if (result.error?.status === 'FAILED_PRECONDITION') {
      return { preconditionFailed: true };
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
  const precondition = current.exists
    ? { updateTime: current.updateTime }
    : { exists: false };
  await firestoreCommit(env, [{
    update: {
      name,
      fields: toFirestoreFields({ uid, action, updatedAt: now.toISOString() }),
    },
  }], { precondition });
}

async function enforceGlobalRateLimit(env, request, requestId) {
  const maxPerMinute = Number(env.RATE_LIMIT_PER_MINUTE || 120);
  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
  const ipKey = await hashToken(`rate:ip:${clientIp}`);
  const rateDoc = docName(env, 'apiRateLimits', ipKey);
  const now = Date.now();
  const minuteWindow = Math.floor(now / 60000).toString();

  const current = await getDocument(env, rateDoc);
  if (current.exists) {
    const data = fromFirestoreFields(current.fields);
    if (data.window === minuteWindow && data.count >= maxPerMinute) {
      log(env, 'warn', { requestId, clientIp, count: data.count }, 'rate-limited');
      throw Object.assign(new Error('Too many requests. Please slow down.'), { status: 429, publicMessage: 'Rate limit exceeded' });
    }
  }

  const isNewWindow = !current.exists || fromFirestoreFields(current.fields).window !== minuteWindow;
  const count = isNewWindow ? 1 : ((fromFirestoreFields(current.fields).count || 0) + 1);
  const precondition = current.exists ? { updateTime: current.updateTime } : { exists: false };
  const result = await firestoreCommit(env, [{
    update: {
      name: rateDoc,
      fields: toFirestoreFields({
        clientIp,
        window: minuteWindow,
        count,
        updatedAt: new Date().toISOString(),
      }),
    },
  }], { precondition });
  if (result.preconditionFailed) {
    log(env, 'warn', { requestId, clientIp }, 'rate-limit-precondition-failed');
    return;
  }
}

let cachedAccessToken = null;
let cachedAccessTokenExpiry = 0;

async function getGoogleAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && now < cachedAccessTokenExpiry - 60) {
    return cachedAccessToken;
  }

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
  cachedAccessToken = result.access_token;
  cachedAccessTokenExpiry = now + 3600;
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

function withCors(response, env, request) {
  const next = new Response(response.body, response);
  const origin = request?.headers.get('Origin') || '';
  const allowedOrigins = [
    env.CORS_ORIGIN || 'https://prayerstride.fanelesibonge50.workers.dev',
    'https://prayerstride.app',
  ];
  const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://10.') || origin.startsWith('http://192.168.');
  const resolvedOrigin = isLocalhost ? origin : (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]);
  next.headers.set('Access-Control-Allow-Origin', resolvedOrigin);
  next.headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  next.headers.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
  return next;
}

function log(env, level, data, context) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    context,
    ...data,
  };
  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else if (env.LOG_LEVEL === 'debug' || level === 'warn') {
    console.warn(JSON.stringify(entry));
  }
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
