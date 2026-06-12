import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { warn } from './logger';
import { registerDevice } from './api';
import { isMockDataEnabled } from './mockData';

export const DEFAULT_NOTIFICATION_CHANNEL_ID = 'prayerstride-default';
export const STREAK_REMINDER_NOTIFICATION_ID = 'prayerstride-streak-reminder';

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

async function configureDefaultNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(DEFAULT_NOTIFICATION_CHANNEL_ID, {
    name: 'PrayerStride',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#D4AA6A',
    enableLights: true,
    enableVibrate: true,
  });
}

async function requestNotificationPermission({ requirePermission = false } = {}) {
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted' && requirePermission) {
    throw new Error('Notification permission was not granted.');
  }
  return status;
}

export async function registerForPushNotifications(options = {}) {
  if (isMockDataEnabled()) return;
  if (Platform.OS === 'web') return;
  if (!Device.isDevice) return;

  const status = await requestNotificationPermission(options);
  if (status !== 'granted') return;

  await configureDefaultNotificationChannel();

  const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  if (!projectId) {
    throw new Error('Push notifications are not configured. Missing Expo projectId.');
  }
  const token = await Notifications.getDevicePushTokenAsync({ projectId });
  await registerDevice({ token: token.data, platform: Platform.OS });
  return token.data;
}

async function cancelStreakReminderNotification() {
  if (typeof Notifications.cancelScheduledNotificationAsync !== 'function') return;
  await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_NOTIFICATION_ID).catch(() => {});
}

export async function configureStreakReminderNotifications(enabled) {
  if (isMockDataEnabled()) return;
  if (Platform.OS === 'web') return;

  await cancelStreakReminderNotification();
  if (!enabled) return;
  if (!Device.isDevice) return;

  const status = await requestNotificationPermission({ requirePermission: true });
  if (status !== 'granted') return;

  await configureDefaultNotificationChannel();
  if (typeof Notifications.scheduleNotificationAsync !== 'function') return;

  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_REMINDER_NOTIFICATION_ID,
    content: {
      title: 'PrayerStride',
      body: 'Take a quiet moment to keep your prayer rhythm today.',
      sound: 'default',
      vibrate: [0, 250, 250, 250],
      data: { type: 'streak_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
      channelId: DEFAULT_NOTIFICATION_CHANNEL_ID,
    },
  });
}
