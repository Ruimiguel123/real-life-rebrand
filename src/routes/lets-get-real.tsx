import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/lets-get-real")({
  head: () => ({
    meta: [
      { title: "Let's Get Real — Real Life Healing" },
      {
        name: "description",
        content:
          "Notes, updates, and honest reflections on therapy, healing, and real life — from Kelly Day, LMHC.",
      },
      { property: "og:title", content: "Let's Get Real — Real Life Healing" },
      {
        property: "og:description",
        content: "Honest notes on therapy, healing, and real life.",
      },
    ],
  }),
  component: LetsGetReal,
});

const posts = [
  {
    tag: "On practice",
    title: "What client-centered actually means",
    excerpt:
      "A short note on why your goals shape the work — not the other way around.",
    date: "Coming soon",
  },
  {
    tag: "On trauma",
    title: "EMDR, in plain language",
    excerpt:
      "How EMDR works, what a session feels like, and who it tends to help most.",
    date: "Coming soon",
  },
  {
    tag: "On grief",
    title: "Grief doesn't move in a line",
    excerpt:
      "Why the stages model can mislead, and what a more honest map looks like.",
    date: "Coming soon",
  },
];

function LetsGetReal() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <section className="bg-cream">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="font-display text-xs uppercase tracking-[0.32em] text-honey">
            The Real Deal
          </p>
          <h1 className="mt-6 font-serif text-5xl text-evergreen md:text-6xl">
            Let's get <em>real</em>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg text-forest">
            Honest notes on therapy, healing, and everyday life — plus updates,
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
                <span className="mt-6 text-xs uppercase tracking-[0.22em] text-forest/60">
                  {post.date}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-evergreen text-cream">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="font-display text-xs uppercase tracking-[0.32em] text-honey">
            Stay in touch
          </p>
          <h2 className="mt-4 font-serif text-4xl">
            Subscribe for updates & resources
          </h2>
          <p className="mt-4 font-serif text-lg italic text-cream/80">
            Occasional notes — never spam.
          </p>

          <form
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSubmitted(true);
            }}
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
              className="rounded-full bg-honey px-6 py-3 text-sm font-medium text-accent-foreground transition hover:brightness-95"
            >
              {submitted ? "Thank you" : "Sign up"}
            </button>
          </form>

          {submitted && (
            <p className="mt-4 text-sm text-cream/70">
              We'll be in touch soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
