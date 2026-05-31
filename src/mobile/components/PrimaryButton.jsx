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
  variant = 'gold',
}) {
  const isGhost = variant === 'ghost';

  if (isGhost) {
    return (
      <Pressable
        disabled={disabled || busy}
        onPress={onPress}
        style={[styles.ghost, disabled && styles.disabled, style]}
      >
        <Text style={[styles.ghostText, textStyle]}>{busy ? 'One moment...' : label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable disabled={disabled || busy} onPress={onPress} style={[styles.wrap, disabled && styles.disabled, style]}>
      <LinearGradient colors={gradients.goldButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
        {busy ? (
          <ActivityIndicator color={colors.ink} />
        ) : (
          <View style={styles.inner}>
            {Icon ? <Icon size={18} color={colors.ink} /> : null}
            <Text style={[styles.text, textStyle]}>{label}</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radii.lg, overflow: 'hidden', ...shadow.card },
  gradient: {
    minHeight: 52,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { ...typography.button },
  disabled: { opacity: 0.5 },
  ghost: {
    minHeight: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ghostText: { ...typography.button, color: colors.gold },
});
