import { DurableObject } from 'cloudflare:workers';

export class UserNotificationStream extends DurableObject {
  async fetch() {
    return new Response('Notification stream not enabled yet.', { status: 501 });
  }
}
