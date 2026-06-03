import { describe, expect, it } from 'vitest';

describe('Admin analytics abort handling', () => {
  it('uses AbortController and passes signal to metrics API', async () => {
    const admin = await import('../../mobile/screens/AdminDashboardScreen.jsx?raw');
    const api = await import('../../mobile/api.js?raw');
    expect(admin.default).toMatch(/AbortController/);
    expect(admin.default).toMatch(/getSpiritualEngagementMetrics\(30, \{ signal: controller\.signal \}\)/);
    expect(admin.default).toMatch(/abortRef\.current\?\.abort\(\)/);
    expect(admin.default).toMatch(/useCallback/);
    expect(admin.default).toMatch(/\[loadMetrics\]/);
    expect(api.default).toMatch(/getSpiritualEngagementMetrics\(days = 30, options = \{\}\)/);
  });
});
