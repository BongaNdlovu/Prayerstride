import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { alpha, colors, shadow, spacing } from '../theme';
import LogoMark from './LogoMark';
import Heading from './Heading';
import BodyText from './BodyText';
import SectionDivider from './SectionDivider';

export default function AppHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  centered = false,
  showLogo = false,
}) {
  const iconColor = colors.ink;

  if (centered || showLogo) {
    return (
      <View style={styles.centeredHeader}>
        <View style={styles.topRow}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
            >
              <ChevronLeft size={22} color={iconColor} />
            </Pressable>
          ) : (
            <View style={styles.sideSpacer} />
          )}
          {showLogo ? <LogoMark size={40} /> : <View style={styles.sideSpacer} />}
          {rightAction ? (
            <View style={styles.rightAction}>{rightAction}</View>
          ) : (
            <View style={styles.sideSpacer} />
          )}
        </View>
        {title ? <Heading level="h2" style={styles.centeredTitle}>{title}</Heading> : null}
        {subtitle ? <BodyText variant="small" style={styles.centeredSubtitle}>{subtitle}</BodyText> : null}
        {title ? <SectionDivider style={styles.divider} /> : null}
      </View>
    );
  }

  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <ChevronLeft size={20} color={iconColor} />
        </Pressable>
      ) : null}
      <View style={styles.titleGroup}>
        {title ? <Heading level="h3" style={styles.inlineTitle}>{title}</Heading> : null}
        {subtitle ? <BodyText variant="caption" style={styles.inlineSubtitle}>{subtitle}</BodyText> : null}
      </View>
      {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  centeredHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.subtle,
  },
  pressed: { opacity: 0.78 },
  sideSpacer: { width: 40 },
  titleGroup: { flex: 1 },
  rightAction: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  inlineTitle: { lineHeight: 29 },
  inlineSubtitle: { marginTop: 2, color: alpha.ink62 },
  centeredTitle: { marginTop: spacing.md, textAlign: 'center', fontSize: 26, lineHeight: 32 },
  centeredSubtitle: {
    alignSelf: 'center',
    maxWidth: 320,
    marginTop: spacing.xs,
    textAlign: 'center',
    color: alpha.ink62,
  },
  divider: { marginTop: spacing.md },
});
