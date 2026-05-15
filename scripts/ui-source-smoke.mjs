import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8');

const app = read('src', 'App.jsx');
const css = read('src', 'index.css');
const splash = read('src', 'components', 'screens', 'Splash.jsx');
const bottomNav = read('src', 'components', 'BottomNav.jsx');
const adminDashboard = read('src', 'components', 'screens', 'AdminDashboard.jsx');
const profile = read('src', 'components', 'screens', 'Profile.jsx');
const sceneImage = read('src', 'components', 'ui', 'SceneImage.jsx');
const failures = [];

const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

assert(existsSync(join(root, 'src', 'assets', 'cinematic-prayer-scenes.png')), 'Cinematic prayer scene asset is missing.');
assert(css.includes('overflow-x: hidden'), 'Global CSS should guard against horizontal overflow.');
assert(app.includes('h-dvh w-full overflow-hidden'), 'Mobile app shell should be viewport-bound and overflow-hidden.');
assert(splash.includes('overflow-x-hidden'), 'Splash screen should explicitly prevent horizontal clipping.');
assert(splash.includes('max-w-[260px]'), 'Splash CTA should stay within the phone viewport.');
assert(sceneImage.includes('aria-hidden="true"'), 'Decorative scene image layer should be hidden from assistive tech.');

for (const navLabel of ['Home', 'Prayers', 'Create', 'Praise', 'Profile']) {
  assert(bottomNav.includes(navLabel), `Bottom nav is missing "${navLabel}".`);
}

for (const text of ['Stewardship Console', 'Owner tools', 'Review Reports', 'Manage Members']) {
  assert(adminDashboard.includes(text) || profile.includes(text), `Owner/admin UI is missing "${text}".`);
}

for (const ariaLabel of ['View report details']) {
  assert(adminDashboard.includes(ariaLabel), `Admin UI is missing accessible control text containing "${ariaLabel}".`);
}

const resetPassword = read('src', 'components', 'screens', 'ResetPassword.jsx');
const editRequest = read('src', 'components', 'screens', 'EditRequest.jsx');
const reportDetails = read('src', 'components', 'screens', 'ReportDetails.jsx');
const support = read('src', 'components', 'screens', 'SupportDonation.jsx');

assert(app.includes('onSend={resetPassword}'), 'Reset password screen must call the Firebase reset function.');
assert(editRequest.includes('updatePrayer') && editRequest.includes('deletePrayer'), 'Edit request must use Firestore update/delete helpers.');
assert(!reportDetails.includes('Delete Content') && !reportDetails.includes('Suspend User'), 'Fake destructive moderation actions should stay disabled.');
assert(support.includes('Donations are not enabled yet') && !support.includes('Continue'), 'Donation checkout CTA should stay disabled until Stripe exists.');
assert(resetPassword.includes('disabled={busy}'), 'Reset password submit button should have a busy/disabled state.');

const disallowedHeroPatterns = [
  ['tracking-[-', 'Negative letter spacing can make compact UI text harder to read.'],
  ['scale-[calc', 'Viewport-scaled type or layout can cause unpredictable text fit.'],
];

for (const [pattern, message] of disallowedHeroPatterns) {
  assert(!`${app}\n${css}\n${splash}\n${adminDashboard}`.includes(pattern), message);
}

if (failures.length) {
  console.error('UI source smoke test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('UI source smoke test passed: mobile shell, nav, assets, and owner UI checked.');
