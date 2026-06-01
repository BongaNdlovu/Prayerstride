import { StyleSheet, View } from 'react-native';
import { colors, glass, radii, shadow, spacing } from '../theme';

const styles = StyleSheet.create({
  card: {
    ...glass,
    borderRadius: radii.xxl,
    padding: spacing.xl - 2,
    ...shadow.card,
  },
});

export default function GlassCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
