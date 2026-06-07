import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Briefcase, ChevronRight, Heart, Home, Shield, Sparkles, Sun, TrendingUp } from 'lucide-react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import { formatRelativeFirestoreDate } from '../sessionStats';
import Heading from './Heading';
import BodyText from './BodyText';
import GlassCard from './GlassCard';

const CATEGORY_ICONS = {
  health: Heart,
  healing: Heart,
  family: Home,
  finances: TrendingUp,
  provision: TrendingUp,
  wisdom: Sun,
  guidance: Sun,
  peace: Sparkles,
  strength: Sparkles,
  job: Briefcase,
  protection: Shield,
};

function PrayerCard({ prayer, onPress, variant = 'glass' }) {
  const CategoryIcon = CATEGORY_ICONS[prayer.category?.toLowerCase()] || Sparkles;
  const prayedCount = prayer.prayedCount ?? prayer.count ?? 0;
  const isActive = prayer.status !== 'answered';
  const title = prayer.title || prayer.category || 'Prayer request';

  if (variant === 'list') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.listRow, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Open prayer: ${title}`}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(prayer.authorName || prayer.name || 'P').slice(0, 1)}</Text>
        </View>
        <View style={styles.listContent}>
          <Text style={styles.listName}>{prayer.authorName || prayer.name || 'Anonymous'}</Text>
          <BodyText variant="small" numberOfLines={1}>{title}</BodyText>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open prayer: ${title}`}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <GlassCard style={styles.card}>
        <View style={styles.metaRow}>
          <View style={styles.iconWrap}>
            <CategoryIcon size={18} color={colors.gold} />
          </View>
          <View style={styles.content}>
            <Heading level="h4" style={styles.title}>{title}</Heading>
            <BodyText variant="small" numberOfLines={2}>{prayer.body || prayer.text || 'No details provided.'}</BodyText>
            <Text style={styles.praying}>{prayedCount} praying</Text>
          </View>
          <View style={styles.rightCol}>
            {isActive ? <View style={styles.activeBadge}><Text style={styles.activeText}>Active</Text></View> : null}
            <BodyText variant="caption">{formatRelativeFirestoreDate(prayer.createdAt, '-')}</BodyText>
            <ChevronRight size={16} color={colors.textMuted} style={styles.chevron} />
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}

export default memo(PrayerCard);

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  pressed: { opacity: 0.9 },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
    borderWidth: 1,
    borderColor: alpha.gold30,
  },
  content: { flex: 1 },
  title: { fontSize: 17, marginBottom: 4 },
  praying: { marginTop: 6, fontFamily: fonts.sansMedium, fontSize: 12, color: colors.textMuted },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  activeBadge: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeText: { fontFamily: fonts.sansSemiBold, fontSize: 10, color: colors.emerald },
  chevron: { marginTop: 4 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.navy08,
  },
  avatarText: { fontFamily: fonts.sansBold, fontSize: 16, color: colors.navy },
  listContent: { flex: 1 },
  listName: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.textPrimary },
});
