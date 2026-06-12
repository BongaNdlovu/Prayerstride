import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const worker = readFileSync(join(process.cwd(), 'worker', 'index.js'), 'utf8');
const engagement = readFileSync(join(process.cwd(), 'worker', 'spiritual-engagement.js'), 'utf8');
const gamification = readFileSync(join(process.cwd(), 'worker', 'gamification.js'), 'utf8');
const gamificationLogic = readFileSync(join(process.cwd(), 'shared', 'gamificationLogic.js'), 'utf8');
const workerSource = `${worker}\n${engagement}\n${gamification}\n${gamificationLogic}`;
const gamificationSummarySource = gamification.slice(
  gamification.indexOf('export async function buildGamificationSummary'),
  gamification.indexOf('export async function backfillGamificationXp'),
);
const gamificationBackfillSource = gamification.slice(
  gamification.indexOf('export async function backfillGamificationXp'),
  gamification.indexOf('export function deleteUserGamificationSummary'),
);
const globalRateLimitSource = worker.slice(
  worker.indexOf('async function enforceGlobalRateLimit'),
  worker.indexOf('async function enforceUserRateLimit'),
);
const userRateLimitSource = worker.slice(
  worker.indexOf('async function enforceUserRateLimit'),
  worker.indexOf('function waitForRateLimitRetry'),
);
const failures = [];

const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

assert(worker.includes('bootstrapOwner'), 'Worker should implement owner bootstrap endpoint.');
assert(worker.includes('createPrayer(env'), 'Worker should implement createPrayer handler.');
assert(worker.includes('updatePrayer(env'), 'Worker should implement updatePrayer handler.');
assert(worker.includes('deletePrayer(env'), 'Worker should implement deletePrayer handler.');
assert(worker.includes('createTestimony(env'), 'Worker should implement createTestimony handler.');
assert(!worker.includes("from './encouragements.js'"), 'Worker should not import removed encouragements module.');
assert(!worker.includes('/api/encouragements'), 'Worker should not route encouragement creation.');
assert(!worker.includes('/api/encouragers/weekly'), 'Worker should not route weekly encouragers.');
assert(!worker.includes('/api/following/'), 'Worker should not route following endpoints.');
assert(!worker.includes('async function followUser'), 'Worker should not implement followUser.');
assert(!worker.includes("processCollection('encouragements'"), 'Account deletion should not scan removed encouragements collection.');
assert(!worker.includes('deleteFollowingReferences'), 'Account deletion should not scan removed following records.');
assert(worker.includes('blockUser(env'), 'Worker should implement blockUser handler.');
assert(worker.includes("from './moderation.js'"), 'Worker should use moderation module.');
assert(worker.includes("from './firestore-list.js'"), 'Worker should use paginated Firestore list helper.');
assert(worker.includes('listAllDocumentPages'), 'Worker listDocuments should paginate with listAllDocumentPages.');
assert(worker.includes("from './spiritual-engagement.js'"), 'Worker should use spiritual engagement module.');
assert(worker.includes('normalizeEngagementDays'), 'Worker should normalize engagement days via shared helper.');
assert(worker.includes('computeSpiritualEngagementMetrics'), 'Worker should compute engagement metrics via shared helper.');
assert(worker.includes('ALLOW_DEV_ORIGINS'), 'Worker should gate dev CORS behind ALLOW_DEV_ORIGINS.');
assert(worker.includes('OWNER_EMAIL'), 'Worker should read OWNER_EMAIL secret for bootstrap.');
assert(worker.includes('completeRegistration(env'), 'Worker should implement complete-registration endpoint.');
assert(worker.includes("ageBand !== 'adult'"), 'Worker should reject users under 18.');
assert(worker.includes('You must be at least 18 years old to use PrayerStride.'), 'Worker should explain the 18+ age requirement.');
assert(worker.includes('termsAcceptedAt'), 'Worker should persist a terms acceptance audit timestamp.');
assert(worker.includes('CURRENT_TERMS_VERSION'), 'Worker should validate the accepted terms version.');
assert(worker.includes('CURRENT_PRIVACY_VERSION'), 'Worker should validate the accepted privacy version.');
assert(worker.includes("registrationState: 'complete'"), 'Worker should complete registration server-side.');
assert(worker.includes("profile.registrationState === 'pending_completion'"), 'Worker should deny community access before registration completes.');
assert(worker.includes('privacyPageHtml'), 'Worker should serve public privacy HTML.');
assert(worker.includes('accountDeletionJobs'), 'Worker should write account deletion tombstones.');
assert(worker.includes('deleteFirebaseAuthUser'), 'Worker should delete Firebase Auth user last.');
assert(worker.includes('retryFailedDeletionJobs'), 'Scheduled maintenance should retry failed account deletions.');
assert(worker.includes('purgeExpiredDeletionTombstones'), 'Worker should purge expired deletion tombstones.');
assert(worker.includes('deletion-query-fallback'), 'Account deletion should fall back when collection-group indexes are unavailable.');
assert(worker.includes('storage-delete-non-fatal'), 'Account deletion should continue when avatar storage cleanup fails.');
assert(worker.includes('deleteR2StoragePrefix'), 'Account deletion should clean avatars from the R2 bucket.');
assert(worker.includes('legacy-storage-delete-skipped'), 'Account deletion should not fail when legacy Firebase Storage cleanup is unavailable.');
assert(worker.includes('deleteContentAndActions'), 'Worker should cascade content deletion to nested pray and reaction records.');
assert(
  /async function deleteContentAndActions[\s\S]*runCollectionGroupQuery\(env, 'notifications'/.test(worker),
  'deleteContentAndActions should query notifications by relatedId.',
);
assert(
  !/async function deleteContentAndActions[\s\S]*listDocuments\(env, docName\(env, 'notifications'\)\)/.test(worker),
  'deleteContentAndActions should not list the entire notifications collection.',
);
assert(
  /async function deleteContentAndActions[\s\S]*fieldPath: 'relatedId'/.test(worker),
  'deleteContentAndActions should filter notifications on relatedId.',
);
assert(worker.includes("processOwnedActionCollection('prays')") && worker.includes("processOwnedActionCollection('reactions')"), 'Account deletion should remove actions made on other users content.');
assert(!worker.includes("processCollection('encouragements'"), 'Account deletion should not scan removed encouragements collection.');
assert(worker.includes('if (userDoc.exists) addDelete(userDoc.name)'), 'Account deletion retries should tolerate an already-removed profile.');
assert(worker.includes("String(message).includes('USER_NOT_FOUND')"), 'Account deletion retries should tolerate an already-removed Firebase Auth user.');
assert(worker.includes('!targetUser.exists && !existingDeletionJob.exists'), 'Admin account deletion retries should continue existing cleanup jobs after profile removal.');
assert(worker.includes('async scheduled'), 'Worker should define a scheduled handler for cron jobs.');
assert(worker.includes('weekly'), 'Worker should support weekly prayer limits.');
assert(worker.includes('fieldTransforms'), 'Worker should use Firestore transform writes for aggregate counts.');
assert(worker.includes("increment: { integerValue: '1' }"), 'Worker should increment counts atomically.');
assert(worker.includes("currentDocument: { exists: false }"), 'Worker should create deterministic per-user action docs for idempotency.');
assert(worker.includes("allowAlreadyExists: true"), 'Worker should treat duplicate pray/reaction actions as idempotent success.');
assert(worker.includes('getNotificationSettings'), 'Worker should read notification preferences before notifications/push.');
assert(worker.includes('...targetData') && worker.includes('suspended: true'), 'Suspending a user should preserve existing profile fields.');
assert(worker.includes("currentDocument: { exists: false }"), 'Worker should create notifications and action docs without overwriting existing documents.');
assert(worker.includes("publicMessage: 'Rate limit exceeded'"), 'Rate-limit write collisions should fail closed.');
assert(worker.includes('const RATE_LIMIT_COMMIT_ATTEMPTS = 3'), 'Rate-limit counters should retry transient write conflicts.');
assert(globalRateLimitSource.includes('for (let attempt = 1; attempt <= RATE_LIMIT_COMMIT_ATTEMPTS'), 'Global rate limiting should retry precondition conflicts.');
assert(userRateLimitSource.includes('for (let attempt = 1; attempt <= RATE_LIMIT_COMMIT_ATTEMPTS'), 'User rate limiting should retry precondition conflicts.');
assert(globalRateLimitSource.includes('if (!result.preconditionFailed) return') && userRateLimitSource.includes('if (!result.preconditionFailed) return'), 'Rate limiting should only fail after retry attempts are exhausted.');
assert(globalRateLimitSource.includes('await waitForRateLimitRetry(attempt)') && userRateLimitSource.includes('await waitForRateLimitRetry(attempt)'), 'Rate-limit retry attempts should yield before rereading counters.');
assert(globalRateLimitSource.includes("publicMessage: 'Please retry shortly.'") && userRateLimitSource.includes("publicMessage: 'Please retry shortly.'"), 'Exhausted rate-limit conflicts should not be mislabeled as quota exhaustion.');
assert(worker.includes('ipHash: ipKey') && !worker.includes('{ requestId, clientIp'), 'Rate limiting should store and log hashed IP identifiers instead of raw client IPs.');
assert(worker.includes("op: 'EQUAL'") && worker.includes("fieldPath: 'blockerUid'"), 'Block listing should query only the current user blocks.');
assert(worker.includes("(?:\\.\\d+)?Z$"), 'Worker timestamp detection should require a complete timestamp string.');
assert(worker.includes("fieldPath.endsWith('At')"), 'Worker timestamp detection should only apply to timestamp fields.');
assert(worker.includes('response.ok') && worker.includes('invalidToken'), 'Worker should check FCM responses and clean up invalid tokens.');
assert(!worker.includes("Access-Control-Allow-Origin', env.CORS_ORIGIN || '*'"), 'Worker should not fall back to wildcard CORS.');
assert(worker.includes("let resolvedOrigin = ''"), 'Worker should not grant CORS access before validating the request origin.');
assert(!worker.includes('runFirestoreQuery'), 'Unused runFirestoreQuery helper should be removed.');
assert(worker.includes("status >= 500 ? 'Unexpected server error'"), 'Worker should hide raw internal errors from clients.');
assert(worker.includes("status: 401") && worker.includes("publicMessage: 'Authentication required'"), 'Worker should classify missing authentication as 401.');

assert(worker.includes('adminCreateAnnouncement'), 'Worker should implement adminCreateAnnouncement handler.');
assert(worker.includes('adminUpdateAnnouncement'), 'Worker should implement adminUpdateAnnouncement handler.');
assert(worker.includes('adminArchiveAnnouncement'), 'Worker should implement adminArchiveAnnouncement handler.');
assert(worker.includes('validateAnnouncementFields'), 'Worker should validate announcement required fields.');
assert(worker.includes('requireAdmin'), 'Worker announcement routes should require admin access.');
assert(worker.includes("data.suspended === true") && worker.includes("publicMessage: 'Account suspended'"), 'Worker admin access should deny suspended admins.');
assert(worker.includes("data.role === 'admin' && data.suspended !== true"), 'Worker shared admin checks should deny suspended admins.');
assert(worker.includes("status: 'archived'"), 'Worker should support archiving announcements.');
assert(worker.includes("return json({ error:"), 'Worker should return JSON error responses.');

assert(worker.includes('spiritual-engagement'), 'Worker should implement spiritual-engagement endpoint.');
assert(worker.includes("from './gamification.js'"), 'Worker should use gamification module.');
assert(worker.includes('buildGamificationSummary'), 'Worker should expose gamification summary endpoint.');
assert(worker.includes('createPrayerSessionRecord'), 'Worker should create prayer sessions with XP.');
assert(worker.includes('awardPrayActionXp'), 'Worker should award pray-action XP after praying.');
assert(worker.includes('dayKeyInTimeZone(new Date(now), timeZone)'), 'Worker should enforce pray limits using the user time zone.');
assert(worker.includes('isoWeekKeyFromDayKey(dayKey)'), 'Worker should enforce weekly pray limits using the local day key.');
assert(worker.includes('awardTestimonyXp'), 'Worker should award testimony XP after sharing.');
assert(worker.includes('backfillGamificationXp'), 'Worker should support idempotent gamification backfill.');
assert(worker.includes('deleteUserXpEvents'), 'Account deletion should remove xpEvents.');
assert(gamification.includes("fs.runCollectionQuery(env, 'xpEvents'"), 'Account deletion should query top-level xpEvents without collection-group indexes.');
assert(gamification.includes("fs.listDocuments(env, fs.docName(env, 'xpEvents'))"), 'Account deletion should fall back to listing top-level xpEvents.');
assert(worker.includes("hashToken(`rate:user:${uid}`)"), 'Account deletion should remove the hashed per-user rate-limit record directly.');
assert(worker.includes("'account-deletion-failed'"), 'Account deletion should log its original failure before returning a generic response.');
assert(worker.includes('gamification\\/summary'), 'Worker should route gamification summary.');
assert(worker.includes('prayer-sessions'), 'Worker should route prayer session creation.');
assert(worker.includes('spiritualEngagementMetrics'), 'Worker should implement spiritualEngagementMetrics function.');
assert(worker.includes('runCollectionGroupQuery'), 'Worker should have collection-group query helper.');
assert(worker.includes('allDescendants = true'), 'Collection-group query should default to allDescendants.');
assert(workerSource.includes('responseRate'), 'Engagement metrics should include responseRate.');
assert(workerSource.includes('activePrayingUsers7d'), 'Engagement metrics should include activePrayingUsers7d.');
assert(workerSource.includes('requestOnly'), 'Engagement metrics should include reciprocity requestOnly.');
assert(workerSource.includes('prayOnly'), 'Engagement metrics should include reciprocity prayOnly.');
assert(workerSource.includes('retentionRate'), 'Engagement metrics should include retentionRate.');
assert(workerSource.includes('groupingAvailable'), 'Engagement metrics should include groupingAvailable.');
assert(workerSource.includes('windowTooShortForRetention'), 'Engagement metrics should flag windows that are too short for retention.');
assert(engagement.includes('Math.min(90, Math.max(1, Math.floor(requestedDays)))'), 'Engagement window should clamp days to an integer between 1 and 90.');
assert(!worker.includes('Math.min(90, Math.max(1, Math.floor(requestedDays)))'), 'Engagement day clamp should live in spiritual-engagement module.');
assert(!worker.includes('metricTitle') && !worker.includes('metricBody'), 'Engagement endpoint must not expose prayer content.');
assert(worker.includes('requireAdmin(env, user)') || worker.includes('requireAdmin('), 'Spiritual engagement endpoint must require admin.');

assert(gamification.includes('awardXpEvent'), 'Gamification module should award idempotent XP events.');
assert(gamification.includes('currentDocument: { exists: false }'), 'XP events should use create-if-missing semantics.');
assert(gamification.includes('allowAlreadyExists: true'), 'XP awards should tolerate duplicate commits.');
assert(gamification.includes('dailyChallengeComplete') && gamification.includes('XP_AWARDS.dailyChallenge'), 'Gamification should award daily-challenge bonus XP.');
assert(gamification.includes('streak7Awarded') && gamification.includes('XP_AWARDS.streak7'), 'Gamification should award streak-7 bonus XP.');
assert(gamificationLogic.includes("return 'UTC'"), 'Gamification should fall back to UTC for invalid time zones.');
assert(gamification.includes('SUMMARY_COLLECTION') && gamification.includes('gamificationSummaries'), 'Gamification summary should read a materialized summary document.');
assert(gamificationSummarySource.includes('fs.getDocument(env, fs.docName(env, SUMMARY_COLLECTION, uid))'), 'Gamification summary endpoint should perform a single stored-summary read.');
assert(!gamificationSummarySource.includes('runCollectionGroupQuery'), 'Gamification summary should not fan out across collection-group queries.');
assert(!gamificationSummarySource.includes('Promise.all'), 'Gamification summary should not parallelize live collection scans.');
assert(!gamificationSummarySource.includes('listDocuments'), 'Gamification summary should not list Firestore collections on app startup.');
assert(!gamificationBackfillSource.includes('runCollectionGroupQuery'), 'Gamification backfill compatibility endpoint should not scan historical collections.');
assert(!gamificationBackfillSource.includes('awardXpEvent'), 'Gamification backfill compatibility endpoint should not rewrite historical XP events.');
assert(gamification.includes('recordPrayerCreated') && gamification.includes('recordPrayerAnswered'), 'Gamification should maintain prayer counters incrementally.');
assert(!gamification.includes('recordEncouragementSent'), 'Gamification should not maintain removed encouragement counters.');
assert(!gamification.includes('encouragementsSent'), 'Gamification summary should not expose removed encouragement counters.');

if (failures.length) {
  console.error('Worker smoke test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Worker smoke test passed: atomic/idempotent writes, safe errors, CORS, and notification preferences checked.');
