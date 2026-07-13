// ---------------------------------------------------------------
// Site integrations — this is the ONLY file you need to edit
// when Kelly hands over her real URLs.
// ---------------------------------------------------------------

// From SimplePractice: Settings → Client Portal → shareable link.
// Booking URL = the "Request appointment" link for new clients.
// Portal URL  = the client portal sign-in link for existing clients.
export const SIMPLEPRACTICE_BOOKING_URL = "#";
export const SIMPLEPRACTICE_PORTAL_URL = "#";

// Make.com custom webhook. Handles BOTH the appointment form and the
// newsletter signup — the payload includes a `type` field
// ("appointment" | "newsletter") so a Router in Make can branch.
export const CONTACT_WEBHOOK_URL = "";

// Where appointment requests land if the webhook isn't set up yet.
export const KELLY_EMAIL = "kelly.daylmhc@gmail.com";

export const isConfigured = (url: string) => Boolean(url) && url !== "#";

// Set this once the site has its real domain (e.g. "https://reallifehealing.info").
// Used for canonical URLs and structured data. Leave "" until then.
export const SITE_URL = "https://reallifehealing.info";
