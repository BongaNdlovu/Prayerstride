-- Phase 3: tables for dual-write and Worker-backed mobile writes.

CREATE TABLE IF NOT EXISTS prayers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_uid TEXT NOT NULL,
  author_name TEXT,
  is_anonymous INTEGER NOT NULL DEFAULT 0,
  prayed_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  privacy TEXT NOT NULL DEFAULT 'community',
  prayer_limit TEXT NOT NULL DEFAULT 'daily',
  urgent INTEGER NOT NULL DEFAULT 0,
  allow_share INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prayers_author ON prayers(author_uid);
CREATE INDEX IF NOT EXISTS idx_prayers_status ON prayers(status);
CREATE INDEX IF NOT EXISTS idx_prayers_created_at ON prayers(created_at);

CREATE TABLE IF NOT EXISTS prayer_prays (
  id TEXT PRIMARY KEY,
  prayer_id TEXT NOT NULL,
  uid TEXT NOT NULL,
  day_key TEXT,
  week_key TEXT,
  prayer_limit TEXT,
  author_uid TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prayer_prays_prayer ON prayer_prays(prayer_id);

CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  owner_uid TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  date_key TEXT NOT NULL,
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_owner_date ON calendar_events(owner_uid, date_key);

CREATE TABLE IF NOT EXISTS calendar_bookmarks (
  id TEXT PRIMARY KEY,
  owner_uid TEXT NOT NULL,
  date_key TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_calendar_bookmarks_owner ON calendar_bookmarks(owner_uid);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  recipient_uid TEXT NOT NULL,
  type TEXT,
  message TEXT,
  related_id TEXT,
  actor_uid TEXT,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_uid, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_uid, read);

CREATE TABLE IF NOT EXISTS notification_settings (
  uid TEXT PRIMARY KEY,
  prayer_activity INTEGER,
  testimony_reactions INTEGER,
  push_enabled INTEGER,
  announcements INTEGER,
  updated_at TEXT NOT NULL
);
