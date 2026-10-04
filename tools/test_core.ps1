$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$Compiler = Join-Path $PSScriptRoot 'vendor/zig-x86_64-windows-0.17.0/zig.exe'
if (!(Test-Path -LiteralPath $Compiler)) { throw 'Install Zig 0.17.0 locally in tools/vendor or use a C++17 compiler for test_battle.cpp.' }
$OutputDir = Join-Path $ProjectRoot 'builds/tests'
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$CoreDir = Join-Path $ProjectRoot 'game/Mechalord/Source/Mechalord'
$Exe = Join-Path $OutputDir 'battle-tests.exe'
& $Compiler c++ -std=c++17 -O2 "-I$CoreDir" (Join-Path $CoreDir 'BattleSimulation.cpp') (Join-Path $PSScriptRoot 'test_battle.cpp') -o $Exe
if ($LASTEXITCODE -ne 0) { throw 'Core compilation failed' }
& $Exe
if ($LASTEXITCODE -ne 0) { throw 'Core regression failed' }
