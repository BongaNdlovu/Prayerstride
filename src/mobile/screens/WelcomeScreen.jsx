import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { colors } from '../theme';

const styles = StyleSheet.create({
  shell: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.ink },
  brandMark: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(200,137,43,0.16)', marginBottom: 24 },
  title: { color: colors.ivory, fontSize: 36, fontWeight: '800', textAlign: 'center' },
  subtitle: { marginTop: 12, color: 'rgba(248,243,234,0.72)', fontSize: 16, lineHeight: 24, textAlign: 'center' },
  button: { marginTop: 32, minHeight: 54, paddingHorizontal: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  linkButton: { marginTop: 16, paddingVertical: 14, alignItems: 'center' },
  linkText: { color: colors.gold, fontWeight: '800' },
});

export default function WelcomeScreen({ onContinue, onCreateAccount }) {
  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.brandMark}>
        <Sparkles color={colors.gold} size={34} />
      </View>
      <Text style={styles.title}>PrayerStride</Text>
      <Text style={styles.subtitle}>
        A daily walk in prayer, encouragement, and answered testimony.
      </Text>
      <Pressable onPress={onContinue} style={styles.button}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
      <Pressable onPress={onCreateAccount} style={styles.linkButton}>
        <Text style={styles.linkText}>I already have an account</Text>
      </Pressable>
    </SafeAreaView>
  );
}
