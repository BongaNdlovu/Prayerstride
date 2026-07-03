import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const api = readFileSync(join(process.cwd(), 'src', 'mobile', 'api.js'), 'utf8');
const worker = readFileSync(join(process.cwd(), 'worker', 'index.js'), 'utf8');
const failures = [];

const contracts = [
  ['GET', '/api/me/profile', 'me/profile'],
  ['POST', '/api/me/profile', 'me/profile'],
  ['POST', '/api/me/avatar', 'me/avatar'],
  ['GET', '/api/prayers', '/api/prayers'],
  ['POST', '/api/prayers', '/api/prayers'],
  ['GET', '/api/testimonies', '/api/testimonies'],
  ['GET', '/api/announcements', '/api/announcements'],
  ['GET', '/api/devotions', '/api/devotions'],
  ['GET', '/api/prayer-sessions', 'prayer-sessions'],
  ['GET', '/api/calendar-events', 'calendar-events'],
  ['GET', '/api/calendar-bookmarks', 'calendar-bookmarks'],
  ['GET', '/api/notifications', '/api/notifications'],
  ['GET', '/api/notification-settings', 'notification-settings'],
  ['GET', '/api/me/notifications/stream', 'notifications/stream'],
  ['POST', '/api/calendar-events', 'calendar-events'],
  ['POST', '/api/calendar-events/:id/update', 'calendar-events'],
  ['DELETE', '/api/calendar-events/:id', 'calendar-events'],
  ['POST', '/api/calendar-bookmarks/:date', 'bookmarkCalendarDate'],
  ['DELETE', '/api/calendar-bookmarks/:date', 'unbookmarkCalendarDate'],
  ['POST', '/api/notifications/read-all', 'notifications/read-all'],
  ['POST', '/api/notifications/:id/read', '/notifications'],
  ['POST', '/api/notification-settings', 'notification-settings'],
  ['POST', '/api/account/bootstrap-owner', 'bootstrap-owner'],
  ['POST', '/api/account/complete-registration', 'complete-registration'],
  ['POST', '/api/account/resend-guardian-approval', 'resend-guardian-approval'],
  ['POST', '/api/devices/register', 'devices/register'],
  ['POST', '/api/prayers/:id/update', '/prayers'],
  ['POST', '/api/prayers/:id/mark-answered', 'mark-answered'],
  ['POST', '/api/prayers/:id/pray', '/pray'],
  ['DELETE', '/api/prayers/:id', '/prayers'],
  ['POST', '/api/testimonies', '/api/testimonies'],
  ['POST', '/api/testimonies/:id/update', 'testimonies'],
  ['DELETE', '/api/testimonies/:id', 'testimonies'],
  ['POST', '/api/testimonies/:id/react', '/react'],
  ['GET', '/api/blocks', '/api/blocks'],
  ['POST', '/api/blocks/:id', '/api/blocks'],
  ['DELETE', '/api/blocks/:id', '/api/blocks'],
  ['GET', '/api/prayer-bookmarks/:id', 'prayer-bookmarks'],
  ['POST', '/api/prayer-bookmarks/:id', 'prayer-bookmarks'],
  ['DELETE', '/api/prayer-bookmarks/:id', 'prayer-bookmarks'],
  ['POST', '/api/reports', '/api/reports'],
  ['DELETE', '/api/account', '/api/account'],
  ['GET', '/api/admin/spiritual-engagement', 'spiritual-engagement'],
  ['POST', '/api/admin/announcements/create', 'announcements/create'],
  ['POST', '/api/admin/announcements/update', 'announcements/update'],
  ['POST', '/api/admin/announcements/archive', 'announcements/archive'],
  ['GET', '/api/gamification/summary', 'gamification/summary'],
  ['POST', '/api/gamification/timezone', 'gamification/timezone'],
  ['POST', '/api/gamification/backfill', 'gamification/backfill'],
  ['GET', '/api/gamification/leaderboard', 'gamification/leaderboard'],
  ['GET', '/api/gamification/preferences', 'gamification/preferences'],
  ['POST', '/api/gamification/preferences', 'gamification/preferences'],
  ['POST', '/api/prayer-sessions', 'prayer-sessions'],
];

const adminContracts = [
  ['POST', '/api/admin/reports/update', 'reports/update'],
  ['POST', '/api/admin/delete-content', 'delete-content'],
  ['POST', '/api/admin/suspend-user', 'suspend-user'],
  ['POST', '/api/admin/unsuspend-user', 'unsuspend-user'],
  ['POST', '/api/admin/delete-account', 'delete-account'],
  ['GET', '/api/admin/reports', '/api/admin/reports'],
  ['GET', '/api/admin/users', '/api/admin/users'],
];

function extractWorkerRoutes(workerCode) {
  const routes = new Map();
  const lines = workerCode.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const marker = 'match(/^';
    const matchIdx = lines[i].indexOf(marker);
    if (matchIdx === -1) continue;

    const startIdx = matchIdx + marker.length;
    const endIdx = lines[i].indexOf('$/', startIdx);
    if (endIdx === -1) continue;

    let rawPath = lines[i].substring(startIdx, endIdx);
    rawPath = rawPath.replace(/\\\//g, '/').replace(/\\\./g, '.');
    rawPath = rawPath.replace(/\(\[\^\/\]\+\)/g, ':param');

    let foundMethod = false;
    for (let j = i; j < Math.min(i + 20, lines.length); j++) {
      if (j !== i && lines[j].includes('.match(/^')) break;
      const methodMatch = lines[j].match(/request\.method\s*===\s*'(GET|POST|PUT|DELETE|PATCH)'/);
      if (methodMatch) {
        foundMethod = true;
        const key = `${methodMatch[1]} ${rawPath}`;
        routes.set(key, (routes.get(key) || 0) + 1);
      }
    }
    if (!foundMethod) {
      const key = `GET ${rawPath}`;
      routes.set(key, (routes.get(key) || 0) + 1);
    }
  }
  return routes;
}

const workerRoutes = extractWorkerRoutes(worker);

for (const contract of contracts) {
  const [method, path, keyword] = contract;

  // Mobile API check: keyword-based path fragment validation
  const apiFragments = path.split(/\/:[^/]+/);
  const staticFragments = apiFragments.filter(Boolean);
  if (!staticFragments.every((fragment) => api.includes(fragment))) {
    failures.push(`Mobile API missing ${method} ${path}`);
  }

  // Worker check: method + normalized regex path
  const rawPath = path.replace(/\/:[^/]+/g, '/:param');
  const routeKey = `${method} ${rawPath}`;
  if (!workerRoutes.has(routeKey)) {
    failures.push(`Worker missing route: ${routeKey}`);
  }
}

for (const contract of adminContracts) {
  const [method, path, keyword] = contract;
  const apiFragments = path.split(/\/:[^/]+/);
  const staticFragments = apiFragments.filter(Boolean);
  if (!staticFragments.every((fragment) => api.includes(fragment))) {
    failures.push(`Mobile API missing ${method} ${path}`);
  }
  const rawPath = path.replace(/\/:[^/]+/g, '/:param');
  const routeKey = `${method} ${rawPath}`;
  if (!workerRoutes.has(routeKey)) {
    failures.push(`Worker missing route: ${routeKey}`);
  }
}

const removedDenylist = {
  mobile: ['/api/encouragements', '/api/encouragers/weekly', 'followUser', 'unfollowUser', '/api/following/'],
  worker: ['/api/encouragements', '/api/encouragers/weekly', '/api/following/', 'async function followUser', 'async function unfollowUser'],
};

for (const fragment of removedDenylist.mobile) {
  if (api.includes(fragment)) failures.push(`Mobile API should not expose removed endpoint: ${fragment}`);
}
for (const fragment of removedDenylist.worker) {
  if (worker.includes(fragment)) failures.push(`Worker should not route removed endpoint: ${fragment}`);
}

if (failures.length) {
  console.error('Worker route contract test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const totalChecked = contracts.length + adminContracts.length;
console.log(`Worker route contract test passed: ${totalChecked} METHOD+normalizedPath contracts checked.`);
