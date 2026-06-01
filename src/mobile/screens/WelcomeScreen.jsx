import { ImageBackground, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { alpha, colors, fonts, scenes, spacing } from '../theme';
import LogoMark from '../components/LogoMark';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';
import SectionDivider from '../components/SectionDivider';

const DOTS = [0, 1, 2, 3];

export default function WelcomeScreen({ onContinue, onSignIn }) {
  return (
    <View style={styles.shell}>
      <ImageBackground source={scenes.chapel} style={styles.hero} resizeMode="cover">
        <LinearGradient colors={['transparent', colors.screen]} style={styles.heroFade} />
      </ImageBackground>
      <SafeAreaView style={styles.contentShell}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.brandBlock}>
          <LogoMark size={44} />
          <Heading level="h2" style={styles.brand}>PrayerStride</Heading>
          <SectionDivider />
          <BodyText variant="caption" style={styles.tagline}>PRAY · TRUST · WALK</BodyText>
          </View>
          <Heading level="h2" style={styles.headline}>Walk with God in prayer</Heading>
          <BodyText variant="body" style={styles.copy}>
            Prayer changes everything. Take one step today, and let God go with you.
          </BodyText>
          <View style={styles.dots}>
            {DOTS.map((dot) => (
              <View key={dot} style={[styles.dot, dot === 0 && styles.dotActive]} />
            ))}
          </View>
          <PrimaryButton label="Get Started" onPress={onContinue} icon={ChevronRight} style={styles.cta} />
          <PrimaryButton label="Sign In" onPress={onSignIn} variant="ghost" style={styles.ghostCta} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.screen },
  hero: { height: 280 },
  heroFade: { ...StyleSheet.absoluteFillObject },
  contentShell: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxxl },
  brandBlock: { alignItems: 'center', marginBottom: spacing.xxl },
  brand: { marginTop: spacing.sm, fontSize: 28 },
  tagline: { marginTop: spacing.sm, letterSpacing: 3, color: colors.gold },
  headline: { textAlign: 'center', fontSize: 30, marginBottom: spacing.md },
  copy: { textAlign: 'center', marginBottom: spacing.xxl },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xxl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: alpha.ivory20 },
  dotActive: { backgroundColor: colors.gold, width: 24 },
  cta: { marginBottom: spacing.md },
  ghostCta: { marginTop: spacing.xs },
});
