import { buildNotificationStreamUrl } from './api';

const listeners = new Set();
let socket = null;
let reconnectTimer = null;
let pingTimer = null;
let connectGeneration = 0;

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

  const scheduleReconnect = () => {
    if (generation !== connectGeneration) return;
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      openSocket().catch(() => scheduleReconnect());
    }, 4000);
  };

  const openSocket = async () => {
    if (generation !== connectGeneration) return;
    const token = await getIdToken();
    const url = buildNotificationStreamUrl(token);
    if (!url) {
      scheduleReconnect();
      return;
    }

    const ws = new WebSocket(url);
    socket = ws;

    ws.onopen = () => {
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

  openSocket().catch(() => scheduleReconnect());

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
