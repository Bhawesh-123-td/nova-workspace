import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const electronBin = path.join(root, 'node_modules', '.bin', isWindows ? 'electron.cmd' : 'electron');
const devUrl = 'http://127.0.0.1:5173/';

function spawnChild(command, args, options = {}) {
  return spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    ...options,
  });
}

function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    function check() {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });

      request.on('error', () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }
        setTimeout(check, 350);
      });
    }

    check();
  });
}

const vite = spawnChild(npmCommand, ['run', 'dev']);

try {
  await waitForServer(devUrl);
} catch (error) {
  console.error(error.message);
  vite.kill();
  process.exit(1);
}

const electron = spawnChild(electronBin, ['electron/main.cjs', '--dev'], {
  env: {
    ...process.env,
    NOVA_DESKTOP_DEV_URL: devUrl,
  },
});

function shutdown() {
  electron.kill();
  vite.kill();
}

electron.on('exit', (code) => {
  vite.kill();
  process.exit(code ?? 0);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
