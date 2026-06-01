import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const androidDir = join(root, 'android');
const gradlew = process.platform === 'win32'
  ? join(androidDir, 'gradlew.bat')
  : join(androidDir, 'gradlew');

const javaHomeCandidates = [
  process.env.JAVA_HOME,
  'C:\\Program Files\\Java\\jdk-17',
  'C:\\Program Files\\Android\\Android Studio\\jbr',
].filter(Boolean);

const javaHome = javaHomeCandidates.find((candidate) => existsSync(join(candidate, 'bin', 'java.exe')));

if (!javaHome) {
  console.error('Android release build requires JDK 17. Set JAVA_HOME or install JDK 17.');
  process.exit(1);
}

const androidHome = process.env.ANDROID_HOME
  || process.env.ANDROID_SDK_ROOT
  || join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');

if (!existsSync(androidHome)) {
  console.error(`Android SDK not found. Set ANDROID_HOME (checked ${androidHome}).`);
  process.exit(1);
}

if (!existsSync(join(root, '.env.local'))) {
  console.error('Missing .env.local with EXPO_PUBLIC_* values. See EXPO_MIGRATION.md.');
  process.exit(1);
}

const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME: androidHome,
  ANDROID_SDK_ROOT: androidHome,
  NODE_ENV: 'production',
  PATH: `${join(javaHome, 'bin')}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH || ''}`,
};

console.log(`Using JAVA_HOME=${javaHome}`);
console.log(`Using ANDROID_HOME=${androidHome}`);

const result = spawnSync(gradlew, ['assembleRelease', '--no-daemon'], {
  cwd: androidDir,
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const sourceApk = join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
const artifactsDir = join(root, 'artifacts');
mkdirSync(artifactsDir, { recursive: true });
const targetApk = join(artifactsDir, 'PrayerStride-1.0.0-release.apk');
copyFileSync(sourceApk, targetApk);

console.log(`Release APK ready: ${targetApk}`);
