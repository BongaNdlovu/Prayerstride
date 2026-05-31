import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import { alpha, colors, fonts, sharedStyles, spacing } from '../theme';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';
import GlassCard from '../components/GlassCard';

export default function AuthScreen({ mode: initialMode, onSignIn, onRegister, onResetPassword, onSwitchMode }) {
  const [mode, setMode] = useState(initialMode || 'signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [busy, setBusy] = useState(false);

  const toggleMode = () => {
    if (onSwitchMode) onSwitchMode();
    else setMode(mode === 'register' ? 'signIn' : 'register');
  };

  const submit = async () => {
    if (mode === 'register' && password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please confirm your password.');
      return;
    }
    if (mode === 'register' && !agreed) {
      Alert.alert('Terms required', 'Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
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

  const isRegister = mode === 'register';

  return (
    <ScreenScaffold scroll pageContent>
      <AppHeader centered showLogo title={isRegister ? 'Create Account' : 'Welcome Back'} />
      <BodyText variant="body" style={styles.subtitle}>
        {isRegister ? "Let's get you started on your prayer journey." : 'Sign in to continue your prayer journey.'}
      </BodyText>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <GlassCard style={styles.card}>
          {isRegister && (
            <View style={styles.fieldWrap}>
              <BodyText variant="label" style={styles.fieldLabel}>Display Name</BodyText>
              <View style={styles.inputRow}>
                <User size={18} color={colors.gold} />
                <TextInput value={name} onChangeText={setName} placeholder="Your name" style={styles.input} placeholderTextColor={alpha.ivory55} />
              </View>
            </View>
          )}
          <View style={styles.fieldWrap}>
            <BodyText variant="label" style={styles.fieldLabel}>Email</BodyText>
            <View style={styles.inputRow}>
              <Mail size={18} color={colors.gold} />
              <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor={alpha.ivory55} />
            </View>
          </View>
          <View style={styles.fieldWrap}>
            <BodyText variant="label" style={styles.fieldLabel}>Password</BodyText>
            <View style={styles.inputRow}>
              <Lock size={18} color={colors.gold} />
              <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry={!showPassword} style={styles.input} placeholderTextColor={alpha.ivory55} />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} color={colors.gold} /> : <Eye size={18} color={colors.gold} />}
              </Pressable>
            </View>
          </View>
          {isRegister && (
            <View style={styles.fieldWrap}>
              <BodyText variant="label" style={styles.fieldLabel}>Confirm Password</BodyText>
              <View style={styles.inputRow}>
                <Lock size={18} color={colors.gold} />
                <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="••••••••" secureTextEntry={!showPassword} style={styles.input} placeholderTextColor={alpha.ivory55} />
              </View>
            </View>
          )}
          {isRegister && (
            <Pressable onPress={() => setAgreed(!agreed)} style={styles.checkRow}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]} />
              <BodyText variant="small" style={styles.checkText}>
                I agree to the Terms of Service and Privacy Policy.
              </BodyText>
            </Pressable>
          )}
          <PrimaryButton
            label={busy ? 'One moment...' : isRegister ? 'Create Account' : 'Sign In'}
            onPress={submit}
            busy={busy}
            style={styles.submit}
          />
          {!isRegister && onResetPassword ? (
            <Pressable onPress={onResetPassword} style={styles.linkWrap}>
              <BodyText variant="small" style={styles.link}>Forgot Password?</BodyText>
            </Pressable>
          ) : null}
        </GlassCard>
        <Pressable onPress={toggleMode} style={styles.footerLink}>
          <BodyText variant="small">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <BodyText variant="small" style={styles.link}>{isRegister ? 'Sign In' : 'Create Account'}</BodyText>
          </BodyText>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  subtitle: { textAlign: 'center', marginBottom: spacing.lg },
  card: { marginTop: spacing.md },
  fieldWrap: { marginTop: spacing.md },
  fieldLabel: { color: colors.gold, marginBottom: spacing.xs },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    ...sharedStyles.input,
    marginTop: 0,
  },
  input: { flex: 1, color: colors.ivory, fontFamily: fonts.sans, fontSize: 15 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm + 2, marginTop: spacing.lg },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: colors.gold, marginTop: 2 },
  checkboxChecked: { backgroundColor: colors.gold },
  checkText: { flex: 1 },
  submit: { marginTop: spacing.xl },
  linkWrap: { alignItems: 'center', marginTop: spacing.md },
  link: { color: colors.gold, fontFamily: fonts.sansSemiBold },
  footerLink: { alignItems: 'center', marginTop: spacing.xl, paddingVertical: spacing.md },
});
