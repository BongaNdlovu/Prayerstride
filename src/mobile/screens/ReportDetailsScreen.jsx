import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { resolveReport, dismissReport } from '../useReports';
import { adminDeleteContent } from '../api';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function ReportDetailsScreen({ report, go, back }) {
  if (!report) return null;

  return (
    <CinematicScreen pageContent>
      <Pressable onPress={back} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <PageHero scene="bible" eyebrow="Report Details" title={`${report.targetType || 'Content'} Report`} subtitle={`Status: ${report.status || 'pending'}`} compact />
      <View style={styles.card}>
        <Text style={styles.label}>Target Type</Text>
        <Text style={styles.value}>{report.targetType}</Text>
        <Text style={styles.label}>Target ID</Text>
        <Text style={styles.value}>{report.targetId}</Text>
        <Text style={styles.label}>Reason</Text>
        <Text style={styles.value}>{report.reason}</Text>
        <Text style={styles.label}>Reported By</Text>
        <Text style={styles.value}>{report.reportedByUid || 'Unknown'}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={async () => { try { await resolveReport(report.id); } catch (e) { Alert.alert('Error', e.message); } }} style={styles.button}>
          <Text style={styles.buttonText}>Resolve</Text>
        </Pressable>
        <Pressable onPress={async () => { try { await dismissReport(report.id); } catch (e) { Alert.alert('Error', e.message); } }} style={styles.outlineButton}>
          <Text style={styles.outlineText}>Dismiss</Text>
        </Pressable>
        <Pressable onPress={() => {
          Alert.alert('Delete Content', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => { try { await adminDeleteContent(report.targetId, report.targetType); } catch (e) { Alert.alert('Error', e.message); } } },
          ]);
        }} style={styles.dangerButton}>
          <Text style={styles.dangerText}>Delete Content</Text>
        </Pressable>
      </View>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  backButton: { alignSelf: 'flex-start', marginTop: 16, marginBottom: 4, paddingVertical: 8, paddingRight: 16 },
  backText: { color: colors.gold, fontWeight: '800' },
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18 },
  label: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginTop: 14 },
  value: { marginTop: 4, color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 21 },
  actions: { marginTop: 20, gap: 10 },
  button: { minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  outlineButton: { minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(248,243,234,0.2)' },
  outlineText: { color: 'rgba(248,243,234,0.72)', fontSize: 15, fontWeight: '700' },
  dangerButton: { minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(200,137,43,0.4)', backgroundColor: 'rgba(200,137,43,0.08)' },
  dangerText: { color: colors.gold, fontSize: 15, fontWeight: '700' },
});
