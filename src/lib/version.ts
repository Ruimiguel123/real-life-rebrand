// Which build is live.
//
// SITE_VERSION is the date and time of the update zip this code came from.
// Bump it in EVERY update so it matches the zip's name
// (rlh-<topic>_2026-10-10_1930.zip -> "2026-10-10 19:30"). After a push, open
// https://reallifehealing.care/version to confirm the deploy landed.
//
// The page is plain text, never cached and noindex. It shows nothing but
// this stamp; do not add client, subscriber or configuration details here.
export const SITE_VERSION = "2026-10-10 19:30";

/** Answers GET /version. Returns null for every other request. */
export function serveVersion(request: Request): Response | null {
  const path = new URL(request.url).pathname.replace(/\/+$/, "");
  if (path !== "/version") return null;
  if (request.method !== "GET" && request.method !== "HEAD") return null;

  return new Response(`Real. Life Healing\nsite version: ${SITE_VERSION}\n`, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
