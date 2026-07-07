import { createFileRoute, Link } from "@tanstack/react-router";
import sanctuaryMark from "@/assets/sanctuary-mark.png";
import heroSanctuary from "@/assets/hero-sanctuary.jpg";
import { BeginYourCare } from "@/components/BeginYourCare";
import { InsuranceBanner } from "@/components/InsuranceBanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Real Life Healing — Therapy & Counseling in Indiana" },
      {
        name: "description",
        content:
          "Client-centered CBT, EMDR, trauma and grief counseling with Kelly Day, LMHC, NCC. Real, affordable telehealth for individuals, couples, and families across Indiana.",
      },
      { property: "og:title", content: "Real Life Healing — Therapy in Indiana" },
      {
        property: "og:description",
        content: "Healing happens in real life. Warm, sincere therapy since 2019.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-evergreen text-cream">
        <img
          src={heroSanctuary}
          alt=""
          width={1600}
          height={1000}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-evergreen/85 via-evergreen/70 to-forest/85" />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1.2fr_1fr] md:py-32">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.32em] text-honey">
              Real Life Healing
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] md:text-7xl">
              Healing happens in <em className="text-honey not-italic md:italic">real life</em>.
            </h1>
            <p className="mt-6 max-w-xl font-serif text-lg text-cream/85 md:text-xl">
              Real, affordable therapy and sincere therapeutic healing —
              serving the State of Indiana since 2019.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/getting-started"
                hash="begin"
                className="inline-flex items-center gap-2 rounded-full bg-honey px-6 py-3 text-sm font-medium text-accent-foreground transition hover:brightness-95"
              >
                Begin your care
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/getting-started"
                className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-6 py-3 text-sm font-medium text-cream transition hover:bg-cream/10"
              >
                How it works
              </Link>
            </div>

            <p className="mt-10 text-xs uppercase tracking-[0.28em] text-cream/60">
              Kelly Day, LMHC, NCC · Telehealth for Indiana
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute h-72 w-72 rounded-full bg-honey/20 blur-3xl" />
            <img
              src={sanctuaryMark}
              alt="The Sanctuary Mark — a stack of balanced stones"
              width={420}
              height={420}
              className="relative h-72 w-72 object-contain md:h-96 md:w-96"
            />
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-cream">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="font-display text-xs uppercase tracking-[0.32em] text-honey">
            Mission
          </p>
          <p className="mt-8 font-serif text-2xl leading-relaxed text-evergreen md:text-3xl">
            To provide high-quality counseling to individuals, couples, and
            families experiencing emotional or psychological difficulties — with
            warmth, respect, and care.
          </p>
        </div>
      </section>

      {/* Approach */}
      <section className="bg-sand/60">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.32em] text-honey">
              Approach
            </p>
            <h2 className="mt-4 font-serif text-4xl text-evergreen md:text-5xl">
              A client-centered practice, rooted in CBT.
            </h2>
            <p className="mt-6 font-serif text-lg leading-relaxed text-forest">
              I work collaboratively with you to identify your goals and develop
              a personalized plan for treatment. Cognitive Behavioral Therapy
              anchors our work, integrated with EMDR and trauma-informed care
              when it's the right fit.
            </p>
            <p className="mt-4 font-serif italic text-forest/85">
              Let's get real.
            </p>
          </div>

          <ul className="grid gap-3 text-sm">
            {[
              "Individuals, couples, and families",
              "Cognitive Behavioral Therapy (CBT)",
              "EMDR for PTSD & Trauma",
              "Grief & bereavement counseling",
              "Trauma-informed care",
              "Secure, private telehealth",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-cream px-5 py-4 text-forest"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-honey" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Credentials */}
      <section className="bg-cream">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.32em] text-honey">
                Meet your therapist
              </p>
              <h2 className="mt-4 font-serif text-4xl text-evergreen">
                Kelly Day, <span className="italic">LMHC, NCC</span>
              </h2>
              <p className="mt-4 text-sm text-forest/80">
                Dedicated to helping clients achieve their goals and improve
                their mental health and well-being.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Certified in EMDR Therapy for PTSD & Trauma",
                "Professional PTSD Counseling Diploma",
                "Certified Trauma-Informed Counselor & Coach",
                "Certified in Grief & Bereavement Counseling",
              ].map((cred) => (
                <div
                  key={cred}
                  className="rounded-2xl bg-sand/60 p-5 text-sm text-evergreen"
                >
                  <span className="font-display text-[0.65rem] uppercase tracking-[0.22em] text-honey">
                    Certified
                  </span>
                  <p className="mt-2 font-serif text-base leading-snug">{cred}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <InsuranceBanner />

      <BeginYourCare />
    </>
  );
}
