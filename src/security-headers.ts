/**
 * security-headers.ts
 * Real. Life Healing — security headers applied in the Worker.
 *
 * Use this ONLY if `public/_headers` does not apply to your setup — that is,
 * if your Worker constructs responses in code rather than serving them
 * through the static assets binding. Applying both is harmless but redundant;
 * whichever runs last wins.
 *
 * Wrap your existing fetch handler:
 *
 *   import { withSecurityHeaders } from './security-headers';
 *
 *   export default {
 *     async fetch(request, env, ctx) {
 *       const response = await handleRequest(request, env, ctx);
 *       return withSecurityHeaders(response);
 *     },
 *   };
 *
 * Every value here matches public/_headers. If you change one, change both.
 */

/**
 * Content Security Policy, assembled as directives so it stays readable.
 *
 * 'unsafe-inline' in script-src is a real weakening of the policy and is not
 * there by preference — server-rendered React injects an inline hydration
 * script, and static asset serving cannot mint a per-request nonce. The
 * hash-based alternative is described in docs/security-headers.md.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://hushforms.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://hushforms.com",
  "frame-src https://hushforms.com",
  "form-action 'self' https://hushforms.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

/**
 * Set to true only after confirming, on every route, that the Report-Only
 * policy produces no console violations. Flipping this early breaks the
 * Hushmail intake form, which is the site's primary conversion path.
 */
const ENFORCE_CSP = false;

const PERMISSIONS_POLICY = [
  'accelerometer=()',
  'autoplay=()',
  'browsing-topics=()',
  'camera=()',
  'display-capture=()',
  'encrypted-media=()',
  'fullscreen=(self)',
  'geolocation=()',
  'gyroscope=()',
  'magnetometer=()',
  'microphone=()',
  'midi=()',
  'payment=()',
  'picture-in-picture=()',
  'publickey-credentials-get=()',
  'screen-wake-lock=()',
  'usb=()',
  'xr-spatial-tracking=()',
].join(', ');

const STATIC_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': PERMISSIONS_POLICY,
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

export function withSecurityHeaders(response: Response): Response {
  // Response headers are immutable on some response types; clone to be safe.
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(STATIC_HEADERS)) {
    headers.set(name, value);
  }

  headers.set(
    ENFORCE_CSP
      ? 'Content-Security-Policy'
      : 'Content-Security-Policy-Report-Only',
    CSP_DIRECTIVES,
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default withSecurityHeaders;
