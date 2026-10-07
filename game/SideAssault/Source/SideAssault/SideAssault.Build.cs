// Copyright Epic Games, Inc. All Rights Reserved.

using UnrealBuildTool;

public class SideAssault : ModuleRules
{
	public SideAssault(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[] {
			"Core",
			"CoreUObject",
			"Engine",
			"InputCore",
			"EnhancedInput",
			"AIModule",
			"StateTreeModule",
			"GameplayStateTreeModule",
			"UMG",
			"Slate"
		});

		PrivateDependencyModuleNames.AddRange(new string[] { });

		PublicIncludePaths.AddRange(new string[] {
			"SideAssault",
			"SideAssault/Variant_Platforming",
			"SideAssault/Variant_Platforming/Animation",
			"SideAssault/Variant_Combat",
			"SideAssault/Variant_Combat/AI",
			"SideAssault/Variant_Combat/Animation",
			"SideAssault/Variant_Combat/Gameplay",
			"SideAssault/Variant_Combat/Interfaces",
			"SideAssault/Variant_Combat/UI",
			"SideAssault/Variant_SideScrolling",
			"SideAssault/Variant_SideScrolling/AI",
			"SideAssault/Variant_SideScrolling/Gameplay",
			"SideAssault/Variant_SideScrolling/Interfaces",
			"SideAssault/Variant_SideScrolling/UI"
		});

		// Uncomment if you are using Slate UI
		// PrivateDependencyModuleNames.AddRange(new string[] { "Slate", "SlateCore" });

		// Uncomment if you are using online features
		// PrivateDependencyModuleNames.Add("OnlineSubsystem");

		// To include OnlineSubsystemSteam, add it to the plugins section in your uproject file with the Enabled attribute set to true
	}
}
