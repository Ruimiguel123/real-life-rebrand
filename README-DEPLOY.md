# Real. Life Healing — domain retarget package

Everything in this zip moves the site's SEO identity from
`reallifehealing.info` to the apex `reallifehealing.care`.

**One thing is missing: your repo.** The codemod, the redirect rules, the
schema, and the sitemap are all here and all correct, but the canonical and
Open Graph tags are generated somewhere in your React/TanStack source that I
haven't seen. Send me the GitHub URL (I can clone it directly if it's public)
or upload a zip export, and I'll return this package with those edits already
applied and verified against your actual build.

---

## What's here

```
scripts/retarget-site.sh            codemod: .info -> .care, and gmail -> domain mailbox
docs/cloudflare-redirect-rules.md   301 config for all three hostnames
public/robots.txt                   drop into your public/ directory
public/sitemap.xml                  drop into your public/ directory
snippets/jsonld-home.html           paste into <head> on /
snippets/jsonld-getting-started.html paste into <head> on /getting-started
src/components/SecureContactForm.tsx Hushmail embed wrapper
CHANGELOG.md                        per-file reasoning
```

---

## Order of operations

Sequence matters here. Redirects before the code change means the site
redirects to a host still advertising the old canonical.

### 0. Confirm the new mailbox actually receives mail

**Before anything else.** Send a test message to
`kellyday@reallifehealing.care` from an outside account and confirm it
arrives. Publishing an address that bounces loses enquiries silently, which
is worse than the problem being fixed.

Also send one *from* the new address to a Gmail account and check it doesn't
land in spam. A domain that has never sent mail has no sending reputation;
without SPF, DKIM, and DMARC records the first replies to prospective clients
go to junk. Hushmail documents the records it needs.

### 1. Branch and run the codemod

```bash
git checkout -b domain/retarget-care
chmod +x scripts/retarget-site.sh
./scripts/retarget-site.sh            # dry run — read the output
./scripts/retarget-site.sh --apply
git diff                               # read every change
```

Two passes: `reallifehealing.info` to `reallifehealing.care`, and
`kelly.daylmhc@gmail.com` to `kellyday@reallifehealing.care`.

It skips `.git`, `node_modules`, `dist`, `build`, `.wrangler`, lockfiles,
binaries, and itself. Verified against a fixture repo before shipping.

Then confirm nothing survived:

```bash
grep -rnE "reallifehealing[.]info|kelly[.]daylmhc" . \
  --exclude-dir=.git --exclude-dir=node_modules --exclude=retarget-site.sh
```

Most likely the domain is a single `SITE_URL` constant and the email appears
in two or three places (footer, a mailto, maybe a contact constant). That's
the good outcome — it means the change is small and low risk.

### 2. Drop in the static files

`public/robots.txt` and `public/sitemap.xml` go into whatever directory your
Worker serves static assets from. If a `robots.txt` already exists, read both
before overwriting — I couldn't fetch yours to compare.

### 3. Add the JSON-LD

Two blocks, two pages, `<head>` only. Before shipping, have Kelly confirm the
credential list and the insurance carriers — the schema asserts both, and
overstated credentials for a licensed provider is a real liability, not a
formatting nit.

Also worth confirming with her: "Skai BCBS" reads like it may be a
transcription error. It's in the schema because it's on the live site, but I
couldn't verify the carrier.

### 4. Build, then check the rendered head on every route

```bash
npm run build && npm run preview
```

Fetch each of `/`, `/getting-started`, `/lets-get-real`, `/links` and confirm
`canonical`, `og:url`, and `og:image` all point at `https://reallifehealing.care`.
A React app can render the right thing in dev and the wrong thing in the
built output — check the build, not the dev server.

### 5. Deploy, then configure the redirects

Follow `docs/cloudflare-redirect-rules.md`. Do this after deploying, so the
redirect target is already serving correct tags when it starts receiving
traffic.

### 6. Search Console

Add `reallifehealing.care`, submit the sitemap, keep the `.info` property
alive to watch the old URLs drop out.

---

## Not in this package

- **Copy changes.** The audit recommends several — loosening the form
  disclaimer now that Hushmail covers the PHI path, rewording "Available
  24/7," adding a response-time promise. All are Kelly's call, not mine.
- **The three "Let's Get Real" articles.** Highest-value content work
  available, and it needs your route conventions.
- **Design and layout.** I've only ever seen this site as extracted text.
  Anything I said about visual hierarchy would be invention.

---

## Reminder that has nothing to do with SEO

Don't put a Meta Pixel or Google Analytics on any page carrying the Hushmail
form. HHS OCR treats third-party tracking on pages where health information is
entered as a disclosure requiring a BAA, and Meta will not sign one. Use
Cloudflare Web Analytics — cookieless, server-side, already on your platform.
