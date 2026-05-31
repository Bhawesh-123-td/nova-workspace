#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  osascript -e 'display dialog "Nova Workspace needs Node.js installed first. Install Node.js from https://nodejs.org, then open this file again." buttons {"OK"} default button "OK" with title "Nova Workspace"'
  exit 1
fi

if [ ! -d "node_modules/electron" ]; then
  npm install
fi

npm run desktop
