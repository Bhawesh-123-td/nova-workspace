@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js and npm are required.
  echo Install Node.js from https://nodejs.org/ and run this file again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\electron" (
  echo Installing project dependencies...
  npm install
  if errorlevel 1 (
    echo.
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo Building Nova Workspace Windows EXE...
npm run win:dist
if errorlevel 1 (
  echo.
  echo Windows EXE build failed.
  pause
  exit /b 1
)

echo.
echo Done. Your EXE is in the release folder.
start "" "release"
pause
