import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const worker = readFileSync(join(process.cwd(), 'worker', 'index.js'), 'utf8');
const engagement = readFileSync(join(process.cwd(), 'worker', 'spiritual-engagement.js'), 'utf8');
const workerSource = `${worker}\n${engagement}`;
const failures = [];

const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

assert(worker.includes('bootstrapOwner'), 'Worker should implement owner bootstrap endpoint.');
assert(worker.includes('createPrayer(env'), 'Worker should implement createPrayer handler.');
assert(worker.includes('updatePrayer(env'), 'Worker should implement updatePrayer handler.');
assert(worker.includes('deletePrayer(env'), 'Worker should implement deletePrayer handler.');
assert(worker.includes('createTestimony(env'), 'Worker should implement createTestimony handler.');
assert(!worker.includes('/api/encouragements'), 'Worker should not expose comment endpoints.');
assert(!worker.includes('createEncouragement(env'), 'Worker should not implement comment creation.');
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
assert(worker.includes('const guardianEmailSent = await sendGuardianApprovalEmail'), 'Worker should report guardian email delivery truthfully.');
assert(worker.includes('const tokenId = await hashToken(token)'), 'Worker should store guardian approval tokens by hash.');
assert(worker.includes('escapeHtml(displayName'), 'Worker should escape display names included in guardian emails.');
assert(worker.includes('termsAcceptedAt'), 'Worker should persist a terms acceptance audit timestamp.');
assert(worker.includes('CURRENT_TERMS_VERSION'), 'Worker should validate the accepted terms version.');
assert(worker.includes('CURRENT_PRIVACY_VERSION'), 'Worker should validate the accepted privacy version.');
assert(worker.includes("registrationState: 'complete'"), 'Worker should complete registration server-side.');
assert(worker.includes("profile.registrationState === 'pending_completion'"), 'Worker should deny community access before registration completes.');
assert(worker.includes('privacyPageHtml'), 'Worker should serve public privacy HTML.');
assert(worker.includes('accountDeletionJobs'), 'Worker should write account deletion tombstones.');
assert(worker.includes('deleteFirebaseAuthUser'), 'Worker should delete Firebase Auth user last.');
assert(worker.includes('purgeExpiredDeletionTombstones'), 'Worker should purge expired deletion tombstones.');
assert(worker.includes('deleteStoragePrefix'), 'Worker should delete Storage objects during account deletion.');
assert(worker.includes('async scheduled'), 'Worker should define a scheduled handler for cron jobs.');
assert(worker.includes('weekly'), 'Worker should support weekly prayer limits.');
assert(worker.includes('fieldTransforms'), 'Worker should use Firestore transform writes for aggregate counts.');
assert(worker.includes("increment: { integerValue: '1' }"), 'Worker should increment counts atomically.');
assert(worker.includes("currentDocument: { exists: false }"), 'Worker should create deterministic per-user action docs for idempotency.');
assert(worker.includes("allowAlreadyExists: true"), 'Worker should treat duplicate pray/reaction actions as idempotent success.');
assert(worker.includes('getNotificationSettings'), 'Worker should read notification preferences before notifications/push.');
assert(worker.includes('response.ok') && worker.includes('invalidToken'), 'Worker should check FCM responses and clean up invalid tokens.');
assert(!worker.includes("Access-Control-Allow-Origin', env.CORS_ORIGIN || '*'"), 'Worker should not fall back to wildcard CORS.');
assert(!worker.includes('runFirestoreQuery'), 'Unused runFirestoreQuery helper should be removed.');
assert(worker.includes("status >= 500 ? 'Unexpected server error'"), 'Worker should hide raw internal errors from clients.');
assert(worker.includes("status: 401") && worker.includes("publicMessage: 'Authentication required'"), 'Worker should classify missing authentication as 401.');

assert(worker.includes('adminCreateAnnouncement'), 'Worker should implement adminCreateAnnouncement handler.');
assert(worker.includes('adminUpdateAnnouncement'), 'Worker should implement adminUpdateAnnouncement handler.');
assert(worker.includes('adminArchiveAnnouncement'), 'Worker should implement adminArchiveAnnouncement handler.');
assert(worker.includes('adminCreateAnnouncement'), 'Worker should implement adminCreateAnnouncement handler.');
assert(worker.includes('adminUpdateAnnouncement'), 'Worker should implement adminUpdateAnnouncement handler.');
assert(worker.includes('adminArchiveAnnouncement'), 'Worker should implement adminArchiveAnnouncement handler.');
assert(worker.includes('validateAnnouncementFields'), 'Worker should validate announcement required fields.');
assert(worker.includes('requireAdmin'), 'Worker announcement routes should require admin access.');
assert(worker.includes("status: 'archived'"), 'Worker should support archiving announcements.');
assert(worker.includes("return json({ error:"), 'Worker should return JSON error responses.');

assert(worker.includes('spiritual-engagement'), 'Worker should implement spiritual-engagement endpoint.');
assert(worker.includes('spiritualEngagementMetrics'), 'Worker should implement spiritualEngagementMetrics function.');
assert(worker.includes('runCollectionGroupQuery'), 'Worker should have collection-group query helper.');
assert(worker.includes('allDescendants: true'), 'Collection-group query should use allDescendants.');
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

if (failures.length) {
  console.error('Worker smoke test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Worker smoke test passed: atomic/idempotent writes, safe errors, CORS, and notification preferences checked.');
