// ---------------------------------------------------------------
// Site integrations — this is the ONLY file you need to edit
// when Kelly hands over her real URLs.
// ---------------------------------------------------------------

// From SimplePractice: Settings → Client Portal → shareable link.
// Booking URL = the "Request appointment" link for new clients.
// Portal URL  = the client portal sign-in link for existing clients.
export const SIMPLEPRACTICE_BOOKING_URL = "https://kelly-day.clientsecure.me";
export const SIMPLEPRACTICE_PORTAL_URL = "https://kelly-day.clientsecure.me";

// Make.com custom webhook. Handles BOTH the appointment form and the
// newsletter signup — the payload includes a `type` field
// ("appointment" | "newsletter") so a Router in Make can branch.
export const CONTACT_WEBHOOK_URL = "";

// Where appointment requests land if the webhook isn't set up yet.
export const KELLY_EMAIL = "kelly.daylmhc@gmail.com";

// SimplePractice appointment-request widget (public identifiers, not secrets)
export const SP_WIDGET = {
  scopeId: "c90d2fb2-d0cf-4f5e-a53f-5a6c25139c44",
  scopeUri: "kelly-day",
  applicationId:
    "7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b",
  scriptSrc: "https://widget-cdn.simplepractice.com/assets/integration-1.0.js",
};

export const isConfigured = (url: string) => Boolean(url) && url !== "#";

// Set this once the site has its real domain (e.g. "https://reallifehealing.info").
// Used for canonical URLs and structured data. Leave "" until then.
export const SITE_URL = "https://reallifehealing.info";
