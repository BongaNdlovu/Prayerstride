ALTER TABLE prayers ADD COLUMN category TEXT;
ALTER TABLE prayers ADD COLUMN scripture_ref TEXT;
CREATE INDEX IF NOT EXISTS idx_prayers_category ON prayers(category);
