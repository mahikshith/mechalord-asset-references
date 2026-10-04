using UnrealBuildTool;
using System.Collections.Generic;
public class MechalordEditorTarget : TargetRules
{
    public MechalordEditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.Latest;
        IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
        ExtraModuleNames.Add("Mechalord");
    }
}
