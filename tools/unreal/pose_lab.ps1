# Close-up still captures of the standing, aiming hero for grip/pose iteration.
# Usage: tools/unreal/pose_lab.ps1 -Out <dir> [-Grip "P,Y,R,X,Y,Z"] [-Zoom 260]
param([Parameter(Mandatory = $true)][string]$Out, [string]$Grip = "", [float]$Zoom = 260)
$repo = Resolve-Path "$PSScriptRoot\..\.."
$proj = "$repo\game\SideAssault\SideAssault.uproject"
New-Item -ItemType Directory -Force $Out | Out-Null
$a = @("`"$proj`"", "/Game/Variant_SideScrolling/Lvl_SideScrolling", "-game", "-windowed", "-ResX=960", "-ResY=960",
       "-IronAutopilot", "-IronPoseLab", "-IronZoom=$Zoom", "-benchmark", "-fps=30", "-nosound", "-unattended", "-nosplash",
       "-IronCapture=$($Out.Replace('\','/'))", "-ExecCmds=`"r.MotionBlurQuality 0, r.DefaultFeature.MotionBlur 0`"")
if ($Grip) { $a += "-IronGrip=$Grip" }
$p = Start-Process "C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor.exe" -ArgumentList $a -PassThru
$p.WaitForExit(600000) | Out-Null
Select-String "$repo\game\SideAssault\Saved\Logs\SideAssault.log" -Pattern "IronDebug weapon" | ForEach-Object { $_.Line.Substring($_.Line.IndexOf('IronDebug')) }
