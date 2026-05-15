import { useState, useCallback } from 'react';
import { NAV_TO_SCREEN } from '../data/constants';
import { usePersistentState } from './usePersistentState';

export function useNavigation() {
  const [onboarded, setOnboarded] = usePersistentState('app:onboarded', false);
  const [screen, setScreen] = useState('home');
  const [active, setActive] = useState('home');
  const [params, setParams] = useState({});
  const [history, setHistory] = useState([]);

  const syncActive = useCallback((next) => {
    if (next === 'home') setActive('home');
    if (next === 'myPrayers' || next === 'discover' || next === 'detail' || next === 'prayerStopwatch') setActive('prayers');
    if (next === 'create' || next === 'createTestimony') setActive('create');
    if (next === 'praise') setActive('praise');
    if (next === 'myStats') setActive('stats');
    if (
      next === 'profile' ||
      next === 'calendar' ||
      next === 'answeredPrayers' ||
      next === 'achievements' ||
      next === 'reminderSettings' ||
      next === 'settings' ||
      next === 'notificationSettings' ||
      next === 'groups' ||
      next === 'groupDetail' ||
      next === 'devotions' ||
      next === 'guideDetail' ||
      next === 'following'
    ) setActive('profile');
  }, []);

  const go = useCallback((next, nextParams = {}, options = {}) => {
    if (!options.replace && next !== screen) {
      setHistory((current) => [...current.slice(-15), { screen, params }]);
    }
    setScreen(next);
    setParams(nextParams);
    syncActive(next);
  }, [params, screen, syncActive]);

  const back = useCallback((fallback = 'home') => {
    setHistory((current) => {
      const previous = current[current.length - 1];
      if (!previous) {
        setScreen(fallback);
        setParams({});
        syncActive(fallback);
        return current;
      }

      setScreen(previous.screen);
      setParams(previous.params || {});
      syncActive(previous.screen);
      return current.slice(0, -1);
    });
  }, [syncActive]);

  const handleNav = useCallback((next) => {
    setActive(next);
    setScreen(NAV_TO_SCREEN[next] || 'home');
    setParams({});
    setHistory([]);
  }, []);

  const resetTo = useCallback((next, nextParams = {}) => {
    setScreen(next);
    setParams(nextParams);
    setHistory([]);
    syncActive(next);
  }, [syncActive]);

  return {
    onboarded,
    setOnboarded,
    screen,
    setScreen,
    active,
    setActive,
    params,
    setParams,
    go,
    back,
    resetTo,
    handleNav,
  };
}
