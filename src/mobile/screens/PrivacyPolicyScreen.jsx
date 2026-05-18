import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function PrivacyPolicyScreen() {
  return (
    <CinematicScreen pageContent>
      <PageHero scene="community" eyebrow="Legal" title="Privacy Policy" subtitle="How we handle your data." compact />
      <Text style={styles.body}>
        PrayerStride is committed to protecting your privacy. We only collect the information necessary to provide our prayer community service.
        {'\n\n'}
        Information We Collect: Your email address, display name, and any content you choose to share (prayer requests, testimonies, encouragements).
        {'\n\n'}
        How We Use Information: To provide and improve our service, to connect you with the prayer community, and to send notifications you have opted into.
        {'\n\n'}
        Data Storage: Your data is stored securely using Firebase services. We do not sell or share your personal information with third parties.
        {'\n\n'}
        You can delete your account at any time from Settings, which permanently removes your data.
      </Text>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  body: { color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 23, marginTop: 8 },
});
