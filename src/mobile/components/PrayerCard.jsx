import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import Heading from './Heading';
import BodyText from './BodyText';
import GlassCard from './GlassCard';

const CATEGORY_ICONS = {
  health: '❤',
  family: '🏠',
  finances: '📈',
  wisdom: '☀',
  peace: '🕊',
  job: '💼',
  protection: '🛡',
};

export default function PrayerCard({ prayer, onPress, variant = 'glass' }) {
  const icon = CATEGORY_ICONS[prayer.category?.toLowerCase()] || '🙏';
  const prayedCount = prayer.prayedCount || prayer.count || 0;
  const isActive = prayer.status !== 'answered';

  if (variant === 'list') {
    return (
      <Pressable onPress={onPress} style={styles.listRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(prayer.authorName || prayer.name || 'P').slice(0, 1)}</Text>
        </View>
        <View style={styles.listContent}>
          <Text style={styles.listName}>{prayer.authorName || prayer.name || 'Anonymous'}</Text>
          <BodyText variant="small" numberOfLines={1}>{prayer.title}</BodyText>
        </View>
        <ChevronRight size={18} color={alpha.ivory55} />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress}>
      <GlassCard style={styles.card}>
        <View style={styles.metaRow}>
          <View style={styles.iconWrap}>
            <Text style={styles.categoryIcon}>{icon}</Text>
          </View>
          <View style={styles.content}>
            <Heading level="h4" style={styles.title}>{prayer.title}</Heading>
            <BodyText variant="small" numberOfLines={2}>{prayer.body || prayer.text}</BodyText>
            <Text style={styles.praying}>{prayedCount} praying</Text>
          </View>
          <View style={styles.rightCol}>
            {isActive ? <View style={styles.activeBadge}><Text style={styles.activeText}>Active</Text></View> : null}
            <BodyText variant="caption">2h ago</BodyText>
            <ChevronRight size={16} color={alpha.ivory55} style={styles.chevron} />
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 0 },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
  },
  categoryIcon: { fontSize: 18 },
  content: { flex: 1 },
  title: { fontSize: 17, marginBottom: 4 },
  praying: { marginTop: 6, fontFamily: fonts.sansMedium, fontSize: 12, color: alpha.ivory55 },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  activeBadge: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeText: { fontFamily: fonts.sansSemiBold, fontSize: 10, color: colors.success },
  chevron: { marginTop: 4 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: alpha.ivory10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold22,
  },
  avatarText: { fontFamily: fonts.sansBold, fontSize: 16, color: colors.gold },
  listContent: { flex: 1 },
  listName: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.ivory },
});
