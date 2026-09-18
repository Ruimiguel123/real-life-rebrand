import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import sanctuaryMark from "@/assets/sanctuary-mark.png";
import { SITE_URL, SOCIAL_LINKS, KELLY_EMAIL } from "@/config/simplepractice";

export const Route = createFileRoute("/links")({
  head: () => ({
    meta: [
      { property: "og:url", content: `${SITE_URL}/links` },
      { title: "Links | Real. Life Healing" },
      {
        name: "description",
        content:
          "Find Real. Life Healing on Instagram, Facebook, and TikTok, browse Kelly's Amazon storefront, and sign up for updates from Kelly Day, LMHC.",
      },
      { property: "og:title", content: "Links | Real. Life Healing" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/links` }],
  }),
  component: LinksPage,
});

const socials = SOCIAL_LINKS;

function LinksPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  // Same endpoint as the Let's Get Real form; see src/blog/admin.ts.
  const subscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    const form = e.currentTarget;
    const honeypot =
      (form.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: honeypot, source: "links-page" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="min-h-[calc(100vh-64px)] bg-evergreen py-16 text-cream">
      <div className="mx-auto flex max-w-md flex-col items-center px-6 text-center">
        <img
          src={sanctuaryMark}
          alt=""
          width={72}
          height={72}
          className="h-16 w-16 object-contain"
        />
        <p className="mt-5 font-display text-base uppercase tracking-[0.32em] text-honey md:text-lg">
          Real. Life Healing
        </p>
        <h1 className="mt-3 font-serif text-3xl italic">
          Healing happens in real life.
        </h1>

        {/* Primary CTA back to the site's booking flow */}
        <a
          href="/getting-started#begin"
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-honey px-6 py-3.5 text-sm font-medium text-accent-foreground transition hover:brightness-95"
        >
          Begin your care
          <span aria-hidden>→</span>
        </a>

        {/* Social links */}
        <div className="mt-4 flex w-full flex-col gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-between rounded-full border border-cream/20 bg-cream/5 px-6 py-3.5 text-sm transition hover:border-honey/60 hover:bg-cream/10"
            >
              <span className="font-medium">{s.label}</span>
              <span className="text-cream/60">{s.handle}</span>
            </a>
          ))}
        </div>

        {/* Newsletter signup */}
        <div className="mt-10 w-full rounded-3xl border border-cream/15 bg-cream/5 p-6">
          <p className="font-display text-[0.65rem] uppercase tracking-[0.28em] text-honey">
            Stay in touch
          </p>
          <p className="mt-2 font-serif text-lg">
            Sign up for updates & resources
          </p>

          <form
            onSubmit={subscribe}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 rounded-full bg-cream/10 px-5 py-3 text-sm text-cream placeholder:text-cream/50 outline-none ring-1 ring-inset ring-cream/20 focus:ring-honey"
            />
            <button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              className="rounded-full bg-honey px-6 py-3 text-sm font-medium text-accent-foreground transition hover:brightness-95 disabled:opacity-60"
            >
              {status === "sent"
                ? "Thank you"
                : status === "sending"
                  ? "Signing up…"
                  : "Sign up"}
            </button>
          </form>

          {status === "sent" && (
            <p className="mt-3 text-xs text-cream/70">
              You're on the list. We'll be in touch soon.
            </p>
          )}
          {status === "error" && (
            <p className="mt-3 text-xs text-cream/70">
              That didn't go through. Email{" "}
              <a href={`mailto:${KELLY_EMAIL}`} className="text-honey underline">
                {KELLY_EMAIL}
              </a>{" "}
              instead.
            </p>
          )}
        </div>

        <a
          href="/"
          className="mt-8 text-xs uppercase tracking-[0.22em] text-cream/50 hover:text-cream/80"
        >
          reallifehealing.care
        </a>
      </div>
    </section>
  );
}
