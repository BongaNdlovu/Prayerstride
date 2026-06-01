import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../src/mobile/AuthProvider';
import { colors, radii, spacing } from '../src/mobile/theme';
import { registerForPushNotifications } from '../src/mobile/notifications';
import { back, createNavState, go, reset } from '../src/mobile/navigation';
import { useSuspendedStatus } from '../src/mobile/useIsAdmin';
import { warn } from '../src/mobile/logger';
import BottomTabs from '../src/mobile/components/BottomTabs';
import ScreenScaffold from '../src/mobile/components/ScreenScaffold';
import AccountSuspendedScreen from '../src/mobile/screens/AccountSuspendedScreen';
import AchievementsScreen from '../src/mobile/screens/AchievementsScreen';
import AdminDashboardScreen from '../src/mobile/screens/AdminDashboardScreen';
import AnnouncementsScreen from '../src/mobile/screens/AnnouncementsScreen';
import AnsweredPrayersScreen from '../src/mobile/screens/AnsweredPrayersScreen';
import AuthScreen from '../src/mobile/screens/AuthScreen';
import CalendarScreen from '../src/mobile/screens/CalendarScreen';
import CreatePrayerScreen from '../src/mobile/screens/CreatePrayerScreen';
import CreateTestimonyScreen from '../src/mobile/screens/CreateTestimonyScreen';
import DevotionsScreen from '../src/mobile/screens/DevotionsScreen';
import DiscoverScreen from '../src/mobile/screens/DiscoverScreen';
import EditProfileScreen from '../src/mobile/screens/EditProfileScreen';
import EditRequestScreen from '../src/mobile/screens/EditRequestScreen';
import FollowingScreen from '../src/mobile/screens/FollowingScreen';
import GuideDetailScreen from '../src/mobile/screens/GuideDetailScreen';
import HelpCenterScreen from '../src/mobile/screens/HelpCenterScreen';
import HomeScreen from '../src/mobile/screens/HomeScreen';
import LessonReaderScreen from '../src/mobile/screens/LessonReaderScreen';
import MyPrayersScreen from '../src/mobile/screens/MyPrayersScreen';
import MyStatsScreen from '../src/mobile/screens/MyStatsScreen';
import NotificationSettingsScreen from '../src/mobile/screens/NotificationSettingsScreen';
import NotificationsScreen from '../src/mobile/screens/NotificationsScreen';
import PraiseDetailScreen from '../src/mobile/screens/PraiseDetailScreen';
import PraiseScreen from '../src/mobile/screens/PraiseScreen';
import PrayerDetailScreen from '../src/mobile/screens/PrayerDetailScreen';
import PrayerStopwatchScreen from '../src/mobile/screens/PrayerStopwatchScreen';
import PrivacyPolicyScreen from '../src/mobile/screens/PrivacyPolicyScreen';
import ProfileScreen from '../src/mobile/screens/ProfileScreen';
import QuickActionsScreen from '../src/mobile/screens/QuickActionsScreen';
import ReminderSetupScreen from '../src/mobile/screens/ReminderSetupScreen';
import RemindersScreen from '../src/mobile/screens/RemindersScreen';
import ReportDetailsScreen from '../src/mobile/screens/ReportDetailsScreen';
import ResetPasswordScreen from '../src/mobile/screens/ResetPasswordScreen';
import SettingsScreen from '../src/mobile/screens/SettingsScreen';
import SplashScreen from '../src/mobile/screens/SplashScreen';
import StayConnectedScreen from '../src/mobile/screens/StayConnectedScreen';
import SupportDonationScreen from '../src/mobile/screens/SupportDonationScreen';
import TermsOfServiceScreen from '../src/mobile/screens/TermsOfServiceScreen';
import AboutScreen from '../src/mobile/screens/AboutScreen';
import CopyrightScreen from '../src/mobile/screens/CopyrightScreen';
import WelcomeScreen from '../src/mobile/screens/WelcomeScreen';

const AUTH_ROUTES = ['splash', 'welcome', 'reminderSetup', 'stayConnected', 'signIn', 'createAccount', 'resetPassword'];
const MAIN_TAB_ROUTES = ['home', 'discover', 'create', 'praise', 'profile'];

export default function MobileApp() {
  const { user, loading, signIn, register, signOut, resetPassword, deleteAccount } = useAuth();
  const [nav, setNav] = useState(() => createNavState());
  const { suspended, suspendedReason } = useSuspendedStatus(user);

  useEffect(() => {
    if (!user) return;
    registerForPushNotifications().catch((error) => {
      warn('Push registration failed', error);
    });
  }, [user]);

  useEffect(() => {
    if (loading) return;
    const screen = nav.screen;

    if (!user) {
      if (!AUTH_ROUTES.includes(screen)) setNav(reset('splash'));
      return;
    }

    if (suspended && screen !== 'accountSuspended') {
      setNav(reset('accountSuspended'));
      return;
    }

    if (AUTH_ROUTES.includes(screen) || screen === 'splash') setNav(reset('home'));
  }, [user, loading, suspended, nav.screen]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (loading || nav.screen === 'splash') return false;
      setNav((prev) => back(prev, user ? 'home' : 'welcome'));
      return true;
    });

    return () => subscription.remove();
  }, [loading, nav.screen, user]);

  if (loading) return <Centered label="Preparing PrayerStride..." />;

  const screen = nav.screen;
  const params = nav.params || {};
  const isMainTab = MAIN_TAB_ROUTES.includes(screen);

  const handleGo = (s, p) => setNav((prev) => go(prev, s, p));
  const handleTabChange = (s, p) => setNav(reset(s, p));
  const handleBack = (fallback) => setNav((prev) => back(prev, fallback || 'home'));

  const content = renderScreen(screen, params, user, suspended, suspendedReason, signIn, register, signOut, resetPassword, deleteAccount, handleGo, handleBack);

  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.appBody}>{content}</View>
      {isMainTab && <BottomTabs active={screen} onChange={handleTabChange} />}
    </SafeAreaView>
  );
}

function renderScreen(screen, params, user, suspended, suspendedReason, signIn, register, signOut, resetPassword, deleteAccount, goFn, backFn) {
  if (!user) {
    if (screen === 'splash') {
      return <SplashScreen onReady={() => goFn('welcome')} />;
    }
    if (screen === 'welcome') {
      return <WelcomeScreen onContinue={() => goFn('reminderSetup')} onSignIn={() => goFn('signIn')} />;
    }
    if (screen === 'reminderSetup') {
      return <ReminderSetupScreen onContinue={() => goFn('stayConnected')} onSkip={() => goFn('stayConnected')} />;
    }
    if (screen === 'stayConnected') {
      return <StayConnectedScreen onContinue={() => goFn('createAccount')} />;
    }
    if (screen === 'resetPassword') {
      return <ResetPasswordScreen onResetPassword={resetPassword} onBack={() => backFn('signIn')} />;
    }
    if (screen === 'createAccount') {
      return <AuthScreen mode="register" onSignIn={signIn} onRegister={register} onResetPassword={() => goFn('resetPassword')} onSwitchMode={() => goFn('signIn')} />;
    }
    if (screen === 'signIn') {
      return <AuthScreen mode="signIn" onSignIn={signIn} onRegister={register} onResetPassword={() => goFn('resetPassword')} onSwitchMode={() => goFn('createAccount')} />;
    }
    return <AuthScreen mode="signIn" onSignIn={signIn} onRegister={register} onResetPassword={() => goFn('resetPassword')} onSwitchMode={() => goFn('createAccount')} />;
  }

  if (suspended) {
    return <AccountSuspendedScreen reason={suspendedReason} onSignOut={signOut} />;
  }

  switch (screen) {
    case 'home': return <HomeScreen onOpenPrayer={(p) => goFn('detail', { prayer: p })} go={goFn} />;
    case 'myPrayers': return <MyPrayersScreen user={user} onOpenPrayer={(p) => goFn('detail', { prayer: p })} onBack={() => backFn('profile')} />;
    case 'discover': return <DiscoverScreen onOpenPrayer={(p) => goFn('detail', { prayer: p })} />;
    case 'create': return <CreatePrayerScreen user={user} />;
    case 'praise': return <PraiseScreen onOpenTestimony={(t) => goFn('praiseDetail', { testimony: t })} />;
    case 'myStats': return <MyStatsScreen user={user} go={goFn} onBack={() => backFn('profile')} />;
    case 'profile': return <ProfileScreen user={user} signOut={signOut} go={goFn} />;
    case 'detail': return params.prayer
      ? <PrayerDetailScreen prayer={params.prayer} user={user} onBack={() => backFn('discover')} go={goFn} />
      : <PlaceholderScreen screen="Prayer unavailable" onBack={() => backFn('discover')} />;
    case 'praiseDetail': return params.testimony
      ? <PraiseDetailScreen testimony={params.testimony} onBack={() => backFn('praise')} />
      : <PlaceholderScreen screen="Praise report unavailable" onBack={() => backFn('praise')} />;
    case 'createTestimony': return <CreateTestimonyScreen user={user} linkedPrayerId={params.prayerId} onDone={() => backFn('praise')} />;
    case 'editRequest': return <EditRequestScreen prayer={params.prayer} user={user} onDone={() => backFn('myPrayers')} />;
    case 'prayerStopwatch': return <PrayerStopwatchScreen prayerId={params.prayerId} title={params.title} user={user} onBack={() => backFn('myStats')} onDone={() => backFn('myStats')} />;
    case 'answeredPrayers': return <AnsweredPrayersScreen user={user} onOpenPrayer={(p) => goFn('detail', { prayer: p })} onBack={() => backFn('profile')} />;
    case 'settings': return <SettingsScreen go={goFn} deleteAccount={deleteAccount} onBack={() => backFn('profile')} />;
    case 'editProfile': return <EditProfileScreen user={user} onBack={() => backFn('profile')} onDone={() => backFn('profile')} />;
    case 'notifications': return <NotificationsScreen user={user} onBack={() => backFn('profile')} />;
    case 'notificationSettings': return <NotificationSettingsScreen user={user} onBack={() => backFn('settings')} />;
    case 'privacyPolicy': return <PrivacyPolicyScreen onBack={() => backFn('settings')} />;
    case 'termsOfService': return <TermsOfServiceScreen onBack={() => backFn('settings')} />;
    case 'helpCenter': return <HelpCenterScreen onBack={() => backFn('settings')} />;
    case 'support': return <SupportDonationScreen onBack={() => backFn('settings')} />;
    case 'following': return <FollowingScreen user={user} onBack={() => backFn('profile')} />;
    case 'announcements': return <AnnouncementsScreen onBack={() => backFn('profile')} />;
    case 'devotions': return <DevotionsScreen go={goFn} onBack={() => backFn('profile')} />;
    case 'guideDetail': return <GuideDetailScreen guideId={params.guideId} go={goFn} back={() => backFn('devotions')} />;
    case 'lessonReader': return <LessonReaderScreen guideId={params.guideId} lessonId={params.lessonId} onBack={() => backFn('devotions')} />;
    case 'calendar': return <CalendarScreen user={user} onBack={() => backFn('profile')} />;
    case 'about': return <AboutScreen onBack={() => backFn('settings')} />;
    case 'copyright': return <CopyrightScreen onBack={() => backFn('settings')} />;
    case 'reminderSettings': return <RemindersScreen user={user} onBack={() => backFn('profile')} />;
    case 'achievements': return <AchievementsScreen user={user} onBack={() => backFn('profile')} />;
    case 'quickActions': return <QuickActionsScreen go={goFn} onBack={() => backFn('profile')} />;
    case 'adminDashboard': return <AdminDashboardScreen user={user} go={goFn} onBack={() => backFn('profile')} />;
    case 'reportDetails': return <ReportDetailsScreen report={params.report} go={goFn} back={() => backFn('adminDashboard')} />;
    case 'accountSuspended': return <AccountSuspendedScreen reason={suspendedReason} onSignOut={signOut} />;
    default: return <PlaceholderScreen screen={screen} onBack={() => backFn('home')} />;
  }
}

function PlaceholderScreen({ screen, onBack }) {
  return (
    <ScreenScaffold pageContent showLogo title={screen}>
      <Pressable onPress={onBack} style={styles.glassBackButton}>
        <Text style={styles.glassLinkText}>Back</Text>
      </Pressable>
      <View style={styles.glassCard}>
        <Text style={styles.placeholderTitle}>{screen}</Text>
        <Text style={styles.glassBody}>This screen is coming soon.</Text>
      </View>
    </ScreenScaffold>
  );
}

function Centered({ label }) {
  return (
    <SafeAreaView style={styles.centered}>
      <ActivityIndicator color={colors.navy} />
      <Text style={styles.centeredText}>{label}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.screen },
  appBody: { flex: 1, backgroundColor: colors.screen },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.screen },
  centeredText: { marginTop: spacing.md, color: colors.textPrimary, fontWeight: '700' },
  glassBackButton: { alignSelf: 'flex-start', marginTop: spacing.lg, marginBottom: spacing.xs, paddingVertical: spacing.sm, paddingRight: spacing.lg },
  glassLinkText: { color: colors.navy, fontWeight: '800' },
  glassCard: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.xxl, padding: spacing.xl - 2 },
  placeholderTitle: { marginTop: spacing.sm + 2, color: colors.textPrimary, fontSize: 21, lineHeight: 26, fontWeight: '800' },
  glassBody: { marginTop: spacing.md, color: colors.textSecondary, fontSize: 14, lineHeight: 23 },
});
