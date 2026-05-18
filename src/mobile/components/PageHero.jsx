import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { colors, scenes } from '../theme';

const styles = StyleSheet.create({
  hero: { minHeight: 272, justifyContent: 'flex-end', overflow: 'hidden', borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  heroCompact: { minHeight: 218, marginHorizontal: -16, marginBottom: 16 },
  heroCompactFlush: { marginHorizontal: 0 },
  heroImage: { borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,11,19,0.34)' },
  heroContent: { minHeight: 272, justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 64, paddingBottom: 24 },
  heroContentCompact: { minHeight: 218, paddingHorizontal: 16, paddingTop: 44, paddingBottom: 22 },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 2.4, textTransform: 'uppercase' },
  title: { marginTop: 8, color: colors.ivory, fontSize: 40, lineHeight: 46, fontWeight: '800' },
  titleCompact: { fontSize: 31, lineHeight: 37 },
  subtitle: { marginTop: 12, maxWidth: 290, color: 'rgba(248,243,234,0.78)', fontSize: 14, lineHeight: 23 },
});

export default function PageHero({ scene = 'dawn', eyebrow, title, subtitle, compact = false, bleed = true }) {
  return (
    <ImageBackground
      source={scenes[scene] || scenes.dawn}
      resizeMode="cover"
      imageStyle={styles.heroImage}
      style={[styles.hero, compact && styles.heroCompact, compact && !bleed && styles.heroCompactFlush]}
    >
      <View style={styles.heroOverlay} />
      <View style={[styles.heroContent, compact && styles.heroContentCompact]}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </ImageBackground>
  );
}
