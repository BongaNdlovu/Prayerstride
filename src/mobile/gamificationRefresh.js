const listeners = new Set();

export function bumpGamificationRefresh() {
  listeners.forEach((listener) => listener());
}

export function subscribeGamificationRefresh(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
