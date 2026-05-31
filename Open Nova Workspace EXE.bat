@echo off
setlocal
cd /d "%~dp0"

set "APP_EXE=release\Nova Workspace 1.0.0.exe"

if not exist "%APP_EXE%" (
  echo Nova Workspace EXE was not found.
  echo.
  echo Run "Make Windows EXE.bat" first, then try again.
  echo.
  pause
  exit /b 1
)

start "" "%APP_EXE%"
