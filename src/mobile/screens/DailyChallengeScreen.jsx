import { StyleSheet, View } from 'react-native';
import { ChevronRight, Sparkles, Target, Users } from 'lucide-react-native';
import { colors, fonts, spacing } from '../theme';
import { DAILY_CHALLENGE_GOAL, XP_AWARDS } from '../gamification';
import { usePrayers } from '../usePrayerData';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import ProgressRing from '../components/ProgressRing';
import PrimaryButton from '../components/PrimaryButton';
import AsyncState from '../components/AsyncState';
import { useGamification } from '../useGamification';

export default function DailyChallengeScreen({ user, onBack, go }) {
  const { summary, loading, error, retry } = useGamification(user?.uid, Boolean(user?.uid));
  const { prayers } = usePrayers(true);
  const progress = Math.min(summary.dailyPrayCount / DAILY_CHALLENGE_GOAL, 1);
  const prayedEntries = (summary.prayedTodayIds || []).map((prayerId) => {
    const prayer = prayers.find((item) => item.id === prayerId);
    return {
      id: prayerId,
      title: prayer?.title || 'Community prayer request',
      authorName: prayer?.authorName || 'Community member',
    };
  });

  return (
    <ScreenScaffold pageContent>
      <AppHeader
        title="Daily Challenge"
        subtitle="Pray for five people in the community today."
        onBack={onBack}
        centered
        showLogo
      />
      <AsyncState loading={loading} error={error} onRetry={retry}>
        <GlassCard style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroCopy}>
              <Heading level="eyebrow">Today&apos;s Challenge</Heading>
              <Heading level="h2" style={styles.heroTitle}>Pray for 5 People</Heading>
              <BodyText variant="body">
                Each distinct prayer request you carry today counts once toward your challenge.
              </BodyText>
            </View>
            <ProgressRing progress={progress} size={96} strokeWidth={7} accent={colors.gold}>
              <View style={styles.ringCenter}>
                <Target size={20} color={colors.gold} />
                <Heading level="h4" style={styles.ringValue}>
                  {summary.dailyPrayCount}/{DAILY_CHALLENGE_GOAL}
                </Heading>
              </View>
            </ProgressRing>
          </View>
          {summary.dailyChallengeComplete ? (
            <BodyText variant="caption" style={styles.completeNote}>
              Challenge complete for today. +{XP_AWARDS.dailyChallenge} XP toward your journey.
            </BodyText>
          ) : (
            <BodyText variant="caption" style={styles.completeNote}>
              {DAILY_CHALLENGE_GOAL - summary.dailyPrayCount} more {DAILY_CHALLENGE_GOAL - summary.dailyPrayCount === 1 ? 'person' : 'people'} to go.
            </BodyText>
          )}
        </GlassCard>

        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Users size={18} color={colors.community} />
            <Heading level="h4">Prayed for today</Heading>
          </View>
          {prayedEntries.length ? (
            <View style={styles.prayedList}>
              {prayedEntries.map((entry) => (
                <View key={entry.id} style={styles.prayedRow}>
                  <Sparkles size={14} color={colors.gold} />
                  <View style={styles.prayedCopy}>
                    <BodyText variant="label">{entry.authorName}</BodyText>
                    <BodyText variant="small">{entry.title}</BodyText>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <BodyText variant="body">No community prayers counted yet. Open a request and tap Pray.</BodyText>
          )}
        </GlassCard>

        <PrimaryButton
          label={summary.dailyChallengeComplete ? 'Keep Praying' : 'Find Someone to Pray For'}
          icon={ChevronRight}
          onPress={() => go('discover')}
          style={styles.cta}
        />
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  heroCard: { marginBottom: spacing.lg },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  heroCopy: { flex: 1 },
  heroTitle: { marginTop: spacing.sm, marginBottom: spacing.sm },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringValue: { marginTop: 2, fontSize: 16 },
  completeNote: { marginTop: spacing.md, color: colors.gold, fontFamily: fonts.sansSemiBold },
  sectionCard: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  prayedList: { gap: spacing.md },
  prayedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  prayedCopy: { flex: 1 },
  cta: { marginBottom: spacing.md },
});
