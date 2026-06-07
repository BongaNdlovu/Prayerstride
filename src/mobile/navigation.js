export const initialRoute = 'welcome';
const MAX_HISTORY_LENGTH = 40;

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
    history: [...(state.history || []), { screen: state.screen, params: state.params }].slice(-MAX_HISTORY_LENGTH),
  };
}

export function reset(screen = initialRoute, params = {}) {
  return { screen, params, history: [] };
}

export function back(state, fallback = 'home') {
  const history = state.history || [];
  const previous = history.length > 0 ? history[history.length - 1] : null;
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
    history: history.slice(0, -1),
  };
}
