import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { warn } from './logger';
import { registerDevice } from './api';
import { isMockDataEnabled } from './mockData';

if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    warn('Failed to set notification handler', e);
  }
}

export async function registerForPushNotifications() {
  if (isMockDataEnabled()) return;
  if (Platform.OS === 'web') return;
  if (!Device.isDevice) return;

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  if (!projectId) {
    throw new Error('Push notifications are not configured. Missing Expo projectId.');
  }
  const token = await Notifications.getDevicePushTokenAsync({ projectId });
  await registerDevice({ token: token.data, platform: Platform.OS });
}
