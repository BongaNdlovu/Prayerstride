import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react-native';
import { useAuth } from '../src/mobile/AuthProvider';
import { colors } from '../src/mobile/theme';
import { registerForPushNotifications } from '../src/mobile/notifications';
import { back, createNavState, forward, go, reset } from '../src/mobile/navigation';
import { useSuspendedStatus } from '../src/mobile/useIsAdmin';
import BottomTabs from '../src/mobile/components/BottomTabs';
import CinematicScreen from '../src/mobile/components/CinematicScreen';
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
import WelcomeScreen from '../src/mobile/screens/WelcomeScreen';


const CinematicScroll = CinematicScreen;

const AUTH_ROUTES = ['splash', 'welcome', 'reminderSetup', 'stayConnected', 'signIn', 'createAccount', 'resetPassword'];
const MAIN_TAB_ROUTES = ['home', 'myPrayers', 'create', 'praise', 'myStats', 'profile'];

export default function MobileApp() {
  const { user, loading, signIn, register, signOut, resetPassword } = useAuth();
  const [nav, setNav] = useState(() => createNavState());
  const { suspended, suspendedReason } = useSuspendedStatus(user);

  useEffect(() => {
    if (!user) return;
    registerForPushNotifications().catch((error) => {
      console.warn('Push registration failed', error);
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
  }, [user, loading, suspended]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (loading || nav.screen === 'splash') return false;
      setNav((prev) => back(prev, user ? 'home' : 'signIn'));
      return true;
    });

    return () => subscription.remove();
  }, [loading, nav.screen, user]);

  if (loading) return <Centered label="Preparing PrayerStride..." />;

  const screen = nav.screen;
  const params = nav.params || {};
  const isMainTab = MAIN_TAB_ROUTES.includes(screen);
  const canGoBack = nav.history.length > 0 || (user && screen !== 'home');
  const canGoForward = (nav.future || []).length > 0;

  const handleGo = (s, p) => setNav((prev) => go(prev, s, p));
  const handleBack = (fallback) => setNav((prev) => back(prev, fallback || 'home'));
  const handleForward = () => setNav((prev) => forward(prev));
  const handleExit = () => {
    Alert.alert('Exit PrayerStride', 'Close the app now?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Exit',
        style: 'destructive',
        onPress: () => {
          if (BackHandler.exitApp) {
            BackHandler.exitApp();
            return;
          }
          Alert.alert('Exit unavailable', 'Use your device controls to close the app.');
        },
      },
    ]);
  };

  const content = renderScreen(screen, params, user, suspended, suspendedReason, signIn, register, signOut, resetPassword, handleGo, handleBack);

  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.appBody}>{content}</View>
      {screen !== 'splash' && (
        <NavigationControls
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          bottomOffset={isMainTab ? 86 : 18}
          onBack={() => handleBack('home')}
          onForward={handleForward}
          onExit={handleExit}
        />
      )}
      {isMainTab && <BottomTabs active={screen} onChange={handleGo} />}
    </SafeAreaView>
  );
}

function NavigationControls({ canGoBack, canGoForward, bottomOffset, onBack, onForward, onExit }) {
  return (
    <View style={[styles.navControls, { bottom: bottomOffset }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        disabled={!canGoBack}
        onPress={onBack}
        style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
      >
        <ChevronLeft size={21} color={colors.ivory} />
        <Text style={styles.navButtonText}>Back</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go forward"
        disabled={!canGoForward}
        onPress={onForward}
        style={[styles.iconNavButton, !canGoForward && styles.navButtonDisabled]}
      >
        <ChevronRight size={21} color={colors.ivory} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Exit app"
        onPress={onExit}
        style={styles.exitButton}
      >
        <LogOut size={19} color={colors.gold} />
        <Text style={styles.exitButtonText}>Exit</Text>
      </Pressable>
    </View>
  );
}

function renderScreen(screen, params, user, suspended, suspendedReason, signIn, register, signOut, resetPassword, goFn, backFn) {
  if (!user) {
    if (screen === 'splash') {
      return <SplashScreen onReady={() => goFn('welcome')} />;
    }
    if (screen === 'welcome') {
      return <WelcomeScreen onContinue={() => goFn('reminderSetup')} onCreateAccount={() => goFn('signIn')} />;
    }
    if (screen === 'reminderSetup') {
      return <ReminderSetupScreen onContinue={() => goFn('stayConnected')} onSkip={() => goFn('stayConnected')} />;
    }
    if (screen === 'stayConnected') {
      return <StayConnectedScreen onContinue={() => goFn('signIn')} />;
    }
    if (screen === 'resetPassword') {
      return <ResetPasswordScreen onResetPassword={resetPassword} onBack={() => backFn('signIn')} />;
    }
    if (screen === 'createAccount') {
      return <AuthScreen mode="register" onSignIn={signIn} onRegister={register} onResetPassword={() => goFn('resetPassword')} />;
    }
    if (screen === 'signIn') {
      return <AuthScreen mode="signIn" onSignIn={signIn} onRegister={register} onResetPassword={() => goFn('resetPassword')} />;
    }
    return <AuthScreen mode="signIn" onSignIn={signIn} onRegister={register} onResetPassword={() => goFn('resetPassword')} />;
  }

  if (suspended) {
    return <AccountSuspendedScreen reason={suspendedReason} onSignOut={signOut} />;
  }

  switch (screen) {
    case 'home': return <HomeScreen onOpenPrayer={(p) => goFn('detail', { prayer: p })} go={goFn} />;
    case 'myPrayers': return <MyPrayersScreen user={user} onOpenPrayer={(p) => goFn('detail', { prayer: p })} />;
    case 'discover': return <DiscoverScreen onOpenPrayer={(p) => goFn('detail', { prayer: p })} />;
    case 'create': return <CreatePrayerScreen user={user} />;
    case 'praise': return <PraiseScreen onOpenTestimony={(t) => goFn('praiseDetail', { testimony: t })} />;
    case 'myStats': return <MyStatsScreen user={user} />;
    case 'profile': return <ProfileScreen user={user} signOut={signOut} go={goFn} />;
    case 'detail': return <PrayerDetailScreen prayer={params.prayer} user={user} onBack={() => backFn('home')} go={goFn} />;
    case 'praiseDetail': return <PraiseDetailScreen testimony={params.testimony} onBack={() => backFn('praise')} />;
    case 'createTestimony': return <CreateTestimonyScreen user={user} linkedPrayerId={params.prayerId} onDone={() => backFn('praise')} />;
    case 'editRequest': return <EditRequestScreen prayer={params.prayer} user={user} onDone={() => backFn('myPrayers')} />;
    case 'prayerStopwatch': return <PrayerStopwatchScreen prayerId={params.prayerId} title={params.title} user={user} onDone={() => backFn('myStats')} />;
    case 'answeredPrayers': return <AnsweredPrayersScreen user={user} onOpenPrayer={(p) => goFn('detail', { prayer: p })} />;
    case 'settings': return <SettingsScreen go={goFn} signOut={signOut} />;
    case 'editProfile': return <EditProfileScreen user={user} onDone={() => backFn('profile')} />;
    case 'notifications': return <NotificationsScreen user={user} />;
    case 'notificationSettings': return <NotificationSettingsScreen user={user} />;
    case 'privacyPolicy': return <PrivacyPolicyScreen />;
    case 'termsOfService': return <TermsOfServiceScreen />;
    case 'helpCenter': return <HelpCenterScreen />;
    case 'support': return <SupportDonationScreen />;
    case 'following': return <FollowingScreen />;
    case 'announcements': return <AnnouncementsScreen />;
    case 'devotions': return <DevotionsScreen go={goFn} />;
    case 'guideDetail': return <GuideDetailScreen go={goFn} back={() => backFn('devotions')} />;
    case 'lessonReader': return <LessonReaderScreen />;
    case 'calendar': return <CalendarScreen />;
    case 'reminderSettings': return <RemindersScreen />;
    case 'achievements': return <AchievementsScreen />;
    case 'quickActions': return <QuickActionsScreen go={goFn} />;
    case 'adminDashboard': return <AdminDashboardScreen user={user} go={goFn} />;
    case 'reportDetails': return <ReportDetailsScreen report={params.report} go={goFn} back={() => backFn('adminDashboard')} />;
    case 'accountSuspended': return <AccountSuspendedScreen reason={suspendedReason} onSignOut={signOut} />;
    default: return <PlaceholderScreen screen={screen} onBack={() => backFn('home')} />;
  }
}


function PlaceholderScreen({ screen, onBack }) {
  return (
    <CinematicScroll>
      <Pressable onPress={onBack} style={styles.glassBackButton}>
        <Text style={styles.glassLinkText}>Back</Text>
      </Pressable>
      <View style={styles.glassCard}>
        <Text style={styles.oldPrayerTitle}>{screen}</Text>
        <Text style={styles.glassBody}>This screen is coming soon.</Text>
      </View>
    </CinematicScroll>
  );
}

function Centered({ label }) {
  return (
    <SafeAreaView style={styles.centered}>
      <ActivityIndicator color={colors.gold} />
      <Text style={styles.centeredText}>{label}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.ink },
  appBody: { flex: 1, backgroundColor: colors.ink },
  navControls: {
    position: 'absolute',
    left: 16,
    zIndex: 20,
    minHeight: 46,
    padding: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(248,243,234,0.2)',
    backgroundColor: 'rgba(8,11,19,0.86)',
  },
  navButton: { minHeight: 38, paddingHorizontal: 11, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(248,243,234,0.1)' },
  iconNavButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(248,243,234,0.1)' },
  exitButton: { minHeight: 38, paddingHorizontal: 11, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(248,243,234,0.1)' },
  navButtonDisabled: { opacity: 0.36 },
  navButtonText: { color: colors.ivory, fontSize: 13, fontWeight: '800' },
  exitButtonText: { color: colors.gold, fontSize: 13, fontWeight: '800' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink },
  centeredText: { marginTop: 12, color: colors.ivory, fontWeight: '700' },
  glassBackButton: { alignSelf: 'flex-start', marginTop: 16, marginBottom: 4, paddingVertical: 8, paddingRight: 16 },
  glassLinkText: { color: colors.gold, fontWeight: '800' },
  glassCard: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18 },
  oldPrayerTitle: { marginTop: 10, color: colors.ivory, fontSize: 21, lineHeight: 26, fontWeight: '800' },
  glassBody: { marginTop: 12, color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 23 },
});
