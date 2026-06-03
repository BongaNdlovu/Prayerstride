export function warn(...args) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn(...args);
}

export function error(...args) {
  console.error(...args);
}
