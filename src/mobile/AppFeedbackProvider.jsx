import { createContext, useContext, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, Vibration, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { colors, fonts, radii, shadow, spacing } from './theme';

const FeedbackContext = createContext(null);

const CELEBRATION_PARTICLES = [
  { left: '18%', color: colors.teal, delay: 0 },
  { left: '32%', color: colors.goldLight, delay: 40 },
  { left: '48%', color: colors.redSoft, delay: 80 },
  { left: '62%', color: colors.tealLight, delay: 120 },
  { left: '76%', color: colors.purple, delay: 160 },
];

function Toast({ toast }) {
  const isGold = toast.tone === 'gold';
  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      exiting={FadeOutDown.duration(180)}
      style={[styles.toast, isGold && styles.toastGold, shadow.card]}
      pointerEvents="none"
    >
      <Text style={[styles.toastText, isGold && styles.toastTextGold]}>{toast.message}</Text>
    </Animated.View>
  );
}

function Celebration() {
  return (
    <View style={styles.celebrationHost} pointerEvents="none">
      {CELEBRATION_PARTICLES.map((particle, index) => (
        <Animated.View
          key={`${particle.left}-${index}`}
          entering={FadeInUp.delay(particle.delay).duration(420)}
          exiting={FadeOutDown.duration(320)}
          style={[
            styles.particle,
            { left: particle.left, backgroundColor: particle.color },
          ]}
        />
      ))}
    </View>
  );
}

function playWebTone(kind) {
  if (Platform.OS !== 'web') return;
  const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (typeof AudioContext !== 'function') return;
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const duration = kind === 'celebrate' ? 0.11 : 0.055;
    oscillator.frequency.value = kind === 'celebrate' ? 740 : 520;
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
    setTimeout(() => context.close?.(), Math.ceil((duration + 0.05) * 1000));
  } catch {
    // Feedback is optional; never block the action that triggered it.
  }
}

export function triggerFeedbackCue(kind = 'tap') {
  const pattern = kind === 'celebrate' ? [0, 45, 70, 55] : 36;
  Vibration?.vibrate?.(pattern);
  if (Platform.OS === 'web') {
    globalThis.navigator?.vibrate?.(pattern);
    playWebTone(kind);
  }
}

export function AppFeedbackProvider({ children, soundHapticsEnabled = true }) {
  const [toast, setToast] = useState(null);
  const [celebrationKey, setCelebrationKey] = useState(0);

  const api = useMemo(() => {
    const showToast = (next) => {
      if (soundHapticsEnabled) triggerFeedbackCue('tap');
      const id = Date.now();
      setToast({ id, tone: 'default', ...next });
      setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 2800);
    };
    const celebrate = () => {
      if (soundHapticsEnabled) triggerFeedbackCue('celebrate');
      setCelebrationKey((key) => key + 1);
    };
    const showXp = (xp, fallbackMessage = 'Progress saved') => {
      if (!xp?.awarded) {
        if (fallbackMessage) showToast({ message: fallbackMessage });
        return;
      }
      const bonus = xp.bonuses?.includes('dailyChallenge') ? ' Daily challenge complete.' : '';
      celebrate();
      showToast({ tone: 'gold', message: `+${xp.points} XP.${bonus}` });
    };
    return { showToast, showXp, celebrate };
  }, [soundHapticsEnabled]);

  return (
    <FeedbackContext.Provider value={api}>
      {children}
      {toast ? <Toast toast={toast} /> : null}
      {celebrationKey ? <Celebration key={celebrationKey} /> : null}
    </FeedbackContext.Provider>
  );
}

export function useAppFeedback() {
  const value = useContext(FeedbackContext);
  if (!value) throw new Error('useAppFeedback must be used inside AppFeedbackProvider');
  return value;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: spacing.tabBar,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
    borderRadius: radii.md,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  toastGold: {
    backgroundColor: colors.gold,
  },
  toastText: {
    color: colors.white,
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    textAlign: 'center',
  },
  toastTextGold: {
    color: colors.ink,
  },
  celebrationHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    bottom: '42%',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
