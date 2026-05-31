$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Desktop = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $Desktop "Nova Workspace.lnk"
$OpenScript = Join-Path $PSScriptRoot "open-app.ps1"
$PowerShell = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$Icon = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"

$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $PowerShell
$Shortcut.Arguments = "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$OpenScript`""
$Shortcut.WorkingDirectory = $Root
if (Test-Path $Icon) {
  $Shortcut.IconLocation = $Icon
}
$Shortcut.Description = "Open Nova Workspace"
$Shortcut.Save()

Write-Host "Created desktop shortcut: $ShortcutPath"
