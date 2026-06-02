import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Mail } from 'lucide-react-native';
import { alpha, colors, fonts, sharedStyles, spacing } from '../theme';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';
import GlassCard from '../components/GlassCard';
import { getErrorMessage } from '../errors';
import { isValidEmail } from '../age';

export default function ResetPasswordScreen({ onResetPassword, onBack }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!isValidEmail(email)) {
      Alert.alert('Valid email required', 'Enter a valid email address.');
      return;
    }
    setBusy(true);
    try {
      await onResetPassword(email.trim());
      setSent(true);
    } catch (error) {
      Alert.alert('Could not send reset email', getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenScaffold pageContent scroll centerContent>
      <AppHeader centered showLogo title="Reset Password" onBack={onBack} />
      <BodyText variant="body" style={styles.subtitle}>Enter your email and we will send a reset link.</BodyText>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <GlassCard>
          {sent ? (
            <BodyText variant="body" style={styles.success}>Check your email for a password reset link.</BodyText>
          ) : (
            <>
              <View style={styles.inputRow}>
                <Mail size={18} color={colors.gold} />
                <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor={colors.textMuted} />
              </View>
              <PrimaryButton label={busy ? 'Sending...' : 'Send Reset Link'} onPress={submit} busy={busy} disabled={busy} style={styles.submit} />
            </>
          )}
          {onBack ? (
            <Pressable onPress={onBack} style={styles.linkWrap}>
              <BodyText variant="small" style={styles.link}>Back to Sign In</BodyText>
            </Pressable>
          ) : null}
        </GlassCard>
      </KeyboardAvoidingView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  subtitle: { textAlign: 'center', marginBottom: spacing.lg },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, ...sharedStyles.input, marginTop: 0 },
  input: { flex: 1, color: colors.textPrimary, fontFamily: fonts.sans, fontSize: 15 },
  submit: { marginTop: spacing.lg },
  linkWrap: { alignItems: 'center', marginTop: spacing.lg, paddingVertical: spacing.sm },
  link: { color: colors.gold, fontFamily: fonts.sansSemiBold },
  success: { textAlign: 'center' },
});
