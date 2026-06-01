import { Pressable, StyleSheet, Text, View } from 'react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import BodyText from './BodyText';

export default function SegmentedControl({ options, value, onChange, style }) {
  return (
    <View style={[styles.wrap, style]}>
      {options.map((option) => {
        const selected = value === option.value;
        const Icon = option.icon;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentActive]}
          >
            {Icon ? <Icon size={16} color={selected ? colors.navy : colors.textMuted} /> : null}
            <Text style={[styles.label, selected && styles.labelActive]}>{option.label}</Text>
            {option.subtext ? (
              <BodyText variant="caption" style={[styles.subtext, selected && styles.subtextActive]}>
                {option.subtext}
              </BodyText>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 4,
  },
  segmentActive: {
    borderColor: colors.navy,
    backgroundColor: alpha.navy08,
  },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  labelActive: { color: colors.navy },
  subtext: { fontSize: 10, textAlign: 'center' },
  subtextActive: { color: colors.textSecondary },
});
