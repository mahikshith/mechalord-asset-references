# User-run cleanup. Agent execution was rejected by automatic approval review.
# Removes only the listed local TRELLIS installation and rejected experiments.
# Original concept images, sample.glb, game assets, Blender, Unreal and shared
# Python libraries are preserved. Git history is not rewritten.
# Preview without deleting: .\remove_local_trellis.ps1 -WhatIf
[CmdletBinding(SupportsShouldProcess = $true)]
param()
$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath 'C:\Users\mahik\Desktop\mechalord').Path
$taskExpectedRoot = 'C:\Users\mahik\Desktop\mechalord'
if ($taskRoot -ne $taskExpectedRoot) { throw 'Unexpected project directory.' }
$taskPaths = @(
    'tools\vendor\trellis-local',
    'assets\experiments\trellis-local',
    'tools\trellis_local_probe.py',
    'tools\trellis_glb_metadata.py',
    'tools\trellis_mesh_preview.py',
    'tools\solidify_marshal_surface.py',
    'tools\repair_marshal_blender.py',
    'tools\polish_marshal_blender.py',
    'tools\finish_marshal_armor.py',
    'tools\run_marshal_repair.py',
    'tools\validate_marshal_repair.py',
    'tools\__pycache__\trellis_glb_metadata.cpython-310.pyc',
    'tools\__pycache__\trellis_local_probe.cpython-310.pyc',
    'tools\__pycache__\trellis_mesh_preview.cpython-310.pyc',
    'docs\trellis-local-attempt.md',
    'docs\commander-blender-repair.md',
    'delivery\relic-marshal-repaired-v4.zip',
    'assets\source\relic-marshal-repaired-v1',
    'assets\source\relic-marshal-repaired-v2',
    'assets\source\relic-marshal-repaired-v3',
    'assets\source\relic-marshal-repaired-v4',
    'assets\previews\relic-marshal-repaired-v1',
    'assets\previews\relic-marshal-repaired-v2',
    'assets\previews\relic-marshal-repaired-v3',
    'assets\previews\relic-marshal-repaired-v4',
    'assets\exports\relic-marshal-repaired-v1.glb',
    'assets\exports\relic-marshal-repaired-v2.glb',
    'assets\exports\relic-marshal-repaired-v3.glb',
    'assets\exports\relic-marshal-repaired-v4.glb',
    'assets\manifests\relic-marshal-repaired-v1.json',
    'assets\manifests\relic-marshal-repaired-v2.json',
    'assets\manifests\relic-marshal-repaired-v3.json',
    'assets\manifests\relic-marshal-repaired-v4.json',
    'assets\manifests\relic-marshal-repaired-v3-export-check.json',
    'assets\manifests\relic-marshal-repaired-v4-export-check.json'
)
$taskRunning = @(Get-CimInstance Win32_Process | Where-Object {
    $_.Name -match '^trellis' -or
    ($_.Name -match '^(python|blender)' -and $_.CommandLine -match 'trellis_local_probe|run_marshal_repair|repair_marshal_blender|polish_marshal_blender|finish_marshal_armor')
})
if ($taskRunning.Count) { throw 'Close the TRELLIS or repair processes before running cleanup.' }
# Validate the entire list before deleting any item. Refuse junctions/symlinks.
$taskTargets = @()
foreach ($taskRelative in $taskPaths) {
    $taskAbsolute = [IO.Path]::GetFullPath((Join-Path $taskRoot $taskRelative))
    if (-not $taskAbsolute.StartsWith($taskRoot + '\', [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Refusing a target outside the project.'
    }
    if (-not (Test-Path -LiteralPath $taskAbsolute)) { continue }
    if ((Resolve-Path -LiteralPath $taskAbsolute).Path -ne $taskAbsolute) { throw 'Unexpected resolved path.' }
    $taskItem = Get-Item -LiteralPath $taskAbsolute -Force
    if ($taskItem.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Refusing a reparse point.' }
    $taskContents = if ($taskItem.PSIsContainer) { @(Get-ChildItem -LiteralPath $taskAbsolute -Recurse -Force) } else { @($taskItem) }
    if (@($taskContents | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) {
        throw 'Refusing a folder containing a junction or symbolic link.'
    }
    $taskTargets += [PSCustomObject]@{
        Path = $taskAbsolute
        Bytes = [long](($taskContents | Where-Object { -not $_.PSIsContainer } | Measure-Object Length -Sum).Sum)
    }
}
$taskRemoved = 0
$taskBytes = [long]0
foreach ($taskTarget in $taskTargets) {
    if ($PSCmdlet.ShouldProcess($taskTarget.Path, 'Delete local TRELLIS installation/experiment')) {
        Remove-Item -LiteralPath $taskTarget.Path -Recurse -Force
        if (Test-Path -LiteralPath $taskTarget.Path) { throw 'An item could not be removed.' }
        $taskRemoved++
        $taskBytes += $taskTarget.Bytes
    }
}
Write-Output ('Removed {0} targets; {1:N2} GB of file contents.' -f $taskRemoved, ($taskBytes / 1000000000))
Write-Output 'Blender, Unreal, Python, shared libraries, original references and the playable game were preserved.'
