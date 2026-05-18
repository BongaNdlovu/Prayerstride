import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18, shadowColor: '#101820', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 6 },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 2.4, textTransform: 'uppercase' },
  title: { marginTop: 10, color: colors.ivory, fontSize: 21, lineHeight: 26, fontWeight: '800' },
  body: { marginTop: 8, color: 'rgba(248,243,234,0.68)', fontSize: 14, lineHeight: 21 },
  meta: { marginTop: 10, flexShrink: 1, color: 'rgba(248,243,234,0.55)', fontSize: 12 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  reactionButton: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', paddingHorizontal: 14, paddingVertical: 9 },
  reactionText: { color: colors.ivory, fontSize: 12, fontWeight: '800' },
});

export default function TestimonyCard({ testimony, onPress, onReact }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.eyebrow}>Praise Report</Text>
      <Text style={styles.title}>{testimony.title}</Text>
      <Text style={styles.body}>{testimony.body}</Text>
      <Text style={styles.meta}>{testimony.authorName}</Text>
      {onReact ? (
        <View style={styles.actionRow}>
          <Pressable onPress={() => onReact(testimony.id, 'praiseGod')} style={styles.reactionButton}>
            <Text style={styles.reactionText}>Praise God - {testimony.praiseGod || 0}</Text>
          </Pressable>
          <Pressable onPress={() => onReact(testimony.id, 'amen')} style={styles.reactionButton}>
            <Text style={styles.reactionText}>Amen - {testimony.amen || 0}</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}
