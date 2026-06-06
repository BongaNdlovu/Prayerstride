import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({
  updatePrayer: vi.fn(async () => ({ ok: true })),
}));

vi.mock('../../mobile/api.js', () => ({
  createPrayer: vi.fn(),
  createTestimony: vi.fn(),
  deletePrayer: vi.fn(),
  getPrayers: vi.fn(),
  getTestimonies: vi.fn(),
  markPrayerAnswered: vi.fn(),
  updatePrayer: (...args) => apiMocks.updatePrayer(...args),
}));

describe('updatePrayer payload behavior', () => {
  beforeEach(() => {
    apiMocks.updatePrayer.mockClear();
  });

  it('sends only body when only body is provided', async () => {
    const { updatePrayer } = await import('../../mobile/usePrayerData.js');
    await updatePrayer('p1', { body: 'updated text' });

    expect(apiMocks.updatePrayer).toHaveBeenCalledTimes(1);
    expect(apiMocks.updatePrayer).toHaveBeenCalledWith('p1', { body: 'updated text' });
    expect(Object.keys(apiMocks.updatePrayer.mock.calls[0][1])).toEqual(['body']);
  });

  it('sends only title when only title is provided', async () => {
    const { updatePrayer } = await import('../../mobile/usePrayerData.js');
    await updatePrayer('p1', { title: 'New title' });

    expect(apiMocks.updatePrayer).toHaveBeenCalledWith('p1', { title: 'New title' });
    expect(Object.keys(apiMocks.updatePrayer.mock.calls[0][1])).toEqual(['title']);
  });

  it('includes only fields explicitly present on data', async () => {
    const { updatePrayer } = await import('../../mobile/usePrayerData.js');
    await updatePrayer('p1', {
      body: 'Pray',
      privacy: 'private',
      urgent: true,
    });

    expect(apiMocks.updatePrayer).toHaveBeenCalledWith('p1', {
      body: 'Pray',
      privacy: 'private',
      urgent: true,
    });
    expect(Object.keys(apiMocks.updatePrayer.mock.calls[0][1]).sort()).toEqual(['body', 'privacy', 'urgent']);
  });

  it('maps text alias to body without adding other defaults', async () => {
    const { updatePrayer } = await import('../../mobile/usePrayerData.js');
    await updatePrayer('p1', { text: 'via text alias' });

    expect(apiMocks.updatePrayer).toHaveBeenCalledWith('p1', { body: 'via text alias' });
    expect(Object.keys(apiMocks.updatePrayer.mock.calls[0][1])).toEqual(['body']);
  });

  it('rejects missing prayer ids', async () => {
    const { updatePrayer } = await import('../../mobile/usePrayerData.js');
    await expect(updatePrayer('', { body: 'x' })).rejects.toThrow('Missing prayer request.');
    expect(apiMocks.updatePrayer).not.toHaveBeenCalled();
  });
});
