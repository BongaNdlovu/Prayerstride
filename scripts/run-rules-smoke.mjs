import { spawnSync } from 'node:child_process';

const root = process.cwd();
const firebaseCommand = process.platform === 'win32' ? 'firebase.cmd' : 'firebase';

function cleanupFirestoreEmulator() {
  if (process.platform !== 'win32') return;

  const command = [
    '$portOwners = @(Get-NetTCPConnection -LocalPort 8105 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)',
    'foreach ($owner in $portOwners) {',
    '  $process = Get-CimInstance Win32_Process -Filter "ProcessId = $owner"',
    "  if ($process -and $process.Name -eq 'java.exe' -and $process.CommandLine -like '*cloud-firestore-emulator*' -and $process.CommandLine -like '*--port 8105*') { Stop-Process -Id $owner -Force }",
    '}',
  ].join('; ');

  spawnSync('powershell.exe', ['-NoProfile', '-Command', command], {
    cwd: root,
    stdio: 'ignore',
  });
}

cleanupFirestoreEmulator();

const result = process.platform === 'win32'
  ? spawnSync(
    `${firebaseCommand} emulators:exec --only firestore "node scripts/rules-smoke.mjs"`,
    {
      cwd: root,
      stdio: 'inherit',
      shell: true,
    },
  )
  : spawnSync(firebaseCommand, ['emulators:exec', '--only', 'firestore', 'node scripts/rules-smoke.mjs'], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });

cleanupFirestoreEmulator();

if (result.error) {
  console.error(`Rules smoke failed to start Firebase CLI: ${result.error.message}`);
}

process.exit(result.status ?? 1);
