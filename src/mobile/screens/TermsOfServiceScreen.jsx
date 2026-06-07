import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import BodyText from '../components/BodyText';

export default function TermsOfServiceScreen({ onBack }) {
  return (
    <ScreenScaffold pageContent>
      <AppHeader title="Terms and Conditions" subtitle="What you agree to when using PrayerStride." onBack={onBack} />
      <GlassCard>
        <BodyText variant="body">
          Effective date: 6 June 2026
          {'\n\n'}
          By creating an account or using PrayerStride, you agree to these Terms and Conditions and the Privacy Policy. If you do not agree, do not use the app.
          {'\n\n'}
          1. Ownership and license: PrayerStride is proprietary software. You receive a limited, personal, revocable, non-transferable license to use the app. You may not copy, redistribute, reverse engineer, scrape, disrupt, or misuse the service.
          {'\n\n'}
          2. Eligibility: PrayerStride is for users aged 18 or older. You must provide accurate registration information and keep your account secure.
          {'\n\n'}
          3. Community conduct: Treat members with dignity. Do not post harassment, hate speech, threats, spam, unlawful content, explicit content, false information, or private information about another person without permission.
          {'\n\n'}
          4. Prayer content and privacy: You are responsible for prayer requests, answered-prayer updates, reports, calendar entries, and profile content you submit. Hidden/private content must still comply with these terms. Do not use PrayerStride for emergencies; contact local emergency services or a trusted professional when immediate help is needed.
          {'\n\n'}
          5. User-generated content license: You keep ownership of your content. You grant PrayerStride a non-exclusive, worldwide license to host, display, transmit, back up, moderate, and delete your content as needed to operate and protect the service.
          {'\n\n'}
          6. Moderation: We may remove content, restrict features, suspend accounts, delete accounts, or report unlawful conduct where needed to protect users, comply with law, or enforce these terms. You may contact support to ask for a review.
          {'\n\n'}
          7. POPIA and privacy: You agree that PrayerStride may process your personal information as described in the Privacy Policy for account creation, age verification, community safety, notifications, support, legal compliance, and service operation. You must not submit another person's personal information unless you have a lawful basis to do so.
          {'\n\n'}
          8. No professional advice: PrayerStride is a prayer and community support tool. It does not provide medical, legal, counselling, financial, or emergency advice.
          {'\n\n'}
          9. Availability and changes: The app may change, pause, or experience outages. We may update these terms and will require acceptance of material updates where appropriate.
          {'\n\n'}
          10. Liability: To the fullest extent allowed by South African law, PrayerStride is provided as is, and liability is limited to direct losses caused by proven unlawful conduct or gross negligence.
          {'\n\n'}
          11. Governing law: These terms are governed by the laws of the Republic of South Africa.
        </BodyText>
      </GlassCard>
    </ScreenScaffold>
  );
}
