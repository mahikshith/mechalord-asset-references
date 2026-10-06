/** Shared player-facing chapter names. Existing save indices stay stable. */
export const chapters = [
  { name: 'Reactor Siege', challenge: 'Bait the cannons. Claim new powers. Dismantle the reactor.', tag: 'REACTOR ASSAULT' },
  { name: 'Roller Foundry', challenge: 'Roll. Dodge. Adapt. Moving dangers test your timing.', tag: 'MOVING DANGERS' },
  { name: 'Citadel Breach', challenge: 'Aim. Upgrade. Breach. Break through heavier defenses.', tag: 'HEAVY DEFENSES' },
  { name: 'Storm Pass', challenge: 'Read the crossfire. Freeze the rush. Ride the storm.', tag: 'CROSSFIRE & CONTROL' },
  { name: 'Forge Core', challenge: 'Crack the batteries. Claim siege weapons. Break the forge.', tag: 'FORTIFIED GAUNTLET' },
  { name: 'Iron March', challenge: 'Cross the Skyforge viaduct, survive the storm reactor trench, and breach the forge citadel. One changing battlefield. One final Tyrant.', tag: '3 ENVIRONMENTS · ONE FINAL BOSS' },
] as const;
export const campaignIndex = 5;
export const campaignActs = ['Skyforge Viaduct', 'Storm Reactor Trench', 'Forge Citadel'] as const;
