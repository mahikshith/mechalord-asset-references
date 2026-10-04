import { AssaultCore } from './assault-core';
import { Battlefield } from './world';
import { BattleAudio } from './audio';
import type { Relic, Snapshot } from './contract';

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing game control: ${id}`);
  return element as T;
};
const canvas = $<HTMLCanvasElement>('world');
const core = new AssaultCore();
let world: Battlefield;
let ready = false, intro = true, paused = false, graphicsLost = false, selected: Relic = 0;
let playing = false, targetX = 0, lastArmy = 8, lastWeapon = 1, previous = performance.now();
let defeating = false, defeatRemaining = 0;
let pointer: number | null = null, dragStart = 0, dragOrigin = 0;
let soundOn = true;
const audio = new BattleAudio();
let bossIntroduced = false, secondPhaseAnnounced = false;
let toastTimer: ReturnType<typeof setTimeout> | undefined;
let dialogueTimer: ReturnType<typeof setTimeout> | undefined;
const held = new Set<string>();
const names = ['SHIELD', 'EMP', 'OVERDRIVE'], symbols = ['◈', 'ϟ', '»'];
const descriptions = ['Shield protects your entire legion while active.', 'EMP damages nearby enemies and slows incoming attacks.', "Overdrive boosts your legion's damage and fire rate."];
const abilityEffects = ['LEGION GUARD', 'PULSE + SLOW', 'ATTACK BOOST'];
const tierNames = ['PULSE', 'TWIN', 'ARC', 'SIEGE'];
const levelNames = ['Relic Causeway', 'Roller Foundry', 'Citadel Breach'];
const challenges = ['Read. Recruit. Overcome. Pick gates and grow your legion.', 'Roll. Dodge. Adapt. Moving dangers test your timing.', 'Aim. Upgrade. Breach. Break through heavier defenses.'];
const levelTags = ['GATES & GROWTH', 'MOVING DANGERS', 'HEAVY DEFENSES'];
interface Progress { cleared: boolean[]; best: number[]; gateHint: boolean; lastLevel: number; commanderXP: number; }
const progress: Progress = { cleared: [false, false, false], best: [0, 0, 0], gateHint: false, lastLevel: 0, commanderXP: 0 };
let migratedProgress = false;
const rankThresholds = [0, 100, 250, 450];
const headStarts = ['STANDARD DEPLOYMENT', 'HAND CANNONS · 6s HEAD START', 'GUIDED MISSILES · 6s HEAD START', 'RAIL BURST · 6s HEAD START'];
const powerNames = { none: '', guided: 'GUIDED MISSILES', cannons: 'HAND CANNONS', railburst: 'RAIL BURST' };
function commanderRank(): number { let rank = 0; for (let i = 1; i < rankThresholds.length; i++) if (progress.commanderXP >= rankThresholds[i]) rank = i; return rank; }
try {
  const saved = JSON.parse(localStorage.getItem('mechalord-iron-front-progress-v1') || 'null');
  if (saved?.schema === 1 || saved?.schema === 2) {
    for (let i = 0; i < 3; ++i) {
      progress.cleared[i] = saved.cleared?.[i] === true;
      const score = saved.best?.[i]; progress.best[i] = Number.isFinite(score) ? Math.max(0, Math.min(1000000, Math.round(score))) : 0;
    }
    progress.gateHint = saved.gateHint === true;
    progress.lastLevel = Number.isInteger(saved.lastLevel) ? Math.max(0, Math.min(2, saved.lastLevel)) : 0;
    progress.commanderXP = Number.isSafeInteger(saved.commanderXP) ? Math.max(0, Math.min(1000000, saved.commanderXP)) : 0;
    // An intermediate preview wrote schema 2 before crediting legacy clears.
    // Zero XP alongside a clear cannot result from the current victory flow.
    if (saved.schema === 1 || (progress.commanderXP === 0 && progress.cleared.some(Boolean))) {
      progress.commanderXP = progress.cleared.filter(Boolean).length * 100; migratedProgress = true;
    }
  }
} catch { /* Storage may be unavailable; this session remains fully playable. */ }
if (migratedProgress) saveProgress();
let selectedLevel = progress.lastLevel;
const seenEffects = new Set<number>(), effectOrder: number[] = [];
function saveProgress(): void {
  try { localStorage.setItem('mechalord-iron-front-progress-v1', JSON.stringify({ schema: 2, ...progress })); } catch { /* Session state is retained. */ }
}
function refreshLevels(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(button => {
    const index = Number(button.dataset.level); button.setAttribute('aria-pressed', String(index === selectedLevel));
    button.classList.toggle('cleared', progress.cleared[index]);
    $(`level-status-${index}`).textContent = progress.cleared[index] ? `CLEARED · BEST ${progress.best[index]}` : levelTags[index];
  });
  $('level-challenge').textContent = challenges[selectedLevel];
  const rank = commanderRank(); $('commander-rank').textContent = `COMMANDER RANK ${rank + 1}`;
  $('commander-development').textContent = rank >= 3 ? headStarts[rank] : `${progress.commanderXP}/${rankThresholds[rank + 1]} XP · ${rank === 0 ? 'HAND CANNONS NEXT' : rank === 1 ? 'GUIDED MISSILES NEXT' : 'RAIL BURST NEXT'}`;
  $('starter-troops').textContent = String(8 + rank * 2);
}
function previewLevel(): void {
  refreshLevels();
  if (ready) { core.start(selected, selectedLevel, commanderRank()); core.pause(true); world.reset(); targetX = 0; }
}
const clamp = (value: number): number => Math.max(-3, Math.min(3, value));

function pulse(element: HTMLElement, className: string): void {
  element.classList.remove(className); void element.offsetWidth; element.classList.add(className);
}
function flash(text: string): void { $('gate-flash').textContent = text; pulse($('gate-flash'), 'show-gate'); }
function toast(text: string, milliseconds = 1000): void {
  clearTimeout(toastTimer); $('toast').textContent = text; $('toast').classList.add('show-toast');
  toastTimer = setTimeout(() => $('toast').classList.remove('show-toast'), milliseconds);
}
function dialogue(key: string, speaker: string, line: string, villain = false): void {
  clearTimeout(dialogueTimer); $('dialogue-speaker').textContent = speaker; $('dialogue-line').textContent = line;
  $('dialogue').classList.toggle('villain', villain); $('dialogue').hidden = false;
  audio.speak(key, line, villain); dialogueTimer = setTimeout(() => $('dialogue').hidden = true, 3200);
}
function clearDialogue(): void { clearTimeout(dialogueTimer); $('dialogue').hidden = true; }
function clearInput(): void {
  held.clear(); if (pointer !== null && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
  pointer = null;
}
function begin(): void {
  if (!ready || graphicsLost) return;
  clearInput(); audio.reset(); void audio.unlock(); clearDialogue(); core.start(selected, selectedLevel, commanderRank()); core.pause(false); world.reset();
  progress.lastLevel = selectedLevel; saveProgress(); seenEffects.clear(); effectOrder.length = 0;
  intro = false; playing = true; paused = false; defeating = false; defeatRemaining = 0; targetX = 0; lastArmy = 8 + commanderRank() * 2; lastWeapon = 1; previous = performance.now();
  bossIntroduced = false; secondPhaseAnnounced = false;
  for (const id of ['intro', 'result', 'paused', 'danger']) $(id).hidden = true;
  $('hud').hidden = false; $('abilities').hidden = false; $('error').hidden = true;
  $('gate-flash').classList.remove('show-gate'); $('gate-flash').textContent = ''; $('toast').textContent = ''; $('damage-flash').classList.remove('show-damage');
  $('toast').classList.remove('show-toast'); clearTimeout(toastTimer); document.body.classList.remove('boss-warning', 'destroying');
  $('ability-name').textContent = names[selected]; $('ability-symbol').textContent = symbols[selected];
  $('ability-effect').textContent = abilityEffects[selected];
  audio.play('start', .7);
}
function pause(value = !paused): void {
  if (!playing || defeating) return;
  paused = value; core.pause(value); clearInput(); $('paused').hidden = !paused;
  if (paused) { audio.silence(); clearDialogue(); } else void audio.unlock();
}
function activate(): void {
  if (playing && !defeating && !paused && !graphicsLost && core.activate()) toast(`${names[selected]} ACTIVATED`, 900);
}
function showIntro(): void {
  clearInput(); intro = true; playing = false; paused = false; defeating = false; defeatRemaining = 0; previewLevel();
  audio.reset(); clearDialogue();
  for (const id of ['hud', 'abilities', 'result', 'paused', 'danger']) $(id).hidden = true;
  $('intro').hidden = false; $('toast').classList.remove('show-toast'); $('gate-flash').classList.remove('show-gate'); document.body.classList.remove('boss-warning', 'destroying');
}
function finish(s: Snapshot): void {
  if (!playing) return;
  playing = false; paused = false; defeating = false; defeatRemaining = 0; clearInput();
  audio.silence(); clearDialogue();
  for (const id of ['hud', 'abilities', 'paused', 'danger']) $(id).hidden = true;
  document.body.classList.remove('boss-warning', 'destroying');
  const won = s.phase === 'won';
  const level = Math.max(0, Math.min(2, s.level));
  const previousRank = commanderRank(), rewardXP = won ? progress.cleared[level] ? 35 : 100 : 0;
  if (won) { progress.commanderXP = Math.min(1000000, progress.commanderXP + rewardXP); progress.cleared[level] = true; progress.best[level] = Math.max(progress.best[level], Math.round(s.score)); saveProgress(); refreshLevels(); }
  const rank = commanderRank(), promoted = rank > previousRank;
  $('result-development').hidden = !won;
  $('result-rank').textContent = `${promoted ? 'RANK UP! ' : ''}COMMANDER ${rank + 1} · +${rewardXP} XP`;
  $('result-unlock').textContent = promoted ? `${headStarts[rank]} UNLOCKED` : rank >= 3 ? 'ARSENAL MASTERED · REPLAY ANY FRONT' : `${progress.commanderXP}/${rankThresholds[rank + 1]} XP · ${headStarts[rank + 1]} NEXT`;
  const hasNext = won && level < 2;
  $('next-level').hidden = !hasNext; $('result').classList.toggle('has-next', hasNext);
  $('result-eyebrow').textContent = `${s.levelName || levelNames[level]} ${won ? 'CLEARED' : 'ASSAULT'}`;
  $('result-title').textContent = won ? 'VICTORY!' : 'REGROUP';
  $('result-copy').textContent = won ? `${promoted ? '“New arsenal. Next front.” ' : '“The front is ours. Forward.” '}Best score ${progress.best[level]}.` : 'Shoot gates to improve your choice. Break crates for weapon XP.';
  $('result-kills').textContent = String(s.kills); $('result-score').textContent = String(s.score);
  $('result').hidden = false; audio.play(won ? promoted ? 'rank' : 'win' : 'loss', .9);
  if (won) audio.speak('commander-win', promoted ? 'New arsenal. Next front.' : 'The front is ours. Forward.');
}
function effects(s: Snapshot): void {
  let recruited = 0, gateCleared = false, damage = false, bossDied = false, pickedUp = '';
  for (const event of s.effects) {
    if (seenEffects.has(event.id)) continue;
    seenEffects.add(event.id); effectOrder.push(event.id);
    if (effectOrder.length > 512) seenEffects.delete(effectOrder.shift()!);
    world.trigger(event);
    audio.event(event);
    if (event.kind === 'recruit' && event.value > 0) recruited += event.value;
    else if (event.kind === 'gate') gateCleared = true;
    else if (event.kind === 'damage' || event.kind === 'commanderHit') damage = true;
    else if (event.kind === 'bossDeath') bossDied = true;
    else if (event.kind === 'pickup') pickedUp = ['','GUIDED MISSILES','HAND CANNONS','RAIL BURST'][Math.round(event.value)] || powerNames[s.weaponPower];
  }
  if (bossDied) { clearDialogue(); $('toast').classList.remove('show-toast'); $('gate-flash').classList.remove('show-gate'); clearTimeout(toastTimer); lastWeapon = s.weapon; return; }
  if (damage) pulse($('damage-flash'), 'show-damage');
  // One reward notification per frame: an upgrade takes priority over gate growth.
  if (pickedUp) { flash(`${pickedUp} · ${Math.ceil(s.powerTime)}s`); lastWeapon = s.weapon; }
  else if (s.weapon > lastWeapon) {
    flash(`${tierNames[Math.min(3, s.weapon - 1)]} FIRE · LV ${s.weapon}`); audio.play('rank', .7, .5); lastWeapon = s.weapon;
  } else if (recruited > 0) flash(`+${recruited} TROOPS`);
  else if (gateCleared) flash('GATE CLEARED!');
  if (playing && !paused && s.phase === 'boss') {
    if (!bossIntroduced) { bossIntroduced = true; dialogue('boss-intro', 'FORGE TYRANT', ['Your legion ends here.', 'My foundry will crush you.', 'This citadel is mine.'][s.level] ?? 'Your legion ends here.', true); }
    else if (s.bossPhase === 2 && !secondPhaseAnnounced) { secondPhaseAnnounced = true; dialogue('boss-phase-two', 'FORGE TYRANT', 'Now face my full arsenal.', true); }
  }
  if (!progress.gateHint && playing && !paused && s.targets.filter(target => target.kind === 'gate' && target.z > 0 && target.z < 26).length >= 2) {
    toast('Blue = gain. Red = danger. Shoot to improve gates.', 2700);
    progress.gateHint = true; saveProgress();
  }
}
function hud(s: Snapshot): void {
  const boss = s.phase === 'boss', destroying = s.phase === 'destroying';
  const distanceRemaining = Math.max(0, s.travelGoal - s.travelDistance), route = Math.max(0, Math.min(1, s.travelDistance / Math.max(1, s.travelGoal)));
  const percent = s.bossMax > 0 ? Math.max(0, Math.min(100, Math.round(100 * s.bossHp / s.bossMax))) : 0;
  const incoming = s.phase === 'run' && distanceRemaining <= 18 && distanceRemaining > 0;
  const projectiles = boss && s.enemyShots.some(shot => shot.z > -.5 && shot.z < 10), windup = boss && s.bossAction === 'windup';
  $('phase-label').textContent = destroying ? 'TYRANT DESTROYED' : boss ? 'FORGE TYRANT' : s.levelName.toUpperCase();
  $('objective').textContent = destroying ? '' : boss ? (windup ? 'CHARGING' : projectiles ? 'INCOMING' : `${percent}% HP`) : s.engagement ? 'KEEP MOVING' : incoming ? 'TYRANT AHEAD' : `${Math.floor(route * 100)}% ADVANCE`;
  $('route-fill').style.width = `${boss ? percent : destroying ? 0 : route * 100}%`;
  document.body.classList.toggle('destroying', destroying); $('abilities').hidden = destroying;
  $('army-count').textContent = String(s.army); $('kills').textContent = String(s.kills); $('kill-label').textContent = 'ELIMINATED'; $('weapon-level').textContent = String(s.weapon);
  $('weapon-name').textContent = tierNames[Math.max(0, Math.min(3, s.weapon - 1))];
  const powerActive = s.weaponPower !== 'none' && s.powerTime > 0;
  $('temporary-power').hidden = !powerActive;
  if (powerActive) { $('power-name').textContent = powerNames[s.weaponPower]; $('power-time').textContent = `${s.powerTime.toFixed(1)}s`; $('power-fill').style.width = `${Math.min(100, s.powerTime / 10 * 100)}%`; }
  const maxTier = s.weapon >= 4 || s.weaponNeed <= 0;
  $('weapon-xp-fill').style.width = `${maxTier ? 100 : Math.max(0, Math.min(100, s.weaponXP / s.weaponNeed * 100))}%`;
  $('weapon-xp').textContent = maxTier ? 'MAX ARSENAL' : `${Math.floor(s.weaponXP)}/${s.weaponNeed} XP → ${tierNames[Math.min(3, s.weapon)]}`;
  const healthMax = Math.max(1, s.commanderMaxHp), health = Math.max(0, Math.min(healthMax, s.commanderHp));
  $('commander-health-value').textContent = `${Math.ceil(health)}/${Math.ceil(healthMax)}`;
  $('commander-health-fill').style.width = `${health / healthMax * 100}%`;
  $('commander-health').classList.toggle('critical', health / healthMax <= .3);
  $('commander-health').setAttribute('aria-valuemax', String(healthMax)); $('commander-health').setAttribute('aria-valuenow', String(Math.ceil(health)));
  if (lastArmy !== s.army) { pulse($('army-count').parentElement!, 'pop'); lastArmy = s.army; }
  $('danger').hidden = true; document.body.classList.toggle('boss-warning', boss);
  const button = $<HTMLButtonElement>('ability'); button.disabled = paused || destroying || s.energy < 100 || s.ability > 0; button.classList.toggle('ready', !button.disabled);
  $('energy-fill').style.width = `${Math.max(0, Math.min(100, s.energy))}%`;
  $('ability-caption').textContent = s.ability > 0 ? `ACTIVE · ${s.ability.toFixed(1)}s` : s.energy >= 100 ? 'READY · TAP / SPACE' : `${Math.floor(s.energy)}% CHARGED`;
  button.setAttribute('aria-label', `${names[selected]}: ${descriptions[selected]} ${$('ability-caption').textContent}`);
  $('combat-hint').textContent = s.ability > 0 ? abilityEffects[selected] : boss ? 'MOVE TO DODGE · KEEP FIRING' : s.engagement ? 'CLOSE CONTACT · DODGE & FIRE' : 'BREAK CRATES · EARN WEAPON XP';
}
document.querySelectorAll<HTMLButtonElement>('[data-relic]').forEach(button => button.addEventListener('click', () => {
  selected = Number(button.dataset.relic) as Relic;
  document.querySelectorAll('[data-relic]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  $('relic-description').textContent = descriptions[selected];
  previewLevel();
}));
document.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(button => button.addEventListener('click', () => {
  selectedLevel = Math.max(0, Math.min(2, Number(button.dataset.level))); previewLevel();
}));
refreshLevels();
$('start').addEventListener('click', begin); $('retry').addEventListener('click', begin); $('pause-retry').addEventListener('click', begin); $('back').addEventListener('click', showIntro);
$('next-level').addEventListener('click', () => { selectedLevel = Math.min(2, selectedLevel + 1); refreshLevels(); begin(); });
$('pause-levels').addEventListener('click', showIntro);
$('pause').addEventListener('click', () => pause()); $('resume').addEventListener('click', () => pause(false)); $('ability').addEventListener('click', activate);
$('sound').addEventListener('click', () => {
  soundOn = !soundOn; audio.setEnabled(soundOn); $('sound').textContent = soundOn ? 'SOUND ON' : 'SOUND OFF';
  $('sound').setAttribute('aria-pressed', String(soundOn)); $('sound').setAttribute('aria-label', soundOn ? 'Mute sound' : 'Enable sound');
});
canvas.addEventListener('pointerdown', event => {
  if (!playing || defeating || paused || graphicsLost || pointer !== null) return;
  pointer = event.pointerId; dragStart = event.clientX; dragOrigin = targetX; canvas.setPointerCapture(pointer);
});
canvas.addEventListener('pointermove', event => {
  if (pointer !== event.pointerId || !playing || defeating || paused) return;
  targetX = clamp(dragOrigin + (event.clientX - dragStart) * 6 / Math.max(1, canvas.getBoundingClientRect().width));
});
const release = (event: PointerEvent): void => { if (pointer === event.pointerId) pointer = null; };
canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release); canvas.addEventListener('lostpointercapture', release);
window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (playing && ['arrowleft', 'arrowright', ' ', 'escape'].includes(key)) event.preventDefault();
  if (event.repeat) return; held.add(key);
  if (key === ' ') activate(); else if (key === 'escape') pause(); else if (key === 'r' && ready && !intro) begin();
});
window.addEventListener('keyup', event => held.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => { clearInput(); if (playing) pause(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInput(); if (playing) pause(true); } });
canvas.addEventListener('webglcontextlost', event => {
  event.preventDefault(); graphicsLost = true; if (playing) pause(true); $('error').hidden = false;
  $('error').textContent = 'Graphics interrupted. Your run is paused while the battlefield recovers.';
});
canvas.addEventListener('webglcontextrestored', () => { graphicsLost = false; world.reset(); $('error').hidden = true; previous = performance.now(); if (playing) pause(true); });
function frame(now: number): void {
  const dt = Math.max(0, Math.min(.1, (now - previous) / 1000)); previous = now;
  if (ready && !graphicsLost) {
    if (playing && !paused && !defeating) {
      const left = held.has('arrowleft') || held.has('a'), right = held.has('arrowright') || held.has('d');
      if (left || right) targetX = clamp(targetX + (Number(right) - Number(left)) * dt * 5.4);
      core.step(dt, targetX);
    }
    // Exactly one snapshot per frame: effects are consumed only here.
    const snapshot = core.snapshot(); if (!intro && !paused && playing) effects(snapshot);
    audio.update(snapshot, !intro && !paused && playing);
    if (playing) {
      if (snapshot.phase === 'lost') {
        if (!defeating) {
          defeating = true; defeatRemaining = 1.5; clearInput(); clearDialogue(); $('hud').hidden = true; $('abilities').hidden = true;
          clearTimeout(toastTimer); $('toast').classList.remove('show-toast'); $('gate-flash').classList.remove('show-gate');
        }
        if (!paused) defeatRemaining -= dt;
        if (defeatRemaining <= 0) finish(snapshot);
      } else { hud(snapshot); if (snapshot.phase === 'won') finish(snapshot); }
    }
    world.update(snapshot, dt, intro ? 'intro' : paused ? 'paused' : playing ? 'play' : 'result');
  }
  requestAnimationFrame(frame);
}
async function boot(): Promise<void> {
  try {
    world = new Battlefield(canvas); await Promise.all([core.load(), world.load()]); ready = true; previewLevel();
    $<HTMLButtonElement>('start').disabled = false; $('start').textContent = 'PLAY'; $('loading').textContent = 'Drag to steer · Auto fire · Tap a charged relic';
    previous = performance.now(); requestAnimationFrame(frame);
  } catch (error) {
    console.error(error); $('error').hidden = false;
    $('error').textContent = `Battlefield could not load. ${error instanceof Error ? error.message : String(error)} Refresh to retry.`;
    $('loading').textContent = 'Loading stopped.';
  }
}
void boot();
