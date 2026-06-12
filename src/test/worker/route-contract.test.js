import { describe, expect, it } from 'vitest';

const CONTRACTS = [
  { method: 'GET', path: '/api/me/profile' },
  { method: 'POST', path: '/api/me/profile' },
  { method: 'POST', path: '/api/me/avatar' },
  { method: 'GET', path: '/api/prayers' },
  { method: 'POST', path: '/api/prayers' },
  { method: 'POST', path: '/api/prayers/:id/update' },
  { method: 'POST', path: '/api/prayers/:id/mark-answered' },
  { method: 'POST', path: '/api/prayers/:id/pray' },
  { method: 'DELETE', path: '/api/prayers/:id' },
  { method: 'GET', path: '/api/testimonies' },
  { method: 'POST', path: '/api/testimonies' },
  { method: 'POST', path: '/api/testimonies/:id/update' },
  { method: 'DELETE', path: '/api/testimonies/:id' },
  { method: 'POST', path: '/api/testimonies/:id/react' },
  { method: 'GET', path: '/api/announcements' },
  { method: 'GET', path: '/api/devotions' },
  { method: 'GET', path: '/api/prayer-sessions' },
  { method: 'POST', path: '/api/prayer-sessions' },
  { method: 'GET', path: '/api/calendar-events' },
  { method: 'POST', path: '/api/calendar-events' },
  { method: 'POST', path: '/api/calendar-events/:id/update' },
  { method: 'DELETE', path: '/api/calendar-events/:id' },
  { method: 'GET', path: '/api/calendar-bookmarks' },
  { method: 'POST', path: '/api/calendar-bookmarks/:date' },
  { method: 'DELETE', path: '/api/calendar-bookmarks/:date' },
  { method: 'GET', path: '/api/notifications' },
  { method: 'POST', path: '/api/notifications/read-all' },
  { method: 'POST', path: '/api/notifications/:id/read' },
  { method: 'GET', path: '/api/notification-settings' },
  { method: 'POST', path: '/api/notification-settings' },
  { method: 'GET', path: '/api/me/notifications/stream' },
  { method: 'POST', path: '/api/account/bootstrap-owner' },
  { method: 'POST', path: '/api/account/complete-registration' },
  { method: 'POST', path: '/api/account/resend-guardian-approval' },
  { method: 'POST', path: '/api/devices/register' },
  { method: 'GET', path: '/api/blocks' },
  { method: 'POST', path: '/api/blocks/:id' },
  { method: 'DELETE', path: '/api/blocks/:id' },
  { method: 'GET', path: '/api/prayer-bookmarks/:id' },
  { method: 'POST', path: '/api/prayer-bookmarks/:id' },
  { method: 'DELETE', path: '/api/prayer-bookmarks/:id' },
  { method: 'POST', path: '/api/reports' },
  { method: 'DELETE', path: '/api/account' },
  { method: 'GET', path: '/api/admin/spiritual-engagement' },
  { method: 'POST', path: '/api/admin/announcements/create' },
  { method: 'POST', path: '/api/admin/announcements/update' },
  { method: 'POST', path: '/api/admin/announcements/archive' },
  { method: 'POST', path: '/api/admin/reports/update' },
  { method: 'POST', path: '/api/admin/delete-content' },
  { method: 'POST', path: '/api/admin/suspend-user' },
  { method: 'POST', path: '/api/admin/unsuspend-user' },
  { method: 'POST', path: '/api/admin/delete-account' },
  { method: 'GET', path: '/api/admin/reports' },
  { method: 'GET', path: '/api/admin/users' },
  { method: 'GET', path: '/api/gamification/summary' },
  { method: 'POST', path: '/api/gamification/timezone' },
  { method: 'POST', path: '/api/gamification/backfill' },
  { method: 'GET', path: '/api/gamification/preferences' },
  { method: 'POST', path: '/api/gamification/preferences' },
];

const REMOVED_ENDPOINTS = [
  '/api/encouragements',
  '/api/encouragers/weekly',
  '/api/following/',
  '/api/gamification/leaderboard',
];

function normalizePath(path) {
  return path.replace(/\/:[^/]+/g, '/:param');
}

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
      routes.set(`GET ${rawPath}`, (routes.get(`GET ${rawPath}`) || 0) + 1);
    }
  }
  return routes;
}

describe('mobile-to-worker route contract', () => {
  it('every mobile API helper has a matching Worker route by method and normalized path', async () => {
    const api = (await import('../../../src/mobile/api.js?raw')).default;
    const workerCode = (await import('../../../worker/index.js?raw')).default;

    const workerRoutes = extractWorkerRoutes(workerCode);
    const failures = [];

    for (const { method, path } of CONTRACTS) {
      const rawPath = normalizePath(path);
      const routeKey = `${method} ${rawPath}`;

      // Mobile API check: path fragments present
      const staticSegments = path.split('/').filter(Boolean)
        .filter(s => !s.startsWith(':'));
      const apiOk = staticSegments.every(frag => api.includes(frag));
      if (!apiOk) failures.push(`API missing "${path}" for ${method} ${path}`);

      // Worker check: method + regex path
      if (!workerRoutes.has(routeKey)) {
        failures.push(`Worker missing ${routeKey}`);
      }
    }
    expect(failures).toStrictEqual([]);
  });

  it('no removed endpoints leak into mobile API', async () => {
    const api = (await import('../../../src/mobile/api.js?raw')).default;
    for (const endpoint of REMOVED_ENDPOINTS) {
      const escaped = endpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(api).not.toMatch(new RegExp(escaped));
    }
  });

  it('no removed endpoints leak into Worker', async () => {
    const workerCode = (await import('../../../worker/index.js?raw')).default;
    for (const endpoint of REMOVED_ENDPOINTS) {
      const escaped = endpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(workerCode).not.toMatch(new RegExp(escaped));
    }
  });

  it('PrayerDetailScreen uses updatePrayer/deletePrayer/markAnswered API helpers', async () => {
    const source = (await import('../../../src/mobile/screens/PrayerDetailScreen.jsx?raw')).default;
    expect(source).toMatch(/updatePrayer/);
    expect(source).toMatch(/deletePrayer/);
    expect(source).toMatch(/markAnswered/);
  });

  it('all mobile API DELETE methods are covered by the Worker with explicit method+path', async () => {
    const workerCode = (await import('../../../worker/index.js?raw')).default;
    const workerRoutes = extractWorkerRoutes(workerCode);
    const deleteRoutes = CONTRACTS.filter(c => c.method === 'DELETE');

    let missing = 0;
    for (const { path } of deleteRoutes) {
      const rawPath = normalizePath(path);
      if (!workerRoutes.has(`DELETE ${rawPath}`)) missing++;
    }
    expect(missing).toBe(0);
  });

  it.each(CONTRACTS)('Worker exposes $method $path', async ({ method, path }) => {
    const workerCode = (await import('../../../worker/index.js?raw')).default;
    const workerRoutes = extractWorkerRoutes(workerCode);
    const routeKey = `${method} ${normalizePath(path)}`;
    expect(workerRoutes.has(routeKey)).toBe(true);
  });

  it.each(CONTRACTS)('mobile API includes static segments for $method $path', async ({ method, path }) => {
    const api = (await import('../../../src/mobile/api.js?raw')).default;
    const staticSegments = path.split('/').filter(Boolean).filter((segment) => !segment.startsWith(':'));
    for (const segment of staticSegments) {
      expect(api.includes(segment)).toBe(true);
    }
  });
});
