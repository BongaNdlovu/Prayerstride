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

if (failures.length) {
  console.error('Worker smoke test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Worker smoke test passed: atomic/idempotent writes, safe errors, CORS, and notification preferences checked.');
