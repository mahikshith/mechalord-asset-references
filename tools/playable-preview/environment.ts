import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

type Role = 'deck' | 'tile' | 'stone' | 'edge' | 'steel' | 'dark' | 'accent' | 'light' | 'earth';
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
  private readonly stages: T.InstancedMesh[][] = [[], [], []];
  private readonly dummy = new T.Object3D();
  private gears: T.InstancedMesh;
  private gearHubs: T.InstancedMesh;
  private level = -1;
  private age = 0;
  private disposed = false;

  constructor(private readonly scene: T.Scene) {
    this.root.name = 'Mechalord_RaisedCauseway';
    for (const role of ['deck', 'tile', 'stone', 'edge', 'steel', 'dark', 'accent', 'light', 'earth'] as Role[]) {
      const material = new T.MeshStandardMaterial({ roughness: role === 'steel' ? .65 : .92, metalness: role === 'steel' ? .2 : .025 });
      if (role === 'light') { material.emissiveIntensity = .45; material.roughness = .5; }
      this.materials.set(role, material);
    }
    const [bump, roughness, albedo] = this.stoneTextures();
    for (const role of ['deck', 'tile', 'stone', 'edge'] as Role[]) {
      const material = this.materials.get(role)!; material.map = albedo; material.bumpMap = bump; material.bumpScale = role === 'deck' || role === 'tile' ? .065 : .045; material.roughnessMap = roughness;
    }
    this.build(this.common, parts => {
      this.box(parts, 'stone', 9.7, 1.23, 8, 0, -.765, 0, .09);
      // Actual inset flagstones and joints, rather than a painted flat road.
      for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++)
        this.box(parts, (row + col) % 2 ? 'tile' : 'deck', 3.205, .14, 3.975, (col - 1) * 3.23, -.07, (row - .5) * 4, .015);
      for (const side of [-1, 1]) {
        for (let block = 0; block < 6; block++) this.box(parts, 'edge', .34, .42, 1.285, side * 4.86, .11, -3.333 + block * 1.333, .045);
        this.box(parts, 'dark', .10, .055, 7.85, side * 4.46, .017, 0, .007);
        this.box(parts, 'accent', .045, .02, 7.78, side * 4.46, .038, 0, .004);
        // Two courses of separate beveled masonry beneath the parapet.
        for (let course = 0; course < 2; course++) for (let brick = 0; brick < 4; brick++)
          this.box(parts, course ? 'stone' : 'edge', .24, .35, 1.93, side * 4.91, -.34 - course * .39, -3 + brick * 2, .035);
        this.box(parts, 'steel', 1.27, .32, 7.95, side * 5.66, -.31, 0, .035);
        this.box(parts, 'dark', 1.21, .06, 7.8, side * 5.66, -.12, 0, .008);
        for (const z of [-3.35, 3.35]) {
          this.box(parts, 'stone', 1.03, 4.28, 1.01, side * 4.56, -2.98, z, .07);
          this.box(parts, 'edge', 1.32, .30, 1.26, side * 4.56, -1.02, z, .055);
          this.box(parts, 'edge', 1.47, .38, 1.46, side * 4.56, -5.05, z, .055);
          this.box(parts, 'steel', 1.72, .18, .23, side * 5.12, -.80, z, .025, 0, 0, side * .35);
          this.box(parts, 'stone', .42, 1.38, .53, side * 5.35, -1.20, z, .045, 0, 0, -side * .57);
        }
        // Longitudinal load-bearing arches: real openings, radial stone wedges and thickness.
        for (let wedge = 0; wedge < 10; wedge++) {
          const start = wedge * Math.PI / 10 + .008, end = (wedge + 1) * Math.PI / 10 - .008;
          const shape = new T.Shape();
          shape.moveTo(Math.cos(start) * 2.73, Math.sin(start) * 2.73);
          shape.lineTo(Math.cos(end) * 2.73, Math.sin(end) * 2.73);
          shape.lineTo(Math.cos(end) * 2.08, Math.sin(end) * 2.08);
          shape.lineTo(Math.cos(start) * 2.08, Math.sin(start) * 2.08); shape.closePath();
          const geometry = this.keep(new T.ExtrudeGeometry(shape, { depth: .76, bevelEnabled: true, bevelThickness: .022, bevelSize: .022, bevelSegments: 1, steps: 1 }));
          geometry.translate(0, 0, -.38); geometry.rotateY(Math.PI / 2);
          this.part(parts, wedge === 4 || wedge === 5 ? 'edge' : 'stone', geometry, side * 4.56, -3.95, 0);
        }
        this.box(parts, 'earth', 7.7, 1.45, 8, side * 11.4, -4.57, 0, .15);
        for (const z of [-2, 2]) this.box(parts, 'dark', .22, .54, 3.85, side * 6.29, .13, z, .035);
      }
      this.box(parts, 'earth', 36, .95, 8, 0, -5.70, 0, .10);
    });
    for (let stage = 0; stage < 3; stage++) this.build(this.stages[stage], parts => {
      for (const side of [-1, 1]) {
        if (stage === 0) {
          this.box(parts, 'stone', 1.24, .36, 1.3, side * 6.72, -.06, -1.7, .07);
          this.box(parts, 'edge', .65, 1.78, .75, side * 6.72, .90, -1.7, .055);
          this.box(parts, 'steel', 1.08, .23, 1.07, side * 6.72, 1.83, -1.7, .035);
          this.cylinder(parts, 'accent', .22, .28, .74, side * 6.72, 2.27, -1.7);
          this.cylinder(parts, 'light', .13, .13, .46, side * 6.72, 2.28, -1.7);
          this.cylinder(parts, 'steel', .11, .11, 7.8, side * 6.20, .18, 0, Math.PI / 2);
        } else if (stage === 1) {
          this.box(parts, 'dark', 2.0, .38, 2.3, side * 7.0, -.06, -.85, .055);
          this.cylinder(parts, 'steel', .71, .78, 2.65, side * 7.05, 1.43, -.85, 0, 0, 0, 12);
          for (const y of [.43, 2.33]) this.cylinder(parts, 'accent', .77, .77, .13, side * 7.05, y, -.85, 0, 0, 0, 12);
          this.cylinder(parts, 'dark', .27, .34, 1.20, side * 7.05, 3.27, -.85);
          this.cylinder(parts, 'accent', .25, .25, 7.8, side * 5.89, .24, 0, Math.PI / 2);
          for (const z of [-2.7, 2.7]) {
            this.cylinder(parts, 'steel', .30, .30, .12, side * 5.89, .24, z, Math.PI / 2);
            this.box(parts, 'steel', .67, .40, .57, side * 5.89, -.02, z, .025);
          }
          this.box(parts, 'light', .055, .06, 1.55, side * 6.49, .13, -1.1, .008);
        } else {
          this.box(parts, 'dark', 1.52, .36, 1.74, side * 6.78, -.04, -1.55, .065);
          this.box(parts, 'stone', 1.26, 2.15, 1.38, side * 6.78, 1.19, -1.55, .075);
          this.box(parts, 'edge', 1.50, .26, 1.62, side * 6.78, 2.40, -1.55, .045);
          for (const dx of [-.48, .48]) this.box(parts, 'edge', .31, .37, 1.49, side * 6.78 + dx, 2.68, -1.55, .035);
          this.box(parts, 'steel', .71, .83, .08, side * 6.78, 1.30, -.82, .045);
          this.box(parts, 'light', .13, .55, .05, side * 6.78, 1.30, -.75, .012);
          this.cylinder(parts, 'accent', .16, .16, 7.8, side * 6.12, .23, 0, Math.PI / 2);
        }
        // A mounted transmission behind the service ledge, outside every steerable lane.
        this.box(parts, 'steel', 1.04, .23, 1.06, side * 6.56, -.05, 1.72, .05);
        this.box(parts, 'dark', .42, 1.05, .40, side * 6.56, .57, 1.72, .035);
      }
    });
    const gearShape = new T.Shape();
    for (let point = 0; point < 48; point++) {
      const angle = point * Math.PI / 24, radius = point % 4 === 1 || point % 4 === 2 ? .61 : .49;
      if (point === 0) gearShape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      else gearShape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    gearShape.closePath();
    const bore = new T.Path();
    for (let point = 0; point < 12; point++) {
      const angle = -point * Math.PI / 6;
      if (point === 0) bore.moveTo(Math.cos(angle) * .18, Math.sin(angle) * .18);
      else bore.lineTo(Math.cos(angle) * .18, Math.sin(angle) * .18);
    }
    bore.closePath(); gearShape.holes.push(bore);
    const gearGeometry = this.keep(new T.ExtrudeGeometry(gearShape, { depth: .16, bevelEnabled: true, bevelThickness: .015, bevelSize: .015, bevelSegments: 1, steps: 1 }));
    gearGeometry.translate(0, 0, -.08);
    this.gears = new T.InstancedMesh(gearGeometry, this.materials.get('accent')!, this.segmentCount * 2);
    this.gearHubs = new T.InstancedMesh(this.keep(new T.CylinderGeometry(.15, .15, .27, 10).rotateX(Math.PI / 2)), this.materials.get('steel')!, this.segmentCount * 2);
    for (const mesh of [this.gears, this.gearHubs]) { mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false; mesh.instanceMatrix.setUsage(T.DynamicDrawUsage); this.root.add(mesh); }
    scene.add(this.root); this.update(0, 0, 0);
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
  private build(destination: T.InstancedMesh[], builder: (parts: Map<Role, T.BufferGeometry[]>) => void): void {
    const parts = new Map<Role, T.BufferGeometry[]>(); builder(parts);
    for (const [role, pieces] of parts) {
      const merged = mergeGeometries(pieces, false); for (const piece of pieces) piece.dispose();
      if (!merged) throw new Error(`Causeway geometry merge failed for ${role}`);
      this.keep(merged);
      const mesh = new T.InstancedMesh(merged, this.materials.get(role)!, this.segmentCount);
      mesh.castShadow = role !== 'light' && role !== 'earth'; mesh.receiveShadow = true; mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(T.DynamicDrawUsage); destination.push(mesh); this.root.add(mesh);
    }
  }
  update(travel: number, level: number, dt: number): void {
    if (this.disposed) return;
    const stage = Number.isFinite(level) ? Math.max(0, Math.min(2, Math.floor(level))) : 0;
    if (stage !== this.level) {
      this.level = stage; const palette = ENVIRONMENT_PALETTES[stage];
      for (const [role, material] of this.materials) { material.color.setHex(palette[role]); if (role === 'light') material.emissive.setHex(palette.light); }
      for (let index = 0; index < 3; index++) for (const mesh of this.stages[index]) mesh.visible = index === stage;
    }
    this.age += Math.max(0, Math.min(.1, Number.isFinite(dt) ? dt : 0));
    const scroll = ((Number.isFinite(travel) ? travel : 0) % this.segmentLength + this.segmentLength) % this.segmentLength;
    for (let index = 0; index < this.segmentCount; index++) {
      const z = 10 - index * this.segmentLength + scroll;
      this.dummy.position.set(0, 0, z); this.dummy.rotation.set(0, 0, 0); this.dummy.scale.set(1, 1, 1); this.dummy.updateMatrix();
      for (const mesh of this.common) mesh.setMatrixAt(index, this.dummy.matrix);
      for (const mesh of this.stages[stage]) mesh.setMatrixAt(index, this.dummy.matrix);
      for (let sideIndex = 0; sideIndex < 2; sideIndex++) {
        const side = sideIndex === 0 ? -1 : 1, instance = index * 2 + sideIndex;
        this.dummy.position.set(side * 6.56, .81, z + 1.99); this.dummy.rotation.z = side * this.age * .43; this.dummy.updateMatrix(); this.gears.setMatrixAt(instance, this.dummy.matrix);
        this.dummy.rotation.z = 0; this.dummy.updateMatrix(); this.gearHubs.setMatrixAt(instance, this.dummy.matrix);
      }
    }
    for (const mesh of [...this.common, ...this.stages[stage], this.gears, this.gearHubs]) mesh.instanceMatrix.needsUpdate = true;
  }
  dispose(): void {
    if (this.disposed) return; this.disposed = true; this.scene.remove(this.root);
    for (const mesh of [...this.common, ...this.stages.flat(), this.gears, this.gearHubs]) mesh.dispose();
    for (const geometry of this.geometries) geometry.dispose(); for (const material of this.materials.values()) material.dispose();
    for (const texture of this.textures) texture.dispose(); this.textures.length = 0;
    this.root.clear(); this.cache.clear(); this.geometries.clear(); this.materials.clear();
  }
}
