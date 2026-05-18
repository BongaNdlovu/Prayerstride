import { useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { colors, scenes } from '../theme';

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.ink },
  body: { flex: 1 },
  scene: { flex: 1, justifyContent: 'center' },
  sceneImage: { opacity: 0.92 },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,11,19,0.66)' },
  brandMark: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(200,137,43,0.16)' },
  title: { marginTop: 24, color: colors.ivory, fontSize: 32, fontWeight: '700', textAlign: 'center' },
  copy: { marginTop: 12, color: 'rgba(248,243,234,0.72)', fontSize: 15, lineHeight: 23, textAlign: 'center' },
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18, marginTop: 24 },
  input: { marginTop: 12, minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', paddingHorizontal: 16, color: colors.ivory, fontSize: 15 },
  button: { marginTop: 20, minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  linkButton: { alignItems: 'center', paddingVertical: 14 },
  linkText: { color: colors.gold, fontWeight: '800' },
  successText: { color: 'rgba(248,243,234,0.72)', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 20 },
});

export default function ResetPasswordScreen({ onResetPassword, onBack }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      Alert.alert('Missing email', 'Enter your email address.');
      return;
    }
    setBusy(true);
    try {
      await onResetPassword(email.trim());
      setSent(true);
    } catch (error) {
      Alert.alert('Could not send reset email', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.shell}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.body}>
        <ImageBackground source={scenes.chapel} resizeMode="cover" imageStyle={styles.sceneImage} style={styles.scene}>
          <View style={styles.overlay} />
          <View style={styles.inner}>
            <View style={styles.brandMark}>
              <Sparkles color={colors.gold} size={34} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.copy}>Enter your email and we will send a reset link.</Text>

            <View style={styles.card}>
              {sent ? (
                <Text style={styles.successText}>Check your email for a password reset link.</Text>
              ) : (
                <>
                  <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor="rgba(248,243,234,0.56)" />
                  <Pressable disabled={busy} onPress={submit} style={styles.button}>
                    <Text style={styles.buttonText}>{busy ? 'Sending...' : 'Send Reset Link'}</Text>
                  </Pressable>
                </>
              )}
              {onBack ? (
                <Pressable onPress={onBack} style={styles.linkButton}>
                  <Text style={styles.linkText}>Back to Sign In</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
