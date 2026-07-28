import { useEffect, useId, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

import sanctuaryMark from "@/assets/sanctuary-mark.png";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/getting-started", label: "Getting Started" },
  { to: "/lets-get-real", label: "Let's Get Real" },
  { to: "/links", label: "Links" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Close on navigation. Without this the panel stays open over the new page.
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes and returns focus to the button that opened it.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Lock background scroll while the panel is open. Set through CSSOM rather
  // than an inline style attribute, so this still works under a CSP without
  // style-src 'unsafe-inline'.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.setProperty("overflow", "hidden");
    return () => {
      document.body.style.setProperty("overflow", previous);
    };
  }, [open]);

  // Move focus into the panel so keyboard and screen reader users land there.
  useEffect(() => {
    if (open) firstLinkRef.current?.focus();
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4 sm:gap-6">
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Close menu" : "Open menu"}
          className="-ml-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-evergreen transition hover:bg-evergreen/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-honey md:hidden"
        >
          <MenuIcon open={open} />
        </button>

        <Link to="/" className="group flex items-center gap-3">
          <img
            src={sanctuaryMark}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg text-evergreen">
              Real. Life Healing
            </span>
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.22em] text-forest/70">
              Mental Health Counseling
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-6">
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/getting-started"
            hash="begin"
            className="hidden rounded-full bg-honey px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition hover:brightness-95 sm:inline-flex"
          >
            Book now
          </Link>
        </div>
      </div>

      {/* Mobile panel. Rendered only when open, so nothing focusable sits
          behind the scenes while it is closed. */}
      {open && (
        <div
          id={panelId}
          className="border-t border-border/60 bg-cream md:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col px-6 py-2">
            {NAV_ITEMS.map((item, index) => (
              <Link
                key={item.to}
                ref={index === 0 ? firstLinkRef : undefined}
                to={item.to}
                activeOptions={{ exact: true }}
                activeProps={{ className: "text-evergreen" }}
                inactiveProps={{ className: "text-forest/85" }}
                className="border-b border-border/40 py-4 font-sans text-base tracking-wide transition last:border-b-0 hover:text-evergreen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-honey"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* The header CTA is hidden on the narrowest screens, so the mobile
              menu carries it. Losing the primary call to action on phones
              would cost more than the menu gains. */}
          <div className="mx-auto max-w-6xl px-6 pb-6 pt-2">
            <Link
              to="/getting-started"
              hash="begin"
              className="flex w-full items-center justify-center rounded-full bg-honey px-5 py-3.5 text-sm font-medium text-accent-foreground shadow-sm transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-honey"
            >
              Book now
            </Link>
            <p className="mt-4 text-center text-sm text-forest/75">
              Or call or text{" "}
              <a
                href="tel:+13179183195"
                className="text-honey underline underline-offset-4"
              >
                1-317-918-3195
              </a>
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * Two bars that cross into an X. Two strokes rather than the usual three, so
 * the closed and open states use the same shapes and the change reads as one
 * object rotating rather than one icon swapping for another.
 */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line
        x1="3"
        y1={open ? "11" : "7"}
        x2="19"
        y2={open ? "11" : "7"}
        transform={open ? "rotate(45 11 11)" : undefined}
        className="origin-center motion-safe:transition-all motion-safe:duration-200"
      />
      <line
        x1="3"
        y1={open ? "11" : "15"}
        x2="19"
        y2={open ? "11" : "15"}
        transform={open ? "rotate(-45 11 11)" : undefined}
        className="origin-center motion-safe:transition-all motion-safe:duration-200"
      />
    </svg>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: true }}
      activeProps={{ className: "text-evergreen after:scale-x-100" }}
      inactiveProps={{ className: "text-forest/80 hover:text-evergreen" }}
      className="relative font-sans text-sm tracking-wide transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-honey after:transition-transform hover:after:scale-x-100"
    >
      {children}
    </Link>
  );
}
