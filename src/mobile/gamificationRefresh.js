const listeners = new Set();

export function bumpGamificationRefresh() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignore subscriber errors.
    }
  });
}

export function subscribeGamificationRefresh(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
