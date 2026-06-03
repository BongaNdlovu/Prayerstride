import { DurableObject } from 'cloudflare:workers';

export class AdminEventStream extends DurableObject {
  async fetch() {
    return new Response('Admin event stream not enabled yet.', { status: 501 });
  }
}
