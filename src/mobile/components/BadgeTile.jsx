import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Award, Lock, Star } from 'lucide-react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import { formatBadgeProgress } from '../gamification';
import BodyText from './BodyText';
import Heading from './Heading';

export default function BadgeTile({ badge, onPress, compact = false }) {
  const earned = badge.state === 'earned';
  const locked = badge.state === 'locked';

  return (
    <Pressable onPress={onPress} style={[styles.tile, compact && styles.tileCompact, earned && styles.tileEarned]} accessibilityRole="button" accessibilityLabel={badge.name}>
      <View style={[styles.iconWrap, earned && styles.iconWrapEarned, locked && styles.iconWrapLocked]}>
        {earned ? (
          <Star size={compact ? 18 : 22} color={colors.gold} fill={colors.gold} />
        ) : locked ? (
          <Lock size={compact ? 16 : 18} color={colors.ink3} />
        ) : (
          <Award size={compact ? 18 : 22} color={colors.teal} />
        )}
      </View>
      <Heading level="h4" style={[styles.title, compact && styles.titleCompact]} numberOfLines={2}>
        {badge.name}
      </Heading>
      {!compact ? (
        <BodyText variant="caption" style={styles.description} numberOfLines={2}>{badge.description}</BodyText>
      ) : null}
      <Text style={[styles.progress, earned && styles.progressEarned]}>
        {locked && badge.lockedUntilPhase ? 'Coming soon' : formatBadgeProgress(badge)}
      </Text>
      {!locked && !earned ? (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.round(badge.progress * 100)}%` }]} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 168,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  tileCompact: { minHeight: 132, padding: spacing.md },
  tileEarned: { borderColor: alpha.gold30, backgroundColor: alpha.gold18 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.ink08,
    marginBottom: spacing.xs,
  },
  iconWrapEarned: { backgroundColor: alpha.gold22 },
  iconWrapLocked: { backgroundColor: colors.surface2 },
  title: { fontSize: 16, lineHeight: 20 },
  titleCompact: { fontSize: 14, lineHeight: 18 },
  description: { minHeight: 32 },
  progress: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.ink3, marginTop: spacing.xs },
  progressEarned: { color: colors.gold },
  progressBar: {
    marginTop: spacing.xs,
    height: 5,
    borderRadius: 3,
    backgroundColor: alpha.ink10,
    overflow: 'hidden',
  },
  progressFill: { height: 5, borderRadius: 3, backgroundColor: colors.teal },
});
