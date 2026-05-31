$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Node = (Get-Command node.exe).Source
$Watcher = Join-Path $PSScriptRoot "keep-server-up.mjs"
$OutLog = Join-Path $Root "server.keepalive.out.log"
$ErrLog = Join-Path $Root "server.keepalive.err.log"

$Existing = Get-CimInstance Win32_Process |
  Where-Object {
    $_.CommandLine -like "*keep-server-up.mjs*" -and
    $_.CommandLine -like "*$Root*"
  }

if ($Existing) {
  Write-Host "Keep-alive watcher is already running."
  Write-Host "Open http://127.0.0.1:5173/"
  exit 0
}

Start-Process `
  -FilePath $Node `
  -ArgumentList @($Watcher) `
  -WorkingDirectory $Root `
  -WindowStyle Hidden `
  -RedirectStandardOutput $OutLog `
  -RedirectStandardError $ErrLog

Write-Host "Keep-alive watcher started."
Write-Host "Open http://127.0.0.1:5173/"
