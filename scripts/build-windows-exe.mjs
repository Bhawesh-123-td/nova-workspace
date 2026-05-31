import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseDir = path.join(projectRoot, 'release');
const unpackedDir = path.join(releaseDir, 'win-unpacked');
const appExe = path.join(unpackedDir, 'Nova Workspace.exe');
const iconPath = path.join(projectRoot, 'build', 'icon.ico');
const rceditPath = path.join(projectRoot, 'node_modules', 'electron-winstaller', 'vendor', 'rcedit.exe');
const electronBuilderCli = path.join(projectRoot, 'node_modules', 'electron-builder', 'out', 'cli', 'cli.js');

const env = {
  ...process.env,
  CSC_IDENTITY_AUTO_DISCOVERY: 'false',
  ELECTRON_BUILDER_DISABLE_BUILD_CACHE: 'true',
};

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }
}

if (process.platform !== 'win32') {
  throw new Error('Windows EXE builds must be run on Windows.');
}

if (!fs.existsSync(iconPath)) {
  throw new Error('Missing build/icon.ico. Run npm run icons first.');
}

if (!fs.existsSync(rceditPath)) {
  throw new Error('Missing local rcedit.exe. Run npm install first.');
}

if (!fs.existsSync(electronBuilderCli)) {
  throw new Error('Missing electron-builder CLI. Run npm install first.');
}

run(process.execPath, [
  electronBuilderCli,
  '--win',
  'dir',
  '--publish',
  'never',
  '--config.win.signAndEditExecutable=false',
]);

run(rceditPath, [
  appExe,
  '--set-icon',
  iconPath,
  '--set-version-string',
  'FileDescription',
  'Nova Workspace',
  '--set-version-string',
  'ProductName',
  'Nova Workspace',
  '--set-version-string',
  'CompanyName',
  'Cris',
  '--set-version-string',
  'LegalCopyright',
  'Made by Cris',
  '--set-file-version',
  '1.0.0',
  '--set-product-version',
  '1.0.0',
]);

run(process.execPath, [
  electronBuilderCli,
  '--win',
  'portable',
  '--prepackaged',
  unpackedDir,
  '--publish',
  'never',
  '--config.win.signAndEditExecutable=false',
]);

console.log('Built release/Nova Workspace 1.0.0.exe with the Nova icon.');
