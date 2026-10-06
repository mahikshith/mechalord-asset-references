import type { Effect, Snapshot } from './contract';

type Cue = 'pulse'|'twin'|'arc'|'rail'|'hit'|'grunt'|'impact'|'explosion'|'pickup'|'relic'|'windup'|'cannon'|'win'|'rank'|'start'|'loss'|'rolling'|'laser'|'shield'|'emp'|'overdrive'|'shieldhit'|'tempest'|'arcstorm'|'salvo'|'heal'|'revive'|'clash'|'clashwin'|'shieldbreak'|'musicPulse'|'musicDrive'|'musicThreat';
/** Original, locally synthesized mechanical sounds. No downloaded samples or voice service. */
export class BattleAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private readonly buffers = new Map<Cue, AudioBuffer>();
  private readonly active = new Set<AudioBufferSourceNode>();
  private readonly last = new Map<string, number>();
  private music: {source:AudioBufferSourceNode,gain:GainNode}[] = [];
  private clashLive = false;
  private rolling?: AudioBufferSourceNode;
  private rollingGain?: GainNode;
  private enabled = true;
  private lastShot = -10;
  private bossAction = '';
  private speaking = false;
  private voiceKeys = new Set<string>();
  private voice?: SpeechSynthesisVoice;
  private voiceListener = () => this.findVoice();

  constructor() {
    if ('speechSynthesis' in window) { this.findVoice(); window.speechSynthesis.addEventListener('voiceschanged', this.voiceListener); }
  }
  async unlock(): Promise<void> {
    try {
      if (!this.context) {
        this.context = new AudioContext(); this.master = this.context.createGain(); this.master.gain.value = .65; this.master.connect(this.context.destination);
        for (const cue of ['pulse','twin','arc','rail','hit','grunt','impact','explosion','pickup','relic','windup','cannon','win','rank','start','loss','rolling','laser','shield','emp','overdrive','shieldhit','tempest','arcstorm','salvo','heal','revive','clash','clashwin','shieldbreak','musicPulse','musicDrive','musicThreat'] as Cue[]) this.buffers.set(cue, this.make(cue));
      }
      if (this.enabled) await this.context.resume();
    } catch { /* Audio failure never blocks the game or its captions. */ }
  }
  setEnabled(value: boolean): void {
    this.enabled = value;
    if (this.master && this.context) this.master.gain.setTargetAtTime(value ? .65 : 0, this.context.currentTime, .025);
    if (!value) this.silence(); else void this.unlock();
  }
  reset(): void { this.silence(); this.last.clear(); this.voiceKeys.clear(); this.lastShot = -10; this.bossAction = ''; this.clashLive = false; }
  silence(): void {
    for (const source of this.active) { try { source.stop(); } catch {} }
    this.active.clear(); this.rolling = undefined; this.rollingGain = undefined; this.music.length=0;
    if (this.speaking && 'speechSynthesis' in window) window.speechSynthesis.cancel(); this.speaking = false;
  }
  play(cue: Cue, volume = 1, cooldown = 0): void {
    const audio = this.context, now = audio?.currentTime ?? 0;
    if (!this.enabled || !audio || audio.state !== 'running' || this.active.size >= 24 || now - (this.last.get(cue) ?? -100) < cooldown) return;
    this.last.set(cue, now);
    const source = audio.createBufferSource(), gain = audio.createGain(); source.buffer = this.buffers.get(cue)!; gain.gain.value = volume;
    source.connect(gain).connect(this.master!); this.active.add(source); source.start();
    source.onended = () => { this.active.delete(source); source.disconnect(); gain.disconnect(); };
  }
  event(event: Effect): void {
    switch (event.kind) {
      case 'hit': this.play('hit', event.value>0?.55:.16, event.value>0?.08:.12); break;
      case 'kill': this.play('explosion', event.variant>0?.7:.35, .11); if(event.variant>0)this.play('impact', .45, .15); break;
      case 'damage': case 'contact': case 'commanderHit': this.play('impact', .7, .13); break;
      case 'block': break; // Shield absorption has its own authoritative event.
      case 'shieldHit': case 'escortBlock': this.play('shieldhit', .6, .1); break;
      case 'bossShot': this.play(event.value === 3 ? 'laser' : 'cannon', .85, .09); break;
      case 'enemyFire': this.play('cannon', event.value===2?.58:.42, .10); break;
      case 'bossPartBreak': this.play('explosion', .9, .14); this.play('impact', .75, .14); break;
      case 'heal': case 'healthPickup': this.play('heal', .8, .25); break;
      case 'revive': this.play('revive', .85, .25); break;
      case 'shieldBreak': this.play('shieldbreak', .6, .15); break;
      case 'clashStart': this.play('clash', .7, 1); break;
      case 'clashWin': this.play('clashwin', .85, .5); break;
      case 'clashLose': this.play('impact', .85, .5); break;
      case 'rewardChosen': this.play('rank', .7, .5); break;
      case 'commanderDown': this.play('loss', .7); break;
      case 'coreExpose': this.play('relic', .85); this.play('impact', .55); break;
      case 'bossRevive': this.play('windup', .9); this.play('grunt', .75); break;
      case 'bossDeath': this.play('explosion', 1.8); this.play('grunt', 1); break;
      case 'commanderDeath': this.play('explosion', 1.2); this.play('impact', 1); break;
      case 'pickup': if(event.value<8)this.play(event.value === 3 || event.value === 4 ? 'relic' : event.value === 2 || event.value === 6 ? 'start' : 'pickup', .9, .25); break;
      case 'combatPower': this.play(event.value===8?'tempest':event.value===9?'arcstorm':'salvo', .85, .25); break;
      case 'chainHit': this.play('arcstorm', .18, .3); break;
      case 'recruit': if (event.value > 0) this.play('pickup', .55, .2); break;
      case 'relic': this.play(event.value===0?'shield':event.value===1?'emp':'overdrive', .85, .3); break;
    }
  }
  update(s: Snapshot, running: boolean): void {
    if (!running || !this.enabled || !this.context || this.context.state !== 'running') { if(this.active.size)this.silence(); return; }
    if ((s.phase === 'run' || s.phase === 'boss') && !s.clash?.active) {
      if (s.time - this.lastShot > (s.ability > 0 && s.relic === 2 ? .085 : .14) && s.shots.some(shot => shot.owner!=='troop' && shot.z < 1)) {
        const cue: Cue = s.weaponPower === 'railburst' ? 'rail' : s.weaponPower === 'cannons' ? 'cannon' : s.weapon >= 3 ? 'arc' : s.weapon === 2 ? 'twin' : 'pulse';
        this.play(cue, .42, .055); this.lastShot = s.time;
      }
      if (s.bossAction === 'windup' && this.bossAction !== 'windup') this.play('windup', .7, .8);
      if (s.bossAction === 'evade' && this.bossAction !== 'evade') this.play('overdrive', .45, .8);
    }
    this.bossAction = s.bossAction;
    this.updateMusic(s);
    if(s.clash?.active && !this.clashLive) this.play('clash', .7, 1);
    this.clashLive=!!s.clash?.active;
    if (!this.rolling) {
      this.rolling = this.context.createBufferSource(); this.rolling.buffer = this.buffers.get('rolling')!; this.rolling.loop = true;
      this.rollingGain = this.context.createGain(); this.rollingGain.gain.value = 0; this.rolling.connect(this.rollingGain).connect(this.master!); this.rolling.start(); this.active.add(this.rolling);
      const source = this.rolling, gain = this.rollingGain; source.onended = () => { this.active.delete(source); source.disconnect(); gain.disconnect(); };
    }
    const roller = s.targets.some(target => target.kind === 'hazard' && target.z > -2 && target.z < 15);
    this.rollingGain!.gain.setTargetAtTime(s.phase === 'destroying' || s.phase === 'won' || s.phase === 'lost' || s.phase === 'reviving' || s.clash?.active ? 0 : roller ? .23 : s.phase === 'run' ? .065 : .015, this.context.currentTime, .1);
  }
  private updateMusic(s:Snapshot):void {
    const audio=this.context!;
    if(!this.music.length && this.active.size<=20) {
      const start=audio.currentTime+.025;
      for(const cue of ['musicPulse','musicDrive','musicThreat'] as Cue[]) {
        const source=audio.createBufferSource(),gain=audio.createGain();source.buffer=this.buffers.get(cue)!;source.loop=true;gain.gain.value=0;
        source.connect(gain).connect(this.master!);source.start(start);this.active.add(source);this.music.push({source,gain});
        source.onended=()=>{this.active.delete(source);source.disconnect();gain.disconnect();};
      }
    }
    const combat=s.phase==='run'||s.phase==='boss',boss=s.phase==='boss';
    const health=s.commanderHp/Math.max(1,s.commanderMaxHp),act=s.actIndex??(s.level===4?2:s.level===3?1:0);
    const levels=[combat?.28:.09,combat?(boss?.23:.1+act*.035):0,combat?(s.clash?.active?.25:health<.35?.19:boss?.14:0):0];
    this.music.forEach((layer,i)=>layer.gain.gain.setTargetAtTime(levels[i],audio.currentTime,.35));
  }
  /** Captions are supplied independently by the UI. Never queue speech during another line. */
  speak(key: string, text: string, villain = false): boolean {
    if (this.voiceKeys.has(key)) return false; this.voiceKeys.add(key);
    if (!this.enabled || !this.voice || this.speaking || !('speechSynthesis' in window)) return false;
    const speech = new SpeechSynthesisUtterance(text); speech.voice = this.voice; speech.lang = this.voice.lang; speech.rate = villain ? .86 : 1.02; speech.pitch = villain ? .65 : .95; speech.volume = .8;
    this.speaking = true; speech.onend = speech.onerror = () => { this.speaking = false; };
    try { window.speechSynthesis.speak(speech); return true; } catch { this.speaking = false; return false; }
  }
  private findVoice(): void {
    // Captions are English. Prefer an English local voice, rather than mispronouncing them in another language.
    const voices = window.speechSynthesis.getVoices(); this.voice = voices.find(voice => voice.localService && /^en\b/i.test(voice.lang));
  }
  dispose(): void { this.silence(); if ('speechSynthesis' in window) window.speechSynthesis.removeEventListener('voiceschanged', this.voiceListener); void this.context?.close(); this.buffers.clear(); }

  private make(cue: Cue): AudioBuffer {
    const music=cue.startsWith('music');
    const audio = this.context!, length = music ? 16*60/112 : cue==='revive'?1.5:cue==='clash'?3:cue==='clashwin'?.7:cue==='heal'?.55:cue==='shieldbreak'?.45:cue === 'tempest' ? 1 : cue === 'arcstorm' ? 1.2 : cue === 'salvo' ? 1.8 : cue === 'emp' ? .65 : cue === 'shield' ? .55 : cue === 'overdrive' ? .6 : cue === 'shieldhit' ? .19 : cue === 'laser' ? .8 : cue === 'rolling' ? 1 : cue === 'explosion' ? 1.35 : cue === 'windup' ? .65 : ['win','rank'].includes(cue) ? .78 : ['pickup','relic','start','loss'].includes(cue) ? .4 : cue === 'grunt' ? .24 : cue === 'cannon' ? .3 : .14;
    const buffer = audio.createBuffer(1, Math.ceil(length * audio.sampleRate), audio.sampleRate), samples = buffer.getChannelData(0);
    let seed = 18231, filtered = 0, phase = 0;
    for (let i = 0; i < samples.length; i++) {
      const t = i / audio.sampleRate, p = t / length; seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = seed / 2147483648 - 1; filtered += (noise - filtered) * .12;
      let value = 0;
      if(music){
        // Original D-minor industrial pulse, exactly sixteen beats for a seamless loop.
        const beat=t*112/60,local=beat%1,step=Math.floor(beat*2),half=(beat*2)%1;
        const bass=[73.416,73.416,65.406,73.416,87.307,87.307,65.406,55][Math.floor(beat/2)%8];
        if(cue==='musicPulse') { const env=Math.exp(-half*6)*Math.min(1,half*90); value=(Math.sin(t*bass*2*Math.PI)*.32+Math.sin(t*bass*4*Math.PI)*.08)*env; const kick=local*60/112; value+=Math.sin(2*Math.PI*(44*kick+12*(1-Math.exp(-kick*28))))*.37*Math.exp(-kick*19); }
        else if(cue==='musicDrive') {const hat=Math.exp(-half*25)*Math.min(1,half*150);value=noise*.12*hat;if(Math.floor(beat)%4===1||Math.floor(beat)%4===3)value+=(filtered*.6+noise*.11)*Math.exp(-local*16)*Math.min(1,local*90);const note=[146.832,220,261.626,220,130.812,174.614,220,174.614][step%8];value+=Math.sin(t*note*2*Math.PI)*.095*Math.exp(-half*6)*Math.sin(half*Math.PI);}
        else {const pulse=Math.exp(-half*8)*Math.sin(half*Math.PI);value=(Math.sin(t*293.665*2*Math.PI)*.12+Math.sin(t*311.127*2*Math.PI)*.075+filtered*.2)*pulse;}
        // Per-loop seam remains click-free even when an oscillator is between zero crossings.
        value*=Math.min(1,t*400)*Math.min(1,(length-t)*400);
      }
      else if(cue==='heal'||cue==='revive'){phase+=2*Math.PI*(cue==='heal'?480+360*p:100+720*p*p)/audio.sampleRate;value=(Math.sin(phase)*.25+Math.sin(phase*1.5)*.14+Math.sin(phase*2)*.06)*Math.sin(Math.PI*p);if(cue==='revive')value+=filtered*.16*Math.pow(1-p,2);}
      else if(cue==='clash'){phase+=2*Math.PI*(90+155*p)/audio.sampleRate;const throb=.65+.35*Math.sin(t*2*Math.PI*7);value=(Math.sin(phase)*.26+Math.sin(phase*2.013)*.12+filtered*.35+noise*.1*Math.pow(Math.max(0,Math.sin(t*101)),8))*throb*Math.min(1,t*30)*Math.min(1,(length-t)*12);}
      else if(cue==='clashwin'){phase+=2*Math.PI*(50+650*Math.exp(-p*6))/audio.sampleRate;value=(Math.sin(phase)*.4+filtered*.7+noise*.1)*Math.min(1,t*140)*Math.exp(-p*4);}
      else if(cue==='shieldbreak'){phase+=2*Math.PI*(580-400*p)/audio.sampleRate;value=(Math.sin(phase)*.22+Math.sin(phase*1.63)*.18+noise*.22+filtered*.32)*Math.exp(-p*6);}
      else if(cue==='tempest'){phase+=2*Math.PI*(135+110*Math.sin(p*Math.PI))/audio.sampleRate;const crack=Math.pow(Math.max(0,Math.sin(t*97)+Math.sin(t*173)*.35),6);value=(Math.sin(phase)*.22+Math.sin(phase*3.03)*.13+filtered*.3+noise*.12*Math.min(1,crack))*Math.min(1,t*100)*Math.min(1,(1-p)*13);}
      else if(cue==='arcstorm'){const local=(t%.3)/.3;phase+=2*Math.PI*(760-480*local)/audio.sampleRate;value=(Math.sin(phase)*.2+Math.sin(phase*1.71)*.12+noise*.24)*Math.exp(-local*7)*Math.min(1,t*400);}
      else if(cue==='salvo'){const local=t%.28;phase+=2*Math.PI*(75+140*Math.exp(-local*40))/audio.sampleRate;value=(Math.sin(phase)*.26+filtered*.75+noise*.07)*Math.exp(-local*18)*Math.min(1,t*300)*Math.min(1,(length-t)*15);}
      else if(cue==='shield'){const latch=(t%.13);phase+=2*Math.PI*(120+90*Math.exp(-latch*40))/audio.sampleRate;value=(Math.sin(phase)*.32+Math.sin(phase*2.7)*.16+filtered*.6)*Math.exp(-latch*25)*Math.min(1,t*200)*Math.min(1,(length-t)*30);}
      else if(cue==='emp'){phase+=2*Math.PI*(50+460*Math.exp(-p*9))/audio.sampleRate;value=(Math.sin(phase)*.55+noise*.24*Math.pow(Math.max(0,Math.sin(t*150)),4)+filtered*.7)*Math.min(1,t*300)*Math.exp(-p*4);}
      else if(cue==='overdrive'){phase+=2*Math.PI*(85+320*p*p)/audio.sampleRate;value=(Math.sin(phase)*.30+Math.sin(phase*2.03)*.14+filtered*.28)*(0.7+.3*Math.sin(t*75))*Math.sin(p*Math.PI);}
      else if(cue==='shieldhit'){phase+=2*Math.PI*(950-650*p)/audio.sampleRate;value=(Math.sin(phase)*.25+Math.sin(phase*1.73)*.18+noise*.10)*Math.exp(-p*7);}
      else if (cue === 'laser') { phase += 2*Math.PI*(110+90*Math.sin(p*Math.PI))/audio.sampleRate;const arc=Math.pow(Math.max(0,Math.sin(t*97)*Math.sin(t*163)),4);value=(Math.sin(phase)*.32+Math.sin(phase*3.01)*.17+filtered*.35+noise*.24*arc)*Math.min(1,t*90)*Math.min(1,(1-p)*12); }
      else if (cue === 'rolling') value = filtered * .45 + Math.sin(t * Math.PI * 2 * 39) * .08 + Math.sin(t * Math.PI * 2 * 17) * .08 * Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 * 11)), 8);
      else if (['pickup','relic','win','rank','start'].includes(cue)) {
        const notes = cue === 'rank' ? [392,494,587,784] : cue === 'win' ? [330,440,554,660] : cue === 'relic' ? [220,440,660,880] : [440,554,660,880];
        const note = notes[Math.min(3, Math.floor(p * 4))]; phase += 2 * Math.PI * note / audio.sampleRate;
        const noteEnvelope = Math.sin(Math.PI * ((p * 4) % 1)); value = (Math.sin(phase) + .22 * Math.sin(phase * 2)) * .26 * noteEnvelope * (1 - p * .3);
      } else if (cue === 'windup') { phase += 2 * Math.PI * (65 + p * p * 330) / audio.sampleRate; value = (Math.sin(phase) * .28 + filtered * .4) * Math.sin(p * Math.PI * .7); }
      else {
        const f = cue === 'explosion' ? 90 : cue === 'cannon' ? 130 : cue === 'grunt' ? 75 : cue === 'impact' ? 155 : cue === 'rail' ? 620 : cue === 'arc' ? 390 : cue === 'twin' ? 280 : cue === 'loss' ? 170 : cue === 'hit' ? 520 : 240;
        phase += 2 * Math.PI * (f * Math.exp(-p * (cue === 'grunt' ? .45 : 2.8)) + 28) / audio.sampleRate;
        const env = Math.min(1, t * 900) * Math.exp(-p * (cue === 'explosion' ? 5 : 7));
        const metallic = Math.sin(phase) + Math.sin(phase * 2.17) * .22;
        value = (metallic * (cue === 'grunt' ? .42 : .27) + filtered * (['explosion','impact','cannon'].includes(cue) ? 1.6 : .28) + noise * (cue === 'rail' ? .18 : .04)) * env;
        if (cue === 'twin' && t > .05) value += Math.sin((t - .05) * 900) * Math.exp(-(t - .05) * 70) * .15;
        // Debris impacts follow the initial blast in the same bounded buffer.
        // No timers or additional audio sources survive pause/retry.
        if(cue==='explosion')for(const [at,freq] of [[.09,760],[.21,460],[.37,310]]){const d=t-at;if(d>0)value+=(Math.sin(d*freq*2*Math.PI)*.12+noise*.1)*Math.exp(-d*35);}
      }
      samples[i] = Math.max(-.95, Math.min(.95, value));
    }
    return buffer;
  }
}
