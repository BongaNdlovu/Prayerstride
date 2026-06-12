import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ArrowLeft, CheckCircle, Pause, Play, RotateCcw, Timer } from 'lucide-react-native';
import { colors, fonts, radii, sharedStyles, spacing, typography } from '../theme';
import { prayForRequest } from '../api';
import { addPrayer } from '../usePrayerData';
import { addPrayerSession } from '../usePrayerSessions';
import { bumpGamificationRefresh } from '../gamificationRefresh';
import { prayedStorageKey } from '../prayerLimit';
import ScreenScaffold from '../components/ScreenScaffold';
import GlassCard from '../components/GlassCard';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';
import ProgressRing from '../components/ProgressRing';
import { getErrorMessage } from '../errors';

const TIMER_PRESETS = [
  { label: 'Free', seconds: 0 },
  { label: '5 min', seconds: 5 * 60 },
  { label: '10 min', seconds: 10 * 60 },
  { label: '15 min', seconds: 15 * 60 },
];

const MILESTONE_MINUTES = [5, 10, 15];
const MIN_GENUINE_PRAYER_SECONDS = 15;

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function PrayerStopwatchScreen({ prayerId, title: prayerTitle, prayer, user, onDone, onBack }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [readyToLog, setReadyToLog] = useState(false);
  const [privateTitle, setPrivateTitle] = useState('');
  const [presetSeconds, setPresetSeconds] = useState(0);
  const intervalRef = useRef(null);
  const loggingRef = useRef(false);
  const pulse = useSharedValue(1);
  const drift = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const isDirectPrivateSession = !prayerId;
  const sessionTitle = prayerTitle || privateTitle.trim() || 'Private prayer session';
  const isOwnPrayerRequest = Boolean(prayerId && prayer?.authorUid && user?.uid && prayer.authorUid === user.uid);
  const prayerAuthor = prayer?.authorName || prayer?.name || 'Community member';
  const prayerInitial = prayerAuthor.slice(0, 1).toUpperCase();
  const prayerBody = prayer?.body || prayer?.text || 'Hold this prayer with care and attention.';
  const prayerVerse = prayer?.scriptureRef || prayer?.verse || prayer?.category;
  const timerProgress = presetSeconds > 0
    ? Math.min(seconds / presetSeconds, 1)
    : (seconds % 300) / 300;
  const completedMilestones = MILESTONE_MINUTES.filter((minute) => seconds >= minute * 60);
  const latestMilestone = completedMilestones[completedMilestones.length - 1];
  const nextMilestone = MILESTONE_MINUTES.find((minute) => seconds < minute * 60);
  const timerStatus = running ? 'Praying now...' : seconds ? 'Paused' : 'Ready when you are';
  const activeIcon = running ? Pause : Play;
  const actionLabel = running ? 'Pause' : seconds ? 'Resume' : 'Start';

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    shimmer.value = withRepeat(
      withTiming(1, { duration: 6200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [drift, shimmer]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (running) {
      pulse.value = withRepeat(
        withTiming(1.025, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      pulse.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.ease) });
    }
  }, [pulse, running]);

  useEffect(() => {
    if (presetSeconds > 0 && running && seconds >= presetSeconds) {
      setRunning(false);
      setReadyToLog(true);
    }
  }, [presetSeconds, running, seconds]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + shimmer.value * 0.18,
    transform: [
      { translateY: drift.value * 26 - 13 },
      { translateX: shimmer.value * 18 - 9 },
      { scale: 1 + shimmer.value * 0.04 },
    ],
  }));
  const secondaryGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.28 + drift.value * 0.18,
    transform: [
      { translateY: shimmer.value * -34 + 17 },
      { translateX: drift.value * -20 + 10 },
      { scale: 1.04 - shimmer.value * 0.05 },
    ],
  }));
  const particleDriftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value * -22 + 11 }],
  }));
  const particleFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: shimmer.value * 18 - 9 }, { translateX: drift.value * 10 - 5 }],
  }));

  const startPause = () => {
    const next = !running;
    setRunning(next);
    if (!next && seconds > 0) setReadyToLog(true);
  };

  const resetTimer = () => {
    setRunning(false);
    setSeconds(0);
    setReadyToLog(false);
  };

  const logPrayer = async () => {
    if (loggingRef.current) return;
    if (!seconds) {
      Alert.alert('No time recorded', 'Start the timer before logging prayer time.');
      return;
    }
    if (!isDirectPrivateSession && seconds < MIN_GENUINE_PRAYER_SECONDS) {
      Alert.alert('More time needed', 'Spend at least 15 seconds in prayer before marking this request prayed.');
      return;
    }
    if (isDirectPrivateSession && !privateTitle.trim()) {
      Alert.alert('Name this prayer', 'Add a short title before saving your private prayer session.');
      return;
    }

    loggingRef.current = true;
    setBusy(true);
    try {
      let sessionPrayerId = prayerId;
      if (!sessionPrayerId) {
        const prayerRef = await addPrayer({
          title: privateTitle.trim(),
          body: 'Private prayer session created from the stopwatch.',
          privacy: 'private',
        }, user);
        sessionPrayerId = prayerRef.id;
      }

      await addPrayerSession({ prayerId: sessionPrayerId, title: sessionTitle, seconds }, user);
      if (!isDirectPrivateSession && !isOwnPrayerRequest) {
        const result = await prayForRequest(sessionPrayerId, { qualityPrayer: true, seconds });
        const limit = result.prayerLimit || prayer?.prayerLimit || 'daily';
        await AsyncStorage.setItem(prayedStorageKey(sessionPrayerId, limit), 'true');
      }
      bumpGamificationRefresh();
      setSeconds(0);
      setPrivateTitle('');
      setReadyToLog(false);
      if (onDone) onDone();
      Alert.alert(
        'Session saved',
        isDirectPrivateSession ? 'Your private prayer session has been recorded.' : 'Your prayer time has been recorded.',
      );
    } catch (error) {
      Alert.alert('Could not save', getErrorMessage(error));
    } finally {
      loggingRef.current = false;
      setBusy(false);
    }
  };

  return (
    <ScreenScaffold pageContent style={styles.screen} contentStyle={styles.content}>
      <LinearGradient colors={[colors.night, colors.night2, '#07111F']} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.timerGlow, glowStyle]} />
      <Animated.View style={[styles.timerGlowSecondary, secondaryGlowStyle]} />
      <View style={styles.horizonGlow} />
      <View style={styles.timerNoise} />
      <Animated.View style={[styles.particleOne, particleDriftStyle]} />
      <Animated.View style={[styles.particleTwo, particleFloatStyle]} />
      <Animated.View style={[styles.particleThree, particleDriftStyle]} />
      <Animated.View style={[styles.particleFour, particleFloatStyle]} />

      <View style={styles.timerHeader}>
        <Pressable onPress={onBack} style={styles.timerBack} accessibilityRole="button" accessibilityLabel="Back">
          <ArrowLeft size={18} color="rgba(255,255,255,0.82)" />
        </Pressable>
        <Text style={styles.timerTitleText}>Prayer Timer</Text>
        <View style={styles.timerHeaderSpacer} />
      </View>

      {isDirectPrivateSession ? (
        <GlassCard style={styles.privateCard}>
            <TextInput
              value={privateTitle}
              onChangeText={setPrivateTitle}
              editable={!running && seconds === 0 && !readyToLog}
              placeholder="What are you praying about?"
              placeholderTextColor={colors.ink3}
              style={[sharedStyles.input, styles.input]}
            />
            <BodyText variant="caption" style={styles.privateNote}>
              This creates a private prayer and attaches this stopwatch session to it.
            </BodyText>
        </GlassCard>
      ) : (
        <View style={styles.timerContextCard}>
          <View style={styles.timerContextUser}>
            <View style={styles.timerContextAvatar}>
              <Text style={styles.timerContextAvatarText}>{prayerInitial}</Text>
            </View>
            <View>
              <Text style={styles.timerContextName}>{prayerAuthor}</Text>
              <Text style={styles.timerContextTime}>Prayer focus</Text>
            </View>
          </View>
          <Text style={styles.timerContextText} numberOfLines={4}>{prayerBody}</Text>
          {prayerVerse ? <Text style={styles.timerContextVerse}>{prayerVerse}</Text> : null}
        </View>
      )}

      <LinearGradient colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.055)']} style={styles.timerPanel}>
        <View style={styles.panelHeader}>
          <View style={styles.panelIcon}>
            <Timer size={24} color={colors.goldLight} />
          </View>
          <View style={styles.panelCopy}>
            <BodyText variant="caption" style={styles.panelEyebrow}>Prayer Focus</BodyText>
            <Text style={styles.panelTitle} numberOfLines={2}>{sessionTitle}</Text>
          </View>
        </View>

        <View style={styles.presets}>
          {TIMER_PRESETS.map((preset) => {
            const selected = preset.seconds === presetSeconds;
            return (
              <Pressable
                key={preset.label}
                onPress={() => setPresetSeconds(preset.seconds)}
                style={[styles.presetPill, selected && styles.presetPillActive]}
                accessibilityRole="button"
                accessibilityLabel={`${preset.label} timer preset`}
                accessibilityState={{ selected }}
              >
                <Text style={[styles.presetText, selected && styles.presetTextActive]}>{preset.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Animated.View style={[styles.ringWrap, ringStyle]}>
          <ProgressRing
            progress={timerProgress}
            size={222}
            strokeWidth={5}
            accent={running ? colors.tealLight : colors.goldLight}
            trackColor="rgba(255,255,255,0.07)"
          >
            <View style={styles.timerCenter}>
              <Text style={styles.timer}>{formatTime(seconds)}</Text>
              <BodyText variant="caption" style={styles.timerLabel}>{timerStatus}</BodyText>
            </View>
          </ProgressRing>
        </Animated.View>

        <View style={styles.segmentRow}>
          {MILESTONE_MINUTES.map((minute) => (
            <View
              key={minute}
              style={[styles.segment, seconds >= minute * 60 && styles.segmentHit]}
              accessibilityLabel={`${minute} minute milestone`}
            />
          ))}
        </View>

        {latestMilestone ? (
          <View style={styles.milestonePill}>
            <CheckCircle size={14} color={colors.goldLight} />
            <BodyText variant="caption" style={styles.milestoneText}>{latestMilestone} minute milestone reached</BodyText>
          </View>
        ) : (
          <BodyText variant="caption" style={styles.nextMilestone}>
            {nextMilestone ? `${nextMilestone} minute milestone ahead` : 'Long session in progress'}
          </BodyText>
        )}

        <View style={styles.actions}>
          <PrimaryButton
            label={actionLabel}
            icon={activeIcon}
            onPress={startPause}
            style={styles.actionBtn}
          />
          {seconds > 0 && !running ? (
            <PrimaryButton label="Reset" icon={RotateCcw} variant="secondary" onPress={resetTimer} style={styles.actionBtn} />
          ) : null}
        </View>

        {readyToLog && !running && seconds > 0 ? (
          <View style={styles.logWrap}>
            <BodyText variant="caption" style={styles.xpHint}>Saving this session records your prayer rhythm.</BodyText>
            <PrimaryButton label="Log Prayer" onPress={logPrayer} busy={busy} disabled={busy} style={styles.logBtn} />
          </View>
        ) : null}
      </LinearGradient>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  content: { paddingBottom: spacing.tabBar },
  timerGlow: {
    position: 'absolute',
    top: -96,
    alignSelf: 'center',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(42,140,126,0.24)',
  },
  timerGlowSecondary: {
    position: 'absolute',
    top: 150,
    right: -110,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(184,146,74,0.18)',
  },
  horizonGlow: {
    position: 'absolute',
    left: -40,
    right: -40,
    bottom: 130,
    height: 130,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  timerNoise: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.015)',
  },
  particleOne: {
    position: 'absolute',
    top: 118,
    left: 42,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(212,170,106,0.38)',
  },
  particleTwo: {
    position: 'absolute',
    top: 208,
    right: 56,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(59,173,160,0.42)',
  },
  particleThree: {
    position: 'absolute',
    bottom: 164,
    left: 70,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  particleFour: {
    position: 'absolute',
    top: 306,
    right: 104,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(212,170,106,0.28)',
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  timerBack: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  timerTitleText: {
    color: 'rgba(255,255,255,0.90)',
    fontFamily: fonts.displaySemi,
    fontSize: 15,
  },
  timerHeaderSpacer: { width: 36 },
  privateCard: { marginBottom: spacing.md },
  input: { alignSelf: 'stretch', marginTop: 0 },
  privateNote: { marginTop: spacing.sm, textAlign: 'center' },
  timerContextCard: {
    marginBottom: spacing.lg,
    borderRadius: radii.lg,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  timerContextUser: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 11 },
  timerContextAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  timerContextAvatarText: { color: colors.white, fontFamily: fonts.sansExtraBold, fontSize: 14 },
  timerContextName: { color: colors.white, fontFamily: fonts.sansSemiBold, fontSize: 13 },
  timerContextTime: { color: 'rgba(255,255,255,0.45)', fontFamily: fonts.sans, fontSize: 11, marginTop: 1 },
  timerContextText: {
    color: 'rgba(255,255,255,0.80)',
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 21,
  },
  timerContextVerse: {
    marginTop: 8,
    color: colors.tealLight,
    fontFamily: fonts.sansSemiBold,
    fontSize: 10.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  timerPanel: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  panelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  panelCopy: { flex: 1 },
  panelEyebrow: {
    color: colors.goldLight,
    fontFamily: fonts.sansExtraBold,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  panelTitle: {
    color: colors.white,
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    lineHeight: 24,
  },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  presetPill: {
    minHeight: 36,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  presetPillActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  presetText: { color: 'rgba(255,255,255,0.60)', fontFamily: fonts.sansSemiBold, fontSize: 13 },
  presetTextActive: { color: colors.white },
  ringWrap: { alignItems: 'center', marginBottom: spacing.sm },
  timerCenter: { alignItems: 'center', justifyContent: 'center' },
  timer: {
    ...typography.display,
    fontSize: 32,
    lineHeight: 38,
    fontVariant: ['tabular-nums'],
    color: colors.white,
  },
  timerLabel: { marginTop: spacing.xs, color: 'rgba(255,255,255,0.40)', textAlign: 'center', letterSpacing: 1.2, textTransform: 'uppercase' },
  segmentRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginBottom: spacing.sm, marginTop: spacing.sm },
  segment: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  segmentHit: { backgroundColor: colors.goldLight },
  milestonePill: {
    alignSelf: 'center',
    minHeight: 32,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(184,146,74,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(184,146,74,0.30)',
    marginBottom: spacing.lg,
  },
  milestoneText: { color: colors.goldLight, fontFamily: fonts.sansSemiBold },
  nextMilestone: { color: 'rgba(255,255,255,0.48)', textAlign: 'center', marginBottom: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  actionBtn: { minWidth: 136, flexGrow: 1 },
  logWrap: { marginTop: spacing.lg, gap: spacing.sm },
  xpHint: { color: colors.goldLight, textAlign: 'center', fontFamily: fonts.sansSemiBold },
  logBtn: { alignSelf: 'stretch' },
});
