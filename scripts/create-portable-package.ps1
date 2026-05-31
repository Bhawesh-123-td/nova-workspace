$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Dist = Join-Path $Root "dist"
$PortableRoot = Join-Path $Root "portable"
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$PackageName = "Nova-Workspace-$Stamp"
$PackageDir = Join-Path $PortableRoot $PackageName
$PackageScripts = Join-Path $PackageDir "scripts"
$ZipPath = Join-Path $PortableRoot "$PackageName.zip"

if (-not (Test-Path (Join-Path $Dist "index.html"))) {
  throw "dist/index.html was not found. Run npm run build first."
}

New-Item -ItemType Directory -Force -Path $PackageScripts | Out-Null

Copy-Item -Path $Dist -Destination (Join-Path $PackageDir "dist") -Recurse
Copy-Item -Path (Join-Path $Root "run-nova-workspace.bat") -Destination $PackageDir
Copy-Item -Path (Join-Path $Root "PORTABLE.md") -Destination (Join-Path $PackageDir "README.md")
Copy-Item -Path (Join-Path $PSScriptRoot "run-portable-server.mjs") -Destination $PackageScripts

Compress-Archive -Path (Join-Path $PackageDir "*") -DestinationPath $ZipPath

Write-Host "Portable package created:"
Write-Host $ZipPath
