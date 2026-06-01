import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Check, Eye, EyeOff, Lock, Mail, MapPin, User } from 'lucide-react-native';
import { alpha, colors, fonts, sharedStyles, spacing } from '../theme';
import { PRIVACY_URL, TERMS_URL } from '../legal';
import {
  ageBandFromAge,
  calculateAge,
  parseDateOfBirth,
  isValidEmail,
} from '../age';
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
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [isSeventhDayAdventist, setIsSeventhDayAdventist] = useState(false);
  const [churchName, setChurchName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  const requiresGuardian = useMemo(() => {
    const parsed = parseDateOfBirth(dateOfBirth);
    if (!parsed) return false;
    return ageBandFromAge(calculateAge(parsed)) === 'minor';
  }, [dateOfBirth]);

  const toggleMode = () => {
    if (onSwitchMode) onSwitchMode();
    else setMode(mode === 'register' ? 'signIn' : 'register');
  };

  const openLegalUrl = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Could not open link', url);
    });
  };

  const submit = async () => {
    if (!isValidEmail(email)) {
      Alert.alert('Valid email required', 'Enter a valid email address.');
      return;
    }
    if (mode === 'register' && password.length < 12) {
      Alert.alert('Password too short', 'Use at least 12 characters.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please confirm your password.');
      return;
    }
    if (mode === 'register' && !agreed) {
      Alert.alert('Terms required', 'Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (mode === 'register') {
      const parsedDob = parseDateOfBirth(dateOfBirth);
      if (!parsedDob) {
        Alert.alert('Date of birth required', 'Enter your date of birth as YYYY-MM-DD.');
        return;
      }
      if (ageBandFromAge(calculateAge(parsedDob)) === 'under_16') {
        Alert.alert('Age requirement', 'You must be at least 16 years old to use PrayerStride.');
        return;
      }
      if (requiresGuardian && !guardianEmail.trim()) {
        Alert.alert('Guardian email required', 'Users aged 16-17 need a parent or guardian email for approval.');
        return;
      }
      if (isSeventhDayAdventist && !churchName.trim()) {
        Alert.alert('Church required', 'Please enter the church you attend.');
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === 'register') {
        const result = await onRegister(email.trim(), password, name.trim(), {
          dateOfBirth: dateOfBirth.trim(),
          guardianEmail: guardianEmail.trim() || undefined,
          isSeventhDayAdventist,
          churchName: isSeventhDayAdventist ? churchName.trim() : undefined,
          termsAccepted: agreed,
        });
        if (result?.registration?.communityAccess === 'pending_guardian'
          && result.registration.guardianEmailSent !== true) {
          Alert.alert(
            'Guardian email delayed',
            'Your account was created, but we could not send the guardian approval email. Please contact support@prayerstride.app.',
          );
        }
      } else {
        await onSignIn(email.trim(), password);
      }
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
          {isRegister && (
            <View style={styles.fieldWrap}>
              <BodyText variant="label" style={styles.fieldLabel}>Date of Birth</BodyText>
              <View style={styles.inputRow}>
                <User size={18} color={colors.gold} />
                <TextInput value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" autoCapitalize="none" style={styles.input} placeholderTextColor={alpha.ivory55} />
              </View>
              <BodyText variant="caption" style={styles.helper}>You must be 16 or older. Ages 16-17 require guardian approval.</BodyText>
            </View>
          )}
          {isRegister && requiresGuardian && (
            <View style={styles.fieldWrap}>
              <BodyText variant="label" style={styles.fieldLabel}>Parent / Guardian Email</BodyText>
              <View style={styles.inputRow}>
                <Mail size={18} color={colors.gold} />
                <TextInput value={guardianEmail} onChangeText={setGuardianEmail} placeholder="guardian@example.com" autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor={alpha.ivory55} />
              </View>
            </View>
          )}
          {isRegister && (
            <>
              <Pressable
                onPress={() => setIsSeventhDayAdventist((checked) => !checked)}
                style={styles.checkRow}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSeventhDayAdventist }}
              >
                <View style={[styles.checkbox, isSeventhDayAdventist && styles.checkboxChecked]}>
                  {isSeventhDayAdventist ? <Check size={14} color={colors.ink} strokeWidth={3} /> : null}
                </View>
                <BodyText variant="small" style={styles.checkText}>
                  Are you a Seventh-day Adventist?
                </BodyText>
              </Pressable>
              {isSeventhDayAdventist && (
                <View style={styles.fieldWrap}>
                  <BodyText variant="label" style={styles.fieldLabel}>Church</BodyText>
                  <View style={styles.inputRow}>
                    <MapPin size={18} color={colors.gold} />
                    <TextInput value={churchName} onChangeText={setChurchName} placeholder="Which church do you attend?" style={styles.input} placeholderTextColor={alpha.ivory55} />
                  </View>
                </View>
              )}
            </>
          )}
          <View style={styles.fieldWrap}>
            <BodyText variant="label" style={styles.fieldLabel}>Password</BodyText>
            <View style={styles.inputRow}>
              <Lock size={18} color={colors.gold} />
              <TextInput value={password} onChangeText={setPassword} placeholder="At least 12 characters" secureTextEntry={!showPassword} style={styles.input} placeholderTextColor={alpha.ivory55} />
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
                <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="********" secureTextEntry={!showPassword} style={styles.input} placeholderTextColor={alpha.ivory55} />
              </View>
            </View>
          )}
          {isRegister && (
            <Pressable
              onPress={() => setAgreed((checked) => !checked)}
              style={styles.checkRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreed }}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed ? <Check size={14} color={colors.ink} strokeWidth={3} /> : null}
              </View>
              <BodyText variant="small" style={styles.checkText}>
                I agree to the{' '}
                <Pressable onPress={() => openLegalUrl(TERMS_URL)}>
                  <BodyText variant="small" style={styles.linkInline}>Terms of Service</BodyText>
                </Pressable>
                {' '}and{' '}
                <Pressable onPress={() => openLegalUrl(PRIVACY_URL)}>
                  <BodyText variant="small" style={styles.linkInline}>Privacy Policy</BodyText>
                </Pressable>.
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
  helper: { marginTop: spacing.xs },
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
  linkInline: { color: colors.gold, fontFamily: fonts.sansSemiBold },
  submit: { marginTop: spacing.xl },
  linkWrap: { alignItems: 'center', marginTop: spacing.md },
  link: { color: colors.gold, fontFamily: fonts.sansSemiBold },
  footerLink: { alignItems: 'center', marginTop: spacing.xl, paddingVertical: spacing.md },
});
