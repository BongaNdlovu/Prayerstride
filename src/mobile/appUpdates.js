import * as Updates from 'expo-updates';
import { warn } from './logger';

let updateCheckInFlight = false;

export async function checkForAppUpdate() {
  if (updateCheckInFlight || Updates.isEnabled !== true) return { checked: false };
  updateCheckInFlight = true;

  try {
    const update = await Updates.checkForUpdateAsync();
    if (!update?.isAvailable) return { checked: true, available: false };

    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
    return { checked: true, available: true };
  } catch (error) {
    warn('App update check failed', error);
    return { checked: true, error };
  } finally {
    updateCheckInFlight = false;
  }
}

export function scheduleAppUpdateCheck(delayMs = 3000) {
  const timeout = setTimeout(() => {
    checkForAppUpdate();
  }, delayMs);

  return () => clearTimeout(timeout);
}
