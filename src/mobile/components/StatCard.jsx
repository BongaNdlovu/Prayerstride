import { StyleSheet, View } from 'react-native';
import { alpha, colors, radii, spacing } from '../theme';
import Heading from './Heading';
import BodyText from './BodyText';
import GlassCard from './GlassCard';

export default function StatCard({ icon: Icon, value, label, sublabel, accent = colors.teal, style }) {
  return (
    <GlassCard style={[styles.card, style]}>
      {Icon ? (
        <View style={[styles.iconWrap, { backgroundColor: accent === colors.teal ? colors.tealPale : alpha.gold18 }]}>
          <Icon color={accent} size={20} />
        </View>
      ) : null}
      <Heading level="stat" style={styles.value}>{value}</Heading>
      <BodyText variant="caption" style={styles.label}>{label}</BodyText>
      {sublabel ? <BodyText variant="caption" style={[styles.sublabel, { color: accent }]}>{sublabel}</BodyText> : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minHeight: 124, marginBottom: 0 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  value: { marginTop: spacing.sm, fontSize: 25 },
  label: { marginTop: 3, color: colors.ink2 },
  sublabel: { marginTop: 2 },
});
