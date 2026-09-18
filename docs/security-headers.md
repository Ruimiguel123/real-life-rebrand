# Security headers — what's set, and what deliberately isn't

The securityheaders.com scan returned an F because the site sends no security
headers at all. That grade sounds worse than the reality: Cloudflare already
terminates TLS, and there is no login, session, or user-generated content on
this site. The actual exposure is narrower than the letter suggests.

That said, all six are worth setting, and five of them can go live today with
no risk of breaking anything.

---

## The five safe ones

`Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy`, plus the two Cross-Origin headers.
Deploy `public/_headers`, re-scan, and the grade moves to A.

Two of these have consequences worth knowing about:

**HSTS `includeSubDomains`.** Every current and future subdomain of
`reallifehealing.care` must serve valid HTTPS for a year from each visit.
Everything you have is behind Cloudflare, so this is fine — but it is a
commitment, not a toggle.

**`preload` is deliberately omitted.** Adding your domain to the browser
preload list is close to irreversible: removal requests take months to
propagate through browser release cycles, and until they do, any HTTPS problem
means the site is simply unreachable, with no click-through option. It buys
protection only against the very first visit a user ever makes. Not a good
trade for a solo practice. Skip it.

**`Referrer-Policy: strict-origin-when-cross-origin`.** This one matters more
here than on a typical site. Without it, clicking an outbound link from a page
about trauma counseling tells the destination which page the visitor came
from. On a mental health practice site, the URL path is itself sensitive.
If you want to be stricter, `no-referrer` sends nothing at all — the tradeoff
is that you lose referrer data in analytics and outbound partners can't see
you sent them traffic.

---

## The sixth one: CSP

This is where a blind deployment breaks the site.

A Content-Security-Policy tells the browser which sources it may load. Get it
wrong and the browser silently refuses to run something — and the most likely
casualty is `hushforms.com`, which means the intake form renders as an empty
box. On a therapy practice site, a silently broken intake form is worse than
any of the risks CSP is protecting against.

So the policy ships as `Content-Security-Policy-Report-Only`. The browser logs
what *would* have been blocked and blocks nothing.

### Tuning it

1. Deploy with Report-Only.
2. Open DevTools → Console and visit all four routes: `/`, `/getting-started`,
   `/lets-get-real`, `/links`.
3. On `/getting-started`, wait for the Hushmail form to fully render, then
   **submit a real test enquiry**. Submission is where `form-action` and
   `connect-src` violations surface, and you will not see them by looking at
   the page alone.
4. Every `[Report Only] Refused to load...` message names the directive and
   the blocked URL. Add the URL to that directive.
5. Repeat until the console is clean across all four routes.
6. Flip the header name to `Content-Security-Policy` (in `_headers`, or set
   `ENFORCE_CSP = true` in `src/security-headers.ts`).

Expect Hushmail to need more than the one origin already listed. Embeds
commonly pull from a CDN subdomain or open an iframe on a different host.
Add what the console actually reports — don't pre-emptively wildcard
`*.hushforms.com` to save a round trip, because a wildcard is exactly the kind
of hole CSP exists to close.

For violation reports from real visitors rather than your own browser,
report-uri.com has a free tier. Worth it for a week to catch what you miss.

### About `'unsafe-inline'` in script-src

It is in the policy, and it substantially weakens it — it is most of what CSP
protects against. It is there because server-rendered React injects an inline
hydration script, and static asset serving cannot generate a per-request
nonce.

Two ways out, if you want them later:

- **Hashes.** Compute the SHA-256 of each inline script at build time and list
  them as `'sha256-...'`. Works with static serving. Breaks whenever the
  hydration payload changes, so it needs a build step that regenerates them.
- **Nonces.** Generate a random value per request in the Worker, inject it
  into both the CSP header and every inline `<script>` tag. Stronger, but it
  means the Worker has to rewrite HTML on the way out.

Neither is worth doing before the Report-Only pass is clean. Get the policy
accurate first, then tighten it.

`'unsafe-inline'` in `style-src` is a different matter — React sets inline
`style` attributes, virtually every React app needs this, and the risk from
injected CSS is far lower than from injected script. Leave it.

---

## `Cross-Origin-Embedder-Policy` is deliberately not set

securityheaders.com lists COEP under "Upcoming Headers," and it does not
affect your grade.

Setting `require-corp` would break the Hushmail embed outright, because it
demands that every cross-origin resource explicitly opt in via CORP or CORS
headers — and you do not control what Hushmail sends. COEP exists to enable
cross-origin isolation for things like `SharedArrayBuffer`, which this site
has no use for.

Don't set it. This is a case where chasing a complete checklist actively
damages the site.

---

## Third option: Cloudflare Transform Rules

If neither `_headers` nor Worker middleware fits your deploy, the same headers
can be set in the dashboard with zero code:

**Rules → Transform Rules → Modify Response Header → Create rule**, applied to
all incoming requests, with one "Set static" entry per header.

Advantages: no deploy, and it survives a rebuild. Disadvantage: the config
lives in a dashboard rather than in git, so it is invisible to anyone reading
the repo — including you, in six months. Prefer `_headers` if it works.

---

## Verify

```bash
curl -sI https://reallifehealing.care/ | grep -iE \
  'strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy|cross-origin'
```

Then re-run the securityheaders.com scan. With CSP in Report-Only you should
see an A. The A+ needs CSP enforced — get there by tuning, not by shipping an
untested policy to a live practice site.
