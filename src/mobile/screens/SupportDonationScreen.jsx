import { StyleSheet } from 'react-native';
import { spacing } from '../theme';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';

export default function SupportDonationScreen({ onBack }) {
  return (
    <ScreenScaffold pageContent>
      <AppHeader title="Support PrayerStride" subtitle="Help us keep this ministry going." onBack={onBack} />
      <GlassCard>
        <Heading level="h3">Donations</Heading>
        <BodyText variant="body" style={styles.body}>Donations are not enabled yet.</BodyText>
      </GlassCard>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: spacing.md },
});
