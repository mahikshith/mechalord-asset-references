param(
    [string]$EngineRoot,
    [switch]$Build,
    [switch]$Bootstrap,
    [switch]$Launch
)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$projectPath = Join-Path $taskRoot 'game\Mechalord\Mechalord.uproject'
$candidates = @()
if ($EngineRoot) { $candidates += $EngineRoot }
$manifestPath = 'C:\ProgramData\Epic\UnrealEngineLauncher\LauncherInstalled.dat'
if (Test-Path -LiteralPath $manifestPath) {
    $installed = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    $candidates += @($installed.InstallationList | Where-Object { $_.AppName -like 'UE_5.8*' } | ForEach-Object { $_.InstallLocation })
}
$candidates += 'C:\Program Files\Epic Games\UE_5.8'
$resolvedRoot = $null
foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path -LiteralPath (Join-Path $candidate 'Engine\Binaries\Win64\UnrealEditor.exe'))) {
        $resolvedRoot = (Resolve-Path -LiteralPath $candidate).Path
        break
    }
}
if (-not $resolvedRoot) {
    Write-Output 'Unreal Engine 5.8 is not installed yet. Install 5.8.3 with Android support through Epic Games Launcher, then run this tool again.'
    exit 2
}
$versionFile = Join-Path $resolvedRoot 'Engine\Build\Build.version'
$version = Get-Content -LiteralPath $versionFile -Raw | ConvertFrom-Json
if ($version.MajorVersion -ne 5 -or $version.MinorVersion -ne 8) { throw 'This project targets Unreal 5.8. Select that engine release.' }
$record = [ordered]@{
    requestedVersion='5.8.3'; installedVersion="$($version.MajorVersion).$($version.MinorVersion).$($version.PatchVersion)"
    changelist=$version.Changelist; engineRoot=$resolvedRoot; verifiedAt=(Get-Date).ToUniversalTime().ToString('o')
}
$record | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $taskRoot 'builds\unreal-installation.json') -Encoding utf8
Write-Output "Found Unreal $($record.installedVersion). Project: $projectPath"
if ($version.PatchVersion -ne 3) { Write-Output 'Installed patch differs from the verified 5.8.3 target; record and review compatibility before packaging.' }
if ($Build) {
    $buildScript = Join-Path $resolvedRoot 'Engine\Build\BatchFiles\Build.bat'
    & $buildScript MechalordEditor Win64 Development $projectPath '-WaitMutex'
    if ($LASTEXITCODE -ne 0) { throw "Unreal editor target build failed ($LASTEXITCODE)." }
}
if ($Bootstrap) {
    $bootstrapScript = Join-Path $taskRoot 'tools\bootstrap_unreal.py'
    if (-not (Test-Path -LiteralPath $bootstrapScript)) { throw 'Editor bootstrap is not available yet.' }
    $editorCommand = Join-Path $resolvedRoot 'Engine\Binaries\Win64\UnrealEditor-Cmd.exe'
    & $editorCommand $projectPath '-run=pythonscript' "-script=$bootstrapScript" '-unattended' '-nosplash' '-nullrhi'
    if ($LASTEXITCODE -ne 0) { throw "Editor asset bootstrap failed ($LASTEXITCODE)." }
}
if ($Launch) {
    $editor = Join-Path $resolvedRoot 'Engine\Binaries\Win64\UnrealEditor.exe'
    # A visible editor window is intentional: the user requested Unreal launch.
    Start-Process -FilePath $editor -ArgumentList @(('"' + $projectPath + '"')) -WindowStyle Normal
}
if (-not $Build -and -not $Bootstrap -and -not $Launch) { Write-Output 'Ready. Use -Build -Bootstrap -Launch for the first editor setup.' }
