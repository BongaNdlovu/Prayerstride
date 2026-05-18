import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { mockGuide } from '../../data/mockData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function GuideDetailScreen({ go, back }) {
  return (
    <CinematicScreen pageContent>
      <Pressable onPress={back} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <PageHero scene="bible" eyebrow="Study Guide" title={mockGuide.title} subtitle={mockGuide.subtitle} compact />
      <View style={styles.card}>
        <Text style={styles.description}>{mockGuide.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{mockGuide.days} days</Text>
          <Text style={styles.meta}>{mockGuide.level}</Text>
          <Text style={styles.meta}>{mockGuide.format}</Text>
        </View>
        <Text style={styles.sectionTitle}>Includes:</Text>
        {mockGuide.includes.map((item, i) => (
          <Text key={i} style={styles.item}>- {item}</Text>
        ))}
        <Pressable onPress={() => go('lessonReader')} style={styles.button}>
          <Text style={styles.buttonText}>Start Reading</Text>
        </Pressable>
      </View>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  backButton: { alignSelf: 'flex-start', marginTop: 16, marginBottom: 4, paddingVertical: 8, paddingRight: 16 },
  backText: { color: colors.gold, fontWeight: '800' },
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18 },
  description: { color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 23 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 16 },
  meta: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  sectionTitle: { color: colors.ivory, fontSize: 16, fontWeight: '800', marginTop: 20, marginBottom: 8 },
  item: { color: 'rgba(248,243,234,0.62)', fontSize: 14, lineHeight: 22, marginBottom: 4 },
  button: { marginTop: 24, minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
});
