using UnrealBuildTool;

public class SideAssaultEditorTarget : TargetRules
{
	public SideAssaultEditorTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Editor;
		DefaultBuildSettings = BuildSettingsVersion.Latest;
		IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
		ExtraModuleNames.Add("SideAssault");
	}
}
