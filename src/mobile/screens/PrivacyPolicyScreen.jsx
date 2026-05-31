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
          PrayerStride is proprietary software owned by the developer. This policy explains how we handle your personal information under POPIA and applicable privacy laws.
          {'\n\n'}
          Information We Collect: Your email address, date of birth (for age verification), display name, and content you choose to share (prayer requests and testimonies).
          {'\n\n'}
          How We Use Information: To provide and improve our service, to connect you with the prayer community, and to send notifications you have opted into.
          {'\n\n'}
          Data Storage: Your data is stored securely using Firebase services. We do not sell or share your personal information with third parties.
          {'\n\n'}
          You can delete your account at any time from Settings, which permanently removes your data.
        </BodyText>
      </GlassCard>
    </ScreenScaffold>
  );
}
