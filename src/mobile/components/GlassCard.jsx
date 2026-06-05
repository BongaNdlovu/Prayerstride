import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, shadow, spacing } from '../theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.xl - 2,
    ...shadow.card,
  },
});

function GlassCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export default memo(GlassCard);
