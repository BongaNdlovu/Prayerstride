import { StyleSheet, Text } from 'react-native';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function CopyrightScreen() {
  return (
    <CinematicScreen pageContent>
      <PageHero scene="community" eyebrow="Legal" title="Copyright" subtitle="Ownership and permitted use." compact />
      <Text style={styles.body}>
        © {new Date().getFullYear()} PrayerStride. All rights reserved.
        {'\n\n'}
        PrayerStride names, branding, and original app content may not be copied, modified, or redistributed without permission.
        {'\n\n'}
        Scripture references and third-party materials remain the property of their respective owners.
      </Text>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  body: { color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 23, marginTop: 8 },
});
