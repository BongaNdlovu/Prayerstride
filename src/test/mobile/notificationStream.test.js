import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const wsInstances = [];

class MockWebSocket {
  static OPEN = 1;

  constructor(url, protocols, options) {
    this.url = url;
    this.protocols = protocols;
    this.options = options;
    this.readyState = 0;
    wsInstances.push(this);
    queueMicrotask(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.();
    });
  }

  send() {}

  close() {
    this.readyState = 3;
    this.onclose?.();
  }
}

vi.mock('../../mobile/api.js', () => ({
  buildNotificationStreamUrl: () => 'wss://example.test/stream',
  buildNotificationStreamOptions: (token) => ({ headers: { Authorization: `Bearer ${token}` } }),
}));

describe('notificationStream reconnect safety', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    wsInstances.length = 0;
    global.WebSocket = MockWebSocket;
  });

  afterEach(async () => {
    const { disconnectNotificationStream } = await import('../../mobile/notificationStream.js');
    disconnectNotificationStream();
    vi.useRealTimers();
    vi.resetModules();
  });

  it('does not open a socket after disconnect during getIdToken', async () => {
    const { connectNotificationStream, disconnectNotificationStream } = await import('../../mobile/notificationStream.js');
    let resolveToken;
    const getIdToken = vi.fn(() => new Promise((resolve) => {
      resolveToken = resolve;
    }));

    connectNotificationStream(getIdToken);
    disconnectNotificationStream();
    resolveToken('token-after-disconnect');
    await vi.runAllTimersAsync();

    expect(getIdToken).toHaveBeenCalled();
    expect(wsInstances).toHaveLength(0);
  });

  it('skips stale reconnect callbacks after disconnect', async () => {
    const { connectNotificationStream, disconnectNotificationStream } = await import('../../mobile/notificationStream.js');
    const getIdToken = vi.fn(async () => 'token');

    connectNotificationStream(getIdToken);
    wsInstances[0]?.close();
    disconnectNotificationStream();
    await vi.advanceTimersByTimeAsync(300000);

    expect(getIdToken).toHaveBeenCalledTimes(1);
  });

  it('caps reconnect backoff and resets delay on open', async () => {
    const { connectNotificationStream } = await import('../../mobile/notificationStream.js');
    const getIdToken = vi.fn(async () => 'token');

    connectNotificationStream(getIdToken);
    await vi.runOnlyPendingTimersAsync();
    expect(wsInstances).toHaveLength(1);

    const first = wsInstances[0];
    first.onopen?.();
    first.close();

    for (let attempt = 0; attempt < 8; attempt += 1) {
      await vi.advanceTimersByTimeAsync(300000);
      wsInstances.at(-1)?.close();
    }

    await vi.advanceTimersByTimeAsync(4000);
    expect(getIdToken.mock.calls.length).toBeGreaterThan(1);

    const last = wsInstances.at(-1);
    last.onopen?.();
    last.close();
    getIdToken.mockClear();
    await vi.advanceTimersByTimeAsync(4000);
    expect(getIdToken).toHaveBeenCalledTimes(1);
  });

  it('opens the socket without putting the token in the URL', async () => {
    const { connectNotificationStream } = await import('../../mobile/notificationStream.js');

    connectNotificationStream(vi.fn(async () => 'token'));
    await vi.runOnlyPendingTimersAsync();

    expect(wsInstances[0].url).toBe('wss://example.test/stream');
    expect(wsInstances[0].options.headers.Authorization).toBe('Bearer token');
  });
});
