# Runs the SideAssault game with the scripted autopilot and saves frames + a contact sheet + GIF.
# Usage: tools/unreal/capture_autopilot.ps1 -Out <dir> [-Map /Game/...] [-Extra "-IronNoAnim"]
param(
    [Parameter(Mandatory = $true)][string]$Out,
    [string]$Map = "/Game/Variant_SideScrolling/Lvl_SideScrolling",
    [string]$Extra = ""
)
$repo = Resolve-Path "$PSScriptRoot\..\.."
$proj = "$repo\game\SideAssault\SideAssault.uproject"
New-Item -ItemType Directory -Force $Out | Out-Null
$args = @("`"$proj`"", $Map, "-game", "-windowed", "-ResX=1280", "-ResY=720", "-IronAutopilot", "-benchmark", "-fps=30",
          "-nosound", "-unattended", "-nosplash", "-IronCapture=$($Out.Replace('\','/'))")
if ($Extra) { $args += $Extra.Split(' ') }
$p = Start-Process "C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor.exe" -ArgumentList $args -PassThru
$p.WaitForExit(900000) | Out-Null
python "$PSScriptRoot\make_contact.py" $Out
