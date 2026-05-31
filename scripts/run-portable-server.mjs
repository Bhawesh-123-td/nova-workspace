import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distDir = path.resolve(process.env.NOVA_DIST || path.join(root, 'dist'));
const host = process.env.HOST || '127.0.0.1';
const preferredPort = Number(process.env.PORT || 4173);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

await ensureDistExists();

const server = http.createServer(handleRequest);
const port = await listenOnAvailablePort(server, preferredPort);
const url = `http://${host}:${port}/`;

console.log('');
console.log('Nova Workspace is running locally.');
console.log(url);
console.log('');
console.log('Keep this window open while using the app. Press Ctrl+C to stop.');

if (process.env.NOVA_NO_OPEN !== '1') {
  openBrowser(url);
}

async function ensureDistExists() {
  try {
    await fs.access(path.join(distDir, 'index.html'));
  } catch {
    console.error('Could not find dist/index.html.');
    console.error('Run "npm run build" first, or use "npm run portable" to create a transfer package.');
    process.exit(1);
  }
}

async function handleRequest(request, response) {
  try {
    const requestUrl = new URL(request.url || '/', urlForParsing());
    const pathname = decodeURIComponent(requestUrl.pathname);
    const safePath = normalizeRequestPath(pathname);
    const filePath = path.join(distDir, safePath);
    const resolved = path.resolve(filePath);

    if (!resolved.startsWith(distDir)) {
      sendText(response, 403, 'Forbidden');
      return;
    }

    const stat = await fs.stat(resolved).catch(() => null);
    if (stat?.isFile()) {
      await sendFile(response, resolved);
      return;
    }

    await sendFile(response, path.join(distDir, 'index.html'));
  } catch {
    sendText(response, 500, 'Server error');
  }
}

function normalizeRequestPath(pathname) {
  if (pathname === '/') return 'index.html';
  return pathname.replace(/^\/+/, '');
}

async function sendFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const body = await fs.readFile(filePath);
  response.writeHead(200, {
    'Content-Type': contentTypes[extension] || 'application/octet-stream',
    'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  response.end(body);
}

function sendText(response, status, text) {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(text);
}

function listenOnAvailablePort(targetServer, startPort) {
  return new Promise((resolve, reject) => {
    function tryPort(port) {
      targetServer.once('error', (error) => {
        if (error.code === 'EADDRINUSE' && port < startPort + 50) {
          tryPort(port + 1);
          return;
        }
        reject(error);
      });

      targetServer.listen(port, host, () => resolve(port));
    }

    tryPort(startPort);
  });
}

function openBrowser(targetUrl) {
  const command =
    process.platform === 'win32'
      ? ['cmd', ['/c', 'start', '', targetUrl]]
      : process.platform === 'darwin'
        ? ['open', [targetUrl]]
        : ['xdg-open', [targetUrl]];

  spawn(command[0], command[1], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  }).unref();
}

function urlForParsing() {
  return `http://${host}:${preferredPort}`;
}
