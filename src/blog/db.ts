import type { D1Database } from "./env";

export type PostStatus = "draft" | "published";

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_html: string;
  cover_url: string | null;
  cover_alt: string | null;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/** Public-safe subset for list pages (no body). */
export type PostSummary = Omit<Post, "body_html">;

export const SCHEMA_SQL = `
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
CREATE TABLE IF NOT EXISTS subscribers (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','unsubscribed')),
  source          TEXT NOT NULL DEFAULT 'lets-get-real',
  created_at      TEXT NOT NULL,
  unsubscribed_at TEXT
);
`;

const SUMMARY_COLS =
  "id, slug, title, excerpt, cover_url, cover_alt, status, created_at, updated_at, published_at";

export async function ensureSchema(db: D1Database) {
  for (const stmt of SCHEMA_SQL.split(";")) {
    const sql = stmt.trim();
    if (sql) await db.prepare(sql).run();
  }
}

export async function listPublished(db: D1Database): Promise<PostSummary[]> {
  const { results } = await db
    .prepare(
      `SELECT ${SUMMARY_COLS} FROM posts WHERE status = 'published' ORDER BY published_at DESC`,
    )
    .all<PostSummary>();
  return results;
}

export async function getPublishedBySlug(
  db: D1Database,
  slug: string,
): Promise<Post | null> {
  return db
    .prepare(`SELECT * FROM posts WHERE slug = ?1 AND status = 'published'`)
    .bind(slug)
    .first<Post>();
}

export async function listAll(db: D1Database): Promise<PostSummary[]> {
  const { results } = await db
    .prepare(`SELECT ${SUMMARY_COLS} FROM posts ORDER BY updated_at DESC`)
    .all<PostSummary>();
  return results;
}

export async function getById(db: D1Database, id: string): Promise<Post | null> {
  return db.prepare(`SELECT * FROM posts WHERE id = ?1`).bind(id).first<Post>();
}

export async function slugTaken(db: D1Database, slug: string, exceptId: string) {
  const row = await db
    .prepare(`SELECT id FROM posts WHERE slug = ?1 AND id != ?2`)
    .bind(slug, exceptId)
    .first<{ id: string }>();
  return Boolean(row);
}

export interface SavePostInput {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_html: string;
  cover_url: string | null;
  cover_alt: string | null;
  status: PostStatus;
}

export async function savePost(db: D1Database, p: SavePostInput) {
  const now = new Date().toISOString();
  const existing = await getById(db, p.id);
  const publishedAt =
    p.status === "published"
      ? (existing?.published_at ?? now)
      : (existing?.published_at ?? null);

  await db
    .prepare(
      `INSERT INTO posts (id, slug, title, excerpt, body_html, cover_url, cover_alt, status, created_at, updated_at, published_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?9, ?10)
       ON CONFLICT(id) DO UPDATE SET
         slug = excluded.slug,
         title = excluded.title,
         excerpt = excluded.excerpt,
         body_html = excluded.body_html,
         cover_url = excluded.cover_url,
         cover_alt = excluded.cover_alt,
         status = excluded.status,
         updated_at = excluded.updated_at,
         published_at = excluded.published_at`,
    )
    .bind(
      p.id,
      p.slug,
      p.title,
      p.excerpt,
      p.body_html,
      p.cover_url,
      p.cover_alt,
      p.status,
      now,
      publishedAt,
    )
    .run();
}

export async function setStatus(db: D1Database, id: string, status: PostStatus) {
  const now = new Date().toISOString();
  if (status === "published") {
    await db
      .prepare(
        `UPDATE posts SET status = 'published', updated_at = ?2,
           published_at = COALESCE(published_at, ?2) WHERE id = ?1`,
      )
      .bind(id, now)
      .run();
  } else {
    await db
      .prepare(`UPDATE posts SET status = 'draft', updated_at = ?2 WHERE id = ?1`)
      .bind(id, now)
      .run();
  }
}

export async function deletePost(db: D1Database, id: string) {
  await db.prepare(`DELETE FROM posts WHERE id = ?1`).bind(id).run();
}

// ───────────────────────────────────────────────────────── subscribers ──

export interface Subscriber {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  source: string;
  created_at: string;
  unsubscribed_at: string | null;
}

/** Normalise for storage/lookup: trim + lowercase. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Loose but practical email check; the browser did the strict one. */
export function looksLikeEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

/**
 * Add a subscriber. Idempotent: an existing active address is left alone,
 * an unsubscribed one is re-activated (they asked again). Returns whether
 * a new row was created, for logging only — the caller should respond the
 * same way either way so the endpoint can't be used to test addresses.
 */
export async function addSubscriber(
  db: D1Database,
  email: string,
  source = "lets-get-real",
): Promise<"created" | "reactivated" | "unchanged"> {
  const now = new Date().toISOString();
  const existing = await db
    .prepare(`SELECT id, status FROM subscribers WHERE email = ?1`)
    .bind(email)
    .first<{ id: string; status: Subscriber["status"] }>();
  if (!existing) {
    await db
      .prepare(
        `INSERT INTO subscribers (id, email, status, source, created_at) VALUES (?1, ?2, 'active', ?3, ?4)`,
      )
      .bind(crypto.randomUUID(), email, source, now)
      .run();
    return "created";
  }
  if (existing.status === "unsubscribed") {
    await db
      .prepare(
        `UPDATE subscribers SET status = 'active', unsubscribed_at = NULL, created_at = ?2 WHERE id = ?1`,
      )
      .bind(existing.id, now)
      .run();
    return "reactivated";
  }
  return "unchanged";
}

export async function unsubscribe(db: D1Database, email: string): Promise<void> {
  await db
    .prepare(
      `UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = ?2 WHERE email = ?1 AND status = 'active'`,
    )
    .bind(email, new Date().toISOString())
    .run();
}

export async function listSubscribers(db: D1Database): Promise<Subscriber[]> {
  const { results } = await db
    .prepare(`SELECT * FROM subscribers ORDER BY status ASC, created_at DESC`)
    .all<Subscriber>();
  return results;
}

export async function deleteSubscriber(db: D1Database, id: string): Promise<void> {
  await db.prepare(`DELETE FROM subscribers WHERE id = ?1`).bind(id).run();
}
