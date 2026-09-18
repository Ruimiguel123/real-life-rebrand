/**
 * access.ts — verifies that a request to /admin came through Cloudflare
 * Access and belongs to an allowed user.
 *
 * Cloudflare Access sits in front of /admin/* (configured in the Zero Trust
 * dashboard, not in code). When a visitor passes its login, Cloudflare adds
 * a signed JWT to every request in the `Cf-Access-Jwt-Assertion` header.
 * This module verifies that signature against Cloudflare's published keys.
 *
 * Why verify at all if Access already gates the path? Because Access is a
 * dashboard setting that can be misconfigured or removed, and a Worker is
 * reachable at its *.workers.dev URL where Access may not apply. Verifying
 * here means the admin is closed unless BOTH pieces are in place.
 *
 * Fail closed: missing config, missing token, bad signature, wrong audience,
 * expired — all return null and the caller responds 403.
 *
 * No dependencies; RS256 via Web Crypto.
 */

import type { BlogEnv } from "./env";

interface Jwk {
  kid: string;
  kty: string;
  alg?: string;
  n: string;
  e: string;
}

interface AccessClaims {
  aud: string | string[];
  email?: string;
  exp: number;
  nbf?: number;
  iat?: number;
  iss: string;
  sub?: string;
}

export interface AccessIdentity {
  email: string;
}

// Cloudflare rotates keys rarely; cache for an hour per isolate.
let keyCache: { fetchedAt: number; keys: Jwk[] } | null = null;
const KEY_TTL_MS = 60 * 60 * 1000;

function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function b64urlToJson<T>(s: string): T {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(s))) as T;
}

async function getKeys(teamDomain: string, kid: string): Promise<Jwk[]> {
  const stale = !keyCache || Date.now() - keyCache.fetchedAt > KEY_TTL_MS;
  const missing = keyCache && !keyCache.keys.some((k) => k.kid === kid);
  if (stale || missing) {
    const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Access certs fetch failed: ${res.status}`);
    const data = (await res.json()) as { keys?: Jwk[] };
    keyCache = { fetchedAt: Date.now(), keys: data.keys ?? [] };
  }
  return keyCache!.keys;
}

function tokenFromRequest(request: Request): string | null {
  const header = request.headers.get("Cf-Access-Jwt-Assertion");
  if (header) return header.trim();
  const cookie = request.headers.get("cookie") ?? "";
  const m = cookie.match(/(?:^|;\s*)CF_Authorization=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function verifyAccess(
  request: Request,
  env: BlogEnv,
): Promise<AccessIdentity | null> {
  const teamDomain = env.ACCESS_TEAM_DOMAIN?.trim();
  const aud = env.ACCESS_AUD?.trim();
  if (!teamDomain || !aud) return null; // not configured → closed

  const token = tokenFromRequest(request);
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  let header: { alg?: string; kid?: string };
  let claims: AccessClaims;
  try {
    header = b64urlToJson(parts[0]);
    claims = b64urlToJson(parts[1]);
  } catch {
    return null;
  }
  if (header.alg !== "RS256" || !header.kid) return null;

  // Claims first (cheap), then signature.
  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.exp !== "number" || claims.exp <= now) return null;
  if (typeof claims.nbf === "number" && claims.nbf > now + 60) return null;
  if (claims.iss !== `https://${teamDomain}`) return null;
  const audList = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audList.includes(aud)) return null;
  const email = claims.email?.toLowerCase();
  if (!email) return null;

  const allow = env.ADMIN_EMAILS?.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow && allow.length > 0 && !allow.includes(email)) return null;

  let keys: Jwk[];
  try {
    keys = await getKeys(teamDomain, header.kid);
  } catch {
    return null;
  }
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) return null;

  try {
    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const sig = b64urlToBytes(parts[2]);
    const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, sig, data);
    if (!ok) return null;
  } catch {
    return null;
  }

  return { email };
}

/**
 * Cross-site request forgery guard for state-changing admin requests.
 * Access's cookie rides along on any POST to this origin, so a malicious
 * page could otherwise submit a form to /admin/save on Kelly's behalf.
 * Browsers send Sec-Fetch-Site on every request; anything not same-origin
 * is rejected. Origin is checked as a second signal for older browsers.
 */
export function isSameOriginRequest(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin" || site === "none";
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
