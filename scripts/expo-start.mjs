import { spawnSync } from 'node:child_process';

const host = process.argv[2] || 'lan';
const result = spawnSync('npx', ['expo', 'start', `--${host}`], {
  env: { ...process.env, EXPO_UNSTABLE_HEADLESS: '1' },
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
