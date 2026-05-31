import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';

export default function PillTabs({ tabs, active, onChange, style }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
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
  row: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: alpha.ivory16,
    backgroundColor: alpha.ivory10,
  },
  pillActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  text: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: alpha.ivory62,
  },
  textActive: { color: colors.ink },
});
