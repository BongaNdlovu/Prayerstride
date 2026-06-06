import { describe, expect, it } from 'vitest';

describe('production wiring', () => {
  it('wrangler.toml declares D1 bindings', async () => {
    const source = (await import('../../../wrangler.toml?raw')).default;
    expect(source).toMatch(/binding\s*=\s*"DB"/);
    expect(source).toMatch(/database_name/);
  });

  it('wrangler.toml declares R2 bindings', async () => {
    const source = (await import('../../../wrangler.toml?raw')).default;
    expect(source).toMatch(/r2_buckets/);
    expect(source).toMatch(/bucket_name/);
  });

  it('wrangler.toml declares Durable Object bindings', async () => {
    const source = (await import('../../../wrangler.toml?raw')).default;
    expect(source).toMatch(/USER_NOTIFICATION_STREAM/);
  });

  it('wrangler.toml declares cron triggers for scheduled handler', async () => {
    const source = (await import('../../../wrangler.toml?raw')).default;
    expect(source).toMatch(/crons/);
    expect(source).toMatch(/\[triggers\]/);
  });

  it('mobile API uses production worker URL constant', async () => {
    const source = (await import('../../../src/mobile/api.js?raw')).default;
    expect(source).toMatch(/EXPO_PUBLIC_API_URL/);
    expect(source).toMatch(/API_URL/);
  });

  it('app.json has valid store identifiers', async () => {
    const source = (await import('../../../app.json?raw')).default;
    const parsed = JSON.parse(source);
    expect(parsed.expo?.slug).toBeTruthy();
    expect(parsed.expo?.name).toBeTruthy();
    expect(parsed.expo?.ios?.bundleIdentifier).toBe('com.lift.prayer');
    expect(parsed.expo?.android?.package).toBe('com.lift.prayer');
  });

  it('server smoke uses production worker URL', async () => {
    const source = (await import('../../../scripts/server-smoke.mjs?raw')).default;
    expect(source).toMatch(/prayerstride\.fanelesibonge50\.workers\.dev/);
  });

  it('worker exports Durable Object classes', async () => {
    const source = (await import('../../../worker/index.js?raw')).default;
    expect(source).toMatch(/export \{ UserNotificationStream \}/);
    expect(source).toMatch(/export \{ AdminEventStream \}/);
  });

  it('worker has dual-write commit with both Firestore and D1 paths', async () => {
    const source = (await import('../../../worker/index.js?raw')).default;
    expect(source).toMatch(/commitFirestoreWithD1/);
    expect(source).toMatch(/dual-write/);
  });

  it('worker handles OPTIONS preflight for CORS', async () => {
    const source = (await import('../../../worker/index.js?raw')).default;
    expect(source).toMatch(/request\.method === 'OPTIONS'/);
    expect(source).toMatch(/withCors/);
  });

  it('worker enforces global rate limiting on /api/ routes', async () => {
    const source = (await import('../../../worker/index.js?raw')).default;
    expect(source).toMatch(/enforceGlobalRateLimit/);
    expect(source).toMatch(/url\.pathname\.startsWith\('\/api\/'\)/);
  });
});
