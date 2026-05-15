import { Capacitor } from '@capacitor/core';
import { registerDeviceToken } from './api';

let registrationStarted = false;

export async function registerNativePushNotifications() {
  if (registrationStarted || !Capacitor.isNativePlatform()) return;
  registrationStarted = true;

  const { PushNotifications } = await import('@capacitor/push-notifications');
  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') return;

  await PushNotifications.register();

  await PushNotifications.addListener('registration', async (token) => {
    await registerDeviceToken(token.value, Capacitor.getPlatform());
  });

  await PushNotifications.addListener('registrationError', (error) => {
    console.error('Push registration error', error);
  });
}
