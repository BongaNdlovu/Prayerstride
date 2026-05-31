import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import { useStudyGuide } from '../useContentCollections';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import AsyncState from '../components/AsyncState';

export default function GuideDetailScreen({ guideId, go, back }) {
  const { guide, loading, error } = useStudyGuide(guideId, true);
  const includes = Array.isArray(guide?.includes) ? guide.includes : [];

  return (
    <ScreenScaffold pageContent>
      <AppHeader title={guide?.title || 'Study Guide'} subtitle={guide?.subtitle || 'Real study content from the library.'} onBack={back} />
      <AsyncState loading={loading} error={error} empty={!loading && !error && !guide} emptyLabel="This guide is not available.">
        <GlassCard>
          <BodyText variant="body">{guide?.description || 'No description has been published for this guide yet.'}</BodyText>
          <View style={styles.metaRow}>
            <BodyText variant="label" style={styles.meta}>{guide?.days || 1} days</BodyText>
            <BodyText variant="label" style={styles.meta}>{guide?.level || 'All levels'}</BodyText>
            <BodyText variant="label" style={styles.meta}>{guide?.format || 'Reading'}</BodyText>
          </View>
          {includes.length > 0 ? (
            <View style={styles.includes}>
              <Heading level="h4">Includes</Heading>
              {includes.map((item, i) => (
                <BodyText key={`${item}-${i}`} variant="small" style={styles.item}>· {item}</BodyText>
              ))}
            </View>
          ) : null}
          <PrimaryButton label="Start Reading" onPress={() => go('lessonReader', { guideId })} style={styles.cta} />
        </GlassCard>
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginTop: spacing.lg },
  meta: { color: colors.gold },
  includes: { marginTop: spacing.xl },
  item: { marginTop: spacing.sm },
  cta: { marginTop: spacing.xl },
});
