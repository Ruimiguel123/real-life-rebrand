/**
 * Cloudflare bindings used by the blog backend.
 *
 * Declared in wrangler.jsonc at the repo root (Nitro merges it into the
 * generated .output/server/wrangler.json). The Worker receives them as the
 * `env` argument to fetch(); server.ts stashes that object here so TanStack
 * server functions (which have no direct access to `env`) can reach it.
 *
 * `env` is the same object for every request in a Worker isolate, so a
 * module-level reference is safe — there is no per-request state in it.
 */

// Minimal shapes for the two bindings — enough for what this code calls.
// Avoids adding @cloudflare/workers-types as a dependency.
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}
export interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}
export interface R2Object {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
  httpEtag: string;
  size: number;
}
export interface R2Bucket {
  get(key: string): Promise<R2Object | null>;
  put(
    key: string,
    value: ReadableStream | ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
  delete(key: string): Promise<void>;
}

export interface BlogEnv {
  /** D1 binding — posts table */
  DB?: D1Database;
  /** R2 binding — cover images */
  MEDIA?: R2Bucket;
  /** e.g. "reallifehealing.cloudflareaccess.com" */
  ACCESS_TEAM_DOMAIN?: string;
  /** Application Audience (AUD) tag from the Access application */
  ACCESS_AUD?: string;
  /** Optional comma-separated allow-list, defence in depth on top of Access */
  ADMIN_EMAILS?: string;
}

let currentEnv: BlogEnv = {};

/**
 * Find the Cloudflare bindings for this request.
 *
 * Nitro's Cloudflare entry receives (request, env, ctx) but calls the app
 * with the request only, so the `env` argument that reaches src/server.ts
 * is undefined. Nitro does stash the bindings in two places we can read:
 * `globalThis.__env__` and `request.runtime.cloudflare.env`. Check the
 * argument first (in case a future version passes it), then those.
 */
export function resolveEnv(envArg: unknown, request?: Request): BlogEnv {
  const candidates: unknown[] = [
    envArg,
    (request as unknown as { runtime?: { cloudflare?: { env?: unknown } } } | undefined)?.runtime
      ?.cloudflare?.env,
    (globalThis as unknown as { __env__?: unknown }).__env__,
  ];
  for (const c of candidates) {
    if (c && typeof c === "object" && Object.keys(c as object).length > 0) return c as BlogEnv;
  }
  return {};
}

export function setEnv(env: unknown) {
  if (env && typeof env === "object") currentEnv = env as BlogEnv;
}

export function getEnv(): BlogEnv {
  return currentEnv;
}
