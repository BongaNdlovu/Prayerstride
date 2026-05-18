import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { mockLesson } from '../../data/mockData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function LessonReaderScreen() {
  return (
    <CinematicScreen pageContent>
      <PageHero scene="bible" eyebrow={`Day ${mockLesson.day} of ${mockLesson.totalDays}`} title={mockLesson.title} subtitle={mockLesson.reference} compact />
      <View style={styles.card}>
        <Text style={styles.verse}>{mockLesson.verse}</Text>
        <Text style={styles.body}>{mockLesson.body}</Text>
        <View style={styles.reflectionCard}>
          <Text style={styles.reflectionLabel}>Reflection</Text>
          <Text style={styles.reflectionText}>{mockLesson.reflection}</Text>
        </View>
      </View>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18 },
  verse: { color: colors.gold, fontSize: 16, fontWeight: '700', lineHeight: 24, fontStyle: 'italic' },
  body: { marginTop: 16, color: 'rgba(248,243,234,0.78)', fontSize: 15, lineHeight: 24 },
  reflectionCard: { marginTop: 24, borderWidth: 1, borderColor: 'rgba(200,137,43,0.2)', borderRadius: 16, padding: 16, backgroundColor: 'rgba(200,137,43,0.08)' },
  reflectionLabel: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  reflectionText: { marginTop: 10, color: 'rgba(248,243,234,0.78)', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
});
