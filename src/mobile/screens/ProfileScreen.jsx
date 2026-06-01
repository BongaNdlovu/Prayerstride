import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Flame,
  Heart,
  Megaphone,
  Settings,
  Sparkles,
  Trophy,
  User,
  Users,
  Zap,
} from 'lucide-react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import { useUserProfile } from '../useUsers';
import { usePrayerSessions } from '../usePrayerSessions';
import { useIsAdmin } from '../useIsAdmin';
import {
  calculateStreak,
  formatPrayerTime,
  todaySeconds,
} from '../sessionStats';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import StatCard from '../components/StatCard';
import MotionPressable from '../components/MotionPressable';
import AsyncState from '../components/AsyncState';

const PROFILE_ROUTES = {
  myStats: 'myStats',
  myPrayers: 'myPrayers',
  answeredPrayers: 'answeredPrayers',
  reminderSettings: 'reminderSettings',
  notifications: 'notifications',
  settings: 'settings',
};

const QUICK_LINKS = [
  { label: 'My Stats', route: PROFILE_ROUTES.myStats, icon: BarChart3 },
  { label: 'Prayer Requests', route: PROFILE_ROUTES.myPrayers, icon: Heart },
  { label: 'Prayer Times', route: PROFILE_ROUTES.reminderSettings, icon: Clock },
  { label: 'Testimonies', route: PROFILE_ROUTES.answeredPrayers, icon: Sparkles },
];

const MORE_LINKS = [
  { label: 'Edit Profile', route: 'editProfile', icon: User },
  { label: 'Devotions', route: 'devotions', icon: BookOpen },
  { label: 'Calendar', route: 'calendar', icon: Calendar },
  { label: 'Achievements', route: 'achievements', icon: Trophy },
  { label: 'Announcements', route: 'announcements', icon: Megaphone },
  { label: 'Quick Actions', route: 'quickActions', icon: Zap },
  { label: 'Following', route: 'following', icon: Users },
];

export default function ProfileScreen({ user, signOut, go }) {
  const { profile, loading: profileLoading, error: profileError, retry: retryProfile } = useUserProfile(user?.uid, Boolean(user?.uid));
  const { sessions, loading: sessionsLoading, error: sessionsError, retry: retrySessions } = usePrayerSessions(user?.uid, Boolean(user?.uid));
  const { isAdmin } = useIsAdmin(user);

  const displayName = profile?.displayName || user.displayName || 'PrayerStride User';
  const handle = profile?.handle || '';
  const bio = profile?.bio || '';
  const photoURL = profile?.photoURL || user.photoURL;

  const streak = useMemo(() => calculateStreak(sessions), [sessions]);
  const todayTime = useMemo(() => formatPrayerTime(todaySeconds(sessions)), [sessions]);
  const sessionCount = sessions.length;
  const retry = () => {
    retryProfile();
    retrySessions();
  };

  return (
    <ScreenScaffold pageContent>
      <AppHeader
        title="Profile"
        rightAction={(
          <Pressable onPress={() => go(PROFILE_ROUTES.settings)} style={styles.gearBtn} accessibilityLabel="Settings">
            <Settings size={20} color={colors.gold} />
          </Pressable>
        )}
      />

      <AsyncState loading={profileLoading || sessionsLoading} error={profileError || sessionsError} onRetry={retry}>
      <GlassCard style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <Heading level="h3" style={styles.name}>{displayName}</Heading>
        {handle ? <BodyText variant="small" style={styles.handle}>@{handle.replace(/^@/, '')}</BodyText> : null}
        {bio ? <BodyText variant="body" style={styles.bio}>{bio}</BodyText> : (
          <BodyText variant="caption" style={styles.bio}>{user.email}</BodyText>
        )}
      </GlassCard>

      <View style={styles.statsRow}>
        <StatCard icon={Flame} value={String(streak)} label="Day Streak" sublabel="Keep going" />
        <StatCard icon={Clock} value={todayTime} label="Today prayer time" />
        <StatCard icon={BarChart3} value={String(sessionCount)} label="Sessions" />
      </View>

      <Heading level="h4" style={styles.sectionTitle}>Quick Links</Heading>
      <GlassCard style={styles.menuCard}>
        {QUICK_LINKS.map((item, index) => {
          const Icon = item.icon;
          return (
            <MotionPressable
              key={item.route}
              onPress={() => go(item.route)}
              style={[styles.menuItem, index === QUICK_LINKS.length - 1 && styles.menuItemLast]}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIcon}>
                  <Icon size={18} color={colors.gold} />
                </View>
                <BodyText variant="label">{item.label}</BodyText>
              </View>
              <ChevronRight size={18} color={alpha.ivory55} />
            </MotionPressable>
          );
        })}
      </GlassCard>

      <Heading level="h4" style={styles.sectionTitle}>More</Heading>
      <GlassCard style={styles.menuCard}>
        {MORE_LINKS.map((item, index) => {
          const Icon = item.icon;
          return (
            <MotionPressable
              key={item.route}
              onPress={() => go(item.route)}
              style={[styles.menuItem, index === MORE_LINKS.length - 1 && styles.menuItemLast]}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIcon}>
                  <Icon size={18} color={colors.gold} />
                </View>
                <BodyText variant="label">{item.label}</BodyText>
              </View>
              <ChevronRight size={18} color={alpha.ivory55} />
            </MotionPressable>
          );
        })}
        {isAdmin ? (
          <MotionPressable onPress={() => go('adminDashboard')} style={[styles.menuItem, styles.menuItemLast]}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Settings size={18} color={colors.gold} />
              </View>
              <BodyText variant="label">Admin Dashboard</BodyText>
            </View>
            <ChevronRight size={18} color={alpha.ivory55} />
          </MotionPressable>
        ) : null}
      </GlassCard>

      <MotionPressable onPress={signOut} style={styles.signOutButton}>
        <BodyText variant="label">Sign Out</BodyText>
      </MotionPressable>
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  gearBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  profileCard: { alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  avatarWrap: { marginBottom: spacing.md },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold22,
  },
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  avatarText: { fontFamily: fonts.sansExtraBold, fontSize: 32, color: colors.gold },
  name: { textAlign: 'center' },
  handle: { marginTop: spacing.xs, color: colors.gold, textAlign: 'center' },
  bio: { marginTop: spacing.md, textAlign: 'center', maxWidth: 280 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  sectionTitle: { marginBottom: spacing.sm },
  menuCard: { paddingVertical: spacing.xs },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: alpha.ivory10,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
  },
  signOutButton: {
    marginTop: spacing.xl,
    minHeight: 52,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: alpha.ivory16,
    backgroundColor: alpha.ivory10,
  },
});
