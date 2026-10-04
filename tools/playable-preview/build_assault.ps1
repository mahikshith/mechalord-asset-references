$ErrorActionPreference='Stop'
$root=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$compiler=Join-Path $root 'tools\vendor\zig-x86_64-windows-0.17.0\zig.exe'
$core=Join-Path $root 'game\Mechalord\Source\Mechalord'
$out=Join-Path $root 'delivery\playable'
New-Item -ItemType Directory -Force -Path $out | Out-Null
& $compiler c++ '-target' 'wasm32-wasi' '-std=c++17' '-O2' '-fno-exceptions' '-fno-rtti' '-mexec-model=reactor' "-I$core" (Join-Path $core 'AssaultSimulation.cpp') (Join-Path $PSScriptRoot 'assault_bridge.cpp') '-Wl,--export-memory' '-Wl,-z,stack-size=1048576' '-o' (Join-Path $out 'assault.wasm')
if($LASTEXITCODE -ne 0){throw 'Assault simulation WebAssembly build failed.'}
Write-Output 'Compiled assault.wasm from the new fixed-step assault simulation.'
