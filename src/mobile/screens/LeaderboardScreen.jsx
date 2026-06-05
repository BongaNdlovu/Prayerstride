import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
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
  { key: 'monthly', label: 'Monthly' },
  { key: 'all', label: 'All Time' },
];

function TabButton({ item, active, onPress }) {
  return (
    <Pressable onPress={() => onPress(item.key)} style={[styles.tabButton, active && styles.tabButtonActive]}>
      <BodyText variant="caption" style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</BodyText>
    </Pressable>
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
              <Lock size={20} color={colors.navy} />
            </View>
            <Heading level="h4" style={styles.hiddenTitle}>Stay private until you opt in</Heading>
            <BodyText variant="small" style={styles.hiddenCopy}>
              Your journey is hidden from public ranks right now. Turn it on when you want to appear.
            </BodyText>
            <PrimaryButton label={saving ? 'Updating...' : 'Show Me on Leaderboard'} onPress={enableLeaderboard} busy={saving} style={styles.hiddenButton} />
          </GlassCard>
        ) : null}

        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Heading level="eyebrow">Current Scope</Heading>
              <Heading level="h4">{TABS.find((item) => item.key === scope)?.label}</Heading>
            </View>
            <View style={styles.summaryBadge}>
              <Trophy size={18} color={colors.gold} />
            </View>
          </View>
          {leaderboard.resetAt ? (
            <BodyText variant="caption" style={styles.resetCopy}>Resets {leaderboard.resetAt}</BodyText>
          ) : null}
          {leaderboard.me ? (
            <BodyText variant="small" style={styles.meCopy}>
              Your rank: {leaderboard.me.rank || 'Unranked'} · {leaderboard.me.scopeXP} XP
            </BodyText>
          ) : null}
        </GlassCard>

        <FlatList
          data={leaderboard.rows}
          keyExtractor={(item) => item.uid}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={(
            <GlassCard style={styles.emptyCard}>
              <BodyText variant="small" style={styles.emptyCopy}>No public rankings yet for this scope.</BodyText>
            </GlassCard>
          )}
          renderItem={({ item }) => (
            <GlassCard style={styles.rowCard}>
              <View style={styles.row}>
                <View style={styles.rankPill}>
                  <BodyText variant="caption" style={styles.rankText}>{item.rank}</BodyText>
                </View>
                <View style={styles.rowCopy}>
                  <Heading level="h4" style={styles.rowName}>{item.displayName}</Heading>
                  <BodyText variant="caption">
                    Level {item.level} · {item.streak} day streak · {item.badgesEarned} badges
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
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: { backgroundColor: alpha.gold18, borderColor: alpha.gold30 },
  tabLabel: { fontFamily: fonts.sansSemiBold },
  tabLabelActive: { color: colors.navy },
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
  summaryCard: { marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
  },
  resetCopy: { marginTop: spacing.sm },
  meCopy: { marginTop: spacing.xs },
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
    backgroundColor: alpha.navy08,
  },
  rankText: { color: colors.navy, fontFamily: fonts.sansExtraBold },
  rowCopy: { flex: 1 },
  rowName: { fontSize: 17, lineHeight: 22 },
  rowPoints: { fontSize: 18, lineHeight: 24 },
});
