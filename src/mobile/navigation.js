export const initialRoute = 'splash';

export function createNavState() {
  return { screen: initialRoute, params: {}, history: [] };
}

export function go(state, screen, params = {}) {
  if (state.screen === screen) {
    return { ...state, params };
  }

  return {
    screen,
    params,
    history: [...state.history, { screen: state.screen, params: state.params }],
  };
}

export function reset(screen = initialRoute, params = {}) {
  return { screen, params, history: [] };
}

export function back(state, fallback = 'home') {
  const previous = state.history.length > 0 ? state.history[state.history.length - 1] : null;
  if (!previous) {
    if (state.screen === fallback) return state;
    return {
      screen: fallback,
      params: {},
      history: [],
    };
  }

  return {
    screen: previous.screen,
    params: previous.params || {},
    history: state.history.slice(0, -1),
  };
}
