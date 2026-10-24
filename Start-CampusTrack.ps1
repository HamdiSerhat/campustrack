$ErrorActionPreference = 'Stop'
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodePath) {
    $bundledNode = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
    if (Test-Path -LiteralPath $bundledNode) { $nodePath = $bundledNode }
}
if (-not $nodePath) { throw 'Node.js bulunamadı / Node.js not found. index.html dosyasını doğrudan açabilirsin / You may open index.html directly.' }
$ready = $false
try { $result = Invoke-WebRequest -Uri 'http://127.0.0.1:4173' -TimeoutSec 2 -UseBasicParsing; $ready = $result.Content -match 'CampusTrack' } catch {}
if (-not $ready) {
    Start-Process -FilePath $nodePath -ArgumentList @('"' + (Join-Path $PSScriptRoot 'server.cjs') + '"') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
    Start-Sleep -Milliseconds 700
}
Start-Process 'http://127.0.0.1:4173'
