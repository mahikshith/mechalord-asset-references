import { AssaultCore } from './assault-core';
import { Battlefield } from './world';
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
let pointer: number | null = null, dragStart = 0, dragOrigin = 0;
let soundOn = true, audio: AudioContext | undefined, lastHitSound = 0, lastFireSound = -1;
let blastBuffer: AudioBuffer | undefined, lastContactSound = 0;
let toastTimer: ReturnType<typeof setTimeout> | undefined;
const held = new Set<string>();
const names = ['SHIELD', 'EMP', 'OVERDRIVE'], symbols = ['◈', 'ϟ', '»'];
const descriptions = ['Shield protects your entire legion while active.', 'EMP damages nearby enemies and slows incoming attacks.', "Overdrive boosts your legion's damage and fire rate."];
const abilityEffects = ['LEGION GUARD', 'PULSE + SLOW', 'ATTACK BOOST'];
const tierNames = ['PULSE', 'TWIN', 'ARC', 'SIEGE'];
const levelNames = ['Relic Causeway', 'Roller Foundry', 'Citadel Breach'];
const challenges = ['Read. Recruit. Overcome. Pick gates and grow your legion.', 'Roll. Dodge. Adapt. Moving dangers test your timing.', 'Aim. Upgrade. Breach. Break through heavier defenses.'];
const levelTags = ['GATES & GROWTH', 'MOVING DANGERS', 'HEAVY DEFENSES'];
interface Progress { cleared: boolean[]; best: number[]; gateHint: boolean; lastLevel: number; }
const progress: Progress = { cleared: [false, false, false], best: [0, 0, 0], gateHint: false, lastLevel: 0 };
try {
  const saved = JSON.parse(localStorage.getItem('mechalord-iron-front-progress-v1') || 'null');
  if (saved?.schema === 1) {
    for (let i = 0; i < 3; ++i) {
      progress.cleared[i] = saved.cleared?.[i] === true;
      const score = saved.best?.[i]; progress.best[i] = Number.isFinite(score) ? Math.max(0, Math.min(1000000, Math.round(score))) : 0;
    }
    progress.gateHint = saved.gateHint === true;
    progress.lastLevel = Number.isInteger(saved.lastLevel) ? Math.max(0, Math.min(2, saved.lastLevel)) : 0;
  }
} catch { /* Storage may be unavailable; this session remains fully playable. */ }
let selectedLevel = progress.lastLevel;
const seenEffects = new Set<number>(), effectOrder: number[] = [];
function saveProgress(): void {
  try { localStorage.setItem('mechalord-iron-front-progress-v1', JSON.stringify({ schema: 1, ...progress })); } catch { /* Session state is retained. */ }
}
function refreshLevels(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(button => {
    const index = Number(button.dataset.level); button.setAttribute('aria-pressed', String(index === selectedLevel));
    button.classList.toggle('cleared', progress.cleared[index]);
    $(`level-status-${index}`).textContent = progress.cleared[index] ? `CLEARED · BEST ${progress.best[index]}` : levelTags[index];
  });
  $('level-challenge').textContent = challenges[selectedLevel];
}
function previewLevel(): void {
  refreshLevels();
  if (ready) { core.start(selected, selectedLevel); core.pause(true); world.reset(); targetX = 0; }
}
const clamp = (value: number): number => Math.max(-3, Math.min(3, value));

function sound(frequency: number, duration = .08, wave: OscillatorType = 'triangle', volume = .025): void {
  if (!soundOn || !audio || audio.state !== 'running') return;
  const oscillator = audio.createOscillator(), gain = audio.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(45, frequency * .58), audio.currentTime + duration);
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
  oscillator.connect(gain).connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + duration);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
}
function unlockSound(): void {
  try { audio ??= new AudioContext(); void audio.resume().catch(() => {}); } catch { soundOn = false; }
}
function destructionSound(): void {
  if (!soundOn || !audio || audio.state !== 'running') return;
  if (!blastBuffer) {
    blastBuffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * 1.5), audio.sampleRate);
    const samples = blastBuffer.getChannelData(0);
    for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;
  }
  const source = audio.createBufferSource(), filter = audio.createBiquadFilter(), gain = audio.createGain(), now = audio.currentTime;
  source.buffer = blastBuffer; source.playbackRate.setValueAtTime(1.2, now); source.playbackRate.exponentialRampToValueAtTime(.35, now + 1.2);
  filter.type = 'lowpass'; filter.frequency.setValueAtTime(2200, now); filter.frequency.exponentialRampToValueAtTime(65, now + 1.3);
  gain.gain.setValueAtTime(.075, now); gain.gain.exponentialRampToValueAtTime(.001, now + 1.4);
  source.connect(filter).connect(gain).connect(audio.destination); source.start(now); source.stop(now + 1.5);
  source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  sound(145, .85, 'triangle', .035);
}
function pulse(element: HTMLElement, className: string): void {
  element.classList.remove(className); void element.offsetWidth; element.classList.add(className);
}
function flash(text: string): void { $('gate-flash').textContent = text; pulse($('gate-flash'), 'show-gate'); }
function toast(text: string, milliseconds = 1000): void {
  clearTimeout(toastTimer); $('toast').textContent = text; $('toast').classList.add('show-toast');
  toastTimer = setTimeout(() => $('toast').classList.remove('show-toast'), milliseconds);
}
function clearInput(): void {
  held.clear(); if (pointer !== null && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
  pointer = null;
}
function begin(): void {
  if (!ready || graphicsLost) return;
  clearInput(); unlockSound(); core.start(selected, selectedLevel); core.pause(false); world.reset();
  progress.lastLevel = selectedLevel; saveProgress(); seenEffects.clear(); effectOrder.length = 0;
  intro = false; playing = true; paused = false; targetX = 0; lastArmy = 8; lastWeapon = 1; lastFireSound = -1; previous = performance.now();
  for (const id of ['intro', 'result', 'paused', 'boss-hud', 'danger']) $(id).hidden = true;
  $('hud').hidden = false; $('abilities').hidden = false; $('error').hidden = true;
  $('gate-flash').classList.remove('show-gate'); $('gate-flash').textContent = ''; $('toast').textContent = ''; $('damage-flash').classList.remove('show-damage');
  $('toast').classList.remove('show-toast'); clearTimeout(toastTimer); document.body.classList.remove('boss-warning', 'destroying');
  $('ability-name').textContent = names[selected]; $('ability-symbol').textContent = symbols[selected];
  $('ability-effect').textContent = abilityEffects[selected];
  sound(410, .18, 'triangle', .04);
}
function pause(value = !paused): void {
  if (!playing) return;
  paused = value; core.pause(value); clearInput(); $('paused').hidden = !paused;
}
function activate(): void {
  if (playing && !paused && !graphicsLost && core.activate()) { sound(660, .22, 'sine', .04); toast(`${names[selected]} ACTIVATED`, 900); }
}
function showIntro(): void {
  clearInput(); intro = true; playing = false; paused = false; previewLevel();
  for (const id of ['hud', 'abilities', 'result', 'paused', 'boss-hud', 'danger']) $(id).hidden = true;
  $('intro').hidden = false; $('toast').classList.remove('show-toast'); $('gate-flash').classList.remove('show-gate'); document.body.classList.remove('boss-warning', 'destroying');
}
function finish(s: Snapshot): void {
  playing = false; paused = false; clearInput();
  for (const id of ['hud', 'abilities', 'paused', 'boss-hud', 'danger']) $(id).hidden = true;
  document.body.classList.remove('boss-warning', 'destroying');
  const won = s.phase === 'won';
  const level = Math.max(0, Math.min(2, s.level));
  if (won) { progress.cleared[level] = true; progress.best[level] = Math.max(progress.best[level], Math.round(s.score)); saveProgress(); refreshLevels(); }
  const hasNext = won && level < 2;
  $('next-level').hidden = !hasNext; $('result').classList.toggle('has-next', hasNext);
  $('result-eyebrow').textContent = `${s.levelName || levelNames[level]} ${won ? 'CLEARED' : 'ASSAULT'}`;
  $('result-title').textContent = won ? 'VICTORY!' : 'REGROUP';
  $('result-copy').textContent = won ? `Best score ${progress.best[level]}. ${hasNext ? 'The next front is ready.' : 'All three fronts are ready to replay.'}` : 'Shoot gates to improve your choice. Break crates for weapon XP.';
  $('result-kills').textContent = String(s.kills); $('result-score').textContent = String(s.score);
  $('result').hidden = false; sound(won ? 640 : 110, .35, 'triangle', .045);
}
function effects(s: Snapshot): void {
  if (playing && !paused && s.phase !== 'destroying' && s.time - lastFireSound > .09 && s.shots.some(p => p.z < 1)) {
    sound(s.weapon >= 3 ? 140 : 220, .035, 'square', .006); lastFireSound = s.time;
  }
  let recruited = 0, gateCleared = false, damage = false, bossDied = false;
  for (const event of s.effects) {
    if (seenEffects.has(event.id)) continue;
    seenEffects.add(event.id); effectOrder.push(event.id);
    if (effectOrder.length > 512) seenEffects.delete(effectOrder.shift()!);
    world.trigger(event);
    if (event.kind === 'recruit' && event.value > 0) recruited += event.value;
    else if (event.kind === 'gate') gateCleared = true;
    else if (event.kind === 'damage') damage = true;
    else if (event.kind === 'hit' || event.kind === 'kill') {
      const now = performance.now();
      if (now - lastHitSound > 70) { sound(event.kind === 'kill' ? 160 : 210, .045, 'triangle', .012); lastHitSound = now; }
    } else if (event.kind === 'bossShot') sound(75, .18, 'sawtooth', .025);
    else if (event.kind === 'bossDeath') { bossDied = true; destructionSound(); }
    else if (event.kind === 'contact' || event.kind === 'block') {
      const now = performance.now();
      if (now - lastContactSound > 120) { sound(event.kind === 'block' ? 420 : 100, .055, 'triangle', .01); lastContactSound = now; }
    }
  }
  if (bossDied) { $('toast').classList.remove('show-toast'); $('gate-flash').classList.remove('show-gate'); clearTimeout(toastTimer); lastWeapon = s.weapon; return; }
  if (damage) { pulse($('damage-flash'), 'show-damage'); sound(90, .14, 'sawtooth', .025); }
  // One reward notification per frame: an upgrade takes priority over gate growth.
  if (s.weapon > lastWeapon) {
    flash(`${tierNames[Math.min(3, s.weapon - 1)]} CANNON UNLOCKED`); sound(950, .25, 'triangle', .04); lastWeapon = s.weapon;
  } else if (recruited > 0) { flash(`+${recruited} TROOPS`); sound(720, .12); }
  else if (gateCleared) { flash('GATE CLEARED!'); sound(840, .14); }
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
  $('objective').textContent = destroying ? '' : boss ? (windup ? 'CHARGING' : projectiles ? 'INCOMING' : `${percent}% HP`) : s.engagement ? 'CLEAR THE WAVE' : incoming ? 'TYRANT AHEAD' : `${Math.floor(route * 100)}% ADVANCE`;
  $('route-fill').style.width = `${boss ? percent : destroying ? 0 : route * 100}%`;
  document.body.classList.toggle('destroying', destroying); $('abilities').hidden = destroying;
  $('army-count').textContent = String(s.army); $('kills').textContent = boss ? `${percent}%` : String(s.kills); $('kill-label').textContent = boss ? 'CORE HEALTH' : 'ELIMINATED'; $('weapon-level').textContent = String(s.weapon);
  $('weapon-name').textContent = tierNames[Math.max(0, Math.min(3, s.weapon - 1))];
  const maxTier = s.weapon >= 4 || s.weaponNeed <= 0;
  $('weapon-xp-fill').style.width = `${maxTier ? 100 : Math.max(0, Math.min(100, s.weaponXP / s.weaponNeed * 100))}%`;
  $('weapon-xp').textContent = maxTier ? 'MAX ARSENAL' : `${Math.floor(s.weaponXP)}/${s.weaponNeed} XP → ${tierNames[Math.min(3, s.weapon)]}`;
  let crate: Snapshot['targets'][number] | undefined;
  for (const target of s.targets) if (target.kind === 'crate' && target.z >= 0 && target.z < 24 && (!crate || target.z < crate.z)) crate = target;
  $('crate-progress').hidden = !crate;
  if (crate) {
    $('crate-hp').textContent = `${Math.max(0, Math.ceil(crate.hp))}/${Math.ceil(crate.maxHp)} HP`;
    $('crate-fill').style.width = `${Math.max(0, Math.min(100, crate.hp / Math.max(1, crate.maxHp) * 100))}%`;
  }
  if (lastArmy !== s.army) { pulse($('army-count').parentElement!, 'pop'); lastArmy = s.army; }
  $('boss-hud').hidden = true;
  $('boss-fill').style.width = `${percent}%`; $('boss-health').textContent = `${percent}%`;
  $('danger').hidden = true; document.body.classList.toggle('boss-warning', boss);
  const button = $<HTMLButtonElement>('ability'); button.disabled = paused || destroying || s.energy < 100 || s.ability > 0; button.classList.toggle('ready', !button.disabled);
  $('energy-fill').style.width = `${Math.max(0, Math.min(100, s.energy))}%`;
  $('ability-caption').textContent = s.ability > 0 ? `ACTIVE · ${s.ability.toFixed(1)}s` : s.energy >= 100 ? 'READY · TAP / SPACE' : `${Math.floor(s.energy)}% CHARGED`;
  button.setAttribute('aria-label', `${names[selected]}: ${descriptions[selected]} ${$('ability-caption').textContent}`);
  $('combat-hint').textContent = s.ability > 0 ? abilityEffects[selected] : boss ? 'MOVE TO DODGE · KEEP FIRING' : s.engagement ? 'ENEMIES CLOSE · HOLD & FIRE' : 'BREAK CRATES · EARN WEAPON XP';
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
  soundOn = !soundOn; if (soundOn) unlockSound(); $('sound').textContent = soundOn ? 'SOUND ON' : 'SOUND OFF';
  $('sound').setAttribute('aria-pressed', String(soundOn)); $('sound').setAttribute('aria-label', soundOn ? 'Mute sound' : 'Enable sound');
});
canvas.addEventListener('pointerdown', event => {
  if (!playing || paused || graphicsLost || pointer !== null) return;
  pointer = event.pointerId; dragStart = event.clientX; dragOrigin = targetX; canvas.setPointerCapture(pointer);
});
canvas.addEventListener('pointermove', event => {
  if (pointer !== event.pointerId || !playing || paused) return;
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
    if (playing && !paused) {
      const left = held.has('arrowleft') || held.has('a'), right = held.has('arrowright') || held.has('d');
      if (left || right) targetX = clamp(targetX + (Number(right) - Number(left)) * dt * 5.4);
      core.step(dt, targetX);
    }
    // Exactly one snapshot per frame: effects are consumed only here.
    const snapshot = core.snapshot(); if (!intro) effects(snapshot);
    if (playing) { hud(snapshot); if (snapshot.phase === 'won' || snapshot.phase === 'lost') finish(snapshot); }
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
