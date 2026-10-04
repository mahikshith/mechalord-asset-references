import type { Pickup } from './contract';

/** One vocabulary for the world labels, HUD and collection feedback. */
export const powers = {
  guided: { name: 'GUIDED MISSILES', short: 'GUIDED', symbol: '◎', color: '#83f3ed', effect: 'Missiles track enemies', duration: 10 },
  cannons: { name: 'HAND CANNONS', short: 'CANNONS', symbol: '▥', color: '#ffce73', effect: 'Twin rotating cannons', duration: 10 },
  railburst: { name: 'RAIL BURST', short: 'RAIL', symbol: 'ϟ', color: '#d6b5ff', effect: 'Piercing straight shots', duration: 10 },
  freeze: { name: 'FREEZE', short: 'FREEZE', symbol: '❄', color: '#99e9ff', effect: 'Hostiles frozen · keep firing', duration: 3 },
  slow: { name: 'SLOW FIELD', short: 'SLOW', symbol: '◷', color: '#9df3ba', effect: 'Slower threats · keep firing', duration: 5 },
  haste: { name: 'HASTE · RISK', short: 'HASTE !', symbol: '»', color: '#ffab69', effect: 'Faster threats · bonus score & XP', duration: 5 },
} satisfies Record<Pickup['kind'], { name: string; short: string; symbol: string; color: string; effect: string; duration: number }>;

const powerOrder: Pickup['kind'][] = ['guided', 'cannons', 'railburst', 'freeze', 'slow', 'haste'];
export function powerKind(value: number): Pickup['kind'] { return powerOrder[Math.round(value) - 1] ?? 'guided'; }
