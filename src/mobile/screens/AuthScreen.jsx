import { useEffect, useState } from 'react';
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
import { getErrorMessage } from '../errors';

export default function AuthScreen({ mode: initialMode, onSignIn, onRegister, onResetPassword, onSwitchMode, resumeRegistration = false, onResumeRegistration }) {
  const [mode, setMode] = useState(initialMode || 'signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isSeventhDayAdventist, setIsSeventhDayAdventist] = useState(false);
  const [churchName, setChurchName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

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
    if (!resumeRegistration && !isValidEmail(email)) {
      Alert.alert('Valid email required', 'Enter a valid email address.');
      return;
    }
    if (mode === 'register' && !resumeRegistration && password.length < 12) {
      Alert.alert('Password too short', 'Use at least 12 characters.');
      return;
    }
    if (mode === 'register' && !resumeRegistration && password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please confirm your password.');
      return;
    }
    if (mode === 'register' && !agreed) {
      Alert.alert('Terms required', 'Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (mode === 'register') {
      if (!resumeRegistration && (!name.trim() || name.trim().length > 80)) {
        Alert.alert('Display name required', 'Enter a display name with 80 characters or fewer.');
        return;
      }
      const parsedDob = parseDateOfBirth(dateOfBirth);
      if (!parsedDob) {
        Alert.alert('Date of birth required', 'Enter your date of birth as YYYY-MM-DD.');
        return;
      }
      if (ageBandFromAge(calculateAge(parsedDob)) !== 'adult') {
        Alert.alert('Age requirement', 'You must be at least 18 years old to use PrayerStride.');
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
        const registrationProfile = {
          dateOfBirth: dateOfBirth.trim(),
          isSeventhDayAdventist,
          churchName: isSeventhDayAdventist ? churchName.trim() : undefined,
          termsAccepted: agreed,
        };
        const result = resumeRegistration
          ? { registration: await onResumeRegistration(registrationProfile) }
          : await onRegister(email.trim(), password, name.trim(), registrationProfile);
      } else {
        await onSignIn(email.trim(), password);
      }
    } catch (error) {
      Alert.alert('Could not continue', getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <ScreenScaffold scroll pageContent centerContent={!isRegister}>
      <AppHeader centered showLogo title={isRegister ? 'Create Account' : 'Welcome Back'} />
      <BodyText variant="body" style={styles.subtitle}>
        {isRegister ? "Let's get you started on your prayer journey." : 'Sign in to continue your prayer journey.'}
      </BodyText>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <GlassCard style={styles.card}>
          {isRegister && !resumeRegistration && (
            <View style={styles.fieldWrap}>
              <BodyText variant="label" style={styles.fieldLabel}>Display Name</BodyText>
              <View style={styles.inputRow}>
                <User size={18} color={colors.gold} />
                <TextInput value={name} onChangeText={setName} placeholder="Your name" style={styles.input} placeholderTextColor={colors.textMuted} />
              </View>
            </View>
          )}
          {!resumeRegistration ? <View style={styles.fieldWrap}>
            <BodyText variant="label" style={styles.fieldLabel}>Email</BodyText>
            <View style={styles.inputRow}>
              <Mail size={18} color={colors.gold} />
              <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor={colors.textMuted} />
            </View>
          </View> : null}
          {isRegister && (
            <View style={styles.fieldWrap}>
              <BodyText variant="label" style={styles.fieldLabel}>Date of Birth</BodyText>
              <View style={styles.inputRow}>
                <User size={18} color={colors.gold} />
                <TextInput value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" autoCapitalize="none" style={styles.input} placeholderTextColor={colors.textMuted} />
              </View>
              <BodyText variant="caption" style={styles.helper}>You must be at least 18 years old to use PrayerStride.</BodyText>
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
              <View style={styles.fieldWrap}>
                <BodyText variant="label" style={styles.fieldLabel}>Name of your church {isSeventhDayAdventist ? '' : '(optional)'}</BodyText>
                <View style={styles.inputRow}>
                  <MapPin size={18} color={colors.gold} />
                  <TextInput value={churchName} onChangeText={setChurchName} placeholder="Write out the name of your church" style={styles.input} placeholderTextColor={colors.textMuted} />
                </View>
              </View>
            </>
          )}
          {!resumeRegistration ? <View style={styles.fieldWrap}>
            <BodyText variant="label" style={styles.fieldLabel}>Password</BodyText>
            <View style={styles.inputRow}>
              <Lock size={18} color={colors.gold} />
              <TextInput value={password} onChangeText={setPassword} placeholder="At least 12 characters" secureTextEntry={!showPassword} style={styles.input} placeholderTextColor={colors.textMuted} />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} color={colors.gold} /> : <Eye size={18} color={colors.gold} />}
              </Pressable>
            </View>
          </View> : null}
          {isRegister && !resumeRegistration && (
            <View style={styles.fieldWrap}>
              <BodyText variant="label" style={styles.fieldLabel}>Confirm Password</BodyText>
              <View style={styles.inputRow}>
                <Lock size={18} color={colors.gold} />
                <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="********" secureTextEntry={!showPassword} style={styles.input} placeholderTextColor={colors.textMuted} />
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
                {agreed ? <Check size={14} color={colors.white} strokeWidth={3} /> : null}
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
            label={busy ? 'One moment...' : resumeRegistration ? 'Finish Registration' : isRegister ? 'Create Account' : 'Sign In'}
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
        <Pressable
          onPress={toggleMode}
          style={styles.footerLink}
          accessibilityRole="button"
          accessibilityLabel={isRegister ? 'Sign in' : 'Create account'}
        >
          <BodyText variant="small">{resumeRegistration ? 'Need to use another account?' : isRegister ? 'Already have an account?' : "Don't have an account?"}</BodyText>
          <BodyText variant="small" style={styles.link}>{resumeRegistration ? 'Sign Out' : isRegister ? 'Sign In' : 'Create Account'}</BodyText>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  subtitle: { textAlign: 'center', marginBottom: spacing.lg },
  card: { marginTop: spacing.md },
  fieldWrap: { marginTop: spacing.md },
  fieldLabel: { color: colors.navy, marginBottom: spacing.xs },
  helper: { marginTop: spacing.xs },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    ...sharedStyles.input,
    marginTop: 0,
  },
  input: { flex: 1, color: colors.textPrimary, fontFamily: fonts.sans, fontSize: 15 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm + 2, marginTop: spacing.lg },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: colors.navy, marginTop: 2 },
  checkboxChecked: { backgroundColor: colors.navy },
  checkText: { flex: 1 },
  linkInline: { color: colors.navy, fontFamily: fonts.sansSemiBold },
  submit: { marginTop: spacing.xl },
  linkWrap: { alignItems: 'center', marginTop: spacing.md },
  link: { color: colors.navy, fontFamily: fonts.sansSemiBold },
  footerLink: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.xl, paddingVertical: spacing.md },
});
