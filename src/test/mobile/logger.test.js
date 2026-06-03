import { afterEach, describe, expect, it, vi } from 'vitest';

describe('logger', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('logs errors in production builds', async () => {
    vi.stubGlobal('__DEV__', false);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { error } = await import('../../mobile/logger.js');
    error('production failure');
    expect(consoleError).toHaveBeenCalledWith('production failure');
  });

  it('keeps warnings dev-only', async () => {
    vi.stubGlobal('__DEV__', false);
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { warn } = await import('../../mobile/logger.js');
    warn('should not log');
    expect(consoleWarn).not.toHaveBeenCalled();
  });
});
