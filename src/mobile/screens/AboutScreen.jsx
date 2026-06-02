import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import BodyText from '../components/BodyText';

export default function AboutScreen({ onBack }) {
  return (
    <ScreenScaffold pageContent centerContent>
      <AppHeader title="PrayerStride" subtitle="A mobile-first prayer community." onBack={onBack} />
      <GlassCard>
        <BodyText variant="body">
          PrayerStride helps believers share prayer requests, celebrate answered prayers, and keep a steady rhythm of intercession.
          {'\n\n'}
          This app is built for daily encouragement, private prayer sessions, and community updates from trusted leaders.
          {'\n\n'}
          Thank you for walking with us in faith, hope, and prayer.
        </BodyText>
      </GlassCard>
    </ScreenScaffold>
  );
}
