import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const api = readFileSync(join(process.cwd(), 'src', 'mobile', 'api.js'), 'utf8');
const worker = readFileSync(join(process.cwd(), 'worker', 'index.js'), 'utf8');
const failures = [];

const contracts = [
  ['POST', '/api/account/bootstrap-owner', 'account/bootstrap-owner'],
  ['POST', '/api/account/complete-registration', 'account/complete-registration'],
  ['POST', '/api/account/resend-guardian-approval', 'account/resend-guardian-approval'],
  ['POST', '/api/devices/register', 'devices/register'],
  ['POST', '/api/prayers', '/api/prayers'],
  ['POST', '/api/prayers/:id/update', '/update'],
  ['POST', '/api/prayers/:id/mark-answered', '/mark-answered'],
  ['POST', '/api/prayers/:id/pray', '/pray'],
  ['DELETE', '/api/prayers/:id', '/api/prayers'],
  ['POST', '/api/testimonies', '/api/testimonies'],
  ['POST', '/api/testimonies/:id/update', '/update'],
  ['DELETE', '/api/testimonies/:id', '/api/testimonies'],
  ['POST', '/api/testimonies/:id/react', '/react'],
  ['GET', '/api/blocks', '/api/blocks'],
  ['POST', '/api/blocks/:id', '/api/blocks'],
  ['DELETE', '/api/blocks/:id', '/api/blocks'],
  ['POST', '/api/following/:id', '/api/following'],
  ['DELETE', '/api/following/:id', '/api/following'],
  ['GET', '/api/prayer-bookmarks/:id', '/api/prayer-bookmarks'],
  ['POST', '/api/prayer-bookmarks/:id', '/api/prayer-bookmarks'],
  ['DELETE', '/api/prayer-bookmarks/:id', '/api/prayer-bookmarks'],
  ['POST', '/api/reports', '/api/reports'],
  ['DELETE', '/api/account', '/api/account'],
  ['GET', '/api/admin/spiritual-engagement', 'spiritual-engagement'],
  ['POST', '/api/admin/announcements/create', 'announcements/create'],
  ['POST', '/api/admin/announcements/update', 'announcements/update'],
  ['POST', '/api/admin/announcements/archive', 'announcements/archive'],
  ['GET', '/api/gamification/summary', 'gamification/summary'],
  ['POST', '/api/gamification/timezone', 'gamification/timezone'],
  ['POST', '/api/gamification/backfill', 'gamification/backfill'],
  ['POST', '/api/prayer-sessions', 'prayer-sessions'],
  ['POST', '/api/encouragements', '/api/encouragements'],
  ['GET', '/api/encouragers/weekly', 'encouragers/weekly'],
];

for (const [method, path, routeFragment] of contracts) {
  const apiFragments = path.split(':id').filter(Boolean);
  if (!apiFragments.every((fragment) => api.includes(fragment))) failures.push(`Mobile API helper missing ${method} ${path}`);
  if (!worker.includes(routeFragment.replaceAll('/', '\\/'))) failures.push(`Worker route missing ${method} ${path}`);
}

for (const route of [
  'delete-content',
  'suspend-user',
  'unsuspend-user',
  'delete-account',
  'reports/update',
]) {
  if (!api.includes(`/api/admin/${route}`)) failures.push(`Mobile API helper missing /api/admin/${route}`);
  if (!worker.includes(route.replaceAll('/', '\\/'))) failures.push(`Worker route missing /api/admin/${route}`);
}

if (failures.length) {
  console.error('Worker route contract test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Worker route contract test passed: ${contracts.length + 5} mobile-to-worker endpoint contracts checked.`);
