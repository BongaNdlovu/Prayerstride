import { StyleSheet, View } from 'react-native';
import { alpha, colors, fonts, radii, spacing, typography } from '../theme';
import Heading from './Heading';
import BodyText from './BodyText';
import GlassCard from './GlassCard';

export default function StatCard({ icon: Icon, value, label, sublabel }) {
  return (
    <GlassCard style={styles.card}>
      {Icon ? <Icon color={colors.gold} size={21} /> : null}
      <Heading level="stat" style={styles.value}>{value}</Heading>
      <BodyText variant="caption" style={styles.label}>{label}</BodyText>
      {sublabel ? <BodyText variant="caption" style={styles.sublabel}>{sublabel}</BodyText> : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minHeight: 116, marginBottom: 0 },
  value: { marginTop: spacing.sm + 2, fontSize: 25 },
  label: { marginTop: 3, fontFamily: fonts.sansMedium },
  sublabel: { marginTop: 2, color: colors.gold },
});
