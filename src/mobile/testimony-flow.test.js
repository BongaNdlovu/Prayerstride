import { describe, expect, it } from 'vitest';

describe('testimony flow', () => {
  it('HomeScreen imports addTestimony for answered-prayer updates', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).toMatch(/addTestimony/);
    expect(source.default).toMatch(/prayerId: updatePrayer\.id/);
  });

  it('Worker still accepts testimony reaction types for admin/content compatibility', async () => {
    const workerSource = await import('../../worker/index.js?raw');
    expect(workerSource.default).toMatch(/praiseGod/);
    expect(workerSource.default).toMatch(/amen/);
  });

  it('legacy testimony pages are not exposed by the app shell', async () => {
    const source = await import('../../app/index.jsx?raw');
    expect(source.default).not.toMatch(/case 'praise'/);
    expect(source.default).not.toMatch(/case 'praiseDetail'/);
    expect(source.default).not.toMatch(/case 'createTestimony'/);
  });
});
