import { Alert, StyleSheet, View } from 'react-native';
import { alpha, colors, spacing } from '../theme';
import { resolveReport, dismissReport } from '../useReports';
import { adminDeleteContent } from '../api';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';

export default function ReportDetailsScreen({ report, go, back }) {
  if (!report) return null;

  return (
    <ScreenScaffold pageContent>
      <AppHeader
        title={`${report.targetType || 'Content'} Report`}
        subtitle={`Status: ${report.status || 'pending'}`}
        onBack={back}
      />
      <GlassCard>
        <Heading level="eyebrow">Target Type</Heading>
        <BodyText variant="body" style={styles.value}>{report.targetType}</BodyText>
        <Heading level="eyebrow" style={styles.field}>Target ID</Heading>
        <BodyText variant="body" style={styles.value}>{report.targetId}</BodyText>
        <Heading level="eyebrow" style={styles.field}>Reason</Heading>
        <BodyText variant="body" style={styles.value}>{report.reason}</BodyText>
        <Heading level="eyebrow" style={styles.field}>Reported By</Heading>
        <BodyText variant="body" style={styles.value}>{report.reportedByUid || 'Unknown'}</BodyText>
      </GlassCard>
      <View style={styles.actions}>
        <PrimaryButton
          label="Resolve"
          onPress={async () => { try { await resolveReport(report.id); } catch (e) { Alert.alert('Error', e.message); } }}
        />
        <PrimaryButton
          label="Dismiss"
          onPress={async () => { try { await dismissReport(report.id); } catch (e) { Alert.alert('Error', e.message); } }}
          variant="ghost"
        />
        <PrimaryButton
          label="Delete Content"
          onPress={() => {
            Alert.alert('Delete Content', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: async () => { try { await adminDeleteContent(report.targetId, report.targetType); } catch (e) { Alert.alert('Error', e.message); } } },
            ]);
          }}
          variant="ghost"
          style={styles.dangerBtn}
        />
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  field: { marginTop: spacing.lg },
  value: { marginTop: spacing.xs },
  actions: { marginTop: spacing.xl, gap: spacing.sm },
  dangerBtn: { borderColor: alpha.gold30 },
});
