import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-evergreen text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">Real. Life Healing</p>
          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-cream/60">
            Mental Health Counseling
          </p>
          <p className="mt-6 font-serif text-base italic text-cream/85">
            Healing happens in real life.
          </p>
        </div>

        <div className="text-sm text-cream/80">
          <p className="font-serif text-cream text-lg">Practice</p>
          <ul className="mt-4 space-y-2">
            <li><Link to="/" className="hover:text-honey">Home</Link></li>
            <li><Link to="/getting-started" className="hover:text-honey">Getting Started</Link></li>
            <li><Link to="/lets-get-real" className="hover:text-honey">Let's Get Real</Link></li>
            <li><Link to="/links" className="hover:text-honey">Links</Link></li>
          </ul>
        </div>

        <div className="text-sm text-cream/80">
          <p className="font-serif text-cream text-lg">Kelly Day, LMHC, NCC</p>
          <p className="mt-4">Telehealth for the State of Indiana</p>
          <p className="mt-2">Serving clients since 2019</p>
          <a
            href="tel:+13179183195"
            className="mt-4 inline-block text-honey hover:underline"
          >
            1-317-918-3195
          </a>
          <br />
          <a
            href="mailto:kelly.daylmhc@gmail.com"
            className="mt-2 inline-block text-honey hover:underline"
          >
            kelly.daylmhc@gmail.com
          </a>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-cream/60 md:flex-row">
          <p>© {new Date().getFullYear()} Real. Life Healing — All rights reserved.</p>
          <p>Indiana · Telehealth</p>
        </div>
      </div>
    </footer>
  );
}
