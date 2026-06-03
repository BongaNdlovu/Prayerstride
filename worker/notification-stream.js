/**
 * Notify connected clients that their notification list may have changed.
 */
export async function invalidateUserNotificationStream(env, uid) {
  if (!env.USER_NOTIFICATION_STREAM || !uid) return;
  try {
    const id = env.USER_NOTIFICATION_STREAM.idFromName(uid);
    const stub = env.USER_NOTIFICATION_STREAM.get(id);
    await stub.fetch(new Request('https://do.internal/internal/invalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource: 'notifications' }),
    }));
  } catch (error) {
    console.warn('notification-stream invalidate failed', uid, error?.message || error);
  }
}
