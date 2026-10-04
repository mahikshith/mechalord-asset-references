import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

type Role = 'deck' | 'tile' | 'stone' | 'edge' | 'steel' | 'dark' | 'accent' | 'light' | 'earth';
type Parts = Map<Role, T.BufferGeometry[]>;
export interface EnvironmentSectionPlan {section:number;stage:number;left:number;right:number;phase:number;}
const RHYTHM = [0,1,4,2,0,5,3,4,1,5,2,3];
/** Seeded, reproducible art direction: a deliberate rhythm with a new rotation every twelve sections. */
export function planEnvironmentSection(section:number,stage:number):EnvironmentSectionPlan {
  const index = Math.max(0, Math.floor(Number.isFinite(section) ? section : 0)), level = Math.max(0, Math.min(2, Math.floor(Number.isFinite(stage) ? stage : 0)));
  let seed = (Math.imul(Math.floor(index / 12) + 1, 0x45d9f3b) ^ Math.imul(level + 1, 0x119de1f3)) >>> 0;
  seed = Math.imul(seed ^ seed >>> 16, 0x45d9f3b) >>> 0; seed ^= seed >>> 16;
  const rotation = (seed >>> 0) % 6;
  return {section:index,stage:level,left:(RHYTHM[index % 12] + rotation) % 6,right:(RHYTHM[(index + 5) % 12] + rotation + 2) % 6,phase:(seed >>> 0) / 4294967296 * Math.PI * 2 + index * .61};
}
export const ENVIRONMENT_PALETTES = [
  { sky: 0xb5ccd0, deck: 0x2f4354, tile: 0x354957, stone: 0x2d4252, edge: 0x5c7184, steel: 0x496b72, dark: 0x223442, accent: 0x348fa0, light: 0x8ae5db, earth: 0x506461 },
  { sky: 0xc4b6a6, deck: 0x343f4c, tile: 0x3c4854, stone: 0x273744, edge: 0x65717a, steel: 0x4d6065, dark: 0x26333f, accent: 0xb57646, light: 0xffbb61, earth: 0x514e48 },
  { sky: 0xadbdd3, deck: 0x283b51, tile: 0x30435b, stone: 0x25394e, edge: 0x586d86, steel: 0x425976, dark: 0x233348, accent: 0x717ba8, light: 0x89def4, earth: 0x49596c },
] as const;

/** A render-only, bounded causeway. Surface y=0; decorative structures stay outside the lanes. */
export class BattleEnvironment {
  readonly root = new T.Group();
  readonly segmentCount = 12;
  readonly segmentLength = 8;
  readonly surfaceWidth = 9.7;
  private readonly materials = new Map<Role, T.MeshStandardMaterial>();
  private readonly geometries = new Set<T.BufferGeometry>();
  private readonly cache = new Map<string, T.BufferGeometry>();
  private readonly textures: T.Texture[] = [];
  private readonly common: T.InstancedMesh[] = [];
  private readonly banks: T.InstancedMesh[][][] = [[], [], []];
  private readonly plans: EnvironmentSectionPlan[] = [];
  private readonly counts = new Int16Array(6);
  private readonly dummy = new T.Object3D();
  private readonly animated: T.InstancedMesh[] = [];
  private readonly beamFrom = new T.Vector3();
  private readonly beamTo = new T.Vector3();
  private readonly direction = new T.Vector3();
  private readonly up = new T.Vector3(0,1,0);
  private level = -1;
  private anchor = -1;
  private age = 0;
  private disposed = false;

  constructor(private readonly scene: T.Scene) {
    this.root.name = 'Mechalord_IndustrialCauseway';
    for (const role of ['deck','tile','stone','edge','steel','dark','accent','light','earth'] as Role[]) {
      const material = new T.MeshStandardMaterial({roughness:role === 'steel' ? .65 : .92,metalness:role === 'steel' ? .2 : .025});
      if (role === 'light') {material.emissiveIntensity=.65;material.roughness=.5;}
      this.materials.set(role,material);
    }
    const [bump,roughness,albedo]=this.stoneTextures();
    for (const role of ['deck','tile','stone','edge'] as Role[]) {
      const material=this.materials.get(role)!;material.map=albedo;material.bumpMap=bump;material.bumpScale=role==='deck'?.035:.045;material.roughnessMap=roughness;
    }
    this.build(this.common,parts=>{
      this.box(parts,'stone',9.7,1.23,8,0,-.765,0,.09);
      // One continuous flat asphalt/slate deck. No alternating tiles, inset rectangles, or checker pattern.
      this.part(parts,'deck',this.keep(new T.BoxGeometry(9.7,.14,8.02)),0,-.07,0);
      for(const side of [-1,1]) {
        this.box(parts,'stone',.21,.26,8.01,side*4.86,-.02,0,.015);
        for(const z of [-3.35,3.35]) {
          this.box(parts,'stone',1.03,4.28,1.01,side*4.56,-2.98,z,.07);
          this.box(parts,'edge',1.32,.30,1.26,side*4.56,-1.02,z,.055);
          this.box(parts,'edge',1.47,.38,1.46,side*4.56,-5.05,z,.055);
          this.box(parts,'steel',1.72,.18,.23,side*5.12,-.80,z,.025,0,0,side*.35);
        }
        for(let wedge=0;wedge<10;wedge++) {
          const start=wedge*Math.PI/10+.008,end=(wedge+1)*Math.PI/10-.008,shape=new T.Shape();
          shape.moveTo(Math.cos(start)*2.73,Math.sin(start)*2.73);shape.lineTo(Math.cos(end)*2.73,Math.sin(end)*2.73);
          shape.lineTo(Math.cos(end)*2.08,Math.sin(end)*2.08);shape.lineTo(Math.cos(start)*2.08,Math.sin(start)*2.08);shape.closePath();
          const geometry=this.keep(new T.ExtrudeGeometry(shape,{depth:.76,bevelEnabled:true,bevelThickness:.022,bevelSize:.022,bevelSegments:1,steps:1}));
          geometry.translate(0,0,-.38);geometry.rotateY(Math.PI/2);this.part(parts,wedge===4||wedge===5?'edge':'stone',geometry,side*4.56,-3.95,0);
        }
        this.box(parts,'earth',7.7,1.45,8,side*11.4,-4.57,0,.15);
      }
      this.box(parts,'earth',36,.95,8,0,-5.70,0,.10);
    },this.segmentCount);
    for(let stage=0;stage<3;stage++)for(let variant=0;variant<6;variant++){
      const meshes:T.InstancedMesh[]=[];this.banks[stage].push(meshes);
      this.build(meshes,parts=>this.sideModule(parts,stage,variant),this.segmentCount*2);
      for(const mesh of meshes){mesh.count=0;mesh.visible=false;mesh.name=`Industrial_${stage}_${variant}`;}
    }
    // Independent articulated links, joints, weld tips and cooling fans; each pool has a strict cap.
    const fanParts:Parts=new Map();
    for(let blade=0;blade<4;blade++)this.box(fanParts,'steel',.13,.53,.055,Math.sin(blade*Math.PI/2)*.23,Math.cos(blade*Math.PI/2)*.23,0,.004,0,0,-blade*Math.PI/2);
    const fanGeometry=this.keep(mergeGeometries(fanParts.get('steel')!,false)!);for(const g of fanParts.get('steel')!)g.dispose();
    const specs:[T.BufferGeometry,Role,number][]=[
      [this.keep(new T.BoxGeometry(.29,1,.32)),'steel',24],
      [this.keep(new T.BoxGeometry(.22,1,.26)),'accent',24],
      [this.keep(new T.SphereGeometry(.22,8,5)),'dark',48],
      [this.keep(new T.SphereGeometry(.05,6,4)),'light',24],
      [fanGeometry,'steel',24],
    ];
    for(const [geometry,role,capacity]of specs){const mesh=new T.InstancedMesh(geometry,this.materials.get(role)!,capacity);mesh.count=0;mesh.frustumCulled=false;mesh.castShadow=role!=='light';mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);this.animated.push(mesh);this.root.add(mesh);}
    scene.add(this.root);this.update(0,0,0);
  }

  /** Six cohesive factory bays, each with its own ledge profile, railing rhythm and silhouette. */
  private sideModule(parts:Parts,stage:number,variant:number):void {
    const ledgeLengths=[7.6,6.0,7.1,4.8,6.5,7.7],ledge=ledgeLengths[variant];
    this.box(parts,'dark',2.35,.32,ledge,0,-.25,0,.03);
    this.box(parts,'steel',2.21,.065,ledge-.15,0,-.06,0,.006);
    // Curbs/neutral safety paint and rail gaps differ between bays; all are beyond the road edge.
    const railRanges=variant%3===0?[[-2.5,1.4],[1.4,2.3]]:variant%3===1?[[-2.0,2.7],[2.65,.6]]:[[-3.1,.8],[.1,2.0],[2.7,1.1]];
    for(const [z,length]of railRanges){
      this.box(parts,'steel',.065,.085,length,-.99,.71,z,.006);
      for(const end of [-1,1])this.box(parts,'dark',.075,.75,.08,-.99,.32,z+end*length*.42,.007);
      this.box(parts,'edge',.11,.017,length*.65,-1.48,.012,z,.002);
    }
    if(variant%2===0)for(const z of [-2.2,2.25]){
      this.cylinder(parts,'dark',.10,.13,.61,-.83,.26,z);
      this.cylinder(parts,'edge',.112,.112,.10,-.83,.45,z);
    }
    if(variant===0){ // Supply bay: differing stacks, cable coils, low silhouettes.
      this.crate(parts,-.25,.46,-1.5,1.05);this.crate(parts,.7,.31,.15,.76);
      if(stage!==1)this.crate(parts,-.25,1.25,-1.5,.65);
      this.coil(parts,.75,.45,2.0,.5);
      this.box(parts,'accent',.07,.045,1.4,-.4,.015,2.2,.003);
    }else if(variant===1){ // Articulated welding cell, animated by its separate pooled links.
      this.cylinder(parts,'dark',.34,.43,.8,.3,.35,1.2,0,0,0,12);
      this.cylinder(parts,'steel',.38,.38,.16,.3,.75,1.2,0,0,0,12);
      this.box(parts,'steel',1.35,.16,1.7,1.4,.40,1.2,.02);
      this.box(parts,'dark',.15,.66,.15,1.0,.05,.7,.005);this.box(parts,'dark',.15,.66,.15,1.8,.05,1.7,.005);
      this.box(parts,'accent',.8,.88,.57,-.05,.44,-1.7,.035);
      this.box(parts,'light',.36,.19,.04,-.05,.56,-1.38,.008);
      this.conduit(parts,.85,.26,-1.7,1.15);
    }else if(variant===2){ // Cooling station: actual ring, radial grill, conduits and turning fan.
      this.box(parts,'dark',1.18,1.67,1.42,.35,.77,-1.2,.04);
      this.cylinder(parts,'steel',.61,.61,.21,-.25,1.05,-1.2,0,0,Math.PI/2,12);
      const torus=this.keep(new T.TorusGeometry(.49,.065,6,16));torus.rotateY(Math.PI/2);this.part(parts,'accent',torus,-.38,1.05,-1.2);
      this.conduit(parts,.72,.18,1.75,2.3);this.coil(parts,.68,.47,1.65,.39);
      for(const z of [-1.7,-.7])this.box(parts,'steel',.055,1.07,.055,-.49,1.06,z,.002);
    }else if(variant===3){ // Offset crane structure, always facing out over the service bay.
      this.box(parts,'dark',1.8,.23,2.0,.15,-.015,-.8,.025);
      for(const z of [-1.6,.3]){
        this.box(parts,'steel',.3,3.5,.34,.8,1.7,z,.02);
        this.box(parts,'accent',.34,.23,.39,.8,.52,z,.015);
      }
      this.box(parts,'steel',2.4,.32,.38,.53,3.36,-.65,.025);
      this.box(parts,'dark',.34,.30,.5,-.2,3.05,-.65,.015);
      this.cylinder(parts,'dark',.027,.027,1.30,-.2,2.35,-.65,0,0,0,6);
      this.part(parts,'steel',this.keep(new T.TorusGeometry(.14,.042,5,9,Math.PI*1.45)),-.2,1.66,-.65);
      this.crate(parts,.0,.45,-.65,1.0);this.conduit(parts,.3,.2,2.3,1.35);
    }else if(variant===4){ // Reservoir pair: no continuous repeated pipe rack.
      for(const z of [-1.65,1.25]){
        this.cylinder(parts,'steel',.59,.66,1.95,.38,.98,z,0,0,0,12);
        this.cylinder(parts,'dark',.25,.34,.42,.38,2.15,z,0,0,0,10);
        for(const y of [.34,1.6])this.cylinder(parts,'accent',.66,.66,.09,.38,y,z,0,0,0,12);
      }
      this.conduit(parts,-.35,.3,-.25,3.8);
      this.box(parts,'light',.08,.68,.07,-.3,1.05,-1.64,.005);
    }else if(stage===0){ // Relic causeway: broken-height pylons and an ancient energy conduit.
      for(const [z,height]of [[-1.7,2.3],[1.4,1.3]]){
        this.box(parts,'stone',.85,height,.83,.38,height/2,z,.06);
        this.box(parts,'edge',1.05,.19,1.04,.38,height+.09,z,.035);
        this.box(parts,'light',.075,height*.51,.045,-.08,height*.54,z+.43,.007);
      }
      this.conduit(parts,.9,.17,0,5.2);
    }else if(stage===1){ // Foundry: furnace chamber, hot slit, chimney and a cable drum.
      this.box(parts,'dark',1.75,1.98,2.15,.35,.97,-.95,.055);
      this.box(parts,'accent',.1,1.33,1.76,-.58,1.02,-.95,.018);
      for(const z of [-1.5,-.95,-.4])this.box(parts,'light',.04,.40,.15,-.65,.74,z,.006);
      this.cylinder(parts,'steel',.29,.36,1.22,.5,2.55,-1.18);
      this.coil(parts,.62,.54,2.0,.61);
    }else{ // Citadel: staggered armor wall with powered vent, not a copy of the factory tanks.
      this.box(parts,'stone',1.23,2.3,4.1,.42,1.10,0,.075);
      for(const z of [-1.45,0,1.45]){
        this.box(parts,'steel',.25,1.6,1.07,-.27,.94,z,.035);
        this.box(parts,'light',.045,.11,.67,-.42,1.15,z,.004);
      }
      this.box(parts,'edge',1.4,.25,2.65,.42,2.42,-.6,.045);
      this.box(parts,'dark',.83,.46,1.18,.42,2.62,1.15,.02);
    }
  }
  private crate(parts:Parts,x:number,y:number,z:number,size:number):void {
    this.box(parts,'dark',size,size*.85,size,x,y,z,.035);
    for(const dx of [-.28,.28])this.box(parts,'steel',size*.085,size*.88,size*1.025,x+dx*size,y,z,.007);
    this.box(parts,'accent',size*.37,size*.16,.025,x,y+.06,z+size*.505,.004);
  }
  private conduit(parts:Parts,x:number,y:number,z:number,length:number):void {
    this.cylinder(parts,'accent',.11,.11,length,x,y,z,Math.PI/2,0,0,8);
    for(const end of [-1,1])this.cylinder(parts,'dark',.16,.16,.14,x,y,z+end*(length*.5-.1),Math.PI/2,0,0,8);
  }
  private coil(parts:Parts,x:number,y:number,z:number,radius:number):void {
    const ring=this.keep(new T.TorusGeometry(radius,.054,5,14));
    for(let winding=0;winding<4;winding++)this.part(parts,'dark',ring,x,y,z+winding*.12,Math.PI/2,0,0);
    this.cylinder(parts,'steel',radius*.52,radius*.52,.68,x,y,z+.18,Math.PI/2,0,0,10);
  }

  private keep(geometry: T.BufferGeometry): T.BufferGeometry { this.geometries.add(geometry); return geometry; }
  private stoneTextures(): [T.Texture, T.Texture, T.Texture] {
    const size = 512, height = new Uint8Array(size * size * 4), roughness = new Uint8Array(height.length), albedo = new Uint8Array(height.length);
    let seed = 81173;
    const random = (): number => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed >>> 8) / 16777216; };
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * 4, noise = random();
      const cloud = Math.sin(x * .037 + y * .061) * 3 + Math.cos(x * .083 - y * .025) * 2;
      const value = Math.round(128 + (noise - .5) * 20 + cloud - (noise > .987 ? 23 : 0));
      const coarse = Math.round(219 + noise * 21 + cloud);
      const pigment = Math.max(150, Math.min(231, Math.round(205 + (noise - .5) * 17 + cloud * 1.3 - (noise > .987 ? 25 : 0))));
      for (let channel = 0; channel < 3; channel++) { height[offset + channel] = value; roughness[offset + channel] = coarse; albedo[offset + channel] = pigment; }
      height[offset + 3] = roughness[offset + 3] = albedo[offset + 3] = 255;
    }
    const make = (pixels: Uint8Array, cracks: boolean): T.Texture => {
      let texture: T.Texture;
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Stone texture surface unavailable');
        const data = context.createImageData(size, size); data.data.set(pixels); context.putImageData(data, 0, 0);
        if (cracks) for (let index = 0; index < 20; index++) {
          const x = random() * size, y = random() * size, dx = (random() - .5) * 70, dy = (random() - .5) * 50;
          context.strokeStyle = 'rgb(106 106 106)'; context.lineWidth = .65 + random() * .75; context.beginPath(); context.moveTo(x, y);
          context.quadraticCurveTo(x + dx * .45, y + dy * .65 + (random() - .5) * 10, x + dx, y + dy); context.stroke();
        }
        texture = new T.CanvasTexture(canvas);
      } else { texture = new T.DataTexture(pixels, size, size); texture.generateMipmaps = true; texture.minFilter = T.LinearMipmapLinearFilter; }
      texture.wrapS = texture.wrapT = T.RepeatWrapping; texture.repeat.set(.65, .65); texture.anisotropy = 4; texture.needsUpdate = true;
      this.textures.push(texture); return texture;
    };
    const stoneAlbedo = make(albedo, true); stoneAlbedo.colorSpace = T.SRGBColorSpace;
    return [make(height, true), make(roughness, false), stoneAlbedo];
  }
  private part(parts: Map<Role, T.BufferGeometry[]>, role: Role, geometry: T.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): void {
    this.dummy.position.set(x, y, z); this.dummy.rotation.set(rx, ry, rz); this.dummy.scale.set(1, 1, 1); this.dummy.updateMatrix();
    const transformed = (geometry.index ? geometry.toNonIndexed() : geometry.clone()).applyMatrix4(this.dummy.matrix);
    if (!parts.has(role)) parts.set(role, []); parts.get(role)!.push(transformed);
  }
  private box(parts: Map<Role, T.BufferGeometry[]>, role: Role, w: number, h: number, d: number, x: number, y: number, z: number, bevel = .035, rx = 0, ry = 0, rz = 0): void {
    const radius = Math.min(bevel, w * .20, h * .20, d * .20), key = `box:${w}:${h}:${d}:${radius}`;
    let geometry = this.cache.get(key);
    if (!geometry) {
      const shape = new T.Shape(); shape.moveTo(-w / 2 + radius, -h / 2 + radius); shape.lineTo(w / 2 - radius, -h / 2 + radius);
      shape.lineTo(w / 2 - radius, h / 2 - radius); shape.lineTo(-w / 2 + radius, h / 2 - radius); shape.closePath();
      geometry = this.keep(new T.ExtrudeGeometry(shape, { depth: d - 2 * radius, bevelEnabled: true, bevelThickness: radius, bevelSize: radius, bevelSegments: 1, steps: 1 }));
      geometry.translate(0, 0, -d / 2 + radius); this.cache.set(key, geometry);
    }
    this.part(parts, role, geometry, x, y, z, rx, ry, rz);
  }
  private cylinder(parts: Map<Role, T.BufferGeometry[]>, role: Role, r: number, base: number, height: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, segments = 10): void {
    const key = `cylinder:${r}:${base}:${height}:${segments}`;
    let geometry = this.cache.get(key);
    if (!geometry) { geometry = this.keep(new T.CylinderGeometry(r, base, height, segments)); this.cache.set(key, geometry); }
    this.part(parts, role, geometry, x, y, z, rx, ry, rz);
  }
  private build(destination: T.InstancedMesh[], builder: (parts: Map<Role, T.BufferGeometry[]>) => void, capacity = this.segmentCount): void {
    const parts = new Map<Role, T.BufferGeometry[]>(); builder(parts);
    for (const [role, pieces] of parts) {
      const merged = mergeGeometries(pieces, false); for (const piece of pieces) piece.dispose();
      if (!merged) throw new Error(`Causeway geometry merge failed for ${role}`);
      this.keep(merged);
      const mesh = new T.InstancedMesh(merged, this.materials.get(role)!, capacity);
      mesh.castShadow = role !== 'light' && role !== 'earth'; mesh.receiveShadow = true; mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(T.DynamicDrawUsage); destination.push(mesh); this.root.add(mesh);
    }
  }
  private beam(mesh:T.InstancedMesh,index:number):void {
    this.direction.subVectors(this.beamTo,this.beamFrom);const length=this.direction.length();
    this.dummy.position.copy(this.beamFrom).addScaledVector(this.direction,.5);
    this.direction.multiplyScalar(1/Math.max(.001,length));this.dummy.quaternion.setFromUnitVectors(this.up,this.direction);this.dummy.scale.set(1,length,1);this.dummy.updateMatrix();mesh.setMatrixAt(index,this.dummy.matrix);
  }
  update(travel:number,level:number,dt:number):void {
    if(this.disposed)return;
    const stage=Number.isFinite(level)?Math.max(0,Math.min(2,Math.floor(level))):0;
    const distance=Math.max(0,Number.isFinite(travel)?travel:0),anchor=Math.floor(distance/this.segmentLength),scroll=distance%this.segmentLength;
    if(stage!==this.level){
      this.level=stage;const palette=ENVIRONMENT_PALETTES[stage];
      for(const [role,material]of this.materials){material.color.setHex(palette[role]);if(role==='light')material.emissive.setHex(palette.light);}
      for(let l=0;l<3;l++)for(let v=0;v<6;v++)for(const mesh of this.banks[l][v]){mesh.visible=false;mesh.count=0;}
      this.anchor=-1;
    }
    // Plans are generated at spawn/recycling only. No random sampling or geometry allocation per frame.
    if(anchor!==this.anchor){this.anchor=anchor;for(let i=0;i<this.segmentCount;i++)this.plans[i]=planEnvironmentSection(anchor+i,stage);}
    this.age+=Math.max(0,Math.min(.1,Number.isFinite(dt)?dt:0));this.counts.fill(0);
    let armCount=0,fanCount=0;
    for(let i=0;i<this.segmentCount;i++){
      const z=10-i*this.segmentLength+scroll,plan=this.plans[i];
      this.dummy.position.set(0,0,z);this.dummy.rotation.set(0,0,0);this.dummy.scale.set(1,1,1);this.dummy.updateMatrix();
      for(const mesh of this.common)mesh.setMatrixAt(i,this.dummy.matrix);
      for(let sideIndex=0;sideIndex<2;sideIndex++){
        const side=sideIndex===0?-1:1,variant=sideIndex===0?plan.left:plan.right,index=this.counts[variant]++;
        this.dummy.position.set(side*6.3,0,z);this.dummy.rotation.set(0,side===-1?Math.PI:0,0);this.dummy.scale.set(1,1,1);this.dummy.updateMatrix();
        for(const mesh of this.banks[stage][variant])mesh.setMatrixAt(index,this.dummy.matrix);
        if(variant===1){
          const phase=plan.phase+sideIndex*1.17,sway=Math.sin(this.age*.67+phase),workZ=z+side*1.2;
          this.beamFrom.set(side*6.6,.85,workZ);this.beamTo.set(side*(7.08+sway*.15),2.0+Math.sin(this.age*.83+phase)*.23,workZ+.12*Math.cos(this.age*.7+phase));
          this.beam(this.animated[0],armCount);
          this.dummy.position.copy(this.beamFrom);this.dummy.rotation.set(0,0,0);this.dummy.scale.set(1,1,1);this.dummy.updateMatrix();this.animated[2].setMatrixAt(armCount*2,this.dummy.matrix);
          this.beamFrom.copy(this.beamTo);this.dummy.position.copy(this.beamFrom);this.dummy.updateMatrix();this.animated[2].setMatrixAt(armCount*2+1,this.dummy.matrix);
          this.beamTo.set(side*(7.75+sway*.18),.55+Math.cos(this.age*.83+phase)*.12,workZ+.25*Math.sin(this.age*.71+phase));this.beam(this.animated[1],armCount);
          this.dummy.position.copy(this.beamTo);this.dummy.rotation.set(0,0,0);const arc=Math.sin(this.age*13+phase)>.4?1:0;this.dummy.scale.setScalar(arc);this.dummy.updateMatrix();this.animated[3].setMatrixAt(armCount,this.dummy.matrix);armCount++;
        }
        if(variant===2){
          this.dummy.position.set(side*5.83,1.05,z-side*1.2);this.dummy.rotation.set(this.age*(1.6+stage*.27)+plan.phase,Math.PI/2,0);this.dummy.scale.set(1,1,1);this.dummy.updateMatrix();this.animated[4].setMatrixAt(fanCount++,this.dummy.matrix);
        }
      }
    }
    for(const mesh of this.common)mesh.instanceMatrix.needsUpdate=true;
    for(let variant=0;variant<6;variant++)for(const mesh of this.banks[stage][variant]){mesh.count=this.counts[variant];mesh.visible=mesh.count>0;mesh.instanceMatrix.needsUpdate=true;}
    for(let i=0;i<this.animated.length;i++){
      const mesh=this.animated[i];mesh.count=i===4?fanCount:i===2?armCount*2:armCount;mesh.visible=mesh.count>0;mesh.instanceMatrix.needsUpdate=true;
    }
  }
  dispose():void {
    if(this.disposed)return;this.disposed=true;this.scene.remove(this.root);
    for(const mesh of this.common)mesh.dispose();for(const stage of this.banks)for(const bay of stage)for(const mesh of bay)mesh.dispose();for(const mesh of this.animated)mesh.dispose();
    for(const geometry of this.geometries)geometry.dispose();for(const material of this.materials.values())material.dispose();for(const texture of this.textures)texture.dispose();
    this.root.clear();this.textures.length=0;this.cache.clear();this.geometries.clear();this.materials.clear();this.plans.length=0;
    this.common.length=0;this.animated.length=0;for(const stage of this.banks){for(const bay of stage)bay.length=0;stage.length=0;}this.counts.fill(0);
  }
}
