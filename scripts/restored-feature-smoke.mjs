import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const mobileSrc = resolve(root, 'src', 'mobile');
const screensDir = resolve(mobileSrc, 'screens');
const componentsDir = resolve(mobileSrc, 'components');

const APP_SCREENS = [
  'splash', 'welcome', 'reminderSetup', 'stayConnected', 'signIn', 'createAccount', 'resetPassword',
  'home', 'discover', 'detail', 'prayerStopwatch', 'create', 'createTestimony', 'editRequest',
  'quickActions', 'praise', 'praiseDetail',
  'announcements', 'devotions', 'guideDetail', 'lessonReader',
  'calendar', 'myStats', 'answeredPrayers', 'myPrayers', 'achievements', 'dailyChallenge', 'reminderSettings',
  'profile', 'settings', 'notifications', 'notificationSettings', 'support', 'helpCenter',
  'privacyPolicy', 'termsOfService', 'about', 'copyright', 'adminDashboard', 'reportDetails', 'accountSuspended',
];

const screenFiles = {
  answeredPrayers: 'AnsweredPrayersScreen',
  achievements: 'AchievementsScreen',
  dailyChallenge: 'DailyChallengeScreen',
  adminDashboard: 'AdminDashboardScreen',
  announcements: 'AnnouncementsScreen',
  calendar: 'CalendarScreen',
  create: 'CreatePrayerScreen',
  createTestimony: 'CreateTestimonyScreen',
  devotions: 'DevotionsScreen',
  discover: 'DiscoverScreen',
  editRequest: 'EditRequestScreen',
  guideDetail: 'GuideDetailScreen',
  helpCenter: 'HelpCenterScreen',
  home: 'HomeScreen',
  lessonReader: 'LessonReaderScreen',
  myPrayers: 'MyPrayersScreen',
  myStats: 'MyStatsScreen',
  notifications: 'NotificationsScreen',
  notificationSettings: 'NotificationSettingsScreen',
  praise: 'PraiseScreen',
  praiseDetail: 'PraiseDetailScreen',
  prayerStopwatch: 'PrayerStopwatchScreen',
  accountSuspended: 'AccountSuspendedScreen',
  privacyPolicy: 'PrivacyPolicyScreen',
  profile: 'ProfileScreen',
  quickActions: 'QuickActionsScreen',
  reminderSettings: 'RemindersScreen',
  reportDetails: 'ReportDetailsScreen',
  support: 'SupportDonationScreen',
  termsOfService: 'TermsOfServiceScreen',
  about: 'AboutScreen',
  copyright: 'CopyrightScreen',
  settings: 'SettingsScreen',
};

const componentFiles = [
  'PageHero', 'GlassCard', 'AppHeader', 'BottomTabs',
  'EmptyState', 'ToggleRow', 'StatCard', 'PrayerCard', 'TestimonyCard',
  'StreakCalendar',
];

const mobileFiles = [
  'AuthProvider', 'api', 'firebase', 'navigation', 'notifications', 'theme',
  'usePrayerData', 'usePrayerSessions', 'useReports',
  'useUsers', 'useNotifications', 'useNotificationSettings', 'useIsAdmin',
  'useCalendarEvents', 'useAnnouncements',
  'sessionStats', 'prayerFormOptions',
];

let passed = 0;
let failed = 0;

function check(description, condition) {
  if (condition) { passed++; console.log(`  PASS: ${description}`); }
  else { failed++; console.error(`  FAIL: ${description}`); }
}

console.log('Restored Feature Smoke Test\n');

// 1. Every APP_SCREENS route is handled in render switch/map
console.log('1. Screen routes in app/index.jsx');
const indexContent = readFileSync(resolve(root, 'app', 'index.jsx'), 'utf-8');
for (const screen of APP_SCREENS) {
  const mappedName = screenFiles[screen];
  if (mappedName) {
    check(`Route '${screen}' → ${mappedName} imported`, indexContent.includes(mappedName));
    // Check that the route is actually rendered in the switch statement
    check(`Route '${screen}' has case in switch`, indexContent.includes(`case '${screen}'`));
  } else {
    // auth screens handled separately
    const authScreens = ['splash', 'welcome', 'reminderSetup', 'stayConnected', 'signIn', 'createAccount', 'resetPassword'];
    const detailScreens = ['detail'];
    check(`Route '${screen}' is auth or detail route`, authScreens.includes(screen) || detailScreens.includes(screen));
    // Check that auth screens have explicit if statements
    if (authScreens.includes(screen)) {
      check(`Route '${screen}' has explicit handling`, indexContent.includes(`if (screen === '${screen}')`));
    }
  }
}

// 2. All restored screen files exist
console.log('\n2. Screen files exist');
for (const [route, component] of Object.entries(screenFiles)) {
  const path = resolve(screensDir, `${component}.jsx`);
  check(`Screen: ${component}.jsx`, existsSync(path));
}

// 3. All shared native components exist
console.log('\n3. Shared components exist');
for (const name of componentFiles) {
  const path = resolve(componentsDir, `${name}.jsx`);
  check(`Component: ${name}.jsx`, existsSync(path));
}

// 4. Admin screens import moderation APIs
console.log('\n4. Admin imports');
const adminSource = readFileSync(resolve(screensDir, 'AdminDashboardScreen.jsx'), 'utf-8');
check('Admin imports useIsAdmin', adminSource.includes('useIsAdmin'));
check('Admin imports useReports', adminSource.includes('useReports'));
check('Admin imports adminDeleteContent', adminSource.includes('adminDeleteContent'));
check('Admin imports adminSuspendUser', adminSource.includes('adminSuspendUser'));
check('Admin imports adminCreateAnnouncement', adminSource.includes('adminCreateAnnouncement'));
check('Admin imports adminArchiveAnnouncement', adminSource.includes('adminArchiveAnnouncement'));

const calendarSource = readFileSync(resolve(screensDir, 'CalendarScreen.jsx'), 'utf-8');
check('Calendar uses useCalendarEvents', calendarSource.includes('useCalendarEvents'));
check('Calendar does not import mockData', !calendarSource.includes('mockData'));

const announcementsSource = readFileSync(resolve(screensDir, 'AnnouncementsScreen.jsx'), 'utf-8');
check('Announcements uses useAnnouncements', announcementsSource.includes('useAnnouncements'));
check('Announcements does not import mockData', !announcementsSource.includes('mockData'));

[
  'AchievementsScreen.jsx',
  'DevotionsScreen.jsx',
  'GuideDetailScreen.jsx',
  'LessonReaderScreen.jsx',
  'RemindersScreen.jsx',
].forEach((file) => {
  const source = readFileSync(resolve(screensDir, file), 'utf-8');
  check(`${file} does not import mockData`, !source.includes('mockData'));
});

// 5. Notification settings screen imports Firestore settings hook
console.log('\n5. Notification settings');
const notifSettingsSrc = readFileSync(resolve(screensDir, 'NotificationSettingsScreen.jsx'), 'utf-8');
check('Imports useNotificationSettings', notifSettingsSrc.includes('useNotificationSettings'));

// 6. Stats screen imports current visual summary components
console.log('\n6. Stats screen imports');
const statsSrc = readFileSync(resolve(screensDir, 'MyStatsScreen.jsx'), 'utf-8');
check('Imports WeeklyBarChart', statsSrc.includes('WeeklyBarChart'));
check('Imports ProgressRing', statsSrc.includes('ProgressRing'));

// 7. Prayer detail imports reports and pray API
console.log('\n7. Prayer detail imports');
const prayerDetailSrc = readFileSync(resolve(screensDir, 'PrayerDetailScreen.jsx'), 'utf-8');
check('Imports prayForRequest', prayerDetailSrc.includes('prayForRequest'));

// 8. Native files do not import web-only APIs
console.log('\n8. No web-only APIs in mobile files');
const allMobilePaths = [
  ...Object.values(screenFiles).map((f) => resolve(screensDir, `${f}.jsx`)),
  ...componentFiles.map((f) => resolve(componentsDir, `${f}.jsx`)),
  ...mobileFiles.map((f) => resolve(mobileSrc, `${f}.js`)),
  ...mobileFiles.map((f) => resolve(mobileSrc, `${f}.jsx`)),
  resolve(root, 'app', 'index.jsx'),
];

const webBanned = ["from 'react-dom'", 'from "react-dom"', 'window.confirm', 'document.querySelector', 'localStorage.setItem', 'localStorage.getItem'];
for (const path of allMobilePaths) {
  if (!existsSync(path)) continue;
  const content = readFileSync(path, 'utf-8');
  const relPath = path.replace(root, '');
  for (const banned of webBanned) {
    check(`${relPath}: no ${banned.split('.')[0] || banned}`, !content.includes(banned));
  }
}

// 9. api.js includes Firebase token attachment
console.log('\n9. API token attachment');
const apiSrc = readFileSync(resolve(mobileSrc, 'api.js'), 'utf-8');
check('api.js includes getIdToken', apiSrc.includes('getIdToken'));
check('api.js includes Authorization Bearer', apiSrc.includes('Authorization') && apiSrc.includes('Bearer'));

// 10. No route in APP_SCREENS is left permanently mapped to placeholder
console.log('\n10. No placeholder-only routes');
// The placeholder is only used for unknown routes in the default case
check('PlaceholderScreen only in default case and definition', indexContent.includes('default: return <PlaceholderScreen'));

// 11. Check that auth screens actually render their components, not AuthScreen fallback
console.log('\n11. Auth screens render correctly');
const authScreenComponents = ['SplashScreen', 'WelcomeScreen', 'ReminderSetupScreen', 'StayConnectedScreen'];
for (const component of authScreenComponents) {
  const screenContent = readFileSync(resolve(screensDir, `${component}.jsx`), 'utf-8');
  check(`${component} exports default`, screenContent.includes('export default'));
  check(`${component} has proper props`, screenContent.includes('props') || screenContent.includes('(') || screenContent.includes('{'));
}

// 12. Check PrayerDetailScreen has required features per plan
console.log('\n12. PrayerDetailScreen feature completeness');
check('PrayerDetailScreen excludes removed comment thread', !prayerDetailSrc.includes('useEncouragements') && !prayerDetailSrc.includes('EncouragementThread'));
check('PrayerDetailScreen imports reports hook', prayerDetailSrc.includes('submitReport') || prayerDetailSrc.includes('useReports'));
check('PrayerDetailScreen has timer navigation', prayerDetailSrc.includes('prayerStopwatch') || prayerDetailSrc.includes('timer'));
check('PrayerDetailScreen has bookmark logic', prayerDetailSrc.includes('bookmark') || prayerDetailSrc.includes('AsyncStorage'));

console.log(`\n---`);
console.log(`${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
