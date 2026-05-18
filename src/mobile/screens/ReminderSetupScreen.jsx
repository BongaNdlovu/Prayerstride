import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { colors } from '../theme';

const styles = StyleSheet.create({
  shell: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.ink },
  iconWrap: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(200,137,43,0.16)', marginBottom: 24 },
  title: { color: colors.ivory, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { marginTop: 12, color: 'rgba(248,243,234,0.72)', fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 280 },
  button: { marginTop: 32, minHeight: 54, paddingHorizontal: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  skipButton: { marginTop: 16, paddingVertical: 14, alignItems: 'center' },
  skipText: { color: 'rgba(248,243,234,0.62)', fontWeight: '700' },
});

export default function ReminderSetupScreen({ onContinue, onSkip }) {
  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.iconWrap}>
        <Bell color={colors.gold} size={32} />
      </View>
      <Text style={styles.title}>Stay on track</Text>
      <Text style={styles.subtitle}>
        Enable reminders so you never miss a moment to pray for someone. You can change this anytime in settings.
      </Text>
      <Pressable onPress={onContinue} style={styles.button}>
        <Text style={styles.buttonText}>Enable Reminders</Text>
      </Pressable>
      <Pressable onPress={onSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Not now</Text>
      </Pressable>
    </SafeAreaView>
  );
}
