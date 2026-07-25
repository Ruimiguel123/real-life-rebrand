/**
 * SecureContactForm
 * Real. Life Healing — Hushmail Secure Forms embed wrapper
 *
 * Why this component exists instead of pasting the raw embed into a page:
 *
 * 1. A <script> tag rendered by React never executes. If the Hushmail snippet
 *    is placed in JSX or injected with dangerouslySetInnerHTML, the browser
 *    parses it but will not run it. The script must be appended to the
 *    document imperatively.
 * 2. On client-side route changes the embed does not re-initialize, so the
 *    form silently fails to appear on any navigation after the first.
 * 3. The embed injects its markup after load, which shifts the page on the
 *    single most important element on the site. The container reserves height.
 * 4. If hushforms.com is slow, blocked by a privacy extension, or unreachable
 *    on a corporate network, the container renders empty and the primary
 *    conversion path disappears with no explanation. This falls back to the
 *    phone number and the client portal instead.
 *
 * Hushmail does not document a public re-init function for the embed, so this
 * removes and re-appends the script on mount. That is the pragmatic approach
 * for embeds without an init API. If Hushmail support confirms a global
 * initializer exists, call that in the effect instead — it is cheaper.
 */

import { useEffect, useRef, useState } from 'react';

const EMBED_ID = 'reallifehealing-secure-contact-form';
const SCRIPT_SRC = 'https://hushforms.com/f/public/javascript/embed-hush-form.js';
const SCRIPT_ID = 'hush-form-embed-script';

/** How long to wait before deciding the embed is not coming. */
const FALLBACK_TIMEOUT_MS = 8000;

/** Reserved height, tuned to the rendered form. Measure and adjust once live. */
const RESERVED_HEIGHT = 620;

type EmbedState = 'loading' | 'ready' | 'unavailable';

export function SecureContactForm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<EmbedState>('loading');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: number | undefined;

    // Watch for the embed injecting its own markup into the container.
    const observer = new MutationObserver(() => {
      if (container.childElementCount > 0) {
        setState('ready');
        observer.disconnect();
        if (timeoutId) window.clearTimeout(timeoutId);
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    // Remove any previous instance so the embed re-runs on route change.
    document.getElementById(SCRIPT_ID)?.remove();

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onerror = () => {
      setState('unavailable');
      observer.disconnect();
    };
    document.body.appendChild(script);

    timeoutId = window.setTimeout(() => {
      // Only give up if nothing was ever injected.
      if (container.childElementCount === 0) {
        setState('unavailable');
        observer.disconnect();
      }
    }, FALLBACK_TIMEOUT_MS);

    return () => {
      observer.disconnect();
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="secure-contact-form">
      {/* Reserved space prevents the page from jumping when the form loads. */}
      <div
        style={{ minHeight: state === 'unavailable' ? undefined : RESERVED_HEIGHT }}
      >
        {state === 'loading' && (
          <p role="status" aria-live="polite" className="secure-contact-form__status">
            Loading the secure form&hellip;
          </p>
        )}

        <div
          ref={containerRef}
          data-secure-form={EMBED_ID}
          data-secure-form-transparent-background="true"
        />

        {state === 'unavailable' && (
          <div className="secure-contact-form__fallback">
            <p>
              The secure form isn&rsquo;t loading right now. You can still reach
              Kelly directly:
            </p>
            <p>
              <a href="tel:+13179183195">Call or text 1-317-918-3195</a>
            </p>
            <p>
              Already a client?{' '}
              <a
                href="https://kelly-day.clientsecure.me"
                rel="noopener noreferrer"
              >
                Sign in to the client portal
              </a>
            </p>
          </div>
        )}
      </div>

      {/*
        Crisis guidance stays in your own markup, never inside the embed —
        it must render even when the third-party script fails.
      */}
      <p className="secure-contact-form__crisis">
        If you&rsquo;re in crisis or thinking about harming yourself, call or
        text 988 (Suicide &amp; Crisis Lifeline) or dial 911. This form is not
        monitored around the clock.
      </p>
    </div>
  );
}

export default SecureContactForm;
