import { Link } from "@tanstack/react-router";

// Two areas of focus Kelly asked to call out on the site (September 2026).
// Rendered on the homepage between "Approach" and "Online therapy".
// Wording is deliberately about counseling *support through* these
// experiences — Kelly is a counselor, not a medical provider, so the copy
// must never read as treating a medical condition.
const focusAreas = [
  {
    kicker: "Friends & family",
    title: "Support for the people doing the caring",
    intro:
      "Loving someone through dementia, Alzheimer's disease, or addiction is its own kind of grief, and it is easy to disappear inside it. This is a space for the spouses, children, siblings, and friends carrying that weight.",
    items: [
      "Caring for a parent or partner living with dementia or Alzheimer's",
      "Loving someone in active addiction or early recovery",
      "Anticipatory grief, guilt, and caregiver burnout",
      "Setting boundaries while staying connected",
      "Making hard decisions about care as a family",
    ],
  },
  {
    kicker: "Women's health",
    title: "Counseling through every season of a woman's life",
    intro:
      "Hormones, bodies, and identity shift across a lifetime, and the emotional side rarely gets the attention it deserves. Kelly offers a steady place to process what your body and your life are asking of you.",
    items: [
      "Postpartum depression and the transition to motherhood",
      "Premenopause, perimenopause, menopause, and postmenopause",
      "Menstrual cycles and the mood changes that ride with them",
      "Hormone replacement therapy (HRT) and the emotional adjustment around it",
      "Puberty and coming into your body as a young woman (ages 16+)",
      "Living with a breast, cervical, or uterine cancer diagnosis",
    ],
  },
];

export function AreasOfFocus() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <p className="font-display text-base uppercase tracking-[0.32em] text-honey md:text-lg">
            Areas of focus
          </p>
          <h2 className="mt-4 font-serif text-4xl text-evergreen md:text-5xl">
            Specialized support for <em className="text-honey">real life</em>.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-forest">
            Alongside individual, couples, and family counseling, Kelly holds
            dedicated space for two experiences that often go unspoken.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {focusAreas.map((area) => (
            <article
              key={area.kicker}
              className="flex flex-col rounded-3xl bg-sand/60 p-8 text-evergreen md:p-10"
            >
              <p className="font-display text-[0.65rem] uppercase tracking-[0.28em] text-honey">
                {area.kicker}
              </p>
              <h3 className="mt-3 font-serif text-2xl leading-snug md:text-3xl">
                {area.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-forest">
                {area.intro}
              </p>
              <ul className="mt-6 grid gap-3 text-sm">
                {area.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-border/60 bg-cream px-4 py-3 text-forest"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-honey" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-forest/80">
          Counseling supports the emotional side of these experiences and works
          alongside, not in place of, your medical care.{" "}
          <Link
            to="/getting-started"
            hash="begin"
            className="text-honey hover:underline"
          >
            Reach out to talk it through.
          </Link>
        </p>
      </div>
    </section>
  );
}
