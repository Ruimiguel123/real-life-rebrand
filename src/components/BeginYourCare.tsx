import {
  SIMPLEPRACTICE_BOOKING_URL,
  SIMPLEPRACTICE_PORTAL_URL,
  APPOINTMENT_MAILTO,
  isConfigured,
} from "@/config/simplepractice";

export function BeginYourCare() {
  const bookingHref = isConfigured(SIMPLEPRACTICE_BOOKING_URL)
    ? SIMPLEPRACTICE_BOOKING_URL
    : APPOINTMENT_MAILTO;
  const portalHref = isConfigured(SIMPLEPRACTICE_PORTAL_URL)
    ? SIMPLEPRACTICE_PORTAL_URL
    : APPOINTMENT_MAILTO;

  const external = isConfigured(SIMPLEPRACTICE_BOOKING_URL);

  return (
    <section id="begin" className="scroll-mt-24 bg-evergreen text-cream">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <div className="text-center">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-honey">
            Let's get real
          </p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">
            Begin your care
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-serif text-lg italic text-cream/80">
            Real, affordable therapy — a warm next step, whether you're new here
            or coming back.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <a
            href={bookingHref}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="group flex flex-col rounded-2xl bg-cream p-8 text-evergreen shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="text-xs uppercase tracking-[0.22em] text-forest/70">
              New client
            </span>
            <span className="mt-3 font-serif text-2xl">
              Request an appointment
            </span>
            <span className="mt-3 text-sm text-forest/80">
              Reach out to schedule an intake. We'll find a time that fits.
            </span>
            <span className="mt-6 inline-flex items-center gap-2 self-start rounded-full bg-honey px-5 py-2.5 text-sm font-medium text-accent-foreground transition group-hover:brightness-95">
              Book now through email
              <span aria-hidden>→</span>
            </span>
          </a>

          <a
            href={portalHref}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="group flex flex-col rounded-2xl border border-cream/15 bg-forest p-8 text-cream shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="text-xs uppercase tracking-[0.22em] text-cream/60">
              Existing client
            </span>
            <span className="mt-3 font-serif text-2xl">
              Client portal sign-in
            </span>
            <span className="mt-3 text-sm text-cream/75">
              Access appointments, documents, and secure messaging.
            </span>
            <span className="mt-6 inline-flex items-center gap-2 self-start rounded-full border border-honey/70 px-5 py-2.5 text-sm font-medium text-honey transition group-hover:bg-honey group-hover:text-accent-foreground">
              Sign in
              <span aria-hidden>→</span>
            </span>
          </a>
        </div>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.22em] text-cream/50">
          {external ? "Powered by SimplePractice" : "SimplePractice coming soon"}
        </p>
      </div>
    </section>
  );
}
