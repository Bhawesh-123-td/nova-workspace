@echo off
setlocal

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Nova Workspace needs Node.js 18 or newer to run on this device.
  echo Install Node.js LTS from https://nodejs.org, then run this file again.
  pause
  exit /b 1
)

node "%~dp0scripts\run-portable-server.mjs"
