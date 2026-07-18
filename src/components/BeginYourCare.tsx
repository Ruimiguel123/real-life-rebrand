import {
  SIMPLEPRACTICE_PORTAL_URL,
  isConfigured,
} from "@/config/simplepractice";
import { AppointmentForm } from "@/components/AppointmentForm";

export function BeginYourCare() {
  const portalLive = isConfigured(SIMPLEPRACTICE_PORTAL_URL);

  return (
    <section id="begin" className="scroll-mt-24 bg-evergreen text-cream">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="text-center">
          <p className="font-display text-base uppercase tracking-[0.32em] text-honey md:text-lg">
            Let's get real
          </p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">
            Begin your care
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-serif text-lg italic text-cream/80">
            Real, affordable therapy. A warm next step, whether you're new
            here or coming back.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-stretch">
          {/* New clients: request form → emails Kelly */}
          <AppointmentForm />

          {/* Existing clients + online booking */}
          <div className="flex flex-col gap-6">
            <a
              href={portalLive ? SIMPLEPRACTICE_PORTAL_URL : undefined}
              target={portalLive ? "_blank" : undefined}
              rel={portalLive ? "noopener noreferrer" : undefined}
              aria-disabled={!portalLive}
              className={`group flex flex-1 flex-col rounded-2xl border border-cream/15 bg-forest p-8 text-cream shadow-sm transition ${
                portalLive
                  ? "hover:-translate-y-0.5 hover:shadow-lg"
                  : "cursor-default opacity-80"
              }`}
            >
              <span className="text-xs uppercase tracking-[0.22em] text-cream/60">
                Existing client
              </span>
              <span className="mt-3 font-serif text-2xl">
                Client portal sign-in
              </span>
              <span className="mt-3 text-sm text-cream/75">
                Book and manage appointments, access documents, and message
                Kelly securely through SimplePractice.
              </span>
              <span
                className={`mt-6 inline-flex items-center gap-2 self-start rounded-full border border-honey/70 px-5 py-2.5 text-sm font-medium text-honey transition ${
                  portalLive
                    ? "group-hover:bg-honey group-hover:text-accent-foreground"
                    : ""
                }`}
              >
                {portalLive ? "Sign in" : "Portal opening soon"}
                <span aria-hidden>→</span>
              </span>
            </a>

          </div>
        </div>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.22em] text-cream/50">
          {portalLive
            ? "Secure scheduling powered by SimplePractice"
            : "SimplePractice scheduling coming soon"}
        </p>
      </div>
    </section>
  );
}
