import { describe, expect, it } from 'vitest';

describe('app feedback provider', () => {
  it('exports AppFeedbackProvider, useAppFeedback, and feedback actions', async () => {
    const source = await import('../../mobile/AppFeedbackProvider.jsx?raw');
    expect(source.default).toMatch(/export function AppFeedbackProvider/);
    expect(source.default).toMatch(/export function useAppFeedback/);
    expect(source.default).toMatch(/showToast/);
    expect(source.default).toMatch(/showXp/);
    expect(source.default).toMatch(/celebrate/);
    expect(source.default).not.toMatch(/document\./);
    expect(source.default).not.toMatch(/window\./);
    expect(source.default).not.toMatch(/<html/);
  });

  it('AppFeedbackProvider is mounted in app shell', async () => {
    const app = await import('../../../app/index.jsx?raw');
    expect(app.default).toMatch(/AppFeedbackProvider/);
  });
});
