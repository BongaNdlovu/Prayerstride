import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { colors } from '../theme';

const styles = StyleSheet.create({
  glassCard: { width: '100%', borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', borderRadius: 24, padding: 16 },
  solidCard: { marginTop: 12, padding: 18, borderRadius: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.stone, shadowColor: '#101820', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  meta: { flexShrink: 1, color: 'rgba(248,243,234,0.55)', fontSize: 12 },
  tag: { overflow: 'hidden', borderRadius: 999, backgroundColor: 'rgba(200,137,43,0.18)', paddingHorizontal: 9, paddingVertical: 5, color: colors.gold, fontSize: 11, fontWeight: '800' },
  title: { marginTop: 10, color: colors.ivory, fontSize: 21, lineHeight: 26, fontWeight: '800' },
  body: { marginTop: 8, color: 'rgba(248,243,234,0.68)', fontSize: 14, lineHeight: 21 },
  cardEyebrow: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  cardTitle: { marginTop: 6, color: colors.navy, fontSize: 22, fontWeight: '800' },
  cardBody: { marginTop: 10, color: '#475467', fontSize: 15, lineHeight: 23 },
  authorText: { marginTop: 12, color: colors.muted, fontSize: 12, fontWeight: '700' },
});

export default function PrayerCard({ prayer, onPress, variant = 'glass' }) {
  const isGlass = variant === 'glass';

  return (
    <Pressable onPress={onPress} style={isGlass ? styles.glassCard : styles.solidCard}>
      {isGlass ? (
        <>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{prayer.authorName || prayer.name || 'PrayerStride'} - 2h ago</Text>
            {prayer.tag ? <Text style={styles.tag}>{prayer.tag}</Text> : null}
          </View>
          <Text style={styles.title}>{prayer.title}</Text>
          <Text numberOfLines={3} style={styles.body}>{prayer.body || prayer.text}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{prayer.prayedCount || prayer.count || 0} praying</Text>
            <Bookmark size={16} color="rgba(248,243,234,0.55)" />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.cardEyebrow}>Prayer Request</Text>
          <Text style={styles.cardTitle}>{prayer.title}</Text>
          <Text numberOfLines={3} style={styles.cardBody}>{prayer.body}</Text>
          <Text style={styles.authorText}>{prayer.authorName} - {prayer.prayedCount} praying</Text>
        </>
      )}
    </Pressable>
  );
}
