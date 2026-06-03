-- Idempotent foundation schema for PrayerStride Cloudflare migration.
-- Safe to re-run; feature-scoped tables added in later migrations.

CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  handle TEXT,
  bio TEXT,
  photo_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  owner INTEGER NOT NULL DEFAULT 0,
  suspended INTEGER NOT NULL DEFAULT 0,
  registration_state TEXT,
  community_access TEXT,
  date_of_birth TEXT,
  age_band TEXT,
  guardian_email TEXT,
  is_seventh_day_adventist INTEGER,
  church_name TEXT,
  terms_accepted_at TEXT,
  terms_version TEXT,
  privacy_version TEXT,
  avatar_public INTEGER NOT NULL DEFAULT 1,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  metadata_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_suspended ON users(suspended);

CREATE TABLE IF NOT EXISTS auth_audit_log (
  id TEXT PRIMARY KEY,
  uid TEXT,
  event TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL,
  metadata_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_log_uid ON auth_audit_log(uid);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_created_at ON auth_audit_log(created_at);

CREATE TABLE IF NOT EXISTS admin_actions (
  id TEXT PRIMARY KEY,
  actor_uid TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT NOT NULL,
  metadata_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_actor ON admin_actions(actor_uid);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);

CREATE TABLE IF NOT EXISTS dual_write_failures (
  id TEXT PRIMARY KEY,
  feature TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  error_message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  metadata_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_dual_write_failures_feature ON dual_write_failures(feature);
CREATE INDEX IF NOT EXISTS idx_dual_write_failures_created_at ON dual_write_failures(created_at);
