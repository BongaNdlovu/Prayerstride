import { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

const styles = StyleSheet.create({
  shell: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink },
  brand: { color: colors.gold, fontSize: 34, fontWeight: '800', marginBottom: 16 },
  label: { marginTop: 12, color: colors.ivory, fontWeight: '700' },
});

export default function SplashScreen({ onReady }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onReady) onReady();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <SafeAreaView style={styles.shell}>
      <Text style={styles.brand}>PrayerStride</Text>
      <ActivityIndicator color={colors.gold} />
      <Text style={styles.label}>Preparing your walk...</Text>
    </SafeAreaView>
  );
}
