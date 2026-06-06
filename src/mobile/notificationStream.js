import { buildNotificationStreamOptions, buildNotificationStreamUrl } from './api';

const listeners = new Set();
let socket = null;
let reconnectTimer = null;
let pingTimer = null;
let connectGeneration = 0;

const INITIAL_RECONNECT_MS = 4000;
const MAX_RECONNECT_MS = 300000;

export function subscribeNotificationsInvalidated(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitInvalidate() {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // Ignore subscriber errors.
    }
  }
}

export function connectNotificationStream(getIdToken) {
  disconnectNotificationStream();
  const generation = connectGeneration + 1;
  connectGeneration = generation;
  let reconnectBackoffMs = INITIAL_RECONNECT_MS;

  const scheduleReconnect = () => {
    if (generation !== connectGeneration) return;
    clearTimeout(reconnectTimer);
    const delay = reconnectBackoffMs;
    reconnectTimer = setTimeout(() => {
      if (generation !== connectGeneration) return;
      openSocket().catch(() => {
        reconnectBackoffMs = Math.min(reconnectBackoffMs * 2, MAX_RECONNECT_MS);
        scheduleReconnect();
      });
    }, delay);
  };

  const openSocket = async () => {
    if (generation !== connectGeneration) return;
    const token = await getIdToken();
    if (generation !== connectGeneration) return;
    const url = buildNotificationStreamUrl();
    if (!url) {
      reconnectBackoffMs = Math.min(reconnectBackoffMs * 2, MAX_RECONNECT_MS);
      scheduleReconnect();
      return;
    }

    const ws = new WebSocket(url, undefined, buildNotificationStreamOptions(token));
    socket = ws;

    ws.onopen = () => {
      reconnectBackoffMs = INITIAL_RECONNECT_MS;
      clearInterval(pingTimer);
      pingTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('ping');
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(String(event.data));
        if (data.type === 'invalidate' && (!data.resource || data.resource === 'notifications')) {
          emitInvalidate();
        }
      } catch {
        // Ignore malformed frames.
      }
    };

    ws.onclose = () => {
      clearInterval(pingTimer);
      if (generation !== connectGeneration) return;
      scheduleReconnect();
    };

    ws.onerror = () => {
      ws.close();
    };
  };

  openSocket().catch(() => {
    reconnectBackoffMs = Math.min(reconnectBackoffMs * 2, MAX_RECONNECT_MS);
    scheduleReconnect();
  });

  return disconnectNotificationStream;
}

export function disconnectNotificationStream() {
  connectGeneration += 1;
  clearTimeout(reconnectTimer);
  clearInterval(pingTimer);
  reconnectTimer = null;
  pingTimer = null;
  if (socket) {
    try {
      socket.close();
    } catch {
      // Ignore close errors.
    }
    socket = null;
  }
}
