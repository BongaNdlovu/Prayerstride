import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, onDark, radii, shadow, spacing } from '../theme';
import { useAppTheme } from '../AppThemeProvider';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
    ...shadow.card,
  },
  cardDark: {
    backgroundColor: colors.night2,
    borderColor: onDark.border,
  },
});

function GlassCard({ children, style }) {
  const { darkMode } = useAppTheme();
  return <View style={[styles.card, darkMode && styles.cardDark, style]}>{children}</View>;
}

export default memo(GlassCard);
