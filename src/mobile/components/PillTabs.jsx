import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';

export default function PillTabs({ tabs, active, onChange, style }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={[styles.row, style]}
    >
      {tabs.map((tab) => {
        const selected = active === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={[styles.pill, selected && styles.pillActive]}
          >
            <Text style={[styles.text, selected && styles.textActive]}>{tab}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0 },
  row: { flexDirection: 'row', gap: spacing.xs, paddingVertical: spacing.xs },
  pill: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: {
    backgroundColor: alpha.navy08,
    borderColor: colors.navy,
  },
  text: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  textActive: { color: colors.navy },
});
