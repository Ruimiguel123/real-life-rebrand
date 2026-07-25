# Collapsing every hostname onto `reallifehealing.care`

Goal: one canonical host, three permanent redirects into it, no page ever
reachable at two addresses.

| From | To | Type |
|---|---|---|
| `reallifehealing.info` | `reallifehealing.care` | 301, path preserved |
| `www.reallifehealing.info` | `reallifehealing.care` | 301, path preserved |
| `www.reallifehealing.care` | `reallifehealing.care` | 301, path preserved |

**Apex, not `www`.** Every internal link and asset URL on the live site already
resolves to the apex `.care`. Choosing `www` would mean rewriting all of them
for no gain. Choosing the apex means the redirect layer is the only thing that
changes.

---

## Prerequisite

`reallifehealing.info` must be an **active Cloudflare zone with proxied
(orange-cloud) DNS**. Redirect Rules run at Cloudflare's edge, so a domain
that only exists at Namecheap will never hit them. The free plan is enough.

If `.info` is not on Cloudflare yet, add it as a zone and repoint the
nameservers at Namecheap first. **Carry over the Namecheap email forwarding
records when you do it** — the `eforward1-5.registrar-servers.com` MX records
plus the SPF TXT record. Losing those silently breaks mail.

A proxied A record is required for the redirect to fire, but it never serves
traffic. `192.0.2.1` (the reserved documentation address) is the conventional
placeholder.

---

## Rule 1 — `.info` to `.care`

Cloudflare dashboard → the `reallifehealing.info` zone → **Rules → Redirect
Rules → Create rule**.

**Expression** (use the Edit expression / custom filter box):

```
(http.host eq "reallifehealing.info") or (http.host eq "www.reallifehealing.info")
```

**Then, settings:**

- Type: **Dynamic**
- Expression:
  ```
  concat("https://reallifehealing.care", http.request.uri.path)
  ```
- Status code: **301**
- Preserve query string: **on**

`http.request.uri.path` is what carries `/getting-started` through to the new
host. Without it every inbound link lands on the homepage, and any link equity
pointing at a deep page is thrown away.

---

## Rule 2 — `www.care` to apex `.care`

Same steps, in the `reallifehealing.care` zone.

**Expression:**

```
http.host eq "www.reallifehealing.care"
```

**Then:**

- Type: **Dynamic**
- Expression:
  ```
  concat("https://reallifehealing.care", http.request.uri.path)
  ```
- Status code: **301**
- Preserve query string: **on**

You also need a proxied DNS record for `www` on the `.care` zone, or the
hostname never resolves and the rule has nothing to act on. A CNAME
`www → reallifehealing.care`, proxied, does it.

---

## Verify before you call it done

```bash
curl -sI https://reallifehealing.info/getting-started | grep -i '^location\|^HTTP'
curl -sI https://www.reallifehealing.info/links     | grep -i '^location\|^HTTP'
curl -sI https://www.reallifehealing.care/          | grep -i '^location\|^HTTP'
```

Each should return `301` and a `Location` on the apex `.care` **with the path
intact**. A `302` means the rule was saved with the wrong status code — fix it,
because search engines treat 302 as temporary and will not consolidate the
domains.

Also confirm `https://reallifehealing.care/og-image.jpg` returns 200 directly.
Social scrapers are unreliable about following redirects, so the OG image must
resolve on the canonical host without one.

---

## Do not let `.info` lapse

Keep renewing it. It is now a permanent redirect carrying whatever links,
directory listings, and printed references already exist. The 301 preserves
that equity — but only for as long as the domain answers.

Separately, update the listings themselves as you find them: Psychology Today,
insurance directories, the Instagram and YouTube bios, and anything printed.
A 301 is a safety net, not a substitute for a correct listing.

---

## Search Console

Both hosts are separate properties. After the redirects are live:

1. Add and verify `reallifehealing.care` as a property.
2. Submit `https://reallifehealing.care/sitemap.xml`.
3. Keep the `.info` property. Do not delete it — it is how you watch the
   redirects being processed and confirm the old URLs drop out of the index.
4. Expect several weeks for consolidation. Do not re-point anything midway
   through; flip-flopping canonicals is worse than either choice.
