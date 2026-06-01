import { ImageBackground, StyleSheet, View } from 'react-native';
import { alpha, onDark, onDarkTypography, scenes, spacing } from '../theme';
import Heading from './Heading';
import BodyText from './BodyText';

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
        {eyebrow ? <Heading level="eyebrow" style={onDarkTypography.eyebrow}>{eyebrow}</Heading> : null}
        {title ? (
          <Heading level={compact ? 'h2' : 'h1'} style={[styles.title, onDarkTypography.h1, compact && styles.titleCompact]}>
            {title}
          </Heading>
        ) : null}
        {subtitle ? <BodyText variant="body" style={[styles.subtitle, { color: onDark.textSecondary }]}>{subtitle}</BodyText> : null}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 272, justifyContent: 'flex-end', overflow: 'hidden', borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  heroCompact: { minHeight: 218, marginHorizontal: -spacing.lg, marginBottom: spacing.lg },
  heroCompactFlush: { marginHorizontal: 0 },
  heroImage: { borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: alpha.overlayLight },
  heroContent: { minHeight: 272, justifyContent: 'flex-end', paddingHorizontal: spacing.xl, paddingTop: 64, paddingBottom: spacing.xxl },
  heroContentCompact: { minHeight: 218, paddingHorizontal: spacing.lg, paddingTop: 44, paddingBottom: 22 },
  title: { marginTop: spacing.sm, color: onDark.text },
  titleCompact: { fontSize: 28, lineHeight: 34 },
  subtitle: { marginTop: spacing.md, maxWidth: 290 },
});
