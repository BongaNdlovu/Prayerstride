import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Lock, Trophy } from 'lucide-react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import { useLeaderboard } from '../useLeaderboard';
import { useGamificationPreferences, updateGamificationPreferences } from '../useGamificationPreferences';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import AsyncState from '../components/AsyncState';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';

const TABS = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'all', label: 'All-Time' },
];

function rankColors(rank) {
  if (rank === 1) return { backgroundColor: colors.gold, textColor: colors.ink };
  if (rank === 2) return { backgroundColor: '#CBD5E1', textColor: colors.ink };
  if (rank === 3) return { backgroundColor: '#C07A3F', textColor: colors.white };
  return { backgroundColor: colors.tealPale, textColor: colors.teal };
}

function TabButton({ item, active, onPress }) {
  return (
    <Pressable onPress={() => onPress(item.key)} style={[styles.tabButton, active && styles.tabButtonActive]}>
      <BodyText variant="caption" style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</BodyText>
    </Pressable>
  );
}

function LeaderboardPodium({ rows }) {
  if (!rows.length) return null;
  return (
    <View style={styles.podium}>
      {rows.map((row) => (
        <View key={row.uid} style={[styles.podiumCol, row.rank === 1 && styles.podiumColFirst]}>
          <View style={styles.podiumAvatar}>
            <BodyText variant="label">{row.displayName?.slice(0, 1) || 'P'}</BodyText>
          </View>
          <BodyText variant="label" numberOfLines={1} style={styles.podiumName}>{row.displayName}</BodyText>
          <BodyText variant="caption">{row.scopeXP} XP</BodyText>
          <View style={[styles.podiumBlock, { backgroundColor: rankColors(row.rank).backgroundColor }, row.rank === 1 && styles.podiumBlockFirst]}>
            <Text style={[styles.podiumRank, { color: rankColors(row.rank).textColor }]}>{row.rank}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function CurrentUserRank({ me, scopeLabel, resetAt }) {
  if (!me) return null;
  return (
    <GlassCard style={styles.meCard}>
      <View style={styles.meRow}>
        <View style={styles.meCopy}>
          <Heading level="eyebrow">Your Rank</Heading>
          <Heading level="h4">{me.rank ? `#${me.rank}` : 'Unranked'}</Heading>
          <BodyText variant="small">{me.scopeXP} XP · Level {me.level}</BodyText>
          {scopeLabel ? (
            <BodyText variant="caption" style={styles.scopeCopy}>{scopeLabel} scope</BodyText>
          ) : null}
          {resetAt ? (
            <BodyText variant="caption" style={styles.resetCopy}>Resets {resetAt}</BodyText>
          ) : null}
        </View>
        <View style={styles.summaryBadge}>
          <Trophy size={18} color={colors.gold} />
        </View>
      </View>
    </GlassCard>
  );
}

export default function LeaderboardScreen({ user, onBack }) {
  const [scope, setScope] = useState('weekly');
  const [saving, setSaving] = useState(false);
  const { leaderboard, loading, error, retry } = useLeaderboard(scope, user?.uid, Boolean(user?.uid));
  const {
    preferences,
    loading: prefsLoading,
    error: prefsError,
    retry: retryPrefs,
    setPreferences,
  } = useGamificationPreferences(user?.uid, Boolean(user?.uid));

  const hidden = preferences.leaderboardVisible !== true;
  const topThree = leaderboard.rows.slice(0, 3);
  const remainingRows = leaderboard.rows.slice(3);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);
  const scopeLabel = TABS.find((item) => item.key === scope)?.label;

  const retryAll = () => {
    retry();
    retryPrefs();
  };

  const enableLeaderboard = async () => {
    if (!user?.uid || saving) return;
    setSaving(true);
    try {
      const next = await updateGamificationPreferences(user.uid, { leaderboardVisible: true });
      setPreferences(next);
      retry();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenScaffold pageContent>
      <AppHeader title="Ranks" subtitle="Prayer rhythm, consistency, and care." onBack={onBack} />
      <AsyncState loading={loading || prefsLoading} error={error || prefsError} onRetry={retryAll}>
        <View style={styles.tabsRow}>
          {TABS.map((item) => <TabButton key={item.key} item={item} active={scope === item.key} onPress={setScope} />)}
        </View>

        {hidden ? (
          <GlassCard style={styles.hiddenCard}>
            <View style={styles.hiddenIcon}>
              <Lock size={20} color={colors.ink} />
            </View>
            <Heading level="h4" style={styles.hiddenTitle}>Stay private until you opt in</Heading>
            <BodyText variant="small" style={styles.hiddenCopy}>
              Your journey is hidden from public ranks right now. Turn it on when you want to appear.
            </BodyText>
            <PrimaryButton label={saving ? 'Updating...' : 'Show Me on Leaderboard'} onPress={enableLeaderboard} busy={saving} style={styles.hiddenButton} />
          </GlassCard>
        ) : null}

        <LeaderboardPodium rows={podiumOrder} />

        <CurrentUserRank me={leaderboard.me} scopeLabel={scopeLabel} resetAt={leaderboard.resetAt} />

        <FlatList
          data={remainingRows}
          keyExtractor={(item) => item.uid}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={leaderboard.rows.length ? null : (
            <GlassCard style={styles.emptyCard}>
              <BodyText variant="small" style={styles.emptyCopy}>No public rankings yet for this scope.</BodyText>
            </GlassCard>
          )}
          renderItem={({ item }) => (
            <GlassCard style={styles.rowCard}>
              <View style={styles.row}>
                <View style={[styles.rankPill, { backgroundColor: rankColors(item.rank).backgroundColor }]}>
                  <BodyText variant="caption" style={[styles.rankText, { color: rankColors(item.rank).textColor }]}>{item.rank}</BodyText>
                </View>
                <View style={styles.rowCopy}>
                  <Heading level="h4" style={styles.rowName}>{item.displayName}</Heading>
                  <BodyText variant="caption">
                    Level {item.level} · {item.streak} day streak · {item.badgesEarned} badges
                    {item.change != null ? ` · ${item.change > 0 ? '+' : ''}${item.change}` : ''}
                  </BodyText>
                </View>
                <Heading level="h4" style={styles.rowPoints}>{item.scopeXP}</Heading>
              </View>
            </GlassCard>
          )}
        />
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  tabsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  tabButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: { backgroundColor: colors.night, borderColor: colors.night },
  tabLabel: { fontFamily: fonts.sansSemiBold },
  tabLabelActive: { color: colors.white },
  hiddenCard: { marginBottom: spacing.lg, alignItems: 'center' },
  hiddenIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
    marginBottom: spacing.md,
  },
  hiddenTitle: { textAlign: 'center' },
  hiddenCopy: { textAlign: 'center', marginTop: spacing.sm },
  hiddenButton: { marginTop: spacing.lg, alignSelf: 'stretch' },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  podiumCol: { flex: 1, alignItems: 'center', gap: spacing.xs },
  podiumColFirst: { marginBottom: spacing.lg },
  podiumAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.ink08,
    marginBottom: spacing.xs,
  },
  podiumName: { textAlign: 'center', maxWidth: '100%' },
  podiumBlock: {
    width: '100%',
    height: 56,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  podiumBlockFirst: {
    height: 72,
    backgroundColor: colors.gold,
  },
  podiumRank: { fontFamily: fonts.sansExtraBold, fontSize: 18, color: colors.ink },
  meCard: { marginBottom: spacing.lg },
  meRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meCopy: { flex: 1 },
  scopeCopy: { marginTop: spacing.xs },
  resetCopy: { marginTop: spacing.xs },
  summaryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
  },
  list: { gap: spacing.md, paddingBottom: spacing.tabBar },
  emptyCard: { alignItems: 'center' },
  emptyCopy: { textAlign: 'center' },
  rowCard: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rankPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.ink08,
  },
  rankText: { color: colors.ink, fontFamily: fonts.sansExtraBold },
  rowCopy: { flex: 1 },
  rowName: { fontSize: 17, lineHeight: 22 },
  rowPoints: { fontSize: 18, lineHeight: 24 },
});
