/**
 * admin.ts — the blog + newsletter backend.
 *
 * Plugged into src/server.ts ahead of the TanStack handler. Owns:
 *
 *   /api/subscribe          POST — newsletter signup (public, same-origin)
 *   /api/unsubscribe        POST — remove an address (public, same-origin)
 *   /unsubscribe            GET  — the page with the unsubscribe form
 *   /admin/subscribers      list, with per-row remove
 *   /admin/subscribers.csv  download of active addresses
 *
 *   /admin              list of posts (drafts + published)
 *   /admin/new          editor, new post
 *   /admin/edit/:id     editor, existing post
 *   /admin/preview/:id  read-only preview of any post, published or not
 *   /admin/save         POST — create/update (multipart, includes cover)
 *   /admin/status/:id   POST — publish / unpublish
 *   /admin/delete/:id   POST — delete
 *   /admin/admin.css    stylesheet   (no auth; nothing sensitive)
 *   /admin/admin.js     script       (no auth; nothing sensitive)
 *   /media/*            cover images from R2 (public, long cache)
 *   /sitemap.xml        static routes + published posts
 *
 * Everything under /admin except the two assets requires a valid Cloudflare
 * Access identity (see access.ts). Mutations additionally require a
 * same-origin request (CSRF).
 *
 * Plain server-rendered HTML forms. No framework, no client state, works
 * without JavaScript (the visual editor degrades to a textarea). The public
 * side of the blog is rendered by TanStack routes in src/routes/.
 */

import { SITE_URL } from "@/config/simplepractice";
import { verifyAccess, isSameOriginRequest, type AccessIdentity } from "./access";
import type { BlogEnv } from "./env";
import {
  ensureSchema,
  listAll,
  listPublished,
  getById,
  savePost,
  setStatus,
  deletePost,
  slugTaken,
  addSubscriber,
  unsubscribe,
  listSubscribers,
  deleteSubscriber,
  normalizeEmail,
  looksLikeEmail,
  type Post,
  type PostSummary,
  type PostStatus,
} from "./db";
import { sanitizeHtml, excerptFromHtml, slugify } from "./sanitize";
import { ADMIN_CSS, ADMIN_JS } from "./admin-assets";

// ───────────────────────────────────────────────────────────── helpers ──

const h = (s: unknown): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const html = (body: string, status = 200, extra: Record<string, string> = {}) =>
  new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
      ...extra,
    },
  });

const redirect = (to: string) =>
  new Response(null, { status: 303, headers: { location: to } });

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_COVER_BYTES = 5 * 1024 * 1024;

// ─────────────────────────────────────────────────────────────── layout ──

function layout(opts: {
  title: string;
  body: string;
  who?: AccessIdentity | null;
  wide?: boolean;
}): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${h(opts.title)} · Real. Life Healing admin</title>
<link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="/admin/admin.css">
</head>
<body>
<header class="bar">
  <div class="wrap">
    <div>
      <div class="brand">Real. Life Healing</div>
      ${opts.who ? `<div class="who">Signed in as ${h(opts.who.email)}</div>` : ""}
    </div>
    <nav>
      <a href="/admin">Posts</a>
      <a href="/admin/new">New post</a>
      <a href="/admin/subscribers">Subscribers</a>
      <a href="/lets-get-real" target="_blank" rel="noopener">View blog ↗</a>
      <a href="/cdn-cgi/access/logout">Sign out</a>
    </nav>
  </div>
</header>
<main class="wrap">
${opts.body}
</main>
<script src="/admin/admin.js" defer></script>
</body>
</html>`;
}

// ───────────────────────────────────────────────────────────────── pages ──

function pageForbidden(reason: "unconfigured" | "denied"): Response {
  const body =
    reason === "unconfigured"
      ? `<h1>Admin is not set up yet</h1>
<p class="lead">The blog backend needs Cloudflare Access and a D1 database before it will open.</p>
<div class="card help">
  <p>If you are the site owner or developer, follow <code>docs/blog-admin-setup.md</code> in the repository. In short:</p>
  <ol>
    <li>Create a D1 database and an R2 bucket, and bind them to this Worker as <code>DB</code> and <code>MEDIA</code>.</li>
    <li>In Zero Trust, create an Access application for <code>${h(new URL(SITE_URL).host)}/admin</code> and copy its Application Audience tag.</li>
    <li>Set <code>ACCESS_TEAM_DOMAIN</code> and <code>ACCESS_AUD</code> as Worker variables.</li>
  </ol>
</div>`
      : `<h1>Sign-in required</h1>
<p class="lead">This page is only for the practice owner. If you are Kelly and you're seeing this, your session may have expired — close the tab, open <a href="/admin">${h(new URL(SITE_URL).host)}/admin</a> again and sign in with your email.</p>`;
  return html(layout({ title: "Sign in", body }), 403);
}

function pageList(
  posts: PostSummary[],
  who: AccessIdentity,
  flash: { saved?: string; status?: string; deleted?: string },
): string {
  const notice = flash.saved
    ? `<div class="notice">${flash.status === "published" ? "Published" : "Saved as draft"}: <strong>${h(flash.saved)}</strong>${
        flash.status === "published"
          ? ` — <a href="/lets-get-real/${encodeURIComponent(flash.saved)}" target="_blank" rel="noopener">see it live ↗</a>`
          : ""
      }</div>`
    : flash.deleted
      ? `<div class="notice">Post deleted.</div>`
      : "";

  const rows = posts
    .map(
      (p) => `<li class="card post-row">
  <div>
    <a class="title" href="/admin/edit/${h(p.id)}">${h(p.title || "(untitled)")}</a>
    <div class="meta">
      <span class="pill ${p.status}">${p.status}</span>
      <span>${p.status === "published" ? `Published ${fmtDate(p.published_at)}` : `Edited ${fmtDate(p.updated_at)}`}</span>
      <span>/lets-get-real/${h(p.slug)}</span>
    </div>
  </div>
  <div class="actions">
    <a class="btn btn-quiet" href="/admin/preview/${h(p.id)}" target="_blank" rel="noopener">Preview</a>
    <a class="btn btn-quiet" href="/admin/edit/${h(p.id)}">Edit</a>
    <form method="post" action="/admin/status/${h(p.id)}">
      <input type="hidden" name="status" value="${p.status === "published" ? "draft" : "published"}">
      <button class="btn btn-quiet" type="submit">${p.status === "published" ? "Unpublish" : "Publish"}</button>
    </form>
    <form method="post" action="/admin/delete/${h(p.id)}" data-confirm>
      <button class="btn btn-quiet btn-danger" type="submit">Delete</button>
    </form>
  </div>
</li>`,
    )
    .join("\n");

  const body = `<h1>Posts</h1>
<p class="lead">Drafts are only visible to you. Published posts appear on <a href="/lets-get-real" target="_blank" rel="noopener">Let's Get Real</a> and in the sitemap.</p>
${notice}
${
  posts.length
    ? `<ul class="posts">${rows}</ul>`
    : `<div class="card empty"><p>No posts yet.</p><a class="btn btn-primary" href="/admin/new">Write your first post</a></div>`
}
<p style="margin-top:2rem"><a class="btn btn-primary" href="/admin/new">New post</a></p>`;

  return layout({ title: "Posts", body, who });
}

interface EditorValues {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body_html: string;
  cover_url: string | null;
  cover_alt: string;
  status: PostStatus;
}

function pageEditor(
  v: EditorValues,
  who: AccessIdentity,
  errors: string[] = [],
  isNew = false,
): string {
  const body = `<h1>${isNew ? "New post" : "Edit post"}</h1>
<p class="lead">Write in Google Docs or Word if you like, then paste here. Bold, italics, headings, lists and links carry over; everything else is cleaned up automatically.</p>
${
  errors.length
    ? `<ul class="error-list">${errors.map((e) => `<li class="error">${h(e)}</li>`).join("")}</ul>`
    : ""
}
<form id="post-form" method="post" action="/admin/save" enctype="multipart/form-data">
  <input type="hidden" name="id" value="${h(v.id)}">
  <input type="hidden" name="existing_cover_url" value="${h(v.cover_url ?? "")}">

  <div class="field">
    <label for="title">Title</label>
    <input class="title" type="text" id="title" name="title" required maxlength="140" value="${h(v.title)}" placeholder="Grief doesn't move in a line">
  </div>

  <div class="field">
    <label for="slug">Web address</label>
    <div class="slug-row"><span>${h(new URL(SITE_URL).host)}/lets-get-real/</span><input type="text" id="slug" name="slug" maxlength="80" value="${h(v.slug)}" pattern="[a-z0-9-]*" placeholder="fills in from the title"></div>
    <p class="hint">Lowercase letters, numbers and dashes. Changing this after publishing breaks any links already shared.</p>
  </div>

  <div class="field">
    <label>Article</label>
    <div class="toolbar js-only">
      <button type="button" data-cmd="bold" title="Bold"><b>B</b></button>
      <button type="button" data-cmd="italic" title="Italic"><i>I</i></button>
      <button type="button" data-cmd="formatBlock" data-value="h2">Heading</button>
      <button type="button" data-cmd="formatBlock" data-value="h3">Subheading</button>
      <button type="button" data-cmd="formatBlock" data-value="p">Paragraph</button>
      <button type="button" data-cmd="insertUnorderedList">• List</button>
      <button type="button" data-cmd="insertOrderedList">1. List</button>
      <button type="button" data-cmd="formatBlock" data-value="blockquote">Quote</button>
      <button type="button" data-cmd="createLink">Link</button>
      <button type="button" data-cmd="removeFormat">Clear formatting</button>
    </div>
    <div id="editor" class="editor js-only" contenteditable="true" data-placeholder="Paste or start writing…"></div>
    <textarea class="fallback nojs-only" name="body_html" placeholder="Paste or write your article. Leave a blank line between paragraphs.">${h(v.body_html)}</textarea>
    <input type="hidden" id="body-html" name="body_html" value="">
  </div>

  <div class="field">
    <label for="excerpt">Short summary <span style="text-transform:none;letter-spacing:0">(optional)</span></label>
    <textarea id="excerpt" name="excerpt" rows="2" maxlength="220" placeholder="One or two sentences. Shown on the blog page and in search results. Left blank, the first lines of the article are used.">${h(v.excerpt)}</textarea>
  </div>

  <div class="field">
    <label for="cover">Cover image <span style="text-transform:none;letter-spacing:0">(optional)</span></label>
    ${v.cover_url ? `<img id="cover-preview" class="cover-preview" src="${h(v.cover_url)}" alt="">` : ""}
    <div class="cover-row">
      <input type="file" id="cover" name="cover" accept="image/jpeg,image/png,image/webp,image/gif">
      ${v.cover_url ? `<label class="inline"><input type="checkbox" name="remove_cover" value="1"> Remove current image</label>` : ""}
    </div>
    <p class="hint">JPG, PNG or WebP, up to 5 MB. Landscape works best (about 1600 × 900).</p>
  </div>

  <div class="field">
    <label for="cover_alt">Image description</label>
    <input type="text" id="cover_alt" name="cover_alt" maxlength="200" value="${h(v.cover_alt)}" placeholder="A few words describing the picture, for readers who can't see it">
  </div>

  <div class="actions-bar">
    <button class="btn btn-primary" type="submit" name="action" value="publish">${v.status === "published" ? "Update published post" : "Publish"}</button>
    <button class="btn btn-secondary" type="submit" name="action" value="draft">${v.status === "published" ? "Unpublish & save as draft" : "Save as draft"}</button>
    <span class="spacer"></span>
    ${isNew ? "" : `<a class="btn btn-quiet" href="/admin/preview/${h(v.id)}" target="_blank" rel="noopener">Preview</a>`}
    <a class="btn btn-quiet" href="/admin">Cancel</a>
  </div>
</form>`;

  return layout({ title: isNew ? "New post" : `Edit: ${v.title}`, body, who });
}

function pagePreview(post: Post, who: AccessIdentity): string {
  const body = `<div class="notice">Preview — ${post.status === "published" ? "this post is live" : "this is a draft, only you can see it"}. <a href="/admin/edit/${h(post.id)}">Back to editor</a></div>
<article class="card" style="padding:2rem 2.5rem">
  ${post.cover_url ? `<img class="cover-preview" style="max-height:24rem;width:100%" src="${h(post.cover_url)}" alt="${h(post.cover_alt ?? "")}">` : ""}
  <p class="pill ${post.status}" style="margin:0 0 .5rem">${post.status}</p>
  <h1>${h(post.title)}</h1>
  <p class="lead">${h(post.excerpt)}</p>
  <div class="editor" style="border:none;padding:0;min-height:0">${post.body_html}</div>
</article>`;
  return layout({ title: `Preview: ${post.title}`, body, who });
}

function pageSubscribers(
  subs: Awaited<ReturnType<typeof listSubscribers>>,
  who: AccessIdentity,
  flash: { removed?: string },
): string {
  const active = subs.filter((s) => s.status === "active");
  const rows = subs
    .map(
      (s) => `<li class="card post-row">
  <div>
    <span class="title" style="font-family:inherit;font-size:1rem">${h(s.email)}</span>
    <div class="meta">
      <span class="pill ${s.status === "active" ? "published" : "draft"}">${s.status}</span>
      <span>${s.status === "active" ? `Signed up ${fmtDate(s.created_at)}` : `Unsubscribed ${fmtDate(s.unsubscribed_at)}`}</span>
    </div>
  </div>
  <div class="actions">
    <form method="post" action="/admin/subscribers/delete/${h(s.id)}" data-confirm="Remove this address completely?">
      <button class="btn btn-quiet btn-danger" type="submit">Remove</button>
    </form>
  </div>
</li>`,
    )
    .join("\n");

  const body = `<h1>Subscribers</h1>
<p class="lead">${active.length} active ${active.length === 1 ? "address" : "addresses"}${subs.length !== active.length ? `, ${subs.length - active.length} unsubscribed` : ""}. People sign up from the form on Let's Get Real and can remove themselves at <a href="/unsubscribe" target="_blank" rel="noopener">reallifehealing.care/unsubscribe</a>.</p>
${flash.removed ? `<div class="notice">Address removed.</div>` : ""}
<p style="margin:0 0 1.5rem"><a class="btn btn-primary" href="/admin/subscribers.csv">Download active list (CSV)</a></p>
<div class="notice">When you send a newsletter, put the addresses in <strong>BCC</strong>, never To or CC, and include the line <em>"To stop receiving these, visit reallifehealing.care/unsubscribe"</em>. Check here for unsubscribes before each send.</div>
${
  subs.length
    ? `<ul class="posts">${rows}</ul>`
    : `<div class="card empty"><p>No subscribers yet.</p></div>`
}`;
  return layout({ title: "Subscribers", body, who });
}

/** Public page: a small form to leave the list. Server-rendered, no JS. */
function pageUnsubscribe(state: "form" | "done" | "invalid"): string {
  const inner =
    state === "done"
      ? `<h1>You're unsubscribed</h1>
<p class="lead">If that address was on the list, it has been removed and you won't hear from us again. Take care.</p>
<p><a class="btn btn-secondary" href="/">Back to the site</a></p>`
      : `<h1>Unsubscribe</h1>
<p class="lead">Enter the email address you signed up with and we'll take it off the list.</p>
${state === "invalid" ? `<ul class="error-list"><li class="error">That doesn't look like an email address.</li></ul>` : ""}
<form method="post" action="/api/unsubscribe" class="card" style="max-width:28rem">
  <div class="field">
    <label for="email">Email address</label>
    <input type="text" id="email" name="email" required autocomplete="email" inputmode="email" placeholder="you@email.com">
  </div>
  <input type="hidden" name="redirect" value="1">
  <button class="btn btn-primary" type="submit">Unsubscribe</button>
</form>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Unsubscribe · Real. Life Healing</title>
<link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="/admin/admin.css">
</head>
<body>
<header class="bar"><div class="wrap"><div class="brand"><a href="/" style="color:inherit;text-decoration:none">Real. Life Healing</a></div></div></header>
<main class="wrap">${inner}</main>
</body>
</html>`;
}

async function handleSubscribe(request: Request, env: BlogEnv): Promise<Response> {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });

  if (!isSameOriginRequest(request)) return json({ ok: false, error: "forbidden" }, 403);
  if (!env.DB) return json({ ok: false, error: "unavailable" }, 503);

  let email = "";
  let honeypot = "";
  let source = "lets-get-real";
  const ct = request.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/json")) {
      const data = (await request.json()) as { email?: unknown; website?: unknown; source?: unknown };
      email = typeof data.email === "string" ? data.email : "";
      honeypot = typeof data.website === "string" ? data.website : "";
      if (typeof data.source === "string" && /^[a-z-]{1,40}$/.test(data.source)) source = data.source;
    } else {
      const fd = await request.formData();
      email = String(fd.get("email") ?? "");
      honeypot = String(fd.get("website") ?? "");
    }
  } catch {
    return json({ ok: false, error: "bad request" }, 400);
  }

  // Bots fill every field; humans never see this one.
  if (honeypot) return json({ ok: true });

  email = normalizeEmail(email);
  if (!looksLikeEmail(email)) return json({ ok: false, error: "invalid email" }, 400);

  await ensureSchema(env.DB);
  await addSubscriber(env.DB, email, source);
  // Same answer whether new, existing or re-activated: don't leak membership.
  return json({ ok: true });
}

async function handleUnsubscribe(request: Request, env: BlogEnv): Promise<Response> {
  if (!isSameOriginRequest(request)) return new Response("Forbidden", { status: 403 });
  const fd = await request.formData();
  const email = normalizeEmail(String(fd.get("email") ?? ""));
  const wantsPage = fd.get("redirect") === "1";
  if (!looksLikeEmail(email)) {
    return wantsPage
      ? html(pageUnsubscribe("invalid"), 400, { "x-robots-tag": "noindex" })
      : new Response(JSON.stringify({ ok: false, error: "invalid email" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
  }
  if (env.DB) {
    await ensureSchema(env.DB);
    await unsubscribe(env.DB, email);
  }
  return wantsPage
    ? html(pageUnsubscribe("done"), 200)
    : new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
}

function subscribersCsv(subs: Awaited<ReturnType<typeof listSubscribers>>): Response {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    "email,signed_up",
    ...subs.filter((s) => s.status === "active").map((s) => `${esc(s.email)},${esc(s.created_at.slice(0, 10))}`),
  ];
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="rlh-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}

// ───────────────────────────────────────────────────────────── handlers ──

async function handleSave(
  request: Request,
  env: BlogEnv,
  who: AccessIdentity,
): Promise<Response> {
  const db = env.DB!;
  const fd = await request.formData();
  const get = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" ? v : "";
  };

  const id = get("id").trim() || crypto.randomUUID();
  const isNew = !(await getById(db, id));
  const title = get("title").trim();
  let slug = slugify(get("slug").trim() || title);
  const body_html = sanitizeHtml(get("body_html"));
  let excerpt = get("excerpt").trim();
  const cover_alt = get("cover_alt").trim();
  const action = get("action") === "publish" ? "published" : "draft";
  const existingCover = get("existing_cover_url").trim() || null;
  const removeCover = get("remove_cover") === "1";

  const errors: string[] = [];
  if (!title) errors.push("A title is required.");
  if (!slug) errors.push("The web address couldn't be built from the title — please type one.");
  if (slug && (await slugTaken(db, slug, id)))
    errors.push(`Another post already uses the address "${slug}". Choose a different one.`);
  if (action === "published" && !body_html)
    errors.push("The article is empty. Add some text before publishing.");

  // Cover upload
  let cover_url: string | null = removeCover ? null : existingCover;
  const file = fd.get("cover");
  if (file instanceof File && file.size > 0) {
    const ext = IMAGE_TYPES[file.type];
    if (!ext) errors.push("Cover image must be a JPG, PNG, WebP or GIF.");
    else if (file.size > MAX_COVER_BYTES) errors.push("Cover image is over 5 MB.");
    else if (!env.MEDIA) errors.push("Image storage (R2 bucket MEDIA) is not configured.");
    else {
      const key = `covers/${id}-${Date.now()}.${ext}`;
      await env.MEDIA.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
      });
      cover_url = `/media/${key}`;
    }
  }

  if (errors.length) {
    return html(
      pageEditor(
        { id, title, slug, excerpt, body_html, cover_url, cover_alt, status: action },
        who,
        errors,
        isNew,
      ),
      400,
    );
  }

  if (!excerpt) excerpt = excerptFromHtml(body_html);

  await savePost(db, {
    id,
    slug,
    title,
    excerpt,
    body_html,
    cover_url,
    cover_alt: cover_alt || null,
    status: action,
  });

  // Best-effort cleanup of a replaced or removed cover
  if (env.MEDIA && existingCover && existingCover !== cover_url && existingCover.startsWith("/media/")) {
    env.MEDIA.delete(existingCover.slice("/media/".length)).catch(() => {});
  }

  return redirect(`/admin?saved=${encodeURIComponent(slug)}&status=${action}`);
}

async function serveMedia(env: BlogEnv, key: string): Promise<Response> {
  if (!env.MEDIA || !key || key.includes("..")) return new Response("Not found", { status: 404 });
  const obj = await env.MEDIA.get(key);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "content-type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
      etag: obj.httpEtag,
    },
  });
}

async function serveSitemap(env: BlogEnv): Promise<Response> {
  const staticRoutes = ["/", "/getting-started", "/lets-get-real", "/links"];
  let posts: PostSummary[] = [];
  if (env.DB) {
    try {
      posts = await listPublished(env.DB);
    } catch {
      posts = [];
    }
  }
  const urls = [
    ...staticRoutes.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`),
    ...posts.map(
      (p) =>
        `  <url><loc>${SITE_URL}/lets-get-real/${h(p.slug)}</loc><lastmod>${(p.updated_at ?? p.published_at ?? "").slice(0, 10)}</lastmod></url>`,
    ),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

/**
 * Entry point. Returns null when the request is not for the backend, so
 * server.ts can pass it on to TanStack.
 */
export async function handleBackendRequest(
  request: Request,
  env: BlogEnv,
): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (path === "/sitemap.xml") return serveSitemap(env);

  // Newsletter — public
  if (path === "/api/subscribe") {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
    return handleSubscribe(request, env);
  }
  if (path === "/api/unsubscribe") {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
    return handleUnsubscribe(request, env);
  }
  if (path === "/unsubscribe") {
    if (request.method !== "GET" && request.method !== "HEAD") return null;
    return html(pageUnsubscribe("form"), 200);
  }

  if (path.startsWith("/media/")) {
    if (request.method !== "GET" && request.method !== "HEAD") return null;
    return serveMedia(env, decodeURIComponent(path.slice("/media/".length)));
  }

  if (path !== "/admin" && !path.startsWith("/admin/")) return null;

  // Public assets for the admin shell
  // no-cache = the browser may keep a copy but must check with the server
  // before using it, so a fix deploys on the next plain reload. These files
  // are a few KB; the round-trip is cheap.
  if (path === "/admin/admin.css")
    return new Response(ADMIN_CSS, {
      headers: { "content-type": "text/css; charset=utf-8", "cache-control": "no-cache" },
    });
  if (path === "/admin/admin.js")
    return new Response(ADMIN_JS, {
      headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-cache" },
    });

  // Everything else: authenticated
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.DB) return pageForbidden("unconfigured");
  const who = await verifyAccess(request, env);
  if (!who) return pageForbidden("denied");

  const db = env.DB;
  await ensureSchema(db);

  if (request.method === "GET") {
    if (path === "/admin") {
      const posts = await listAll(db);
      return html(
        pageList(posts, who, {
          saved: url.searchParams.get("saved") ?? undefined,
          status: url.searchParams.get("status") ?? undefined,
          deleted: url.searchParams.get("deleted") ?? undefined,
        }),
      );
    }
    if (path === "/admin/subscribers") {
      const subs = await listSubscribers(db);
      return html(pageSubscribers(subs, who, { removed: url.searchParams.get("removed") ?? undefined }));
    }
    if (path === "/admin/subscribers.csv") {
      return subscribersCsv(await listSubscribers(db));
    }
    if (path === "/admin/new") {
      return html(
        pageEditor(
          {
            id: crypto.randomUUID(),
            title: "",
            slug: "",
            excerpt: "",
            body_html: "",
            cover_url: null,
            cover_alt: "",
            status: "draft",
          },
          who,
          [],
          true,
        ),
      );
    }
    const edit = path.match(/^\/admin\/edit\/([0-9a-f-]{36})$/);
    if (edit) {
      const post = await getById(db, edit[1]);
      if (!post) return html(layout({ title: "Not found", body: `<h1>Post not found</h1><p><a href="/admin">Back to posts</a></p>`, who }), 404);
      return html(pageEditor({ ...post, excerpt: post.excerpt, cover_alt: post.cover_alt ?? "" }, who));
    }
    const preview = path.match(/^\/admin\/preview\/([0-9a-f-]{36})$/);
    if (preview) {
      const post = await getById(db, preview[1]);
      if (!post) return html(layout({ title: "Not found", body: `<h1>Post not found</h1><p><a href="/admin">Back to posts</a></p>`, who }), 404);
      return html(pagePreview(post, who));
    }
    return html(layout({ title: "Not found", body: `<h1>Page not found</h1><p><a href="/admin">Back to posts</a></p>`, who }), 404);
  }

  if (request.method === "POST") {
    if (!isSameOriginRequest(request)) return new Response("Forbidden", { status: 403 });

    if (path === "/admin/save") return handleSave(request, env, who);

    const status = path.match(/^\/admin\/status\/([0-9a-f-]{36})$/);
    if (status) {
      const fd = await request.formData();
      const next: PostStatus = fd.get("status") === "published" ? "published" : "draft";
      const post = await getById(db, status[1]);
      if (!post) return redirect("/admin");
      if (next === "published" && !post.body_html)
        return redirect(`/admin/edit/${post.id}`);
      await setStatus(db, post.id, next);
      return redirect(`/admin?saved=${encodeURIComponent(post.slug)}&status=${next}`);
    }

    const subDel = path.match(/^\/admin\/subscribers\/delete\/([0-9a-f-]{36})$/);
    if (subDel) {
      await deleteSubscriber(db, subDel[1]);
      return redirect("/admin/subscribers?removed=1");
    }

    const del = path.match(/^\/admin\/delete\/([0-9a-f-]{36})$/);
    if (del) {
      const post = await getById(db, del[1]);
      if (post) {
        await deletePost(db, post.id);
        if (env.MEDIA && post.cover_url?.startsWith("/media/"))
          env.MEDIA.delete(post.cover_url.slice("/media/".length)).catch(() => {});
      }
      return redirect("/admin?deleted=1");
    }
  }

  return new Response("Method not allowed", { status: 405 });
}
