import { useEffect, useRef } from 'react';
import { ActivityIndicator, ImageBackground, SafeAreaView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, onDark, scenes, spacing } from '../theme';
import LogoMark from '../components/LogoMark';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';

export default function SplashScreen({ onReady }) {
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  useEffect(() => {
    const timer = setTimeout(() => {
      onReadyRef.current?.();
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.shell}>
      <ImageBackground source={scenes.dawn} style={styles.bg} resizeMode="cover">
        <LinearGradient colors={['rgba(7,32,59,0.25)', 'rgba(7,32,59,0.82)']} style={styles.overlay} />
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
  shell: { flex: 1, backgroundColor: colors.navyDeep },
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  content: { flex: 1, justifyContent: 'space-between', paddingVertical: spacing.xxxl },
  brandBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  brand: { fontSize: 38, letterSpacing: 0.5, color: onDark.text },
  tagline: { letterSpacing: 4, fontFamily: fonts.sansSemiBold, color: colors.gold },
  loadingBlock: { alignItems: 'center', gap: spacing.md, paddingBottom: spacing.xxxl },
  loadingText: { fontFamily: fonts.sans, color: onDark.textSecondary },
});
