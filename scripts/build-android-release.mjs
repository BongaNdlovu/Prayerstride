import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const androidDir = join(root, 'android');
const gradlew = process.platform === 'win32'
  ? join(androidDir, 'gradlew.bat')
  : join(androidDir, 'gradlew');

const javaBinary = process.platform === 'win32' ? 'java.exe' : 'java';

function hasJavaHome(candidate) {
  return Boolean(candidate && existsSync(join(candidate, 'bin', javaBinary)));
}

function getDefaultJavaHomeCandidates() {
  if (process.platform === 'win32') {
    return [
      'C:\\Program Files\\Java\\jdk-17',
      'C:\\Program Files\\Android\\Android Studio\\jbr',
    ];
  }
  if (process.platform === 'darwin') {
    return [
      '/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home',
      '/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home',
      '/Applications/Android Studio.app/Contents/jbr/Contents/Home',
    ];
  }
  return [
    '/usr/lib/jvm/java-17-openjdk',
    '/usr/lib/jvm/java-17-openjdk-amd64',
    '/usr/lib/jvm/java-17',
    '/opt/android-studio/jbr',
  ];
}

const javaHomeCandidates = [
  process.env.JAVA_HOME,
  ...getDefaultJavaHomeCandidates(),
].filter(Boolean);

const javaHome = javaHomeCandidates.find(hasJavaHome);

if (!javaHome) {
  console.error('Android release build requires JDK 17. Set JAVA_HOME or install JDK 17.');
  process.exit(1);
}

function getDefaultAndroidHome() {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (process.platform === 'win32') {
    return join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');
  }
  if (process.platform === 'darwin') {
    return join(home, 'Library', 'Android', 'sdk');
  }
  return join(home, 'Android', 'Sdk');
}

const androidHome = process.env.ANDROID_HOME
  || process.env.ANDROID_SDK_ROOT
  || getDefaultAndroidHome();

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

if (!existsSync(sourceApk)) {
  console.error(`Gradle reported success but release APK was not found at ${sourceApk}`);
  process.exit(1);
}

const artifactsDir = join(root, 'artifacts');
mkdirSync(artifactsDir, { recursive: true });
const targetApk = join(artifactsDir, 'PrayerStride-1.0.0-release.apk');
copyFileSync(sourceApk, targetApk);

console.log(`Release APK ready: ${targetApk}`);
