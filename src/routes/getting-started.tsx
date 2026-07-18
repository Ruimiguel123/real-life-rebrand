import { createFileRoute } from "@tanstack/react-router";
import beautifulDestinations from "@/assets/beautiful-destinations.jpg";
import { BeginYourCare } from "@/components/BeginYourCare";
import { InsuranceBanner } from "@/components/InsuranceBanner";

const faqs = [
  {
    q: "Does insurance cover online therapy in Indiana?",
    a: "In most cases, yes. Real. Life Healing is in-network with Aetna, Anthem Blue Cross Blue Shield, United HealthCare, Optum, and Skai BCBS, and works with Employee Assistance Programs including Anthem EAP. Coverage is verified before your first session so there are no surprises.",
  },
  {
    q: "What if I don't have insurance?",
    a: "Kelly offers reduced-fee sessions through Open Path Collective, a nonprofit network for affordable therapy. Reach out and we'll find a rate that works with your budget.",
  },
  {
    q: "What ages do you work with?",
    a: "Individual sessions are available for ages 16 and up. Family and group sessions are also available.",
  },
  {
    q: "Is online therapy as effective as meeting in person?",
    a: "For many concerns, including anxiety, depression, grief, and trauma, research has found telehealth therapy comparably effective to in-person care. Many clients find it easier to open up from the comfort of their own space.",
  },
  {
    q: "Is my session private?",
    a: "Yes. Sessions take place over a secure, HIPAA-compliant video platform through SimplePractice, and scheduling and messaging happen through the same protected client portal.",
  },
];

const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

export const Route = createFileRoute("/getting-started")({
  head: () => ({
    meta: [
      { property: "og:url", content: "https://reallifehealing.info/getting-started" },
      { title: "Getting Started: Online Therapy in Indiana | Real. Life Healing" },
      {
        name: "description",
        content:
          "How to begin therapy with Real. Life Healing. Request an appointment, meet Kelly Day, LMHC, and start affordable telehealth counseling in Indiana.",
      },
      { property: "og:title", content: "Getting Started | Real. Life Healing" },
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
    body: "Send an appointment request or use the client portal. Share what's on your mind. A few sentences is plenty.",
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
          <p className="font-display text-base uppercase tracking-[0.32em] text-honey md:text-lg">
            Getting started
          </p>
          <h1 className="mt-6 font-serif text-5xl text-evergreen md:text-6xl">
            A gentle way to <em>begin</em>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg text-forest">
            Beginning therapy can feel like a lot. Real. Life Healing keeps it
            simple, warm, and affordable: telehealth care built around your
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
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1fr_1fr_0.8fr] md:items-center">
          <div>
            <h2 className="font-serif text-3xl text-evergreen md:text-4xl">
              Who I work with: telehealth counseling across Indiana
            </h2>
            <p className="mt-4 text-forest">
              Individuals, couples, and families across Indiana experiencing
              emotional or psychological difficulties: anxiety, depression,
              trauma, grief, and relationship strain. The practice is
              multiculturally sensitive and gender-affirming; people of every
              background and identity are welcome here.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-3xl text-evergreen md:text-4xl">
              What sessions look like
            </h2>
            <p className="mt-4 text-forest">
              Secure video telehealth from anywhere in Indiana: Indianapolis, Fort Wayne, Evansville, South Bend, Bloomington, and every community between. Sessions
              typically run 45 to 60 minutes. We use CBT as our foundation, adding
              EMDR or trauma-informed approaches when they'll help you most.
            </p>
          </div>
          <img
            src={beautifulDestinations}
            alt="Letter board reading 'difficult roads lead to beautiful destinations' beside a young plant"
            width={1147}
            height={1400}
            className="h-72 w-full rounded-3xl object-cover shadow-sm md:h-96"
            loading="lazy"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <p className="text-center font-display text-base uppercase tracking-[0.32em] text-honey md:text-lg">
            Common questions
          </p>
          <h2 className="mt-4 text-center font-serif text-3xl text-evergreen md:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 flex flex-col gap-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl bg-sand/60 px-6 py-4 text-evergreen"
              >
                <summary className="cursor-pointer list-none font-serif text-lg marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    {f.q}
                    <span
                      aria-hidden
                      className="text-honey transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-forest">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqJsonLd }}
        />
      </section>

      <BeginYourCare />
    </>
  );
}
