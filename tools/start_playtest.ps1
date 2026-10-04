param([int]$Port = 8077)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$deliveryRoot = Join-Path $taskRoot 'delivery'
$url = "http://127.0.0.1:$Port/playable/index.html"
if (-not (Test-Path -LiteralPath (Join-Path $deliveryRoot 'playable\assault.wasm'))) {
    throw 'The playable build is missing. Build the preview before starting it.'
}
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
    $python = (Get-Command python -ErrorAction Stop).Source
    Start-Process -FilePath $python -ArgumentList @('-m', 'http.server', "$Port", '--bind', '127.0.0.1', '--directory', ('"' + $deliveryRoot + '"')) -WindowStyle Hidden
    Start-Sleep -Milliseconds 800
}
$response = Invoke-WebRequest -Uri $url -UseBasicParsing
if ($response.StatusCode -ne 200 -or $response.Content -notmatch 'Mechalord') {
    throw "Port $Port is occupied by a different server. Choose another port."
}
Write-Output "Mechalord is ready: $url"
