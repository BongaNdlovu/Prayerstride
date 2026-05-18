import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { addPrayerSession } from '../usePrayerSessions';
import CinematicScreen from '../components/CinematicScreen';

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
  const intervalRef = useRef(null);

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

  const startPause = () => setRunning((r) => !r);
  const resetTimer = () => { setRunning(false); setSeconds(0); };

  const complete = async () => {
    if (!seconds) {
      Alert.alert('No time recorded', 'Start the timer before completing.');
      return;
    }
    setBusy(true);
    try {
      await addPrayerSession({ prayerId, title: prayerTitle || 'Prayer session', seconds }, user);
      setSeconds(0);
      if (onDone) onDone();
      Alert.alert('Session saved', 'Your prayer time has been recorded.');
    } catch (error) {
      Alert.alert('Could not save', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CinematicScreen>
      <View style={styles.container}>
        <Text style={styles.label}>{prayerTitle || 'Prayer Timer'}</Text>
        <Text style={styles.timer}>{formatTime(seconds)}</Text>
        <View style={styles.actions}>
          <Pressable onPress={startPause} style={styles.button}>
            <Text style={styles.buttonText}>{running ? 'Pause' : seconds ? 'Resume' : 'Start'}</Text>
          </Pressable>
          {seconds > 0 && !running ? (
            <Pressable onPress={resetTimer} style={styles.outlineButton}>
              <Text style={styles.outlineText}>Reset</Text>
            </Pressable>
          ) : null}
        </View>
        {seconds > 0 && !running ? (
          <Pressable disabled={busy} onPress={complete} style={[styles.button, styles.completeButton]}>
            <Text style={styles.buttonText}>{busy ? 'Saving...' : 'Complete & Save'}</Text>
          </Pressable>
        ) : null}
      </View>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  label: { color: 'rgba(248,243,234,0.62)', fontSize: 16, marginBottom: 16 },
  timer: { color: colors.ivory, fontSize: 64, fontWeight: '800', fontVariant: ['tabular-nums'], marginBottom: 32 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  button: { minHeight: 52, paddingHorizontal: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  outlineButton: { minHeight: 52, paddingHorizontal: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(248,243,234,0.2)' },
  outlineText: { color: 'rgba(248,243,234,0.72)', fontSize: 15, fontWeight: '700' },
  completeButton: { marginTop: 12, backgroundColor: colors.ivory },
});
