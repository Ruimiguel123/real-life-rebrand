import { Link } from "@tanstack/react-router";
import sanctuaryMark from "@/assets/sanctuary-mark.png";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={sanctuaryMark}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg text-evergreen">
              Real Life Healing
            </span>
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.22em] text-forest/70">
              Mental Health Counseling
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/getting-started">Getting Started</NavLink>
          <NavLink to="/lets-get-real">Let's Get Real</NavLink>
        </nav>

        <Link
          to="/getting-started"
          hash="begin"
          className="hidden rounded-full bg-honey px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition hover:brightness-95 sm:inline-flex"
        >
          Book now
        </Link>
      </div>
    </header>
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
