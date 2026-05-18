import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function HelpCenterScreen() {
  return (
    <CinematicScreen pageContent>
      <PageHero scene="community" eyebrow="Support" title="Help Center" subtitle="Find answers and get support." compact />
      <Text style={styles.heading}>Getting Started</Text>
      <Text style={styles.body}>Create an account, set up your profile, and start sharing prayer requests or praying for others.</Text>
      <Text style={styles.heading}>Prayer Requests</Text>
      <Text style={styles.body}>Tap the Create tab to share a prayer request. Include a title and details so others know how to pray.</Text>
      <Text style={styles.heading}>Testimonies</Text>
      <Text style={styles.body}>When a prayer is answered, share a testimony to encourage the community and praise God.</Text>
      <Text style={styles.heading}>Notifications</Text>
      <Text style={styles.body}>Manage notification preferences in Settings to control what you hear about.</Text>
      <Text style={styles.heading}>Contact</Text>
      <Text style={styles.body}>For support, contact us at support@prayerstride.app</Text>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  heading: { color: colors.gold, fontSize: 16, fontWeight: '800', marginTop: 20, marginBottom: 6 },
  body: { color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 23 },
});
