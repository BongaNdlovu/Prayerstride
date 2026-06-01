import { StyleSheet, View } from 'react-native';
import { colors, fonts, spacing } from '../theme';
import Heading from './Heading';
import BodyText from './BodyText';
import GlassCard from './GlassCard';

export default function StatCard({ icon: Icon, value, label, sublabel, accent = colors.gold, style }) {
  return (
    <GlassCard style={[styles.card, style]}>
      {Icon ? <Icon color={accent} size={21} /> : null}
      <Heading level="stat" style={styles.value}>{value}</Heading>
      <BodyText variant="caption" style={styles.label}>{label}</BodyText>
      {sublabel ? <BodyText variant="caption" style={[styles.sublabel, { color: accent }]}>{sublabel}</BodyText> : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minHeight: 116, marginBottom: 0 },
  value: { marginTop: spacing.sm + 2, fontSize: 25 },
  label: { marginTop: 3, fontFamily: fonts.sansMedium, color: colors.textSecondary },
  sublabel: { marginTop: 2 },
});
