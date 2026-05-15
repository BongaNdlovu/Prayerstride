import { useMemo } from 'react';
import { BookOpen, Leaf, ShieldCheck } from 'lucide-react';
import PrayingHandsIcon from './components/PrayingHandsIcon';
import PhoneFrame from './components/PhoneFrame';
import Splash from './components/screens/Splash';
import Welcome from './components/screens/Welcome';
import ReminderSetup from './components/screens/ReminderSetup';
import StayConnected from './components/screens/StayConnected';
import SignIn from './components/screens/SignIn';
import CreateAccount from './components/screens/CreateAccount';
import ResetPassword from './components/screens/ResetPassword';
import HomeScreen from './components/screens/HomeScreen';
import Discover from './components/screens/Discover';
import Detail from './components/screens/Detail';
import PrayerStopwatch from './components/screens/PrayerStopwatch';
import Create from './components/screens/Create';
import CreateTestimony from './components/screens/CreateTestimony';
import EditRequest from './components/screens/EditRequest';
import EditProfile from './components/screens/EditProfile';
import QuickActions from './components/screens/QuickActions';
import Praise from './components/screens/Praise';
import PraiseDetail from './components/screens/PraiseDetail';
import Profile from './components/screens/Profile';
import Notifications from './components/screens/Notifications';
import Following from './components/screens/Following';
import Announcements from './components/screens/Announcements';
import Devotions from './components/screens/Devotions';
import GuideDetail from './components/screens/GuideDetail';
import LessonReader from './components/screens/LessonReader';
import CalendarScreen from './components/screens/CalendarScreen';
import MyStats from './components/screens/MyStats';
import AnsweredPrayers from './components/screens/AnsweredPrayers';
import MyPrayers from './components/screens/MyPrayers';
import Achievements from './components/screens/Achievements';
import Reminders from './components/screens/Reminders';
import Settings from './components/screens/Settings';
import NotificationSettings from './components/screens/NotificationSettings';
import SupportDonation from './components/screens/SupportDonation';
import HelpCenter from './components/screens/HelpCenter';
import PrivacyPolicy from './components/screens/PrivacyPolicy';
import TermsOfService from './components/screens/TermsOfService';
import AdminDashboard from './components/screens/AdminDashboard';
import ReportDetails from './components/screens/ReportDetails';
import AccountSuspended from './components/screens/AccountSuspended';
import { useNavigation } from './hooks/useNavigation';
import { APP_SCREENS } from './data/constants';
import { useAuth } from './contexts/AuthContext.jsx';

const NAVY = "#082A4A";
const GOLD = "#C8892B";
const IVORY = "#F8F3EA";
const STONE = "#E7DFD2";
const INK = "#101820";
const PROTECTED_SCREENS = new Set([
  "create", "createTestimony", "editRequest", "editProfile", "quickActions", "prayerStopwatch",
  "following", "announcements", "devotions", "guideDetail", "lessonReader", "calendar", "myStats",
  "answeredPrayers", "myPrayers", "achievements", "reminderSettings", "profile", "settings",
  "notificationSettings", "support", "helpCenter", "privacyPolicy", "termsOfService", "praise", "adminDashboard",
  "praiseDetail", "reportDetails", "notifications",
]);

function runSmokeTests() {
  console.assert(APP_SCREENS.includes("home"), "Smoke test: home screen route should exist");
  console.assert(typeof PrayingHandsIcon === "function", "Smoke test: custom prayer icon should render without lucide HandsPraying");
}

runSmokeTests();

export default function App() {
  const { user, loading, signIn, register, signOut, updateUserProfile, deleteAccount: deleteFirebaseAccount } = useAuth();
  const { onboarded, setOnboarded, screen, active, params, go, back, resetTo, handleNav } = useNavigation();

  const authUser = user ? {
    id: user.uid,
    uid: user.uid,
    name: user.displayName || user.email,
    email: user.email,
    photoURL: user.photoURL,
  } : null;

  const content = useMemo(() => {
    const setNav = handleNav;

    const handleSignIn = async ({ email, password }) => {
      try {
        await signIn(email, password);
        resetTo('home');
        return { ok: true };
      } catch {
        return { error: 'Email or password is incorrect.' };
      }
    };

    const handleCreateAccount = async ({ name, email, password }) => {
      try {
        await register(email, password, name);
        resetTo('home');
        return { ok: true };
      } catch (error) {
        return { error: error.message || 'Could not create account.' };
      }
    };

    const handleSignOut = async () => {
      await signOut();
      resetTo('signIn');
    };

    const exitApp = async () => {
      await signOut();
      setOnboarded(false);
      resetTo('splash');
    };

    const deleteAccount = async () => {
      await deleteFirebaseAccount();

      if (typeof window !== 'undefined') {
        [
          'auth:user',
          'user:prayer-requests',
          'user:testimonies',
          'notifications:items',
          'notifications:prayerActivity',
          'notifications:reminders',
          'notifications:channels',
          'prayers:answered',
          `profile:${authUser?.id || 'guest'}`,
          `profile:${authUser?.id || 'guest'}:avatar`,
        ].forEach((key) => window.localStorage.removeItem(key));
      }

      setOnboarded(false);
      resetTo('splash');
    };

    if (loading || screen === "splash") {
      if (loading && screen !== "splash") {
        return (
          <Splash
            onEnter={() => {
              setOnboarded(true);
              go("welcome");
            }}
          />
        );
      }
      return (
        <Splash
          onEnter={() => {
            setOnboarded(true);
            go(user ? "home" : "welcome");
          }}
        />
      );
    }
    if (!authUser && PROTECTED_SCREENS.has(screen)) {
      return <SignIn onBack={() => resetTo("home")} onSignIn={handleSignIn} onForgot={() => go("resetPassword")} onGoSignUp={() => go("createAccount")} />;
    }
    if (authUser && (screen === "signIn" || screen === "createAccount")) {
      return <HomeScreen onNavigate={setNav} onGo={go} activeTab="home" />;
    }
    if (screen === "welcome") return <Welcome onContinue={() => go("reminderSetup")} />;
    if (screen === "reminderSetup") return <ReminderSetup onBack={() => go("welcome")} onContinue={() => go("stayConnected")} />;
    if (screen === "stayConnected") return <StayConnected onBack={() => go("reminderSetup")} onContinue={() => go("home")} onSkip={() => go("home")} />;
    if (screen === "signIn") return <SignIn onBack={() => go("home")} onSignIn={handleSignIn} onForgot={() => go("resetPassword")} onGoSignUp={() => go("createAccount")} />;
    if (screen === "createAccount") return <CreateAccount onBack={() => go("signIn")} onCreate={handleCreateAccount} />;
    if (screen === "resetPassword") return <ResetPassword onBack={() => go("signIn")} onSend={() => {}} />;
    if (screen === "home") return <HomeScreen onNavigate={setNav} onGo={go} activeTab={active} />;
    if (screen === "discover") return <Discover onGo={go} activeTab={active} onNavigate={setNav} />;
    if (screen === "detail") return <Detail request={params.request} user={authUser} onBack={() => back("home")} onGo={go} activeTab={active} onNavigate={setNav} />;
    if (screen === "prayerStopwatch") return <PrayerStopwatch request={params.request} onBack={() => back("detail")} activeTab={active} onNavigate={setNav} />;
    if (screen === "create") return <Create onGo={go} activeTab={active} onNavigate={setNav} user={authUser} />;
    if (screen === "createTestimony") return <CreateTestimony onBack={() => back("praise")} onDone={() => go("praise")} activeTab={active} onNavigate={setNav} user={authUser} prayerId={params.prayerId} prayerTitle={params.prayerTitle} />;
    if (screen === "editRequest") return <EditRequest onBack={() => back("myPrayers")} request={params.request} />;
    if (screen === "editProfile") return <EditProfile onBack={() => back("settings")} activeTab={active} onNavigate={setNav} user={authUser} setUser={updateUserProfile} />;
    if (screen === "quickActions") return <QuickActions onClose={() => go("home")} onCreateRequest={() => go("create")} onCreateTestimony={() => go("createTestimony")} onMyPrayers={() => go("myPrayers")} onInvite={() => go("following")} />;
    if (screen === "following") return <Following onBack={() => back("profile")} activeTab={active} onNavigate={setNav} />;
    if (screen === "announcements") return <Announcements onBack={() => back("profile")} activeTab={active} onNavigate={setNav} />;
    if (screen === "devotions") return <Devotions onBack={() => back("profile")} onGo={go} activeTab={active} onNavigate={setNav} />;
    if (screen === "guideDetail") return <GuideDetail onBack={() => back("devotions")} activeTab={active} onNavigate={setNav} onStart={() => go("lessonReader")} />;
    if (screen === "lessonReader") return <LessonReader onBack={() => back("guideDetail")} />;
    if (screen === "calendar") return <CalendarScreen onBack={() => go("profile")} activeTab={active} onNavigate={setNav} />;
    if (screen === "myStats") return <MyStats onBack={() => go("home")} activeTab={active} onNavigate={setNav} onGo={go} />;
    if (screen === "answeredPrayers") return <AnsweredPrayers onBack={() => go("profile")} activeTab={active} onNavigate={setNav} />;
    if (screen === "myPrayers") return <MyPrayers onBack={() => go("home")} activeTab={active} onNavigate={setNav} onGo={go} user={authUser} />;
    if (screen === "achievements") return <Achievements onBack={() => go("profile")} activeTab={active} onNavigate={setNav} />;
    if (screen === "reminderSettings") return <Reminders onBack={() => go("profile")} activeTab={active} onNavigate={setNav} />;
    if (screen === "praise") return <Praise activeTab={active} onNavigate={setNav} onGo={go} user={authUser} />;
    if (screen === "praiseDetail") return <PraiseDetail testimony={params.testimony} onBack={() => back("praise")} activeTab={active} onNavigate={setNav} onGo={go} user={authUser} />;
    if (screen === "profile") return <Profile activeTab={active} onNavigate={setNav} onGo={go} user={authUser} />;
    if (screen === "settings") return <Settings onBack={() => back("profile")} activeTab={active} onNavigate={setNav} onSection={(key) => {
      const sectionRoutes = { editProfile: 'editProfile', notifications: 'notificationSettings', help: 'helpCenter', feedback: 'support', privacy: 'privacyPolicy', about: 'termsOfService', prayerPreferences: 'reminderSettings' };
      if (sectionRoutes[key]) go(sectionRoutes[key]);
    }} onSignOut={handleSignOut} onExitApp={exitApp} onDeleteAccount={deleteAccount} />;
    if (screen === "notificationSettings") return <NotificationSettings onBack={() => back("settings")} activeTab={active} onNavigate={setNav} />;
    if (screen === "support") return <SupportDonation onBack={() => back("settings")} activeTab={active} onNavigate={setNav} />;
    if (screen === "helpCenter") return <HelpCenter onBack={() => back("settings")} activeTab={active} onNavigate={setNav} />;
    if (screen === "privacyPolicy") return <PrivacyPolicy onBack={() => back("settings")} activeTab={active} onNavigate={setNav} />;
    if (screen === "termsOfService") return <TermsOfService onBack={() => back("settings")} activeTab={active} onNavigate={setNav} />;
    if (screen === "adminDashboard") return <AdminDashboard onBack={() => go("profile")} activeTab={active} onNavigate={setNav} onGo={go} />;
    if (screen === "reportDetails") return <ReportDetails onBack={() => go("adminDashboard")} activeTab={active} onNavigate={setNav} reportId={params.reportId} />;
    if (screen === "accountSuspended") return <AccountSuspended onAppeal={() => {}} onSignIn={() => go("signIn")} />;
    if (screen === "notifications") return <Notifications onBack={() => go("home")} activeTab={active} onNavigate={setNav} />;
    return <HomeScreen onNavigate={setNav} onGo={go} activeTab={active} />;
  }, [authUser, loading, onboarded, setOnboarded, screen, active, params, go, back, resetTo, handleNav, signIn, register, signOut, updateUserProfile, deleteFirebaseAccount, user]);

  return (
    <>
      <div className="h-dvh w-full overflow-hidden bg-sand text-ink md:hidden">
        {content}
      </div>

      <div className="hidden min-h-screen bg-ivory px-4 py-8 text-ink md:block">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-6 border-b border-[#d8cec0] pb-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-serif text-5xl leading-tight text-navy md:text-7xl">PrayerStride</h1>
            <p className="mt-2 font-serif text-2xl text-[#9B6A2B] md:text-3xl">One app preview - Medium-style UI</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs md:grid-cols-6">
            {[NAVY, IVORY, STONE, GOLD, "#D7D4CF", INK].map((c) => (
              <div key={c} className="h-10 w-12 rounded-lg border shadow-sm" style={{ background: c }} />
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[420px_1fr] lg:items-start">
          <div className="rounded-[32px] border border-[#dfd4c5] bg-white/45 p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3 text-navy">
              <Leaf />
              <span className="font-serif text-2xl">Design direction</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                [BookOpen, "Editorial", "Readable, content-first."],
                [Leaf, "Calm", "Soft space, gentle pace."],
                [ShieldCheck, "Trustworthy", "Secure and private."],
                [PrayingHandsIcon, "Prayer-centered", "Faith, hope, community."],
              ].map(([Icon, title, text]) => (
                <div key={title} className="rounded-2xl border border-[#e3d9ca] bg-sand p-4">
                  <Icon className="text-navy" />
                  <div className="mt-3 font-semibold">{title}</div>
                  <p className="mt-1 text-sm text-slate-600">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-[#e3d9ca] bg-sand p-4">
              <h3 className="font-serif text-xl text-navy">Screens included</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">39+ screens: onboarding, auth, home feed, prayer hub, explore, prayer detail, create request/testimony, devotions, calendar, stats, reminders, achievements, settings, admin, and more. Use the phone navigation to move through the app.</p>
            </div>
          </div>

          <div className="lg:sticky lg:top-8">
            <p className="mb-3 text-center text-sm font-semibold text-slate-600">Desktop phone preview</p>
            <PhoneFrame>{content}</PhoneFrame>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
