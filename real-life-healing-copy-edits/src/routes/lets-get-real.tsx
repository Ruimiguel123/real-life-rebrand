import { createFileRoute } from "@tanstack/react-router";
import ripples from "@/assets/ripples.jpg";
import { useState } from "react";
import {
  CONTACT_WEBHOOK_URL,
  KELLY_EMAIL,
  isConfigured,
} from "@/config/simplepractice";

export const Route = createFileRoute("/lets-get-real")({
  head: () => ({
    meta: [
      { property: "og:url", content: "https://reallifehealing.info/lets-get-real" },
      { title: "Let's Get Real | Real. Life Healing" },
      {
        name: "description",
        content:
          "Honest notes on therapy and healing from Kelly Day, LMHC, plus practice updates and mental health resources for Indiana.",
      },
      { property: "og:title", content: "Let's Get Real | Real. Life Healing" },
      {
        property: "og:description",
        content: "Honest notes on therapy, healing, and real life.",
      },
    ],
    links: [{ rel: "canonical", href: "https://reallifehealing.info/lets-get-real" }],
  }),
  component: LetsGetReal,
});

const posts = [
  {
    tag: "On practice",
    title: "What client-centered actually means",
    excerpt:
      "A short note on why your goals shape the work, not the other way around.",
  },
  {
    tag: "On trauma",
    title: "EMDR, in plain language",
    excerpt:
      "How EMDR works, what a session feels like, and who it tends to help most.",
  },
  {
    tag: "On grief",
    title: "Grief doesn't move in a line",
    excerpt:
      "Why the stages model can mislead, and what a more honest map looks like.",
  },
];

function LetsGetReal() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (!isConfigured(CONTACT_WEBHOOK_URL)) {
      // No webhook yet - send the signup to Kelly's inbox so nothing is lost.
      window.location.href = `mailto:${KELLY_EMAIL}?subject=${encodeURIComponent(
        "Newsletter signup",
      )}&body=${encodeURIComponent(`Please add me to the list: ${email}`)}`;
      return;
    }
    setStatus("sending");
    try {
      const payload = JSON.stringify({
        type: "newsletter",
        email,
        submittedAt: new Date().toISOString(),
      });
      try {
        const res = await fetch(CONTACT_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
        if (!res.ok) throw new Error(String(res.status));
      } catch {
        await fetch(CONTACT_WEBHOOK_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: payload,
        });
      }
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <section className="bg-cream">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="font-display text-base uppercase tracking-[0.32em] text-honey md:text-lg">
            The Real Deal
          </p>
          <h1 className="mt-6 font-serif text-5xl text-evergreen md:text-6xl">
            Let's get <em>real</em>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg text-forest">
            Honest notes on therapy, healing, and everyday life, plus updates,
            resources, and the occasional package deal.
          </p>
        </div>
      </section>

      <section className="bg-sand/50">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.title}
                className="group flex flex-col rounded-3xl bg-cream p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="font-display text-[0.65rem] uppercase tracking-[0.28em] text-honey">
                  {post.tag}
                </span>
                <h3 className="mt-4 font-serif text-2xl text-evergreen">
                  {post.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-forest">
                  {post.excerpt}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand/50 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <img
            src={ripples}
            alt="Gentle ripples spreading across calm water"
            width={1800}
            height={1200}
            className="h-56 w-full rounded-3xl object-cover shadow-sm md:h-72"
            loading="lazy"
          />
        </div>
      </section>

      <section className="bg-evergreen text-cream">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="font-display text-base uppercase tracking-[0.32em] text-honey md:text-lg">
            Stay in touch
          </p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">
            Subscribe for updates & resources
          </h2>
          <p className="mt-4 font-serif text-lg italic text-cream/80">
            Occasional notes, never spam.
          </p>

          <form
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={subscribe}
          >
            <input
              type="email"
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
            <p className="mt-4 text-sm text-cream/70">
              You're on the list. We'll be in touch soon.
            </p>
          )}
          {status === "error" && (
            <p className="mt-4 text-sm text-cream/70">
              That didn't go through. Try again, or email{" "}
              <a href={`mailto:${KELLY_EMAIL}`} className="text-honey underline">
                {KELLY_EMAIL}
              </a>
              .
            </p>
          )}
        </div>
      </section>
    </>
  );
}
