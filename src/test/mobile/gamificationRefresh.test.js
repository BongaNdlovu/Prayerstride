import { describe, expect, it, vi } from 'vitest';
import { bumpGamificationRefresh, subscribeGamificationRefresh } from '../../mobile/gamificationRefresh.js';

describe('gamificationRefresh', () => {
  it('runs later listeners when an earlier listener throws', () => {
    const second = vi.fn();
    subscribeGamificationRefresh(() => {
      throw new Error('listener failed');
    });
    subscribeGamificationRefresh(second);
    bumpGamificationRefresh();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
