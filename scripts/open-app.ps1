$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$StartServer = Join-Path $PSScriptRoot "start-server.ps1"
$Url = "http://127.0.0.1:5173/"

& $StartServer | Out-Null

$deadline = (Get-Date).AddSeconds(15)
do {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
      break
    }
  } catch {
    Start-Sleep -Milliseconds 500
  }
} while ((Get-Date) -lt $deadline)

$Browser = $null
$Candidates = @(
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
)

foreach ($Candidate in $Candidates) {
  if ($Candidate -and (Test-Path $Candidate)) {
    $Browser = $Candidate
    break
  }
}

if (-not $Browser) {
  $Command = Get-Command msedge.exe, chrome.exe -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($Command) {
    $Browser = $Command.Source
  }
}

if ($Browser) {
  Start-Process -FilePath $Browser -ArgumentList @("--app=$Url", "--new-window")
} else {
  Start-Process $Url
}
