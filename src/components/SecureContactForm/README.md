# SecureContactForm

Drop-in wrapper for the Hushmail Secure Forms embed
(`reallifehealing-secure-contact-form`).

```
SecureContactForm/
├── index.ts                      barrel export
├── SecureContactForm.tsx         component
├── SecureContactForm.module.css  scoped styles
└── README.md                     this file
```

Copy the whole folder to `src/components/`. No dependencies beyond React.

## Usage

```tsx
import { SecureContactForm } from '@/components/SecureContactForm';

export function BeginYourCare() {
  return (
    <section id="begin">
      <h2>Begin your care</h2>
      <p>Real, affordable therapy. A warm next step.</p>
      <SecureContactForm />
    </section>
  );
}
```

## Props

| Prop | Type | Default | Purpose |
|---|---|---|---|
| `reservedHeight` | `number` | `620` | Height held while the embed loads, so the page doesn't jump |
| `className` | `string` | — | Extra class on the wrapper, for page-level spacing |
| `onReady` | `() => void` | — | Fires once the embed has rendered |
| `onUnavailable` | `() => void` | — | Fires if the embed fails to load |

**Set `reservedHeight` properly once you're live.** Measure the rendered form
in DevTools and pass that number. The 620 default is a guess — I've never seen
this form render. Too low and the page still jumps; too high and there's a gap.

## What it handles

- **Script execution.** React never runs a `<script>` tag it renders. The
  script is appended imperatively in an effect.
- **Route changes.** The embed doesn't re-init on client-side navigation, so
  the script is removed and re-appended on mount.
- **Layout shift.** Space is reserved before the embed injects itself.
- **Total failure.** If hushforms.com is blocked or unreachable, after 8s the
  component falls back to the phone number and the client portal link rather
  than leaving an empty box.

## Two things that are load-bearing

**Crisis guidance renders outside the embed container.** If Hushmail fails
entirely, the 988 and 911 information still appears. It must never be moved
inside the embed or made conditional on load state.

**The fallback is not styled as an error.** No red, no warning icons. Someone
reaching this state is trying to ask for help with something hard, and a page
raising an alarm at them is the wrong response. If you restyle it, keep that.

## Styling

Colours are custom properties that look for your design tokens first and fall
back to values derived from the site's `theme-color` (`#344338`):

```css
--rlh-form-ink        →  var(--color-text)
--rlh-form-ink-muted  →  var(--color-text-muted)
--rlh-form-accent     →  var(--color-accent)
--rlh-form-rule       →  var(--color-rule)
--rlh-form-surface    →  var(--color-surface-soft)
```

If your token names differ, remap them at the top of the CSS module.

The module reaches into the embed with `:global` for one thing only: font
inheritance, so the form uses your typeface instead of Hushmail's default.
Styling it further means inspecting the rendered DOM, which needs the form
live in front of you — send me a screenshot of it and I'll write the rest.

**Using Tailwind?** The module still works unchanged. Or delete the CSS import
and the `styles.*` references and use classes directly — the structure is
plain enough.

**Plain JS project?** Rename to `.jsx`, delete the `SecureContactFormProps`
interface and the two type annotations. Nothing else changes.

## Requires

If you add a Content-Security-Policy, `hushforms.com` needs to be in
`script-src`, `connect-src`, `frame-src`, and `form-action`. See
`docs/security-headers.md` — the shipped policy already includes it, and is in
Report-Only mode until tuned.

## Still open

**Conversion tracking.** The embed handles its own submit, so you likely get
no event to hook `onReady`-style. Two options: ask Hushmail support whether it
emits a `postMessage` on success, or configure a Hushmail redirect to a
`/thank-you` route and count pageviews there. The second also gives you
somewhere to put the "Kelly replies within one business day" promise.

**Do not put a Meta Pixel or Google Analytics on any page containing this
component.** HHS OCR treats third-party tracking on pages where health
information is entered as a disclosure requiring a BAA, and Meta won't sign
one. Cloudflare Web Analytics is cookieless and fine.
