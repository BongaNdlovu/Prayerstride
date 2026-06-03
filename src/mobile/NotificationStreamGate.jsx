import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { connectNotificationStream, disconnectNotificationStream } from './notificationStream';

export function NotificationStreamGate() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      disconnectNotificationStream();
      return undefined;
    }

    return connectNotificationStream(() => user.getIdToken());
  }, [user?.uid]);

  return null;
}
