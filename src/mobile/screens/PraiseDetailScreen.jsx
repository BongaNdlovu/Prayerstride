import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { reactToTestimony } from '../api';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import TestimonyCard from '../components/TestimonyCard';

export default function PraiseDetailScreen({ testimony, onBack }) {
  return (
    <CinematicScreen pageContent>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <PageHero scene="answered" eyebrow="Praise Report" title={testimony.title} subtitle={testimony.authorName} compact />
      <View style={styles.card}>
        <Text style={styles.body}>{testimony.body}</Text>
        <Text style={styles.meta}>{testimony.authorName}</Text>
        <View style={styles.actionRow}>
          <Pressable onPress={async () => { try { await reactToTestimony(testimony.id, 'praiseGod'); } catch (e) { Alert.alert('Error', e.message); } }} style={styles.reactionButton}>
            <Text style={styles.reactionText}>Praise God - {testimony.praiseGod || 0}</Text>
          </Pressable>
          <Pressable onPress={async () => { try { await reactToTestimony(testimony.id, 'amen'); } catch (e) { Alert.alert('Error', e.message); } }} style={styles.reactionButton}>
            <Text style={styles.reactionText}>Amen - {testimony.amen || 0}</Text>
          </Pressable>
        </View>
      </View>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  backButton: { alignSelf: 'flex-start', marginTop: 16, marginBottom: 4, paddingVertical: 8, paddingRight: 16 },
  backText: { color: colors.gold, fontWeight: '800' },
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18 },
  body: { marginTop: 12, color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 23 },
  meta: { marginTop: 12, flexShrink: 1, color: 'rgba(248,243,234,0.55)', fontSize: 12 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  reactionButton: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', paddingHorizontal: 14, paddingVertical: 9 },
  reactionText: { color: colors.ivory, fontSize: 12, fontWeight: '800' },
});
