export class BattleCore {
  api:any;
  async load(){
    const bytes=await (await fetch('battle.wasm')).arrayBuffer();
    const module=await WebAssembly.compile(bytes);
    const imports:any={};
    for(const item of WebAssembly.Module.imports(module)){
      if(item.kind!=='function')throw new Error(`Unsupported WASM import: ${item.name}`);
      imports[item.module]??={};
      imports[item.module][item.name]=(...args:number[])=>{
        if(item.name==='proc_exit')throw new Error('Battle core exited: '+args[0]);
        return 0;
      };
    }
    const instance=await WebAssembly.instantiate(module,imports);this.api=instance.exports;
    this.api._initialize?.();this.api.start_run(0);
  }
  array(name:string,count:number){return new Float32Array(this.api.memory.buffer,this.api[name](),count);}
  state(){return this.array('state',24);}
  encounters(){return this.array('encounters',this.api.encounter_count()*9);}
  enemies(){return this.array('enemies',this.api.enemy_count()*5);}
  packets(){return this.array('packets',this.api.packet_count()*4);}
  gates(){return this.array('siege_gates',this.api.siege_gate_count()*5);}
  start(relic:number){this.api.start_run(relic);}
  step(dt:number,lane:number){this.api.step(dt,lane);}
  pause(value:boolean){this.api.set_paused(value?1:0);}
}
