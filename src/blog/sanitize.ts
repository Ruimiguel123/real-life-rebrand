/**
 * sanitize.ts — turns whatever Kelly pastes into the editor into a small,
 * predictable subset of HTML.
 *
 * Input is typically a paste from Google Docs: nested <span style="...">,
 * a wrapping <b style="font-weight:normal" id="docs-internal-guid-...">,
 * empty paragraphs, inline styles everywhere. Output is only:
 *
 *   p br strong em u h2 h3 ul ol li a[href] blockquote hr
 *
 * Everything else is dropped (keeping its text). Attributes are dropped
 * except a safe href. This runs server-side on save, so the stored
 * body_html is trusted at render time.
 *
 * No dependencies. Regex tokenizer over an allow-list is fine here because
 * the output alphabet is tiny and every text node is re-escaped.
 */

const ALLOWED = new Set([
  "p", "br", "strong", "em", "u", "h2", "h3", "ul", "ol", "li", "a",
  "blockquote", "hr",
]);

const ALIAS: Record<string, string> = {
  b: "strong",
  i: "em",
  h1: "h2",
  h4: "h3",
  h5: "h3",
  h6: "h3",
  div: "p",
};

const VOID = new Set(["br", "hr"]);
// Elements whose *content* is dropped entirely (until the matching close tag).
const SKIP_CONTENT = new Set(["script", "style", "head", "title", "svg", "iframe", "object"]);
// Void junk that carries no content; dropped without entering skip mode.
const DROP_TAG = new Set(["meta", "link", "img", "input", "source", "track", "embed"]);

const TAG_RE = /<\/?([a-zA-Z][a-zA-Z0-9:-]*)\b([^>]*)>|<!--[\s\S]*?-->|<![^>]*>/g;

function escapeText(s: string): string {
  return s
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function readAttr(attrs: string, name: string): string | null {
  const re = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i");
  const m = attrs.match(re);
  if (!m) return null;
  return (m[1] ?? m[2] ?? m[3] ?? "").trim();
}

function safeHref(raw: string | null): string | null {
  if (!raw) return null;
  const href = raw.replace(/[\u0000-\u001F\u007F\s]/g, "");
  if (/^(https?:\/\/|mailto:)/i.test(href)) return href;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  return null;
}

/** Map a <span style> (or <b style>) to the semantic tag it represents. */
function styleToTag(style: string | null): string | null {
  if (!style) return null;
  const s = style.toLowerCase().replace(/\s+/g, "");
  if (/font-weight:(700|800|900|bold)/.test(s)) return "strong";
  if (/font-style:italic/.test(s)) return "em";
  if (/text-decoration:underline/.test(s)) return "u";
  return null;
}

export function sanitizeHtml(input: string): string {
  const src = input ?? "";
  // Stack entry: the tag we emitted for each open tag we saw ("" = transparent)
  const stack: { seen: string; emitted: string }[] = [];
  let out = "";
  let last = 0;
  let skipUntil: string | null = null;

  const closeEmitted = (seen: string) => {
    // Pop to the most recent matching open tag, closing anything above it.
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].seen === seen) {
        for (let j = stack.length - 1; j >= i; j--) {
          if (stack[j].emitted) out += `</${stack[j].emitted}>`;
        }
        stack.length = i;
        return;
      }
    }
  };

  for (const m of src.matchAll(TAG_RE)) {
    const idx = m.index ?? 0;
    const text = src.slice(last, idx);
    if (!skipUntil && text) out += escapeText(text);
    last = idx + m[0].length;

    if (m[0].startsWith("<!")) continue; // comments, doctype

    const isClose = m[0].startsWith("</");
    const rawName = (m[1] ?? "").toLowerCase();
    const attrs = m[2] ?? "";

    if (skipUntil) {
      if (isClose && rawName === skipUntil) skipUntil = null;
      continue;
    }
    if (SKIP_CONTENT.has(rawName)) {
      if (!isClose) skipUntil = rawName;
      continue;
    }
    if (DROP_TAG.has(rawName)) continue;

    if (isClose) {
      closeEmitted(rawName);
      continue;
    }

    // Decide what to emit for this opening tag
    let name: string | null = ALIAS[rawName] ?? rawName;
    const style = readAttr(attrs, "style");

    if (rawName === "span") {
      name = styleToTag(style);
    } else if (rawName === "b" || rawName === "strong") {
      // Google Docs wraps the whole paste in <b style="font-weight:normal">
      if (style && /font-weight\s*:\s*(normal|400)/i.test(style)) name = null;
    } else if (rawName === "font") {
      name = null;
    }

    if (name && !ALLOWED.has(name)) name = null;

    const selfClosing = /\/\s*$/.test(attrs) || (name ? VOID.has(name) : false);

    if (!name) {
      if (!selfClosing) stack.push({ seen: rawName, emitted: "" });
      continue;
    }

    if (name === "a") {
      const href = safeHref(readAttr(attrs, "href"));
      if (!href) {
        stack.push({ seen: rawName, emitted: "" });
        continue;
      }
      const external = /^https?:\/\//i.test(href);
      out += `<a href="${escapeAttr(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>`;
      stack.push({ seen: rawName, emitted: "a" });
      continue;
    }

    if (VOID.has(name)) {
      out += `<${name}>`;
      continue;
    }

    out += `<${name}>`;
    stack.push({ seen: rawName, emitted: name });
  }

  const tail = src.slice(last);
  if (!skipUntil && tail) out += escapeText(tail);

  // Close anything left open
  for (let j = stack.length - 1; j >= 0; j--) {
    if (stack[j].emitted) out += `</${stack[j].emitted}>`;
  }

  return tidy(out);
}

/** Remove empty blocks, collapse whitespace, wrap bare text in paragraphs. */
function tidy(html: string): string {
  let h = html;

  // Empty inline wrappers
  for (let i = 0; i < 3; i++) {
    h = h.replace(/<(strong|em|u|a[^>]*)>(\s|&nbsp;)*<\/(strong|em|u|a)>/g, "");
  }
  // Empty blocks (Google Docs inserts many)
  h = h.replace(/<(p|h2|h3|li|blockquote)>(\s|&nbsp;|<br>)*<\/\1>/g, "");
  // Empty lists
  h = h.replace(/<(ul|ol)>\s*<\/\1>/g, "");
  // Google Docs nests a <p> inside every <li>
  h = h.replace(/<li><p>([\s\S]*?)<\/p><\/li>/g, "<li>$1</li>");
  // Collapse runs of <br>, and drop any at the very start or end
  h = h.replace(/(<br>\s*){3,}/g, "<br><br>");
  h = h.replace(/^(\s*<br>)+|(<br>\s*)+$/g, "");
  // Trim whitespace between blocks
  h = h.replace(/>\s+</g, "><").trim();

  if (!h) return "";

  // If there is no block-level structure at all, treat as plain text:
  // blank lines become paragraphs, single newlines become <br>.
  if (!/<(p|h2|h3|ul|ol|blockquote|hr)>/.test(h)) {
    const paras = html
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`);
    return paras.join("");
  }

  return h;
}

/** Plain-text excerpt from HTML, for meta descriptions and list cards. */
export function excerptFromHtml(html: string, max = 160): string {
  // Prefer the first real paragraph over a leading heading.
  const firstPara = html.match(/<p>([\s\S]*?)<\/p>/);
  const source = firstPara && firstPara[1].replace(/<[^>]+>/g, "").trim().length > 40 ? firstPara[1] : html;
  const text = source
    .replace(/<\/(p|h2|h3|li|blockquote)>/g, " ")
    .replace(/<br>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : max).trim()}…`;
}

/** URL slug from a title. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
