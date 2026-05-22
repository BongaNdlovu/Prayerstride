import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { useGuideLesson } from '../useContentCollections';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import AsyncState from '../components/AsyncState';

export default function LessonReaderScreen({ guideId, lessonId }) {
  const { lesson, loading, error } = useGuideLesson(guideId, lessonId, true);

  return (
    <CinematicScreen pageContent>
      <PageHero scene="bible" eyebrow={lesson ? `Day ${lesson.day || 1}${lesson.totalDays ? ` of ${lesson.totalDays}` : ''}` : 'Lesson'} title={lesson?.title || 'Lesson Reader'} subtitle={lesson?.reference || 'Open a published study lesson.'} compact />
      <AsyncState loading={loading} error={error} empty={!loading && !error && !lesson} emptyLabel="This lesson is not available.">
        <View style={styles.card}>
          {lesson?.verse ? <Text style={styles.verse}>{lesson.verse}</Text> : null}
          <Text style={styles.body}>{lesson?.body || 'No lesson body has been published yet.'}</Text>
          {lesson?.reflection ? (
            <View style={styles.reflectionCard}>
              <Text style={styles.reflectionLabel}>Reflection</Text>
              <Text style={styles.reflectionText}>{lesson.reflection}</Text>
            </View>
          ) : null}
        </View>
      </AsyncState>
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
