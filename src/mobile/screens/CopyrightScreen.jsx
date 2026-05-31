import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import BodyText from '../components/BodyText';
import Heading from '../components/Heading';

export default function CopyrightScreen({ onBack }) {
  const year = new Date().getFullYear();

  return (
    <ScreenScaffold pageContent>
      <AppHeader title="Copyright & Legal" subtitle="Proprietary software owned by the developer." onBack={onBack} />
      <GlassCard>
        <BodyText variant="body">
          © {year} PrayerStride. All rights reserved.
          {'\n\n'}
          PrayerStride is proprietary software. The app, its name, branding, visual design, code, and original content are owned exclusively by the developer and are not open source.
          {'\n\n'}
          You may not copy, modify, reverse engineer, distribute, sublicense, or create derivative works from PrayerStride without prior written permission.
          {'\n\n'}
          User-generated content you submit remains yours, subject to the license granted in the Terms of Service so PrayerStride can host and display it.
        </BodyText>
      </GlassCard>
      <GlassCard style={{ marginTop: 16 }}>
        <Heading level="h4">Third-party components</Heading>
        <BodyText variant="body" style={{ marginTop: 8 }}>
          PrayerStride includes third-party fonts, icons, and platform services used under their respective licenses (for example, Inter and Playfair Display fonts, Lucide icons, Firebase, Expo, and Cloudflare). Those components remain subject to their own terms; they do not make PrayerStride open source.
        </BodyText>
      </GlassCard>
    </ScreenScaffold>
  );
}
