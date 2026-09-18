/**
 * admin-assets.ts — the stylesheet and script for the /admin pages.
 *
 * Served by the Worker at /admin/admin.css and /admin/admin.js rather than
 * inlined, so the admin keeps working when 'unsafe-inline' is eventually
 * removed from script-src (see docs/security-headers.md).
 */

export const ADMIN_CSS = /* css */ `
:root {
  --evergreen: oklch(0.34 0.02 150);
  --forest: oklch(0.42 0.02 150);
  --honey: oklch(0.68 0.13 70);
  --sand: oklch(0.89 0.02 80);
  --cream: oklch(0.96 0.015 85);
  --card: oklch(0.99 0.008 85);
  --rule: oklch(0.85 0.02 80);
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font: 16px/1.55 "Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif;
  background: var(--cream); color: var(--evergreen);
}
a { color: var(--forest); }
.wrap { max-width: 56rem; margin: 0 auto; padding: 2rem 1.25rem 5rem; }
header.bar {
  background: var(--evergreen); color: var(--cream);
}
header.bar .wrap { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; gap: 1rem; flex-wrap: wrap; }
header.bar .brand { font-family: Marcellus, Georgia, serif; font-size: 1.15rem; letter-spacing: .04em; }
header.bar .who { font-size: .8rem; opacity: .75; }
header.bar nav a { color: var(--cream); text-decoration: none; margin-left: 1rem; font-size: .9rem; opacity: .9; }
header.bar nav a:hover { opacity: 1; text-decoration: underline; }
h1 { font-family: Spectral, Georgia, serif; font-weight: 400; font-size: 2rem; margin: 0 0 .25rem; }
h2 { font-family: Spectral, Georgia, serif; font-weight: 400; font-size: 1.35rem; margin: 2rem 0 .75rem; }
.lead { color: var(--forest); margin: 0 0 1.5rem; }
.btn {
  display: inline-flex; align-items: center; gap: .4rem; border-radius: 999px;
  padding: .6rem 1.15rem; font: inherit; font-size: .9rem; font-weight: 500;
  border: 1px solid transparent; cursor: pointer; text-decoration: none;
}
.btn-primary { background: var(--honey); color: var(--evergreen); }
.btn-primary:hover { filter: brightness(.96); }
.btn-secondary { background: transparent; color: var(--evergreen); border-color: var(--rule); }
.btn-secondary:hover { background: var(--sand); }
.btn-quiet { background: transparent; color: var(--forest); border: none; padding: .4rem .6rem; }
.btn-quiet:hover { text-decoration: underline; }
.btn-danger { color: #8a3b2f; }
.card { background: var(--card); border: 1px solid var(--rule); border-radius: 1rem; padding: 1.25rem 1.5rem; }
.notice { background: var(--sand); border-radius: .75rem; padding: .9rem 1.1rem; margin: 0 0 1.25rem; font-size: .95rem; }
.notice.warn { background: oklch(0.93 0.05 70); }
.empty { text-align: center; padding: 3rem 1rem; color: var(--forest); }

/* Post list */
.posts { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .75rem; }
.post-row { display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: center; }
.post-row .title { font-family: Spectral, Georgia, serif; font-size: 1.15rem; text-decoration: none; color: var(--evergreen); }
.post-row .title:hover { text-decoration: underline; }
.post-row .meta { font-size: .8rem; color: var(--forest); margin-top: .2rem; display: flex; gap: .75rem; flex-wrap: wrap; }
.pill { display: inline-block; font-size: .7rem; letter-spacing: .12em; text-transform: uppercase; border-radius: 999px; padding: .15rem .6rem; }
.pill.published { background: oklch(0.88 0.06 150); color: var(--evergreen); }
.pill.draft { background: var(--sand); color: var(--forest); }
.post-row .actions { display: flex; gap: .25rem; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
.post-row form { display: inline; }

/* Editor */
.field { margin-bottom: 1.25rem; }
.field label { display: block; font-size: .78rem; letter-spacing: .14em; text-transform: uppercase; color: var(--forest); margin-bottom: .4rem; }
.field .hint { font-size: .82rem; color: var(--forest); margin-top: .35rem; }
.field input[type=text], .field textarea {
  width: 100%; font: inherit; padding: .7rem .9rem; border-radius: .6rem;
  border: 1px solid var(--rule); background: var(--card); color: var(--evergreen);
}
.field input[type=text]:focus, .field textarea:focus, .editor:focus { outline: 2px solid var(--honey); outline-offset: 1px; }
.field input.title { font-family: Spectral, Georgia, serif; font-size: 1.4rem; }
.slug-row { display: flex; align-items: center; gap: .25rem; font-size: .9rem; color: var(--forest); }
.slug-row input { flex: 1; }
.toolbar { display: flex; gap: .25rem; flex-wrap: wrap; margin-bottom: .5rem; }
.toolbar button { font: inherit; font-size: .85rem; padding: .35rem .7rem; border-radius: .5rem; border: 1px solid var(--rule); background: var(--card); color: var(--evergreen); cursor: pointer; }
.toolbar button:hover { background: var(--sand); }
.toolbar button b { font-weight: 700; } .toolbar button i { font-style: italic; }
.editor {
  min-height: 26rem; padding: 1.25rem 1.5rem; border-radius: .75rem; border: 1px solid var(--rule);
  background: var(--card); font-family: Spectral, Georgia, serif; font-size: 1.05rem; line-height: 1.7;
}
.editor:empty::before { content: attr(data-placeholder); color: oklch(0.6 0.02 150); }
.editor h2 { font-size: 1.5rem; margin: 1.5rem 0 .5rem; } .editor h3 { font-size: 1.2rem; margin: 1.25rem 0 .4rem; }
.editor p { margin: 0 0 1rem; } .editor ul, .editor ol { margin: 0 0 1rem 1.25rem; }
.editor blockquote { border-left: 3px solid var(--honey); margin: 1rem 0; padding: .25rem 1rem; color: var(--forest); }
.editor a { color: var(--forest); }
textarea.fallback { min-height: 26rem; font-family: Spectral, Georgia, serif; font-size: 1.05rem; line-height: 1.7; }
/* Progressive enhancement: the visual editor and toolbar only appear once
   admin.js has run (it adds .js to <html>); the plain textarea is the
   no-JavaScript fallback and is hidden when the editor is available. */
.js-only { display: none; }
.js .js-only { display: block; }
.js .toolbar.js-only { display: flex; }
.nojs-only { display: block; }
.js .nojs-only { display: none; }
.cover-preview { display: block; max-width: 100%; max-height: 16rem; border-radius: .75rem; margin-bottom: .75rem; object-fit: cover; }
.cover-row { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
.cover-row label.inline { display: inline-flex; align-items: center; gap: .4rem; text-transform: none; letter-spacing: 0; font-size: .9rem; margin: 0; }
.actions-bar { display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--rule); }
.actions-bar .spacer { flex: 1; }
.error { color: #8a3b2f; }
.error-list { background: oklch(0.95 0.03 30); border-radius: .75rem; padding: .9rem 1.1rem 0.9rem 2rem; margin: 0 0 1.25rem; }
.help { font-size: .9rem; color: var(--forest); }
.help ol { padding-left: 1.25rem; } .help li { margin: .3rem 0; }
code { background: var(--sand); padding: .05rem .35rem; border-radius: .3rem; font-size: .9em; }
`;

export const ADMIN_JS = /* js */ `
(function () {
  document.documentElement.classList.add('js');

  // Confirm destructive actions (delete). Bound here rather than inline so
  // the admin keeps working once 'unsafe-inline' leaves script-src.
  document.querySelectorAll('form[data-confirm]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      if (!window.confirm('Delete this post? This cannot be undone.')) e.preventDefault();
    });
  });

  var form = document.getElementById('post-form');
  if (!form) return;

  var title = form.querySelector('[name=title]');
  var slug = form.querySelector('[name=slug]');
  var editor = document.getElementById('editor');
  var hidden = form.querySelector('[name=body_html]');
  var fallback = form.querySelector('textarea.fallback');
  var slugTouched = slug.value.length > 0;

  function slugify(s) {
    return s.normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase()
      .replace(/['\\u2019]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  }
  title.addEventListener('input', function () {
    if (!slugTouched) slug.value = slugify(title.value);
  });
  slug.addEventListener('input', function () { slugTouched = slug.value.length > 0; });
  slug.addEventListener('blur', function () { slug.value = slugify(slug.value); });

  // Seed the visual editor from the textarea (which holds the saved HTML).
  if (editor && fallback) {
    editor.innerHTML = fallback.value || '';
    fallback.removeAttribute('name');
  }

  // Toolbar — execCommand is old but universally supported and needs no library.
  form.querySelectorAll('.toolbar button').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      editor.focus();
      var cmd = b.getAttribute('data-cmd');
      var val = b.getAttribute('data-value');
      if (cmd === 'createLink') {
        var url = window.prompt('Link address (https://…)');
        if (!url) return;
        document.execCommand('createLink', false, url);
        return;
      }
      if (cmd === 'formatBlock') { document.execCommand('formatBlock', false, val); return; }
      document.execCommand(cmd, false, null);
    });
  });

  // On submit, copy the editor's HTML into the hidden field. The server
  // sanitizes it to a small allow-list, so paste from Google Docs is fine.
  form.addEventListener('submit', function () {
    if (editor) hidden.value = editor.innerHTML;
  });

  // Cover image preview
  var cover = form.querySelector('input[name=cover]');
  var preview = document.getElementById('cover-preview');
  if (cover) {
    cover.addEventListener('change', function () {
      var f = cover.files && cover.files[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) { alert('That image is over 5 MB. Please use a smaller one.'); cover.value = ''; return; }
      var url = URL.createObjectURL(f);
      if (!preview) { preview = document.createElement('img'); preview.id = 'cover-preview'; preview.className = 'cover-preview'; cover.parentNode.parentNode.insertBefore(preview, cover.parentNode); }
      preview.src = url;
      var rm = form.querySelector('input[name=remove_cover]'); if (rm) rm.checked = false;
    });
  }

  // Warn before leaving with unsaved edits
  var dirty = false;
  form.addEventListener('input', function () { dirty = true; });
  if (editor) editor.addEventListener('input', function () { dirty = true; });
  form.addEventListener('submit', function () { dirty = false; });
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
})();
`;
