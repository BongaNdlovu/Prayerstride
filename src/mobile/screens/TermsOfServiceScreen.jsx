import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function TermsOfServiceScreen() {
  return (
    <CinematicScreen pageContent>
      <PageHero scene="community" eyebrow="Legal" title="Terms of Service" subtitle="Guidelines for our community." compact />
      <Text style={styles.body}>
        Welcome to PrayerStride. By using this app, you agree to these terms.
        {'\n\n'}
        1. Be Respectful: Treat all members with kindness and respect. Harassment, hate speech, or bullying will not be tolerated.
        {'\n\n'}
        2. Appropriate Content: Share content that is encouraging and aligned with Christian values. Do not post spam, commercial content, or inappropriate material.
        {'\n\n'}
        3. Privacy: Respect the privacy of others. Do not share personal information about other members without their consent.
        {'\n\n'}
        4. Account Responsibility: You are responsible for maintaining the confidentiality of your account credentials and for activity under your account.
        {'\n\n'}
        5. Community Updates: Official announcements may be published by authorized administrators. Do not impersonate staff or publish misleading global updates.
        {'\n\n'}
        6. Personal Calendar Data: Events and bookmarks you create are for your own planning. Do not attempt to access or modify another member&apos;s calendar data.
        {'\n\n'}
        7. Termination: We reserve the right to suspend or terminate accounts that violate these terms.
        {'\n\n'}
        8. Changes: These terms may be updated as the app evolves. Continued use after updates means you accept the revised terms.
      </Text>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  body: { color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 23, marginTop: 8 },
});
