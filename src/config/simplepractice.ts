// SimplePractice integration URLs.
// Replace these with the real URLs from your SimplePractice account when ready.
// Until then, buttons using these constants fall back to the email appointment
// request (see BeginYourCare component).

export const SIMPLEPRACTICE_BOOKING_URL = "#";
export const SIMPLEPRACTICE_PORTAL_URL = "#";

export const APPOINTMENT_MAILTO =
  "mailto:kelly.daylmhc@gmail.com?subject=Appointment%20Request&body=REQUESTED%20DATE%3A%0AREQUESTED%20TIME%3A%0AREASON%20FOR%20REQUEST%3A";

export const isConfigured = (url: string) => url && url !== "#";
