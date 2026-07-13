import { createFileRoute } from "@tanstack/react-router";
import { BeginYourCare } from "@/components/BeginYourCare";
import { InsuranceBanner } from "@/components/InsuranceBanner";

export const Route = createFileRoute("/getting-started")({
  head: () => ({
    meta: [
      { property: "og:url", content: "https://reallifehealing.info/getting-started" },
      { title: "Getting Started — Real. Life Healing" },
      {
        name: "description",
        content:
          "How to begin therapy with Real. Life Healing. Request an appointment, meet Kelly Day, LMHC, and start affordable telehealth counseling in Indiana.",
      },
      { property: "og:title", content: "Getting Started — Real. Life Healing" },
      {
        property: "og:description",
        content: "Three simple steps to begin affordable telehealth therapy in Indiana.",
      },
    ],
    links: [{ rel: "canonical", href: "https://reallifehealing.info/getting-started" }],
  }),
  component: GettingStarted,
});

const steps = [
  {
    n: "01",
    title: "Reach out",
    body: "Send an appointment request or use the client portal. Share what's on your mind — a few sentences is plenty.",
  },
  {
    n: "02",
    title: "A warm first call",
    body: "We'll meet for a short consultation to make sure it's a good fit, answer questions, and choose a time to begin.",
  },
  {
    n: "03",
    title: "Begin your work",
    body: "Sessions happen securely online. We collaborate on your goals and adjust the plan as real life unfolds.",
  },
];

function GettingStarted() {
  return (
    <>
      <section className="bg-cream">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="font-display text-xs uppercase tracking-[0.32em] text-honey">
            Getting started
          </p>
          <h1 className="mt-6 font-serif text-5xl text-evergreen md:text-6xl">
            A gentle way to <em>begin</em>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg text-forest">
            Beginning therapy can feel like a lot. Real. Life Healing keeps it
            simple, warm, and affordable — telehealth care built around your
            real life.
          </p>
        </div>
      </section>

      <InsuranceBanner />

      <section className="bg-sand/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.n}
                className="rounded-3xl bg-cream p-8 shadow-sm"
              >
                <span className="font-display text-sm tracking-[0.28em] text-honey">
                  {step.n}
                </span>
                <h3 className="mt-4 font-serif text-2xl text-evergreen">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-forest">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-24 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl text-evergreen">
              Who I work with
            </h2>
            <p className="mt-4 text-forest">
              Individuals, couples, and families across Indiana experiencing
              emotional or psychological difficulties — anxiety, depression,
              trauma, grief, and relationship strain. The practice is
              multiculturally sensitive and gender-affirming; people of every
              background and identity are welcome here.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-3xl text-evergreen">
              What sessions look like
            </h2>
            <p className="mt-4 text-forest">
              Secure video telehealth from anywhere in Indiana. Sessions
              typically run 50 minutes. We use CBT as our foundation, adding
              EMDR or trauma-informed approaches when they'll help you most.
            </p>
          </div>
        </div>
      </section>

      <BeginYourCare />
    </>
  );
}
