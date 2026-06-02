const baseUrl = (process.env.SERVER_TEST_URL || 'https://prayerstride.fanelesibonge50.workers.dev').replace(/\/$/, '');
const allowedOrigin = baseUrl;
const disallowedOrigin = 'https://example.invalid';

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    redirect: 'manual',
    ...options,
  });
}

async function expectJson(path, expectedStatus, options = {}) {
  const response = await request(path, options);
  const body = await response.json();
  assert.equal(response.status, expectedStatus, `${options.method || 'GET'} ${path} status`);
  assert.match(response.headers.get('content-type') || '', /application\/json/, `${path} content type`);
  return { response, body };
}

const assert = {
  equal(actual, expected, label) {
    if (actual !== expected) throw new Error(`${label}: expected ${expected}, received ${actual}`);
  },
  match(actual, pattern, label) {
    if (!pattern.test(actual)) throw new Error(`${label}: ${JSON.stringify(actual)} did not match ${pattern}`);
  },
  ok(value, label) {
    if (!value) throw new Error(label);
  },
};

const health = await expectJson('/', 200);
assert.equal(health.body.ok, true, 'health ok');
assert.equal(health.body.service, 'prayerstride-api', 'health service');

for (const path of ['/privacy', '/terms', '/delete-account']) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} status`);
  assert.match(response.headers.get('content-type') || '', /text\/html/, `${path} content type`);
  assert.match(await response.text(), /<!doctype html>/i, `${path} HTML document`);
}

const notFound = await expectJson('/does-not-exist', 404);
assert.equal(notFound.body.error, 'Not found', 'unknown route error');

const apiNotFound = await expectJson('/api/does-not-exist', 401);
assert.equal(apiNotFound.body.error, 'Authentication required', 'unknown API route requires auth before discovery');

const protectedRoute = await expectJson('/api/blocks', 401);
assert.equal(protectedRoute.body.error, 'Authentication required', 'protected route auth error');

const malformedBearer = await expectJson('/api/blocks', 401, {
  headers: { Authorization: 'Bearer not-a-real-token' },
});
assert.equal(malformedBearer.body.error, 'Invalid authentication token', 'invalid token error');

const preflight = await request('/api/blocks', {
  method: 'OPTIONS',
  headers: {
    Origin: allowedOrigin,
    'Access-Control-Request-Method': 'GET',
  },
});
assert.equal(preflight.status, 204, 'preflight status');
assert.equal(preflight.headers.get('access-control-allow-origin'), allowedOrigin, 'allowed CORS origin');
assert.match(preflight.headers.get('access-control-allow-methods') || '', /GET/, 'allowed CORS methods');
assert.match(preflight.headers.get('access-control-allow-headers') || '', /Authorization/i, 'allowed CORS headers');

const rejectedPreflight = await request('/api/blocks', {
  method: 'OPTIONS',
  headers: {
    Origin: disallowedOrigin,
    'Access-Control-Request-Method': 'GET',
  },
});
assert.equal(rejectedPreflight.status, 204, 'disallowed-origin preflight status');
assert.ok(!rejectedPreflight.headers.has('access-control-allow-origin'), 'disallowed origin must not receive CORS access');

console.log(`Server smoke test passed against ${baseUrl}: health, legal pages, 404s, auth guards, and CORS checked.`);
