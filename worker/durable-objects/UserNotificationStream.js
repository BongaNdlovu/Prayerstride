import { DurableObject } from 'cloudflare:workers';

export class UserNotificationStream extends DurableObject {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/internal/invalidate' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      await this.notifyInvalidate(body.resource || 'notifications');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response(JSON.stringify({
        ok: true,
        message: 'Connect with WebSocket to receive notification invalidation events.',
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.send(JSON.stringify({ type: 'ready', resource: 'notifications' }));
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, message) {
    const text = typeof message === 'string' ? message : new TextDecoder().decode(message);
    if (text === 'ping') {
      ws.send(JSON.stringify({ type: 'pong' }));
    }
  }

  async notifyInvalidate(resource = 'notifications') {
    const payload = JSON.stringify({ type: 'invalidate', resource });
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(payload);
      } catch {
        // Stale socket; hibernation API will drop it on next send failure.
      }
    }
  }
}
