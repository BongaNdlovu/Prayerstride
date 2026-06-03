import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFetchAbortContext } from '../../mobile/api.js';

describe('createFetchAbortContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('aborts after timeout when no external signal is provided', () => {
    const context = createFetchAbortContext(undefined, 1000);
    expect(context.signal.aborted).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(context.signal.aborted).toBe(true);
    expect(context.timedOut()).toBe(true);
    context.cleanup();
  });

  it('aborts when an external signal aborts', () => {
    const external = new AbortController();
    const context = createFetchAbortContext(external.signal, 15000);
    external.abort();
    expect(context.signal.aborted).toBe(true);
    expect(context.timedOut()).toBe(false);
    context.cleanup();
  });

  it('removes external abort listener on cleanup', () => {
    const external = new AbortController();
    const removeListener = vi.spyOn(external.signal, 'removeEventListener');
    const context = createFetchAbortContext(external.signal, 15000);
    context.cleanup();
    expect(removeListener).toHaveBeenCalled();
  });
});
