param(
    [string]$EngineRoot = 'C:\Program Files\Epic Games\UE_5.8',
    [switch]$BuildAssets,
    [switch]$AnimateAssets,
    [switch]$ReviewAssets,
    [switch]$Headless
)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$projectPath = Join-Path $taskRoot 'game\MechalordArtLab\MechalordArtLab.uproject'
$editorPath = Join-Path $EngineRoot 'Engine\Binaries\Win64\UnrealEditor.exe'
if (-not (Test-Path -LiteralPath $editorPath)) { throw "Unreal editor missing: $editorPath" }
$version = Get-Content -LiteralPath (Join-Path $EngineRoot 'Engine\Build\Build.version') -Raw | ConvertFrom-Json
if ($version.MajorVersion -ne 5 -or $version.MinorVersion -ne 8) { throw 'Use the verified Unreal 5.8 installation.' }
if ($version.PatchVersion -ne 3) { throw 'This Art Lab is pinned to the verified Unreal 5.8.3 patch.' }
if (([int]$BuildAssets.IsPresent + [int]$AnimateAssets.IsPresent + [int]$ReviewAssets.IsPresent) -gt 1) { throw 'Run BuildAssets, AnimateAssets and ReviewAssets in sequence, after each editor exits.' }
$active = Get-CimInstance Win32_Process -Filter "Name='UnrealEditor.exe'" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($projectPath) }
if ($active) { throw 'Art Lab is already open. Save and close that editor before launching another instance of the same project.' }
$arguments = @(('"' + $projectPath + '"'), '-nosplash', '-ModelContextProtocolStartServer')
if ($BuildAssets -or $AnimateAssets -or $ReviewAssets) {
    $scriptName = if ($ReviewAssets) { 'tools\open_unreal_artlab.py' } elseif ($AnimateAssets) { 'tools\animate_unreal_artlab.py' } else { 'tools\build_unreal_artlab.py' }
    $scriptPath = Join-Path $taskRoot $scriptName
    if (-not (Test-Path -LiteralPath $scriptPath)) { throw 'Native asset builder is missing.' }
    $arguments += ('-ExecutePythonScript="' + $scriptPath + '"')
}
if ($Headless) { $arguments += @('-nullrhi','-nosound','-unattended') }
else { $arguments += @('-dx11', '-windowed', '-ResX=1100', '-ResY=760') }
$arguments += ('-abslog="' + (Join-Path $taskRoot 'builds\unreal-artlab-editor.log') + '"')
# The visible editor is the user-facing asset workspace. Background generation
# remains hidden and cannot change an unrelated running Unreal project.
$style = if ($Headless) { 'Hidden' } else { 'Normal' }
$process = Start-Process -FilePath $editorPath -ArgumentList $arguments -WindowStyle $style -PassThru
Write-Output "Unreal $($version.MajorVersion).$($version.MinorVersion).$($version.PatchVersion) Art Lab started (process $($process.Id))."
