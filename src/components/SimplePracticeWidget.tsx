import { useEffect } from "react";
import { SIMPLEPRACTICE_BOOKING_URL, SP_WIDGET } from "@/config/simplepractice";

/**
 * SimplePractice "Request Appointment" widget, restyled to the brand.
 * The script opens SimplePractice's booking overlay; if it ever fails to
 * load, the button still works as a plain link to the booking page.
 */
export function SimplePracticeWidget({ className = "" }: { className?: string }) {
  useEffect(() => {
    if (document.querySelector(`script[src="${SP_WIDGET.scriptSrc}"]`)) return;
    const script = document.createElement("script");
    script.src = SP_WIDGET.scriptSrc;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <a
      href={SIMPLEPRACTICE_BOOKING_URL}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-honey px-6 py-3 text-sm font-medium text-accent-foreground transition hover:brightness-95 ${className}`}
      data-spwidget-scope-id={SP_WIDGET.scopeId}
      data-spwidget-scope-uri={SP_WIDGET.scopeUri}
      data-spwidget-application-id={SP_WIDGET.applicationId}
      data-spwidget-type="OAR"
      data-spwidget-scope-global="true"
      data-spwidget-autobind="true"
    >
      Request appointment
      <span aria-hidden>→</span>
    </a>
  );
}
