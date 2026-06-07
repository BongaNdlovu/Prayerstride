import './renderHarness.jsx';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

import AboutScreen from '../../../src/mobile/screens/AboutScreen';
import AccountSuspendedScreen from '../../../src/mobile/screens/AccountSuspendedScreen';
import AchievementsScreen from '../../../src/mobile/screens/AchievementsScreen';
import AdminDashboardScreen from '../../../src/mobile/screens/AdminDashboardScreen';
import AnnouncementsScreen from '../../../src/mobile/screens/AnnouncementsScreen';
import AuthScreen from '../../../src/mobile/screens/AuthScreen';
import CopyrightScreen from '../../../src/mobile/screens/CopyrightScreen';
import EditProfileScreen from '../../../src/mobile/screens/EditProfileScreen';
import HelpCenterScreen from '../../../src/mobile/screens/HelpCenterScreen';
import HomeScreen from '../../../src/mobile/screens/HomeScreen';
import LeaderboardScreen from '../../../src/mobile/screens/LeaderboardScreen';
import MyStatsScreen from '../../../src/mobile/screens/MyStatsScreen';
import NotificationSettingsScreen from '../../../src/mobile/screens/NotificationSettingsScreen';
import NotificationsScreen from '../../../src/mobile/screens/NotificationsScreen';
import PrayerDetailScreen from '../../../src/mobile/screens/PrayerDetailScreen';
import PrayerStopwatchScreen from '../../../src/mobile/screens/PrayerStopwatchScreen';
import PrivacyPolicyScreen from '../../../src/mobile/screens/PrivacyPolicyScreen';
import ProfileScreen from '../../../src/mobile/screens/ProfileScreen';
import ReminderSetupScreen from '../../../src/mobile/screens/ReminderSetupScreen';
import RemindersScreen from '../../../src/mobile/screens/RemindersScreen';
import ReportDetailsScreen from '../../../src/mobile/screens/ReportDetailsScreen';
import ResetPasswordScreen from '../../../src/mobile/screens/ResetPasswordScreen';
import SettingsScreen from '../../../src/mobile/screens/SettingsScreen';
import StayConnectedScreen from '../../../src/mobile/screens/StayConnectedScreen';
import TermsOfServiceScreen from '../../../src/mobile/screens/TermsOfServiceScreen';
import WelcomeScreen from '../../../src/mobile/screens/WelcomeScreen';

const user = { uid: 'u1', displayName: 'Test', email: 't@t.com' };
const noop = vi.fn();
const prayer = { id: 'p1', title: 'Test Prayer', body: 'Prayer body text', authorUid: 'u1', authorName: 'Author', privacy: 'community', prayerLimit: 'daily', createdAt: new Date().toISOString(), prayedCount: 2 };
const report = { id: 'r1', type: 'prayer', reason: 'spam', status: 'open', createdAt: new Date().toISOString() };

const SCREENS = [
  { name: 'AboutScreen', Cmp: AboutScreen, props: { onBack: noop } },
  { name: 'AccountSuspendedScreen', Cmp: AccountSuspendedScreen, props: { reason: 'test', onSignOut: noop } },
  { name: 'AchievementsScreen', Cmp: AchievementsScreen, props: { user, onBack: noop } },
  { name: 'AdminDashboardScreen', Cmp: AdminDashboardScreen, props: { user, go: noop, onBack: noop } },
  { name: 'AnnouncementsScreen', Cmp: AnnouncementsScreen, props: { onBack: noop } },
  { name: 'AuthScreen', Cmp: AuthScreen, props: { mode: 'signIn', onSignIn: noop, onRegister: noop, onResetPassword: noop, onSwitchMode: noop } },
  { name: 'CopyrightScreen', Cmp: CopyrightScreen, props: { onBack: noop } },
  { name: 'EditProfileScreen', Cmp: EditProfileScreen, props: { user, onBack: noop, onDone: noop } },
  { name: 'HelpCenterScreen', Cmp: HelpCenterScreen, props: { onBack: noop } },
  { name: 'HomeScreen', Cmp: HomeScreen, props: { user, onOpenPrayer: noop, go: noop } },
  { name: 'LeaderboardScreen', Cmp: LeaderboardScreen, props: { user, onBack: noop } },
  { name: 'MyStatsScreen', Cmp: MyStatsScreen, props: { user, onBack: noop, go: noop } },
  { name: 'NotificationSettingsScreen', Cmp: NotificationSettingsScreen, props: { user, onBack: noop } },
  { name: 'NotificationsScreen', Cmp: NotificationsScreen, props: { user, onBack: noop } },
  { name: 'PrayerDetailScreen', Cmp: PrayerDetailScreen, props: { prayer, user, onBack: noop, go: noop, onRefresh: noop } },
  { name: 'PrayerStopwatchScreen', Cmp: PrayerStopwatchScreen, props: { prayerId: 'p1', title: 'Test', user, onDone: noop, onBack: noop } },
  { name: 'PrivacyPolicyScreen', Cmp: PrivacyPolicyScreen, props: { onBack: noop } },
  { name: 'ProfileScreen', Cmp: ProfileScreen, props: { user, signOut: noop, go: noop } },
  { name: 'ReminderSetupScreen', Cmp: ReminderSetupScreen, props: { onContinue: noop, onSkip: noop } },
  { name: 'RemindersScreen', Cmp: RemindersScreen, props: { user, onBack: noop } },
  { name: 'ReportDetailsScreen', Cmp: ReportDetailsScreen, props: { report, go: noop, back: noop } },
  { name: 'ResetPasswordScreen', Cmp: ResetPasswordScreen, props: { onResetPassword: noop, onBack: noop } },
  { name: 'SettingsScreen', Cmp: SettingsScreen, props: { user, go: noop, deleteAccount: noop, onBack: noop } },
  { name: 'StayConnectedScreen', Cmp: StayConnectedScreen, props: { onContinue: noop } },
  { name: 'TermsOfServiceScreen', Cmp: TermsOfServiceScreen, props: { onBack: noop } },
  { name: 'WelcomeScreen', Cmp: WelcomeScreen, props: { onContinue: noop, onSignIn: noop } },
];

describe('screen rendering', () => {
  it.each(SCREENS)('%s renders without crashing', ({ Cmp, props }) => {
    const { container } = render(React.createElement(Cmp, props));
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it('renders all 26 screens in sequence', () => {
    for (const { Cmp, props } of SCREENS) {
      const { container, unmount } = render(React.createElement(Cmp, props));
      expect(container.innerHTML.length).toBeGreaterThan(0);
      unmount();
    }
  });

  it('HomeScreen keeps the daily verse visible when the prayer feed is empty', () => {
    const { getByText } = render(<HomeScreen user={user} onOpenPrayer={noop} go={noop} />);
    expect(getByText("Today's Verse")).toBeTruthy();
    expect(getByText('No prayer requests available right now.')).toBeTruthy();
  });

  it('no screen imports web-only APIs', async () => {
    for (const { name } of SCREENS) {
      const source = (await import(`../../../src/mobile/screens/${name}.jsx?raw`)).default;
      expect(source).not.toMatch(/from ['"]react-dom['"]/);
      expect(source).not.toMatch(/window\./);
      expect(source).not.toMatch(/document\.getElementById/);
    }
  });
});
