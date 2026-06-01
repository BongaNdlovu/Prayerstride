import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart, Star } from 'lucide-react-native';
import { alpha, colors, fonts, spacing } from '../theme';
import { formatRelativeFirestoreDate } from '../sessionStats';
import Heading from './Heading';
import BodyText from './BodyText';
import GlassCard from './GlassCard';

export default function TestimonyCard({ testimony, onPress, onReact }) {
  return (
    <Pressable onPress={onPress}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <Star size={12} color={colors.gold} fill={colors.gold} />
            <Text style={styles.eyebrow}>Answered Prayer</Text>
          </View>
          <BodyText variant="caption">{formatRelativeFirestoreDate(testimony.createdAt, '—')}</BodyText>
        </View>
        <Heading level="h4" style={styles.title}>{testimony.title}</Heading>
        <BodyText variant="body" numberOfLines={4}>{testimony.body}</BodyText>
        <View style={styles.footer}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(testimony.authorName || 'A').slice(0, 1)}</Text>
            </View>
            <Text style={styles.authorName}>{testimony.authorName || 'Anonymous'}</Text>
          </View>
          {onReact ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onReact(testimony.id, 'praiseGod');
              }}
              style={styles.likeBtn}
            >
              <Heart size={16} color={colors.coral} />
              <Text style={styles.likeCount}>{testimony.praiseGod || testimony.likes || 0}</Text>
            </Pressable>
          ) : (
            <View style={styles.likeBtn}>
              <Heart size={16} color={colors.coral} />
              <Text style={styles.likeCount}>{testimony.praiseGod || testimony.likes || 0}</Text>
            </View>
          )}
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyebrow: { fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.gold, letterSpacing: 0.5 },
  title: { marginTop: spacing.sm + 2, fontSize: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.navy08,
  },
  avatarText: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.navy },
  authorName: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.textPrimary },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeCount: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.coral },
});
