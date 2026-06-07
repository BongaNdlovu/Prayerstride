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
    <p><strong>Effective date:</strong> 6 June 2026</p>
    <p>PrayerStride is an independently operated prayer app. Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>. ${SERVICE_ADDRESS}. This policy explains how we process personal information under South Africa's Protection of Personal Information Act, 2013 (POPIA).</p>
    <h2>Who may use PrayerStride</h2>
    <p>PrayerStride is intended for users aged <strong>18 and older</strong>. We do not knowingly collect data from users under 18.</p>
    <h2>Information we collect</h2>
    <ul>
      <li>Account details: email, display name, date of birth, profile photo, and optional church information.</li>
      <li>Community content: prayer requests, answered-prayer status, reports, blocks, notifications, and calendar entries you submit or create.</li>
      <li>Device and technical data: push notification tokens, platform identifiers, usage logs, security logs, and API request metadata.</li>
    </ul>
    <h2>How we use information</h2>
    <p>We use personal information to create and secure accounts, verify that users are 18 or older, provide community prayer features, send opted-in notifications, moderate harmful content, respond to support requests, maintain legal records, and protect the service.</p>
    <h2>Legal basis and consent</h2>
    <p>We process information to perform the app service, comply with legal obligations, protect legitimate community safety interests, and rely on consent where required, including notification preferences and acceptance of the current Terms and Privacy Policy.</p>
    <h2>Operators and recipients</h2>
    <p>We do not sell personal information. We use service providers such as Google Firebase, Cloudflare, Expo, and email or notification providers to host, authenticate, store, secure, and deliver the service.</p>
    <h2>Security safeguards</h2>
    <p>We use authentication, access controls, server-side validation, moderation controls, rate limiting, restricted admin routes, and deletion workflows. No system can be guaranteed perfectly secure.</p>
    <h2>Retention and deletion</h2>
    <p>You may delete your account in the app. Deletion removes profile, prayer, session, calendar, notification, device-token, block, and related records where technically possible. Operational deletion records may be retained for up to 30 days for security and audit before automatic purge.</p>
    <h2>Your rights</h2>
    <p>You may request access, correction, deletion, objection to processing, or information about recipients of your personal information by emailing <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>. South African users may lodge complaints with the Information Regulator at <a href="https://inforegulator.org.za">inforegulator.org.za</a>.</p>
    <h2>Security compromise notice</h2>
    <p>If a security compromise affects your personal information, we will notify affected users and/or the Information Regulator where POPIA requires it.</p>
  `);
}

export function termsPageHtml() {
  return pageShell('Terms and Conditions', `
    <h1>Terms and Conditions</h1>
    <p><strong>Effective date:</strong> 6 June 2026</p>
    <p>By creating an account or using PrayerStride, you agree to these Terms and Conditions and the Privacy Policy. If you do not agree, do not use the app.</p>
    <h2>Ownership and licence</h2>
    <p>PrayerStride is proprietary software. You receive a limited, personal, revocable, non-transferable licence to use the app. You may not copy, redistribute, reverse engineer, scrape, disrupt, or misuse the service.</p>
    <h2>Eligibility</h2>
    <p>PrayerStride is for users aged 18 or older. You must provide accurate registration information and keep your account secure.</p>
    <h2>Community conduct</h2>
    <p>Treat members with dignity. Do not post harassment, hate speech, threats, spam, unlawful content, explicit content, false information, or private information about another person without permission.</p>
    <h2>Prayer content and privacy</h2>
    <p>You are responsible for prayer requests, answered-prayer updates, reports, calendar entries, and profile content you submit. Hidden/private content must still comply with these terms. Do not use PrayerStride for emergencies; contact local emergency services or a trusted professional when immediate help is needed.</p>
    <h2>User-generated content licence</h2>
    <p>You keep ownership of your content. You grant PrayerStride a non-exclusive, worldwide licence to host, display, transmit, back up, moderate, and delete your content as needed to operate and protect the service.</p>
    <h2>Moderation</h2>
    <p>We may remove content, restrict features, suspend accounts, delete accounts, or report unlawful conduct where needed to protect users, comply with law, or enforce these terms. Contact <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> to ask for a review.</p>
    <h2>POPIA and privacy</h2>
    <p>You agree that PrayerStride may process your personal information as described in the Privacy Policy for account creation, age verification, community safety, notifications, support, legal compliance, and service operation. You must not submit another person's personal information unless you have a lawful basis to do so.</p>
    <h2>No professional advice</h2>
    <p>PrayerStride is a prayer and community support tool. It does not provide medical, legal, counselling, financial, or emergency advice.</p>
    <h2>Availability and changes</h2>
    <p>The app may change, pause, or experience outages. We may update these terms and will require acceptance of material updates where appropriate.</p>
    <h2>Liability</h2>
    <p>To the fullest extent allowed by South African law, PrayerStride is provided as is, and liability is limited to direct losses caused by proven unlawful conduct or gross negligence.</p>
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
      <li>Profile, prayers, sessions, calendar entries, notifications, and device tokens.</li>
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
