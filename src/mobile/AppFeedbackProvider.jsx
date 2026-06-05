import { createContext, useContext, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { colors, fonts, radii, shadow, spacing } from './theme';

const FeedbackContext = createContext(null);

const CELEBRATION_PARTICLES = [
  { left: '18%', color: colors.gold, delay: 0 },
  { left: '32%', color: colors.emerald, delay: 40 },
  { left: '48%', color: colors.coral, delay: 80 },
  { left: '62%', color: colors.community, delay: 120 },
  { left: '76%', color: colors.violet, delay: 160 },
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

export function AppFeedbackProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [celebrationKey, setCelebrationKey] = useState(0);

  const api = useMemo(() => {
    const showToast = (next) => {
      const id = Date.now();
      setToast({ id, tone: 'default', ...next });
      setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 2800);
    };
    const celebrate = () => {
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
  }, []);

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
    borderRadius: radii.lg,
    backgroundColor: colors.navy,
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
    color: colors.navy,
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
