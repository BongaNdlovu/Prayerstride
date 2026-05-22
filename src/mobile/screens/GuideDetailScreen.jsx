import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { useStudyGuide } from '../useContentCollections';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import AsyncState from '../components/AsyncState';

export default function GuideDetailScreen({ guideId, go, back }) {
  const { guide, loading, error } = useStudyGuide(guideId, true);
  const includes = Array.isArray(guide?.includes) ? guide.includes : [];

  return (
    <CinematicScreen pageContent>
      <Pressable onPress={back} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <PageHero scene="bible" eyebrow="Study Guide" title={guide?.title || 'Study Guide'} subtitle={guide?.subtitle || 'Real study content from the library.'} compact />
      <AsyncState loading={loading} error={error} empty={!loading && !error && !guide} emptyLabel="This guide is not available.">
        <View style={styles.card}>
          <Text style={styles.description}>{guide?.description || 'No description has been published for this guide yet.'}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{guide?.days || 1} days</Text>
            <Text style={styles.meta}>{guide?.level || 'All levels'}</Text>
            <Text style={styles.meta}>{guide?.format || 'Reading'}</Text>
          </View>
          {includes.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Includes:</Text>
              {includes.map((item, i) => (
                <Text key={`${item}-${i}`} style={styles.item}>- {item}</Text>
              ))}
            </>
          ) : null}
          <Pressable onPress={() => go('lessonReader', { guideId })} style={styles.button}>
            <Text style={styles.buttonText}>Start Reading</Text>
          </Pressable>
        </View>
      </AsyncState>
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
