import { StyleSheet, View } from 'react-native';
import { alpha, colors, spacing } from '../theme';
import { useGuideLesson } from '../useContentCollections';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import AsyncState from '../components/AsyncState';

export default function LessonReaderScreen({ guideId, lessonId, onBack }) {
  const { lesson, loading, error, retry } = useGuideLesson(guideId, lessonId, true);
  const eyebrow = lesson ? `Day ${lesson.day || 1}${lesson.totalDays ? ` of ${lesson.totalDays}` : ''}` : 'Lesson';

  return (
    <ScreenScaffold pageContent>
      <AppHeader
        title={lesson?.title || 'Lesson Reader'}
        subtitle={lesson?.reference || 'Open a published study lesson.'}
        onBack={onBack}
      />
      <AsyncState loading={loading} error={error} onRetry={retry} empty={!loading && !error && !lesson} emptyLabel="This lesson is not available.">
        <Heading level="eyebrow" style={styles.eyebrow}>{eyebrow}</Heading>
        <GlassCard>
          {lesson?.verse ? (
            <BodyText variant="body" style={styles.verse}>{lesson.verse}</BodyText>
          ) : null}
          <BodyText variant="body" style={styles.body}>{lesson?.body || 'No lesson body has been published yet.'}</BodyText>
          {lesson?.reflection ? (
            <View style={styles.reflectionCard}>
              <Heading level="eyebrow">Reflection</Heading>
              <BodyText variant="body" style={styles.reflectionText}>{lesson.reflection}</BodyText>
            </View>
          ) : null}
        </GlassCard>
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginBottom: spacing.sm },
  verse: { color: colors.gold, fontStyle: 'italic' },
  body: { marginTop: spacing.lg },
  reflectionCard: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: alpha.gold22,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    backgroundColor: alpha.gold18,
  },
  reflectionText: { marginTop: spacing.md, fontStyle: 'italic' },
});
