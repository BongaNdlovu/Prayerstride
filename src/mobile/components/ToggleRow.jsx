import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { alpha, colors, spacing } from '../theme';
import BodyText from './BodyText';

export default function ToggleRow({ label, subtext, value, onToggle, style }) {
  return (
    <Pressable onPress={() => onToggle?.(!value)} style={[styles.row, style]} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }}>
      <View style={styles.textGroup}>
        <BodyText variant="label">{label}</BodyText>
        {subtext ? <BodyText variant="caption" style={styles.subtext}>{subtext}</BodyText> : null}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: alpha.navy16, true: colors.gold }}
        thumbColor={colors.white}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  textGroup: { flex: 1, paddingRight: spacing.md },
  subtext: { marginTop: 2 },
});
