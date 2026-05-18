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
  title: { marginTop: 24, color: colors.ivory, fontSize: 42, fontWeight: '700', textAlign: 'center' },
  copy: { marginTop: 12, color: 'rgba(248,243,234,0.72)', fontSize: 16, lineHeight: 24, textAlign: 'center' },
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18, marginTop: 24 },
  input: { marginTop: 12, minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', paddingHorizontal: 16, color: colors.ivory, fontSize: 15 },
  button: { marginTop: 20, minHeight: 52, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  linkButton: { alignItems: 'center', paddingVertical: 14 },
  linkText: { color: colors.gold, fontWeight: '800' },
});

export default function AuthScreen({ mode: initialMode, onSignIn, onRegister, onResetPassword }) {
  const [mode, setMode] = useState(initialMode || 'signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === 'register') await onRegister(email.trim(), password, name.trim());
      else await onSignIn(email.trim(), password);
    } catch (error) {
      Alert.alert('Could not continue', error.message);
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
            <Text style={styles.title}>PrayerStride</Text>
            <Text style={styles.copy}>A daily walk in prayer, encouragement, and answered testimony.</Text>

            <View style={styles.card}>
              {mode === 'register' && (
                <TextInput value={name} onChangeText={setName} placeholder="Name" style={styles.input} placeholderTextColor="rgba(248,243,234,0.56)" />
              )}
              <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor="rgba(248,243,234,0.56)" />
              <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={styles.input} placeholderTextColor="rgba(248,243,234,0.56)" />
              <Pressable disabled={busy} onPress={submit} style={styles.button}>
                <Text style={styles.buttonText}>{busy ? 'One moment...' : mode === 'register' ? 'Create Account' : 'Sign In'}</Text>
              </Pressable>
              <Pressable onPress={() => setMode(mode === 'register' ? 'signIn' : 'register')} style={styles.linkButton}>
                <Text style={styles.linkText}>{mode === 'register' ? 'I already have an account' : 'Create a new account'}</Text>
              </Pressable>
              {mode === 'signIn' && onResetPassword ? (
                <Pressable onPress={onResetPassword} style={styles.linkButton}>
                  <Text style={[styles.linkText, { fontSize: 13 }]}>Forgot password?</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
