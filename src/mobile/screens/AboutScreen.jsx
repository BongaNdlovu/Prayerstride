import { StyleSheet, Text } from 'react-native';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function AboutScreen() {
  return (
    <CinematicScreen pageContent>
      <PageHero scene="dawn" eyebrow="About" title="PrayerStride" subtitle="A mobile-first prayer community." compact />
      <Text style={styles.body}>
        PrayerStride helps believers share prayer requests, celebrate answered prayers, and keep a steady rhythm of intercession.
        {'\n\n'}
        This app is built for daily encouragement, private prayer sessions, and community updates from trusted leaders.
        {'\n\n'}
        Thank you for walking with us in faith, hope, and prayer.
      </Text>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  body: { color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 23, marginTop: 8 },
});
