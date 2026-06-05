import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { connectNotificationStream, disconnectNotificationStream } from './notificationStream';
import { isMockDataEnabled } from './mockData';

export function NotificationStreamGate() {
  const { user } = useAuth();

  useEffect(() => {
    if (isMockDataEnabled() || !user?.uid) {
      disconnectNotificationStream();
      return undefined;
    }

    return connectNotificationStream(() => user.getIdToken());
  }, [user?.uid]);

  return null;
}
