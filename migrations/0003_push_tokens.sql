-- Phase 6: Expo/FCM push token registry in D1.

CREATE TABLE IF NOT EXISTS push_tokens (
  id TEXT PRIMARY KEY,
  uid TEXT NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'android',
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_uid ON push_tokens(uid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);
