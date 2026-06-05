import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { alpha, colors, spacing } from '../theme';
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
  if (centered || showLogo) {
    return (
      <View style={styles.centeredHeader}>
        <View style={styles.topRow}>
          {onBack ? (
            <Pressable onPress={onBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
              <ChevronLeft size={22} color={colors.ink} />
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
        <Pressable onPress={onBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
          <ChevronLeft size={20} color={colors.ink} />
        </Pressable>
      ) : null}
      <View style={styles.titleGroup}>
        {title ? <Heading level="h3">{title}</Heading> : null}
        {subtitle ? <BodyText variant="caption">{subtitle}</BodyText> : null}
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
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  centeredHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.ink08,
  },
  sideSpacer: { width: 40 },
  titleGroup: { flex: 1 },
  rightAction: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  centeredTitle: { marginTop: spacing.md, textAlign: 'center', fontSize: 26 },
  centeredSubtitle: { marginTop: spacing.xs, textAlign: 'center' },
  divider: { marginTop: spacing.md },
});
