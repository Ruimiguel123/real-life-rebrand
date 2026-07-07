import { useState } from "react";
import {
  CONTACT_WEBHOOK_URL,
  KELLY_EMAIL,
  isConfigured,
} from "@/config/simplepractice";

type Status = "idle" | "sending" | "sent" | "error";

async function postToWebhook(payload: Record<string, string>) {
  // First try a normal fetch; if CORS blocks the response, retry
  // opaque (no-cors) — Make still receives the data either way.
  try {
    const res = await fetch(CONTACT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  } catch {
    await fetch(CONTACT_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });
  }
}

export function AppointmentForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    contactPref: "Email",
    message: "",
  });

  const update =
    (field: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const mailtoFallback = () => {
    const subject = encodeURIComponent("Appointment Request — Website");
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nPreferred contact: ${form.contactPref}\n\n${form.message}`,
    );
    window.location.href = `mailto:${KELLY_EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured(CONTACT_WEBHOOK_URL)) {
      mailtoFallback();
      return;
    }
    setStatus("sending");
    try {
      await postToWebhook({
        type: "appointment",
        name: form.name,
        email: form.email,
        phone: form.phone,
        contactPref: form.contactPref,
        message: form.message,
        page: typeof window !== "undefined" ? window.location.pathname : "",
        submittedAt: new Date().toISOString(),
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-cream p-10 text-center text-evergreen shadow-sm">
        <span className="font-display text-xs uppercase tracking-[0.28em] text-honey">
          Request received
        </span>
        <p className="mt-4 font-serif text-2xl">Thank you for reaching out.</p>
        <p className="mt-3 max-w-sm text-sm text-forest/85">
          Kelly personally reads every request and will get back to you within
          1–2 business days to set up a first conversation.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl bg-cream p-8 text-evergreen shadow-sm"
    >
      <div>
        <span className="text-xs uppercase tracking-[0.22em] text-forest/70">
          New client
        </span>
        <h3 className="mt-2 font-serif text-2xl">Request an appointment</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-forest/80">Name</span>
          <input
            required
            value={form.name}
            onChange={update("name")}
            autoComplete="name"
            className="rounded-xl border border-border/70 bg-white px-4 py-2.5 outline-none focus:border-honey focus:ring-1 focus:ring-honey"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-forest/80">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={update("email")}
            autoComplete="email"
            className="rounded-xl border border-border/70 bg-white px-4 py-2.5 outline-none focus:border-honey focus:ring-1 focus:ring-honey"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-forest/80">Phone (optional)</span>
          <input
            type="tel"
            value={form.phone}
            onChange={update("phone")}
            autoComplete="tel"
            className="rounded-xl border border-border/70 bg-white px-4 py-2.5 outline-none focus:border-honey focus:ring-1 focus:ring-honey"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-forest/80">Preferred contact</span>
          <select
            value={form.contactPref}
            onChange={update("contactPref")}
            className="rounded-xl border border-border/70 bg-white px-4 py-2.5 outline-none focus:border-honey focus:ring-1 focus:ring-honey"
          >
            <option>Email</option>
            <option>Phone call</option>
            <option>Text message</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-forest/80">
          What brings you here? A few sentences is plenty.
        </span>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={update("message")}
          className="rounded-xl border border-border/70 bg-white px-4 py-2.5 outline-none focus:border-honey focus:ring-1 focus:ring-honey"
        />
      </label>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 inline-flex items-center justify-center gap-2 self-start rounded-full bg-honey px-6 py-3 text-sm font-medium text-accent-foreground transition hover:brightness-95 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send request"}
        <span aria-hidden>→</span>
      </button>

      {status === "error" && (
        <p className="text-sm text-forest">
          The request didn't go through.{" "}
          <button
            type="button"
            onClick={mailtoFallback}
            className="text-honey underline"
          >
            Email Kelly directly instead
          </button>
          .
        </p>
      )}

      <p className="mt-2 text-xs leading-relaxed text-forest/60">
        This form is for scheduling only — please don't include detailed
        health information here. If you're in crisis or thinking about harming
        yourself, call or text 988 (Suicide &amp; Crisis Lifeline) or dial 911.
      </p>
    </form>
  );
}
