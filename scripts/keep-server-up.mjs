import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 5173);
const url = `http://${host}:${port}/`;
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

let child = null;
let lastHealthy = false;

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function checkHealth() {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(response.statusCode >= 200 && response.statusCode < 500);
    });

    request.setTimeout(2000, () => {
      request.destroy();
      resolve(false);
    });

    request.on('error', () => resolve(false));
  });
}

function startServer() {
  if (child) return;

  log(`Starting workspace server on ${url}`);
  child = spawn(
    npmCommand,
    ['run', 'dev', '--', '--host', host, '--port', String(port), '--strictPort'],
    {
      cwd: root,
      env: { ...process.env, BROWSER: 'none' },
      stdio: ['ignore', 'inherit', 'inherit'],
      windowsHide: true,
    },
  );

  child.on('exit', (code, signal) => {
    log(`Workspace server exited with ${signal || code}. Waiting for next health check.`);
    child = null;
  });
}

async function tick() {
  const healthy = await checkHealth();

  if (healthy) {
    if (!lastHealthy) {
      log(`Workspace server is healthy at ${url}`);
    }
    lastHealthy = true;
    return;
  }

  if (lastHealthy) {
    log('Workspace server stopped responding.');
  }
  lastHealthy = false;
  startServer();
}

process.on('SIGINT', () => {
  log('Stopping keep-alive watcher.');
  child?.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Stopping keep-alive watcher.');
  child?.kill('SIGTERM');
  process.exit(0);
});

log(`Keep-alive watcher active for ${url}`);
await tick();
setInterval(tick, 5000);
