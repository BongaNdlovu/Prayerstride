import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import BodyText from '../components/BodyText';

export default function PrivacyPolicyScreen({ onBack }) {
  return (
    <ScreenScaffold pageContent>
      <AppHeader title="Privacy Policy" subtitle="How we handle your data." onBack={onBack} />
      <GlassCard>
        <BodyText variant="body">
          Effective date: 6 June 2026
          {'\n\n'}
          PrayerStride is an independently operated prayer app. This policy explains how we process personal information under South Africa's Protection of Personal Information Act, 2013 (POPIA).
          {'\n\n'}
          Information we collect: account details such as email, display name, date of birth, profile photo, optional church information, prayer requests, answered-prayer status, reports, blocks, notifications, calendar entries, device push tokens, usage logs, and security logs.
          {'\n\n'}
          Why we use it: to create and secure accounts, verify that users are 18 or older, provide community prayer features, send opted-in notifications, moderate harmful content, respond to support requests, maintain legal records, and protect the service.
          {'\n\n'}
          Legal basis and consent: We process information to perform the app service, comply with legal obligations, protect legitimate community safety interests, and rely on consent where required, including notification preferences and acceptance of the current Terms and Privacy Policy.
          {'\n\n'}
          Sharing and operators: We do not sell personal information. We use service providers such as Firebase/Google, Cloudflare, Expo, and email or notification providers to host, authenticate, store, secure, and deliver the service.
          {'\n\n'}
          Security safeguards: We use authentication, access controls, server-side validation, moderation controls, rate limiting, restricted admin routes, and deletion workflows. No system can be guaranteed perfectly secure.
          {'\n\n'}
          Retention and deletion: You can delete your account from Settings. Account deletion removes profile, prayer, session, calendar, notification, device-token, block, and related records where technically possible. Operational deletion records may be kept for up to 30 days for audit and security.
          {'\n\n'}
          Your POPIA rights: You may request access, correction, deletion, objection to processing, or information about recipients of your personal information. You may also lodge a complaint with South Africa's Information Regulator.
          {'\n\n'}
          Breach notice: If a security compromise affects your personal information, we will notify affected users and/or the Information Regulator where POPIA requires it.
        </BodyText>
      </GlassCard>
    </ScreenScaffold>
  );
}
