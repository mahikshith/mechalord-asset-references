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
let toastTimer: ReturnType<typeof setTimeout> | undefined;
const held = new Set<string>();
const names = ['SHIELD', 'EMP', 'OVERDRIVE'], symbols = ['◈', 'ϟ', '»'];
const descriptions = ['Block incoming damage for a short burst.', 'Freeze machines and interrupt their attack.', 'Supercharge your weapon and firing speed.'];
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
  clearInput(); unlockSound(); core.start(selected); core.pause(false); world.reset();
  intro = false; playing = true; paused = false; targetX = 0; lastArmy = 8; lastWeapon = 1; lastFireSound = -1; previous = performance.now();
  for (const id of ['intro', 'result', 'paused', 'boss-hud', 'danger']) $(id).hidden = true;
  $('hud').hidden = false; $('abilities').hidden = false; $('error').hidden = true;
  $('gate-flash').classList.remove('show-gate'); $('damage-flash').classList.remove('show-damage');
  $('toast').classList.remove('show-toast'); clearTimeout(toastTimer); document.body.classList.remove('boss-warning');
  $('ability-name').textContent = names[selected]; $('ability-symbol').textContent = symbols[selected];
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
  clearInput(); core.start(selected); core.pause(true); intro = true; playing = false; paused = false; world.reset();
  for (const id of ['hud', 'abilities', 'result', 'paused', 'boss-hud', 'danger']) $(id).hidden = true;
  $('intro').hidden = false; $('toast').classList.remove('show-toast'); $('gate-flash').classList.remove('show-gate'); document.body.classList.remove('boss-warning');
}
function finish(s: Snapshot): void {
  playing = false; paused = false; clearInput();
  for (const id of ['hud', 'abilities', 'paused', 'boss-hud', 'danger']) $(id).hidden = true;
  document.body.classList.remove('boss-warning');
  const won = s.phase === 'won';
  $('result-eyebrow').textContent = won ? 'IRON FRONT CLEARED' : 'THE FRONT IS STILL STANDING';
  $('result-title').textContent = won ? 'VICTORY!' : 'REGROUP';
  $('result-copy').textContent = won ? 'Your legion broke the line. Go again with another relic.' : 'Grow your army at gates, upgrade your weapon and dodge the red lane.';
  $('result-kills').textContent = String(s.kills); $('result-score').textContent = String(s.score);
  $('result').hidden = false; sound(won ? 640 : 110, .35, 'triangle', .045);
}
function effects(s: Snapshot): void {
  if(playing&&!paused&&s.time-lastFireSound>.07&&s.shots.some(p=>p.z<1)){sound(s.weapon===3?140:220,.035,'square',.006);lastFireSound=s.time;}
  const hasRecruit = s.effects.some(event => event.kind === 'recruit' && event.value > 0);
  for (const event of s.effects) {
    world.trigger(event);
    if (event.kind === 'recruit' && event.value > 0) { flash(`+${event.value} TROOPS`); sound(720, .12); }
    else if (event.kind === 'gate') { if (!hasRecruit) flash('GATE CLEARED!'); sound(840, .14); }
    else if (event.kind === 'damage') { pulse($('damage-flash'), 'show-damage'); sound(90, .14, 'sawtooth', .025); }
    else if (event.kind === 'hit' || event.kind === 'kill') {
      const now = performance.now();
      if (now - lastHitSound > 70) { sound(event.kind === 'kill' ? 160 : 210, .045, 'triangle', .012); lastHitSound = now; }
    } else if (event.kind === 'bossShot') sound(75, .18, 'sawtooth', .025);
  }
}
function hud(s: Snapshot): void {
  const boss = s.phase === 'boss', remaining = Math.max(0, Math.ceil(s.duration - s.time));
  $('phase-label').textContent = boss ? 'BOSS FIGHT' : 'IRON FRONT'; $('objective').textContent = boss ? 'BREAK THE COLOSSUS' : `${remaining}s TO BOSS`;
  const progress = boss && s.bossMax > 0 ? 1 - s.bossHp / s.bossMax : s.time / Math.max(1, s.duration);
  $('route-fill').style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
  if(s.weapon>lastWeapon){flash(s.weapon===2?'TWIN CANNON UNLOCKED':'ARC CANNON UNLOCKED');sound(950,.25,'triangle',.04);lastWeapon=s.weapon;}
  $('army-count').textContent = String(s.army); $('kills').textContent = String(s.kills); $('weapon-level').textContent = String(s.weapon);
  if (lastArmy !== s.army) { pulse($('army-count').parentElement!, 'pop'); lastArmy = s.army; }
  $('boss-hud').hidden = !boss;
  const percent = s.bossMax > 0 ? Math.max(0, Math.round(100 * s.bossHp / s.bossMax)) : 0;
  $('boss-fill').style.width = `${percent}%`; $('boss-health').textContent = `${percent}%`;
  const incoming = !boss && remaining <= 6 && remaining > 0, attack = boss && s.bossAttack > 0;
  $('danger').hidden = !(incoming || attack); $('danger-text').textContent = attack ? 'DODGE THE RED LANE!' : `BOSS INCOMING · ${remaining}s`;
  $('danger').classList.toggle('danger-live', attack); document.body.classList.toggle('boss-warning', boss);
  const button = $<HTMLButtonElement>('ability'); button.disabled = paused || s.energy < 100 || s.ability > 0; button.classList.toggle('ready', !button.disabled);
  $('energy-fill').style.width = `${Math.max(0, Math.min(100, s.energy))}%`;
  $('ability-caption').textContent = s.ability > 0 ? `ACTIVE · ${s.ability.toFixed(1)}s` : s.energy >= 100 ? 'READY · TAP / SPACE' : `CHARGING ${Math.floor(s.energy)}%`;
}
document.querySelectorAll<HTMLButtonElement>('[data-relic]').forEach(button => button.addEventListener('click', () => {
  selected = Number(button.dataset.relic) as Relic;
  document.querySelectorAll('[data-relic]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  $('relic-description').textContent = descriptions[selected];
}));
$('start').addEventListener('click', begin); $('retry').addEventListener('click', begin); $('pause-retry').addEventListener('click', begin); $('back').addEventListener('click', showIntro);
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
    world = new Battlefield(canvas); await Promise.all([core.load(), world.load()]); world.reset(); ready = true;
    $<HTMLButtonElement>('start').disabled = false; $('start').textContent = 'PLAY'; $('loading').textContent = 'All relics free · instant retries';
    previous = performance.now(); requestAnimationFrame(frame);
  } catch (error) {
    console.error(error); $('error').hidden = false;
    $('error').textContent = `Battlefield could not load. ${error instanceof Error ? error.message : String(error)} Refresh to retry.`;
    $('loading').textContent = 'Loading stopped.';
  }
}
void boot();
