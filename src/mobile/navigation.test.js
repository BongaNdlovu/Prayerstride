import { describe, expect, it } from 'vitest';
import { createNavState, go, back, reset, initialRoute } from './navigation';

describe('navigation', () => {
  it('createNavState returns welcome with empty params and history', () => {
    const state = createNavState();
    expect(state.screen).toBe(initialRoute);
    expect(state.params).toEqual({});
    expect(state.history).toEqual([]);
  });

  it('go pushes previous screen into history', () => {
    const state = createNavState();
    const next = go(state, 'home', { foo: 'bar' });
    expect(next.screen).toBe('home');
    expect(next.params).toEqual({ foo: 'bar' });
    expect(next.history).toEqual([{ screen: 'welcome', params: {} }]);
  });

  it('go updates params without duplicating the current screen', () => {
    const state = { screen: 'home', params: {}, history: [] };
    const next = go(state, 'home', { refreshed: true });
    expect(next).toEqual({ screen: 'home', params: { refreshed: true }, history: [] });
  });

  it('go bounds navigation history', () => {
    let state = createNavState();
    for (let index = 0; index < 50; index += 1) {
      state = go(state, `screen-${index}`);
    }
    expect(state.history).toHaveLength(40);
    expect(state.history[0].screen).toBe('screen-9');
  });

  it('back returns to the previous screen', () => {
    const state = { screen: 'home', params: {}, history: [{ screen: 'welcome', params: {} }] };
    const prev = back(state, 'welcome');
    expect(prev.screen).toBe('welcome');
    expect(prev.params).toEqual({});
    expect(prev.history).toEqual([]);
  });

  it('back uses fallback when history is empty', () => {
    const state = createNavState();
    const prev = back(state, 'welcome');
    expect(prev.screen).toBe('welcome');
    expect(prev.params).toEqual({});
    expect(prev.history).toEqual([]);
  });

  it('reset clears history', () => {
    const state = { screen: 'detail', params: { id: '1' }, history: [{ screen: 'home', params: {} }, { screen: 'leaderboard', params: {} }] };
    const fresh = reset('home');
    expect(fresh.screen).toBe('home');
    expect(fresh.params).toEqual({});
    expect(fresh.history).toEqual([]);
  });
});
