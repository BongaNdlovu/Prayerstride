import { useEffect } from 'react';
import { ActivityIndicator, ImageBackground, SafeAreaView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { alpha, colors, fonts, scenes, spacing } from '../theme';
import LogoMark from '../components/LogoMark';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';

export default function SplashScreen({ onReady }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onReady) onReady();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <View style={styles.shell}>
      <ImageBackground source={scenes.dawn} style={styles.bg} resizeMode="cover">
        <LinearGradient colors={['rgba(4,8,16,0.3)', 'rgba(4,8,16,0.75)']} style={styles.overlay} />
        <SafeAreaView style={styles.content}>
          <View style={styles.brandBlock}>
            <LogoMark size={52} />
            <Heading level="display" style={styles.brand}>PrayerStride</Heading>
            <BodyText variant="caption" style={styles.tagline}>PRAY · TRUST · WALK</BodyText>
          </View>
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={colors.gold} size="large" />
            <BodyText variant="small" style={styles.loadingText}>Loading...</BodyText>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.screen },
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  content: { flex: 1, justifyContent: 'space-between', paddingVertical: spacing.xxxl },
  brandBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  brand: { fontSize: 38, letterSpacing: 0.5 },
  tagline: { letterSpacing: 4, fontFamily: fonts.sansSemiBold, color: colors.gold },
  loadingBlock: { alignItems: 'center', gap: spacing.md, paddingBottom: spacing.xxxl },
  loadingText: { fontFamily: fonts.serifRegular, color: alpha.ivory72 },
});
