# Real Life Healing — Rebrand Plan

Rebuild the site in this TanStack Start project using the V2 brand system from the PDF, keeping the current three-page structure and adding a SimplePractice-ready section.

## Brand system (from PDF)

**Colors** (oklch tokens in `src/styles.css`):
- Evergreen `#344338` — primary grounding
- Forest `#4C5C4E` — depth
- Sage `#BE9D82` — calm secondary
- Honey `#C9933F` — warmth accent (CTAs)
- Sand `#E4DBCB` — soft neutral
- Cream `#F7F3E8` — paper background

**Typography** (via @fontsource):
- Marcellus — wordmark/short display
- Spectral (300/400/500 + italic) — headings
- Hanken Grotesk (400–700) — body/UI

**Voice**: warm, grounded, sincere. "Healing happens in real life." "Let's get real."

## Routes

```
src/routes/
  __root.tsx          shared shell, brand fonts, header/footer, meta
  index.tsx           / — home (hero, mission, approach, credentials, booking CTA)
  getting-started.tsx /getting-started — how to begin + SimplePractice section
  lets-get-real.tsx   /lets-get-real — blog/updates placeholder + subscribe
```

Each route gets its own `head()` with unique title + description + og tags.

## Page composition

**Home** — Cream background. Marcellus wordmark hero over Evergreen panel with sanctuary-stack mark, tagline "Healing happens in *real life*." Mission, Approach, and Kelly Day credentials (EMDR, Trauma-Informed, PTSD, Grief) in Sand cards. Honey CTA → `/getting-started`.

**Getting Started** — Intro copy, 3-step "How it works" (Reach out → Match → Begin), and the **Begin Your Care** section (see below). Serves the State of Indiana since 2019.

**Let's Get Real** — Editorial list placeholder for blog posts + email subscribe (non-functional stub form for now).

## Begin Your Care section (SimplePractice-ready)

Full-width Evergreen band with two Honey/Sage cards side-by-side:

1. **Request an appointment** — button with `href` from a single config constant `SIMPLEPRACTICE_BOOKING_URL`.
2. **Client portal sign-in** — button with `href` from `SIMPLEPRACTICE_PORTAL_URL`.

Since the user doesn't have a SimplePractice URL yet, both constants live in `src/config/simplepractice.ts` and default to `#`. When the constant is `#`, the button falls back to the existing `mailto:kelly.daylmhc@gmail.com` appointment link so nothing is broken in the meantime. Swapping in the real URLs later is a one-line change. Small helper text notes "Powered by SimplePractice" under the buttons.

The same section is embedded on the home page above the footer so it's reachable from anywhere.

## Header / footer

- Sticky header: sanctuary-mark + "Real Life Healing / Mental Health Counseling" wordmark left; nav links (Home, Getting Started, Let's Get Real) right; Honey "Book now" button anchors to the Begin Your Care section.
- Footer on Evergreen: mission line, © 2026, subscribe stub, small "Indiana · Telehealth" line.

## Assets

Generate two brand illustrations with `imagegen` in the Evergreen/Sage/Honey palette:
- Sanctuary stone-stack mark (transparent PNG) for header + hero
- Soft abstract "sanctuary" hero backdrop for the home hero

Store under `src/assets/`.

## Technical details

- Add tokens in `src/styles.css` (`:root` + dark variants) and register them in `@theme inline` (`--color-evergreen`, `--color-forest`, `--color-sage`, `--color-honey`, `--color-sand`, `--color-cream`). Map semantic tokens: `--background: var(--cream)`, `--foreground: var(--evergreen)`, `--primary: var(--evergreen)`, `--accent: var(--honey)`.
- `bun add @fontsource/marcellus @fontsource/spectral @fontsource/hanken-grotesk`, import in `src/start.ts` (or a `src/lib/fonts.ts` imported by `__root.tsx`).
- All colors via semantic Tailwind utilities — no hardcoded hex in components.
- Update `__root.tsx` `head()` with real title "Real Life Healing — Therapy in Indiana", description, og/twitter tags.
- Runtime error `Cannot redefine property: ethereum` is a browser wallet extension conflict, not project code — ignored.

## Out of scope

- Real blog CMS, working newsletter backend, auth/accounts (current site has GoDaddy accounts we won't replicate).
- Lovable Cloud — not needed until the newsletter or blog is wired up.
