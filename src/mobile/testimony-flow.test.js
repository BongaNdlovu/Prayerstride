import { describe, expect, it } from 'vitest';

describe('testimony flow', () => {
  it('HomeScreen marks prayers answered without creating testimonies', async () => {
    const source = await import('./screens/HomeScreen.jsx?raw');
    expect(source.default).not.toMatch(/addTestimony/);
    expect(source.default).toMatch(/await markAnswered\(prayer\.id\)/);
    expect(source.default).not.toMatch(/updateBody/);
    expect(source.default).not.toMatch(/Share Update/);
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
