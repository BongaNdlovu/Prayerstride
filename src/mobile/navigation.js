export const initialRoute = 'splash';

export function createNavState() {
  return { screen: initialRoute, params: {}, history: [], future: [] };
}

export function go(state, screen, params = {}) {
  if (state.screen === screen) {
    return { ...state, params };
  }

  return {
    screen,
    params,
    history: [...state.history, { screen: state.screen, params: state.params }],
    future: [],
  };
}

export function replace(state, screen, params = {}) {
  return {
    screen,
    params,
    history: state.history || [],
    future: state.future || [],
  };
}

export function reset(screen = initialRoute, params = {}) {
  return { screen, params, history: [], future: [] };
}

export function back(state, fallback = 'home') {
  const previous = state.history.length > 0 ? state.history[state.history.length - 1] : null;
  if (!previous) {
    if (state.screen === fallback) return state;
    return {
      screen: fallback,
      params: {},
      history: [],
      future: [{ screen: state.screen, params: state.params }, ...(state.future || [])],
    };
  }

  return {
    screen: previous.screen,
    params: previous.params || {},
    history: state.history.slice(0, -1),
    future: [{ screen: state.screen, params: state.params }, ...(state.future || [])],
  };
}

export function forward(state) {
  const next = state.future?.[0] || null;
  if (!next) return state;

  return {
    screen: next.screen,
    params: next.params || {},
    history: [...(state.history || []), { screen: state.screen, params: state.params }],
    future: state.future.slice(1),
  };
}
