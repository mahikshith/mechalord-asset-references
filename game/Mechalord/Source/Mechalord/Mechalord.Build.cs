using UnrealBuildTool;
public class Mechalord : ModuleRules
{
    public Mechalord(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
        PublicDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine", "InputCore", "UMG" });
        PrivateDependencyModuleNames.AddRange(new string[] { "Slate", "SlateCore", "Json", "JsonUtilities", "HTTP", "ChunkDownloader", "PakFile", "RenderCore", "RHI" });
    }
}
