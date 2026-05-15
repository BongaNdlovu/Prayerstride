import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  APP_SCREENS,
  NAV_TO_SCREEN,
} from '../src/data/constants.js';
import {
  mockAdminStats,
  mockAnnouncements,
  mockPrayerRequests,
  mockReports,
  mockUsers,
} from '../src/data/mockData.js';

const root = process.cwd();
const app = readFileSync(join(root, 'src', 'App.jsx'), 'utf8');
const profile = readFileSync(join(root, 'src', 'components', 'screens', 'Profile.jsx'), 'utf8');
const praise = readFileSync(join(root, 'src', 'components', 'screens', 'Praise.jsx'), 'utf8');
const detail = readFileSync(join(root, 'src', 'components', 'screens', 'Detail.jsx'), 'utf8');
const createTestimony = readFileSync(join(root, 'src', 'components', 'screens', 'CreateTestimony.jsx'), 'utf8');
const myPrayers = readFileSync(join(root, 'src', 'components', 'screens', 'MyPrayers.jsx'), 'utf8');
const answeredPrayers = readFileSync(join(root, 'src', 'components', 'screens', 'AnsweredPrayers.jsx'), 'utf8');
const adminDashboard = readFileSync(join(root, 'src', 'components', 'screens', 'AdminDashboard.jsx'), 'utf8');
const reportDetails = readFileSync(join(root, 'src', 'components', 'screens', 'ReportDetails.jsx'), 'utf8');
const navigation = readFileSync(join(root, 'src', 'hooks', 'useNavigation.js'), 'utf8');

const failures = [];

const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const uniqueScreens = new Set(APP_SCREENS);
assert(uniqueScreens.size === APP_SCREENS.length, 'APP_SCREENS contains duplicate route names.');

for (const [navKey, screen] of Object.entries(NAV_TO_SCREEN)) {
  assert(APP_SCREENS.includes(screen), `Bottom nav key "${navKey}" points to missing screen "${screen}".`);
}

for (const required of ['adminDashboard', 'reportDetails', 'notifications', 'praiseDetail']) {
  assert(APP_SCREENS.includes(required), `APP_SCREENS is missing required route "${required}".`);
}

for (const protectedScreen of ['adminDashboard', 'reportDetails', 'create', 'settings']) {
  assert(app.includes(`"${protectedScreen}"`), `Protected screen "${protectedScreen}" is not represented in App.jsx.`);
}

assert(profile.includes('Stewardship Console'), 'Profile does not expose the Stewardship Console entry.');
assert(praise.includes("'praiseDetail'"), 'Praise feed does not navigate to the full testimony detail screen.');
assert(praise.includes('line-clamp-3'), 'Praise feed cards should show compact previews before opening detail.');
assert(detail.includes('isOwnPrayer'), 'Prayer detail must distinguish own prayers from community prayers.');
assert(detail.includes('answered && isOwnPrayer'), 'Prayer detail should only show testimony creation for own answered prayers.');
assert(detail.includes('!answered && isOwnPrayer'), 'Prayer detail should only allow marking own prayers as answered.');
assert(createTestimony.includes('ownPrayers'), 'Create Testimony should only list prayers owned by the signed-in user.');
assert(createTestimony.includes('No prayer to link yet'), 'Create Testimony needs an empty state when the user has no own prayers.');
assert(myPrayers.includes('myPrayers = prayers.filter'), 'My Prayers should filter to the signed-in user’s own requests.');
assert(!answeredPrayers.includes('mockTestimonies'), 'Profile Answered Prayers should not show the community praise feed.');
assert(adminDashboard.includes('Stewardship Console'), 'Admin console title is missing.');
assert(navigation.includes("next === 'adminDashboard'"), 'Navigation does not keep adminDashboard under the profile tab.');
assert(navigation.includes("next === 'reportDetails'"), 'Navigation does not keep reportDetails under the profile tab.');

for (const tab of ['overview', 'reports', 'members', 'content']) {
  assert(adminDashboard.includes(`key: '${tab}'`) || adminDashboard.includes(`setActiveTabFilter('${tab}')`), `Admin console is missing "${tab}" tab/functionality.`);
}

for (const action of ['resolved', 'dismissed', 'admin:reports']) {
  assert(adminDashboard.includes(action) || reportDetails.includes(action), `Admin flow is missing "${action}" handling.`);
}

assert(adminDashboard.includes('now available') || adminDashboard.includes('disabled until server-enforced admin endpoints exist'), 'Admin actions should be enabled or visibly disabled.');

for (const report of mockReports) {
  assert(report.id && report.reason && report.status, `Report "${report.id || 'unknown'}" is missing id, reason, or status.`);
  assert(['open', 'resolved', 'dismissed'].includes(report.status), `Report "${report.id}" has unsupported status "${report.status}".`);
}

for (const user of mockUsers) {
  assert(user.id && user.name && user.handle && user.role, `Mock user "${user.id || 'unknown'}" is missing required profile fields.`);
}

for (const prayer of mockPrayerRequests) {
  assert(prayer.id && prayer.title && prayer.text && prayer.privacy, `Prayer request "${prayer.id || 'unknown'}" is missing required fields.`);
}

for (const announcement of mockAnnouncements) {
  assert(announcement.id && announcement.title && announcement.type && announcement.date, `Announcement "${announcement.id || 'unknown'}" is missing required fields.`);
}

assert(Array.isArray(mockAdminStats.adminChart) && mockAdminStats.adminChart.length >= 7, 'Admin chart needs at least seven data points.');
assert(mockAdminStats.activeUsers > 0, 'Admin stats should include active users.');

if (failures.length) {
  console.error('Logic smoke test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Logic smoke test passed: ${APP_SCREENS.length} screens, ${mockUsers.length} users, ${mockReports.length} reports checked.`);
