import { AssaultCore } from './assault-core';
import { Battlefield } from './world';
import { BattleAudio } from './audio';
import type {BossRegionId} from './contract';
import type { Relic, Snapshot } from './contract';
import {powers,powerKind} from './power-catalog';
import {chapters,campaignIndex,campaignActs} from './chapter-catalog';

// Native L faces screen-right at neutral; visible world X remains the side cue while banking.
function partName(id:BossRegionId,s:Snapshot){
  const regions=s.bossRegions;
  const r=regions?.find(r=>r.id===id),side=r?(r.x>=s.bossX?'RIGHT':'LEFT'):(id.endsWith('L')?'RIGHT':'LEFT');
  return id==='core'?'CORE':`${side} ${id.startsWith('cannon')?'CANNON':id.startsWith('jet')?'BOOSTER':'LEG ARMOR'}`;
}
function brokenPartMessage(event:Snapshot['effects'][number],s:Snapshot){
  const ids:BossRegionId[]=['cannonL','cannonR','jetL','jetR','legL','legR'];
  const id=event.hitRegion??ids[event.value-1];
  if(!id)return 'ARMOR DESTROYED · KEEP MOVING';
  const regions=s.bossRegions;
  const next=regions?.find(r=>r.id!==id&&r.id!=='core'&&r.vulnerable&&r.hp>0);
  const follow=next?`AIM ${partName(next.id,s)}`:s.bossPart==='cannon'?'AIM THE OTHER CANNON':s.bossPart==='jetpack'?'AIM THE BOOSTERS':s.bossPart==='leg'?'AIM THE LEG ARMOR':'WATCH THE NEXT VOLLEY';
  // Only CoreExpose announces an opening; breaking one leg does not open the reactor.
  return `${partName(id,s)} DESTROYED · ${follow}`;
}

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
let defeating = false, defeatRemaining = 0, downed = false;
let clashing = false, rewarding = false, reviving = false, rewardChoosing = false;
let finalReward = false;
let pendingReward: LegacyImprint | undefined;
let latestSnapshot: Snapshot | undefined;
let clashHeld = false, clashHoldTime = 0;
let focusPart: BossRegionId | undefined;
let campaignSave = false;
let pointer: number | null = null, dragStart = 0, dragOrigin = 0;
let soundOn = true;
const audio = new BattleAudio();
let bossIntroduced = false, secondPhaseAnnounced = false;
let shieldBlockUntil = 0;
let toastTimer: ReturnType<typeof setTimeout> | undefined;
let dialogueTimer: ReturnType<typeof setTimeout> | undefined;
const held = new Set<string>();
const names = ['SHIELD', 'EMP', 'BARRAGE'];
const descriptions = ['Shield protects your entire legion while active.', 'EMP clears ordinary machines and incoming fire, then briefly stuns surviving elites.', 'Barrage deploys shoulder launchers for a timed sequence of paired rocket volleys.'];
const abilityEffects = ['LEGION GUARD', 'CLEAR + STUN', 'STORM BATTERY FIRING'];
const tierNames = ['PULSE', 'TWIN', 'ARC', 'SIEGE'];
const levelNames = chapters.map(chapter=>chapter.name);
const challenges = chapters.map(chapter=>chapter.challenge);
const levelTags = chapters.map(chapter=>chapter.tag);
type LegacyImprint='laser'|'vitality'|'endurance';
interface Armory { credits:number; sentinel:number; havoc:number; wisp:number; weapon:number; }
interface Progress { legacyImprint?:LegacyImprint; cleared: boolean[]; best: number[]; gateHint: boolean; lastLevel: number; commanderXP: number; armory: Armory; }
const progress: Progress = { cleared: chapters.map(()=>false), best: chapters.map(()=>0), gateHint: false, lastLevel: 0, commanderXP: 0, armory: { credits: 0, sentinel: 0, havoc: 0, wisp: 0, weapon: 0 } };
let migratedProgress = false;
const rankThresholds = [0, 100, 250, 450];
// Armory: permanent hires (each adds a machine and its persona power) and one-run starting weapons.
const MAX_HIRES = 9; // the campaign squad caps at 16 machines; 7 deploy by default
const HIRES = [
  {key:'sentinel', name:'SENTINEL', price:80, icon:'◆', copy:'Swarm walker · <em>+1 machine</em>'},
  {key:'havoc', name:'HAVOC', price:220, icon:'⬢', copy:'Siege strider · <em>+1 machine, Barrage starts +15%</em>'},
  {key:'wisp', name:'WISP', price:180, icon:'●', copy:'Storm drone · <em>+1 machine, EMP starts +15%</em>'},
] as const;
const WEAPONS = [
  {id:2, name:'HAND CANNONS', price:120, icon:'≡', copy:'Heavy rotary fire · <em>first 30 s of next run</em>'},
  {id:1, name:'GUIDED MISSILES', price:160, icon:'➶', copy:'Homing volleys · <em>first 30 s of next run</em>'},
  {id:3, name:'RAIL BURST', price:220, icon:'ϟ', copy:'Piercing rails · <em>first 30 s of next run</em>'},
] as const;
const hired = () => progress.armory.sentinel + progress.armory.havoc + progress.armory.wisp;
const headStarts = ['STANDARD DEPLOYMENT', 'HAND CANNONS · FULL RUN', 'GUIDED MISSILES · FULL RUN', 'RAIL BURST · FULL RUN'];
function commanderRank(): number { let rank = 0; for (let i = 1; i < rankThresholds.length; i++) if (progress.commanderXP >= rankThresholds[i]) rank = i; return rank; }
try {
  const saved = JSON.parse(localStorage.getItem('mechalord-iron-front-progress-v1') || 'null');
  if (saved?.schema === 1 || saved?.schema === 2 || saved?.schema === 3 || saved?.schema === 4) {
    campaignSave = saved.schema === 4;
    if(['laser','vitality','endurance'].includes(saved.legacyImprint)) progress.legacyImprint=saved.legacyImprint;
    for (let i = 0; i < chapters.length; ++i) {
      progress.cleared[i] = saved.cleared?.[i] === true;
      const score = saved.best?.[i]; progress.best[i] = Number.isFinite(score) ? Math.max(0, Math.min(1000000, Math.round(score))) : 0;
    }
    progress.gateHint = saved.gateHint === true;
    const a = saved.armory ?? {}, n = (v:unknown,max:number)=>Number.isSafeInteger(v)?Math.max(0,Math.min(max,v as number)):0;
    progress.armory = { credits:n(a.credits,10000000), sentinel:n(a.sentinel,MAX_HIRES), havoc:n(a.havoc,MAX_HIRES), wisp:n(a.wisp,MAX_HIRES), weapon:n(a.weapon,3) };
    progress.lastLevel = Number.isInteger(saved.lastLevel) ? Math.max(0, Math.min(chapters.length-1, saved.lastLevel)) : 0;
    progress.commanderXP = Number.isSafeInteger(saved.commanderXP) ? Math.max(0, Math.min(1000000, saved.commanderXP)) : 0;
    // An intermediate preview wrote schema 2 before crediting legacy clears.
    // Zero XP alongside a clear cannot result from the current victory flow.
    if (saved.schema === 1 || (progress.commanderXP === 0 && progress.cleared.some(Boolean))) {
      progress.commanderXP = progress.cleared.filter(Boolean).length * 100; migratedProgress = true;
    }
    if(saved.schema !== 4) migratedProgress = true;
  }
} catch { /* Storage may be unavailable; this session remains fully playable. */ }
if (migratedProgress) saveProgress();
let selectedLevel = campaignSave ? progress.lastLevel : campaignIndex;
const seenEffects = new Set<number>(), effectOrder: number[] = [];
let armoryOpen = false;
function renderArmory(cards = armoryOpen): void {
  const a = progress.armory; $('armory-credits').textContent = $('armory-balance').textContent = String(a.credits);
  $('armory-squad').textContent = `Squad ${7 + hired()}/16 · hires ${hired()}/${MAX_HIRES}${a.weapon ? ' · weapon ready' : ''}`;
  if (!cards) return; // the item list only exists while the armory is open
  const list = $('armory-items'); list.innerHTML = '';
  const card = (icon:string, name:string, copy:string, price:number, owned:string, can:boolean, buy:()=>void) => { const b = document.createElement('button'); b.disabled = !can; b.innerHTML = `<span class="reward-icon">${icon}</span><span><strong>${name} ${owned}</strong><small>${copy}</small></span><b>${price}</b>`; b.onclick = () => { if (a.credits < price) return; a.credits -= price; buy(); saveProgress(); renderArmory(); }; list.append(b); };
  for (const h of HIRES) card(h.icon, h.name, h.copy, h.price, `×${a[h.key]}`, a.credits >= h.price && hired() < MAX_HIRES, () => { a[h.key]++; });
  for (const w of WEAPONS) card(w.icon, w.name, w.copy, w.price, a.weapon === w.id ? '✓' : '', a.credits >= w.price && !a.weapon, () => { a.weapon = w.id; });
}
function saveProgress(): void {
  try { localStorage.setItem('mechalord-iron-front-progress-v1', JSON.stringify({ schema: 4, ...progress })); } catch { /* Session state is retained. */ }
}
function refreshLevels(): void { renderArmory();
  document.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(button => {
    const index = Number(button.dataset.level); button.setAttribute('aria-pressed', String(index === selectedLevel));
    button.classList.toggle('cleared', progress.cleared[index]);
    $(`level-status-${index}`).textContent = progress.cleared[index] ? `CLEARED · BEST ${progress.best[index]}` : levelTags[index];
    if(index===selectedLevel)button.scrollIntoView?.({block:'nearest',inline:'nearest'});
  });
  $('level-challenge').textContent = challenges[selectedLevel];
  $<HTMLSelectElement>('practice-relic').value=String(selected);
  $('relic-description').textContent=selectedLevel===campaignIndex?'All three relics are equipped. Charge them in battle; use 1 / 2 / 3 or tap their icons.':`Practice equips ${names[selected]}. ${descriptions[selected]}`;
  $('legacy-imprint').hidden=!progress.legacyImprint;
  $('legacy-imprint').textContent=progress.legacyImprint?`NEXT CAMPAIGN · ${{laser:'LASER +25%',vitality:'+20 MAX HP',endurance:'RELIC + BURST DURATION +15%'}[progress.legacyImprint]}`:'';
  $('start').textContent = selectedLevel === campaignIndex ? 'PLAY IRON MARCH' : 'PLAY PRACTICE';
  const rank = commanderRank(); $('commander-rank').textContent = `COMMANDER RANK ${rank + 1}`;
  $('commander-development').textContent = rank >= 3 ? headStarts[rank] : `${progress.commanderXP}/${rankThresholds[rank + 1]} XP · ${rank === 0 ? 'HAND CANNONS NEXT' : rank === 1 ? 'GUIDED MISSILES NEXT' : 'RAIL BURST NEXT'}`;
  $('starter-troops').textContent = String(8 + rank * 2 + (selectedLevel === campaignIndex ? hired() : 0));
}
function previewLevel(): void {
  refreshLevels();
  if (ready) { core.start(selected, selectedLevel, commanderRank(), selectedLevel===campaignIndex?progress.legacyImprint:undefined); core.pause(true); world.reset(); targetX = 0; }
}
const clamp = (value: number): number => Math.max(-3, Math.min(3, value));

function pulse(element: HTMLElement, className: string): void {
  element.classList.remove(className); void element.offsetWidth; element.classList.add(className);
}
function flash(text: string): void { $('gate-flash').hidden=false; $('gate-flash').textContent = text; pulse($('gate-flash'), 'show-gate'); }
function toast(text: string, milliseconds = 1000): void {
  clearTimeout(toastTimer); $('toast').hidden=false; $('toast').textContent = text; $('toast').classList.add('show-toast');
  toastTimer = setTimeout(() => { $('toast').classList.remove('show-toast'); $('toast').textContent=''; $('toast').hidden=true; }, milliseconds);
}
function dialogue(key: string, speaker: string, line: string, villain = false): void {
  clearTimeout(dialogueTimer); $('dialogue-speaker').textContent = speaker; $('dialogue-line').textContent = line;
  $('dialogue').classList.toggle('villain', villain); $('dialogue').hidden = false;
  audio.speak(key, line, villain); dialogueTimer = setTimeout(() => $('dialogue').hidden = true, 3200);
}
function clearDialogue(): void { clearTimeout(dialogueTimer); $('dialogue').hidden = true; $('dialogue-speaker').textContent=''; $('dialogue-line').textContent=''; }
function clearBattleAnnouncements():void {
  clearTimeout(toastTimer); clearDialogue();
  for(const id of ['toast','gate-flash']) { $(id).textContent=''; $(id).hidden=true; }
  $('toast').classList.remove('show-toast'); $('gate-flash').classList.remove('show-gate');
}
function clearInput(): void {
  held.clear(); clashHeld=false; clashHoldTime=0; if (pointer !== null && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
  pointer = null;
}
function begin(): void {
  if (!ready || graphicsLost) return;
  clearInput(); audio.reset(); void audio.unlock(); clearDialogue(); core.start(selected, selectedLevel, commanderRank(), selectedLevel===campaignIndex?progress.legacyImprint:undefined); core.pause(false); world.reset();
  if (selectedLevel === campaignIndex) { const ar = progress.armory; if (core.applyLoadout?.(ar.sentinel, ar.havoc, ar.wisp, ar.weapon)) ar.weapon = 0; if (world.heroSquad) world.heroSquad.roster = { havoc: ar.havoc, wisp: ar.wisp }; }
  progress.lastLevel = selectedLevel; saveProgress(); seenEffects.clear(); effectOrder.length = 0;
  intro = false; playing = true; paused = false; defeating = false; downed = false; defeatRemaining = 0; targetX = 0; lastArmy = 8 + commanderRank() * 2; lastWeapon = 1; previous = performance.now();
  bossIntroduced = false; secondPhaseAnnounced = false;
  clashing = rewarding = reviving = rewardChoosing = false; focusPart = undefined;
  pendingReward=undefined; latestSnapshot=undefined;
  for(const id of ['clash-panel','reward','revive-cinematic']) $(id).hidden = true;
  document.body.classList.remove('clashing');
  shieldBlockUntil = 0;
  for (const id of ['intro', 'result', 'paused', 'danger', 'last-stand']) $(id).hidden = true;
  $('hud').hidden = false; $('abilities').hidden = false; $('error').hidden = true;
  $('gate-flash').classList.remove('show-gate'); $('gate-flash').textContent = ''; $('toast').textContent = ''; $('damage-flash').classList.remove('show-damage');
  $('army-loss').textContent = ''; $('army-loss').classList.remove('show-loss'); $('time-power').hidden = true; $('combat-power').hidden = true;
  $('toast').classList.remove('show-toast'); clearTimeout(toastTimer); document.body.classList.remove('boss-warning', 'destroying');
  audio.play('start', .7);
}
function pause(value = !paused): void {
  if (!playing || defeating || downed) return;
  paused = value; core.pause(value); clearInput(); $('paused').hidden = !paused;
  if (paused) { audio.silence(); clearDialogue(); } else void audio.unlock();
}
function canAct(): boolean { return playing && !defeating && !downed && !paused && !graphicsLost && !clashing && !rewarding && !reviving; }
function activate(relic: Relic = selected): void {
  if (canAct() && core.activateRelic(relic)) { selected = relic; toast(`${names[relic]} ACTIVATED`, 900); }
}
function fireLaser(): void { if(canAct()) core.fireLaser(); }
function clashPulse(): void { if(playing && clashing && !paused && !graphicsLost) core.clashTap(); }
function chooseReward(choice:'laser'|'vitality'|'endurance'):void {
  if(!playing || !rewarding || rewardChoosing || paused || graphicsLost || latestSnapshot?.phase!=='reward') return;
  rewardChoosing = true; pendingReward=choice; clearInput();
  for(const kind of ['laser','vitality','endurance']) $<HTMLButtonElement>(`reward-${kind}`).disabled=true;
  world.beginAbsorption(choice,latestSnapshot); $('reward').hidden=true;
  void audio.unlock(); audio.play('relic',.7);
}
function completeAbsorption():void {
  const choice=pendingReward;if(!choice)return;
  pendingReward=undefined;
  if(core.chooseReward(choice)) { if(finalReward) { progress.legacyImprint=choice; saveProgress(); refreshLevels(); } clearInput(); rewarding=false; $('reward').hidden=true; previous=performance.now(); void audio.unlock(); }
  else { rewardChoosing=false; for(const kind of ['laser','vitality','endurance']) $<HTMLButtonElement>(`reward-${kind}`).disabled=false; }
}
function heal(): void { if (canAct()) core.heal(); }
function revive(): void {
  if (playing && downed && !graphicsLost && core.revive()) { downed = false; $('last-stand').hidden = true; previous = performance.now(); void audio.unlock(); }
}
function declineRevive(): void {
  if (playing && downed) { core.declineRevive(); downed = false; $('last-stand').hidden = true; }
}
function showIntro(): void {
  clearInput(); intro = true; playing = false; paused = false; defeating = false; downed = false; defeatRemaining = 0; previewLevel();
  audio.reset(); clearBattleAnnouncements();
  clashing = rewarding = reviving = rewardChoosing = false; focusPart=undefined;
  pendingReward=undefined; latestSnapshot=undefined;
  for(const id of ['clash-panel','reward','revive-cinematic']) $(id).hidden=true;
  document.body.classList.remove('clashing');
  for (const id of ['hud', 'abilities', 'result', 'paused', 'danger', 'time-power', 'combat-power', 'last-stand']) $(id).hidden = true;
  $('intro').hidden = false; $('toast').classList.remove('show-toast'); $('gate-flash').classList.remove('show-gate'); document.body.classList.remove('boss-warning', 'destroying');
}
function finish(s: Snapshot): void {
  if (!playing) return;
  playing = false; paused = false; defeating = false; downed = false; defeatRemaining = 0; clearInput();
  audio.silence(); clearBattleAnnouncements();
  for (const id of ['hud', 'abilities', 'paused', 'danger', 'time-power', 'combat-power', 'last-stand']) $(id).hidden = true;
  document.body.classList.remove('boss-warning', 'destroying');
  const won = s.phase === 'won';
  const level = Math.max(0, Math.min(chapters.length-1, s.level));
  const previousRank = commanderRank(), rewardXP = won ? progress.cleared[level] ? 35 : 100 : 0;
  if (won) { progress.commanderXP = Math.min(1000000, progress.commanderXP + rewardXP); progress.cleared[level] = true; progress.best[level] = Math.max(progress.best[level], Math.round(s.score)); saveProgress(); refreshLevels(); }
  const earned = s.campaign ? Math.round(s.kills * 2 + (won ? 150 : 25)) : 0; progress.armory.credits += earned; if (earned) saveProgress();
  const rank = commanderRank(), promoted = rank > previousRank;
  $('result-development').hidden = !won;
  $('result-rank').textContent = `${promoted ? 'RANK UP! ' : ''}COMMANDER ${rank + 1} · +${rewardXP} XP${earned ? ` · +${earned} CREDITS` : ''}`;
  $('result-unlock').textContent = promoted ? `${headStarts[rank]} UNLOCKED` : rank >= 3 ? 'ARSENAL MASTERED · REPLAY ANY FRONT' : `${progress.commanderXP}/${rankThresholds[rank + 1]} XP · ${headStarts[rank + 1]} NEXT`;
  const hasNext = won && level < 4;
  $('next-level').hidden = !hasNext; $('result').classList.toggle('has-next', hasNext);
  $('result-eyebrow').textContent = `${s.levelName || levelNames[level]} ${won ? 'CLEARED' : 'ASSAULT'}`;
  $('result-title').textContent = won ? 'VICTORY!' : 'REGROUP';
  $('result-copy').textContent = won ? `${promoted ? '“New arsenal. Next front.” ' : '“The front is ours. Forward.” '}Best score ${progress.best[level]}.` : s.campaign ? 'Choose recruitment gates. Move after cannon locks; use charged relics to survive the march.' : level === 0 ? 'Move after a cannon locks. Break the battery before its next volley.' : 'Shoot gates to improve your choice. Break crates for weapon XP.';
  $('result-kills').textContent = String(s.kills); $('result-score').textContent = String(s.score);
  $('result').hidden = false; audio.play(won ? promoted ? 'rank' : 'win' : 'loss', .9);
  if (won) audio.speak('commander-win', promoted ? 'New arsenal. Next front.' : 'The front is ours. Forward.');
}
function effects(s: Snapshot): void {
  let recruited = 0, casualties = 0, gateCleared = false, damage = false, bossDied = false, pickedUp = 0;
  const sacrifices: {x:number,z:number}[] = [];
  for (const event of s.effects) {
    if (seenEffects.has(event.id)) continue;
    seenEffects.add(event.id); effectOrder.push(event.id);
    if (effectOrder.length > 512) seenEffects.delete(effectOrder.shift()!);
    world.trigger(event, s);
    audio.event(event);
    if (event.kind === 'troopSacrifice') sacrifices.push({x:event.x,z:-event.z});
    if (event.kind === 'recruit' && event.value > 0) recruited += event.value;
    else if (event.kind === 'gate') gateCleared = true;
    else if (event.kind === 'damage') { damage = true; casualties += Math.abs(event.value); }
    else if (event.kind === 'commanderHit') { damage = true; pulse($('commander-health'), 'health-hit'); }
    else if (event.kind === 'shieldHit') shieldBlockUntil = s.time + .8;
    else if (event.kind === 'bossDeath') bossDied = true;
    else if (event.kind === 'pickup') pickedUp = event.value;
    else if (event.kind === 'coreExpose') toast(s.level === 0 ? 'CORE OPEN · DAMAGE CARRIES TO THE NEXT OPENING' : s.bossRevives ? 'CORE OPEN · FINISH THE TYRANT' : 'CORE OPEN · DESTROY IT BEFORE REBUILD', 1500);
    else if (event.kind === 'bossRevive') { secondPhaseAnnounced = true; dialogue('boss-revive', 'FORGE TYRANT', 'My core still burns. Face the furnace.', true); }
    else if (event.kind === 'bossPartBreak') toast(brokenPartMessage(event,s),1500);
    else if (event.kind === 'healthPickup') { pulse($('commander-health'), 'health-restored'); toast(`FIELD REPAIR · +${Math.round(event.value)} HP`, 1000); }
    else if (event.kind === 'clashWin') toast('BEAM OVERPOWERED · TYRANT HIT', 1200);
    else if (event.kind === 'clashLose') toast('CLASH LOST · GET CLEAR', 1200);
    else if (event.kind === 'actStart') { clearDialogue(); toast(`${campaignActs[s.actIndex??0].toUpperCase()} · KEEP ADVANCING`, 1500); }
    else if (event.kind === 'heal' || event.kind === 'revive') { pulse($('commander-health'), 'health-restored'); toast(event.kind === 'revive' ? 'LEGION TRANSFER · BACK IN THE FIGHT' : `LEGION TRANSFER · +${event.value} HP`, 1500); }
  }
  if (sacrifices.length) world.sacrifice(sacrifices);
  if (bossDied) { clearBattleAnnouncements(); lastWeapon = s.weapon; return; }
  if (damage) pulse($('damage-flash'), 'show-damage');
  if (casualties) { $('army-loss').textContent = `−${casualties}`; pulse($('army-loss'), 'show-loss'); }
  // One reward notification per frame: an upgrade takes priority over gate growth.
  if (pickedUp && pickedUp <= 10) { const info = powers[powerKind(pickedUp)]; toast(`${info.symbol} ${info.name} · ${info.effect}${recruited>0?` · +${recruited} TROOPS`:''}`, 1700); pulse($('temporary-power'), 'power-gained'); pulse($('time-power'), 'power-gained'); lastWeapon = s.weapon; }
  else if (s.weapon > lastWeapon) {
    if(playing&&!paused&&(s.phase==='run'||s.phase==='boss'))world.weaponUpgrade(lastWeapon,s.weapon);
    flash(`${tierNames[Math.min(3, s.weapon - 1)]} FIRE · LV ${s.weapon}`); audio.play('rank', .7, .5); lastWeapon = s.weapon;
  } else if (recruited > 0) flash(`+${recruited} TROOPS`);
  else if (gateCleared) flash('GATE CLEARED!');
  if (playing && !paused && s.phase === 'boss') {
    if (!bossIntroduced) { bossIntroduced = true; dialogue('boss-intro', 'FORGE TYRANT', ['Your legion ends here.', 'My foundry will crush you.', 'This citadel is mine.'][s.level] ?? 'Your legion ends here.', true); }
    else if (s.bossPhase === 2 && !secondPhaseAnnounced) { secondPhaseAnnounced = true; dialogue('boss-phase-two', 'FORGE TYRANT', 'Now face my full arsenal.', true); }
  }
  if (!progress.gateHint && playing && !paused && s.targets.filter(target => target.kind === 'gate' && target.z > 0 && target.z < 26).length >= 2) {
    toast(s.campaign || s.level === 0 ? 'Choose a gate to recruit. Keep room to dodge.' : 'Blue = gain. Red = danger. Shoot to improve gates.', 2400);
    progress.gateHint = true; saveProgress();
  }
}
function hud(s: Snapshot): void {
  const boss = s.phase === 'boss' || s.phase === 'lastStand' && s.travelDistance >= s.travelGoal, destroying = s.phase === 'destroying';
  const distanceRemaining = Math.max(0, s.travelGoal - s.travelDistance), route = Math.max(0, Math.min(1, s.travelDistance / Math.max(1, s.travelGoal)));
  const exposed = boss && s.bossState === 'exposed', rebuilding = boss && s.bossState === 'rebuilding';
  const guarded = boss && s.bossState === 'guarded', coreStage = exposed || guarded;
  const reactorShield=boss&&s.bossPartsMask===63&&s.guardHp>0;
  const health = coreStage ? s.bossCoreHp : s.bossArmor, healthMax = coreStage ? s.bossCoreMax : s.bossArmorMax;
  const percent = healthMax > 0 ? Math.max(0, Math.min(100, Math.round(100 * health / healthMax))) : 0;
  const incoming = s.phase === 'run' && distanceRemaining <= 18 && distanceRemaining > 0;
  const projectiles = boss && s.enemyShots.some(shot => shot.z > -.5 && shot.z < 10), windup = boss && s.bossAction === 'windup';
  const visibleGunners = boss ? [] : s.targets.filter(target => target.z > 3 && target.z < 27);
  const runnerGunner = visibleGunners.find(target => target.fireState === 'locked') ?? visibleGunners.find(target => target.fireState === 'tracking');
  $('phase-label').textContent = destroying ? 'TYRANT DESTROYED' : boss ? coreStage ? 'TYRANT · CORE' : reactorShield?'TYRANT · CORE SHIELD':s.bossRevives ? 'TYRANT · REFORGED' : 'TYRANT · ARMOR' : s.campaign ? campaignActs[s.actIndex??0].toUpperCase() : s.levelName.toUpperCase();
  $('objective').textContent = s.phase === 'lastStand' ? 'COMMANDER DOWN' : destroying ? '' : boss ? (rebuilding ? 'REBUILDING' : exposed ? s.bossCoreTime > 0 ? `${percent}% · ${s.bossCoreTime.toFixed(1)}s` : `${percent}% · FINISH IT` : windup ? s.bossPattern === 'laser' ? 'LASER CHARGE' : s.bossPattern === 'rockets' ? 'MISSILE LOCK' : 'CHARGING' : s.lasers.length ? 'LASER LIVE' : guarded ? 'CORE GUARDED' : projectiles ? 'INCOMING' : `${percent}% ${reactorShield?'SHIELD':'ARMOR'}`) : runnerGunner ? runnerGunner.fireState === 'locked' ? 'CANNON LOCKED' : 'CANNON CHARGING' : s.engagement ? 'KEEP MOVING' : incoming ? 'TYRANT AHEAD' : `${Math.floor(route * 100)}% ADVANCE`;
  $('route-fill').style.width = `${boss ? percent : destroying ? 0 : route * 100}%`;
  $('route-fill').classList.toggle('core-exposed', exposed); $('route-fill').classList.toggle('rebuilding', rebuilding);
  document.body.classList.toggle('destroying', destroying); $('abilities').hidden = destroying || s.phase === 'lastStand' || s.phase === 'reward' || s.phase === 'reviving';
  $('army-count').textContent = s.campaign ? `${Math.max(0, s.army - 1)}/16` : String(s.army); $('kills').textContent = String(s.kills); $('kill-label').textContent = 'ELIMINATED'; $('weapon-level').textContent = String(s.weapon);
  $('kills').hidden = boss;
  if (boss) $('kill-label').textContent = reactorShield?'BREAK THE REACTOR SHIELD':guarded ? 'DODGE · WAIT FOR THE CORE TO OPEN' : s.bossRevives > 0 && !exposed ? 'BREAK THE REFORGED ARMOR' : ({cannon:'BREAK THE HAND CANNONS',jetpack:'BREAK THE BOOSTERS',leg:'BREAK THE LEG ARMOR',reactor:'DESTROY THE REACTOR'} as const)[s.bossPart];
  $('weapon-name').textContent = tierNames[Math.max(0, Math.min(3, s.weapon - 1))];
  const powerActive = s.weaponPower !== 'none' && (s.weaponPermanent || s.powerTime > 0);
  $('temporary-power').hidden = !powerActive;
  if (powerActive && s.weaponPower !== 'none') { const info = powers[s.weaponPower]; $('power-name').textContent = info.name; $('power-symbol').textContent = info.symbol; $('temporary-power').style.setProperty('--power-color', info.color); $('power-time').textContent = s.weaponPermanent ? 'FULL RUN' : `${s.powerTime.toFixed(1)}s`; if(s.weaponPower==='escort') $('power-time').textContent=`${Math.ceil(s.escortShield)}/${s.escortMax} · ${s.powerTime.toFixed(1)}s`; $('power-mode').textContent = s.weaponPower==='escort'?'FINITE DEFENSE':s.weaponPermanent ? 'EARNED ARSENAL' : 'TEMPORARY ARSENAL'; $('temporary-power').classList.toggle('permanent', s.weaponPermanent); $('power-fill').style.width = `${Math.min(100, s.powerTime / info.duration * 100)}%`; }
  const timeActive = (s.phase === 'run' || boss) && s.timePower !== 'none' && s.timePowerTime > 0; $('time-power').hidden = !timeActive;
  if (timeActive && s.timePower !== 'none') { const info = powers[s.timePower]; $('time-symbol').textContent = info.symbol; $('time-name').textContent = s.timePower === 'freeze' ? 'HOSTILES FROZEN' : info.name; $('time-left').textContent = `${s.timePowerTime.toFixed(1)}s`; $('time-power').style.setProperty('--power-color', info.color); }
  const combatActive = (s.phase === 'run' || s.phase === 'boss') && s.combatPower && s.combatPower !== 'none' && s.combatPowerTime > 0;
  $('combat-power').hidden = !combatActive;
  if(combatActive && s.combatPower !== 'none') { const info=powers[s.combatPower]; $('combat-power-symbol').textContent=info.symbol; $('combat-power-name').textContent=info.name; $('combat-power-time').textContent=`${s.combatPowerTime.toFixed(1)}s`; $('combat-power').style.setProperty('--power-color',info.color); }
  const maxTier = s.weapon >= 4 || s.weaponNeed <= 0;
  $('weapon-xp-fill').style.width = `${maxTier ? 100 : Math.max(0, Math.min(100, s.weaponXP / s.weaponNeed * 100))}%`;
  $('weapon-xp').textContent = maxTier ? 'MAX ARSENAL' : `${Math.floor(s.weaponXP)}/${s.weaponNeed} XP → ${tierNames[Math.min(3, s.weapon)]}`;
  const leaderMax = Math.max(1, s.commanderMaxHp), leaderHp = Math.max(0, Math.min(leaderMax, s.commanderHp));
  $('commander-health-value').textContent = `${Math.ceil(leaderHp)}/${Math.ceil(leaderMax)}`;
  $('commander-health-fill').style.width = `${leaderHp / leaderMax * 100}%`;
  $('commander-health').classList.toggle('critical', leaderHp / leaderMax <= .3);
  $('commander-health').setAttribute('aria-valuemax', String(leaderMax)); $('commander-health').setAttribute('aria-valuenow', String(Math.ceil(leaderHp)));
  const transfer = $<HTMLButtonElement>('transfer'); transfer.hidden = !s.canHeal || s.phase === 'lastStand'; transfer.disabled = paused || destroying || !s.canHeal;
  $('transfer-cost').textContent = `−${s.healCost} · +${s.healAmount} HP`;
  transfer.setAttribute('aria-label', `Transfer ${s.healCost} troops for ${s.healAmount} commander health. ${s.healUsesRemaining} uses remaining.`);
  if (lastArmy !== s.army) { pulse($('army-count').parentElement!, 'pop'); lastArmy = s.army; }
  $('danger').hidden = true; document.body.classList.toggle('boss-warning', boss);
  const relics=s.relics??names.map((_,i)=>({energy:i===s.relic?s.energy:0,activeTime:i===s.relic?s.ability:0}));
  for(let i=0;i<3;i++) {
    const relic=relics[i], button=$<HTMLButtonElement>(`relic-${i}`), equipped=!!s.campaign||i===s.relic, active=equipped&&relic.activeTime>0;
    button.disabled=!equipped || !canAct() || relic.energy<100 || active; button.classList.toggle('unequipped',!equipped);
    button.classList.toggle('ready', !button.disabled); button.classList.toggle('relic-active', active);
    const label=!equipped?'—':active?`${relic.activeTime.toFixed(1)}s`:relic.energy>=100?'READY':`${Math.floor(relic.energy)}%`;
    $(`relic-status-${i}`).textContent=label;
    button.style.setProperty('--charge',`${Math.max(0,Math.min(100,relic.energy))}%`);
    button.setAttribute('aria-label',equipped?`${names[i]}: ${descriptions[i]} ${active?'Active for ':''}${label}. Keyboard ${i+1}.`:`${names[i]}: not equipped in this practice run. Choose it in the practice menu.`);
    button.setAttribute('aria-pressed',String(active));
  }
  const laserButton=$<HTMLButtonElement>('laser-cannon'); laserButton.hidden=!(s.laserCharges&&s.laserCharges>0) || clashing || destroying || rewarding || reviving;
  laserButton.disabled=!canAct() || !!combatActive; $('laser-charges').textContent=String(s.laserCharges??0);
  laserButton.setAttribute('aria-label',`Fire lightning cannon. ${s.laserCharges??0} charges. Keyboard L. Cross the boss beam to start a clash.`);
  $('combat-hint').textContent = exposed ? 'CORE OPEN · MAKE EACH SHOT COUNT' : rebuilding ? 'ARMOR REBUILDING · KEEP MOVING' : boss && s.bossPattern === 'laser' ? windup ? 'LASER CHARGING · PREPARE TO DODGE' : 'DODGE THE BEAM · FIRE BACK' : boss && s.bossPattern === 'rockets' ? 'BAIT THE MISSILES · THEN CHANGE LANE' : reactorShield?'BREAK THE REACTOR SHIELD · CORE WOUNDS REMAIN':guarded ? 'CORE GUARDED · DODGE THE NEXT VOLLEY' : runnerGunner ? runnerGunner.fireState === 'locked' ? 'AIM LOCKED · CHANGE LANE' : 'CANNON TRACKING · PREPARE TO MOVE' : s.timePower === 'freeze' ? 'THREATS FROZEN · KEEP FIRING' : s.timePower === 'haste' ? 'HASTE RISK · THREATS MOVE FASTER' : s.ability > 0 ? abilityEffects[selected] : boss ? 'BREAK PARTS · WATCH ITS NEXT ATTACK' : s.engagement ? 'CLOSE CONTACT · DODGE & FIRE' : 'BREAK CRATES · EARN WEAPON XP';
  if(boss && !rebuilding && !guarded && !reactorShield) {
    const vulnerable=s.bossRegions?.filter(r=>r.active&&r.vulnerable&&r.hp>0)??[];
    focusPart=vulnerable[0]?.id;
    if(focusPart) $('kill-label').textContent=`AIM ${partName(focusPart,s)} · HITS FLASH WHITE`;
  }
  if(boss && !rebuilding && (s.bossEvadeTell??0)>0) { $('objective').textContent='BOOSTERS CHARGING'; $('combat-hint').textContent='DODGE COMING · TRACK THE BOOSTERS'; }
  else if(boss && s.bossAction==='evade') { $('objective').textContent='BOOSTER DODGE'; $('combat-hint').textContent='FOLLOW THE TYRANT · RECOVERY NEXT'; }
  else if(boss && (s.bossFiringWindow??0)>0 && !s.lasers.length && !projectiles) { $('objective').textContent='BOOSTERS COOLING'; $('combat-hint').textContent='RECOVERY WINDOW · AIM AT EXPOSED PARTS'; }
  if(boss && s.bossPattern==='laser' && (windup || s.lasers.length>0) && !laserButton.hidden && !laserButton.disabled) {
    $('objective').textContent=windup && s.bossAttack<.9?'LASER READY · WAIT FOR ITS BEAM':'COUNTER NOW · TAP LASER';
    $('combat-hint').textContent=windup && s.bossAttack<.9?'LINE UP WITH THE CORE · MATCH ITS BEAM':'TAP LASER OR L · THEN TAP / HOLD TO PUSH';
    laserButton.setAttribute('aria-label','Counter the boss beam with your lightning cannon. Line up with the core; tap when its beam fires. Keyboard L. Then tap or hold to push the clash.');
  }
  if(pendingReward) { $('phase-label').textContent='TYRANT CORE CAPTURED'; $('objective').textContent='ABSORBING CORE'; $('kill-label').textContent={laser:'LASER POWER',vitality:'VITALITY',endurance:'RELIC ENDURANCE'}[pendingReward]; }
  if(s.phase==='reviving') { $('phase-label').textContent='LEGION REBOOT'; $('objective').textContent='TRANSFERRING POWER'; $('kill-label').textContent='COMMANDER REVIVING'; }
}
document.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(button => button.addEventListener('click', () => {
  selectedLevel = Math.max(0, Math.min(chapters.length-1, Number(button.dataset.level))); previewLevel();
}));
$('practice-relic').addEventListener('change',()=>{selected=Number($<HTMLSelectElement>('practice-relic').value) as Relic;previewLevel();});
refreshLevels();
$('gate-flash').addEventListener('animationend',()=>{ $('gate-flash').textContent=''; $('gate-flash').hidden=true; });
$('armory-open').addEventListener('click', () => { armoryOpen = true; $('armory').hidden = false; renderArmory(); }); $('armory-close').addEventListener('click', () => { armoryOpen = false; $('armory').hidden = true; renderArmory(); });
$('start').addEventListener('click', begin); $('retry').addEventListener('click', begin); $('pause-retry').addEventListener('click', begin); $('back').addEventListener('click', showIntro);
$('next-level').addEventListener('click', () => { selectedLevel = Math.min(chapters.length-1, selectedLevel + 1); refreshLevels(); begin(); });
$('pause-levels').addEventListener('click', showIntro);
$('pause').addEventListener('click', () => pause()); $('resume').addEventListener('click', () => pause(false)); for(let i=0;i<3;i++) $(`relic-${i}`).addEventListener('click',()=>activate(i as Relic));
$('laser-cannon').addEventListener('click',fireLaser); $('clash-pulse').addEventListener('click',clashPulse);
$('clash-pulse').addEventListener('pointerdown',event=>{if(clashing&&!paused){clashHeld=true;clashHoldTime=0;clashPulse();$('clash-pulse').setPointerCapture(event.pointerId);}});
for(const event of ['pointerup','pointercancel','lostpointercapture']) $('clash-pulse').addEventListener(event,()=>{clashHeld=false;clashHoldTime=0;});
for(const choice of ['laser','vitality','endurance'] as const) $(`reward-${choice}`).addEventListener('click',()=>chooseReward(choice));
$('transfer').addEventListener('click', heal); $('revive').addEventListener('click', revive); $('accept-defeat').addEventListener('click', declineRevive);
$('sound').addEventListener('click', () => {
  soundOn = !soundOn; audio.setEnabled(soundOn); $('sound').textContent = soundOn ? 'SOUND ON' : 'SOUND OFF';
  $('sound').setAttribute('aria-pressed', String(soundOn)); $('sound').setAttribute('aria-label', soundOn ? 'Mute sound' : 'Enable sound');
});
canvas.addEventListener('pointerdown', event => {
  if (clashing) { clashPulse(); return; }
  if (!canAct() || pointer !== null) return;
  pointer = event.pointerId; dragStart = event.clientX; dragOrigin = targetX; canvas.setPointerCapture(pointer);
});
canvas.addEventListener('pointermove', event => {
  if (pointer !== event.pointerId || !canAct()) return;
  targetX = clamp(dragOrigin + (event.clientX - dragStart) * 6 / Math.max(1, canvas.getBoundingClientRect().width));
});
const release = (event: PointerEvent): void => { if (pointer === event.pointerId) pointer = null; };
canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release); canvas.addEventListener('lostpointercapture', release);
window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (playing && ['arrowleft', 'arrowright', ' ', 'escape'].includes(key)) event.preventDefault();
  if (event.repeat) return; held.add(key);
  if (key === ' ') { if(clashing)clashPulse(); else activate(); } else if (['1','2','3'].includes(key)) activate((Number(key)-1) as Relic); else if(key==='l')fireLaser(); else if (key === 'h') heal(); else if (key === 'escape') pause(); else if (key === 'r' && ready && !intro && !rewarding && !reviving) begin();
});
window.addEventListener('keyup', event => held.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => { clearInput(); if (playing) pause(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInput(); if (playing) pause(true); audio.silence(); } });
canvas.addEventListener('webglcontextlost', event => {
  event.preventDefault(); graphicsLost = true; if (playing) pause(true); $('error').hidden = false;
  $('error').textContent = 'Graphics interrupted. Your run is paused while the battlefield recovers.';
});
canvas.addEventListener('webglcontextrestored', () => { graphicsLost = false; world.reset(); $('error').hidden = true; previous = performance.now(); if (playing) pause(true); });
function frame(now: number): void {
  const dt = Math.max(0, Math.min(.1, (now - previous) / 1000)); previous = now;
  if (ready && !graphicsLost) {
    if (playing && !paused && !defeating && !downed) {
      const left = held.has('arrowleft') || held.has('a'), right = held.has('arrowright') || held.has('d');
      if ((left || right) && !clashing && !rewarding && !reviving) targetX = clamp(targetX + (Number(right) - Number(left)) * dt * 5.4);
      if(clashing && clashHeld) { clashHoldTime+=dt; if(clashHoldTime>=1/3) { clashHoldTime-=1/3; clashPulse(); } }
      core.step(world.timeScale?.(dt) ?? dt, targetX);
    }
    if(playing && pendingReward && !paused && !graphicsLost && world.absorptionRemaining<=0) completeAbsorption();
    // Exactly one snapshot per frame: effects are consumed only here.
    const snapshot = core.snapshot();
    latestSnapshot=snapshot;
    const enteringClash=!!snapshot.clash?.active&&!clashing;
    clashing=!!snapshot.clash?.active; if(!clashing) {clashHeld=false;clashHoldTime=0;} reviving=snapshot.phase==='reviving';
    if(enteringClash || snapshot.phase==='reward'&&!rewarding || reviving) clearInput();
    if(playing && snapshot.phase==='reward') {
      if(!rewarding) { audio.silence(); clearDialogue(); rewardChoosing=false; }
      rewarding=true; $('reward').hidden=rewardChoosing||paused;
      finalReward=!!snapshot.campaign;
      const bonuses=snapshot.rewardBonuses??{laser:0,vitality:0,endurance:0};
      $('reward-copy').textContent='The Tyrant has fallen. Absorb one core imprint for your next assault. Replaces your previous imprint.';
      $('reward-laser-copy').textContent=finalReward?'+25% beam damage next campaign':`+25% beam damage · +${(bonuses.laser+1)*25}% total`;
      $('reward-vitality-copy').textContent=finalReward?'+20 maximum HP next campaign':'+20 maximum HP · restore up to 35 HP';
      $('reward-endurance-copy').textContent=finalReward?'+15% relic + burst duration next campaign':`+15% relic + burst duration · +${(bonuses.endurance+1)*15}% total`;
      for(const kind of ['laser','vitality','endurance']) $<HTMLButtonElement>(`reward-${kind}`).disabled=rewardChoosing;
    } else if(snapshot.phase!=='reward') { rewarding=false; $('reward').hidden=true; }
    $('revive-cinematic').hidden=!playing||!reviving;
    if(reviving) $('revive-fill').style.width=`${Math.max(0,Math.min(100,(1-(snapshot.reviveCinematicTime??0)/1.5)*100))}%`;
    $('clash-panel').hidden=!playing||!clashing||paused; document.body.classList.toggle('clashing',playing&&clashing);
    if(clashing) { const strength=Math.round(Math.max(0,Math.min(1,snapshot.clash!.progress))*100); $('clash-fill').style.width=`${strength}%`; $('clash-meter').setAttribute('aria-valuenow',String(strength)); $('clash-time').textContent=`${snapshot.clash!.time.toFixed(1)}s`; }
    // A decline may be followed by a blur before this frame. Terminal damage
    // must still animate, and its timer must not inherit that intervening pause.
    if (playing && snapshot.phase === 'lost') { paused = false; downed = false; $('paused').hidden = true; $('last-stand').hidden = true; }
    if (!intro && !paused && playing) effects(snapshot);
    audio.update(snapshot, !intro && !paused && playing && snapshot.phase !== 'lastStand' && (snapshot.phase !== 'reward'||!!pendingReward));
    if (playing) {
      if (snapshot.phase === 'lastStand') {
        if (!downed) { clearInput(); audio.silence(); clearDialogue(); paused = false; $('paused').hidden = true; }
        downed = true; hud(snapshot); $('last-stand').hidden = false;
        $('last-stand-copy').textContent = `Transfer ${snapshot.reviveCost} troops to restore ${snapshot.reviveHp} commander HP. Those troops are spent. One revival per run.`;
        $<HTMLButtonElement>('revive').disabled = !snapshot.reviveAvailable;
        $('revive').textContent = `−${snapshot.reviveCost} TROOPS · REVIVE`;
      } else if (snapshot.phase === 'lost') {
        if (!defeating) {
          defeating = true; defeatRemaining = 1.5; clearInput(); clearDialogue(); $('hud').hidden = true; $('abilities').hidden = true; $('time-power').hidden = true; $('combat-power').hidden = true;
          clearTimeout(toastTimer); $('toast').classList.remove('show-toast'); $('gate-flash').classList.remove('show-gate');
        }
        if (!paused) defeatRemaining -= dt;
        if (defeatRemaining <= 0) finish(snapshot);
      } else { hud(snapshot); if (snapshot.phase === 'won') finish(snapshot); }
    }
    world.update(snapshot, downed ? 0 : dt*(world.slowFactor ?? 1), intro ? 'intro' : paused ? 'paused' : playing ? 'play' : 'result');
  }
  requestAnimationFrame(frame);
}
async function boot(): Promise<void> {
  try {
    world = new Battlefield(canvas); await Promise.all([core.load(), world.load()]); ready = true; previewLevel();
    $<HTMLButtonElement>('start').disabled = false; $('start').textContent = selectedLevel === campaignIndex ? 'PLAY IRON MARCH' : 'PLAY PRACTICE'; $('loading').textContent = 'Drag to steer · Auto fire · Three relics on tap';
    previous = performance.now(); requestAnimationFrame(frame);
  } catch (error) {
    console.error(error); $('error').hidden = false;
    $('error').textContent = `Battlefield could not load. ${error instanceof Error ? error.message : String(error)} Refresh to retry.`;
    $('loading').textContent = 'Loading stopped.';
  }
}
void boot();
