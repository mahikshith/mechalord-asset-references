param(
    [string]$EngineRoot='C:\Program Files\Epic Games\UE_5.8',
    [string]$OutputPath
)
$ErrorActionPreference='Stop'
$taskRoot=Split-Path -Parent $PSScriptRoot
if(-not $OutputPath){$OutputPath=Join-Path $taskRoot 'builds\native-readiness-audit.json'}
$taskSdk=Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$taskVsWhere='C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe'
$taskWindowsKit='C:\Program Files (x86)\Windows Kits\10'
function ChildNames([string]$TaskPath){if(Test-Path -LiteralPath $TaskPath){@(Get-ChildItem -LiteralPath $TaskPath -Directory | ForEach-Object {$_.Name})}else{@()}}
function Files([string]$TaskPath,[string]$Pattern){if(Test-Path -LiteralPath $TaskPath){@(Get-ChildItem -LiteralPath $TaskPath -Recurse -File -Filter $Pattern | ForEach-Object {$_.FullName})}else{@()}}
$taskVersionPath=Join-Path $EngineRoot 'Engine\Build\Build.version'
$taskRecord=[ordered]@{
    timestamp=(Get-Date).ToUniversalTime().ToString('o')
    scope='Read-only standard local toolchain discovery. Does not launch Unreal, compile, install, update SDKs, or validate a device.'
    engineRoot=$EngineRoot
    engineVersion=if(Test-Path -LiteralPath $taskVersionPath){Get-Content -LiteralPath $taskVersionPath -Raw | ConvertFrom-Json}else{$null}
    editorExists=(Test-Path -LiteralPath (Join-Path $EngineRoot 'Engine\Binaries\Win64\UnrealEditor.exe'))
    engineWindowsRequirements=Get-Content -LiteralPath (Join-Path $EngineRoot 'Engine\Config\Windows\Windows_SDK.json') -Raw | ConvertFrom-Json
    engineAndroidRequirements=Get-Content -LiteralPath (Join-Path $EngineRoot 'Engine\Config\Android\Android_SDK.json') -Raw | ConvertFrom-Json
    visualStudioDiscovery=@()
    visualStudioStandardDirs=@()
    windowsSdkIncludes=@(ChildNames (Join-Path $taskWindowsKit 'Include'))
    windowsSdkLibs=@(ChildNames (Join-Path $taskWindowsKit 'Lib'))
    androidSdkRoot=$taskSdk
    androidPlatforms=@(ChildNames (Join-Path $taskSdk 'platforms'))
    androidBuildTools=@(ChildNames (Join-Path $taskSdk 'build-tools'))
    androidNdkVersions=@(ChildNames (Join-Path $taskSdk 'ndk'))
    androidCommandLineTools=@(ChildNames (Join-Path $taskSdk 'cmdline-tools'))
    adbExists=(Test-Path -LiteralPath (Join-Path $taskSdk 'platform-tools\adb.exe'))
    commands=@(Get-Command cl,adb,java -ErrorAction SilentlyContinue | ForEach-Object {@{name=$_.Name;source=$_.Source}})
    environment=@{}
    nativeModuleDlls=@(Files (Join-Path $taskRoot 'game\Mechalord\Binaries') '*.dll')
    nativeMaps=@(Files (Join-Path $taskRoot 'game\Mechalord\Content') '*.umap')
    workshopMaps=@(Files (Join-Path $taskRoot 'game\MechalordArtLab\Content') '*.umap')
    limitations=@('Nonstandard compiler installations may need explicit discovery. A successful real target build remains definitive.','No native adapter, Android package or performance acceptance is inferred from these paths.')
}
foreach($taskPath in @('C:\Program Files\Microsoft Visual Studio','C:\Program Files (x86)\Microsoft Visual Studio')){if(Test-Path -LiteralPath $taskPath){$taskRecord.visualStudioStandardDirs+=@(Get-ChildItem -LiteralPath $taskPath -Directory | ForEach-Object {$_.FullName})}}
if(Test-Path -LiteralPath $taskVsWhere){$taskVsJson=& $taskVsWhere -all -products '*' -format json;$taskRecord.visualStudioDiscovery=@($taskVsJson | ConvertFrom-Json)}
foreach($taskName in @('ANDROID_HOME','ANDROID_SDK_ROOT','JAVA_HOME','UE_SDKS_ROOT')){$taskRecord.environment[$taskName]=[Environment]::GetEnvironmentVariable($taskName)}
$taskRecord | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $OutputPath -Encoding utf8
Write-Output "Read-only native readiness receipt saved: $OutputPath"
