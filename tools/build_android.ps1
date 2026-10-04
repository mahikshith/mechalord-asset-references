param(
    [Parameter(Mandatory=$true)][string]$EngineRoot,
    [ValidateSet('Development','Shipping')][string]$Configuration='Development',
    [switch]$VerifyToolchainOnly
)
$ErrorActionPreference='Stop'
$taskRoot=Split-Path -Parent $PSScriptRoot
$projectPath=Join-Path $taskRoot 'game\Mechalord\Mechalord.uproject'
$enginePath=(Resolve-Path -LiteralPath $EngineRoot).Path
$uat=Join-Path $enginePath 'Engine\Build\BatchFiles\RunUAT.bat'
if (-not (Test-Path -LiteralPath $uat)) { throw 'RunUAT was not found in the selected engine.' }
$version=Get-Content -LiteralPath (Join-Path $enginePath 'Engine\Build\Build.version') -Raw | ConvertFrom-Json
if ($version.MajorVersion -ne 5 -or $version.MinorVersion -ne 8) { throw 'Select the pinned Unreal 5.8 release.' }
$entry=Join-Path $taskRoot 'game\Mechalord\Content\Mechalord\Maps\Entry.umap'
if (-not $VerifyToolchainOnly -and -not (Test-Path -LiteralPath $entry)) { throw 'Entry map has not been created. Build the editor and run tools/launch_unreal.ps1 -Bootstrap first.' }
& $uat Turnkey '-command=VerifySdk' '-platform=Android' '-UpdateIfNeeded' "-project=$projectPath" '-utf8output'
if ($LASTEXITCODE -ne 0) { throw "Android Turnkey validation failed ($LASTEXITCODE)." }
if ($VerifyToolchainOnly) { Write-Output 'Turnkey Android validation finished. Packaging was not requested.'; exit 0 }
$outputPath=Join-Path $taskRoot "builds\Android-$Configuration"
& $uat BuildCookRun "-project=$projectPath" '-noP4' '-platform=Android' '-cookflavor=ASTC' "-clientconfig=$Configuration" '-build' '-cook' '-stage' '-pak' '-archive' "-archivedirectory=$outputPath" '-utf8output' '-unattended'
if ($LASTEXITCODE -ne 0) { throw "Android packaging failed ($LASTEXITCODE)." }
$packages=@(Get-ChildItem -LiteralPath $outputPath -Filter '*.apk' -Recurse -File)
if ($packages.Count -eq 0) { throw 'Packaging command returned success but no APK was found. Inspect the UAT log.' }
$result=[ordered]@{
    configuration=$Configuration; engineVersion="$($version.MajorVersion).$($version.MinorVersion).$($version.PatchVersion)"
    packagedAt=(Get-Date).ToUniversalTime().ToString('o')
    apks=@($packages | ForEach-Object { @{path=$_.FullName; bytes=$_.Length; sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash} })
    measuredInstalledBytes=$null; deviceValidated=$false
    notes='APK archive size differs from installed storage. Measure installation and optional chapter storage on the device separately.'
}
$result | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $outputPath 'package-receipt.json') -Encoding utf8
Write-Output "Android APK saved under $outputPath. Device installation and gameplay verification remain pending."
