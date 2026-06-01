import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Timer } from 'lucide-react-native';
import { alpha, colors, fonts, radii, sharedStyles, spacing, typography } from '../theme';
import { addPrayer } from '../usePrayerData';
import { addPrayerSession } from '../usePrayerSessions';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function PrayerStopwatchScreen({ prayerId, title: prayerTitle, user, onDone, onBack }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [readyToLog, setReadyToLog] = useState(false);
  const [privateTitle, setPrivateTitle] = useState('');
  const intervalRef = useRef(null);
  const isDirectPrivateSession = !prayerId;
  const sessionTitle = prayerTitle || privateTitle.trim() || 'Private prayer session';

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
    if (!seconds) {
      Alert.alert('No time recorded', 'Start the timer before logging prayer time.');
      return;
    }
    if (isDirectPrivateSession && !privateTitle.trim()) {
      Alert.alert('Name this prayer', 'Add a short title before saving your private prayer session.');
      return;
    }

    setBusy(true);
    try {
      let sessionPrayerId = prayerId;
      if (!sessionPrayerId) {
        const prayerRef = await addPrayer({
          title: privateTitle.trim(),
          body: 'Private prayer session created from the stopwatch.',
          privacy: 'private',
          allowShare: false,
        }, user);
        sessionPrayerId = prayerRef.id;
      }

      await addPrayerSession({ prayerId: sessionPrayerId, title: sessionTitle, seconds }, user);
      setSeconds(0);
      setPrivateTitle('');
      setReadyToLog(false);
      if (onDone) onDone();
      Alert.alert(
        'Session saved',
        isDirectPrivateSession ? 'Your private prayer session has been recorded.' : 'Your prayer time has been recorded.',
      );
    } catch (error) {
      Alert.alert('Could not save', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenScaffold pageContent style={styles.screen} contentStyle={styles.content}>
      <AppHeader centered showLogo title="Prayer Timer" subtitle={isDirectPrivateSession ? 'Private session' : sessionTitle} onBack={onBack} />

      <GlassCard style={styles.timerCard}>
        <View style={styles.iconRing}>
          <Timer size={28} color={colors.navy} />
        </View>

        {isDirectPrivateSession ? (
          <>
            <TextInput
              value={privateTitle}
              onChangeText={setPrivateTitle}
              editable={!running && seconds === 0 && !readyToLog}
              placeholder="What are you praying about?"
              placeholderTextColor={alpha.ivory55}
              style={[sharedStyles.input, styles.input]}
            />
            <BodyText variant="caption" style={styles.privateNote}>
              This creates a private prayer and attaches this stopwatch session to it.
            </BodyText>
          </>
        ) : null}

        <Text style={styles.timer}>{formatTime(seconds)}</Text>
        <BodyText variant="caption" style={styles.timerLabel}>
          {running ? 'Praying now...' : seconds ? 'Paused' : 'Ready when you are'}
        </BodyText>

        <View style={styles.actions}>
          <PrimaryButton
            label={running ? 'Pause' : seconds ? 'Resume' : 'Start'}
            onPress={startPause}
            style={styles.actionBtn}
          />
          {seconds > 0 && !running ? (
            <PrimaryButton label="Reset" variant="ghost" onPress={resetTimer} style={styles.actionBtn} />
          ) : null}
        </View>

        {readyToLog && !running && seconds > 0 ? (
          <PrimaryButton label="Log Prayer" onPress={logPrayer} busy={busy} disabled={busy} style={styles.logBtn} />
        ) : null}
      </GlassCard>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center' },
  content: { justifyContent: 'center' },
  timerCard: { alignItems: 'center', marginTop: spacing.lg },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
    marginBottom: spacing.lg,
  },
  input: { alignSelf: 'stretch', marginTop: 0 },
  privateNote: { marginTop: spacing.sm, marginBottom: spacing.md, textAlign: 'center' },
  timer: {
    ...typography.display,
    fontSize: 56,
    lineHeight: 64,
    fontVariant: ['tabular-nums'],
    color: colors.navy,
    marginTop: spacing.md,
  },
  timerLabel: { marginTop: spacing.sm, marginBottom: spacing.xl },
  actions: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  actionBtn: { minWidth: 140 },
  logBtn: { marginTop: spacing.lg, alignSelf: 'stretch' },
});
