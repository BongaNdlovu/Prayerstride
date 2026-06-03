import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { requireFirebasePurgeCredentials } from './firebase-purge-credentials.mjs';
import { buildUpsertSql } from './lib/d1-sql.mjs';
import {
  documentId,
  fromFirestoreFields,
  getFirestoreAccessToken,
  listAllDocuments,
} from './lib/firestore-rest.mjs';
import { profileFromFirestore } from '../worker/db/users-repository.js';
import { prayerRowFromFirestore } from '../worker/db/prayers-repository.js';
import { calendarBookmarkRow, calendarEventRow } from '../worker/db/calendar-repository.js';
import {
  notificationRow,
  notificationSettingsRow,
} from '../worker/db/notifications-repository.js';
import { utcNowIso } from '../worker/db/time.js';

const FEATURES = ['users', 'prayers', 'calendar', 'notifications', 'push_tokens'];
const BATCH_SIZE = 200;
const DEFAULT_WRANGLER_DB = 'prayerstride-db-dev';
const DEFAULT_WRANGLER_ENV = 'development';

function parseArgs(argv) {
  const execute = argv.includes('--execute');
  const remote = argv.includes('--remote');
  const production = argv.includes('--production');
  const onlyArg = argv.find((arg) => arg.startsWith('--only='));
  const limitArg = argv.find((arg) => arg.startsWith('--limit='));
  const only = onlyArg
    ? onlyArg.slice('--only='.length).split(',').map((item) => item.trim()).filter(Boolean)
    : FEATURES;
  const limit = limitArg ? Number(limitArg.slice('--limit='.length)) : null;
  const wranglerDb = production ? 'prayerstride-db' : DEFAULT_WRANGLER_DB;
  const wranglerEnv = production ? 'production' : DEFAULT_WRANGLER_ENV;
  return { execute, remote, production, only, limit, wranglerDb, wranglerEnv };
}

function userUpsertSql(record) {
  return buildUpsertSql('users', record, 'uid', [
    'email', 'display_name', 'handle', 'bio', 'photo_url', 'role', 'owner', 'suspended',
    'registration_state', 'community_access', 'date_of_birth', 'age_band', 'guardian_email',
    'is_seventh_day_adventist', 'church_name', 'terms_accepted_at', 'terms_version', 'privacy_version',
    'avatar_public', 'deleted_at', 'updated_at', 'metadata_json',
  ]);
}

function prayerUpsertSql(row) {
  return buildUpsertSql('prayers', row, 'id', [
    'title', 'body', 'author_uid', 'author_name', 'is_anonymous', 'prayed_count', 'status',
    'privacy', 'prayer_limit', 'urgent', 'allow_share', 'updated_at',
  ]);
}

function prayerPrayUpsertSql(row) {
  return buildUpsertSql('prayer_prays', row, 'id', [
    'prayer_id', 'uid', 'day_key', 'week_key', 'prayer_limit', 'author_uid',
  ]);
}

function calendarEventUpsertSql(row) {
  return buildUpsertSql('calendar_events', row, 'id', [
    'owner_uid', 'title', 'notes', 'date_key', 'starts_at', 'ends_at', 'updated_at',
  ]);
}

function calendarBookmarkUpsertSql(row) {
  return buildUpsertSql('calendar_bookmarks', row, 'id', ['owner_uid', 'date_key']);
}

function notificationUpsertSql(row) {
  return buildUpsertSql('notifications', row, 'id', [
    'recipient_uid', 'type', 'message', 'related_id', 'actor_uid', 'read',
  ]);
}

function notificationSettingsUpsertSql(row) {
  return buildUpsertSql('notification_settings', row, 'uid', [
    'prayer_activity', 'testimony_reactions', 'push_enabled', 'announcements', 'updated_at',
  ]);
}

function pushTokenUpsertSql(row) {
  return buildUpsertSql('push_tokens', row, 'id', ['uid', 'token', 'platform', 'updated_at']);
}

async function collectUsers(accessToken, rootPath, limit) {
  const docs = await listAllDocuments(accessToken, `${rootPath}/users`);
  const slice = limit ? docs.slice(0, limit) : docs;
  const statements = [];
  for (const doc of slice) {
    const uid = documentId(doc.name);
    const data = fromFirestoreFields(doc.fields);
    statements.push(userUpsertSql(profileFromFirestore(uid, data)));
  }
  return { count: docs.length, applied: slice.length, statements };
}

async function collectPrayers(accessToken, rootPath, limit) {
  const docs = await listAllDocuments(accessToken, `${rootPath}/prayers`);
  const slice = limit ? docs.slice(0, limit) : docs;
  const statements = [];
  let prayCount = 0;
  for (const doc of slice) {
    const prayerId = documentId(doc.name);
    const data = fromFirestoreFields(doc.fields);
    statements.push(prayerUpsertSql(prayerRowFromFirestore(prayerId, data)));
    const prayDocs = await listAllDocuments(accessToken, `${doc.name}/prays`);
    for (const prayDoc of prayDocs) {
      const prayId = documentId(prayDoc.name);
      const prayData = fromFirestoreFields(prayDoc.fields);
      statements.push(prayerPrayUpsertSql({
        id: prayId,
        prayer_id: prayData.prayerId || prayerId,
        uid: prayData.uid,
        day_key: prayData.dayKey ?? null,
        week_key: prayData.weekKey ?? null,
        prayer_limit: prayData.prayerLimit ?? null,
        author_uid: prayData.authorUid ?? null,
        created_at: prayData.createdAt || new Date().toISOString(),
      }));
      prayCount += 1;
    }
  }
  return { prayers: docs.length, prays: prayCount, statements };
}

async function collectCalendar(accessToken, rootPath, limit) {
  const eventDocs = await listAllDocuments(accessToken, `${rootPath}/calendarEvents`);
  const bookmarkDocs = await listAllDocuments(accessToken, `${rootPath}/calendarBookmarks`);
  const statements = [];
  for (const doc of (limit ? eventDocs.slice(0, limit) : eventDocs)) {
    const id = documentId(doc.name);
    statements.push(calendarEventUpsertSql(calendarEventRow(id, fromFirestoreFields(doc.fields))));
  }
  for (const doc of (limit ? bookmarkDocs.slice(0, limit) : bookmarkDocs)) {
    const id = documentId(doc.name);
    statements.push(calendarBookmarkUpsertSql(calendarBookmarkRow(id, fromFirestoreFields(doc.fields))));
  }
  return {
    events: eventDocs.length,
    bookmarks: bookmarkDocs.length,
    statements,
  };
}

async function collectNotifications(accessToken, rootPath, limit) {
  const notificationDocs = await listAllDocuments(accessToken, `${rootPath}/notifications`);
  const settingsDocs = await listAllDocuments(accessToken, `${rootPath}/notificationSettings`);
  const statements = [];
  for (const doc of (limit ? notificationDocs.slice(0, limit) : notificationDocs)) {
    const id = documentId(doc.name);
    statements.push(notificationUpsertSql(notificationRow(id, fromFirestoreFields(doc.fields))));
  }
  for (const doc of (limit ? settingsDocs.slice(0, limit) : settingsDocs)) {
    const uid = documentId(doc.name);
    statements.push(notificationSettingsUpsertSql(notificationSettingsRow(uid, fromFirestoreFields(doc.fields))));
  }
  return {
    notifications: notificationDocs.length,
    settings: settingsDocs.length,
    statements,
  };
}

async function collectPushTokens(accessToken, rootPath, limit) {
  const userDocs = await listAllDocuments(accessToken, `${rootPath}/users`);
  const userSlice = limit ? userDocs.slice(0, limit) : userDocs;
  const statements = [];
  let tokenCount = 0;
  for (const userDoc of userSlice) {
    const uid = documentId(userDoc.name);
    const deviceDocs = await listAllDocuments(accessToken, `${userDoc.name}/devices`);
    for (const deviceDoc of deviceDocs) {
      const data = fromFirestoreFields(deviceDoc.fields);
      if (!data.token) continue;
      statements.push(pushTokenUpsertSql({
        id: documentId(deviceDoc.name),
        uid,
        token: data.token,
        platform: data.platform || 'android',
        updated_at: data.updatedAt || utcNowIso(),
      }));
      tokenCount += 1;
    }
  }
  return {
    users: userDocs.length,
    usersScanned: userSlice.length,
    tokens: tokenCount,
    statements,
  };
}

function runWranglerExecute(files, remote, wranglerDb, wranglerEnv) {
  for (const file of files) {
    const args = [
      'wrangler', 'd1', 'execute', wranglerDb,
      '--file', file,
      '--env', wranglerEnv,
    ];
    if (remote) args.push('--remote');
    const result = spawnSync('npx', args, { stdio: 'inherit', shell: true });
    if (result.status !== 0) {
      throw new Error(`wrangler d1 execute failed for ${file}`);
    }
  }
}

const { execute, remote, production, only, limit, wranglerDb, wranglerEnv } = parseArgs(process.argv);
const invalid = only.filter((feature) => !FEATURES.includes(feature));
if (invalid.length) {
  throw new Error(`Unknown --only features: ${invalid.join(', ')}. Allowed: ${FEATURES.join(', ')}`);
}

const { projectId, clientEmail, privateKey, source } = requireFirebasePurgeCredentials();
const accessToken = await getFirestoreAccessToken({ clientEmail, privateKey });
const rootPath = `projects/${projectId}/databases/(default)/documents`;

console.log(`Backfill source: Firestore ${projectId} (${source})`);
console.log(`Target: D1 ${wranglerDb} (${remote ? 'remote' : 'local'}, env ${wranglerEnv}${production ? ', production' : ''})`);
console.log(`Features: ${only.join(', ')}${limit ? `, limit ${limit}` : ''}`);

const summary = {};
const statements = [];

if (only.includes('users')) {
  const users = await collectUsers(accessToken, rootPath, limit);
  summary.users = users.count;
  statements.push(...users.statements);
}

if (only.includes('prayers')) {
  const prayers = await collectPrayers(accessToken, rootPath, limit);
  summary.prayers = prayers.prayers;
  summary.prayerPrays = prayers.prays;
  statements.push(...prayers.statements);
}

if (only.includes('calendar')) {
  const calendar = await collectCalendar(accessToken, rootPath, limit);
  summary.calendarEvents = calendar.events;
  summary.calendarBookmarks = calendar.bookmarks;
  statements.push(...calendar.statements);
}

if (only.includes('notifications')) {
  const notifications = await collectNotifications(accessToken, rootPath, limit);
  summary.notifications = notifications.notifications;
  summary.notificationSettings = notifications.settings;
  statements.push(...notifications.statements);
}

if (only.includes('push_tokens')) {
  const pushTokens = await collectPushTokens(accessToken, rootPath, limit);
  summary.pushTokenUsers = pushTokens.users;
  summary.pushTokenUsersScanned = pushTokens.usersScanned;
  summary.pushTokens = pushTokens.tokens;
  statements.push(...pushTokens.statements);
}

summary.sqlStatements = statements.length;
console.log(JSON.stringify(summary, null, 2));

if (!statements.length) {
  console.log('Nothing to backfill.');
  process.exit(0);
}

const outDir = join(process.cwd(), '.d1-backfill');
mkdirSync(outDir, { recursive: true });
const files = [];
for (let index = 0; index < statements.length; index += BATCH_SIZE) {
  const chunk = statements.slice(index, index + BATCH_SIZE).join('\n');
  const file = join(outDir, `batch-${String(index / BATCH_SIZE).padStart(4, '0')}.sql`);
  writeFileSync(file, `${chunk}\n`);
  files.push(file);
}
console.log(`Wrote ${files.length} SQL batch file(s) to ${outDir}`);

if (!execute) {
  console.log('Dry run complete. Re-run with --execute to apply (add --remote for dev D1 remote).');
  process.exit(0);
}

runWranglerExecute(files, remote, wranglerDb, wranglerEnv);
console.log('D1 backfill complete.');
