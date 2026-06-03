export function utcNowIso() {
  return new Date().toISOString();
}

export function newId() {
  return crypto.randomUUID();
}
