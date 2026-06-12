import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const mobileSrc = resolve(root, 'src', 'mobile');
const screensDir = resolve(mobileSrc, 'screens');
const componentsDir = resolve(mobileSrc, 'components');

const prototypeRoutes = {
  home: 'HomeScreen',
  community: 'CommunityScreen',
  stride: 'MyStatsScreen',
  profile: 'ProfileScreen',
  timer: 'PrayerStopwatchScreen',
  achievements: 'AchievementsScreen',
};

const preservedRoutes = {
  announcements: 'AnnouncementsScreen',
  adminDashboard: 'AdminDashboardScreen',
  editProfile: 'EditProfileScreen',
  reminderSettings: 'RemindersScreen',
  settings: 'SettingsScreen',
  notifications: 'NotificationsScreen',
  notificationSettings: 'NotificationSettingsScreen',
  reportDetails: 'ReportDetailsScreen',
  accountSuspended: 'AccountSuspendedScreen',
  privacyPolicy: 'PrivacyPolicyScreen',
  termsOfService: 'TermsOfServiceScreen',
  helpCenter: 'HelpCenterScreen',
  about: 'AboutScreen',
  copyright: 'CopyrightScreen',
};

const authScreens = ['welcome', 'reminderSetup', 'stayConnected', 'signIn', 'createAccount', 'resetPassword'];

const removedScreens = [
  'AnsweredPrayersScreen',
  'CalendarScreen',
  'CreatePrayerScreen',
  'CreateTestimonyScreen',
  'DailyChallengeScreen',
  'DevotionsScreen',
  'DiscoverScreen',
  'EditRequestScreen',
  'GuideDetailScreen',
  'LessonReaderScreen',
  'MyPrayersScreen',
  'PraiseDetailScreen',
  'PraiseScreen',
  'QuickActionsScreen',
  'SupportDonationScreen',
];

const componentFiles = [
  'GlassCard',
  'AppHeader',
  'BottomTabs',
  'EmptyState',
  'ToggleRow',
  'StatCard',
  'PrayerCard',
  'WeeklyBarChart',
  'ProgressRing',
  'AsyncState',
  'MotionPressable',
];

let passed = 0;
let failed = 0;

function check(description, condition) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${description}`);
  } else {
    failed++;
    console.error(`  FAIL: ${description}`);
  }
}

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf-8');
}

console.log('Prototype Migration Smoke Test\n');

const appSource = read('app/index.jsx');
const bottomTabsSource = read('src/mobile/components/BottomTabs.jsx');
const homeSource = read('src/mobile/screens/HomeScreen.jsx');
const profileSource = read('src/mobile/screens/ProfileScreen.jsx');
const adminSource = read('src/mobile/screens/AdminDashboardScreen.jsx');

console.log('1. Prototype routes are wired');
for (const [route, component] of Object.entries(prototypeRoutes)) {
  check(`Route '${route}' imports ${component}`, appSource.includes(component));
  check(`Route '${route}' has explicit handling`, appSource.includes(`case '${route}'`));
}

console.log('\n2. Preserved routes are still wired');
for (const [route, component] of Object.entries(preservedRoutes)) {
  check(`Route '${route}' imports ${component}`, appSource.includes(component));
  check(`Route '${route}' has explicit handling`, appSource.includes(`case '${route}'`));
}

console.log('\n3. Auth routes are still wired');
for (const route of authScreens) {
  check(`Auth route '${route}' has explicit handling`, appSource.includes(`screen === '${route}'`));
}
check('Splash route is removed', !appSource.includes("screen === 'splash'") && !appSource.includes("reset('splash'"));
check('AuthScreen still handles sign-in/create-account', appSource.includes('AuthScreen mode="signIn"') && appSource.includes('AuthScreen mode="register"'));

console.log('\n4. Legacy standalone screens are gone');
for (const component of removedScreens) {
  check(`${component}.jsx removed`, !existsSync(resolve(screensDir, `${component}.jsx`)));
  check(`${component} not imported by app shell`, !appSource.includes(component));
}
[
  'answeredPrayers',
  'calendar',
  'create',
  'createTestimony',
  'dailyChallenge',
  'devotions',
  'discover',
  'editRequest',
  'guideDetail',
  'lessonReader',
  'myPrayers',
  'praise',
  'praiseDetail',
  'quickActions',
  'support',
].forEach((route) => {
  check(`Legacy route '${route}' removed`, !appSource.includes(`case '${route}'`));
});

console.log('\n5. Prototype tabs and feed behavior');
check('Bottom tabs use Feed, Chain, Stride, Profile', bottomTabsSource.includes("key: 'home'") && bottomTabsSource.includes("key: 'community'") && bottomTabsSource.includes("key: 'stride'") && bottomTabsSource.includes("key: 'profile'"));
check('Timer is focused from Home prayer card', homeSource.includes("go('timer', { prayerId: currentPrayer.id"));
check('Home creates prototype prayer fields', homeSource.includes('addPrayer') && homeSource.includes('PRAYER_CATEGORIES') && homeSource.includes('composeScriptureRef'));
check('Home updates answered prayers without testimony coupling', homeSource.includes('handleMarkAnswered(currentPrayer)') && !homeSource.includes('addTestimony'));
check('Home uses explicit feed controls instead of vertical gestures', homeSource.includes('feedNavBtn') && homeSource.includes('setCurrentFeedIndex') && !homeSource.includes('gesture.dy'));

console.log('\n6. Preserved feature access');
check('Profile links to reminders', profileSource.includes("route: PROFILE_ROUTES.reminderSettings"));
check('Profile links to edit profile', profileSource.includes("route: 'editProfile'"));
check('Profile links to announcements', profileSource.includes("route: 'announcements'"));
check('Profile keeps admin dashboard access', profileSource.includes("go('adminDashboard')"));
check('Admin dashboard can create announcements', adminSource.includes('adminCreateAnnouncement') && adminSource.includes('adminArchiveAnnouncement'));

console.log('\n7. Shared components exist');
for (const name of componentFiles) {
  check(`Component: ${name}.jsx`, existsSync(resolve(componentsDir, `${name}.jsx`)));
}

console.log('\n8. No web-only APIs in mobile shell');
const checkedFiles = [
  resolve(root, 'app', 'index.jsx'),
  ...Object.values({ ...prototypeRoutes, ...preservedRoutes }).map((component) => resolve(screensDir, `${component}.jsx`)),
  ...componentFiles.map((component) => resolve(componentsDir, `${component}.jsx`)),
  resolve(mobileSrc, 'firebase.js'),
  resolve(mobileSrc, 'usePrayerData.js'),
  resolve(mobileSrc, 'useAnnouncements.js'),
  resolve(mobileSrc, 'useNotificationSettings.js'),
];
const banned = ["from 'react-dom'", 'from "react-dom"', 'window.confirm', 'document.querySelector', 'localStorage.setItem', 'localStorage.getItem'];
for (const filePath of checkedFiles) {
  if (!existsSync(filePath)) continue;
  const source = readFileSync(filePath, 'utf-8');
  const label = filePath.replace(root, '');
  for (const token of banned) {
    check(`${label}: no ${token}`, !source.includes(token));
  }
}

console.log('\n9. Web auth support');
const firebaseSource = read('src/mobile/firebase.js');
check('Firebase auth uses browser auth on web', firebaseSource.includes("Platform.OS === 'web'") && firebaseSource.includes('return getAuth(app)'));
check('Firebase auth keeps native AsyncStorage persistence path', firebaseSource.includes('getReactNativePersistence(AsyncStorage)'));

console.log('\n10. Backend fields for prototype prayers');
const workerSource = read('worker/index.js');
const rulesSource = read('firestore.rules');
check('Worker stores category and scriptureRef', workerSource.includes('category') && workerSource.includes('scriptureRef'));
check('Firestore rules allow category and scriptureRef', rulesSource.includes('optionalPrayerCategory') && rulesSource.includes('scriptureRef'));

console.log('\n---');
console.log(`${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
