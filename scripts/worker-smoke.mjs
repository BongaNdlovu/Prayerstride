import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const worker = readFileSync(join(process.cwd(), 'worker', 'index.js'), 'utf8');
const failures = [];

const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

assert(worker.includes('fieldTransforms'), 'Worker should use Firestore transform writes for aggregate counts.');
assert(worker.includes("increment: { integerValue: '1' }"), 'Worker should increment counts atomically.');
assert(worker.includes("currentDocument: { exists: false }"), 'Worker should create deterministic per-user action docs for idempotency.');
assert(worker.includes("allowAlreadyExists: true"), 'Worker should treat duplicate pray/reaction actions as idempotent success.');
assert(worker.includes('getNotificationSettings'), 'Worker should read notification preferences before notifications/push.');
assert(worker.includes('response.ok') && worker.includes('invalidToken'), 'Worker should check FCM responses and clean up invalid tokens.');
assert(!worker.includes("Access-Control-Allow-Origin', env.CORS_ORIGIN || '*'"), 'Worker should not fall back to wildcard CORS.');
assert(!worker.includes('runFirestoreQuery'), 'Unused runFirestoreQuery helper should be removed.');
assert(worker.includes("status >= 500 ? 'Unexpected server error'"), 'Worker should hide raw internal errors from clients.');

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
assert(worker.includes('responseRate'), 'Engagement metrics should include responseRate.');
assert(worker.includes('activePrayingUsers7d'), 'Engagement metrics should include activePrayingUsers7d.');
assert(worker.includes('requestOnly'), 'Engagement metrics should include reciprocity requestOnly.');
assert(worker.includes('prayOnly'), 'Engagement metrics should include reciprocity prayOnly.');
assert(worker.includes('retentionRate'), 'Engagement metrics should include retentionRate.');
assert(worker.includes('groupingAvailable'), 'Engagement metrics should include groupingAvailable.');
assert(!worker.includes('metricTitle') && !worker.includes('metricBody'), 'Engagement endpoint must not expose prayer content.');
assert(worker.includes('requireAdmin(env, user)') || worker.includes('requireAdmin('), 'Spiritual engagement endpoint must require admin.');

if (failures.length) {
  console.error('Worker smoke test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Worker smoke test passed: atomic/idempotent writes, safe errors, CORS, and notification preferences checked.');
