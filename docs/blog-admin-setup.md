# Blog admin — setup and operation

Kelly writes and publishes articles herself at
**https://reallifehealing.care/admin**. This document covers the one-time
Cloudflare setup, how to verify it, and what Kelly needs to know.

Everything runs inside the existing Cloudflare Worker. No new vendors, no
new scripts on public pages, nothing added to the CSP.

## How it fits together

| Piece | What it is | Where it's configured |
|---|---|---|
| **Login** | Cloudflare Access (Zero Trust). Kelly enters her email, gets a one-time code. The Worker verifies Access's signed token on every admin request. | Zero Trust dashboard |
| **Posts** | Cloudflare D1, a small SQLite database. One table, `posts`. | Cloudflare dashboard → D1, bound in `wrangler.jsonc` |
| **Cover images** | Cloudflare R2 bucket, served by the Worker at `/media/…`. | Cloudflare dashboard → R2, bound in `wrangler.jsonc` |
| **Editor** | Plain server-rendered forms at `/admin`. Paste from Google Docs; the server strips everything down to headings, paragraphs, bold, italics, lists, links. | `src/blog/` |
| **Public pages** | `/lets-get-real` lists published posts; `/lets-get-real/<slug>` renders one with meta tags, canonical, `Article` JSON-LD. `/sitemap.xml` is generated and includes every published post. | `src/routes/lets-get-real*.tsx`, `src/blog/admin.ts` |

Drafts never appear publicly. Only rows with `status = 'published'` are
served by the public routes and the sitemap.

## One-time setup (about 20 minutes, all in the Cloudflare dashboard)

You need access to the Cloudflare account that hosts the site. If it's
Kelly's account, have her add you as a member (Manage Account → Members)
with the **Administrator** role, or do these steps on a call with her.

### 1. Create the database

1. Cloudflare dashboard → **Storage & Databases → D1** → **Create**.
2. Name: `rlh-blog`. Location: leave automatic. Create.
3. On the database page, copy the **Database ID** (a UUID).
4. Paste it into `wrangler.jsonc` at the repo root, replacing
   `REPLACE_WITH_D1_DATABASE_ID`.

The `posts` table is created automatically the first time `/admin` is
opened. If you prefer to create it yourself: D1 → `rlh-blog` → **Console**,
paste the contents of `migrations/0001_posts.sql`, run.

### 2. Create the image bucket

1. **Storage & Databases → R2** → **Create bucket**.
2. Name: `rlh-media` (must match `wrangler.jsonc`). Location automatic. Create.
3. Nothing else. The bucket stays private; the Worker serves files from it.

R2 needs a payment method on the account even on the free tier. If that's a
blocker, tell me and I'll switch covers to a URL field instead.

### 3. Turn on Zero Trust and protect `/admin`

1. Dashboard → **Zero Trust** (left sidebar). First time through it asks
   for a **team name** — pick something like `reallifehealing`. Choose the
   **Free** plan when prompted.
2. Your team domain is now `<team name>.cloudflareaccess.com`. Note it.
3. **Access → Applications → Add an application → Self-hosted**.
   - Application name: `Real. Life Healing admin`
   - Session duration: `24 hours` (Kelly re-enters a code once a day)
   - **Add public hostname**: domain `reallifehealing.care`, path `admin` —
     this covers `/admin` and everything under it. Add a second hostname
     for the `www` host if `www` still resolves.
4. **Policies → Add a policy**:
   - Name: `Kelly and Rui`
   - Action: **Allow**
   - Include → Selector **Emails** → Kelly's email, and yours.
5. Under **Login methods** keep **One-time PIN** ticked. Save.
6. Open the application you just created → **Overview** tab → copy the
   **Application Audience (AUD) Tag** (64 hex characters).

### 4. Fill in `wrangler.jsonc`

```jsonc
"vars": {
  "ACCESS_TEAM_DOMAIN": "reallifehealing.cloudflareaccess.com",  // step 3.2, no https://
  "ACCESS_AUD": "<the 64-char tag from step 3.6>",
  "ADMIN_EMAILS": ""   // optional: "kelly@…, rui@…" as a second lock
}
```

`ADMIN_EMAILS` is belt-and-braces. The Access policy already limits who can
log in; this makes the Worker refuse anyone else even if the policy is later
loosened by mistake. Fill it or leave it empty.

### 5. Deploy

Commit `wrangler.jsonc` with the placeholders filled in and push to `main`.
Cloudflare rebuilds and deploys. The bindings are created from the config
during deploy — you should see `DB` and `MEDIA` under the Worker's
**Settings → Bindings** afterward, and the three vars under **Variables**.

If the deploy fails with a message about a D1 database not being found, the
`database_id` is wrong or the database is in a different account.

### 6. Verify

```bash
# Public pages still render
curl -sI https://reallifehealing.care/ | grep -i '^HTTP'
curl -sI https://reallifehealing.care/lets-get-real | grep -i '^HTTP'

# Sitemap now comes from the Worker (should list the four static pages)
curl -s https://reallifehealing.care/sitemap.xml

# Admin is gated — this should be a redirect to the Access login page,
# not a 200 and not a 500
curl -sI https://reallifehealing.care/admin | grep -iE '^HTTP|^location'
```

Then in a browser: open `https://reallifehealing.care/admin`, enter your
email, use the code, and you should land on the empty **Posts** page. Write
a test post, publish it, confirm it appears at `/lets-get-real`, then delete
it.

Also open the Worker's `*.workers.dev` URL + `/admin` if one is enabled.
Access does not protect that hostname, so the Worker's own token check is
what keeps it closed — you should get a **Sign-in required** page, never the
post list. If you want to be certain, disable the workers.dev route
(Worker → Settings → Domains & Routes).

## Day-to-day, for Kelly

- Go to **reallifehealing.care/admin**. Enter your email, then the code
  from your inbox.
- **New post** → give it a title → paste your article → **Publish**.
  Bold, italics, headings, bullet lists and links come through from Google
  Docs or Word. Colours, fonts and spacing don't, on purpose, so every
  article matches the site.
- **Save as draft** keeps it private. **Preview** shows how it will look.
- The **web address** fills in from the title. Once a post is published and
  the link has been shared, don't change it.
- A **cover image** is optional. Landscape, under 5 MB.
- **Short summary** is optional; if left blank, the first lines of the
  article are used. It shows on the blog page and in Google results, so a
  hand-written one usually reads better.
- Published articles appear on Let's Get Real within seconds and in Google
  over the following days or weeks. To get a new post noticed faster, paste
  its address into Search Console → URL Inspection → Request Indexing.

Nothing Kelly writes here should contain client information. Articles are
public. The admin is not a place for notes about people.

## Operations

- **Backups.** D1 keeps 30 days of point-in-time history on the free plan
  (Time Travel). To export: `wrangler d1 export rlh-blog --output posts.sql`,
  or from the dashboard console `SELECT * FROM posts`. Covers live in R2 and
  can be downloaded from the bucket page.
- **Adding an editor.** Add their email to the Access policy (and to
  `ADMIN_EMAILS` if you set it). No code change.
- **Kelly locked out.** Zero Trust → Logs → Access shows every login attempt
  and why it was denied. Nine times out of ten it's an email typo in the
  policy or an expired session.
- **Rollback.** Workers → Deployments → previous → Rollback. The database is
  untouched by a rollback; posts stay.
- **Turning it off.** Remove the Access application and the admin returns
  **Sign-in required** for everyone (the Worker fails closed without a valid
  token). Public posts keep rendering.

## Security notes

- The Worker verifies Access's RS256 JWT (signature against Cloudflare's
  published keys, issuer, audience, expiry) on every admin request. Access
  gating alone is a dashboard setting; this check is the code-level lock.
- State-changing requests require `Sec-Fetch-Site: same-origin`, blocking
  cross-site form posts that would otherwise ride Kelly's cookie.
- Post HTML is sanitized to an allow-list on save. `javascript:` links,
  event handlers, scripts, images, iframes and styles are dropped. Rendered
  output is therefore safe to inject on the public page.
- Cover uploads are limited to JPG/PNG/WebP/GIF under 5 MB, stored with the
  declared content type, served with `X-Content-Type-Options: nosniff`
  (site-wide header).
- The admin's own CSS and JS are served from `/admin/admin.css` and
  `/admin/admin.js`, not inlined, so the admin keeps working when
  `'unsafe-inline'` is removed from `script-src`.
- Admin pages send `X-Robots-Tag: noindex` and `Cache-Control: no-store`.
- The HIPAA perimeter is unchanged: no PHI flows through the blog. Access,
  D1 and R2 are Cloudflare services already covered by the existing
  Cloudflare relationship. Kelly's own login email is the only personal
  data involved.
