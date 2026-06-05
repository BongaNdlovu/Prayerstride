import { spawn } from 'child_process';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const targetUrl = process.argv[2] || 'http://127.0.0.1:8083';
const edgePath = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = Number(process.env.EDGE_DEBUG_PORT || 9333);
const profileDir = await mkdtemp(join(tmpdir(), 'prayerstride-edge-'));

const browser = spawn(edgePath, [
  '--headless=new',
  '--disable-gpu',
  '--disable-extensions',
  '--no-first-run',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profileDir}`,
  'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });

const browserErrors = [];
browser.stderr.on('data', (chunk) => {
  const text = chunk.toString();
  if (!/fallback_task_provider|DevTools listening/.test(text)) browserErrors.push(text.trim());
});

async function waitForDebugPort() {
  const versionUrl = `http://127.0.0.1:${port}/json/version`;
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const response = await fetch(versionUrl);
      if (response.ok) return response.json();
    } catch {
      // keep waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Edge DevTools port ${port} did not become ready.`);
}

function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let nextId = 1;
  const pending = new Map();
  const events = [];

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    if (message.method) events.push(message);
  });

  return {
    events,
    ready: new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    }),
    send(method, params = {}) {
      const id = nextId++;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
      });
    },
    close() {
      socket.close();
    },
  };
}

let client;
try {
  await waitForDebugPort();
  const newTarget = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(targetUrl)}`, { method: 'PUT' });
  if (!newTarget.ok) throw new Error(`Could not create browser target: ${newTarget.status}`);
  const target = await newTarget.json();
  client = connect(target.webSocketDebuggerUrl);
  await client.ready;

  const runtimeIssues = [];
  const collectRuntimeIssues = () => {
    for (const event of client.events.splice(0)) {
      if (event.method === 'Runtime.exceptionThrown') {
        const details = event.params?.exceptionDetails;
        runtimeIssues.push(details?.exception?.description || details?.text || 'Runtime exception');
      }
      if (event.method === 'Runtime.consoleAPICalled' && event.params?.type === 'error') {
        const args = event.params.args || [];
        runtimeIssues.push(args.map((arg) => arg.value || arg.description || '').filter(Boolean).join(' '));
      }
      if (event.method === 'Log.entryAdded' && ['error', 'warning'].includes(event.params?.entry?.level)) {
        runtimeIssues.push(event.params.entry.text);
      }
    }
  };

  await client.send('Runtime.enable');
  await client.send('Log.enable');
  await client.send('Page.enable');
  await client.send('Page.navigate', { url: targetUrl });
  await new Promise((resolve) => setTimeout(resolve, 9000));
  collectRuntimeIssues();

  const title = await client.send('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
  const body = await client.send('Runtime.evaluate', { expression: 'document.body.innerText.slice(0, 240)', returnByValue: true });
  collectRuntimeIssues();

  const fatalIssues = runtimeIssues.filter((issue) => issue && !/Failed to load resource: the server responded with a status of 404/.test(issue));
  if (fatalIssues.length) {
    console.error('Browser runtime issues:');
    for (const issue of fatalIssues) console.error(`- ${issue}`);
    process.exitCode = 1;
  } else {
    console.log(`Browser loaded ${targetUrl}`);
    console.log(`Title: ${title.result?.value || ''}`);
    console.log(`Body: ${(body.result?.value || '').replace(/\s+/g, ' ').trim()}`);
  }

  if (browserErrors.length) {
    console.error('Browser process warnings:');
    for (const warning of browserErrors) console.error(`- ${warning}`);
  }
} finally {
  client?.close();
  browser.kill();
  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 1000);
    browser.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
  await rm(profileDir, { recursive: true, force: true }).catch(() => {});
}
