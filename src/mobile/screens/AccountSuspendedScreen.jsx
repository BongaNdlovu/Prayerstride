import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import { colors } from '../theme';

const styles = StyleSheet.create({
  shell: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.ink },
  iconWrap: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(200,137,43,0.16)', marginBottom: 24 },
  title: { color: colors.ivory, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { marginTop: 12, color: 'rgba(248,243,234,0.72)', fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 280 },
  reason: { marginTop: 8, color: 'rgba(248,243,234,0.5)', fontSize: 13, textAlign: 'center', maxWidth: 280 },
  button: { marginTop: 32, minHeight: 54, paddingHorizontal: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.08)' },
  buttonText: { color: colors.ivory, fontSize: 16, fontWeight: '800' },
});

export default function AccountSuspendedScreen({ reason, onSignOut }) {
  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.iconWrap}>
        <ShieldAlert color={colors.gold} size={32} />
      </View>
      <Text style={styles.title}>Account Suspended</Text>
      <Text style={styles.subtitle}>
        Your account has been temporarily suspended. This may be due to a violation of our community guidelines.
      </Text>
      {reason ? <Text style={styles.reason}>{reason}</Text> : null}
      <Pressable onPress={onSignOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>
    </SafeAreaView>
  );
}
