/**
 * SecureContactForm
 * Real. Life Healing — Hushmail Secure Forms embed wrapper
 *
 * Why this exists instead of pasting the raw Hushmail snippet into a page:
 *
 * 1. A <script> tag rendered by React never executes. If the snippet is
 *    placed in JSX or injected with dangerouslySetInnerHTML, the browser
 *    parses it and moves on. The script must be appended imperatively.
 * 2. The embed does not re-initialize on client-side navigation, so the form
 *    silently fails to appear on any route change after the first load.
 * 3. The embed injects its markup after load, shifting the page on the most
 *    important element on the site. The container reserves height.
 * 4. If hushforms.com is slow, blocked by a privacy extension, or unreachable
 *    on a corporate network, the raw embed leaves an empty div and the primary
 *    conversion path vanishes with no explanation.
 *
 * Hushmail publishes no re-init function for the embed, so this removes and
 * re-appends the script on mount. That is the standard approach for embeds
 * without an init API. If their support confirms a global initializer exists,
 * call it in the effect instead — it avoids re-fetching the script.
 */

import { useEffect, useRef, useState } from 'react';
import styles from './SecureContactForm.module.css';

const EMBED_ID = 'reallifehealing-secure-contact-form';
const SCRIPT_SRC = 'https://hushforms.com/f/public/javascript/embed-hush-form.js';
const SCRIPT_ID = 'hush-form-embed-script';

/** How long to wait before deciding the embed is not coming. */
const FALLBACK_TIMEOUT_MS = 8000;

type EmbedState = 'loading' | 'ready' | 'unavailable';

export interface SecureContactFormProps {
  /**
   * Reserved height in pixels while the embed loads, to prevent layout shift.
   * Measure the rendered form once it is live and set this to match.
   */
  reservedHeight?: number;
  /** Extra class on the outer wrapper, for page-level spacing. */
  className?: string;
  /** Fires once the embed has injected its markup. */
  onReady?: () => void;
  /** Fires if the embed fails to load within the timeout. */
  onUnavailable?: () => void;
}

export function SecureContactForm({
  reservedHeight = 620,
  className,
  onReady,
  onUnavailable,
}: SecureContactFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<EmbedState>('loading');

  // Keep callbacks in a ref so they don't re-trigger the effect.
  const callbacks = useRef({ onReady, onUnavailable });
  callbacks.current = { onReady, onUnavailable };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: number | undefined;
    let settled = false;

    const settle = (next: EmbedState) => {
      if (settled) return;
      settled = true;
      setState(next);
      observer.disconnect();
      if (timeoutId) window.clearTimeout(timeoutId);
      if (next === 'ready') callbacks.current.onReady?.();
      if (next === 'unavailable') callbacks.current.onUnavailable?.();
    };

    // Watch for the embed injecting its own markup into the container.
    const observer = new MutationObserver(() => {
      if (container.childElementCount > 0) settle('ready');
    });
    observer.observe(container, { childList: true, subtree: true });

    // Remove any previous instance so the embed re-runs on route change.
    document.getElementById(SCRIPT_ID)?.remove();

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onerror = () => settle('unavailable');
    document.body.appendChild(script);

    timeoutId = window.setTimeout(() => {
      if (container.childElementCount === 0) settle('unavailable');
    }, FALLBACK_TIMEOUT_MS);

    return () => {
      settled = true;
      observer.disconnect();
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  const wrapperClass = className ? `${styles.root} ${className}` : styles.root;

  return (
    <div
      className={wrapperClass}
      style={{ '--rlh-form-min-height': `${reservedHeight}px` } as React.CSSProperties}
    >
      <div className={state === 'unavailable' ? undefined : styles.reserve}>
        {state === 'loading' && (
          <p role="status" aria-live="polite" className={styles.status}>
            Loading the secure form&hellip;
          </p>
        )}

        {/* Hushmail replaces the contents of this node. */}
        <div
          ref={containerRef}
          className={styles.embed}
          data-secure-form={EMBED_ID}
          data-secure-form-transparent-background="true"
        />

        {state === 'unavailable' && (
          <div className={styles.fallback}>
            <p className={styles.fallbackLead}>
              The secure form isn&rsquo;t loading right now. You can still reach
              Kelly directly.
            </p>
            <p>
              <a className={styles.link} href="tel:+13179183195">
                Call or text 1-317-918-3195
              </a>
            </p>
            <p>
              Already a client?{' '}
              <a
                className={styles.link}
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
        Crisis guidance lives in our own markup, never inside the embed, so it
        renders even when the third-party script fails entirely.
      */}
      <p className={styles.crisis}>
        If you&rsquo;re in crisis or thinking about harming yourself, call or
        text <strong>988</strong> (Suicide &amp; Crisis Lifeline) or dial{' '}
        <strong>911</strong>. This form is not monitored around the clock.
      </p>
    </div>
  );
}

export default SecureContactForm;
