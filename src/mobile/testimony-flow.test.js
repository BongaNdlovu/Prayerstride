import { describe, expect, it } from 'vitest';

describe('testimony flow', () => {
  it('PraiseScreen imports useTestimonies', async () => {
    const source = await import('./screens/PraiseScreen.jsx?raw');
    expect(source.default).toMatch(/useTestimonies/);
  });

  it('PraiseDetailScreen imports reaction API', async () => {
    const source = await import('./screens/PraiseDetailScreen.jsx?raw');
    expect(source.default).toMatch(/reactToTestimony/);
  });

  it('CreateTestimonyScreen imports addTestimony', async () => {
    const source = await import('./screens/CreateTestimonyScreen.jsx?raw');
    expect(source.default).toMatch(/addTestimony/);
  });

  it('Reaction type constants include praiseGod and amen', async () => {
    const workerSource = await import('../../worker/index.js?raw');
    expect(workerSource.default).toMatch(/praiseGod/);
    expect(workerSource.default).toMatch(/amen/);
  });

  it('No web-only APIs imported', async () => {
    const sources = await Promise.all([
      import('./screens/PraiseScreen.jsx?raw'),
      import('./screens/PraiseDetailScreen.jsx?raw'),
      import('./screens/CreateTestimonyScreen.jsx?raw'),
    ]);
    for (const { default: src } of sources) {
      expect(src).not.toMatch(/from ['"]react-dom['"]/);
      expect(src).not.toMatch(/window\.confirm/);
    }
  });
});
