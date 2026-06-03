const LEGAL_OPERATOR_NAME = 'PrayerStride';
const SERVICE_ADDRESS = 'Service address available upon lawful request';
const SUPPORT_EMAIL = 'support@prayerstride.app';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function pageShell(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} - PrayerStride</title>
  <style>
    body { font-family: Georgia, serif; background: #0b1220; color: #f5f0e6; margin: 0; line-height: 1.6; }
    main { max-width: 720px; margin: 0 auto; padding: 32px 20px 64px; }
    h1, h2 { color: #d4af37; font-weight: 600; }
    a { color: #d4af37; }
    .note { background: rgba(212,175,55,0.12); border: 1px solid rgba(212,175,55,0.35); padding: 12px 16px; border-radius: 8px; }
    footer { margin-top: 48px; font-size: 14px; opacity: 0.8; }
  </style>
</head>
<body>
  <main>
    ${bodyHtml}
    <footer>
      <p>PrayerStride - ${LEGAL_OPERATOR_NAME} - ${SERVICE_ADDRESS}</p>
      <p>Contact: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      <p class="note">Interim notice for this independently operated startup. Legal counsel review is pending.</p>
    </footer>
  </main>
</body>
</html>`;
}

export function privacyPageHtml() {
  return pageShell('Privacy Policy', `
    <h1>Privacy Policy</h1>
    <p><strong>Effective date:</strong> 31 May 2026</p>
    <p>PrayerStride is an independently operated startup. Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>. ${SERVICE_ADDRESS}. This interim policy explains how we process personal information while formal legal review is pending.</p>
    <h2>Who may use PrayerStride</h2>
    <p>PrayerStride is intended for users aged <strong>18 and older</strong>. We do not knowingly collect data from users under 18.</p>
    <h2>Information we collect</h2>
    <ul>
      <li>Account details: email, display name, date of birth, and optional profile information.</li>
      <li>Community content: prayer requests, testimonies, and reports you submit.</li>
      <li>Device data: push notification tokens and platform identifiers.</li>
      <li>Usage and security logs processed by Google Firebase, Cloudflare, and our API Worker.</li>
    </ul>
    <h2>How we use information</h2>
    <p>We use your information to operate the app, deliver notifications, enforce community safety, respond to support requests, and comply with law.</p>
    <h2>Processors</h2>
    <p>We use Google Firebase for authentication, database, and messaging; Cloudflare for API hosting; and email delivery providers for support communications.</p>
    <h2>Retention and deletion</h2>
    <p>You may delete your account in the app. Deletion removes user-owned content and profile data. Operational deletion records may be retained for up to 30 days for security and audit purposes before automatic purge.</p>
    <h2>Your rights</h2>
    <p>You may request access, correction, deletion, or objection to processing by emailing <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>. South African users may lodge complaints with the Information Regulator.</p>
  `);
}

export function termsPageHtml() {
  return pageShell('Terms of Service', `
    <h1>Terms of Service</h1>
    <p><strong>Effective date:</strong> 31 May 2026</p>
    <p>By using PrayerStride you agree to these terms for the PrayerStride service.</p>
    <h2>Proprietary software</h2>
    <p>PrayerStride is proprietary software. The app, its branding, code, and original materials are not open source and may not be copied, modified, or redistributed without permission.</p>
    <h2>Community standards</h2>
    <p>You are responsible for content you share. We may remove content, suspend accounts, or block interactions that violate these terms or applicable law.</p>
    <h2>User-generated content licence</h2>
    <p>You retain ownership of your content. You grant PrayerStride a non-exclusive licence to host, display, and moderate your content solely to operate the service.</p>
    <h2>Moderation and appeals</h2>
    <p>Automated and human moderation may apply. Contact <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> to appeal moderation actions.</p>
    <h2>Blocking</h2>
    <p>You may block other users. Blocked users cannot interact with you through community features.</p>
    <h2>Disclaimer</h2>
    <p>PrayerStride is a community prayer tool, not medical, legal, or professional advice.</p>
    <h2>Governing law</h2>
    <p>These terms are governed by the laws of the Republic of South Africa.</p>
  `);
}

export function deleteAccountPageHtml() {
  return pageShell('Delete Your Account', `
    <h1>Delete Your PrayerStride Account</h1>
    <h2>In the app</h2>
    <ol>
      <li>Sign in to PrayerStride.</li>
      <li>Open <strong>Profile - Settings</strong>.</li>
      <li>Choose <strong>Delete account</strong>, confirm your password, and submit.</li>
    </ol>
    <h2>By email</h2>
    <p>If you cannot access the app, email <a href="mailto:${SUPPORT_EMAIL}?subject=Account%20deletion%20request">${SUPPORT_EMAIL}</a> from your registered address with the subject "Account deletion request".</p>
    <h2>What is deleted</h2>
    <ul>
      <li>Profile, prayers, testimonies, sessions, calendar entries, notifications, and device tokens.</li>
      <li>Blocks associated with your account.</li>
      <li>Your Firebase authentication record after server-side cleanup completes.</li>
    </ul>
    <h2>Retention</h2>
    <p>Operational deletion job records may be kept for up to 30 days for fraud prevention and audit, then automatically purged.</p>
  `);
}

export function guardianApprovedPageHtml() {
  return pageShell('Guardian Approval Complete', `
    <h1>Guardian approval received</h1>
    <p>Thank you. The linked PrayerStride account may now access community features once the user signs in again.</p>
  `);
}

export function guardianInvalidPageHtml(message) {
  return pageShell('Guardian Approval', `
    <h1>Unable to approve</h1>
    <p>${escapeHtml(message)}</p>
    <p>Contact <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> if you need help.</p>
  `);
}

export function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  });
}
