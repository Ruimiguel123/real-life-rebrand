-- Real. Life Healing blog: run once against the D1 database.
-- The Worker also runs this automatically (CREATE ... IF NOT EXISTS) the
-- first time /admin is opened, so this file is for reference / manual setup.

CREATE TABLE IF NOT EXISTS posts (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  excerpt      TEXT NOT NULL DEFAULT '',
  body_html    TEXT NOT NULL DEFAULT '',
  cover_url    TEXT,
  cover_alt    TEXT,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  published_at TEXT
);
CREATE INDEX IF NOT EXISTS posts_status_published ON posts (status, published_at DESC);
