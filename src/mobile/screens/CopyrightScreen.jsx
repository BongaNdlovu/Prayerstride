import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import BodyText from '../components/BodyText';

export default function CopyrightScreen({ onBack }) {
  return (
    <ScreenScaffold pageContent>
      <AppHeader title="Copyright" subtitle="Ownership and permitted use." onBack={onBack} />
      <GlassCard>
        <BodyText variant="body">
          © {new Date().getFullYear()} PrayerStride. All rights reserved.
          {'\n\n'}
          PrayerStride names, branding, and original app content may not be copied, modified, or redistributed without permission.
          {'\n\n'}
          Scripture references and third-party materials remain the property of their respective owners.
        </BodyText>
      </GlassCard>
    </ScreenScaffold>
  );
}
