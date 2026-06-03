import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Award,
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
import { XP_PER_LEVEL } from '../gamification';
import { useUserProfile } from '../useUsers';
import { useGamification } from '../useGamification';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import StatCard from '../components/StatCard';
import ProgressRing from '../components/ProgressRing';
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
];

export default function ProfileScreen({ user, signOut, go }) {
  const { profile, loading: profileLoading, error: profileError, retry: retryProfile } = useUserProfile(user?.uid, Boolean(user?.uid));
  const {
    summary: gamified,
    error: gamificationError,
    retry: retryGamification,
  } = useGamification(user?.uid, Boolean(user?.uid));

  const displayName = profile?.displayName || user?.displayName || 'PrayerStride User';
  const handle = profile?.handle || '';
  const bio = profile?.bio || '';
  const photoURL = profile?.photoURL || user?.photoURL;
  const statsUnavailable = Boolean(gamificationError);
  const earnedBadges = gamified.badges.filter((badge) => badge.state === 'earned').length;
  const impact = gamified.impact || {};
  const isAdmin = profile?.role === 'admin' && profile?.suspended !== true;
  const retry = () => {
    retryProfile();
    retryGamification();
  };

  return (
    <ScreenScaffold pageContent>
      <AppHeader
        title="Profile"
        rightAction={(
          <Pressable onPress={() => go(PROFILE_ROUTES.settings)} style={styles.gearBtn} accessibilityLabel="Settings">
            <Settings size={20} color={colors.navy} />
          </Pressable>
        )}
      />

      <AsyncState loading={profileLoading} error={profileError} onRetry={retry}>
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
          <BodyText variant="caption" style={styles.bio}>{user?.email || ''}</BodyText>
        )}
      </GlassCard>

      {statsUnavailable ? (
        <BodyText variant="caption" style={styles.statsError}>
          Prayer stats are temporarily unavailable. Showing your profile with default stats.
        </BodyText>
      ) : null}

      <GlassCard style={styles.levelCard}>
        <View style={styles.levelRow}>
          <ProgressRing progress={gamified.levelInfo.progress} size={72} strokeWidth={6} accent={colors.gold}>
            <Award size={22} color={colors.gold} />
          </ProgressRing>
          <View style={styles.levelCopy}>
            <Heading level="eyebrow">Level {gamified.levelInfo.level}</Heading>
            <Heading level="h4">{gamified.totalXP} XP total</Heading>
            <View style={styles.levelBar}>
              <View style={[styles.levelFill, { width: `${Math.round(gamified.levelInfo.progress * 100)}%` }]} />
            </View>
            <BodyText variant="caption">
              {gamified.levelInfo.xpIntoLevel}/{XP_PER_LEVEL} XP · {earnedBadges} badges earned
            </BodyText>
          </View>
        </View>
      </GlassCard>

      <View style={styles.statsGrid}>
        <StatCard icon={Flame} value={String(gamified.streak)} label="Day Streak" sublabel="Keep going" accent={colors.coral} style={styles.statCard} />
        <StatCard icon={BarChart3} value={String(impact.prayerSessions || 0)} label="Sessions" accent={colors.emerald} style={styles.statCard} />
        <StatCard icon={Users} value={String(impact.peoplePrayedFor || 0)} label="Prayers Carried" accent={colors.community} style={styles.statCard} />
        <StatCard icon={Heart} value={String(impact.answeredPrayers || 0)} label="Answered Prayers" accent={colors.violet} style={styles.statCard} />
        <StatCard icon={Trophy} value={String(earnedBadges)} label="Badges" accent={colors.navy} style={styles.statCard} />
      </View>

      <Heading level="h4" style={styles.sectionTitle}>Quick Links</Heading>
      <GlassCard style={styles.menuCard}>
        {QUICK_LINKS.map((item, index) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.route}
              onPress={() => go(item.route)}
              style={({ pressed }) => [styles.menuItem, index === QUICK_LINKS.length - 1 && styles.menuItemLast, pressed && styles.pressed]}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIcon}>
                  <Icon size={18} color={colors.navy} />
                </View>
                <BodyText variant="label">{item.label}</BodyText>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>
          );
        })}
      </GlassCard>

      <Heading level="h4" style={styles.sectionTitle}>More</Heading>
      <GlassCard style={styles.menuCard}>
        {MORE_LINKS.map((item, index) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.route}
              onPress={() => go(item.route)}
              style={({ pressed }) => [styles.menuItem, index === MORE_LINKS.length - 1 && styles.menuItemLast, pressed && styles.pressed]}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIcon}>
                  <Icon size={18} color={colors.navy} />
                </View>
                <BodyText variant="label">{item.label}</BodyText>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>
          );
        })}
        {isAdmin ? (
          <Pressable onPress={() => go('adminDashboard')} style={({ pressed }) => [styles.menuItem, styles.menuItemLast, pressed && styles.pressed]}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Settings size={18} color={colors.navy} />
              </View>
              <BodyText variant="label">Admin Dashboard</BodyText>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </GlassCard>

      <Pressable onPress={signOut} style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}>
        <BodyText variant="label">Sign Out</BodyText>
      </Pressable>
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
  handle: { marginTop: spacing.xs, color: colors.textMuted, textAlign: 'center' },
  bio: { marginTop: spacing.md, textAlign: 'center', maxWidth: 280 },
  statsError: { marginBottom: spacing.md, color: colors.coral, textAlign: 'center' },
  levelCard: { marginBottom: spacing.lg },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  levelCopy: { flex: 1 },
  levelBar: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    height: 6,
    borderRadius: 3,
    backgroundColor: alpha.navy10,
    overflow: 'hidden',
  },
  levelFill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { minWidth: '46%' },
  sectionTitle: { marginBottom: spacing.sm },
  menuCard: { paddingVertical: spacing.xs },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  pressed: { opacity: 0.92 },
});
