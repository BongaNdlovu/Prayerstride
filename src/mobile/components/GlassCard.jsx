import { StyleSheet, View } from 'react-native';
import { alpha, radii, shadow, spacing } from '../theme';

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: alpha.ivory16,
    backgroundColor: alpha.ivory11,
    borderRadius: radii.xxl,
    padding: spacing.xl - 2,
    ...shadow.card,
  },
});

export default function GlassCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
