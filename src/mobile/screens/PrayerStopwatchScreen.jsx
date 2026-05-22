import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { addPrayer } from '../usePrayerData';
import { addPrayerSession } from '../usePrayerSessions';
import CinematicScreen from '../components/CinematicScreen';
import MotionPressable from '../components/MotionPressable';

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function PrayerStopwatchScreen({ prayerId, title: prayerTitle, user, onDone }) {
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
    setRunning((wasRunning) => {
      const next = !wasRunning;
      if (!next && seconds > 0) setReadyToLog(true);
      return next;
    });
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
        }, user);
        sessionPrayerId = prayerRef.id;
      }

      await addPrayerSession({ prayerId: sessionPrayerId, title: sessionTitle, seconds }, user);
      setSeconds(0);
      setPrivateTitle('');
      setReadyToLog(false);
      if (onDone) onDone();
      Alert.alert('Session saved', isDirectPrivateSession ? 'Your private prayer session has been recorded.' : 'Your prayer time has been recorded.');
    } catch (error) {
      Alert.alert('Could not save', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CinematicScreen>
      <View style={styles.container}>
        <Text style={styles.label}>{isDirectPrivateSession ? 'Private Prayer Session' : sessionTitle}</Text>
        {isDirectPrivateSession ? (
          <>
            <TextInput
              value={privateTitle}
              onChangeText={setPrivateTitle}
              editable={!running && seconds === 0 && !readyToLog}
              placeholder="What are you praying about?"
              placeholderTextColor="rgba(248,243,234,0.5)"
              style={styles.input}
            />
            <Text style={styles.privateNote}>This will create an Only me prayer and attach this stopwatch session to it.</Text>
          </>
        ) : null}
        <Text style={styles.timer}>{formatTime(seconds)}</Text>
        <View style={styles.actions}>
          <MotionPressable onPress={startPause} style={styles.button}>
            <Text style={styles.buttonText}>{running ? 'Pause' : seconds ? 'Resume' : 'Start'}</Text>
          </MotionPressable>
          {seconds > 0 && !running ? (
            <MotionPressable onPress={resetTimer} style={styles.outlineButton}>
              <Text style={styles.outlineText}>Reset</Text>
            </MotionPressable>
          ) : null}
        </View>
        {readyToLog && !running && seconds > 0 ? (
          <MotionPressable disabled={busy} onPress={logPrayer} style={[styles.button, styles.logButton]}>
            <Text style={styles.buttonText}>{busy ? 'Saving...' : 'Log Prayer'}</Text>
          </MotionPressable>
        ) : null}
      </View>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, paddingBottom: 120 },
  label: { color: 'rgba(248,243,234,0.62)', fontSize: 16, marginBottom: 16, textAlign: 'center' },
  input: { width: '100%', minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', paddingHorizontal: 16, color: colors.ivory, fontSize: 15, marginBottom: 10 },
  privateNote: { color: 'rgba(248,243,234,0.58)', fontSize: 12, lineHeight: 18, textAlign: 'center', marginBottom: 20 },
  timer: { color: colors.ivory, fontSize: 56, fontWeight: '800', fontVariant: ['tabular-nums'], marginBottom: 32 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' },
  button: { minHeight: 52, paddingHorizontal: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  outlineButton: { minHeight: 52, paddingHorizontal: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(248,243,234,0.2)' },
  outlineText: { color: 'rgba(248,243,234,0.72)', fontSize: 15, fontWeight: '700' },
  logButton: { marginTop: 12, backgroundColor: colors.ivory, width: '100%', maxWidth: 280 },
});
