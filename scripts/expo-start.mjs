import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const mockMode = args.includes('mock') || args.includes('--mock');
const target = args.find((arg) => arg !== 'mock' && arg !== '--mock') || 'lan';
const expoArgs = target === 'web'
  ? ['expo', 'start', '--web', '--port', '8082']
  : ['expo', 'start', `--${target}`];
const env = {
  ...process.env,
  EXPO_UNSTABLE_HEADLESS: '1',
  ...(mockMode ? { EXPO_PUBLIC_USE_MOCK_DATA: 'true' } : {}),
};

if (mockMode) {
  console.log('Starting Expo with mock data enabled.');
}

const result = spawnSync('npx', expoArgs, {
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
