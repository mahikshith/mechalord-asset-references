import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Rust Trooper v2: the red grunt rebuilt as an armoured mech with the same
 * pivots as the original (feet at y=0, arms hang from (±.34,.73), legs from
 * (±.32,.45)), so the existing instanced walk/aim animation drives it unchanged. */
export interface TrooperParts {body:T.BufferGeometry[];glow:T.BufferGeometry[];arm:T.BufferGeometry[];leg:T.BufferGeometry[];}
type Paint=(g:T.BufferGeometry,color:number,x?:number,y?:number,z?:number,rx?:number,ry?:number,rz?:number)=>T.BufferGeometry;
const box=(w:number,h:number,d:number,r=.03)=>new RoundedBoxGeometry(w,h,d,2,Math.min(r,w*.3,h*.3,d*.3));

export function rustTrooperParts(paint:Paint):TrooperParts{
 const red=0x9c2f22,deep=0x5e1d17,dark=0x1f2930,steel=0x56656d,bronze=0xa27a45,hot=0xff7a2a,eye=0xff3b1a;
 const body=[
  paint(box(.46,.16,.30),dark,0,.45,0),                                  // pelvis
  paint(box(.20,.12,.22),steel,0,.53,0),                                 // waist
  paint(box(.60,.36,.40,.07),red,0,.70,0),                               // chest shell
  paint(box(.46,.24,.07,.03),deep,0,.70,.21,-.12),                       // breast plate
  paint(box(.08,.30,.06),steel,0,.70,.25),                               // keel
  paint(box(.40,.32,.20,.04),dark,0,.72,-.27),                           // power pack
  paint(new T.CylinderGeometry(.055,.07,.26,10),steel,-.12,.92,-.30),     // exhaust stacks
  paint(new T.CylinderGeometry(.055,.07,.26,10),steel,.12,.92,-.30),
  paint(box(.26,.20,.26,.05),deep,0,.98,.01),                            // helm
  paint(box(.30,.06,.24,.02),red,0,1.07,0),                              // brow crest
  paint(new T.ConeGeometry(.05,.22,4),bronze,0,1.17,-.04),               // crest fin
  paint(box(.30,.06,.20),dark,0,.90,.02),                                // collar
 ];
 for(const s of [-1,1]){
  body.push(paint(new T.SphereGeometry(.16,14,8,0,Math.PI*2,0,Math.PI*.55).scale(1.2,.8,1.1),deep,s*.36,.82,0)); // pauldron
  body.push(paint(new T.TorusGeometry(.17,.02,5,18),bronze,s*.36,.82,0,Math.PI/2));
  body.push(paint(box(.05,.18,.05),steel,s*.29,.62,.21));               // side ribs
 }
 // Heavy rifle on the right side, aligned with the old muzzle socket (.16,.70,.39).
 body.push(paint(box(.12,.12,.34,.02),dark,.16,.70,.24),paint(new T.CylinderGeometry(.045,.05,.36,10),steel,.16,.70,.50,Math.PI/2),paint(new T.TorusGeometry(.06,.018,5,12),bronze,.16,.70,.66));
 const glow=[
  paint(box(.20,.035,.03,.01),eye,0,.99,.15),                            // visor slit
  paint(new T.OctahedronGeometry(.075),hot,0,.70,.26),                   // reactor heart
  paint(box(.025,.10,.02,.005),hot,-.10,.72,.25),paint(box(.025,.10,.02,.005),hot,.10,.72,.25),
  paint(new T.CircleGeometry(.04,10),hot,-.12,1.055,-.30,-Math.PI/2),paint(new T.CircleGeometry(.04,10),hot,.12,1.055,-.30,-Math.PI/2),
 ];
 const arm=[
  paint(new T.SphereGeometry(.10,10,8),steel,0,-.02,0),
  paint(box(.15,.22,.16,.03),dark,0,-.15,.01),
  paint(box(.18,.20,.20,.05),red,0,-.33,.04),
  paint(box(.13,.10,.16,.03),steel,0,-.47,.08),
 ];
 const leg=[
  paint(box(.18,.20,.20,.04),dark,0,-.08,0),
  paint(box(.16,.10,.10,.03),red,0,-.18,.11),                            // knee guard
  paint(box(.14,.20,.16,.03),steel,0,-.30,0),
  paint(box(.20,.08,.30,.03),dark,0,-.42,.05),                           // boot
 ];
 return {body,glow,arm,leg};
}
