import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, gradients, radii, shadow, typography } from '../theme';

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  busy = false,
  icon: Icon,
  style,
  textStyle,
  variant = 'primary',
}) {
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';
  const isGold = variant === 'gold';

  if (isGhost) {
    return (
      <Pressable
        disabled={disabled || busy}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: disabled || busy, busy }}
        style={({ pressed }) => [styles.ghost, pressed && styles.pressed, disabled && styles.disabled, style]}
      >
        <Text style={[styles.ghostText, textStyle]}>{busy ? 'One moment...' : label}</Text>
      </Pressable>
    );
  }

  if (isSecondary) {
    return (
      <Pressable
        disabled={disabled || busy}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: disabled || busy, busy }}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed, disabled && styles.disabled, style]}
      >
        {busy ? (
          <ActivityIndicator color={colors.ink} />
        ) : (
          <View style={styles.inner}>
            {Icon ? <Icon size={18} color={colors.ink} /> : null}
            <Text style={[styles.secondaryText, textStyle]}>{label}</Text>
          </View>
        )}
      </Pressable>
    );
  }

  const gradientColors = isGold ? gradients.goldButton : gradients.navyButton;
  const textColor = isGold ? colors.ink : colors.white;
  const iconColor = isGold ? colors.ink : colors.white;

  return (
    <Pressable disabled={disabled || busy} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: disabled || busy, busy }} style={({ pressed }) => [styles.wrap, pressed && styles.pressed, disabled && styles.disabled, style]}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
        {busy ? (
          <ActivityIndicator color={iconColor} />
        ) : (
          <View style={styles.inner}>
            {Icon ? <Icon size={18} color={iconColor} /> : null}
            <Text style={[styles.text, { color: textColor }, textStyle]}>{label}</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radii.md, overflow: 'hidden', ...shadow.subtle },
  gradient: {
    minHeight: 52,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { ...typography.button },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.86 },
  ghost: {
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ghostText: { ...typography.button, color: colors.ink },
  secondary: {
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  secondaryText: { ...typography.button, color: colors.ink },
});
