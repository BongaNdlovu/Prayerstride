import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const url = process.argv[2] || 'http://127.0.0.1:5173';
const root = process.cwd();
const outDir = join(root, 'artifacts');
const screenshot = join(outDir, 'visual-smoke-phone.png');

const candidates = process.platform === 'win32'
  ? [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    ]
  : process.platform === 'darwin'
    ? [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      ]
    : [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/usr/bin/microsoft-edge',
      ];

const browser = candidates.find(existsSync);

if (!browser) {
  console.error('No supported headless browser found. Install Chrome or Edge to run visual smoke tests.');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const userDataDir = mkdtempSync(join(tmpdir(), 'prayerstride-visual-'));

const pageCheck = spawnSync(browser, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  `--user-data-dir=${userDataDir}`,
  '--virtual-time-budget=2500',
  '--dump-dom',
  url,
], { encoding: 'utf8' });

if (pageCheck.status !== 0) {
  rmSync(userDataDir, { recursive: true, force: true });
  process.stderr.write(pageCheck.stderr || '');
  process.exit(pageCheck.status || 1);
}

const pageText = `${pageCheck.stdout}\n${pageCheck.stderr}`;
const browserErrorPatterns = [
  /ERR_CONNECTION_REFUSED/i,
  /This site can't be reached/i,
  /This site can.t be reached/i,
  /refused to connect/i,
  /DNS_PROBE/i,
];

if (browserErrorPatterns.some((pattern) => pattern.test(pageText))) {
  rmSync(userDataDir, { recursive: true, force: true });
  console.error(`Visual smoke failed: ${url} rendered a browser error page.`);
  process.exit(1);
}

if (!/PrayerStride/i.test(pageText)) {
  rmSync(userDataDir, { recursive: true, force: true });
  console.error(`Visual smoke failed: ${url} did not render expected PrayerStride content.`);
  process.exit(1);
}

const result = spawnSync(browser, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  `--user-data-dir=${userDataDir}`,
  '--window-size=390,844',
  `--screenshot=${screenshot}`,
  url,
], { stdio: 'inherit' });

rmSync(userDataDir, { recursive: true, force: true });

if (result.status !== 0) {
  process.exit(result.status || 1);
}

const size = statSync(screenshot).size;
if (size < 1000) {
  console.error(`Screenshot was unexpectedly small (${size} bytes): ${screenshot}`);
  process.exit(1);
}

console.log(`Visual smoke screenshot captured: ${screenshot}`);
