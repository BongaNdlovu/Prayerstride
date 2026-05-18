import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function SupportDonationScreen() {
  return (
    <CinematicScreen pageContent>
      <PageHero scene="community" eyebrow="Support" title="Support PrayerStride" subtitle="Help us keep this ministry going." compact />
      <View style={styles.card}>
        <Text style={styles.title}>Donations</Text>
        <Text style={styles.body}>Donations are not enabled yet.</Text>
      </View>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18 },
  title: { color: colors.ivory, fontSize: 21, lineHeight: 26, fontWeight: '800' },
  body: { marginTop: 12, color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 23 },
});
