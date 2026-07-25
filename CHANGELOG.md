# Real. Life Healing — Changelog

**Date:** 2026-07-25
**Scope:** Phase 1 only — stack-independent SEO infrastructure that can ship
today without touching the React/TanStack source. UI, copy, and template
changes are held for Phase 2, pending access to the repo.

Canonical host assumed throughout: **reallifehealing.care**. If that decision
flips to `.info`, every file below needs a find-and-replace of the hostname.
That decision is a prerequisite for Phase 2 — see the audit notes.

---

## Files in this drop

### `public/robots.txt` — NEW

Could not be verified as present on the live site (the fetch tool would not
retrieve `/robots.txt` directly), so this is written to be safe whether or not
one already exists — review before overwriting.

- Allows full crawl. There is nothing on this domain that should be hidden;
  the SimplePractice client portal lives on `kelly-day.clientsecure.me` and is
  outside this host's crawl scope entirely.
- Declares the sitemap location, which is the single most useful line in the
  file for a four-page site with no inbound link equity yet.
- **Why:** without a declared sitemap, discovery of the three non-home pages
  depends entirely on internal linking. Cheap insurance.

### `public/sitemap.xml` — NEW

- Lists all four live URLs: `/`, `/getting-started`, `/lets-get-real`, `/links`.
- `lastmod` only. `priority` and `changefreq` are deliberately omitted —
  Google has ignored both for years and they add maintenance burden.
- **Why:** submitting this in Search Console is the fastest path to getting the
  `.care` host crawled and indexed as a distinct property.
- **Maintenance:** update `lastmod` when a page's content actually changes, not
  on every deploy. Add a `<url>` entry per article when the three
  "Let's Get Real" posts get real pages.

### `snippets/jsonld-home.html` — NEW

A `<script type="application/ld+json">` block for `<head>` on `/`.

- `MedicalBusiness` + `ProfessionalService` for the practice, with
  `medicalSpecialty: Psychiatric`, `areaServed: Indiana`,
  `isAcceptingNewPatients: true`, and a telehealth `availableChannel`
  pointing at the SimplePractice portal.
- `Person` node for Kelly with all six credentials as
  `EducationalOccupationalCredential` entries.
- `WebSite` and `WebPage` nodes, wired together by `@id` reference so search
  engines read one entity rather than four disconnected blobs.
- `sameAs` links the four social profiles from `/links`, which is how the
  practice's social presence gets attached to the business entity.
- **Why:** no structured data could be confirmed on the live pages. For a
  telehealth-only provider with no street address, schema is the primary way
  to communicate service area, specialty, and accepted payment — none of which
  Google can infer reliably from prose.
- **Verify before shipping:** the credential list and the insurance carrier
  list are transcribed from the live site. Overstated credentials in schema
  are a genuine liability for a licensed provider. Have Kelly confirm.

### `snippets/jsonld-getting-started.html` — NEW

A `<script type="application/ld+json">` block for `<head>` on `/getting-started`.

- `FAQPage` carrying the five accordion Q&As exactly as they appear on the
  page. Schema must mirror visible content; if the accordion copy changes,
  this changes with it.
- `BreadcrumbList` and a `WebPage` node linked back to the site graph.
- **Why:** the FAQ answers are already the best long-tail content on the site
  ("does insurance cover online therapy in Indiana"). Marking them up makes
  them machine-readable for AI answer engines.
- **Expectation-setting:** Google restricted FAQ rich results in 2023 to
  well-known government and health authorities. This will most likely not
  produce visible FAQ snippets in search results. It is worth shipping for
  entity understanding, not for stars in the SERP.

### `CHANGELOG.md` — NEW

This file.

---

## Deliberately NOT changed

- **Nothing in the React/TanStack source.** No access to it yet, and guessing
  at file structure risks breaking a working build.
- **No copy rewrites shipped.** Several are recommended in the audit, but
  copy on a licensed clinician's site is the client's call, not the
  developer's — particularly the "Available 24/7" claim.
- **No design changes.** Visual rendering, spacing, and mobile breakpoints
  could not be assessed from a text-only fetch. Assessing them from
  assumptions would be inventing problems.

---

## Phase 2 — blocked on

1. Canonical host decision: `.care` or `.info`. Everything downstream depends
   on it.
2. Repo or source archive access.
3. Confirmation of what the appointment form currently does on submit.

---

# Phase 1b — Hushmail Secure Form integration

**Date:** 2026-07-25

## `src/components/SecureContactForm.tsx` — NEW

Wrapper for the Hushmail Secure Forms embed
(`data-secure-form="reallifehealing-secure-contact-form"`), replacing a raw
paste of the snippet.

Four problems it solves, in order of how badly they bite:

1. **Script tags in JSX never execute.** React parses them and moves on. The
   script has to be appended to the document imperatively, which the effect
   does.
2. **No re-init on client-side navigation.** The embed runs once on load; on
   any subsequent route change the container stays empty. The effect removes
   and re-appends the script on mount to force a re-run. If Hushmail support
   confirms a documented global initializer, swap that in — it is cheaper than
   re-fetching the script.
3. **Layout shift.** The embed injects markup after load, moving the most
   important element on the page. The container reserves 620px; measure the
   rendered form once live and adjust the constant.
4. **Silent total failure.** If hushforms.com is slow, blocked by a privacy
   extension, or unreachable on a corporate network, the raw embed renders an
   empty div and the primary conversion path vanishes with no explanation.
   After an 8s timeout the component falls back to the phone number and the
   client portal link.

Crisis guidance (988 / 911) is rendered in our own markup, outside the embed
container, so it survives a third-party failure. It should never live inside
the embed.

**Requires:** if a Content-Security-Policy header is added at the Worker,
`hushforms.com` must be allowlisted in `script-src` and `frame-src`.

**Styling:** `data-secure-form-transparent-background="true"` is preserved, so
the embed inherits page background. Class hooks are provided
(`.secure-contact-form`, `__status`, `__fallback`, `__crisis`) — no styles are
shipped here because the existing design tokens are in the repo I don't have.

**TypeScript assumed.** Rename to `.jsx` and drop the two type annotations if
the project is plain JS.

---

# Phase 1c — Security headers

**Date:** 2026-07-25
**Trigger:** securityheaders.com scan of https://reallifehealing.care/ returned
an F — no security headers present on any response.

Context on that grade: Cloudflare already terminates TLS, and the site has no
login, no session, and no user-generated content. Real exposure is narrower
than the letter implies. All six are still worth setting.

## `public/_headers` — NEW

Primary delivery. Read by both Cloudflare Workers Assets and Cloudflare Pages.

Enforced immediately (no breakage risk):

- `Strict-Transport-Security: max-age=31536000; includeSubDomains` — `preload`
  deliberately omitted, it is close to irreversible and protects only the
  first-ever visit.
- `X-Frame-Options: SAMEORIGIN` — set alongside CSP `frame-ancestors` for
  browsers that only understand the older header.
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin` — matters more here than
  on a typical site; without it, outbound clicks tell third parties the
  visitor came from a page about trauma counseling.
- `Permissions-Policy` — camera and microphone denied, since telehealth runs
  on SimplePractice at a different origin and this site never needs them.
- `Cross-Origin-Opener-Policy: same-origin-allow-popups` — plain `same-origin`
  would risk the portal link and any Hushmail popup.
- `Cross-Origin-Resource-Policy: same-origin`

Also sets long immutable caching on `/assets/*` (Vite fingerprints those
filenames) and short caching on robots.txt and sitemap.xml.

**CSP ships as `Content-Security-Policy-Report-Only`, not enforced.** An
untested policy would most likely block `hushforms.com`, rendering the intake
form as an empty box with no error. A silently broken intake form on a therapy
practice site is worse than the risks CSP mitigates here. Tuning procedure is
in `docs/security-headers.md`; it must include submitting a real test enquiry,
because `form-action` and `connect-src` violations only appear on submit.

## `src/security-headers.ts` — NEW

Alternative delivery for Workers that build responses in code rather than
through the assets binding. Same values as `_headers`; change one, change
both. `ENFORCE_CSP` constant flips Report-Only to enforcing after tuning.

## `docs/security-headers.md` — NEW

Reasoning, the CSP tuning loop, and the two routes off `'unsafe-inline'`
(build-time hashes, or per-request nonces) once the policy is accurate.

**`Cross-Origin-Embedder-Policy` deliberately not set.** `require-corp` would
break the Hushmail embed, since it requires every cross-origin resource to opt
in and we don't control Hushmail's headers. It doesn't affect the
securityheaders.com grade. This is a case where completing the checklist would
damage the site.

**Expected outcome:** F to A on deploy. A+ requires CSP enforced, which comes
after the Report-Only pass is clean — not before.

---

# Phase 1d — SecureContactForm packaged as a folder

**Date:** 2026-07-25

`src/components/SecureContactForm.tsx` (Phase 1b) is **replaced** by a
self-contained folder. Delete the flat file if you already copied it.

```
src/components/SecureContactForm/
├── index.ts                      barrel export
├── SecureContactForm.tsx         component
├── SecureContactForm.module.css  scoped styles
└── README.md                     usage, props, open items
```

## What changed from the flat file

- **Styles now ship.** The flat version referenced class names that didn't
  exist anywhere. CSS Modules chosen because it needs no config under Vite and
  cannot collide with existing global styles.
- **Colours map to your design tokens** via custom properties, falling back to
  values derived from the site's `theme-color` `#344338`. Remap at the top of
  the module if your token names differ.
- **Props added:** `reservedHeight`, `className`, `onReady`, `onUnavailable`.
  Reserved height was a hardcoded constant before.
- **Settle guard added.** The previous effect could fire both the mutation
  observer and the timeout; a `settled` flag now makes the outcome
  single-shot.
- **Callbacks held in a ref** so passing inline handlers doesn't re-run the
  effect and re-fetch the script.
- **Font inheritance into the embed** via a narrow `:global` rule, so the form
  uses the site's typeface rather than Hushmail's default. Deliberately
  minimal — restyling the embed properly needs its rendered DOM inspected.

Verified: every `styles.*` reference in the component resolves to a class that
exists in the module, and no class is defined unused.

## Two design decisions that are load-bearing

**Crisis guidance renders outside the embed container**, so 988 and 911
information survives a total third-party failure. It must never move inside
the embed or become conditional on load state.

**The fallback is not styled as an error.** No red, no warning iconography.
Someone who hits that state is trying to ask for help with something
difficult, and a page raising an alarm at them is the wrong response. Both the
fallback and the crisis note read as quiet guidance.

## Still guessed, needs a real measurement

`reservedHeight` defaults to 620px. I have never seen this form render. Once
it is live, measure it in DevTools and pass the real number, or the anti-CLS
reservation is either short or leaves a gap.

---

# Phase 1e — Email moved off free Gmail

**Date:** 2026-07-25

`kelly.daylmhc@gmail.com` → `kellyday@reallifehealing.care` everywhere.

**Why this is a compliance change, not a cosmetic one.** A free Gmail account
carries no Business Associate Agreement. A published address on a therapy
practice website receives protected health information whether or not it
invites it — people describe why they're reaching out, because that is the
natural thing to do. Every such message was landing in a mailbox with no BAA
behind it.

## `snippets/jsonld-home.html` — EDITED

`email` field updated. Noting plainly: I put the Gmail address into this
schema file in Phase 1a because it was on the live site, which propagated the
problem into structured data rather than catching it. Corrected here.

## `scripts/retarget-domain.sh` → `scripts/retarget-site.sh` — RENAMED, EXTENDED

Now runs two passes: hostname and email. Renamed because "domain" no longer
describes what it does.

**Bug found and fixed during testing.** The first version of the email
substitution used `\Q...\E` around a string containing an escaped `@`. Inside
`\Q...\E` perl escapes the backslash too, so the pattern searched for a
literal backslash followed by `@` and matched nothing — silently. The domain
rewrite worked, the email rewrite did not, and the script reported success.

Rewritten to pass all four strings to perl through the environment (`$ENV{}`),
which removes a layer of bash-quoting-on-top-of-perl-quoting-on-top-of-regex-
escaping. Verified against a fixture covering: a bare email constant, a
`mailto:` href, visible label text, apex and www URLs, `node_modules`
exclusion, binary-file safety, and the script preserving its own comments.

The email pass runs first, so it cannot be affected by the host rewrites.

## `README-DEPLOY.md` — EDITED

Script name updated throughout, and a **step 0** added ahead of everything
else: confirm the new mailbox receives mail before publishing the address, and
confirm outbound mail from the domain isn't landing in spam. A domain that has
never sent mail has no sending reputation — without SPF, DKIM, and DMARC the
first replies to prospective clients go to junk.

## Not automated — decisions for Kelly

- **The Gmail account still exists and still receives mail.** Removing the
  address from the site stops new exposure; it does nothing about what's
  already there or about people using a saved address. Do not auto-forward
  Gmail to Hushmail — that keeps PHI landing in Gmail first, which is the
  thing being fixed. A vacation-responder pointing at the new address, with
  the old inbox monitored during a transition, is the safer pattern.
- **Namecheap email forwarding conflict.** The `.care` zone currently carries
  `eforward1-5.registrar-servers.com` MX records. Hosting this mailbox at
  Hushmail means repointing MX, which breaks any existing forwarding on that
  domain. Know what depends on it before switching.
- Social bios, Psychology Today, insurance directories, and anything printed
  carry the old address too. The codemod cannot reach those.
