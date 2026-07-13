const insurances = [
  "Aetna",
  "Anthem Blue Cross Blue Shield",
  "United HealthCare",
  "Optum",
  "Skai BCBS",
];

const eaps = ["Anthem EAP", "Employee Assistance Programs (EAP)"];

function PillGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mt-8">
      <p className="font-display text-[0.65rem] uppercase tracking-[0.28em] text-cream/60">
        {label}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        {items.map((name) => (
          <span
            key={name}
            className="inline-flex items-center rounded-full border border-cream/20 bg-cream/10 px-5 py-2 text-sm font-medium text-cream"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function InsuranceBanner() {
  return (
    <section className="bg-evergreen text-cream">
      <div className="mx-auto max-w-5xl px-6 py-16 text-center md:py-20">
        <p className="font-display text-xs uppercase tracking-[0.32em] text-honey">
          Insurance accepted
        </p>
        <h2 className="mt-4 font-serif text-3xl md:text-4xl">
          Kelly works with your budget
        </h2>
        <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-cream/85">
          Real. Life Healing is an in-network provider with major carriers. Coverage
          is verified before your first session so there are no surprises.
        </p>

        <PillGroup label="Insurance" items={insurances} />
        <PillGroup label="Employee Assistance Programs" items={eaps} />

        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-honey/40 bg-cream/5 px-6 py-5">
          <p className="font-display text-[0.65rem] uppercase tracking-[0.28em] text-honey">
            No insurance?
          </p>
          <p className="mt-2 text-sm text-cream/85">
            Kelly offers reduced-fee sessions through{" "}
            <a
              href="https://openpathcollective.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-honey hover:underline"
            >
              Open Path Collective
            </a>
            .
          </p>
        </div>

        <p className="mt-6 text-xs text-cream/60">
          Not sure if your plan covers therapy? Reach out and we’ll check together.
        </p>
      </div>
    </section>
  );
}
