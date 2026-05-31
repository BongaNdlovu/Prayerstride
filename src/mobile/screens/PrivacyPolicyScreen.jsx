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
          PrayerStride is committed to protecting your privacy. We only collect the information necessary to provide our prayer community service.
          {'\n\n'}
          Information We Collect: Your email address, display name, and any content you choose to share (prayer requests, testimonies, encouragements).
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
