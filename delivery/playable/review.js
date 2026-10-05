var zo=["cannonL","cannonR","jetL","jetR","legL","legR","core"],xp=["ready","run","boss","destroying","won","lost","lastStand"],yp=["enemy","crate","gate","hazard","orb"],vp=["hit","kill","recruit","gate","damage","relic","bossShot","win","contact","block","bossDeath","missed","drop","pickup","pass","retreat","bossPhase","commanderHit","commanderDeath","hazardBreak","troopDeath","coreExpose","bossRevive","bossPartBreak","troopSacrifice","heal","revive","commanderDown","enemyFire","empPulse","empClear","empStun","shieldHit","escortBlock"],_p=["shell","rocket","orb"],bp=["gunner","armL","armR","shoulderL","shoulderR","core"],Mp=["pulse","arc","rail","missile","cannon"],Tp=["strafe","advance","retreat","windup","fire","dying"],Pu=["none","guided","cannons","railburst","escort"],Sp=["guided","cannons","railburst","freeze","slow","haste","escort"],wp=["none","freeze","slow","haste"],Ap=["armored","exposed","rebuilding","destroying","guarded"],Vo=class{api;async load(){let e=await fetch("assault.73b4ca12e4df9622.wasm",{cache:"no-store"});if(!e.ok)throw new Error("Combat core could not be loaded.");let t=await WebAssembly.compile(await e.arrayBuffer()),n={};for(let r of WebAssembly.Module.imports(t)){if(r.kind!=="function")throw new Error("Unsupported core import: "+r.name);n[r.module]??={},n[r.module][r.name]=(...o)=>{if(r.name==="proc_exit")throw new Error("Combat core exited: "+o[0]);return 0}}let i=await WebAssembly.instantiate(t,n);if(this.api=i.exports,this.api.abi_version?.()!==3)throw new Error("Combat version mismatch. Refresh to load the matching game update.");this.api._initialize?.()}start(e,t=0,n=0){this.api.start_run(e,t,n)}step(e,t){this.api.step(e,t)}activate(){return!!this.api.use_relic()}heal(){return!!this.api.heal()}revive(){return!!this.api.revive()}declineRevive(){return!!this.api.decline_revive()}pause(e){this.api.set_paused(e?1:0)}read(e,t){return new Float32Array(this.api.memory.buffer,this.api[e](),t)}snapshot(){let e=this.read("state",79).slice(),t=[],n=this.read("formation",this.api.formation_count()*3);for(let T=0;T<n.length;T+=3)t.push({index:n[T],x:n[T+1],z:n[T+2]});let i=[],r=[],o=[],a=[],c=[],l=this.read("pickups",this.api.pickup_count()*6);for(let T=0;T<l.length;T+=6)c.push({id:l[T],kind:Sp[l[T+1]-1],x:l[T+2],z:l[T+3],radius:l[T+4],choiceGroup:l[T+5]});let h=this.read("targets",this.api.target_count()*19);for(let T=0;T<h.length;T+=19)i.push({id:h[T],kind:yp[h[T+1]],x:h[T+2],z:h[T+3],hp:h[T+4],maxHp:h[T+5],value:h[T+6],op:h[T+7],size:h[T+8],hit:h[T+9],variant:h[T+10],depth:h[T+11],fireState:["idle","tracking","locked","fire","reload"][h[T+12]],aimX:h[T+13],charge:h[T+14],role:h[T+15]?["grunt","gunner","battery","carrier"][h[T+15]]:h[T+10]>0?"elite":"grunt",guidedArmor:e[18]===0&&(h[T+15]===1||h[T+15]===2)&&(h[T+12]===1||h[T+12]===2),stunTime:h[T+16],ventOpen:!!h[T+17],ventTime:h[T+18]});let u=this.read("shots",this.api.shot_count()*13);for(let T=0;T<u.length;T+=13)r.push({id:u[T+7],...u[T+12]?{y:u[T+8],dy:u[T+9],aimRegion:zo[u[T+10]],epoch:u[T+11]}:{},x:u[T],z:u[T+1],dx:u[T+2],dz:u[T+3],heavy:!!u[T+4],kind:Mp[u[T+5]],owner:u[T+6]?"troop":"commander"});let d=this.read("enemy_shots",this.api.enemy_shot_count()*13);for(let T=0;T<d.length;T+=13)o.push({id:d[T],x:d[T+1],z:d[T+2],dx:d[T+3],dz:d[T+4],radius:d[T+5],kind:_p[d[T+6]],guided:d[T+7]>0,homingTime:d[T+7],sourceId:d[T+8],emitter:bp[d[T+9]],launchX:d[T+10],launchZ:d[T+11],launchY:d[T+12]});let f=[],g=this.read("lasers",this.api.laser_count()*7);for(let T=0;T<g.length;T+=7)f.push({id:g[T],x:g[T+1],z:g[T+2],endX:g[T+3],endZ:g[T+4],width:g[T+5],time:g[T+6]});let x=this.api.effect_count(),m=this.read("drain_effects",x*11);for(let T=0;T<m.length;T+=11)a.push({...m[T+10]?{y:m[T+8],hitRegion:zo[m[T+9]]}:{},id:m[T],kind:vp[m[T+1]],x:m[T+2],z:m[T+3],value:m[T+4],entityId:m[T+5],variant:m[T+6],size:m[T+7]});let p,v=[],b=[];if(e[18]===0&&e[26]>=e[27]){let T=this.read("boss_pose",17);p={rootX:T[0],rootY:T[1],worldZ:T[2],pitch:T[3],yaw:T[4],roll:T[5],poseClock:T[6],arm:[{pitch:T[7],roll:T[8]},{pitch:T[9],roll:T[10]}],leg:[T[11],T[12]],knee:[T[13],T[14]],barrel:[T[15],T[16]]};let M=this.read("boss_regions",105);for(let P=0;P<M.length;P+=15)v.push({id:zo[M[P]],x:M[P+1],y:M[P+2],z:M[P+3],radiusX:M[P+4],radiusY:M[P+5],radiusZ:M[P+6],quaternion:[M[P+7],M[P+8],M[P+9],M[P+10]],hp:M[P+11],maxHp:M[P+12],vulnerable:!!M[P+13],active:!!M[P+14]});let _=this.read("boss_components",154);for(let P=0;P<_.length;P+=14)b.push({componentIndex:_[P],regionId:zo[_[P+1]],x:_[P+2],y:_[P+3],z:_[P+4],radiusX:_[P+5],radiusY:_[P+6],radiusZ:_[P+7],quaternion:[_[P+8],_[P+9],_[P+10],_[P+11]],shape:_[P+12]?"ellipsoid":"roundedBox",active:!!_[P+13]})}let y=new Uint8Array(this.api.memory.buffer),A=this.api.level_name(),R=A;for(;R<y.length&&y[R]!==0;)++R;let C=new TextDecoder().decode(y.subarray(A,R));return{bossPose:p,bossRegions:v,bossComponents:b,guardHp:e[75],guardMax:e[76],bossEpoch:e[77],sweepUnresolved:e[78],phase:xp[e[0]],time:e[1],duration:e[2],level:e[18],levelName:C,rank:e[30],rankReward:e[31],weaponPower:Pu[e[32]],starterWeapon:Pu[e[49]],weaponPermanent:!!e[50],powerTime:e[33],timePower:wp[e[40]],timePowerTime:e[41],x:e[3],army:e[4],commanderHp:e[38],commanderMaxHp:e[39],canHeal:!!e[51],healCost:e[59],healAmount:e[60],healUsesRemaining:e[52],reviveUsed:!!e[53],reviveAvailable:!!e[54],reviveCost:e[61],reviveHp:e[62],reviveProtection:e[63],empPulseTime:e[64],empStunTime:e[65],escortShield:e[66],escortMax:e[67],safetyAdmitted:e[68],safetyDeferred:e[69],safetyUnsupported:e[70],safetyExistingUnsafe:e[71],safetyCapacity:e[72],safetyAuthoredRockets:e[73],safetyHorizon:e[74],energy:e[5],ability:e[6],relic:e[7],weapon:e[8],weaponXP:e[19],weaponNeed:e[20],kills:e[9],bossHp:e[10],bossMax:e[11],bossArmor:e[42],bossArmorMax:e[43],bossCoreHp:e[44],bossCoreMax:e[45],bossCoreTime:e[46],bossState:Ap[e[47]],bossRevives:e[48],bossAttack:e[12],bossLane:e[13],bossX:e[22],bossZ:e[23],bossY:e[34],bossPhase:e[35],bossPattern:["heavy","sweep","rockets","laser"][e[36]],bossPartsMask:e[55],bossPart:["cannon","jetpack","leg","reactor"][e[56]],bossPartHp:e[57],bossPartMax:e[58],bossAction:Tp[e[24]],deathProgress:e[25],travelDistance:e[26],travelGoal:e[27],engagement:!!e[28],frontline:e[29],score:e[14],formation:t,targets:i,shots:r,enemyShots:o,lasers:f,pickups:c,effects:a}}};var _d=0,th=1,bd=2;var nh=1,Xa=2,ii=3,bn=0,on=1,Ct=2,wi=0,yi=1,wt=2,ih=3,sh=4,Md=5,Ni=100,Td=101,Sd=102,wd=103,Ad=104,Ed=200,Rd=201,Cd=202,Id=203,va=204,_a=205,Pd=206,Ld=207,Dd=208,Ud=209,Nd=210,Fd=211,Bd=212,Od=213,kd=214,qa=0,Ya=1,Za=2,es=3,Ka=4,$a=5,Ja=6,ja=7,rh=0,zd=1,Vd=2,Ai=0,Gd=1,Hd=2,Wd=3,Qa=4,Xd=5,qd=6,Yd=7,Hl="attached",Zd="detached",oh=300,ps=301,ms=302,ec=303,tc=304,To=306,Kn=1e3,Yn=1001,Ys=1002,qt=1003,nc=1004;var gs=1005;var nn=1006,ar=1007;var Tn=1008;var Hn=1009,ah=1010,ch=1011,cr=1012,ic=1013,zi=1014,Dn=1015,lr=1016,sc=1017,rc=1018,hr=1020,lh=35902,hh=35899,uh=1021,dh=1022,Sn=1023,Zs=1026,ur=1027,oc=1028,ac=1029,fh=1030,cc=1031;var lc=1033,So=33776,wo=33777,Ao=33778,Eo=33779,hc=35840,uc=35841,dc=35842,fc=35843,pc=36196,mc=37492,gc=37496,xc=37808,yc=37809,vc=37810,_c=37811,bc=37812,Mc=37813,Tc=37814,Sc=37815,wc=37816,Ac=37817,Ec=37818,Rc=37819,Cc=37820,Ic=37821,Pc=36492,Lc=36494,Dc=36495,Uc=36283,Nc=36284,Fc=36285,Bc=36286,Kd=2200,$d=2201,Jd=2202,ts=2300,ns=2301,ya=2302,Ji=2400,ji=2401,Or=2402,Oc=2500,jd=2501,ph=0,Ro=1,dr=2,Qd=3200,ef=3201;var mh=0,tf=1,Ei="",It="srgb",Yt="srgb-linear",kr="linear",vt="srgb";var $i=7680;var Wl=519,nf=512,sf=513,rf=514,gh=515,of=516,af=517,cf=518,lf=519,ba=35044,Ri=35048;var xh="300 es",Vn=2e3,zr=2001;var $n=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let i=n[e];if(i!==void 0){let r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,e);e.target=null}}},Jt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Lu=1234567,Ur=Math.PI/180,is=180/Math.PI;function Cn(){let s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Jt[s&255]+Jt[s>>8&255]+Jt[s>>16&255]+Jt[s>>24&255]+"-"+Jt[e&255]+Jt[e>>8&255]+"-"+Jt[e>>16&15|64]+Jt[e>>24&255]+"-"+Jt[t&63|128]+Jt[t>>8&255]+"-"+Jt[t>>16&255]+Jt[t>>24&255]+Jt[n&255]+Jt[n>>8&255]+Jt[n>>16&255]+Jt[n>>24&255]).toLowerCase()}function nt(s,e,t){return Math.max(e,Math.min(t,s))}function yh(s,e){return(s%e+e)%e}function Ep(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function Rp(s,e,t){return s!==e?(t-s)/(e-s):0}function Nr(s,e,t){return(1-t)*s+t*e}function Cp(s,e,t,n){return Nr(s,e,1-Math.exp(-t*n))}function Ip(s,e=1){return e-Math.abs(yh(s,e*2)-e)}function Pp(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function Lp(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function Dp(s,e){return s+Math.floor(Math.random()*(e-s+1))}function Up(s,e){return s+Math.random()*(e-s)}function Np(s){return s*(.5-Math.random())}function Fp(s){s!==void 0&&(Lu=s);let e=Lu+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Bp(s){return s*Ur}function Op(s){return s*is}function kp(s){return(s&s-1)===0&&s!==0}function zp(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Vp(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Gp(s,e,t,n,i){let r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),l=r((e+n)/2),h=o((e+n)/2),u=r((e-n)/2),d=o((e-n)/2),f=r((n-e)/2),g=o((n-e)/2);switch(i){case"XYX":s.set(a*h,c*u,c*d,a*l);break;case"YZY":s.set(c*d,a*h,c*u,a*l);break;case"ZXZ":s.set(c*u,c*d,a*h,a*l);break;case"XZX":s.set(a*h,c*g,c*f,a*l);break;case"YXY":s.set(c*f,a*h,c*g,a*l);break;case"ZYZ":s.set(c*g,c*f,a*h,a*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function zn(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function yt(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}var rt={DEG2RAD:Ur,RAD2DEG:is,generateUUID:Cn,clamp:nt,euclideanModulo:yh,mapLinear:Ep,inverseLerp:Rp,lerp:Nr,damp:Cp,pingpong:Ip,smoothstep:Pp,smootherstep:Lp,randInt:Dp,randFloat:Up,randFloatSpread:Np,seededRandom:Fp,degToRad:Bp,radToDeg:Op,isPowerOfTwo:kp,ceilPowerOfTwo:zp,floorPowerOfTwo:Vp,setQuaternionFromProperEuler:Gp,normalize:yt,denormalize:zn},ne=class s{constructor(e=0,t=0){s.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*i+e.x,this.y=r*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},kt=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,o,a){let c=n[i+0],l=n[i+1],h=n[i+2],u=n[i+3],d=r[o+0],f=r[o+1],g=r[o+2],x=r[o+3];if(a===0){e[t+0]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=g,e[t+3]=x;return}if(u!==x||c!==d||l!==f||h!==g){let m=1-a,p=c*d+l*f+h*g+u*x,v=p>=0?1:-1,b=1-p*p;if(b>Number.EPSILON){let A=Math.sqrt(b),R=Math.atan2(A,p*v);m=Math.sin(m*R)/A,a=Math.sin(a*R)/A}let y=a*v;if(c=c*m+d*y,l=l*m+f*y,h=h*m+g*y,u=u*m+x*y,m===1-a){let A=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=A,l*=A,h*=A,u*=A}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,r,o){let a=n[i],c=n[i+1],l=n[i+2],h=n[i+3],u=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+h*u+c*f-l*d,e[t+1]=c*g+h*d+l*u-a*f,e[t+2]=l*g+h*f+a*d-c*u,e[t+3]=h*g-a*u-c*d-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,i=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(n/2),h=a(i/2),u=a(r/2),d=c(n/2),f=c(i/2),g=c(r/2);switch(o){case"XYZ":this._x=d*h*u+l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u+d*f*g;break;case"YZX":this._x=d*h*u+l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u-d*f*g;break;case"XZY":this._x=d*h*u-l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],h=t[6],u=t[10],d=n+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-c)*f,this._y=(r-l)*f,this._z=(o-i)*f}else if(n>a&&n>u){let f=2*Math.sqrt(1+n-a-u);this._w=(h-c)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(r+l)/f}else if(a>u){let f=2*Math.sqrt(1+a-n-u);this._w=(r-l)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(c+h)/f}else{let f=2*Math.sqrt(1+u-n-a);this._w=(o-i)/f,this._x=(r+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(nt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,i=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,h=t._w;return this._x=n*h+o*a+i*l-r*c,this._y=i*h+o*c+r*a-n*l,this._z=r*h+o*l+n*c-i*a,this._w=o*h-n*a-i*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,i=this._y,r=this._z,o=this._w,a=o*e._w+n*e._x+i*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=i,this._z=r,this;let c=1-a*a;if(c<=Number.EPSILON){let f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*i+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}let l=Math.sqrt(c),h=Math.atan2(l,a),u=Math.sin((1-t)*h)/l,d=Math.sin(t*h)/l;return this._w=o*u+this._w*d,this._x=n*u+this._x*d,this._y=i*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},w=class s{constructor(e=0,t=0,n=0){s.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Du.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Du.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*i-a*n),h=2*(a*t-r*i),u=2*(r*n-o*t);return this.x=t+c*l+o*u-a*h,this.y=n+c*h+a*l-r*u,this.z=i+c*u+r*h-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,i=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=i*c-r*a,this.y=r*o-n*c,this.z=n*a-i*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return dl.copy(this).projectOnVector(e),this.sub(dl)}reflect(e){return this.sub(dl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},dl=new w,Du=new kt,je=class s{constructor(e,t,n,i,r,o,a,c,l){s.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,c,l)}set(e,t,n,i,r,o,a,c,l){let h=this.elements;return h[0]=e,h[1]=i,h[2]=a,h[3]=t,h[4]=r,h[5]=c,h[6]=n,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],h=n[4],u=n[7],d=n[2],f=n[5],g=n[8],x=i[0],m=i[3],p=i[6],v=i[1],b=i[4],y=i[7],A=i[2],R=i[5],C=i[8];return r[0]=o*x+a*v+c*A,r[3]=o*m+a*b+c*R,r[6]=o*p+a*y+c*C,r[1]=l*x+h*v+u*A,r[4]=l*m+h*b+u*R,r[7]=l*p+h*y+u*C,r[2]=d*x+f*v+g*A,r[5]=d*m+f*b+g*R,r[8]=d*p+f*y+g*C,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8];return t*o*h-t*a*l-n*r*h+n*a*c+i*r*l-i*o*c}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8],u=h*o-a*l,d=a*c-h*r,f=l*r-o*c,g=t*u+n*d+i*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=u*x,e[1]=(i*l-h*n)*x,e[2]=(a*n-i*o)*x,e[3]=d*x,e[4]=(h*t-i*c)*x,e[5]=(i*r-a*t)*x,e[6]=f*x,e[7]=(n*c-l*t)*x,e[8]=(o*t-n*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,o,a){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+e,-i*l,i*c,-i*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(fl.makeScale(e,t)),this}rotate(e){return this.premultiply(fl.makeRotation(-e)),this}translate(e,t){return this.premultiply(fl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},fl=new je;function vh(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function Ks(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function hf(){let s=Ks("canvas");return s.style.display="block",s}var Uu={};function $s(s){s in Uu||(Uu[s]=!0,console.warn(s))}function uf(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Nu=new je().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Fu=new je().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Hp(){let s={enabled:!0,workingColorSpace:Yt,spaces:{},convert:function(i,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===vt&&(i.r=xi(i.r),i.g=xi(i.g),i.b=xi(i.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===vt&&(i.r=qs(i.r),i.g=qs(i.g),i.b=qs(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Ei?kr:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,o){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return $s("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return $s("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[Yt]:{primaries:e,whitePoint:n,transfer:kr,toXYZ:Nu,fromXYZ:Fu,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:It},outputColorSpaceConfig:{drawingBufferColorSpace:It}},[It]:{primaries:e,whitePoint:n,transfer:vt,toXYZ:Nu,fromXYZ:Fu,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:It}}}),s}var lt=Hp();function xi(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function qs(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var Rs,Ma=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Rs===void 0&&(Rs=Ks("canvas")),Rs.width=e.width,Rs.height=e.height;let i=Rs.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Rs}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Ks("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=xi(r[o]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(xi(t[n]/255)*255):t[n]=xi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Wp=0,Js=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Wp++}),this.uuid=Cn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(pl(i[o].image)):r.push(pl(i[o]))}else r=pl(i);n.url=r}return t||(e.images[this.uuid]=n),n}};function pl(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Ma.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Xp=0,ml=new w,zt=class s extends $n{constructor(e=s.DEFAULT_IMAGE,t=s.DEFAULT_MAPPING,n=Yn,i=Yn,r=nn,o=Tn,a=Sn,c=Hn,l=s.DEFAULT_ANISOTROPY,h=Ei){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Xp++}),this.uuid=Cn(),this.name="",this.source=new Js(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new ne(0,0),this.repeat=new ne(1,1),this.center=new ne(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new je,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(ml).x}get height(){return this.source.getSize(ml).y}get depth(){return this.source.getSize(ml).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==oh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Kn:e.x=e.x-Math.floor(e.x);break;case Yn:e.x=e.x<0?0:1;break;case Ys:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Kn:e.y=e.y-Math.floor(e.y);break;case Yn:e.y=e.y<0?0:1;break;case Ys:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};zt.DEFAULT_IMAGE=null;zt.DEFAULT_MAPPING=oh;zt.DEFAULT_ANISOTROPY=1;var ft=class s{constructor(e=0,t=0,n=0,i=1){s.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r,c=e.elements,l=c[0],h=c[4],u=c[8],d=c[1],f=c[5],g=c[9],x=c[2],m=c[6],p=c[10];if(Math.abs(h-d)<.01&&Math.abs(u-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+x)<.1&&Math.abs(g+m)<.1&&Math.abs(l+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let b=(l+1)/2,y=(f+1)/2,A=(p+1)/2,R=(h+d)/4,C=(u+x)/4,T=(g+m)/4;return b>y&&b>A?b<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(b),i=R/n,r=C/n):y>A?y<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(y),n=R/i,r=T/i):A<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(A),n=C/r,i=T/r),this.set(n,i,r,t),this}let v=Math.sqrt((m-g)*(m-g)+(u-x)*(u-x)+(d-h)*(d-h));return Math.abs(v)<.001&&(v=1),this.x=(m-g)/v,this.y=(u-x)/v,this.z=(d-h)/v,this.w=Math.acos((l+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this.w=nt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this.w=nt(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ta=class extends $n{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:nn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ft(0,0,e,t),this.scissorTest=!1,this.viewport=new ft(0,0,e,t);let i={width:e,height:t,depth:n.depth},r=new zt(i);this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:nn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isArrayTexture=this.textures[i].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let i=Object.assign({},e.textures[t].image);this.textures[t].source=new Js(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Jn=class extends Ta{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Vr=class extends zt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=qt,this.minFilter=qt,this.wrapR=Yn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Sa=class extends zt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=qt,this.minFilter=qt,this.wrapR=Yn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ft=class{constructor(e=new w(1/0,1/0,1/0),t=new w(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Bn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Bn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Bn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Bn):Bn.fromBufferAttribute(r,o),Bn.applyMatrix4(e.matrixWorld),this.expandByPoint(Bn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Go.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Go.copy(n.boundingBox)),Go.applyMatrix4(e.matrixWorld),this.union(Go)}let i=e.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Bn),Bn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Mr),Ho.subVectors(this.max,Mr),Cs.subVectors(e.a,Mr),Is.subVectors(e.b,Mr),Ps.subVectors(e.c,Mr),Ci.subVectors(Is,Cs),Ii.subVectors(Ps,Is),qi.subVectors(Cs,Ps);let t=[0,-Ci.z,Ci.y,0,-Ii.z,Ii.y,0,-qi.z,qi.y,Ci.z,0,-Ci.x,Ii.z,0,-Ii.x,qi.z,0,-qi.x,-Ci.y,Ci.x,0,-Ii.y,Ii.x,0,-qi.y,qi.x,0];return!gl(t,Cs,Is,Ps,Ho)||(t=[1,0,0,0,1,0,0,0,1],!gl(t,Cs,Is,Ps,Ho))?!1:(Wo.crossVectors(Ci,Ii),t=[Wo.x,Wo.y,Wo.z],gl(t,Cs,Is,Ps,Ho))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Bn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Bn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(hi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),hi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),hi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),hi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),hi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),hi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),hi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),hi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(hi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},hi=[new w,new w,new w,new w,new w,new w,new w,new w],Bn=new w,Go=new Ft,Cs=new w,Is=new w,Ps=new w,Ci=new w,Ii=new w,qi=new w,Mr=new w,Ho=new w,Wo=new w,Yi=new w;function gl(s,e,t,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){Yi.fromArray(s,r);let a=i.x*Math.abs(Yi.x)+i.y*Math.abs(Yi.y)+i.z*Math.abs(Yi.z),c=e.dot(Yi),l=t.dot(Yi),h=n.dot(Yi);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}var qp=new Ft,Tr=new w,xl=new w,dn=class{constructor(e=new w,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):qp.setFromPoints(e).getCenter(n);let i=0;for(let r=0,o=e.length;r<o;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Tr.subVectors(e,this.center);let t=Tr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(Tr,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(xl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Tr.copy(e.center).add(xl)),this.expandByPoint(Tr.copy(e.center).sub(xl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},ui=new w,yl=new w,Xo=new w,Pi=new w,vl=new w,qo=new w,_l=new w,ss=class{constructor(e=new w,t=new w(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ui)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ui.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ui.copy(this.origin).addScaledVector(this.direction,t),ui.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){yl.copy(e).add(t).multiplyScalar(.5),Xo.copy(t).sub(e).normalize(),Pi.copy(this.origin).sub(yl);let r=e.distanceTo(t)*.5,o=-this.direction.dot(Xo),a=Pi.dot(this.direction),c=-Pi.dot(Xo),l=Pi.lengthSq(),h=Math.abs(1-o*o),u,d,f,g;if(h>0)if(u=o*c-a,d=o*a-c,g=r*h,u>=0)if(d>=-g)if(d<=g){let x=1/h;u*=x,d*=x,f=u*(u+o*d+2*a)+d*(o*u+d+2*c)+l}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+l;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+l;else d<=-g?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l):d<=g?(u=0,d=Math.min(Math.max(-r,-c),r),f=d*(d+2*c)+l):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(yl).addScaledVector(Xo,d),f}intersectSphere(e,t){ui.subVectors(e.center,this.origin);let n=ui.dot(this.direction),i=ui.dot(ui)-n*n,r=e.radius*e.radius;if(i>r)return null;let o=Math.sqrt(r-i),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,o,a,c,l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return l>=0?(n=(e.min.x-d.x)*l,i=(e.max.x-d.x)*l):(n=(e.max.x-d.x)*l,i=(e.min.x-d.x)*l),h>=0?(r=(e.min.y-d.y)*h,o=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,o=(e.min.y-d.y)*h),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),u>=0?(a=(e.min.z-d.z)*u,c=(e.max.z-d.z)*u):(a=(e.max.z-d.z)*u,c=(e.min.z-d.z)*u),n>c||a>i)||((a>n||n!==n)&&(n=a),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,ui)!==null}intersectTriangle(e,t,n,i,r){vl.subVectors(t,e),qo.subVectors(n,e),_l.crossVectors(vl,qo);let o=this.direction.dot(_l),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Pi.subVectors(this.origin,e);let c=a*this.direction.dot(qo.crossVectors(Pi,qo));if(c<0)return null;let l=a*this.direction.dot(vl.cross(Pi));if(l<0||c+l>o)return null;let h=-a*Pi.dot(_l);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Fe=class s{constructor(e,t,n,i,r,o,a,c,l,h,u,d,f,g,x,m){s.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,c,l,h,u,d,f,g,x,m)}set(e,t,n,i,r,o,a,c,l,h,u,d,f,g,x,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=r,p[5]=o,p[9]=a,p[13]=c,p[2]=l,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=g,p[11]=x,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new s().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,i=1/Ls.setFromMatrixColumn(e,0).length(),r=1/Ls.setFromMatrixColumn(e,1).length(),o=1/Ls.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,i=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(i),l=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let d=o*h,f=o*u,g=a*h,x=a*u;t[0]=c*h,t[4]=-c*u,t[8]=l,t[1]=f+g*l,t[5]=d-x*l,t[9]=-a*c,t[2]=x-d*l,t[6]=g+f*l,t[10]=o*c}else if(e.order==="YXZ"){let d=c*h,f=c*u,g=l*h,x=l*u;t[0]=d+x*a,t[4]=g*a-f,t[8]=o*l,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=x+d*a,t[10]=o*c}else if(e.order==="ZXY"){let d=c*h,f=c*u,g=l*h,x=l*u;t[0]=d-x*a,t[4]=-o*u,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=x-d*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){let d=o*h,f=o*u,g=a*h,x=a*u;t[0]=c*h,t[4]=g*l-f,t[8]=d*l+x,t[1]=c*u,t[5]=x*l+d,t[9]=f*l-g,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){let d=o*c,f=o*l,g=a*c,x=a*l;t[0]=c*h,t[4]=x-d*u,t[8]=g*u+f,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-l*h,t[6]=f*u+g,t[10]=d-x*u}else if(e.order==="XZY"){let d=o*c,f=o*l,g=a*c,x=a*l;t[0]=c*h,t[4]=-u,t[8]=l*h,t[1]=d*u+x,t[5]=o*h,t[9]=f*u-g,t[2]=g*u-f,t[6]=a*h,t[10]=x*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Yp,e,Zp)}lookAt(e,t,n){let i=this.elements;return vn.subVectors(e,t),vn.lengthSq()===0&&(vn.z=1),vn.normalize(),Li.crossVectors(n,vn),Li.lengthSq()===0&&(Math.abs(n.z)===1?vn.x+=1e-4:vn.z+=1e-4,vn.normalize(),Li.crossVectors(n,vn)),Li.normalize(),Yo.crossVectors(vn,Li),i[0]=Li.x,i[4]=Yo.x,i[8]=vn.x,i[1]=Li.y,i[5]=Yo.y,i[9]=vn.y,i[2]=Li.z,i[6]=Yo.z,i[10]=vn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],h=n[1],u=n[5],d=n[9],f=n[13],g=n[2],x=n[6],m=n[10],p=n[14],v=n[3],b=n[7],y=n[11],A=n[15],R=i[0],C=i[4],T=i[8],M=i[12],_=i[1],P=i[5],U=i[9],z=i[13],N=i[2],B=i[6],I=i[10],H=i[14],G=i[3],se=i[7],ue=i[11],me=i[15];return r[0]=o*R+a*_+c*N+l*G,r[4]=o*C+a*P+c*B+l*se,r[8]=o*T+a*U+c*I+l*ue,r[12]=o*M+a*z+c*H+l*me,r[1]=h*R+u*_+d*N+f*G,r[5]=h*C+u*P+d*B+f*se,r[9]=h*T+u*U+d*I+f*ue,r[13]=h*M+u*z+d*H+f*me,r[2]=g*R+x*_+m*N+p*G,r[6]=g*C+x*P+m*B+p*se,r[10]=g*T+x*U+m*I+p*ue,r[14]=g*M+x*z+m*H+p*me,r[3]=v*R+b*_+y*N+A*G,r[7]=v*C+b*P+y*B+A*se,r[11]=v*T+b*U+y*I+A*ue,r[15]=v*M+b*z+y*H+A*me,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],h=e[2],u=e[6],d=e[10],f=e[14],g=e[3],x=e[7],m=e[11],p=e[15];return g*(+r*c*u-i*l*u-r*a*d+n*l*d+i*a*f-n*c*f)+x*(+t*c*f-t*l*d+r*o*d-i*o*f+i*l*h-r*c*h)+m*(+t*l*u-t*a*f-r*o*u+n*o*f+r*a*h-n*l*h)+p*(-i*a*h-t*c*u+t*a*d+i*o*u-n*o*d+n*c*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8],u=e[9],d=e[10],f=e[11],g=e[12],x=e[13],m=e[14],p=e[15],v=u*m*l-x*d*l+x*c*f-a*m*f-u*c*p+a*d*p,b=g*d*l-h*m*l-g*c*f+o*m*f+h*c*p-o*d*p,y=h*x*l-g*u*l+g*a*f-o*x*f-h*a*p+o*u*p,A=g*u*c-h*x*c-g*a*d+o*x*d+h*a*m-o*u*m,R=t*v+n*b+i*y+r*A;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let C=1/R;return e[0]=v*C,e[1]=(x*d*r-u*m*r-x*i*f+n*m*f+u*i*p-n*d*p)*C,e[2]=(a*m*r-x*c*r+x*i*l-n*m*l-a*i*p+n*c*p)*C,e[3]=(u*c*r-a*d*r-u*i*l+n*d*l+a*i*f-n*c*f)*C,e[4]=b*C,e[5]=(h*m*r-g*d*r+g*i*f-t*m*f-h*i*p+t*d*p)*C,e[6]=(g*c*r-o*m*r-g*i*l+t*m*l+o*i*p-t*c*p)*C,e[7]=(o*d*r-h*c*r+h*i*l-t*d*l-o*i*f+t*c*f)*C,e[8]=y*C,e[9]=(g*u*r-h*x*r-g*n*f+t*x*f+h*n*p-t*u*p)*C,e[10]=(o*x*r-g*a*r+g*n*l-t*x*l-o*n*p+t*a*p)*C,e[11]=(h*a*r-o*u*r-h*n*l+t*u*l+o*n*f-t*a*f)*C,e[12]=A*C,e[13]=(h*x*i-g*u*i+g*n*d-t*x*d-h*n*m+t*u*m)*C,e[14]=(g*a*i-o*x*i-g*n*c+t*x*c+o*n*m-t*a*m)*C,e[15]=(o*u*i-h*a*i+h*n*c-t*u*c-o*n*d+t*a*d)*C,this}scale(e){let t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),r=1-n,o=e.x,a=e.y,c=e.z,l=r*o,h=r*a;return this.set(l*o+n,l*a-i*c,l*c+i*a,0,l*a+i*c,h*a+n,h*c-i*o,0,l*c-i*a,h*c+i*o,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,o){return this.set(1,n,r,0,e,1,o,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,h=o+o,u=a+a,d=r*l,f=r*h,g=r*u,x=o*h,m=o*u,p=a*u,v=c*l,b=c*h,y=c*u,A=n.x,R=n.y,C=n.z;return i[0]=(1-(x+p))*A,i[1]=(f+y)*A,i[2]=(g-b)*A,i[3]=0,i[4]=(f-y)*R,i[5]=(1-(d+p))*R,i[6]=(m+v)*R,i[7]=0,i[8]=(g+b)*C,i[9]=(m-v)*C,i[10]=(1-(d+x))*C,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements,r=Ls.set(i[0],i[1],i[2]).length(),o=Ls.set(i[4],i[5],i[6]).length(),a=Ls.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),e.x=i[12],e.y=i[13],e.z=i[14],On.copy(this);let l=1/r,h=1/o,u=1/a;return On.elements[0]*=l,On.elements[1]*=l,On.elements[2]*=l,On.elements[4]*=h,On.elements[5]*=h,On.elements[6]*=h,On.elements[8]*=u,On.elements[9]*=u,On.elements[10]*=u,t.setFromRotationMatrix(On),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,i,r,o,a=Vn,c=!1){let l=this.elements,h=2*r/(t-e),u=2*r/(n-i),d=(t+e)/(t-e),f=(n+i)/(n-i),g,x;if(c)g=r/(o-r),x=o*r/(o-r);else if(a===Vn)g=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(a===zr)g=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=x,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,r,o,a=Vn,c=!1){let l=this.elements,h=2/(t-e),u=2/(n-i),d=-(t+e)/(t-e),f=-(n+i)/(n-i),g,x;if(c)g=1/(o-r),x=o/(o-r);else if(a===Vn)g=-2/(o-r),x=-(o+r)/(o-r);else if(a===zr)g=-1/(o-r),x=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=u,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=g,l[14]=x,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Ls=new w,On=new Fe,Yp=new w(0,0,0),Zp=new w(1,1,1),Li=new w,Yo=new w,vn=new w,Bu=new Fe,Ou=new kt,sn=class s{constructor(e=0,t=0,n=0,i=s.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,r=i[0],o=i[4],a=i[8],c=i[1],l=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(nt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-nt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(nt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-nt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(nt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-nt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Bu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Bu,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ou.setFromEuler(this),this.setFromQuaternion(Ou,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};sn.DEFAULT_ORDER="XYZ";var Gr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Kp=0,ku=new w,Ds=new kt,di=new Fe,Zo=new w,Sr=new w,$p=new w,Jp=new kt,zu=new w(1,0,0),Vu=new w(0,1,0),Gu=new w(0,0,1),Hu={type:"added"},jp={type:"removed"},Us={type:"childadded",child:null},bl={type:"childremoved",child:null},Qe=class s extends $n{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Kp++}),this.uuid=Cn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let e=new w,t=new sn,n=new kt,i=new w(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Fe},normalMatrix:{value:new je}}),this.matrix=new Fe,this.matrixWorld=new Fe,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Gr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ds.setFromAxisAngle(e,t),this.quaternion.multiply(Ds),this}rotateOnWorldAxis(e,t){return Ds.setFromAxisAngle(e,t),this.quaternion.premultiply(Ds),this}rotateX(e){return this.rotateOnAxis(zu,e)}rotateY(e){return this.rotateOnAxis(Vu,e)}rotateZ(e){return this.rotateOnAxis(Gu,e)}translateOnAxis(e,t){return ku.copy(e).applyQuaternion(this.quaternion),this.position.add(ku.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(zu,e)}translateY(e){return this.translateOnAxis(Vu,e)}translateZ(e){return this.translateOnAxis(Gu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(di.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Zo.copy(e):Zo.set(e,t,n);let i=this.parent;this.updateWorldMatrix(!0,!1),Sr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?di.lookAt(Sr,Zo,this.up):di.lookAt(Zo,Sr,this.up),this.quaternion.setFromRotationMatrix(di),i&&(di.extractRotation(i.matrixWorld),Ds.setFromRotationMatrix(di),this.quaternion.premultiply(Ds.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Hu),Us.child=e,this.dispatchEvent(Us),Us.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(jp),bl.child=e,this.dispatchEvent(bl),bl.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),di.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),di.multiply(e.parent.matrixWorld)),e.applyMatrix4(di),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Hu),Us.child=e,this.dispatchEvent(Us),Us.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Sr,e,$p),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Sr,Jp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(a=>({...a})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let u=c[l];r(e.shapes,u)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));i.material=a}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];i.animations.push(r(e.animations,c))}}if(t){let a=o(e.geometries),c=o(e.materials),l=o(e.textures),h=o(e.images),u=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){let c=[];for(let l in a){let h=a[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}};Qe.DEFAULT_UP=new w(0,1,0);Qe.DEFAULT_MATRIX_AUTO_UPDATE=!0;Qe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var kn=new w,fi=new w,Ml=new w,pi=new w,Ns=new w,Fs=new w,Wu=new w,Tl=new w,Sl=new w,wl=new w,Al=new ft,El=new ft,Rl=new ft,gi=class s{constructor(e=new w,t=new w,n=new w){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),kn.subVectors(e,t),i.cross(kn);let r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){kn.subVectors(i,t),fi.subVectors(n,t),Ml.subVectors(e,t);let o=kn.dot(kn),a=kn.dot(fi),c=kn.dot(Ml),l=fi.dot(fi),h=fi.dot(Ml),u=o*l-a*a;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(l*c-a*h)*d,g=(o*h-a*c)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,pi)===null?!1:pi.x>=0&&pi.y>=0&&pi.x+pi.y<=1}static getInterpolation(e,t,n,i,r,o,a,c){return this.getBarycoord(e,t,n,i,pi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,pi.x),c.addScaledVector(o,pi.y),c.addScaledVector(a,pi.z),c)}static getInterpolatedAttribute(e,t,n,i,r,o){return Al.setScalar(0),El.setScalar(0),Rl.setScalar(0),Al.fromBufferAttribute(e,t),El.fromBufferAttribute(e,n),Rl.fromBufferAttribute(e,i),o.setScalar(0),o.addScaledVector(Al,r.x),o.addScaledVector(El,r.y),o.addScaledVector(Rl,r.z),o}static isFrontFacing(e,t,n,i){return kn.subVectors(n,t),fi.subVectors(e,t),kn.cross(fi).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return kn.subVectors(this.c,this.b),fi.subVectors(this.a,this.b),kn.cross(fi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return s.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return s.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return s.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return s.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return s.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,r=this.c,o,a;Ns.subVectors(i,n),Fs.subVectors(r,n),Tl.subVectors(e,n);let c=Ns.dot(Tl),l=Fs.dot(Tl);if(c<=0&&l<=0)return t.copy(n);Sl.subVectors(e,i);let h=Ns.dot(Sl),u=Fs.dot(Sl);if(h>=0&&u<=h)return t.copy(i);let d=c*u-h*l;if(d<=0&&c>=0&&h<=0)return o=c/(c-h),t.copy(n).addScaledVector(Ns,o);wl.subVectors(e,r);let f=Ns.dot(wl),g=Fs.dot(wl);if(g>=0&&f<=g)return t.copy(r);let x=f*l-c*g;if(x<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(n).addScaledVector(Fs,a);let m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return Wu.subVectors(r,i),a=(u-h)/(u-h+(f-g)),t.copy(i).addScaledVector(Wu,a);let p=1/(m+x+d);return o=x*p,a=d*p,t.copy(n).addScaledVector(Ns,o).addScaledVector(Fs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},df={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Di={h:0,s:0,l:0},Ko={h:0,s:0,l:0};function Cl(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}var Ae=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=It){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,lt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=lt.workingColorSpace){return this.r=e,this.g=t,this.b=n,lt.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=lt.workingColorSpace){if(e=yh(e,1),t=nt(t,0,1),n=nt(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Cl(o,r,e+1/3),this.g=Cl(o,r,e),this.b=Cl(o,r,e-1/3)}return lt.colorSpaceToWorking(this,i),this}setStyle(e,t=It){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=It){let n=df[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=xi(e.r),this.g=xi(e.g),this.b=xi(e.b),this}copyLinearToSRGB(e){return this.r=qs(e.r),this.g=qs(e.g),this.b=qs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=It){return lt.workingToColorSpace(jt.copy(this),e),Math.round(nt(jt.r*255,0,255))*65536+Math.round(nt(jt.g*255,0,255))*256+Math.round(nt(jt.b*255,0,255))}getHexString(e=It){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=lt.workingColorSpace){lt.workingToColorSpace(jt.copy(this),t);let n=jt.r,i=jt.g,r=jt.b,o=Math.max(n,i,r),a=Math.min(n,i,r),c,l,h=(a+o)/2;if(a===o)c=0,l=0;else{let u=o-a;switch(l=h<=.5?u/(o+a):u/(2-o-a),o){case n:c=(i-r)/u+(i<r?6:0);break;case i:c=(r-n)/u+2;break;case r:c=(n-i)/u+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=lt.workingColorSpace){return lt.workingToColorSpace(jt.copy(this),t),e.r=jt.r,e.g=jt.g,e.b=jt.b,e}getStyle(e=It){lt.workingToColorSpace(jt.copy(this),e);let t=jt.r,n=jt.g,i=jt.b;return e!==It?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Di),this.setHSL(Di.h+e,Di.s+t,Di.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Di),e.getHSL(Ko);let n=Nr(Di.h,Ko.h,t),i=Nr(Di.s,Ko.s,t),r=Nr(Di.l,Ko.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},jt=new Ae;Ae.NAMES=df;var Qp=0,rn=class extends $n{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Qp++}),this.uuid=Cn(),this.name="",this.type="Material",this.blending=yi,this.side=bn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=va,this.blendDst=_a,this.blendEquation=Ni,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ae(0,0,0),this.blendAlpha=0,this.depthFunc=es,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Wl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=$i,this.stencilZFail=$i,this.stencilZPass=$i,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==yi&&(n.blending=this.blending),this.side!==bn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==va&&(n.blendSrc=this.blendSrc),this.blendDst!==_a&&(n.blendDst=this.blendDst),this.blendEquation!==Ni&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==es&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Wl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==$i&&(n.stencilFail=this.stencilFail),this.stencilZFail!==$i&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==$i&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){let o=[];for(let a in r){let c=r[a];delete c.metadata,o.push(c)}return o}if(t){let r=i(e.textures),o=i(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Ge=class extends rn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ae(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.combine=rh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Ot=new w,$o=new ne,em=0,Tt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:em++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=ba,this.updateRanges=[],this.gpuType=Dn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)$o.fromBufferAttribute(this,t),$o.applyMatrix3(e),this.setXY(t,$o.x,$o.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.applyMatrix3(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.applyMatrix4(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.applyNormalMatrix(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.transformDirection(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=zn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=yt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=zn(t,this.array)),t}setX(e,t){return this.normalized&&(t=yt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=zn(t,this.array)),t}setY(e,t){return this.normalized&&(t=yt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=zn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=yt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=zn(t,this.array)),t}setW(e,t){return this.normalized&&(t=yt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=yt(t,this.array),n=yt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=yt(t,this.array),n=yt(n,this.array),i=yt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=yt(t,this.array),n=yt(n,this.array),i=yt(i,this.array),r=yt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ba&&(e.usage=this.usage),e}};var Hr=class extends Tt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Wr=class extends Tt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Ze=class extends Tt{constructor(e,t,n){super(new Float32Array(e),t,n)}},tm=0,Rn=new Fe,Il=new Qe,Bs=new w,_n=new Ft,wr=new Ft,Xt=new w,mt=class s extends $n{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:tm++}),this.uuid=Cn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(vh(e)?Wr:Hr)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new je().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Rn.makeRotationFromQuaternion(e),this.applyMatrix4(Rn),this}rotateX(e){return Rn.makeRotationX(e),this.applyMatrix4(Rn),this}rotateY(e){return Rn.makeRotationY(e),this.applyMatrix4(Rn),this}rotateZ(e){return Rn.makeRotationZ(e),this.applyMatrix4(Rn),this}translate(e,t,n){return Rn.makeTranslation(e,t,n),this.applyMatrix4(Rn),this}scale(e,t,n){return Rn.makeScale(e,t,n),this.applyMatrix4(Rn),this}lookAt(e){return Il.lookAt(e),Il.updateMatrix(),this.applyMatrix4(Il.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Bs).negate(),this.translate(Bs.x,Bs.y,Bs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let i=0,r=e.length;i<r;i++){let o=e[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Ze(n,3))}else{let n=Math.min(e.length,t.count);for(let i=0;i<n;i++){let r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ft);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new w(-1/0,-1/0,-1/0),new w(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let r=t[n];_n.setFromBufferAttribute(r),this.morphTargetsRelative?(Xt.addVectors(this.boundingBox.min,_n.min),this.boundingBox.expandByPoint(Xt),Xt.addVectors(this.boundingBox.max,_n.max),this.boundingBox.expandByPoint(Xt)):(this.boundingBox.expandByPoint(_n.min),this.boundingBox.expandByPoint(_n.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new dn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new w,1/0);return}if(e){let n=this.boundingSphere.center;if(_n.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];wr.setFromBufferAttribute(a),this.morphTargetsRelative?(Xt.addVectors(_n.min,wr.min),_n.expandByPoint(Xt),Xt.addVectors(_n.max,wr.max),_n.expandByPoint(Xt)):(_n.expandByPoint(wr.min),_n.expandByPoint(wr.max))}_n.getCenter(n);let i=0;for(let r=0,o=e.count;r<o;r++)Xt.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(Xt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)Xt.fromBufferAttribute(a,l),c&&(Bs.fromBufferAttribute(e,l),Xt.add(Bs)),i=Math.max(i,n.distanceToSquared(Xt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,i=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Tt(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],c=[];for(let T=0;T<n.count;T++)a[T]=new w,c[T]=new w;let l=new w,h=new w,u=new w,d=new ne,f=new ne,g=new ne,x=new w,m=new w;function p(T,M,_){l.fromBufferAttribute(n,T),h.fromBufferAttribute(n,M),u.fromBufferAttribute(n,_),d.fromBufferAttribute(r,T),f.fromBufferAttribute(r,M),g.fromBufferAttribute(r,_),h.sub(l),u.sub(l),f.sub(d),g.sub(d);let P=1/(f.x*g.y-g.x*f.y);isFinite(P)&&(x.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(P),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(P),a[T].add(x),a[M].add(x),a[_].add(x),c[T].add(m),c[M].add(m),c[_].add(m))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let T=0,M=v.length;T<M;++T){let _=v[T],P=_.start,U=_.count;for(let z=P,N=P+U;z<N;z+=3)p(e.getX(z+0),e.getX(z+1),e.getX(z+2))}let b=new w,y=new w,A=new w,R=new w;function C(T){A.fromBufferAttribute(i,T),R.copy(A);let M=a[T];b.copy(M),b.sub(A.multiplyScalar(A.dot(M))).normalize(),y.crossVectors(R,M);let P=y.dot(c[T])<0?-1:1;o.setXYZW(T,b.x,b.y,b.z,P)}for(let T=0,M=v.length;T<M;++T){let _=v[T],P=_.start,U=_.count;for(let z=P,N=P+U;z<N;z+=3)C(e.getX(z+0)),C(e.getX(z+1)),C(e.getX(z+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Tt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let i=new w,r=new w,o=new w,a=new w,c=new w,l=new w,h=new w,u=new w;if(e)for(let d=0,f=e.count;d<f;d+=3){let g=e.getX(d+0),x=e.getX(d+1),m=e.getX(d+2);i.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),a.fromBufferAttribute(n,g),c.fromBufferAttribute(n,x),l.fromBufferAttribute(n,m),a.add(h),c.add(h),l.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(x,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let d=0,f=t.count;d<f;d+=3)i.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Xt.fromBufferAttribute(e,t),Xt.normalize(),e.setXYZ(t,Xt.x,Xt.y,Xt.z)}toNonIndexed(){function e(a,c){let l=a.array,h=a.itemSize,u=a.normalized,d=new l.constructor(c.length*h),f=0,g=0;for(let x=0,m=c.length;x<m;x++){a.isInterleavedBufferAttribute?f=c[x]*a.data.stride+a.offset:f=c[x]*h;for(let p=0;p<h;p++)d[g++]=l[f++]}return new Tt(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new s,n=this.index.array,i=this.attributes;for(let a in i){let c=i[a],l=e(c,n);t.setAttribute(a,l)}let r=this.morphAttributes;for(let a in r){let c=[],l=r[a];for(let h=0,u=l.length;h<u;h++){let d=l[h],f=e(d,n);c.push(f)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let l=n[c];e.data.attributes[c]=l.toJSON(e.data)}let i={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let u=0,d=l.length;u<d;u++){let f=l[u];h.push(f.toJSON(e.data))}h.length>0&&(i[c]=h,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let i=e.attributes;for(let l in i){let h=i[l];this.setAttribute(l,h.clone(t))}let r=e.morphAttributes;for(let l in r){let h=[],u=r[l];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let l=0,h=o.length;l<h;l++){let u=o[l];this.addGroup(u.start,u.count,u.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Xu=new Fe,Zi=new ss,Jo=new dn,qu=new w,jo=new w,Qo=new w,ea=new w,Pl=new w,ta=new w,Yu=new w,na=new w,We=class extends Qe{constructor(e=new mt,t=new Ge){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let a=this.morphTargetInfluences;if(r&&a){ta.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let h=a[c],u=r[c];h!==0&&(Pl.fromBufferAttribute(u,e),o?ta.addScaledVector(Pl,h):ta.addScaledVector(Pl.sub(t),h))}t.add(ta)}return t}raycast(e,t){let n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Jo.copy(n.boundingSphere),Jo.applyMatrix4(r),Zi.copy(e.ray).recast(e.near),!(Jo.containsPoint(Zi.origin)===!1&&(Zi.intersectSphere(Jo,qu)===null||Zi.origin.distanceToSquared(qu)>(e.far-e.near)**2))&&(Xu.copy(r).invert(),Zi.copy(e.ray).applyMatrix4(Xu),!(n.boundingBox!==null&&Zi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Zi)))}_computeIntersections(e,t,n){let i,r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=d.length;g<x;g++){let m=d[g],p=o[m.materialIndex],v=Math.max(m.start,f.start),b=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let y=v,A=b;y<A;y+=3){let R=a.getX(y),C=a.getX(y+1),T=a.getX(y+2);i=ia(this,p,e,n,l,h,u,R,C,T),i&&(i.faceIndex=Math.floor(y/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{let g=Math.max(0,f.start),x=Math.min(a.count,f.start+f.count);for(let m=g,p=x;m<p;m+=3){let v=a.getX(m),b=a.getX(m+1),y=a.getX(m+2);i=ia(this,o,e,n,l,h,u,v,b,y),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,x=d.length;g<x;g++){let m=d[g],p=o[m.materialIndex],v=Math.max(m.start,f.start),b=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let y=v,A=b;y<A;y+=3){let R=y,C=y+1,T=y+2;i=ia(this,p,e,n,l,h,u,R,C,T),i&&(i.faceIndex=Math.floor(y/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{let g=Math.max(0,f.start),x=Math.min(c.count,f.start+f.count);for(let m=g,p=x;m<p;m+=3){let v=m,b=m+1,y=m+2;i=ia(this,o,e,n,l,h,u,v,b,y),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}}};function nm(s,e,t,n,i,r,o,a){let c;if(e.side===on?c=n.intersectTriangle(o,r,i,!0,a):c=n.intersectTriangle(i,r,o,e.side===bn,a),c===null)return null;na.copy(a),na.applyMatrix4(s.matrixWorld);let l=t.ray.origin.distanceTo(na);return l<t.near||l>t.far?null:{distance:l,point:na.clone(),object:s}}function ia(s,e,t,n,i,r,o,a,c,l){s.getVertexPosition(a,jo),s.getVertexPosition(c,Qo),s.getVertexPosition(l,ea);let h=nm(s,e,t,n,jo,Qo,ea,Yu);if(h){let u=new w;gi.getBarycoord(Yu,jo,Qo,ea,u),i&&(h.uv=gi.getInterpolatedAttribute(i,a,c,l,u,new ne)),r&&(h.uv1=gi.getInterpolatedAttribute(r,a,c,l,u,new ne)),o&&(h.normal=gi.getInterpolatedAttribute(o,a,c,l,u,new w),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:c,c:l,normal:new w,materialIndex:0};gi.getNormal(jo,Qo,ea,d.normal),h.face=d,h.barycoord=u}return h}var Ue=class s extends mt{constructor(e=1,t=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};let a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);let c=[],l=[],h=[],u=[],d=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,i,o,2),g("x","z","y",1,-1,e,n,-t,i,o,3),g("x","y","z",1,-1,e,t,n,i,r,4),g("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(c),this.setAttribute("position",new Ze(l,3)),this.setAttribute("normal",new Ze(h,3)),this.setAttribute("uv",new Ze(u,2));function g(x,m,p,v,b,y,A,R,C,T,M){let _=y/C,P=A/T,U=y/2,z=A/2,N=R/2,B=C+1,I=T+1,H=0,G=0,se=new w;for(let ue=0;ue<I;ue++){let me=ue*P-z;for(let Be=0;Be<B;Be++){let Ye=Be*_-U;se[x]=Ye*v,se[m]=me*b,se[p]=N,l.push(se.x,se.y,se.z),se[x]=0,se[m]=0,se[p]=R>0?1:-1,h.push(se.x,se.y,se.z),u.push(Be/C),u.push(1-ue/T),H+=1}}for(let ue=0;ue<T;ue++)for(let me=0;me<C;me++){let Be=d+me+B*ue,Ye=d+me+B*(ue+1),ut=d+(me+1)+B*(ue+1),Se=d+(me+1)+B*ue;c.push(Be,Ye,Se),c.push(Ye,ut,Se),G+=6}a.addGroup(f,G,M),f+=G,d+=H}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function xs(s){let e={};for(let t in s){e[t]={};for(let n in s[t]){let i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function Qt(s){let e={};for(let t=0;t<s.length;t++){let n=xs(s[t]);for(let i in n)e[i]=n[i]}return e}function im(s){let e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function _h(s){let e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:lt.workingColorSpace}var ff={clone:xs,merge:Qt},sm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,rm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Zt=class extends rn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=sm,this.fragmentShader=rm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=xs(e.uniforms),this.uniformsGroups=im(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:"m4",value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Xr=class extends Qe{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Fe,this.projectionMatrix=new Fe,this.projectionMatrixInverse=new Fe,this.coordinateSystem=Vn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Ui=new w,Zu=new ne,Ku=new ne,Nt=class extends Xr{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=is*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ur*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return is*2*Math.atan(Math.tan(Ur*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ui.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ui.x,Ui.y).multiplyScalar(-e/Ui.z),Ui.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ui.x,Ui.y).multiplyScalar(-e/Ui.z)}getViewSize(e,t){return this.getViewBounds(e,Zu,Ku),t.subVectors(Ku,Zu)}setViewOffset(e,t,n,i,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ur*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*i/c,t-=o.offsetY*n/l,i*=o.width/c,n*=o.height/l}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Os=-90,ks=1,wa=class extends Qe{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new Nt(Os,ks,e,t);i.layers=this.layers,this.add(i);let r=new Nt(Os,ks,e,t);r.layers=this.layers,this.add(r);let o=new Nt(Os,ks,e,t);o.layers=this.layers,this.add(o);let a=new Nt(Os,ks,e,t);a.layers=this.layers,this.add(a);let c=new Nt(Os,ks,e,t);c.layers=this.layers,this.add(c);let l=new Nt(Os,ks,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,i,r,o,a,c]=t;for(let l of t)this.remove(l);if(e===Vn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===zr)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,c,l,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,r),e.setRenderTarget(n,1,i),e.render(t,o),e.setRenderTarget(n,2,i),e.render(t,a),e.setRenderTarget(n,3,i),e.render(t,c),e.setRenderTarget(n,4,i),e.render(t,l),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},qr=class extends zt{constructor(e=[],t=ps,n,i,r,o,a,c,l,h){super(e,t,n,i,r,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Aa=class extends Jn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new qr(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Ue(5,5,5),r=new Zt({name:"CubemapFromEquirect",uniforms:xs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:on,blending:wi});r.uniforms.tEquirect.value=t;let o=new We(i,r),a=t.minFilter;return t.minFilter===Tn&&(t.minFilter=nn),new wa(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(r)}},Je=class extends Qe{constructor(){super(),this.isGroup=!0,this.type="Group"}},om={type:"move"},js=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Je,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Je,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new w,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new w),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Je,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new w,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new w),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,n),p=this._getHandJoint(l,x);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;l.inputState.pinching&&d>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(om)))}return a!==null&&(a.visible=i!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Je;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}};var Yr=class s{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ae(e),this.near=t,this.far=n}clone(){return new s(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Zr=class extends Qe{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new sn,this.environmentIntensity=1,this.environmentRotation=new sn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},rs=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=ba,this.updateRanges=[],this.version=0,this.uuid=Cn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Cn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Cn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},tn=new w,Fi=class s{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)tn.fromBufferAttribute(this,t),tn.applyMatrix4(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)tn.fromBufferAttribute(this,t),tn.applyNormalMatrix(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)tn.fromBufferAttribute(this,t),tn.transformDirection(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=zn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=yt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=yt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=yt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=yt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=yt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=zn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=zn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=zn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=zn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=yt(t,this.array),n=yt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=yt(t,this.array),n=yt(n,this.array),i=yt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=yt(t,this.array),n=yt(n,this.array),i=yt(i,this.array),r=yt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new Tt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new s(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Qs=class extends rn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ae(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},zs,Ar=new w,Vs=new w,Gs=new w,Hs=new ne,Er=new ne,pf=new Fe,sa=new w,Rr=new w,ra=new w,$u=new ne,Ll=new ne,Ju=new ne,Kr=class extends Qe{constructor(e=new Qs){if(super(),this.isSprite=!0,this.type="Sprite",zs===void 0){zs=new mt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new rs(t,5);zs.setIndex([0,1,2,0,2,3]),zs.setAttribute("position",new Fi(n,3,0,!1)),zs.setAttribute("uv",new Fi(n,2,3,!1))}this.geometry=zs,this.material=e,this.center=new ne(.5,.5),this.count=1}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Vs.setFromMatrixScale(this.matrixWorld),pf.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Gs.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Vs.multiplyScalar(-Gs.z);let n=this.material.rotation,i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));let o=this.center;oa(sa.set(-.5,-.5,0),Gs,o,Vs,i,r),oa(Rr.set(.5,-.5,0),Gs,o,Vs,i,r),oa(ra.set(.5,.5,0),Gs,o,Vs,i,r),$u.set(0,0),Ll.set(1,0),Ju.set(1,1);let a=e.ray.intersectTriangle(sa,Rr,ra,!1,Ar);if(a===null&&(oa(Rr.set(-.5,.5,0),Gs,o,Vs,i,r),Ll.set(0,1),a=e.ray.intersectTriangle(sa,ra,Rr,!1,Ar),a===null))return;let c=e.ray.origin.distanceTo(Ar);c<e.near||c>e.far||t.push({distance:c,point:Ar.clone(),uv:gi.getInterpolation(Ar,sa,Rr,ra,$u,Ll,Ju,new ne),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function oa(s,e,t,n,i,r){Hs.subVectors(s,t).addScalar(.5).multiply(n),i!==void 0?(Er.x=r*Hs.x-i*Hs.y,Er.y=i*Hs.x+r*Hs.y):Er.copy(Hs),s.copy(e),s.x+=Er.x,s.y+=Er.y,s.applyMatrix4(pf)}var ju=new w,Qu=new ft,ed=new ft,am=new w,td=new Fe,aa=new w,Dl=new dn,nd=new Fe,Ul=new ss,$r=class extends We{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Hl,this.bindMatrix=new Fe,this.bindMatrixInverse=new Fe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Ft),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,aa),this.boundingBox.expandByPoint(aa)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new dn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,aa),this.boundingSphere.expandByPoint(aa)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Dl.copy(this.boundingSphere),Dl.applyMatrix4(i),e.ray.intersectsSphere(Dl)!==!1&&(nd.copy(i).invert(),Ul.copy(e.ray).applyMatrix4(nd),!(this.boundingBox!==null&&Ul.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Ul)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new ft,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Hl?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Zd?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,i=this.geometry;Qu.fromBufferAttribute(i.attributes.skinIndex,e),ed.fromBufferAttribute(i.attributes.skinWeight,e),ju.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){let o=ed.getComponent(r);if(o!==0){let a=Qu.getComponent(r);td.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(am.copy(ju).applyMatrix4(td),o)}}return t.applyMatrix4(this.bindMatrixInverse)}},er=class extends Qe{constructor(){super(),this.isBone=!0,this.type="Bone"}},os=class extends zt{constructor(e=null,t=1,n=1,i,r,o,a,c,l=qt,h=qt,u,d){super(null,o,a,c,l,h,i,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},id=new Fe,cm=new Fe,Jr=class s{constructor(e=[],t=[]){this.uuid=Cn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Fe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new Fe;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:cm;id.multiplyMatrices(a,t[r]),id.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new s(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new os(t,e,e,Sn,Dn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){let r=e.bones[n],o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new er),this.bones.push(o),this.boneInverses.push(new Fe().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){let o=t[i];e.bones.push(o.uuid);let a=n[i];e.boneInverses.push(a.toArray())}return e}},Gn=class extends Tt{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ws=new Fe,sd=new Fe,ca=[],rd=new Ft,lm=new Fe,Cr=new We,Ir=new dn,Vt=class extends We{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Gn(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,lm)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Ft),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ws),rd.copy(e.boundingBox).applyMatrix4(Ws),this.boundingBox.union(rd)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new dn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ws),Ir.copy(e.boundingSphere).applyMatrix4(Ws),this.boundingSphere.union(Ir)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(e,t){let n=this.matrixWorld,i=this.count;if(Cr.geometry=this.geometry,Cr.material=this.material,Cr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ir.copy(this.boundingSphere),Ir.applyMatrix4(n),e.ray.intersectsSphere(Ir)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Ws),sd.multiplyMatrices(n,Ws),Cr.matrixWorld=sd,Cr.raycast(e,ca);for(let o=0,a=ca.length;o<a;o++){let c=ca[o];c.instanceId=r,c.object=this,t.push(c)}ca.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Gn(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new os(new Float32Array(i*this.count),i,this.count,oc,Dn));let r=this.morphTexture.source.data.data,o=0;for(let l=0;l<n.length;l++)o+=n[l];let a=this.geometry.morphTargetsRelative?1:1-o,c=i*e;r[c]=a,r.set(n,c+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Nl=new w,hm=new w,um=new je,qn=class{constructor(e=new w(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=Nl.subVectors(n,t).cross(hm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Nl),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||um.getNormalMatrix(e),i=this.coplanarPoint(Nl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Ki=new dn,dm=new ne(.5,.5),la=new w,tr=class{constructor(e=new qn,t=new qn,n=new qn,i=new qn,r=new qn,o=new qn){this.planes=[e,t,n,i,r,o]}set(e,t,n,i,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Vn,n=!1){let i=this.planes,r=e.elements,o=r[0],a=r[1],c=r[2],l=r[3],h=r[4],u=r[5],d=r[6],f=r[7],g=r[8],x=r[9],m=r[10],p=r[11],v=r[12],b=r[13],y=r[14],A=r[15];if(i[0].setComponents(l-o,f-h,p-g,A-v).normalize(),i[1].setComponents(l+o,f+h,p+g,A+v).normalize(),i[2].setComponents(l+a,f+u,p+x,A+b).normalize(),i[3].setComponents(l-a,f-u,p-x,A-b).normalize(),n)i[4].setComponents(c,d,m,y).normalize(),i[5].setComponents(l-c,f-d,p-m,A-y).normalize();else if(i[4].setComponents(l-c,f-d,p-m,A-y).normalize(),t===Vn)i[5].setComponents(l+c,f+d,p+m,A+y).normalize();else if(t===zr)i[5].setComponents(c,d,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ki.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ki.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ki)}intersectsSprite(e){Ki.center.set(0,0,0);let t=dm.distanceTo(e.center);return Ki.radius=.7071067811865476+t,Ki.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ki)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(la.x=i.normal.x>0?e.max.x:e.min.x,la.y=i.normal.y>0?e.max.y:e.min.y,la.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(la)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var vi=class extends rn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ae(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Ea=new w,Ra=new w,od=new Fe,Pr=new ss,ha=new dn,Fl=new w,ad=new w,as=class extends Qe{constructor(e=new mt,t=new vi){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)Ea.fromBufferAttribute(t,i-1),Ra.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Ea.distanceTo(Ra);e.setAttribute("lineDistance",new Ze(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ha.copy(n.boundingSphere),ha.applyMatrix4(i),ha.radius+=r,e.ray.intersectsSphere(ha)===!1)return;od.copy(i).invert(),Pr.copy(e.ray).applyMatrix4(od);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){let f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let x=f,m=g-1;x<m;x+=l){let p=h.getX(x),v=h.getX(x+1),b=ua(this,e,Pr,c,p,v,x);b&&t.push(b)}if(this.isLineLoop){let x=h.getX(g-1),m=h.getX(f),p=ua(this,e,Pr,c,x,m,g-1);p&&t.push(p)}}else{let f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let x=f,m=g-1;x<m;x+=l){let p=ua(this,e,Pr,c,x,x+1,x);p&&t.push(p)}if(this.isLineLoop){let x=ua(this,e,Pr,c,g-1,f,g-1);x&&t.push(x)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function ua(s,e,t,n,i,r,o){let a=s.geometry.attributes.position;if(Ea.fromBufferAttribute(a,i),Ra.fromBufferAttribute(a,r),t.distanceSqToSegment(Ea,Ra,Fl,ad)>n)return;Fl.applyMatrix4(s.matrixWorld);let l=e.ray.origin.distanceTo(Fl);if(!(l<e.near||l>e.far))return{distance:l,point:ad.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}var cd=new w,ld=new w,Bi=class extends as{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)cd.fromBufferAttribute(t,i),ld.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+cd.distanceTo(ld);e.setAttribute("lineDistance",new Ze(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},jr=class extends as{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},nr=class extends rn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ae(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},hd=new Fe,Xl=new ss,da=new dn,fa=new w,Qr=class extends Qe{constructor(e=new mt,t=new nr){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),da.copy(n.boundingSphere),da.applyMatrix4(i),da.radius+=r,e.ray.intersectsSphere(da)===!1)return;hd.copy(i).invert(),Xl.copy(e.ray).applyMatrix4(hd);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=n.index,u=n.attributes.position;if(l!==null){let d=Math.max(0,o.start),f=Math.min(l.count,o.start+o.count);for(let g=d,x=f;g<x;g++){let m=l.getX(g);fa.fromBufferAttribute(u,m),ud(fa,m,c,i,e,t,this)}}else{let d=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=d,x=f;g<x;g++)fa.fromBufferAttribute(u,g),ud(fa,g,c,i,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function ud(s,e,t,n,i,r,o){let a=Xl.distanceSqToPoint(s);if(a<t){let c=new w;Xl.closestPointToPoint(s,c),c.applyMatrix4(n);let l=i.ray.origin.distanceTo(c);if(l<i.near||l>i.far)return;r.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var cs=class extends zt{constructor(e,t,n,i,r,o,a,c,l){super(e,t,n,i,r,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}},eo=class extends zt{constructor(e,t,n=zi,i,r,o,a=qt,c=qt,l,h=Zs,u=1){if(h!==Zs&&h!==ur)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:u};super(d,i,r,o,a,c,h,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Js(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},to=class extends zt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},In=class s extends mt{constructor(e=1,t=1,n=4,i=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:n,radialSegments:i,heightSegments:r},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),i=Math.max(3,Math.floor(i)),r=Math.max(1,Math.floor(r));let o=[],a=[],c=[],l=[],h=t/2,u=Math.PI/2*e,d=t,f=2*u+d,g=n*2+r,x=i+1,m=new w,p=new w;for(let v=0;v<=g;v++){let b=0,y=0,A=0,R=0;if(v<=n){let M=v/n,_=M*Math.PI/2;y=-h-e*Math.cos(_),A=e*Math.sin(_),R=-e*Math.cos(_),b=M*u}else if(v<=n+r){let M=(v-n)/r;y=-h+M*t,A=e,R=0,b=u+M*d}else{let M=(v-n-r)/n,_=M*Math.PI/2;y=h+e*Math.sin(_),A=e*Math.cos(_),R=e*Math.sin(_),b=u+d+M*u}let C=Math.max(0,Math.min(1,b/f)),T=0;v===0?T=.5/i:v===g&&(T=-.5/i);for(let M=0;M<=i;M++){let _=M/i,P=_*Math.PI*2,U=Math.sin(P),z=Math.cos(P);p.x=-A*z,p.y=y,p.z=A*U,a.push(p.x,p.y,p.z),m.set(-A*z,R,A*U),m.normalize(),c.push(m.x,m.y,m.z),l.push(_+T,C)}if(v>0){let M=(v-1)*x;for(let _=0;_<i;_++){let P=M+_,U=M+_+1,z=v*x+_,N=v*x+_+1;o.push(P,U,z),o.push(U,N,z)}}}this.setIndex(o),this.setAttribute("position",new Ze(a,3)),this.setAttribute("normal",new Ze(c,3)),this.setAttribute("uv",new Ze(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}},no=class s extends mt{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);let r=[],o=[],a=[],c=[],l=new w,h=new ne;o.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let u=0,d=3;u<=t;u++,d+=3){let f=n+u/t*i;l.x=e*Math.cos(f),l.y=e*Math.sin(f),o.push(l.x,l.y,l.z),a.push(0,0,1),h.x=(o[d]/e+1)/2,h.y=(o[d+1]/e+1)/2,c.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new Ze(o,3)),this.setAttribute("normal",new Ze(a,3)),this.setAttribute("uv",new Ze(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.segments,e.thetaStart,e.thetaLength)}},qe=class s extends mt{constructor(e=1,t=1,n=1,i=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};let l=this;i=Math.floor(i),r=Math.floor(r);let h=[],u=[],d=[],f=[],g=0,x=[],m=n/2,p=0;v(),o===!1&&(e>0&&b(!0),t>0&&b(!1)),this.setIndex(h),this.setAttribute("position",new Ze(u,3)),this.setAttribute("normal",new Ze(d,3)),this.setAttribute("uv",new Ze(f,2));function v(){let y=new w,A=new w,R=0,C=(t-e)/n;for(let T=0;T<=r;T++){let M=[],_=T/r,P=_*(t-e)+e;for(let U=0;U<=i;U++){let z=U/i,N=z*c+a,B=Math.sin(N),I=Math.cos(N);A.x=P*B,A.y=-_*n+m,A.z=P*I,u.push(A.x,A.y,A.z),y.set(B,C,I).normalize(),d.push(y.x,y.y,y.z),f.push(z,1-_),M.push(g++)}x.push(M)}for(let T=0;T<i;T++)for(let M=0;M<r;M++){let _=x[M][T],P=x[M+1][T],U=x[M+1][T+1],z=x[M][T+1];(e>0||M!==0)&&(h.push(_,P,z),R+=3),(t>0||M!==r-1)&&(h.push(P,U,z),R+=3)}l.addGroup(p,R,0),p+=R}function b(y){let A=g,R=new ne,C=new w,T=0,M=y===!0?e:t,_=y===!0?1:-1;for(let U=1;U<=i;U++)u.push(0,m*_,0),d.push(0,_,0),f.push(.5,.5),g++;let P=g;for(let U=0;U<=i;U++){let N=U/i*c+a,B=Math.cos(N),I=Math.sin(N);C.x=M*I,C.y=m*_,C.z=M*B,u.push(C.x,C.y,C.z),d.push(0,_,0),R.x=B*.5+.5,R.y=I*.5*_+.5,f.push(R.x,R.y),g++}for(let U=0;U<i;U++){let z=A+U,N=P+U;y===!0?h.push(N,N+1,z):h.push(N+1,N,z),T+=3}l.addGroup(p,T,y===!0?1:2),p+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Pn=class s extends qe{constructor(e=1,t=1,n=32,i=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,i,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new s(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},io=class s extends mt{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};let r=[],o=[];a(i),l(n),h(),this.setAttribute("position",new Ze(r,3)),this.setAttribute("normal",new Ze(r.slice(),3)),this.setAttribute("uv",new Ze(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(v){let b=new w,y=new w,A=new w;for(let R=0;R<t.length;R+=3)f(t[R+0],b),f(t[R+1],y),f(t[R+2],A),c(b,y,A,v)}function c(v,b,y,A){let R=A+1,C=[];for(let T=0;T<=R;T++){C[T]=[];let M=v.clone().lerp(y,T/R),_=b.clone().lerp(y,T/R),P=R-T;for(let U=0;U<=P;U++)U===0&&T===R?C[T][U]=M:C[T][U]=M.clone().lerp(_,U/P)}for(let T=0;T<R;T++)for(let M=0;M<2*(R-T)-1;M++){let _=Math.floor(M/2);M%2===0?(d(C[T][_+1]),d(C[T+1][_]),d(C[T][_])):(d(C[T][_+1]),d(C[T+1][_+1]),d(C[T+1][_]))}}function l(v){let b=new w;for(let y=0;y<r.length;y+=3)b.x=r[y+0],b.y=r[y+1],b.z=r[y+2],b.normalize().multiplyScalar(v),r[y+0]=b.x,r[y+1]=b.y,r[y+2]=b.z}function h(){let v=new w;for(let b=0;b<r.length;b+=3){v.x=r[b+0],v.y=r[b+1],v.z=r[b+2];let y=m(v)/2/Math.PI+.5,A=p(v)/Math.PI+.5;o.push(y,1-A)}g(),u()}function u(){for(let v=0;v<o.length;v+=6){let b=o[v+0],y=o[v+2],A=o[v+4],R=Math.max(b,y,A),C=Math.min(b,y,A);R>.9&&C<.1&&(b<.2&&(o[v+0]+=1),y<.2&&(o[v+2]+=1),A<.2&&(o[v+4]+=1))}}function d(v){r.push(v.x,v.y,v.z)}function f(v,b){let y=v*3;b.x=e[y+0],b.y=e[y+1],b.z=e[y+2]}function g(){let v=new w,b=new w,y=new w,A=new w,R=new ne,C=new ne,T=new ne;for(let M=0,_=0;M<r.length;M+=9,_+=6){v.set(r[M+0],r[M+1],r[M+2]),b.set(r[M+3],r[M+4],r[M+5]),y.set(r[M+6],r[M+7],r[M+8]),R.set(o[_+0],o[_+1]),C.set(o[_+2],o[_+3]),T.set(o[_+4],o[_+5]),A.copy(v).add(b).add(y).divideScalar(3);let P=m(A);x(R,_+0,v,P),x(C,_+2,b,P),x(T,_+4,y,P)}}function x(v,b,y,A){A<0&&v.x===1&&(o[b]=v.x-1),y.x===0&&y.z===0&&(o[b]=A/2/Math.PI+.5)}function m(v){return Math.atan2(v.z,-v.x)}function p(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.vertices,e.indices,e.radius,e.details)}};var Mn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,i=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(i),t.push(r),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),i=0,r=n.length,o;t?o=t:o=e*n[r-1];let a=0,c=r-1,l;for(;a<=c;)if(i=Math.floor(a+(c-a)/2),l=n[i]-o,l<0)a=i+1;else if(l>0)c=i-1;else{c=i;break}if(i=c,n[i]===o)return i/(r-1);let h=n[i],d=n[i+1]-h,f=(o-h)/d;return(i+f)/(r-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);let o=this.getPoint(i),a=this.getPoint(r),c=t||(o.isVector2?new ne:new w);return c.copy(a).sub(o).normalize(),c}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new w,i=[],r=[],o=[],a=new w,c=new Fe;for(let f=0;f<=e;f++){let g=f/e;i[f]=this.getTangentAt(g,new w)}r[0]=new w,o[0]=new w;let l=Number.MAX_VALUE,h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=l&&(l=h,n.set(1,0,0)),u<=l&&(l=u,n.set(0,1,0)),d<=l&&n.set(0,0,1),a.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],a),o[0].crossVectors(i[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(i[f-1],i[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(nt(i[f-1].dot(i[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(a,g))}o[f].crossVectors(i[f],r[f])}if(t===!0){let f=Math.acos(nt(r[0].dot(r[e]),-1,1));f/=e,i[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(c.makeRotationAxis(i[g],f*g)),o[g].crossVectors(i[g],r[g])}return{tangents:i,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},ir=class extends Mn{constructor(e=0,t=0,n=1,i=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(e,t=new ne){let n=t,i=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(o?r=0:r=i),this.aClockwise===!0&&!o&&(r===i?r=-i:r=r-i);let a=this.aStartAngle+e*r,c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=c-this.aX,f=l-this.aY;c=d*h-f*u+this.aX,l=d*u+f*h+this.aY}return n.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Ca=class extends ir{constructor(e,t,n,i,r,o){super(e,t,n,n,i,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function bh(){let s=0,e=0,t=0,n=0;function i(r,o,a,c){s=r,e=a,t=-3*r+3*o-2*a-c,n=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,l){i(o,a,l*(a-r),l*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,l,h,u){let d=(o-r)/l-(a-r)/(l+h)+(a-o)/h,f=(a-o)/h-(c-o)/(h+u)+(c-a)/u;d*=h,f*=h,i(o,a,d,f)},calc:function(r){let o=r*r,a=o*r;return s+e*r+t*o+n*a}}}var pa=new w,Bl=new bh,Ol=new bh,kl=new bh,Ia=class extends Mn{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new w){let n=t,i=this.points,r=i.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let l,h;this.closed||a>0?l=i[(a-1)%r]:(pa.subVectors(i[0],i[1]).add(i[0]),l=pa);let u=i[a%r],d=i[(a+1)%r];if(this.closed||a+2<r?h=i[(a+2)%r]:(pa.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=pa),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(l.distanceToSquared(u),f),x=Math.pow(u.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(h),f);x<1e-4&&(x=1),g<1e-4&&(g=x),m<1e-4&&(m=x),Bl.initNonuniformCatmullRom(l.x,u.x,d.x,h.x,g,x,m),Ol.initNonuniformCatmullRom(l.y,u.y,d.y,h.y,g,x,m),kl.initNonuniformCatmullRom(l.z,u.z,d.z,h.z,g,x,m)}else this.curveType==="catmullrom"&&(Bl.initCatmullRom(l.x,u.x,d.x,h.x,this.tension),Ol.initCatmullRom(l.y,u.y,d.y,h.y,this.tension),kl.initCatmullRom(l.z,u.z,d.z,h.z,this.tension));return n.set(Bl.calc(c),Ol.calc(c),kl.calc(c)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new w().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function dd(s,e,t,n,i){let r=(n-e)*.5,o=(i-t)*.5,a=s*s,c=s*a;return(2*t-2*n+r+o)*c+(-3*t+3*n-2*r-o)*a+r*s+t}function fm(s,e){let t=1-s;return t*t*e}function pm(s,e){return 2*(1-s)*s*e}function mm(s,e){return s*s*e}function Fr(s,e,t,n){return fm(s,e)+pm(s,t)+mm(s,n)}function gm(s,e){let t=1-s;return t*t*t*e}function xm(s,e){let t=1-s;return 3*t*t*s*e}function ym(s,e){return 3*(1-s)*s*s*e}function vm(s,e){return s*s*s*e}function Br(s,e,t,n,i){return gm(s,e)+xm(s,t)+ym(s,n)+vm(s,i)}var so=class extends Mn{constructor(e=new ne,t=new ne,n=new ne,i=new ne){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new ne){let n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Br(e,i.x,r.x,o.x,a.x),Br(e,i.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Pa=class extends Mn{constructor(e=new w,t=new w,n=new w,i=new w){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new w){let n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Br(e,i.x,r.x,o.x,a.x),Br(e,i.y,r.y,o.y,a.y),Br(e,i.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ro=class extends Mn{constructor(e=new ne,t=new ne){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ne){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ne){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},La=class extends Mn{constructor(e=new w,t=new w){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new w){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new w){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},oo=class extends Mn{constructor(e=new ne,t=new ne,n=new ne){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new ne){let n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(Fr(e,i.x,r.x,o.x),Fr(e,i.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Da=class extends Mn{constructor(e=new w,t=new w,n=new w){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new w){let n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(Fr(e,i.x,r.x,o.x),Fr(e,i.y,r.y,o.y),Fr(e,i.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ao=class extends Mn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ne){let n=t,i=this.points,r=(i.length-1)*e,o=Math.floor(r),a=r-o,c=i[o===0?o:o-1],l=i[o],h=i[o>i.length-2?i.length-1:o+1],u=i[o>i.length-3?i.length-1:o+2];return n.set(dd(a,c.x,l.x,h.x,u.x),dd(a,c.y,l.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new ne().fromArray(i))}return this}},ql=Object.freeze({__proto__:null,ArcCurve:Ca,CatmullRomCurve3:Ia,CubicBezierCurve:so,CubicBezierCurve3:Pa,EllipseCurve:ir,LineCurve:ro,LineCurve3:La,QuadraticBezierCurve:oo,QuadraticBezierCurve3:Da,SplineCurve:ao}),Ua=class extends Mn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new ql[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),i=this.getCurveLengths(),r=0;for(;r<i.length;){if(i[r]>=n){let o=i[r]-n,a=this.curves[r],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let i=0,r=this.curves;i<r.length;i++){let o=r[i],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,c=o.getPoints(a);for(let l=0;l<c.length;l++){let h=c[l];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(new ql[i.type]().fromJSON(i))}return this}},co=class extends Ua{constructor(e){super(),this.type="Path",this.currentPoint=new ne,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new ro(this.currentPoint.clone(),new ne(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){let r=new oo(this.currentPoint.clone(),new ne(e,t),new ne(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,r,o){let a=new so(this.currentPoint.clone(),new ne(e,t),new ne(n,i),new ne(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new ao(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,r,o){let a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+a,t+c,n,i,r,o),this}absarc(e,t,n,i,r,o){return this.absellipse(e,t,n,n,i,r,o),this}ellipse(e,t,n,i,r,o,a,c){let l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+l,t+h,n,i,r,o,a,c),this}absellipse(e,t,n,i,r,o,a,c){let l=new ir(e,t,n,i,r,o,a,c);if(this.curves.length>0){let u=l.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(l);let h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},ls=class extends co{constructor(e){super(e),this.uuid=Cn(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(new co().fromJSON(i))}return this}};function _m(s,e,t=2){let n=e&&e.length,i=n?e[0]*t:s.length,r=mf(s,0,i,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,c,l;if(n&&(r=wm(s,e,r,t)),s.length>80*t){a=1/0,c=1/0;let h=-1/0,u=-1/0;for(let d=t;d<i;d+=t){let f=s[d],g=s[d+1];f<a&&(a=f),g<c&&(c=g),f>h&&(h=f),g>u&&(u=g)}l=Math.max(h-a,u-c),l=l!==0?32767/l:0}return lo(r,o,t,a,c,l,0),o}function mf(s,e,t,n,i){let r;if(i===Fm(s,e,t,n)>0)for(let o=e;o<t;o+=n)r=fd(o/n|0,s[o],s[o+1],r);else for(let o=t-n;o>=e;o-=n)r=fd(o/n|0,s[o],s[o+1],r);return r&&sr(r,r.next)&&(uo(r),r=r.next),r}function hs(s,e){if(!s)return s;e||(e=s);let t=s,n;do if(n=!1,!t.steiner&&(sr(t,t.next)||Dt(t.prev,t,t.next)===0)){if(uo(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function lo(s,e,t,n,i,r,o){if(!s)return;!o&&r&&Im(s,n,i,r);let a=s;for(;s.prev!==s.next;){let c=s.prev,l=s.next;if(r?Mm(s,n,i,r):bm(s)){e.push(c.i,s.i,l.i),uo(s),s=l.next,a=l.next;continue}if(s=l,s===a){o?o===1?(s=Tm(hs(s),e),lo(s,e,t,n,i,r,2)):o===2&&Sm(s,e,t,n,i,r):lo(hs(s),e,t,n,i,r,1);break}}}function bm(s){let e=s.prev,t=s,n=s.next;if(Dt(e,t,n)>=0)return!1;let i=e.x,r=t.x,o=n.x,a=e.y,c=t.y,l=n.y,h=Math.min(i,r,o),u=Math.min(a,c,l),d=Math.max(i,r,o),f=Math.max(a,c,l),g=n.next;for(;g!==e;){if(g.x>=h&&g.x<=d&&g.y>=u&&g.y<=f&&Dr(i,a,r,c,o,l,g.x,g.y)&&Dt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Mm(s,e,t,n){let i=s.prev,r=s,o=s.next;if(Dt(i,r,o)>=0)return!1;let a=i.x,c=r.x,l=o.x,h=i.y,u=r.y,d=o.y,f=Math.min(a,c,l),g=Math.min(h,u,d),x=Math.max(a,c,l),m=Math.max(h,u,d),p=Yl(f,g,e,t,n),v=Yl(x,m,e,t,n),b=s.prevZ,y=s.nextZ;for(;b&&b.z>=p&&y&&y.z<=v;){if(b.x>=f&&b.x<=x&&b.y>=g&&b.y<=m&&b!==i&&b!==o&&Dr(a,h,c,u,l,d,b.x,b.y)&&Dt(b.prev,b,b.next)>=0||(b=b.prevZ,y.x>=f&&y.x<=x&&y.y>=g&&y.y<=m&&y!==i&&y!==o&&Dr(a,h,c,u,l,d,y.x,y.y)&&Dt(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;b&&b.z>=p;){if(b.x>=f&&b.x<=x&&b.y>=g&&b.y<=m&&b!==i&&b!==o&&Dr(a,h,c,u,l,d,b.x,b.y)&&Dt(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;y&&y.z<=v;){if(y.x>=f&&y.x<=x&&y.y>=g&&y.y<=m&&y!==i&&y!==o&&Dr(a,h,c,u,l,d,y.x,y.y)&&Dt(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function Tm(s,e){let t=s;do{let n=t.prev,i=t.next.next;!sr(n,i)&&xf(n,t,t.next,i)&&ho(n,i)&&ho(i,n)&&(e.push(n.i,t.i,i.i),uo(t),uo(t.next),t=s=i),t=t.next}while(t!==s);return hs(t)}function Sm(s,e,t,n,i,r){let o=s;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Dm(o,a)){let c=yf(o,a);o=hs(o,o.next),c=hs(c,c.next),lo(o,e,t,n,i,r,0),lo(c,e,t,n,i,r,0);return}a=a.next}o=o.next}while(o!==s)}function wm(s,e,t,n){let i=[];for(let r=0,o=e.length;r<o;r++){let a=e[r]*n,c=r<o-1?e[r+1]*n:s.length,l=mf(s,a,c,n,!1);l===l.next&&(l.steiner=!0),i.push(Lm(l))}i.sort(Am);for(let r=0;r<i.length;r++)t=Em(i[r],t);return t}function Am(s,e){let t=s.x-e.x;if(t===0&&(t=s.y-e.y,t===0)){let n=(s.next.y-s.y)/(s.next.x-s.x),i=(e.next.y-e.y)/(e.next.x-e.x);t=n-i}return t}function Em(s,e){let t=Rm(s,e);if(!t)return e;let n=yf(t,s);return hs(n,n.next),hs(t,t.next)}function Rm(s,e){let t=e,n=s.x,i=s.y,r=-1/0,o;if(sr(s,t))return t;do{if(sr(s,t.next))return t.next;if(i<=t.y&&i>=t.next.y&&t.next.y!==t.y){let u=t.x+(i-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(u<=n&&u>r&&(r=u,o=t.x<t.next.x?t:t.next,u===n))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,c=o.x,l=o.y,h=1/0;t=o;do{if(n>=t.x&&t.x>=c&&n!==t.x&&gf(i<l?n:r,i,c,l,i<l?r:n,i,t.x,t.y)){let u=Math.abs(i-t.y)/(n-t.x);ho(t,s)&&(u<h||u===h&&(t.x>o.x||t.x===o.x&&Cm(o,t)))&&(o=t,h=u)}t=t.next}while(t!==a);return o}function Cm(s,e){return Dt(s.prev,s,e.prev)<0&&Dt(e.next,s,s.next)<0}function Im(s,e,t,n){let i=s;do i.z===0&&(i.z=Yl(i.x,i.y,e,t,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,Pm(i)}function Pm(s){let e,t=1;do{let n=s,i;s=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let l=0;l<t&&(a++,o=o.nextZ,!!o);l++);let c=t;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||n.z<=o.z)?(i=n,n=n.nextZ,a--):(i=o,o=o.nextZ,c--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;n=o}r.nextZ=null,t*=2}while(e>1);return s}function Yl(s,e,t,n,i){return s=(s-t)*i|0,e=(e-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,s|e<<1}function Lm(s){let e=s,t=s;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==s);return t}function gf(s,e,t,n,i,r,o,a){return(i-o)*(e-a)>=(s-o)*(r-a)&&(s-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(i-o)*(n-a)}function Dr(s,e,t,n,i,r,o,a){return!(s===o&&e===a)&&gf(s,e,t,n,i,r,o,a)}function Dm(s,e){return s.next.i!==e.i&&s.prev.i!==e.i&&!Um(s,e)&&(ho(s,e)&&ho(e,s)&&Nm(s,e)&&(Dt(s.prev,s,e.prev)||Dt(s,e.prev,e))||sr(s,e)&&Dt(s.prev,s,s.next)>0&&Dt(e.prev,e,e.next)>0)}function Dt(s,e,t){return(e.y-s.y)*(t.x-e.x)-(e.x-s.x)*(t.y-e.y)}function sr(s,e){return s.x===e.x&&s.y===e.y}function xf(s,e,t,n){let i=ga(Dt(s,e,t)),r=ga(Dt(s,e,n)),o=ga(Dt(t,n,s)),a=ga(Dt(t,n,e));return!!(i!==r&&o!==a||i===0&&ma(s,t,e)||r===0&&ma(s,n,e)||o===0&&ma(t,s,n)||a===0&&ma(t,e,n))}function ma(s,e,t){return e.x<=Math.max(s.x,t.x)&&e.x>=Math.min(s.x,t.x)&&e.y<=Math.max(s.y,t.y)&&e.y>=Math.min(s.y,t.y)}function ga(s){return s>0?1:s<0?-1:0}function Um(s,e){let t=s;do{if(t.i!==s.i&&t.next.i!==s.i&&t.i!==e.i&&t.next.i!==e.i&&xf(t,t.next,s,e))return!0;t=t.next}while(t!==s);return!1}function ho(s,e){return Dt(s.prev,s,s.next)<0?Dt(s,e,s.next)>=0&&Dt(s,s.prev,e)>=0:Dt(s,e,s.prev)<0||Dt(s,s.next,e)<0}function Nm(s,e){let t=s,n=!1,i=(s.x+e.x)/2,r=(s.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&i<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==s);return n}function yf(s,e){let t=Zl(s.i,s.x,s.y),n=Zl(e.i,e.x,e.y),i=s.next,r=e.prev;return s.next=e,e.prev=s,t.next=i,i.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function fd(s,e,t,n){let i=Zl(s,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function uo(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Zl(s,e,t){return{i:s,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Fm(s,e,t,n){let i=0;for(let r=e,o=t-n;r<t;r+=n)i+=(s[o]-s[r])*(s[r+1]+s[o+1]),o=r;return i}var Kl=class{static triangulate(e,t,n=2){return _m(e,t,n)}},Qi=class s{static area(e){let t=e.length,n=0;for(let i=t-1,r=0;r<t;i=r++)n+=e[i].x*e[r].y-e[r].x*e[i].y;return n*.5}static isClockWise(e){return s.area(e)<0}static triangulateShape(e,t){let n=[],i=[],r=[];pd(e),md(n,e);let o=e.length;t.forEach(pd);for(let c=0;c<t.length;c++)i.push(o),o+=t[c].length,md(n,t[c]);let a=Kl.triangulate(n,i);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}};function pd(s){let e=s.length;e>2&&s[e-1].equals(s[0])&&s.pop()}function md(s,e){for(let t=0;t<e.length;t++)s.push(e[t].x),s.push(e[t].y)}var rr=class s extends mt{constructor(e=new ls([new ne(.5,.5),new ne(-.5,.5),new ne(-.5,-.5),new ne(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,i=[],r=[];for(let a=0,c=e.length;a<c;a++){let l=e[a];o(l)}this.setAttribute("position",new Ze(i,3)),this.setAttribute("uv",new Ze(r,2)),this.computeVertexNormals();function o(a){let c=[],l=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,p=t.extrudePath,v=t.UVGenerator!==void 0?t.UVGenerator:Bm,b,y=!1,A,R,C,T;p&&(b=p.getSpacedPoints(h),y=!0,d=!1,A=p.computeFrenetFrames(h,!1),R=new w,C=new w,T=new w),d||(m=0,f=0,g=0,x=0);let M=a.extractPoints(l),_=M.shape,P=M.holes;if(!Qi.isClockWise(_)){_=_.reverse();for(let ie=0,j=P.length;ie<j;ie++){let $=P[ie];Qi.isClockWise($)&&(P[ie]=$.reverse())}}function z(ie){let $=10000000000000001e-36,K=ie[0];for(let de=1;de<=ie.length;de++){let re=de%ie.length,fe=ie[re],Ke=fe.x-K.x,Xe=fe.y-K.y,L=Ke*Ke+Xe*Xe,S=Math.max(Math.abs(fe.x),Math.abs(fe.y),Math.abs(K.x),Math.abs(K.y)),V=$*S*S;if(L<=V){ie.splice(re,1),de--;continue}K=fe}}z(_),P.forEach(z);let N=P.length,B=_;for(let ie=0;ie<N;ie++){let j=P[ie];_=_.concat(j)}function I(ie,j,$){return j||console.error("THREE.ExtrudeGeometry: vec does not exist"),ie.clone().addScaledVector(j,$)}let H=_.length;function G(ie,j,$){let K,de,re,fe=ie.x-j.x,Ke=ie.y-j.y,Xe=$.x-ie.x,L=$.y-ie.y,S=fe*fe+Ke*Ke,V=fe*L-Ke*Xe;if(Math.abs(V)>Number.EPSILON){let Y=Math.sqrt(S),te=Math.sqrt(Xe*Xe+L*L),Z=j.x-Ke/Y,Pe=j.y+fe/Y,he=$.x-L/te,Re=$.y+Xe/te,Ce=((he-Z)*L-(Re-Pe)*Xe)/(fe*L-Ke*Xe);K=Z+fe*Ce-ie.x,de=Pe+Ke*Ce-ie.y;let oe=K*K+de*de;if(oe<=2)return new ne(K,de);re=Math.sqrt(oe/2)}else{let Y=!1;fe>Number.EPSILON?Xe>Number.EPSILON&&(Y=!0):fe<-Number.EPSILON?Xe<-Number.EPSILON&&(Y=!0):Math.sign(Ke)===Math.sign(L)&&(Y=!0),Y?(K=-Ke,de=fe,re=Math.sqrt(S)):(K=fe,de=Ke,re=Math.sqrt(S/2))}return new ne(K/re,de/re)}let se=[];for(let ie=0,j=B.length,$=j-1,K=ie+1;ie<j;ie++,$++,K++)$===j&&($=0),K===j&&(K=0),se[ie]=G(B[ie],B[$],B[K]);let ue=[],me,Be=se.concat();for(let ie=0,j=N;ie<j;ie++){let $=P[ie];me=[];for(let K=0,de=$.length,re=de-1,fe=K+1;K<de;K++,re++,fe++)re===de&&(re=0),fe===de&&(fe=0),me[K]=G($[K],$[re],$[fe]);ue.push(me),Be=Be.concat(me)}let Ye;if(m===0)Ye=Qi.triangulateShape(B,P);else{let ie=[],j=[];for(let $=0;$<m;$++){let K=$/m,de=f*Math.cos(K*Math.PI/2),re=g*Math.sin(K*Math.PI/2)+x;for(let fe=0,Ke=B.length;fe<Ke;fe++){let Xe=I(B[fe],se[fe],re);Le(Xe.x,Xe.y,-de),K===0&&ie.push(Xe)}for(let fe=0,Ke=N;fe<Ke;fe++){let Xe=P[fe];me=ue[fe];let L=[];for(let S=0,V=Xe.length;S<V;S++){let Y=I(Xe[S],me[S],re);Le(Y.x,Y.y,-de),K===0&&L.push(Y)}K===0&&j.push(L)}}Ye=Qi.triangulateShape(ie,j)}let ut=Ye.length,Se=g+x;for(let ie=0;ie<H;ie++){let j=d?I(_[ie],Be[ie],Se):_[ie];y?(C.copy(A.normals[0]).multiplyScalar(j.x),R.copy(A.binormals[0]).multiplyScalar(j.y),T.copy(b[0]).add(C).add(R),Le(T.x,T.y,T.z)):Le(j.x,j.y,0)}for(let ie=1;ie<=h;ie++)for(let j=0;j<H;j++){let $=d?I(_[j],Be[j],Se):_[j];y?(C.copy(A.normals[ie]).multiplyScalar($.x),R.copy(A.binormals[ie]).multiplyScalar($.y),T.copy(b[ie]).add(C).add(R),Le(T.x,T.y,T.z)):Le($.x,$.y,u/h*ie)}for(let ie=m-1;ie>=0;ie--){let j=ie/m,$=f*Math.cos(j*Math.PI/2),K=g*Math.sin(j*Math.PI/2)+x;for(let de=0,re=B.length;de<re;de++){let fe=I(B[de],se[de],K);Le(fe.x,fe.y,u+$)}for(let de=0,re=P.length;de<re;de++){let fe=P[de];me=ue[de];for(let Ke=0,Xe=fe.length;Ke<Xe;Ke++){let L=I(fe[Ke],me[Ke],K);y?Le(L.x,L.y+b[h-1].y,b[h-1].x+$):Le(L.x,L.y,u+$)}}}q(),J();function q(){let ie=i.length/3;if(d){let j=0,$=H*j;for(let K=0;K<ut;K++){let de=Ye[K];we(de[2]+$,de[1]+$,de[0]+$)}j=h+m*2,$=H*j;for(let K=0;K<ut;K++){let de=Ye[K];we(de[0]+$,de[1]+$,de[2]+$)}}else{for(let j=0;j<ut;j++){let $=Ye[j];we($[2],$[1],$[0])}for(let j=0;j<ut;j++){let $=Ye[j];we($[0]+H*h,$[1]+H*h,$[2]+H*h)}}n.addGroup(ie,i.length/3-ie,0)}function J(){let ie=i.length/3,j=0;_e(B,j),j+=B.length;for(let $=0,K=P.length;$<K;$++){let de=P[$];_e(de,j),j+=de.length}n.addGroup(ie,i.length/3-ie,1)}function _e(ie,j){let $=ie.length;for(;--$>=0;){let K=$,de=$-1;de<0&&(de=ie.length-1);for(let re=0,fe=h+m*2;re<fe;re++){let Ke=H*re,Xe=H*(re+1),L=j+K+Ke,S=j+de+Ke,V=j+de+Xe,Y=j+K+Xe;tt(L,S,V,Y)}}}function Le(ie,j,$){c.push(ie),c.push(j),c.push($)}function we(ie,j,$){xt(ie),xt(j),xt($);let K=i.length/3,de=v.generateTopUV(n,i,K-3,K-2,K-1);D(de[0]),D(de[1]),D(de[2])}function tt(ie,j,$,K){xt(ie),xt(j),xt(K),xt(j),xt($),xt(K);let de=i.length/3,re=v.generateSideWallUV(n,i,de-6,de-3,de-2,de-1);D(re[0]),D(re[1]),D(re[3]),D(re[1]),D(re[2]),D(re[3])}function xt(ie){i.push(c[ie*3+0]),i.push(c[ie*3+1]),i.push(c[ie*3+2])}function D(ie){r.push(ie.x),r.push(ie.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Om(t,n,e)}static fromJSON(e,t){let n=[];for(let r=0,o=e.shapes.length;r<o;r++){let a=t[e.shapes[r]];n.push(a)}let i=e.options.extrudePath;return i!==void 0&&(e.options.extrudePath=new ql[i.type]().fromJSON(i)),new s(n,e.options)}},Bm={generateTopUV:function(s,e,t,n,i){let r=e[t*3],o=e[t*3+1],a=e[n*3],c=e[n*3+1],l=e[i*3],h=e[i*3+1];return[new ne(r,o),new ne(a,c),new ne(l,h)]},generateSideWallUV:function(s,e,t,n,i,r){let o=e[t*3],a=e[t*3+1],c=e[t*3+2],l=e[n*3],h=e[n*3+1],u=e[n*3+2],d=e[i*3],f=e[i*3+1],g=e[i*3+2],x=e[r*3],m=e[r*3+1],p=e[r*3+2];return Math.abs(a-h)<Math.abs(o-l)?[new ne(o,1-c),new ne(l,1-u),new ne(d,1-g),new ne(x,1-p)]:[new ne(a,1-c),new ne(h,1-u),new ne(f,1-g),new ne(m,1-p)]}};function Om(s,e,t){if(t.shapes=[],Array.isArray(s))for(let n=0,i=s.length;n<i;n++){let r=s[n];t.shapes.push(r.uuid)}else t.shapes.push(s.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Oi=class s extends io{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},fo=class s extends mt{constructor(e=[new ne(0,-.5),new ne(.5,0),new ne(0,.5)],t=12,n=0,i=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=nt(i,0,Math.PI*2);let r=[],o=[],a=[],c=[],l=[],h=1/t,u=new w,d=new ne,f=new w,g=new w,x=new w,m=0,p=0;for(let v=0;v<=e.length-1;v++)switch(v){case 0:m=e[v+1].x-e[v].x,p=e[v+1].y-e[v].y,f.x=p*1,f.y=-m,f.z=p*0,x.copy(f),f.normalize(),c.push(f.x,f.y,f.z);break;case e.length-1:c.push(x.x,x.y,x.z);break;default:m=e[v+1].x-e[v].x,p=e[v+1].y-e[v].y,f.x=p*1,f.y=-m,f.z=p*0,g.copy(f),f.x+=x.x,f.y+=x.y,f.z+=x.z,f.normalize(),c.push(f.x,f.y,f.z),x.copy(g)}for(let v=0;v<=t;v++){let b=n+v*h*i,y=Math.sin(b),A=Math.cos(b);for(let R=0;R<=e.length-1;R++){u.x=e[R].x*y,u.y=e[R].y,u.z=e[R].x*A,o.push(u.x,u.y,u.z),d.x=v/t,d.y=R/(e.length-1),a.push(d.x,d.y);let C=c[3*R+0]*y,T=c[3*R+1],M=c[3*R+0]*A;l.push(C,T,M)}}for(let v=0;v<t;v++)for(let b=0;b<e.length-1;b++){let y=b+v*e.length,A=y,R=y+e.length,C=y+e.length+1,T=y+1;r.push(A,R,T),r.push(C,T,R)}this.setIndex(r),this.setAttribute("position",new Ze(o,3)),this.setAttribute("uv",new Ze(a,2)),this.setAttribute("normal",new Ze(l,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.points,e.segments,e.phiStart,e.phiLength)}},Kt=class s extends io{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},Ln=class s extends mt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let r=e/2,o=t/2,a=Math.floor(n),c=Math.floor(i),l=a+1,h=c+1,u=e/a,d=t/c,f=[],g=[],x=[],m=[];for(let p=0;p<h;p++){let v=p*d-o;for(let b=0;b<l;b++){let y=b*u-r;g.push(y,-v,0),x.push(0,0,1),m.push(b/a),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let v=0;v<a;v++){let b=v+l*p,y=v+l*(p+1),A=v+1+l*(p+1),R=v+1+l*p;f.push(b,y,R),f.push(y,A,R)}this.setIndex(f),this.setAttribute("position",new Ze(g,3)),this.setAttribute("normal",new Ze(x,3)),this.setAttribute("uv",new Ze(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.width,e.height,e.widthSegments,e.heightSegments)}},jn=class s extends mt{constructor(e=.5,t=1,n=32,i=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:o},n=Math.max(3,n),i=Math.max(1,i);let a=[],c=[],l=[],h=[],u=e,d=(t-e)/i,f=new w,g=new ne;for(let x=0;x<=i;x++){for(let m=0;m<=n;m++){let p=r+m/n*o;f.x=u*Math.cos(p),f.y=u*Math.sin(p),c.push(f.x,f.y,f.z),l.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,h.push(g.x,g.y)}u+=d}for(let x=0;x<i;x++){let m=x*(n+1);for(let p=0;p<n;p++){let v=p+m,b=v,y=v+n+1,A=v+n+2,R=v+1;a.push(b,y,R),a.push(y,A,R)}}this.setIndex(a),this.setAttribute("position",new Ze(c,3)),this.setAttribute("normal",new Ze(l,3)),this.setAttribute("uv",new Ze(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var Bt=class s extends mt{constructor(e=1,t=32,n=16,i=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let c=Math.min(o+a,Math.PI),l=0,h=[],u=new w,d=new w,f=[],g=[],x=[],m=[];for(let p=0;p<=n;p++){let v=[],b=p/n,y=0;p===0&&o===0?y=.5/t:p===n&&c===Math.PI&&(y=-.5/t);for(let A=0;A<=t;A++){let R=A/t;u.x=-e*Math.cos(i+R*r)*Math.sin(o+b*a),u.y=e*Math.cos(o+b*a),u.z=e*Math.sin(i+R*r)*Math.sin(o+b*a),g.push(u.x,u.y,u.z),d.copy(u).normalize(),x.push(d.x,d.y,d.z),m.push(R+y,1-b),v.push(l++)}h.push(v)}for(let p=0;p<n;p++)for(let v=0;v<t;v++){let b=h[p][v+1],y=h[p][v],A=h[p+1][v],R=h[p+1][v+1];(p!==0||o>0)&&f.push(b,y,R),(p!==n-1||c<Math.PI)&&f.push(y,A,R)}this.setIndex(f),this.setAttribute("position",new Ze(g,3)),this.setAttribute("normal",new Ze(x,3)),this.setAttribute("uv",new Ze(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var it=class s extends mt{constructor(e=1,t=.4,n=12,i=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);let o=[],a=[],c=[],l=[],h=new w,u=new w,d=new w;for(let f=0;f<=n;f++)for(let g=0;g<=i;g++){let x=g/i*r,m=f/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(x),u.y=(e+t*Math.cos(m))*Math.sin(x),u.z=t*Math.sin(m),a.push(u.x,u.y,u.z),h.x=e*Math.cos(x),h.y=e*Math.sin(x),d.subVectors(u,h).normalize(),c.push(d.x,d.y,d.z),l.push(g/i),l.push(f/n)}for(let f=1;f<=n;f++)for(let g=1;g<=i;g++){let x=(i+1)*f+g-1,m=(i+1)*(f-1)+g-1,p=(i+1)*(f-1)+g,v=(i+1)*f+g;o.push(x,m,v),o.push(m,p,v)}this.setIndex(o),this.setAttribute("position",new Ze(a,3)),this.setAttribute("normal",new Ze(c,3)),this.setAttribute("uv",new Ze(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var $t=class extends rn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ae(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=mh,this.normalScale=new ne(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},fn=class extends $t{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ne(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return nt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ae(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ae(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ae(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Na=class extends rn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Qd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Fa=class extends rn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function xa(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function km(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function zm(s){function e(i,r){return s[i]-s[r]}let t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function gd(s,e,t){let n=s.length,i=new s.constructor(n);for(let r=0,o=0;o!==n;++r){let a=t[r]*e;for(let c=0;c!==e;++c)i[o++]=s[a+c]}return i}function vf(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push(...o)),r=s[i++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=s[i++];while(r!==void 0)}var _i=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let o;n:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=t[++n],e<i)break t}o=t.length;break n}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(i=r,r=t[--n-1],e>=r)break t}o=n,n=0;break n}break e}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let o=0;o!==i;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Ba=class extends _i{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ji,endingEnd:Ji}}intervalChanged_(e,t,n){let i=this.parameterPositions,r=e-2,o=e+1,a=i[r],c=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case ji:r=e,a=2*t-n;break;case Or:r=i.length-2,a=t+i[r]-i[r+1];break;default:r=e,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case ji:o=e,c=2*n-t;break;case Or:o=1,c=n+i[1]-i[0];break;default:o=e-1,c=t}let l=(n-t)*.5,h=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(i-t),x=g*g,m=x*g,p=-d*m+2*d*x-d*g,v=(1+d)*m+(-1.5-2*d)*x+(-.5+d)*g+1,b=(-1-f)*m+(1.5+f)*x+.5*g,y=f*m-f*x;for(let A=0;A!==a;++A)r[A]=p*o[h+A]+v*o[l+A]+b*o[c+A]+y*o[u+A];return r}},po=class extends _i{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,h=(n-t)/(i-t),u=1-h;for(let d=0;d!==a;++d)r[d]=o[l+d]*u+o[c+d]*h;return r}},Oa=class extends _i{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},pn=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=xa(t,this.TimeBufferType),this.values=xa(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:xa(e.times,Array),values:xa(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Oa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new po(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ba(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case ts:t=this.InterpolantFactoryMethodDiscrete;break;case ns:t=this.InterpolantFactoryMethodLinear;break;case ya:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ts;case this.InterpolantFactoryMethodLinear:return ns;case this.InterpolantFactoryMethodSmooth:return ya}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){let n=this.times,i=n.length,r=0,o=i-1;for(;r!==i&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,i=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let c=n[a];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(i!==void 0&&km(i))for(let a=0,c=i.length;a!==c;++a){let l=i[a];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===ya,r=e.length-1,o=1;for(let a=1;a<r;++a){let c=!1,l=e[a],h=e[a+1];if(l!==h&&(a!==1||l!==e[0]))if(i)c=!0;else{let u=a*n,d=u-n,f=u+n;for(let g=0;g!==n;++g){let x=t[u+g];if(x!==t[d+g]||x!==t[f+g]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];let u=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,c=o*n,l=0;l!==n;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}};pn.prototype.ValueTypeName="";pn.prototype.TimeBufferType=Float32Array;pn.prototype.ValueBufferType=Float32Array;pn.prototype.DefaultInterpolation=ns;var bi=class extends pn{constructor(e,t,n){super(e,t,n)}};bi.prototype.ValueTypeName="bool";bi.prototype.ValueBufferType=Array;bi.prototype.DefaultInterpolation=ts;bi.prototype.InterpolantFactoryMethodLinear=void 0;bi.prototype.InterpolantFactoryMethodSmooth=void 0;var mo=class extends pn{constructor(e,t,n,i){super(e,t,n,i)}};mo.prototype.ValueTypeName="color";var Qn=class extends pn{constructor(e,t,n,i){super(e,t,n,i)}};Qn.prototype.ValueTypeName="number";var ka=class extends _i{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-t)/(i-t),l=e*a;for(let h=l+a;l!==h;l+=4)kt.slerpFlat(r,0,o,l-a,o,l,c);return r}},ei=class extends pn{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new ka(this.times,this.values,this.getValueSize(),e)}};ei.prototype.ValueTypeName="quaternion";ei.prototype.InterpolantFactoryMethodSmooth=void 0;var Mi=class extends pn{constructor(e,t,n){super(e,t,n)}};Mi.prototype.ValueTypeName="string";Mi.prototype.ValueBufferType=Array;Mi.prototype.DefaultInterpolation=ts;Mi.prototype.InterpolantFactoryMethodLinear=void 0;Mi.prototype.InterpolantFactoryMethodSmooth=void 0;var ti=class extends pn{constructor(e,t,n,i){super(e,t,n,i)}};ti.prototype.ValueTypeName="vector";var us=class{constructor(e="",t=-1,n=[],i=Oc){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=Cn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,i=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(Gm(n[o]).scale(i));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=n.length;r!==o;++r)t.push(pn.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){let r=t.length,o=[];for(let a=0;a<r;a++){let c=[],l=[];c.push((a+r-1)%r,a,(a+1)%r),l.push(0,1,0);let h=zm(c);c=gd(c,1,h),l=gd(l,1,h),!i&&c[0]===0&&(c.push(r),l.push(l[0])),o.push(new Qn(".morphTargetInfluences["+t[a].name+"]",c,l).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let i={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,c=e.length;a<c;a++){let l=e[a],h=l.name.match(r);if(h&&h.length>1){let u=h[1],d=i[u];d||(i[u]=d=[]),d.push(l)}}let o=[];for(let a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return o}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let n=function(u,d,f,g,x){if(f.length!==0){let m=[],p=[];vf(f,m,p,g),m.length!==0&&x.push(new u(d,m,p))}},i=[],r=e.name||"default",o=e.fps||30,a=e.blendMode,c=e.length||-1,l=e.hierarchy||[];for(let u=0;u<l.length;u++){let d=l[u].keys;if(!(!d||d.length===0))if(d[0].morphTargets){let f={},g;for(g=0;g<d.length;g++)if(d[g].morphTargets)for(let x=0;x<d[g].morphTargets.length;x++)f[d[g].morphTargets[x]]=-1;for(let x in f){let m=[],p=[];for(let v=0;v!==d[g].morphTargets.length;++v){let b=d[g];m.push(b.time),p.push(b.morphTarget===x?1:0)}i.push(new Qn(".morphTargetInfluence["+x+"]",m,p))}c=f.length*o}else{let f=".bones["+t[u].name+"]";n(ti,f+".position",d,"pos",i),n(ei,f+".quaternion",d,"rot",i),n(ti,f+".scale",d,"scl",i)}}return i.length===0?null:new this(r,c,i,a)}resetDuration(){let e=this.tracks,t=0;for(let n=0,i=e.length;n!==i;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function Vm(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Qn;case"vector":case"vector2":case"vector3":case"vector4":return ti;case"color":return mo;case"quaternion":return ei;case"bool":case"boolean":return bi;case"string":return Mi}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function Gm(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=Vm(s.type);if(s.times===void 0){let t=[],n=[];vf(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}var Zn={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}},za=class{constructor(e,t,n){let i=this,r=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(h){a++,r===!1&&i.onStart!==void 0&&i.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,i.onProgress!==void 0&&i.onProgress(h,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){let u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=l.length;u<d;u+=2){let f=l[u],g=l[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},_f=new za,ni=class{constructor(e){this.manager=e!==void 0?e:_f,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};ni.DEFAULT_MATERIAL_NAME="__DEFAULT";var mi={},$l=class extends Error{constructor(e,t){super(e),this.response=t}},or=class extends ni{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=Zn.get(`file:${e}`);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(mi[e]!==void 0){mi[e].push({onLoad:t,onProgress:n,onError:i});return}mi[e]=[],mi[e].push({onLoad:t,onProgress:n,onError:i});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,c=this.responseType;fetch(o).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;let h=mi[e],u=l.body.getReader(),d=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),f=d?parseInt(d):0,g=f!==0,x=0,m=new ReadableStream({start(p){v();function v(){u.read().then(({done:b,value:y})=>{if(b)p.close();else{x+=y.byteLength;let A=new ProgressEvent("progress",{lengthComputable:g,loaded:x,total:f});for(let R=0,C=h.length;R<C;R++){let T=h[R];T.onProgress&&T.onProgress(A)}p.enqueue(y),v()}},b=>{p.error(b)})}}});return new Response(m)}else throw new $l(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return l.json();default:if(a==="")return l.text();{let u=/charset="?([^;"\s]*)"?/i.exec(a),d=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(d);return l.arrayBuffer().then(g=>f.decode(g))}}}).then(l=>{Zn.add(`file:${e}`,l);let h=mi[e];delete mi[e];for(let u=0,d=h.length;u<d;u++){let f=h[u];f.onLoad&&f.onLoad(l)}}).catch(l=>{let h=mi[e];if(h===void 0)throw this.manager.itemError(e),l;delete mi[e];for(let u=0,d=h.length;u<d;u++){let f=h[u];f.onError&&f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Xs=new WeakMap,Va=class extends ni{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Zn.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let u=Xs.get(o);u===void 0&&(u=[],Xs.set(o,u)),u.push({onLoad:t,onError:i})}return o}let a=Ks("img");function c(){h(),t&&t(this);let u=Xs.get(this)||[];for(let d=0;d<u.length;d++){let f=u[d];f.onLoad&&f.onLoad(this)}Xs.delete(this),r.manager.itemEnd(e)}function l(u){h(),i&&i(u),Zn.remove(`image:${e}`);let d=Xs.get(this)||[];for(let f=0;f<d.length;f++){let g=d[f];g.onError&&g.onError(u)}Xs.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",c,!1),a.removeEventListener("error",l,!1)}return a.addEventListener("load",c,!1),a.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),Zn.add(`image:${e}`,a),r.manager.itemStart(e),a.src=e,a}};var go=class extends ni{constructor(e){super(e)}load(e,t,n,i){let r=new zt,o=new Va(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}},ki=class extends Qe{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ae(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},xo=class extends ki{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Qe.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ae(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},zl=new Fe,xd=new w,yd=new w,yo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ne(512,512),this.mapType=Hn,this.map=null,this.mapPass=null,this.matrix=new Fe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new tr,this._frameExtents=new ne(1,1),this._viewportCount=1,this._viewports=[new ft(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;xd.setFromMatrixPosition(e.matrixWorld),t.position.copy(xd),yd.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(yd),t.updateMatrixWorld(),zl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(zl,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(zl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Jl=class extends yo{constructor(){super(new Nt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=is*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},vo=class extends ki{constructor(e,t,n=0,i=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Qe.DEFAULT_UP),this.updateMatrix(),this.target=new Qe,this.distance=n,this.angle=i,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Jl}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},vd=new Fe,Lr=new w,Vl=new w,jl=class extends yo{constructor(){super(new Nt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ne(4,2),this._viewportCount=6,this._viewports=[new ft(2,1,1,1),new ft(0,1,1,1),new ft(3,1,1,1),new ft(1,1,1,1),new ft(3,0,1,1),new ft(1,0,1,1)],this._cubeDirections=[new w(1,0,0),new w(-1,0,0),new w(0,0,1),new w(0,0,-1),new w(0,1,0),new w(0,-1,0)],this._cubeUps=[new w(0,1,0),new w(0,1,0),new w(0,1,0),new w(0,1,0),new w(0,0,1),new w(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,i=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Lr.setFromMatrixPosition(e.matrixWorld),n.position.copy(Lr),Vl.copy(n.position),Vl.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Vl),n.updateMatrixWorld(),i.makeTranslation(-Lr.x,-Lr.y,-Lr.z),vd.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(vd,n.coordinateSystem,n.reversedDepth)}},Ti=class extends ki{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new jl}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},ds=class extends Xr{constructor(e=-1,t=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,r=n-e,o=n+e,a=i+t,c=i-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Ql=class extends yo{constructor(){super(new ds(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},fs=class extends ki{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Qe.DEFAULT_UP),this.updateMatrix(),this.target=new Qe,this.shadow=new Ql}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},_o=class extends ki{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var Si=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var Gl=new WeakMap,bo=class extends ni{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Zn.get(`image-bitmap:${e}`);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(l=>{if(Gl.has(o)===!0)i&&i(Gl.get(o)),r.manager.itemError(e),r.manager.itemEnd(e);else return t&&t(l),r.manager.itemEnd(e),l});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}let a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let c=fetch(e,a).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(l){return Zn.add(`image-bitmap:${e}`,l),t&&t(l),r.manager.itemEnd(e),l}).catch(function(l){i&&i(l),Gl.set(c,l),Zn.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});Zn.add(`image-bitmap:${e}`,c),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Ga=class extends Nt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Ha=class{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,r,o;switch(t){case"quaternion":i=this._slerp,r=this._slerpAdditive,o=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,r=this._select,o=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,r=this._lerpAdditive,o=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=o,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,i=this.valueSize,r=e*i+i,o=this.cumulativeWeight;if(o===0){for(let a=0;a!==i;++a)n[r+a]=n[a];o=t}else{o+=t;let a=t/o;this._mixBufferRegion(n,r,0,a,i)}this.cumulativeWeight=o}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,i=e*t+t,r=this.cumulativeWeight,o=this.cumulativeWeightAdditive,a=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let c=t*this._origIndex;this._mixBufferRegion(n,i,c,1-r,t)}o>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let c=t,l=t+t;c!==l;++c)if(n[c]!==n[c+t]){a.setValue(n,i);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let r=n,o=i;r!==o;++r)t[r]=t[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,r){if(i>=.5)for(let o=0;o!==r;++o)e[t+o]=e[n+o]}_slerp(e,t,n,i){kt.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,r){let o=this._workIndex*r;kt.multiplyQuaternionsFlat(e,o,e,t,e,n),kt.slerpFlat(e,t,e,t,e,o,i)}_lerp(e,t,n,i,r){let o=1-i;for(let a=0;a!==r;++a){let c=t+a;e[c]=e[c]*o+e[n+a]*i}}_lerpAdditive(e,t,n,i,r){for(let o=0;o!==r;++o){let a=t+o;e[a]=e[a]+e[n+o]*i}}},Mh="\\[\\]\\.:\\/",Hm=new RegExp("["+Mh+"]","g"),Th="[^"+Mh+"]",Wm="[^"+Mh.replace("\\.","")+"]",Xm=/((?:WC+[\/:])*)/.source.replace("WC",Th),qm=/(WCOD+)?/.source.replace("WCOD",Wm),Ym=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Th),Zm=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Th),Km=new RegExp("^"+Xm+qm+Ym+Zm+"$"),$m=["material","materials","bones","map"],eh=class{constructor(e,t,n){let i=n||Mt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Mt=class s{constructor(e,t,n){this.path=t,this.parsedPath=n||s.parseTrackName(t),this.node=s.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new s.Composite(e,t,n):new s(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Hm,"")}static parseTrackName(e){let t=Km.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let r=n.nodeName.substring(i+1);$m.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let c=n(a.children);if(c)return c}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,i=t.propertyName,r=t.propertyIndex;if(e||(e=s.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===l){l=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let o=e[i];if(o===void 0){let l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Mt.Composite=eh;Mt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Mt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Mt.prototype.GetterByBindingType=[Mt.prototype._getValue_direct,Mt.prototype._getValue_array,Mt.prototype._getValue_arrayElement,Mt.prototype._getValue_toArray];Mt.prototype.SetterByBindingTypeAndVersioning=[[Mt.prototype._setValue_direct,Mt.prototype._setValue_direct_setNeedsUpdate,Mt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_array,Mt.prototype._setValue_array_setNeedsUpdate,Mt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_arrayElement,Mt.prototype._setValue_arrayElement_setNeedsUpdate,Mt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_fromArray,Mt.prototype._setValue_fromArray_setNeedsUpdate,Mt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Wa=class{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;let r=t.tracks,o=r.length,a=new Array(o),c={endingStart:Ji,endingEnd:Ji};for(let l=0;l!==o;++l){let h=r[l].createInterpolant(null);a[l]=h,h.settings=c}this._interpolantSettings=c,this._interpolants=a,this._propertyBindings=new Array(o),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=$d,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){let i=this._clip.duration,r=e._clip.duration,o=r/i,a=i/r;e.warp(1,o,t),this.warp(a,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let i=this._mixer,r=i.time,o=this.timeScale,a=this._timeScaleInterpolant;a===null&&(a=i._lendControlInterpolant(),this._timeScaleInterpolant=a);let c=a.parameterPositions,l=a.sampleValues;return c[0]=r,c[1]=r+n,l[0]=e/o,l[1]=t/o,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}let r=this._startTime;if(r!==null){let c=(e-r)*n;c<0||n===0?t=0:(this._startTime=null,t=n*c)}t*=this._updateTimeScale(e);let o=this._updateTime(t),a=this._updateWeight(e);if(a>0){let c=this._interpolants,l=this._propertyBindings;switch(this.blendMode){case jd:for(let h=0,u=c.length;h!==u;++h)c[h].evaluate(o),l[h].accumulateAdditive(a);break;case Oc:default:for(let h=0,u=c.length;h!==u;++h)c[h].evaluate(o),l[h].accumulate(i,a)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,i=this.time+e,r=this._loopCount,o=n===Jd;if(e===0)return r===-1?i:o&&(r&1)===1?t-i:i;if(n===Kd){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,o)):this._setEndings(this.repetitions===0,!0,o)),i>=t||i<0){let a=Math.floor(i/t);i-=t*a,r+=Math.abs(a);let c=this.repetitions-r;if(c<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(c===1){let l=e<0;this._setEndings(l,!l,o)}else this._setEndings(!1,!1,o);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:a})}}else this.time=i;if(o&&(r&1)===1)return t-i}return i}_setEndings(e,t,n){let i=this._interpolantSettings;n?(i.endingStart=ji,i.endingEnd=ji):(e?i.endingStart=this.zeroSlopeAtStart?ji:Ji:i.endingStart=Or,t?i.endingEnd=this.zeroSlopeAtEnd?ji:Ji:i.endingEnd=Or)}_scheduleFading(e,t,n){let i=this._mixer,r=i.time,o=this._weightInterpolant;o===null&&(o=i._lendControlInterpolant(),this._weightInterpolant=o);let a=o.parameterPositions,c=o.sampleValues;return a[0]=r,c[0]=t,a[1]=r+e,c[1]=n,this}},Jm=new Float32Array(1),Mo=class extends $n{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){let n=e._localRoot||this._root,i=e._clip.tracks,r=i.length,o=e._propertyBindings,a=e._interpolants,c=n.uuid,l=this._bindingsByRootAndName,h=l[c];h===void 0&&(h={},l[c]=h);for(let u=0;u!==r;++u){let d=i[u],f=d.name,g=h[f];if(g!==void 0)++g.referenceCount,o[u]=g;else{if(g=o[u],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,c,f));continue}let x=t&&t._propertyBindings[u].binding.parsedPath;g=new Ha(Mt.create(n,f,x),d.ValueTypeName,d.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,c,f),o[u]=g}a[u].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,i=e._clip.uuid,r=this._actionsByClip[i];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,i,n)}let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let i=this._actions,r=this._actionsByClip,o=r[t];if(o===void 0)o={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=o;else{let a=o.knownActions;e._byClipCacheIndex=a.length,a.push(e)}e._cacheIndex=i.length,i.push(e),o.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;let r=e._clip.uuid,o=this._actionsByClip,a=o[r],c=a.knownActions,l=c[c.length-1],h=e._byClipCacheIndex;l._byClipCacheIndex=h,c[h]=l,c.pop(),e._byClipCacheIndex=null;let u=a.actionByRoot,d=(e._localRoot||this._root).uuid;delete u[d],c.length===0&&delete o[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){let i=this._bindingsByRootAndName,r=this._bindings,o=i[t];o===void 0&&(o={},i[t]=o),o[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,i=n.rootNode.uuid,r=n.path,o=this._bindingsByRootAndName,a=o[i],c=t[t.length-1],l=e._cacheIndex;c._cacheIndex=l,t[l]=c,t.pop(),delete a[r],Object.keys(a).length===0&&delete o[i]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];return n===void 0&&(n=new po(new Float32Array(2),new Float32Array(2),1,Jm),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,r=t[i];e.__cacheIndex=i,t[i]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){let i=t||this._root,r=i.uuid,o=typeof e=="string"?us.findByName(i,e):e,a=o!==null?o.uuid:e,c=this._actionsByClip[a],l=null;if(n===void 0&&(o!==null?n=o.blendMode:n=Oc),c!==void 0){let u=c.actionByRoot[r];if(u!==void 0&&u.blendMode===n)return u;l=c.knownActions[0],o===null&&(o=l._clip)}if(o===null)return null;let h=new Wa(this,o,t,n);return this._bindAction(h,l),this._addInactiveAction(h,a,r),h}existingAction(e,t){let n=t||this._root,i=n.uuid,r=typeof e=="string"?us.findByName(n,e):e,o=r?r.uuid:e,a=this._actionsByClip[o];return a!==void 0&&a.actionByRoot[i]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,i=this.time+=e,r=Math.sign(e),o=this._accuIndex^=1;for(let l=0;l!==n;++l)t[l]._update(i,e,r,o);let a=this._bindings,c=this._nActiveBindings;for(let l=0;l!==c;++l)a[l].apply(o);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){let o=r.knownActions;for(let a=0,c=o.length;a!==c;++a){let l=o[a];this._deactivateAction(l);let h=l._cacheIndex,u=t[t.length-1];l._cacheIndex=null,l._byClipCacheIndex=null,u._cacheIndex=h,t[h]=u,t.pop(),this._removeInactiveBindingsForAction(l)}delete i[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let o in n){let a=n[o].actionByRoot,c=a[t];c!==void 0&&(this._deactivateAction(c),this._removeInactiveAction(c))}let i=this._bindingsByRootAndName,r=i[t];if(r!==void 0)for(let o in r){let a=r[o];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(e,t){let n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}};function Sh(s,e,t,n){let i=jm(n);switch(t){case uh:return s*e;case oc:return s*e/i.components*i.byteLength;case ac:return s*e/i.components*i.byteLength;case fh:return s*e*2/i.components*i.byteLength;case cc:return s*e*2/i.components*i.byteLength;case dh:return s*e*3/i.components*i.byteLength;case Sn:return s*e*4/i.components*i.byteLength;case lc:return s*e*4/i.components*i.byteLength;case So:case wo:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Ao:case Eo:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case uc:case fc:return Math.max(s,16)*Math.max(e,8)/4;case hc:case dc:return Math.max(s,8)*Math.max(e,8)/2;case pc:case mc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case gc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case xc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case yc:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case vc:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case _c:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case bc:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Mc:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Tc:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case Sc:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case wc:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case Ac:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case Ec:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case Rc:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case Cc:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Ic:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case Pc:case Lc:case Dc:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Uc:case Nc:return Math.ceil(s/4)*Math.ceil(e/4)*8;case Fc:case Bc:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function jm(s){switch(s){case Hn:case ah:return{byteLength:1,components:1};case cr:case ch:case lr:return{byteLength:2,components:1};case sc:case rc:return{byteLength:2,components:4};case zi:case ic:case Dn:return{byteLength:4,components:1};case lh:case hh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");function Wf(){let s=null,e=!1,t=null,n=null;function i(r,o){t(r,o),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function eg(s){let e=new WeakMap;function t(a,c){let l=a.array,h=a.usage,u=l.byteLength,d=s.createBuffer();s.bindBuffer(c,d),s.bufferData(c,l,h),a.onUploadCallback();let f;if(l instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=s.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=s.SHORT;else if(l instanceof Uint32Array)f=s.UNSIGNED_INT;else if(l instanceof Int32Array)f=s.INT;else if(l instanceof Int8Array)f=s.BYTE;else if(l instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,c,l){let h=c.array,u=c.updateRanges;if(s.bindBuffer(l,a),u.length===0)s.bufferSubData(l,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){let g=u[d],x=u[f];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++d,u[d]=x)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){let x=u[f];s.bufferSubData(l,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=e.get(a);c&&(s.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:i,remove:r,update:o}}var tg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ng=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ig=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,sg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,rg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,og=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ag=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,cg=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,lg=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,hg=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,ug=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,dg=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,fg=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,pg=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,mg=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,gg=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,xg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,yg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,vg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,_g=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,bg=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Mg=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Tg=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Sg=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,wg=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Ag=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Eg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Rg=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Cg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Ig=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Pg="gl_FragColor = linearToOutputTexel( gl_FragColor );",Lg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Dg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Ug=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Ng=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Fg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Bg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Og=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,kg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,zg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Vg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Gg=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Hg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Wg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Xg=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,qg=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Yg=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Zg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Kg=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,$g=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Jg=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,jg=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Qg=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,e0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,t0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,n0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,i0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,s0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,r0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,o0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,a0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,c0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,l0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,h0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,u0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,d0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,f0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,p0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,m0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,g0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,x0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,y0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,v0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,_0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,b0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,M0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,T0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,S0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,w0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,A0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,E0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,R0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,C0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,I0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,P0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,L0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,D0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,U0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,N0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,F0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,B0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,O0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,k0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,z0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,V0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,G0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,H0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,W0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,X0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,q0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Y0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Z0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,K0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,$0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,J0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,j0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Q0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,ex=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,tx=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,nx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ix=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,rx=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ox=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,ax=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,cx=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,lx=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,hx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,ux=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dx=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,fx=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,px=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,mx=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gx=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xx=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,yx=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,vx=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_x=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,bx=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Mx=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Tx=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sx=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,wx=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ax=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ex=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Rx=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Cx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ix=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Px=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Lx=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Dx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,st={alphahash_fragment:tg,alphahash_pars_fragment:ng,alphamap_fragment:ig,alphamap_pars_fragment:sg,alphatest_fragment:rg,alphatest_pars_fragment:og,aomap_fragment:ag,aomap_pars_fragment:cg,batching_pars_vertex:lg,batching_vertex:hg,begin_vertex:ug,beginnormal_vertex:dg,bsdfs:fg,iridescence_fragment:pg,bumpmap_pars_fragment:mg,clipping_planes_fragment:gg,clipping_planes_pars_fragment:xg,clipping_planes_pars_vertex:yg,clipping_planes_vertex:vg,color_fragment:_g,color_pars_fragment:bg,color_pars_vertex:Mg,color_vertex:Tg,common:Sg,cube_uv_reflection_fragment:wg,defaultnormal_vertex:Ag,displacementmap_pars_vertex:Eg,displacementmap_vertex:Rg,emissivemap_fragment:Cg,emissivemap_pars_fragment:Ig,colorspace_fragment:Pg,colorspace_pars_fragment:Lg,envmap_fragment:Dg,envmap_common_pars_fragment:Ug,envmap_pars_fragment:Ng,envmap_pars_vertex:Fg,envmap_physical_pars_fragment:Yg,envmap_vertex:Bg,fog_vertex:Og,fog_pars_vertex:kg,fog_fragment:zg,fog_pars_fragment:Vg,gradientmap_pars_fragment:Gg,lightmap_pars_fragment:Hg,lights_lambert_fragment:Wg,lights_lambert_pars_fragment:Xg,lights_pars_begin:qg,lights_toon_fragment:Zg,lights_toon_pars_fragment:Kg,lights_phong_fragment:$g,lights_phong_pars_fragment:Jg,lights_physical_fragment:jg,lights_physical_pars_fragment:Qg,lights_fragment_begin:e0,lights_fragment_maps:t0,lights_fragment_end:n0,logdepthbuf_fragment:i0,logdepthbuf_pars_fragment:s0,logdepthbuf_pars_vertex:r0,logdepthbuf_vertex:o0,map_fragment:a0,map_pars_fragment:c0,map_particle_fragment:l0,map_particle_pars_fragment:h0,metalnessmap_fragment:u0,metalnessmap_pars_fragment:d0,morphinstance_vertex:f0,morphcolor_vertex:p0,morphnormal_vertex:m0,morphtarget_pars_vertex:g0,morphtarget_vertex:x0,normal_fragment_begin:y0,normal_fragment_maps:v0,normal_pars_fragment:_0,normal_pars_vertex:b0,normal_vertex:M0,normalmap_pars_fragment:T0,clearcoat_normal_fragment_begin:S0,clearcoat_normal_fragment_maps:w0,clearcoat_pars_fragment:A0,iridescence_pars_fragment:E0,opaque_fragment:R0,packing:C0,premultiplied_alpha_fragment:I0,project_vertex:P0,dithering_fragment:L0,dithering_pars_fragment:D0,roughnessmap_fragment:U0,roughnessmap_pars_fragment:N0,shadowmap_pars_fragment:F0,shadowmap_pars_vertex:B0,shadowmap_vertex:O0,shadowmask_pars_fragment:k0,skinbase_vertex:z0,skinning_pars_vertex:V0,skinning_vertex:G0,skinnormal_vertex:H0,specularmap_fragment:W0,specularmap_pars_fragment:X0,tonemapping_fragment:q0,tonemapping_pars_fragment:Y0,transmission_fragment:Z0,transmission_pars_fragment:K0,uv_pars_fragment:$0,uv_pars_vertex:J0,uv_vertex:j0,worldpos_vertex:Q0,background_vert:ex,background_frag:tx,backgroundCube_vert:nx,backgroundCube_frag:ix,cube_vert:sx,cube_frag:rx,depth_vert:ox,depth_frag:ax,distanceRGBA_vert:cx,distanceRGBA_frag:lx,equirect_vert:hx,equirect_frag:ux,linedashed_vert:dx,linedashed_frag:fx,meshbasic_vert:px,meshbasic_frag:mx,meshlambert_vert:gx,meshlambert_frag:xx,meshmatcap_vert:yx,meshmatcap_frag:vx,meshnormal_vert:_x,meshnormal_frag:bx,meshphong_vert:Mx,meshphong_frag:Tx,meshphysical_vert:Sx,meshphysical_frag:wx,meshtoon_vert:Ax,meshtoon_frag:Ex,points_vert:Rx,points_frag:Cx,shadow_vert:Ix,shadow_frag:Px,sprite_vert:Lx,sprite_frag:Dx},ge={common:{diffuse:{value:new Ae(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new je},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new je}},envmap:{envMap:{value:null},envMapRotation:{value:new je},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new je}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new je}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new je},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new je},normalScale:{value:new ne(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new je},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new je}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new je}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new je}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ae(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ae(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0},uvTransform:{value:new je}},sprite:{diffuse:{value:new Ae(16777215)},opacity:{value:1},center:{value:new ne(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new je},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0}}},si={basic:{uniforms:Qt([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.fog]),vertexShader:st.meshbasic_vert,fragmentShader:st.meshbasic_frag},lambert:{uniforms:Qt([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,ge.lights,{emissive:{value:new Ae(0)}}]),vertexShader:st.meshlambert_vert,fragmentShader:st.meshlambert_frag},phong:{uniforms:Qt([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,ge.lights,{emissive:{value:new Ae(0)},specular:{value:new Ae(1118481)},shininess:{value:30}}]),vertexShader:st.meshphong_vert,fragmentShader:st.meshphong_frag},standard:{uniforms:Qt([ge.common,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.roughnessmap,ge.metalnessmap,ge.fog,ge.lights,{emissive:{value:new Ae(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:st.meshphysical_vert,fragmentShader:st.meshphysical_frag},toon:{uniforms:Qt([ge.common,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.gradientmap,ge.fog,ge.lights,{emissive:{value:new Ae(0)}}]),vertexShader:st.meshtoon_vert,fragmentShader:st.meshtoon_frag},matcap:{uniforms:Qt([ge.common,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,{matcap:{value:null}}]),vertexShader:st.meshmatcap_vert,fragmentShader:st.meshmatcap_frag},points:{uniforms:Qt([ge.points,ge.fog]),vertexShader:st.points_vert,fragmentShader:st.points_frag},dashed:{uniforms:Qt([ge.common,ge.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:st.linedashed_vert,fragmentShader:st.linedashed_frag},depth:{uniforms:Qt([ge.common,ge.displacementmap]),vertexShader:st.depth_vert,fragmentShader:st.depth_frag},normal:{uniforms:Qt([ge.common,ge.bumpmap,ge.normalmap,ge.displacementmap,{opacity:{value:1}}]),vertexShader:st.meshnormal_vert,fragmentShader:st.meshnormal_frag},sprite:{uniforms:Qt([ge.sprite,ge.fog]),vertexShader:st.sprite_vert,fragmentShader:st.sprite_frag},background:{uniforms:{uvTransform:{value:new je},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:st.background_vert,fragmentShader:st.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new je}},vertexShader:st.backgroundCube_vert,fragmentShader:st.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:st.cube_vert,fragmentShader:st.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:st.equirect_vert,fragmentShader:st.equirect_frag},distanceRGBA:{uniforms:Qt([ge.common,ge.displacementmap,{referencePosition:{value:new w},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:st.distanceRGBA_vert,fragmentShader:st.distanceRGBA_frag},shadow:{uniforms:Qt([ge.lights,ge.fog,{color:{value:new Ae(0)},opacity:{value:1}}]),vertexShader:st.shadow_vert,fragmentShader:st.shadow_frag}};si.physical={uniforms:Qt([si.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new je},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new je},clearcoatNormalScale:{value:new ne(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new je},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new je},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new je},sheen:{value:0},sheenColor:{value:new Ae(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new je},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new je},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new je},transmissionSamplerSize:{value:new ne},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new je},attenuationDistance:{value:0},attenuationColor:{value:new Ae(0)},specularColor:{value:new Ae(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new je},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new je},anisotropyVector:{value:new ne},anisotropyMap:{value:null},anisotropyMapTransform:{value:new je}}]),vertexShader:st.meshphysical_vert,fragmentShader:st.meshphysical_frag};var kc={r:0,b:0,g:0},ys=new sn,Ux=new Fe;function Nx(s,e,t,n,i,r,o){let a=new Ae(0),c=r===!0?0:1,l,h,u=null,d=0,f=null;function g(b){let y=b.isScene===!0?b.background:null;return y&&y.isTexture&&(y=(b.backgroundBlurriness>0?t:e).get(y)),y}function x(b){let y=!1,A=g(b);A===null?p(a,c):A&&A.isColor&&(p(A,1),y=!0);let R=s.xr.getEnvironmentBlendMode();R==="additive"?n.buffers.color.setClear(0,0,0,1,o):R==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(s.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function m(b,y){let A=g(y);A&&(A.isCubeTexture||A.mapping===To)?(h===void 0&&(h=new We(new Ue(1,1,1),new Zt({name:"BackgroundCubeMaterial",uniforms:xs(si.backgroundCube.uniforms),vertexShader:si.backgroundCube.vertexShader,fragmentShader:si.backgroundCube.fragmentShader,side:on,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(R,C,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),ys.copy(y.backgroundRotation),ys.x*=-1,ys.y*=-1,ys.z*=-1,A.isCubeTexture&&A.isRenderTargetTexture===!1&&(ys.y*=-1,ys.z*=-1),h.material.uniforms.envMap.value=A,h.material.uniforms.flipEnvMap.value=A.isCubeTexture&&A.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Ux.makeRotationFromEuler(ys)),h.material.toneMapped=lt.getTransfer(A.colorSpace)!==vt,(u!==A||d!==A.version||f!==s.toneMapping)&&(h.material.needsUpdate=!0,u=A,d=A.version,f=s.toneMapping),h.layers.enableAll(),b.unshift(h,h.geometry,h.material,0,0,null)):A&&A.isTexture&&(l===void 0&&(l=new We(new Ln(2,2),new Zt({name:"BackgroundMaterial",uniforms:xs(si.background.uniforms),vertexShader:si.background.vertexShader,fragmentShader:si.background.fragmentShader,side:bn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=A,l.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,l.material.toneMapped=lt.getTransfer(A.colorSpace)!==vt,A.matrixAutoUpdate===!0&&A.updateMatrix(),l.material.uniforms.uvTransform.value.copy(A.matrix),(u!==A||d!==A.version||f!==s.toneMapping)&&(l.material.needsUpdate=!0,u=A,d=A.version,f=s.toneMapping),l.layers.enableAll(),b.unshift(l,l.geometry,l.material,0,0,null))}function p(b,y){b.getRGB(kc,_h(s)),n.buffers.color.setClear(kc.r,kc.g,kc.b,y,o)}function v(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(b,y=1){a.set(b),c=y,p(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(b){c=b,p(a,c)},render:x,addToRenderList:m,dispose:v}}function Fx(s,e){let t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=d(null),r=i,o=!1;function a(_,P,U,z,N){let B=!1,I=u(z,U,P);r!==I&&(r=I,l(r.object)),B=f(_,z,U,N),B&&g(_,z,U,N),N!==null&&e.update(N,s.ELEMENT_ARRAY_BUFFER),(B||o)&&(o=!1,y(_,P,U,z),N!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(N).buffer))}function c(){return s.createVertexArray()}function l(_){return s.bindVertexArray(_)}function h(_){return s.deleteVertexArray(_)}function u(_,P,U){let z=U.wireframe===!0,N=n[_.id];N===void 0&&(N={},n[_.id]=N);let B=N[P.id];B===void 0&&(B={},N[P.id]=B);let I=B[z];return I===void 0&&(I=d(c()),B[z]=I),I}function d(_){let P=[],U=[],z=[];for(let N=0;N<t;N++)P[N]=0,U[N]=0,z[N]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:U,attributeDivisors:z,object:_,attributes:{},index:null}}function f(_,P,U,z){let N=r.attributes,B=P.attributes,I=0,H=U.getAttributes();for(let G in H)if(H[G].location>=0){let ue=N[G],me=B[G];if(me===void 0&&(G==="instanceMatrix"&&_.instanceMatrix&&(me=_.instanceMatrix),G==="instanceColor"&&_.instanceColor&&(me=_.instanceColor)),ue===void 0||ue.attribute!==me||me&&ue.data!==me.data)return!0;I++}return r.attributesNum!==I||r.index!==z}function g(_,P,U,z){let N={},B=P.attributes,I=0,H=U.getAttributes();for(let G in H)if(H[G].location>=0){let ue=B[G];ue===void 0&&(G==="instanceMatrix"&&_.instanceMatrix&&(ue=_.instanceMatrix),G==="instanceColor"&&_.instanceColor&&(ue=_.instanceColor));let me={};me.attribute=ue,ue&&ue.data&&(me.data=ue.data),N[G]=me,I++}r.attributes=N,r.attributesNum=I,r.index=z}function x(){let _=r.newAttributes;for(let P=0,U=_.length;P<U;P++)_[P]=0}function m(_){p(_,0)}function p(_,P){let U=r.newAttributes,z=r.enabledAttributes,N=r.attributeDivisors;U[_]=1,z[_]===0&&(s.enableVertexAttribArray(_),z[_]=1),N[_]!==P&&(s.vertexAttribDivisor(_,P),N[_]=P)}function v(){let _=r.newAttributes,P=r.enabledAttributes;for(let U=0,z=P.length;U<z;U++)P[U]!==_[U]&&(s.disableVertexAttribArray(U),P[U]=0)}function b(_,P,U,z,N,B,I){I===!0?s.vertexAttribIPointer(_,P,U,N,B):s.vertexAttribPointer(_,P,U,z,N,B)}function y(_,P,U,z){x();let N=z.attributes,B=U.getAttributes(),I=P.defaultAttributeValues;for(let H in B){let G=B[H];if(G.location>=0){let se=N[H];if(se===void 0&&(H==="instanceMatrix"&&_.instanceMatrix&&(se=_.instanceMatrix),H==="instanceColor"&&_.instanceColor&&(se=_.instanceColor)),se!==void 0){let ue=se.normalized,me=se.itemSize,Be=e.get(se);if(Be===void 0)continue;let Ye=Be.buffer,ut=Be.type,Se=Be.bytesPerElement,q=ut===s.INT||ut===s.UNSIGNED_INT||se.gpuType===ic;if(se.isInterleavedBufferAttribute){let J=se.data,_e=J.stride,Le=se.offset;if(J.isInstancedInterleavedBuffer){for(let we=0;we<G.locationSize;we++)p(G.location+we,J.meshPerAttribute);_.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let we=0;we<G.locationSize;we++)m(G.location+we);s.bindBuffer(s.ARRAY_BUFFER,Ye);for(let we=0;we<G.locationSize;we++)b(G.location+we,me/G.locationSize,ut,ue,_e*Se,(Le+me/G.locationSize*we)*Se,q)}else{if(se.isInstancedBufferAttribute){for(let J=0;J<G.locationSize;J++)p(G.location+J,se.meshPerAttribute);_.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let J=0;J<G.locationSize;J++)m(G.location+J);s.bindBuffer(s.ARRAY_BUFFER,Ye);for(let J=0;J<G.locationSize;J++)b(G.location+J,me/G.locationSize,ut,ue,me*Se,me/G.locationSize*J*Se,q)}}else if(I!==void 0){let ue=I[H];if(ue!==void 0)switch(ue.length){case 2:s.vertexAttrib2fv(G.location,ue);break;case 3:s.vertexAttrib3fv(G.location,ue);break;case 4:s.vertexAttrib4fv(G.location,ue);break;default:s.vertexAttrib1fv(G.location,ue)}}}}v()}function A(){T();for(let _ in n){let P=n[_];for(let U in P){let z=P[U];for(let N in z)h(z[N].object),delete z[N];delete P[U]}delete n[_]}}function R(_){if(n[_.id]===void 0)return;let P=n[_.id];for(let U in P){let z=P[U];for(let N in z)h(z[N].object),delete z[N];delete P[U]}delete n[_.id]}function C(_){for(let P in n){let U=n[P];if(U[_.id]===void 0)continue;let z=U[_.id];for(let N in z)h(z[N].object),delete z[N];delete U[_.id]}}function T(){M(),o=!0,r!==i&&(r=i,l(r.object))}function M(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:T,resetDefaultState:M,dispose:A,releaseStatesOfGeometry:R,releaseStatesOfProgram:C,initAttributes:x,enableAttribute:m,disableUnusedAttributes:v}}function Bx(s,e,t){let n;function i(l){n=l}function r(l,h){s.drawArrays(n,l,h),t.update(h,n,1)}function o(l,h,u){u!==0&&(s.drawArraysInstanced(n,l,h,u),t.update(h,n,u))}function a(l,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,h,0,u);let f=0;for(let g=0;g<u;g++)f+=h[g];t.update(f,n,1)}function c(l,h,u,d){if(u===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<l.length;g++)o(l[g],h[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(n,l,0,h,0,d,0,u);let g=0;for(let x=0;x<u;x++)g+=h[x]*d[x];t.update(g,n,1)}}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function Ox(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){let C=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(C){return!(C!==Sn&&n.convert(C)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(C){let T=C===lr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==Hn&&n.convert(C)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==Dn&&!T)}function c(C){if(C==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",h=c(l);h!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);let u=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),v=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),b=s.getParameter(s.MAX_VARYING_VECTORS),y=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),A=g>0,R=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:v,maxVaryings:b,maxFragmentUniforms:y,vertexTextures:A,maxSamples:R}}function kx(s){let e=this,t=null,n=0,i=!1,r=!1,o=new qn,a=new je,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){let g=u.clippingPlanes,x=u.clipIntersection,m=u.clipShadows,p=s.get(u);if(!i||g===null||g.length===0||r&&!m)r?h(null):l();else{let v=r?0:n,b=v*4,y=p.clippingState||null;c.value=y,y=h(g,d,b,f);for(let A=0;A!==b;++A)y[A]=t[A];p.clippingState=y,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=v}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,g){let x=u!==null?u.length:0,m=null;if(x!==0){if(m=c.value,g!==!0||m===null){let p=f+x*4,v=d.matrixWorldInverse;a.getNormalMatrix(v),(m===null||m.length<p)&&(m=new Float32Array(p));for(let b=0,y=f;b!==x;++b,y+=4)o.copy(u[b]).applyMatrix4(v,a),o.normal.toArray(m,y),m[y+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}function zx(s){let e=new WeakMap;function t(o,a){return a===ec?o.mapping=ps:a===tc&&(o.mapping=ms),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===ec||a===tc)if(e.has(o)){let c=e.get(o).texture;return t(c,o.mapping)}else{let c=o.image;if(c&&c.height>0){let l=new Aa(c.height);return l.fromEquirectangularTexture(s,o),e.set(o,l),o.addEventListener("dispose",i),t(l.texture,o.mapping)}else return null}}return o}function i(o){let a=o.target;a.removeEventListener("dispose",i);let c=e.get(a);c!==void 0&&(e.delete(a),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var pr=4,bf=[.125,.215,.35,.446,.526,.582],bs=20,wh=new ds,Mf=new Ae,Ah=null,Eh=0,Rh=0,Ch=!1,_s=(1+Math.sqrt(5))/2,fr=1/_s,Tf=[new w(-_s,fr,0),new w(_s,fr,0),new w(-fr,0,_s),new w(fr,0,_s),new w(0,_s,-fr),new w(0,_s,fr),new w(-1,1,-1),new w(1,1,-1),new w(-1,1,1),new w(1,1,1)],Vx=new w,Gc=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100,r={}){let{size:o=256,position:a=Vx}=r;Ah=this._renderer.getRenderTarget(),Eh=this._renderer.getActiveCubeFace(),Rh=this._renderer.getActiveMipmapLevel(),Ch=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,i,c,a),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Af(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=wf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Ah,Eh,Rh),this._renderer.xr.enabled=Ch,e.scissorTest=!1,zc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ps||e.mapping===ms?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ah=this._renderer.getRenderTarget(),Eh=this._renderer.getActiveCubeFace(),Rh=this._renderer.getActiveMipmapLevel(),Ch=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:nn,minFilter:nn,generateMipmaps:!1,type:lr,format:Sn,colorSpace:Yt,depthBuffer:!1},i=Sf(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Sf(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Gx(r)),this._blurMaterial=Hx(r,e,t)}return i}_compileMaterial(e){let t=new We(this._lodPlanes[0],e);this._renderer.compile(t,wh)}_sceneToCubeUV(e,t,n,i,r){let c=new Nt(90,1,t,n),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(Mf),u.toneMapping=Ai,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(i),u.clearDepth(),u.setRenderTarget(null));let x=new Ge({name:"PMREM.Background",side:on,depthWrite:!1,depthTest:!1}),m=new We(new Ue,x),p=!1,v=e.background;v?v.isColor&&(x.color.copy(v),e.background=null,p=!0):(x.color.copy(Mf),p=!0);for(let b=0;b<6;b++){let y=b%3;y===0?(c.up.set(0,l[b],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[b],r.y,r.z)):y===1?(c.up.set(0,0,l[b]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[b],r.z)):(c.up.set(0,l[b],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[b]));let A=this._cubeSize;zc(i,y*A,b>2?A:0,A,A),u.setRenderTarget(i),p&&u.render(m,c),u.render(e,c)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=f,u.autoClear=d,e.background=v}_textureToCubeUV(e,t){let n=this._renderer,i=e.mapping===ps||e.mapping===ms;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Af()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=wf());let r=i?this._cubemapMaterial:this._equirectMaterial,o=new We(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let c=this._cubeSize;zc(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(o,wh)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let i=this._lodPlanes.length;for(let r=1;r<i;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Tf[(i-r-1)%Tf.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,i,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,i,"latitudinal",r),this._halfBlur(o,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,o,a){let c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,u=new We(this._lodPlanes[i],l),d=l.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*bs-1),x=r/g,m=isFinite(r)?1+Math.floor(h*x):bs;m>bs&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${bs}`);let p=[],v=0;for(let C=0;C<bs;++C){let T=C/x,M=Math.exp(-T*T/2);p.push(M),C===0?v+=M:C<m&&(v+=2*M)}for(let C=0;C<p.length;C++)p[C]=p[C]/v;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:b}=this;d.dTheta.value=g,d.mipInt.value=b-n;let y=this._sizeLods[i],A=3*y*(i>b-pr?i-b+pr:0),R=4*(this._cubeSize-y);zc(t,A,R,3*y,2*y),c.setRenderTarget(t),c.render(u,wh)}};function Gx(s){let e=[],t=[],n=[],i=s,r=s-pr+1+bf.length;for(let o=0;o<r;o++){let a=Math.pow(2,i);t.push(a);let c=1/a;o>s-pr?c=bf[o-s+pr-1]:o===0&&(c=0),n.push(c);let l=1/(a-2),h=-l,u=1+l,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,x=3,m=2,p=1,v=new Float32Array(x*g*f),b=new Float32Array(m*g*f),y=new Float32Array(p*g*f);for(let R=0;R<f;R++){let C=R%3*2/3-1,T=R>2?0:-1,M=[C,T,0,C+2/3,T,0,C+2/3,T+1,0,C,T,0,C+2/3,T+1,0,C,T+1,0];v.set(M,x*g*R),b.set(d,m*g*R);let _=[R,R,R,R,R,R];y.set(_,p*g*R)}let A=new mt;A.setAttribute("position",new Tt(v,x)),A.setAttribute("uv",new Tt(b,m)),A.setAttribute("faceIndex",new Tt(y,p)),e.push(A),i>pr&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Sf(s,e,t){let n=new Jn(s,e,t);return n.texture.mapping=To,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function zc(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function Hx(s,e,t){let n=new Float32Array(bs),i=new w(0,1,0);return new Zt({name:"SphericalGaussianBlur",defines:{n:bs,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:wi,depthTest:!1,depthWrite:!1})}function wf(){return new Zt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:wi,depthTest:!1,depthWrite:!1})}function Af(){return new Zt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:wi,depthTest:!1,depthWrite:!1})}function kh(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Wx(s){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let c=a.mapping,l=c===ec||c===tc,h=c===ps||c===ms;if(l||h){let u=e.get(a),d=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return t===null&&(t=new Gc(s)),u=l?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{let f=a.image;return l&&f&&f.height>0||h&&f&&i(f)?(t===null&&(t=new Gc(s)),u=l?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function i(a){let c=0,l=6;for(let h=0;h<l;h++)a[h]!==void 0&&c++;return c===l}function r(a){let c=a.target;c.removeEventListener("dispose",r);let l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Xx(s){let e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let i=t(n);return i===null&&$s("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function qx(s,e,t,n){let i={},r=new WeakMap;function o(u){let d=u.target;d.index!==null&&e.remove(d.index);for(let g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete i[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(u,d){return i[d.id]===!0||(d.addEventListener("dispose",o),i[d.id]=!0,t.memory.geometries++),d}function c(u){let d=u.attributes;for(let f in d)e.update(d[f],s.ARRAY_BUFFER)}function l(u){let d=[],f=u.index,g=u.attributes.position,x=0;if(f!==null){let v=f.array;x=f.version;for(let b=0,y=v.length;b<y;b+=3){let A=v[b+0],R=v[b+1],C=v[b+2];d.push(A,R,R,C,C,A)}}else if(g!==void 0){let v=g.array;x=g.version;for(let b=0,y=v.length/3-1;b<y;b+=3){let A=b+0,R=b+1,C=b+2;d.push(A,R,R,C,C,A)}}else return;let m=new(vh(d)?Wr:Hr)(d,1);m.version=x;let p=r.get(u);p&&e.remove(p),r.set(u,m)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&l(u)}else l(u);return r.get(u)}return{get:a,update:c,getWireframeAttribute:h}}function Yx(s,e,t){let n;function i(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function c(d,f){s.drawElements(n,f,r,d*o),t.update(f,n,1)}function l(d,f,g){g!==0&&(s.drawElementsInstanced(n,f,r,d*o,g),t.update(f,n,g))}function h(d,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,n,1)}function u(d,f,g,x){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<d.length;p++)l(d[p]/o,f[p],x[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,x,0,g);let p=0;for(let v=0;v<g;v++)p+=f[v]*x[v];t.update(p,n,1)}}this.setMode=i,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Zx(s){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case s.TRIANGLES:t.triangles+=a*(r/3);break;case s.LINES:t.lines+=a*(r/2);break;case s.LINE_STRIP:t.lines+=a*(r-1);break;case s.LINE_LOOP:t.lines+=a*r;break;case s.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function Kx(s,e,t){let n=new WeakMap,i=new ft;function r(o,a,c){let l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(a);if(d===void 0||d.count!==u){let M=function(){C.dispose(),n.delete(a),a.removeEventListener("dispose",M)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],v=a.morphAttributes.color||[],b=0;f===!0&&(b=1),g===!0&&(b=2),x===!0&&(b=3);let y=a.attributes.position.count*b,A=1;y>e.maxTextureSize&&(A=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let R=new Float32Array(y*A*4*u),C=new Vr(R,y,A,u);C.type=Dn,C.needsUpdate=!0;let T=b*4;for(let _=0;_<u;_++){let P=m[_],U=p[_],z=v[_],N=y*A*4*_;for(let B=0;B<P.count;B++){let I=B*T;f===!0&&(i.fromBufferAttribute(P,B),R[N+I+0]=i.x,R[N+I+1]=i.y,R[N+I+2]=i.z,R[N+I+3]=0),g===!0&&(i.fromBufferAttribute(U,B),R[N+I+4]=i.x,R[N+I+5]=i.y,R[N+I+6]=i.z,R[N+I+7]=0),x===!0&&(i.fromBufferAttribute(z,B),R[N+I+8]=i.x,R[N+I+9]=i.y,R[N+I+10]=i.z,R[N+I+11]=z.itemSize===4?i.w:1)}}d={count:u,texture:C,size:new ne(y,A)},n.set(a,d),a.addEventListener("dispose",M)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(s,"morphTexture",o.morphTexture,t);else{let f=0;for(let x=0;x<l.length;x++)f+=l[x];let g=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(s,"morphTargetBaseInfluence",g),c.getUniforms().setValue(s,"morphTargetInfluences",l)}c.getUniforms().setValue(s,"morphTargetsTexture",d.texture,t),c.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function $x(s,e,t,n){let i=new WeakMap;function r(c){let l=n.render.frame,h=c.geometry,u=e.get(c,h);if(i.get(u)!==l&&(e.update(u),i.set(u,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),i.get(c)!==l&&(t.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,s.ARRAY_BUFFER),i.set(c,l))),c.isSkinnedMesh){let d=c.skeleton;i.get(d)!==l&&(d.update(),i.set(d,l))}return u}function o(){i=new WeakMap}function a(c){let l=c.target;l.removeEventListener("dispose",a),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:o}}var Xf=new zt,Ef=new eo(1,1),qf=new Vr,Yf=new Sa,Zf=new qr,Rf=[],Cf=[],If=new Float32Array(16),Pf=new Float32Array(9),Lf=new Float32Array(4);function gr(s,e,t){let n=s[0];if(n<=0||n>0)return s;let i=e*t,r=Rf[i];if(r===void 0&&(r=new Float32Array(i),Rf[i]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,s[o].toArray(r,a)}return r}function Gt(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function Ht(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function Wc(s,e){let t=Cf[e];t===void 0&&(t=new Int32Array(e),Cf[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function Jx(s,e){let t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function jx(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;s.uniform2fv(this.addr,e),Ht(t,e)}}function Qx(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Gt(t,e))return;s.uniform3fv(this.addr,e),Ht(t,e)}}function ey(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;s.uniform4fv(this.addr,e),Ht(t,e)}}function ty(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(Gt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),Ht(t,e)}else{if(Gt(t,n))return;Lf.set(n),s.uniformMatrix2fv(this.addr,!1,Lf),Ht(t,n)}}function ny(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(Gt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),Ht(t,e)}else{if(Gt(t,n))return;Pf.set(n),s.uniformMatrix3fv(this.addr,!1,Pf),Ht(t,n)}}function iy(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(Gt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),Ht(t,e)}else{if(Gt(t,n))return;If.set(n),s.uniformMatrix4fv(this.addr,!1,If),Ht(t,n)}}function sy(s,e){let t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function ry(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;s.uniform2iv(this.addr,e),Ht(t,e)}}function oy(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Gt(t,e))return;s.uniform3iv(this.addr,e),Ht(t,e)}}function ay(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;s.uniform4iv(this.addr,e),Ht(t,e)}}function cy(s,e){let t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function ly(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;s.uniform2uiv(this.addr,e),Ht(t,e)}}function hy(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Gt(t,e))return;s.uniform3uiv(this.addr,e),Ht(t,e)}}function uy(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;s.uniform4uiv(this.addr,e),Ht(t,e)}}function dy(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(Ef.compareFunction=gh,r=Ef):r=Xf,t.setTexture2D(e||r,i)}function fy(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Yf,i)}function py(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Zf,i)}function my(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||qf,i)}function gy(s){switch(s){case 5126:return Jx;case 35664:return jx;case 35665:return Qx;case 35666:return ey;case 35674:return ty;case 35675:return ny;case 35676:return iy;case 5124:case 35670:return sy;case 35667:case 35671:return ry;case 35668:case 35672:return oy;case 35669:case 35673:return ay;case 5125:return cy;case 36294:return ly;case 36295:return hy;case 36296:return uy;case 35678:case 36198:case 36298:case 36306:case 35682:return dy;case 35679:case 36299:case 36307:return fy;case 35680:case 36300:case 36308:case 36293:return py;case 36289:case 36303:case 36311:case 36292:return my}}function xy(s,e){s.uniform1fv(this.addr,e)}function yy(s,e){let t=gr(e,this.size,2);s.uniform2fv(this.addr,t)}function vy(s,e){let t=gr(e,this.size,3);s.uniform3fv(this.addr,t)}function _y(s,e){let t=gr(e,this.size,4);s.uniform4fv(this.addr,t)}function by(s,e){let t=gr(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function My(s,e){let t=gr(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function Ty(s,e){let t=gr(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function Sy(s,e){s.uniform1iv(this.addr,e)}function wy(s,e){s.uniform2iv(this.addr,e)}function Ay(s,e){s.uniform3iv(this.addr,e)}function Ey(s,e){s.uniform4iv(this.addr,e)}function Ry(s,e){s.uniform1uiv(this.addr,e)}function Cy(s,e){s.uniform2uiv(this.addr,e)}function Iy(s,e){s.uniform3uiv(this.addr,e)}function Py(s,e){s.uniform4uiv(this.addr,e)}function Ly(s,e,t){let n=this.cache,i=e.length,r=Wc(t,i);Gt(n,r)||(s.uniform1iv(this.addr,r),Ht(n,r));for(let o=0;o!==i;++o)t.setTexture2D(e[o]||Xf,r[o])}function Dy(s,e,t){let n=this.cache,i=e.length,r=Wc(t,i);Gt(n,r)||(s.uniform1iv(this.addr,r),Ht(n,r));for(let o=0;o!==i;++o)t.setTexture3D(e[o]||Yf,r[o])}function Uy(s,e,t){let n=this.cache,i=e.length,r=Wc(t,i);Gt(n,r)||(s.uniform1iv(this.addr,r),Ht(n,r));for(let o=0;o!==i;++o)t.setTextureCube(e[o]||Zf,r[o])}function Ny(s,e,t){let n=this.cache,i=e.length,r=Wc(t,i);Gt(n,r)||(s.uniform1iv(this.addr,r),Ht(n,r));for(let o=0;o!==i;++o)t.setTexture2DArray(e[o]||qf,r[o])}function Fy(s){switch(s){case 5126:return xy;case 35664:return yy;case 35665:return vy;case 35666:return _y;case 35674:return by;case 35675:return My;case 35676:return Ty;case 5124:case 35670:return Sy;case 35667:case 35671:return wy;case 35668:case 35672:return Ay;case 35669:case 35673:return Ey;case 5125:return Ry;case 36294:return Cy;case 36295:return Iy;case 36296:return Py;case 35678:case 36198:case 36298:case 36306:case 35682:return Ly;case 35679:case 36299:case 36307:return Dy;case 35680:case 36300:case 36308:case 36293:return Uy;case 36289:case 36303:case 36311:case 36292:return Ny}}var Ph=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=gy(t.type)}},Lh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Fy(t.type)}},Dh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let i=this.seq;for(let r=0,o=i.length;r!==o;++r){let a=i[r];a.setValue(e,t[a.id],n)}}},Ih=/(\w+)(\])?(\[|\.)?/g;function Df(s,e){s.seq.push(e),s.map[e.id]=e}function By(s,e,t){let n=s.name,i=n.length;for(Ih.lastIndex=0;;){let r=Ih.exec(n),o=Ih.lastIndex,a=r[1],c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===i){Df(t,l===void 0?new Ph(a,s,e):new Lh(a,s,e));break}else{let u=t.map[a];u===void 0&&(u=new Dh(a),Df(t,u)),t=u}}}var mr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){let r=e.getActiveUniform(t,i),o=e.getUniformLocation(t,r.name);By(r,o,this)}}setValue(e,t,n,i){let r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){let i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,o=t.length;r!==o;++r){let a=t[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,i)}}static seqWithValue(e,t){let n=[];for(let i=0,r=e.length;i!==r;++i){let o=e[i];o.id in t&&n.push(o)}return n}};function Uf(s,e,t){let n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}var Oy=37297,ky=0;function zy(s,e){let t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=i;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var Nf=new je;function Vy(s){lt._getMatrix(Nf,lt.workingColorSpace,s);let e=`mat3( ${Nf.elements.map(t=>t.toFixed(4))} )`;switch(lt.getTransfer(s)){case kr:return[e,"LinearTransferOETF"];case vt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function Ff(s,e,t){let n=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+zy(s.getShaderSource(e),a)}else return r}function Gy(s,e){let t=Vy(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Hy(s,e){let t;switch(e){case Gd:t="Linear";break;case Hd:t="Reinhard";break;case Wd:t="Cineon";break;case Qa:t="ACESFilmic";break;case qd:t="AgX";break;case Yd:t="Neutral";break;case Xd:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Vc=new w;function Wy(){lt.getLuminanceCoefficients(Vc);let s=Vc.x.toFixed(4),e=Vc.y.toFixed(4),t=Vc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Xy(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Co).join(`
`)}function qy(s){let e=[];for(let t in s){let n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Yy(s,e){let t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){let r=s.getActiveAttrib(e,i),o=r.name,a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:s.getAttribLocation(e,o),locationSize:a}}return t}function Co(s){return s!==""}function Bf(s,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Of(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Zy=/^[ \t]*#include +<([\w\d./]+)>/gm;function Uh(s){return s.replace(Zy,$y)}var Ky=new Map;function $y(s,e){let t=st[e];if(t===void 0){let n=Ky.get(e);if(n!==void 0)t=st[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Uh(t)}var Jy=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function kf(s){return s.replace(Jy,jy)}function jy(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function zf(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Qy(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===nh?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===Xa?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===ii&&(e="SHADOWMAP_TYPE_VSM"),e}function ev(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case ps:case ms:e="ENVMAP_TYPE_CUBE";break;case To:e="ENVMAP_TYPE_CUBE_UV";break}return e}function tv(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case ms:e="ENVMAP_MODE_REFRACTION";break}return e}function nv(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case rh:e="ENVMAP_BLENDING_MULTIPLY";break;case zd:e="ENVMAP_BLENDING_MIX";break;case Vd:e="ENVMAP_BLENDING_ADD";break}return e}function iv(s){let e=s.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function sv(s,e,t,n){let i=s.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,c=Qy(t),l=ev(t),h=tv(t),u=nv(t),d=iv(t),f=Xy(t),g=qy(r),x=i.createProgram(),m,p,v=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Co).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Co).join(`
`),p.length>0&&(p+=`
`)):(m=[zf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Co).join(`
`),p=[zf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Ai?"#define TONE_MAPPING":"",t.toneMapping!==Ai?st.tonemapping_pars_fragment:"",t.toneMapping!==Ai?Hy("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",st.colorspace_pars_fragment,Gy("linearToOutputTexel",t.outputColorSpace),Wy(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Co).join(`
`)),o=Uh(o),o=Bf(o,t),o=Of(o,t),a=Uh(a),a=Bf(a,t),a=Of(a,t),o=kf(o),a=kf(a),t.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===xh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===xh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let b=v+m+o,y=v+p+a,A=Uf(i,i.VERTEX_SHADER,b),R=Uf(i,i.FRAGMENT_SHADER,y);i.attachShader(x,A),i.attachShader(x,R),t.index0AttributeName!==void 0?i.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(x,0,"position"),i.linkProgram(x);function C(P){if(s.debug.checkShaderErrors){let U=i.getProgramInfoLog(x)||"",z=i.getShaderInfoLog(A)||"",N=i.getShaderInfoLog(R)||"",B=U.trim(),I=z.trim(),H=N.trim(),G=!0,se=!0;if(i.getProgramParameter(x,i.LINK_STATUS)===!1)if(G=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,x,A,R);else{let ue=Ff(i,A,"vertex"),me=Ff(i,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(x,i.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+B+`
`+ue+`
`+me)}else B!==""?console.warn("THREE.WebGLProgram: Program Info Log:",B):(I===""||H==="")&&(se=!1);se&&(P.diagnostics={runnable:G,programLog:B,vertexShader:{log:I,prefix:m},fragmentShader:{log:H,prefix:p}})}i.deleteShader(A),i.deleteShader(R),T=new mr(i,x),M=Yy(i,x)}let T;this.getUniforms=function(){return T===void 0&&C(this),T};let M;this.getAttributes=function(){return M===void 0&&C(this),M};let _=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return _===!1&&(_=i.getProgramParameter(x,Oy)),_},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=ky++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=A,this.fragmentShader=R,this}var rv=0,Nh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Fh(e),t.set(e,n)),n}},Fh=class{constructor(e){this.id=rv++,this.code=e,this.usedTimes=0}};function ov(s,e,t,n,i,r,o){let a=new Gr,c=new Nh,l=new Set,h=[],u=i.logarithmicDepthBuffer,d=i.vertexTextures,f=i.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(M){return l.add(M),M===0?"uv":`uv${M}`}function m(M,_,P,U,z){let N=U.fog,B=z.geometry,I=M.isMeshStandardMaterial?U.environment:null,H=(M.isMeshStandardMaterial?t:e).get(M.envMap||I),G=H&&H.mapping===To?H.image.height:null,se=g[M.type];M.precision!==null&&(f=i.getMaxPrecision(M.precision),f!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",f,"instead."));let ue=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,me=ue!==void 0?ue.length:0,Be=0;B.morphAttributes.position!==void 0&&(Be=1),B.morphAttributes.normal!==void 0&&(Be=2),B.morphAttributes.color!==void 0&&(Be=3);let Ye,ut,Se,q;if(se){let pt=si[se];Ye=pt.vertexShader,ut=pt.fragmentShader}else Ye=M.vertexShader,ut=M.fragmentShader,c.update(M),Se=c.getVertexShaderID(M),q=c.getFragmentShaderID(M);let J=s.getRenderTarget(),_e=s.state.buffers.depth.getReversed(),Le=z.isInstancedMesh===!0,we=z.isBatchedMesh===!0,tt=!!M.map,xt=!!M.matcap,D=!!H,ie=!!M.aoMap,j=!!M.lightMap,$=!!M.bumpMap,K=!!M.normalMap,de=!!M.displacementMap,re=!!M.emissiveMap,fe=!!M.metalnessMap,Ke=!!M.roughnessMap,Xe=M.anisotropy>0,L=M.clearcoat>0,S=M.dispersion>0,V=M.iridescence>0,Y=M.sheen>0,te=M.transmission>0,Z=Xe&&!!M.anisotropyMap,Pe=L&&!!M.clearcoatMap,he=L&&!!M.clearcoatNormalMap,Re=L&&!!M.clearcoatRoughnessMap,Ce=V&&!!M.iridescenceMap,oe=V&&!!M.iridescenceThicknessMap,ve=Y&&!!M.sheenColorMap,Ve=Y&&!!M.sheenRoughnessMap,De=!!M.specularMap,xe=!!M.specularColorMap,et=!!M.specularIntensityMap,F=te&&!!M.transmissionMap,le=te&&!!M.thicknessMap,pe=!!M.gradientMap,Te=!!M.alphaMap,ae=M.alphaTest>0,Q=!!M.alphaHash,Ie=!!M.extensions,$e=Ai;M.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&($e=s.toneMapping);let Et={shaderID:se,shaderType:M.type,shaderName:M.name,vertexShader:Ye,fragmentShader:ut,defines:M.defines,customVertexShaderID:Se,customFragmentShaderID:q,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:f,batching:we,batchingColor:we&&z._colorsTexture!==null,instancing:Le,instancingColor:Le&&z.instanceColor!==null,instancingMorph:Le&&z.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:J===null?s.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:Yt,alphaToCoverage:!!M.alphaToCoverage,map:tt,matcap:xt,envMap:D,envMapMode:D&&H.mapping,envMapCubeUVHeight:G,aoMap:ie,lightMap:j,bumpMap:$,normalMap:K,displacementMap:d&&de,emissiveMap:re,normalMapObjectSpace:K&&M.normalMapType===tf,normalMapTangentSpace:K&&M.normalMapType===mh,metalnessMap:fe,roughnessMap:Ke,anisotropy:Xe,anisotropyMap:Z,clearcoat:L,clearcoatMap:Pe,clearcoatNormalMap:he,clearcoatRoughnessMap:Re,dispersion:S,iridescence:V,iridescenceMap:Ce,iridescenceThicknessMap:oe,sheen:Y,sheenColorMap:ve,sheenRoughnessMap:Ve,specularMap:De,specularColorMap:xe,specularIntensityMap:et,transmission:te,transmissionMap:F,thicknessMap:le,gradientMap:pe,opaque:M.transparent===!1&&M.blending===yi&&M.alphaToCoverage===!1,alphaMap:Te,alphaTest:ae,alphaHash:Q,combine:M.combine,mapUv:tt&&x(M.map.channel),aoMapUv:ie&&x(M.aoMap.channel),lightMapUv:j&&x(M.lightMap.channel),bumpMapUv:$&&x(M.bumpMap.channel),normalMapUv:K&&x(M.normalMap.channel),displacementMapUv:de&&x(M.displacementMap.channel),emissiveMapUv:re&&x(M.emissiveMap.channel),metalnessMapUv:fe&&x(M.metalnessMap.channel),roughnessMapUv:Ke&&x(M.roughnessMap.channel),anisotropyMapUv:Z&&x(M.anisotropyMap.channel),clearcoatMapUv:Pe&&x(M.clearcoatMap.channel),clearcoatNormalMapUv:he&&x(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Re&&x(M.clearcoatRoughnessMap.channel),iridescenceMapUv:Ce&&x(M.iridescenceMap.channel),iridescenceThicknessMapUv:oe&&x(M.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&x(M.sheenColorMap.channel),sheenRoughnessMapUv:Ve&&x(M.sheenRoughnessMap.channel),specularMapUv:De&&x(M.specularMap.channel),specularColorMapUv:xe&&x(M.specularColorMap.channel),specularIntensityMapUv:et&&x(M.specularIntensityMap.channel),transmissionMapUv:F&&x(M.transmissionMap.channel),thicknessMapUv:le&&x(M.thicknessMap.channel),alphaMapUv:Te&&x(M.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(K||Xe),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!B.attributes.uv&&(tt||Te),fog:!!N,useFog:M.fog===!0,fogExp2:!!N&&N.isFogExp2,flatShading:M.flatShading===!0&&M.wireframe===!1,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:_e,skinning:z.isSkinnedMesh===!0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:me,morphTextureStride:Be,numDirLights:_.directional.length,numPointLights:_.point.length,numSpotLights:_.spot.length,numSpotLightMaps:_.spotLightMap.length,numRectAreaLights:_.rectArea.length,numHemiLights:_.hemi.length,numDirLightShadows:_.directionalShadowMap.length,numPointLightShadows:_.pointShadowMap.length,numSpotLightShadows:_.spotShadowMap.length,numSpotLightShadowsWithMaps:_.numSpotLightShadowsWithMaps,numLightProbes:_.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:M.dithering,shadowMapEnabled:s.shadowMap.enabled&&P.length>0,shadowMapType:s.shadowMap.type,toneMapping:$e,decodeVideoTexture:tt&&M.map.isVideoTexture===!0&&lt.getTransfer(M.map.colorSpace)===vt,decodeVideoTextureEmissive:re&&M.emissiveMap.isVideoTexture===!0&&lt.getTransfer(M.emissiveMap.colorSpace)===vt,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Ct,flipSided:M.side===on,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:Ie&&M.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ie&&M.extensions.multiDraw===!0||we)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return Et.vertexUv1s=l.has(1),Et.vertexUv2s=l.has(2),Et.vertexUv3s=l.has(3),l.clear(),Et}function p(M){let _=[];if(M.shaderID?_.push(M.shaderID):(_.push(M.customVertexShaderID),_.push(M.customFragmentShaderID)),M.defines!==void 0)for(let P in M.defines)_.push(P),_.push(M.defines[P]);return M.isRawShaderMaterial===!1&&(v(_,M),b(_,M),_.push(s.outputColorSpace)),_.push(M.customProgramCacheKey),_.join()}function v(M,_){M.push(_.precision),M.push(_.outputColorSpace),M.push(_.envMapMode),M.push(_.envMapCubeUVHeight),M.push(_.mapUv),M.push(_.alphaMapUv),M.push(_.lightMapUv),M.push(_.aoMapUv),M.push(_.bumpMapUv),M.push(_.normalMapUv),M.push(_.displacementMapUv),M.push(_.emissiveMapUv),M.push(_.metalnessMapUv),M.push(_.roughnessMapUv),M.push(_.anisotropyMapUv),M.push(_.clearcoatMapUv),M.push(_.clearcoatNormalMapUv),M.push(_.clearcoatRoughnessMapUv),M.push(_.iridescenceMapUv),M.push(_.iridescenceThicknessMapUv),M.push(_.sheenColorMapUv),M.push(_.sheenRoughnessMapUv),M.push(_.specularMapUv),M.push(_.specularColorMapUv),M.push(_.specularIntensityMapUv),M.push(_.transmissionMapUv),M.push(_.thicknessMapUv),M.push(_.combine),M.push(_.fogExp2),M.push(_.sizeAttenuation),M.push(_.morphTargetsCount),M.push(_.morphAttributeCount),M.push(_.numDirLights),M.push(_.numPointLights),M.push(_.numSpotLights),M.push(_.numSpotLightMaps),M.push(_.numHemiLights),M.push(_.numRectAreaLights),M.push(_.numDirLightShadows),M.push(_.numPointLightShadows),M.push(_.numSpotLightShadows),M.push(_.numSpotLightShadowsWithMaps),M.push(_.numLightProbes),M.push(_.shadowMapType),M.push(_.toneMapping),M.push(_.numClippingPlanes),M.push(_.numClipIntersection),M.push(_.depthPacking)}function b(M,_){a.disableAll(),_.supportsVertexTextures&&a.enable(0),_.instancing&&a.enable(1),_.instancingColor&&a.enable(2),_.instancingMorph&&a.enable(3),_.matcap&&a.enable(4),_.envMap&&a.enable(5),_.normalMapObjectSpace&&a.enable(6),_.normalMapTangentSpace&&a.enable(7),_.clearcoat&&a.enable(8),_.iridescence&&a.enable(9),_.alphaTest&&a.enable(10),_.vertexColors&&a.enable(11),_.vertexAlphas&&a.enable(12),_.vertexUv1s&&a.enable(13),_.vertexUv2s&&a.enable(14),_.vertexUv3s&&a.enable(15),_.vertexTangents&&a.enable(16),_.anisotropy&&a.enable(17),_.alphaHash&&a.enable(18),_.batching&&a.enable(19),_.dispersion&&a.enable(20),_.batchingColor&&a.enable(21),_.gradientMap&&a.enable(22),M.push(a.mask),a.disableAll(),_.fog&&a.enable(0),_.useFog&&a.enable(1),_.flatShading&&a.enable(2),_.logarithmicDepthBuffer&&a.enable(3),_.reversedDepthBuffer&&a.enable(4),_.skinning&&a.enable(5),_.morphTargets&&a.enable(6),_.morphNormals&&a.enable(7),_.morphColors&&a.enable(8),_.premultipliedAlpha&&a.enable(9),_.shadowMapEnabled&&a.enable(10),_.doubleSided&&a.enable(11),_.flipSided&&a.enable(12),_.useDepthPacking&&a.enable(13),_.dithering&&a.enable(14),_.transmission&&a.enable(15),_.sheen&&a.enable(16),_.opaque&&a.enable(17),_.pointsUvs&&a.enable(18),_.decodeVideoTexture&&a.enable(19),_.decodeVideoTextureEmissive&&a.enable(20),_.alphaToCoverage&&a.enable(21),M.push(a.mask)}function y(M){let _=g[M.type],P;if(_){let U=si[_];P=ff.clone(U.uniforms)}else P=M.uniforms;return P}function A(M,_){let P;for(let U=0,z=h.length;U<z;U++){let N=h[U];if(N.cacheKey===_){P=N,++P.usedTimes;break}}return P===void 0&&(P=new sv(s,_,M,r),h.push(P)),P}function R(M){if(--M.usedTimes===0){let _=h.indexOf(M);h[_]=h[h.length-1],h.pop(),M.destroy()}}function C(M){c.remove(M)}function T(){c.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:y,acquireProgram:A,releaseProgram:R,releaseShaderCache:C,programs:h,dispose:T}}function av(){let s=new WeakMap;function e(o){return s.has(o)}function t(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function n(o){s.delete(o)}function i(o,a,c){s.get(o)[a]=c}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function cv(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function Vf(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Gf(){let s=[],e=0,t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function o(u,d,f,g,x,m){let p=s[e];return p===void 0?(p={id:u.id,object:u,geometry:d,material:f,groupOrder:g,renderOrder:u.renderOrder,z:x,group:m},s[e]=p):(p.id=u.id,p.object=u,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=x,p.group=m),e++,p}function a(u,d,f,g,x,m){let p=o(u,d,f,g,x,m);f.transmission>0?n.push(p):f.transparent===!0?i.push(p):t.push(p)}function c(u,d,f,g,x,m){let p=o(u,d,f,g,x,m);f.transmission>0?n.unshift(p):f.transparent===!0?i.unshift(p):t.unshift(p)}function l(u,d){t.length>1&&t.sort(u||cv),n.length>1&&n.sort(d||Vf),i.length>1&&i.sort(d||Vf)}function h(){for(let u=e,d=s.length;u<d;u++){let f=s[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:a,unshift:c,finish:h,sort:l}}function lv(){let s=new WeakMap;function e(n,i){let r=s.get(n),o;return r===void 0?(o=new Gf,s.set(n,[o])):i>=r.length?(o=new Gf,r.push(o)):o=r[i],o}function t(){s=new WeakMap}return{get:e,dispose:t}}function hv(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new w,color:new Ae};break;case"SpotLight":t={position:new w,direction:new w,color:new Ae,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new w,color:new Ae,distance:0,decay:0};break;case"HemisphereLight":t={direction:new w,skyColor:new Ae,groundColor:new Ae};break;case"RectAreaLight":t={color:new Ae,position:new w,halfWidth:new w,halfHeight:new w};break}return s[e.id]=t,t}}}function uv(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ne};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ne};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ne,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}var dv=0;function fv(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function pv(s){let e=new hv,t=uv(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new w);let i=new w,r=new Fe,o=new Fe;function a(l){let h=0,u=0,d=0;for(let M=0;M<9;M++)n.probe[M].set(0,0,0);let f=0,g=0,x=0,m=0,p=0,v=0,b=0,y=0,A=0,R=0,C=0;l.sort(fv);for(let M=0,_=l.length;M<_;M++){let P=l[M],U=P.color,z=P.intensity,N=P.distance,B=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)h+=U.r*z,u+=U.g*z,d+=U.b*z;else if(P.isLightProbe){for(let I=0;I<9;I++)n.probe[I].addScaledVector(P.sh.coefficients[I],z);C++}else if(P.isDirectionalLight){let I=e.get(P);if(I.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let H=P.shadow,G=t.get(P);G.shadowIntensity=H.intensity,G.shadowBias=H.bias,G.shadowNormalBias=H.normalBias,G.shadowRadius=H.radius,G.shadowMapSize=H.mapSize,n.directionalShadow[f]=G,n.directionalShadowMap[f]=B,n.directionalShadowMatrix[f]=P.shadow.matrix,v++}n.directional[f]=I,f++}else if(P.isSpotLight){let I=e.get(P);I.position.setFromMatrixPosition(P.matrixWorld),I.color.copy(U).multiplyScalar(z),I.distance=N,I.coneCos=Math.cos(P.angle),I.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),I.decay=P.decay,n.spot[x]=I;let H=P.shadow;if(P.map&&(n.spotLightMap[A]=P.map,A++,H.updateMatrices(P),P.castShadow&&R++),n.spotLightMatrix[x]=H.matrix,P.castShadow){let G=t.get(P);G.shadowIntensity=H.intensity,G.shadowBias=H.bias,G.shadowNormalBias=H.normalBias,G.shadowRadius=H.radius,G.shadowMapSize=H.mapSize,n.spotShadow[x]=G,n.spotShadowMap[x]=B,y++}x++}else if(P.isRectAreaLight){let I=e.get(P);I.color.copy(U).multiplyScalar(z),I.halfWidth.set(P.width*.5,0,0),I.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=I,m++}else if(P.isPointLight){let I=e.get(P);if(I.color.copy(P.color).multiplyScalar(P.intensity),I.distance=P.distance,I.decay=P.decay,P.castShadow){let H=P.shadow,G=t.get(P);G.shadowIntensity=H.intensity,G.shadowBias=H.bias,G.shadowNormalBias=H.normalBias,G.shadowRadius=H.radius,G.shadowMapSize=H.mapSize,G.shadowCameraNear=H.camera.near,G.shadowCameraFar=H.camera.far,n.pointShadow[g]=G,n.pointShadowMap[g]=B,n.pointShadowMatrix[g]=P.shadow.matrix,b++}n.point[g]=I,g++}else if(P.isHemisphereLight){let I=e.get(P);I.skyColor.copy(P.color).multiplyScalar(z),I.groundColor.copy(P.groundColor).multiplyScalar(z),n.hemi[p]=I,p++}}m>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ge.LTC_FLOAT_1,n.rectAreaLTC2=ge.LTC_FLOAT_2):(n.rectAreaLTC1=ge.LTC_HALF_1,n.rectAreaLTC2=ge.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let T=n.hash;(T.directionalLength!==f||T.pointLength!==g||T.spotLength!==x||T.rectAreaLength!==m||T.hemiLength!==p||T.numDirectionalShadows!==v||T.numPointShadows!==b||T.numSpotShadows!==y||T.numSpotMaps!==A||T.numLightProbes!==C)&&(n.directional.length=f,n.spot.length=x,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=v,n.directionalShadowMap.length=v,n.pointShadow.length=b,n.pointShadowMap.length=b,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=v,n.pointShadowMatrix.length=b,n.spotLightMatrix.length=y+A-R,n.spotLightMap.length=A,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=C,T.directionalLength=f,T.pointLength=g,T.spotLength=x,T.rectAreaLength=m,T.hemiLength=p,T.numDirectionalShadows=v,T.numPointShadows=b,T.numSpotShadows=y,T.numSpotMaps=A,T.numLightProbes=C,n.version=dv++)}function c(l,h){let u=0,d=0,f=0,g=0,x=0,m=h.matrixWorldInverse;for(let p=0,v=l.length;p<v;p++){let b=l[p];if(b.isDirectionalLight){let y=n.directional[u];y.direction.setFromMatrixPosition(b.matrixWorld),i.setFromMatrixPosition(b.target.matrixWorld),y.direction.sub(i),y.direction.transformDirection(m),u++}else if(b.isSpotLight){let y=n.spot[f];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(b.matrixWorld),i.setFromMatrixPosition(b.target.matrixWorld),y.direction.sub(i),y.direction.transformDirection(m),f++}else if(b.isRectAreaLight){let y=n.rectArea[g];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),o.identity(),r.copy(b.matrixWorld),r.premultiply(m),o.extractRotation(r),y.halfWidth.set(b.width*.5,0,0),y.halfHeight.set(0,b.height*.5,0),y.halfWidth.applyMatrix4(o),y.halfHeight.applyMatrix4(o),g++}else if(b.isPointLight){let y=n.point[d];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),d++}else if(b.isHemisphereLight){let y=n.hemi[x];y.direction.setFromMatrixPosition(b.matrixWorld),y.direction.transformDirection(m),x++}}}return{setup:a,setupView:c,state:n}}function Hf(s){let e=new pv(s),t=[],n=[];function i(h){l.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function o(h){n.push(h)}function a(){e.setup(t)}function c(h){e.setupView(t,h)}let l={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:a,setupLightsView:c,pushLight:r,pushShadow:o}}function mv(s){let e=new WeakMap;function t(i,r=0){let o=e.get(i),a;return o===void 0?(a=new Hf(s),e.set(i,[a])):r>=o.length?(a=new Hf(s),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var gv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,xv=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function yv(s,e,t){let n=new tr,i=new ne,r=new ne,o=new ft,a=new Na({depthPacking:ef}),c=new Fa,l={},h=t.maxTextureSize,u={[bn]:on,[on]:bn,[Ct]:Ct},d=new Zt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ne},radius:{value:4}},vertexShader:gv,fragmentShader:xv}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new mt;g.setAttribute("position",new Tt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new We(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=nh;let p=this.type;this.render=function(R,C,T){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;let M=s.getRenderTarget(),_=s.getActiveCubeFace(),P=s.getActiveMipmapLevel(),U=s.state;U.setBlending(wi),U.buffers.depth.getReversed()===!0?U.buffers.color.setClear(0,0,0,0):U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);let z=p!==ii&&this.type===ii,N=p===ii&&this.type!==ii;for(let B=0,I=R.length;B<I;B++){let H=R[B],G=H.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",H,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;i.copy(G.mapSize);let se=G.getFrameExtents();if(i.multiply(se),r.copy(G.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/se.x),i.x=r.x*se.x,G.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/se.y),i.y=r.y*se.y,G.mapSize.y=r.y)),G.map===null||z===!0||N===!0){let me=this.type!==ii?{minFilter:qt,magFilter:qt}:{};G.map!==null&&G.map.dispose(),G.map=new Jn(i.x,i.y,me),G.map.texture.name=H.name+".shadowMap",G.camera.updateProjectionMatrix()}s.setRenderTarget(G.map),s.clear();let ue=G.getViewportCount();for(let me=0;me<ue;me++){let Be=G.getViewport(me);o.set(r.x*Be.x,r.y*Be.y,r.x*Be.z,r.y*Be.w),U.viewport(o),G.updateMatrices(H,me),n=G.getFrustum(),y(C,T,G.camera,H,this.type)}G.isPointLightShadow!==!0&&this.type===ii&&v(G,T),G.needsUpdate=!1}p=this.type,m.needsUpdate=!1,s.setRenderTarget(M,_,P)};function v(R,C){let T=e.update(x);d.defines.VSM_SAMPLES!==R.blurSamples&&(d.defines.VSM_SAMPLES=R.blurSamples,f.defines.VSM_SAMPLES=R.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new Jn(i.x,i.y)),d.uniforms.shadow_pass.value=R.map.texture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,s.setRenderTarget(R.mapPass),s.clear(),s.renderBufferDirect(C,null,T,d,x,null),f.uniforms.shadow_pass.value=R.mapPass.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,s.setRenderTarget(R.map),s.clear(),s.renderBufferDirect(C,null,T,f,x,null)}function b(R,C,T,M){let _=null,P=T.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(P!==void 0)_=P;else if(_=T.isPointLight===!0?c:a,s.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){let U=_.uuid,z=C.uuid,N=l[U];N===void 0&&(N={},l[U]=N);let B=N[z];B===void 0&&(B=_.clone(),N[z]=B,C.addEventListener("dispose",A)),_=B}if(_.visible=C.visible,_.wireframe=C.wireframe,M===ii?_.side=C.shadowSide!==null?C.shadowSide:C.side:_.side=C.shadowSide!==null?C.shadowSide:u[C.side],_.alphaMap=C.alphaMap,_.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,_.map=C.map,_.clipShadows=C.clipShadows,_.clippingPlanes=C.clippingPlanes,_.clipIntersection=C.clipIntersection,_.displacementMap=C.displacementMap,_.displacementScale=C.displacementScale,_.displacementBias=C.displacementBias,_.wireframeLinewidth=C.wireframeLinewidth,_.linewidth=C.linewidth,T.isPointLight===!0&&_.isMeshDistanceMaterial===!0){let U=s.properties.get(_);U.light=T}return _}function y(R,C,T,M,_){if(R.visible===!1)return;if(R.layers.test(C.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&_===ii)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(T.matrixWorldInverse,R.matrixWorld);let z=e.update(R),N=R.material;if(Array.isArray(N)){let B=z.groups;for(let I=0,H=B.length;I<H;I++){let G=B[I],se=N[G.materialIndex];if(se&&se.visible){let ue=b(R,se,M,_);R.onBeforeShadow(s,R,C,T,z,ue,G),s.renderBufferDirect(T,null,z,ue,R,G),R.onAfterShadow(s,R,C,T,z,ue,G)}}}else if(N.visible){let B=b(R,N,M,_);R.onBeforeShadow(s,R,C,T,z,B,null),s.renderBufferDirect(T,null,z,B,R,null),R.onAfterShadow(s,R,C,T,z,B,null)}}let U=R.children;for(let z=0,N=U.length;z<N;z++)y(U[z],C,T,M,_)}function A(R){R.target.removeEventListener("dispose",A);for(let T in l){let M=l[T],_=R.target.uuid;_ in M&&(M[_].dispose(),delete M[_])}}}var vv={[qa]:Ya,[Za]:Ja,[Ka]:ja,[es]:$a,[Ya]:qa,[Ja]:Za,[ja]:Ka,[$a]:es};function _v(s,e){function t(){let F=!1,le=new ft,pe=null,Te=new ft(0,0,0,0);return{setMask:function(ae){pe!==ae&&!F&&(s.colorMask(ae,ae,ae,ae),pe=ae)},setLocked:function(ae){F=ae},setClear:function(ae,Q,Ie,$e,Et){Et===!0&&(ae*=$e,Q*=$e,Ie*=$e),le.set(ae,Q,Ie,$e),Te.equals(le)===!1&&(s.clearColor(ae,Q,Ie,$e),Te.copy(le))},reset:function(){F=!1,pe=null,Te.set(-1,0,0,0)}}}function n(){let F=!1,le=!1,pe=null,Te=null,ae=null;return{setReversed:function(Q){if(le!==Q){let Ie=e.get("EXT_clip_control");Q?Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.ZERO_TO_ONE_EXT):Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.NEGATIVE_ONE_TO_ONE_EXT),le=Q;let $e=ae;ae=null,this.setClear($e)}},getReversed:function(){return le},setTest:function(Q){Q?J(s.DEPTH_TEST):_e(s.DEPTH_TEST)},setMask:function(Q){pe!==Q&&!F&&(s.depthMask(Q),pe=Q)},setFunc:function(Q){if(le&&(Q=vv[Q]),Te!==Q){switch(Q){case qa:s.depthFunc(s.NEVER);break;case Ya:s.depthFunc(s.ALWAYS);break;case Za:s.depthFunc(s.LESS);break;case es:s.depthFunc(s.LEQUAL);break;case Ka:s.depthFunc(s.EQUAL);break;case $a:s.depthFunc(s.GEQUAL);break;case Ja:s.depthFunc(s.GREATER);break;case ja:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}Te=Q}},setLocked:function(Q){F=Q},setClear:function(Q){ae!==Q&&(le&&(Q=1-Q),s.clearDepth(Q),ae=Q)},reset:function(){F=!1,pe=null,Te=null,ae=null,le=!1}}}function i(){let F=!1,le=null,pe=null,Te=null,ae=null,Q=null,Ie=null,$e=null,Et=null;return{setTest:function(pt){F||(pt?J(s.STENCIL_TEST):_e(s.STENCIL_TEST))},setMask:function(pt){le!==pt&&!F&&(s.stencilMask(pt),le=pt)},setFunc:function(pt,li,Xn){(pe!==pt||Te!==li||ae!==Xn)&&(s.stencilFunc(pt,li,Xn),pe=pt,Te=li,ae=Xn)},setOp:function(pt,li,Xn){(Q!==pt||Ie!==li||$e!==Xn)&&(s.stencilOp(pt,li,Xn),Q=pt,Ie=li,$e=Xn)},setLocked:function(pt){F=pt},setClear:function(pt){Et!==pt&&(s.clearStencil(pt),Et=pt)},reset:function(){F=!1,le=null,pe=null,Te=null,ae=null,Q=null,Ie=null,$e=null,Et=null}}}let r=new t,o=new n,a=new i,c=new WeakMap,l=new WeakMap,h={},u={},d=new WeakMap,f=[],g=null,x=!1,m=null,p=null,v=null,b=null,y=null,A=null,R=null,C=new Ae(0,0,0),T=0,M=!1,_=null,P=null,U=null,z=null,N=null,B=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),I=!1,H=0,G=s.getParameter(s.VERSION);G.indexOf("WebGL")!==-1?(H=parseFloat(/^WebGL (\d)/.exec(G)[1]),I=H>=1):G.indexOf("OpenGL ES")!==-1&&(H=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),I=H>=2);let se=null,ue={},me=s.getParameter(s.SCISSOR_BOX),Be=s.getParameter(s.VIEWPORT),Ye=new ft().fromArray(me),ut=new ft().fromArray(Be);function Se(F,le,pe,Te){let ae=new Uint8Array(4),Q=s.createTexture();s.bindTexture(F,Q),s.texParameteri(F,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(F,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Ie=0;Ie<pe;Ie++)F===s.TEXTURE_3D||F===s.TEXTURE_2D_ARRAY?s.texImage3D(le,0,s.RGBA,1,1,Te,0,s.RGBA,s.UNSIGNED_BYTE,ae):s.texImage2D(le+Ie,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,ae);return Q}let q={};q[s.TEXTURE_2D]=Se(s.TEXTURE_2D,s.TEXTURE_2D,1),q[s.TEXTURE_CUBE_MAP]=Se(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),q[s.TEXTURE_2D_ARRAY]=Se(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),q[s.TEXTURE_3D]=Se(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),J(s.DEPTH_TEST),o.setFunc(es),$(!1),K(th),J(s.CULL_FACE),ie(wi);function J(F){h[F]!==!0&&(s.enable(F),h[F]=!0)}function _e(F){h[F]!==!1&&(s.disable(F),h[F]=!1)}function Le(F,le){return u[F]!==le?(s.bindFramebuffer(F,le),u[F]=le,F===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=le),F===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=le),!0):!1}function we(F,le){let pe=f,Te=!1;if(F){pe=d.get(le),pe===void 0&&(pe=[],d.set(le,pe));let ae=F.textures;if(pe.length!==ae.length||pe[0]!==s.COLOR_ATTACHMENT0){for(let Q=0,Ie=ae.length;Q<Ie;Q++)pe[Q]=s.COLOR_ATTACHMENT0+Q;pe.length=ae.length,Te=!0}}else pe[0]!==s.BACK&&(pe[0]=s.BACK,Te=!0);Te&&s.drawBuffers(pe)}function tt(F){return g!==F?(s.useProgram(F),g=F,!0):!1}let xt={[Ni]:s.FUNC_ADD,[Td]:s.FUNC_SUBTRACT,[Sd]:s.FUNC_REVERSE_SUBTRACT};xt[wd]=s.MIN,xt[Ad]=s.MAX;let D={[Ed]:s.ZERO,[Rd]:s.ONE,[Cd]:s.SRC_COLOR,[va]:s.SRC_ALPHA,[Nd]:s.SRC_ALPHA_SATURATE,[Dd]:s.DST_COLOR,[Pd]:s.DST_ALPHA,[Id]:s.ONE_MINUS_SRC_COLOR,[_a]:s.ONE_MINUS_SRC_ALPHA,[Ud]:s.ONE_MINUS_DST_COLOR,[Ld]:s.ONE_MINUS_DST_ALPHA,[Fd]:s.CONSTANT_COLOR,[Bd]:s.ONE_MINUS_CONSTANT_COLOR,[Od]:s.CONSTANT_ALPHA,[kd]:s.ONE_MINUS_CONSTANT_ALPHA};function ie(F,le,pe,Te,ae,Q,Ie,$e,Et,pt){if(F===wi){x===!0&&(_e(s.BLEND),x=!1);return}if(x===!1&&(J(s.BLEND),x=!0),F!==Md){if(F!==m||pt!==M){if((p!==Ni||y!==Ni)&&(s.blendEquation(s.FUNC_ADD),p=Ni,y=Ni),pt)switch(F){case yi:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case wt:s.blendFunc(s.ONE,s.ONE);break;case ih:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case sh:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",F);break}else switch(F){case yi:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case wt:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case ih:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case sh:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",F);break}v=null,b=null,A=null,R=null,C.set(0,0,0),T=0,m=F,M=pt}return}ae=ae||le,Q=Q||pe,Ie=Ie||Te,(le!==p||ae!==y)&&(s.blendEquationSeparate(xt[le],xt[ae]),p=le,y=ae),(pe!==v||Te!==b||Q!==A||Ie!==R)&&(s.blendFuncSeparate(D[pe],D[Te],D[Q],D[Ie]),v=pe,b=Te,A=Q,R=Ie),($e.equals(C)===!1||Et!==T)&&(s.blendColor($e.r,$e.g,$e.b,Et),C.copy($e),T=Et),m=F,M=!1}function j(F,le){F.side===Ct?_e(s.CULL_FACE):J(s.CULL_FACE);let pe=F.side===on;le&&(pe=!pe),$(pe),F.blending===yi&&F.transparent===!1?ie(wi):ie(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),o.setFunc(F.depthFunc),o.setTest(F.depthTest),o.setMask(F.depthWrite),r.setMask(F.colorWrite);let Te=F.stencilWrite;a.setTest(Te),Te&&(a.setMask(F.stencilWriteMask),a.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),a.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),re(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?J(s.SAMPLE_ALPHA_TO_COVERAGE):_e(s.SAMPLE_ALPHA_TO_COVERAGE)}function $(F){_!==F&&(F?s.frontFace(s.CW):s.frontFace(s.CCW),_=F)}function K(F){F!==_d?(J(s.CULL_FACE),F!==P&&(F===th?s.cullFace(s.BACK):F===bd?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):_e(s.CULL_FACE),P=F}function de(F){F!==U&&(I&&s.lineWidth(F),U=F)}function re(F,le,pe){F?(J(s.POLYGON_OFFSET_FILL),(z!==le||N!==pe)&&(s.polygonOffset(le,pe),z=le,N=pe)):_e(s.POLYGON_OFFSET_FILL)}function fe(F){F?J(s.SCISSOR_TEST):_e(s.SCISSOR_TEST)}function Ke(F){F===void 0&&(F=s.TEXTURE0+B-1),se!==F&&(s.activeTexture(F),se=F)}function Xe(F,le,pe){pe===void 0&&(se===null?pe=s.TEXTURE0+B-1:pe=se);let Te=ue[pe];Te===void 0&&(Te={type:void 0,texture:void 0},ue[pe]=Te),(Te.type!==F||Te.texture!==le)&&(se!==pe&&(s.activeTexture(pe),se=pe),s.bindTexture(F,le||q[F]),Te.type=F,Te.texture=le)}function L(){let F=ue[se];F!==void 0&&F.type!==void 0&&(s.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function S(){try{s.compressedTexImage2D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function V(){try{s.compressedTexImage3D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Y(){try{s.texSubImage2D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function te(){try{s.texSubImage3D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Z(){try{s.compressedTexSubImage2D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Pe(){try{s.compressedTexSubImage3D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function he(){try{s.texStorage2D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Re(){try{s.texStorage3D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Ce(){try{s.texImage2D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function oe(){try{s.texImage3D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function ve(F){Ye.equals(F)===!1&&(s.scissor(F.x,F.y,F.z,F.w),Ye.copy(F))}function Ve(F){ut.equals(F)===!1&&(s.viewport(F.x,F.y,F.z,F.w),ut.copy(F))}function De(F,le){let pe=l.get(le);pe===void 0&&(pe=new WeakMap,l.set(le,pe));let Te=pe.get(F);Te===void 0&&(Te=s.getUniformBlockIndex(le,F.name),pe.set(F,Te))}function xe(F,le){let Te=l.get(le).get(F);c.get(le)!==Te&&(s.uniformBlockBinding(le,Te,F.__bindingPointIndex),c.set(le,Te))}function et(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},se=null,ue={},u={},d=new WeakMap,f=[],g=null,x=!1,m=null,p=null,v=null,b=null,y=null,A=null,R=null,C=new Ae(0,0,0),T=0,M=!1,_=null,P=null,U=null,z=null,N=null,Ye.set(0,0,s.canvas.width,s.canvas.height),ut.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:J,disable:_e,bindFramebuffer:Le,drawBuffers:we,useProgram:tt,setBlending:ie,setMaterial:j,setFlipSided:$,setCullFace:K,setLineWidth:de,setPolygonOffset:re,setScissorTest:fe,activeTexture:Ke,bindTexture:Xe,unbindTexture:L,compressedTexImage2D:S,compressedTexImage3D:V,texImage2D:Ce,texImage3D:oe,updateUBOMapping:De,uniformBlockBinding:xe,texStorage2D:he,texStorage3D:Re,texSubImage2D:Y,texSubImage3D:te,compressedTexSubImage2D:Z,compressedTexSubImage3D:Pe,scissor:ve,viewport:Ve,reset:et}}function bv(s,e,t,n,i,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ne,h=new WeakMap,u,d=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(L,S){return f?new OffscreenCanvas(L,S):Ks("canvas")}function x(L,S,V){let Y=1,te=Xe(L);if((te.width>V||te.height>V)&&(Y=V/Math.max(te.width,te.height)),Y<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){let Z=Math.floor(Y*te.width),Pe=Math.floor(Y*te.height);u===void 0&&(u=g(Z,Pe));let he=S?g(Z,Pe):u;return he.width=Z,he.height=Pe,he.getContext("2d").drawImage(L,0,0,Z,Pe),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+te.width+"x"+te.height+") to ("+Z+"x"+Pe+")."),he}else return"data"in L&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+te.width+"x"+te.height+")."),L;return L}function m(L){return L.generateMipmaps}function p(L){s.generateMipmap(L)}function v(L){return L.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:L.isWebGL3DRenderTarget?s.TEXTURE_3D:L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function b(L,S,V,Y,te=!1){if(L!==null){if(s[L]!==void 0)return s[L];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let Z=S;if(S===s.RED&&(V===s.FLOAT&&(Z=s.R32F),V===s.HALF_FLOAT&&(Z=s.R16F),V===s.UNSIGNED_BYTE&&(Z=s.R8)),S===s.RED_INTEGER&&(V===s.UNSIGNED_BYTE&&(Z=s.R8UI),V===s.UNSIGNED_SHORT&&(Z=s.R16UI),V===s.UNSIGNED_INT&&(Z=s.R32UI),V===s.BYTE&&(Z=s.R8I),V===s.SHORT&&(Z=s.R16I),V===s.INT&&(Z=s.R32I)),S===s.RG&&(V===s.FLOAT&&(Z=s.RG32F),V===s.HALF_FLOAT&&(Z=s.RG16F),V===s.UNSIGNED_BYTE&&(Z=s.RG8)),S===s.RG_INTEGER&&(V===s.UNSIGNED_BYTE&&(Z=s.RG8UI),V===s.UNSIGNED_SHORT&&(Z=s.RG16UI),V===s.UNSIGNED_INT&&(Z=s.RG32UI),V===s.BYTE&&(Z=s.RG8I),V===s.SHORT&&(Z=s.RG16I),V===s.INT&&(Z=s.RG32I)),S===s.RGB_INTEGER&&(V===s.UNSIGNED_BYTE&&(Z=s.RGB8UI),V===s.UNSIGNED_SHORT&&(Z=s.RGB16UI),V===s.UNSIGNED_INT&&(Z=s.RGB32UI),V===s.BYTE&&(Z=s.RGB8I),V===s.SHORT&&(Z=s.RGB16I),V===s.INT&&(Z=s.RGB32I)),S===s.RGBA_INTEGER&&(V===s.UNSIGNED_BYTE&&(Z=s.RGBA8UI),V===s.UNSIGNED_SHORT&&(Z=s.RGBA16UI),V===s.UNSIGNED_INT&&(Z=s.RGBA32UI),V===s.BYTE&&(Z=s.RGBA8I),V===s.SHORT&&(Z=s.RGBA16I),V===s.INT&&(Z=s.RGBA32I)),S===s.RGB&&(V===s.UNSIGNED_INT_5_9_9_9_REV&&(Z=s.RGB9_E5),V===s.UNSIGNED_INT_10F_11F_11F_REV&&(Z=s.R11F_G11F_B10F)),S===s.RGBA){let Pe=te?kr:lt.getTransfer(Y);V===s.FLOAT&&(Z=s.RGBA32F),V===s.HALF_FLOAT&&(Z=s.RGBA16F),V===s.UNSIGNED_BYTE&&(Z=Pe===vt?s.SRGB8_ALPHA8:s.RGBA8),V===s.UNSIGNED_SHORT_4_4_4_4&&(Z=s.RGBA4),V===s.UNSIGNED_SHORT_5_5_5_1&&(Z=s.RGB5_A1)}return(Z===s.R16F||Z===s.R32F||Z===s.RG16F||Z===s.RG32F||Z===s.RGBA16F||Z===s.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function y(L,S){let V;return L?S===null||S===zi||S===hr?V=s.DEPTH24_STENCIL8:S===Dn?V=s.DEPTH32F_STENCIL8:S===cr&&(V=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===zi||S===hr?V=s.DEPTH_COMPONENT24:S===Dn?V=s.DEPTH_COMPONENT32F:S===cr&&(V=s.DEPTH_COMPONENT16),V}function A(L,S){return m(L)===!0||L.isFramebufferTexture&&L.minFilter!==qt&&L.minFilter!==nn?Math.log2(Math.max(S.width,S.height))+1:L.mipmaps!==void 0&&L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?S.mipmaps.length:1}function R(L){let S=L.target;S.removeEventListener("dispose",R),T(S),S.isVideoTexture&&h.delete(S)}function C(L){let S=L.target;S.removeEventListener("dispose",C),_(S)}function T(L){let S=n.get(L);if(S.__webglInit===void 0)return;let V=L.source,Y=d.get(V);if(Y){let te=Y[S.__cacheKey];te.usedTimes--,te.usedTimes===0&&M(L),Object.keys(Y).length===0&&d.delete(V)}n.remove(L)}function M(L){let S=n.get(L);s.deleteTexture(S.__webglTexture);let V=L.source,Y=d.get(V);delete Y[S.__cacheKey],o.memory.textures--}function _(L){let S=n.get(L);if(L.depthTexture&&(L.depthTexture.dispose(),n.remove(L.depthTexture)),L.isWebGLCubeRenderTarget)for(let Y=0;Y<6;Y++){if(Array.isArray(S.__webglFramebuffer[Y]))for(let te=0;te<S.__webglFramebuffer[Y].length;te++)s.deleteFramebuffer(S.__webglFramebuffer[Y][te]);else s.deleteFramebuffer(S.__webglFramebuffer[Y]);S.__webglDepthbuffer&&s.deleteRenderbuffer(S.__webglDepthbuffer[Y])}else{if(Array.isArray(S.__webglFramebuffer))for(let Y=0;Y<S.__webglFramebuffer.length;Y++)s.deleteFramebuffer(S.__webglFramebuffer[Y]);else s.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&s.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&s.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let Y=0;Y<S.__webglColorRenderbuffer.length;Y++)S.__webglColorRenderbuffer[Y]&&s.deleteRenderbuffer(S.__webglColorRenderbuffer[Y]);S.__webglDepthRenderbuffer&&s.deleteRenderbuffer(S.__webglDepthRenderbuffer)}let V=L.textures;for(let Y=0,te=V.length;Y<te;Y++){let Z=n.get(V[Y]);Z.__webglTexture&&(s.deleteTexture(Z.__webglTexture),o.memory.textures--),n.remove(V[Y])}n.remove(L)}let P=0;function U(){P=0}function z(){let L=P;return L>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+L+" texture units while this GPU supports only "+i.maxTextures),P+=1,L}function N(L){let S=[];return S.push(L.wrapS),S.push(L.wrapT),S.push(L.wrapR||0),S.push(L.magFilter),S.push(L.minFilter),S.push(L.anisotropy),S.push(L.internalFormat),S.push(L.format),S.push(L.type),S.push(L.generateMipmaps),S.push(L.premultiplyAlpha),S.push(L.flipY),S.push(L.unpackAlignment),S.push(L.colorSpace),S.join()}function B(L,S){let V=n.get(L);if(L.isVideoTexture&&fe(L),L.isRenderTargetTexture===!1&&L.isExternalTexture!==!0&&L.version>0&&V.__version!==L.version){let Y=L.image;if(Y===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Y.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{q(V,L,S);return}}else L.isExternalTexture&&(V.__webglTexture=L.sourceTexture?L.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,V.__webglTexture,s.TEXTURE0+S)}function I(L,S){let V=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&V.__version!==L.version){q(V,L,S);return}t.bindTexture(s.TEXTURE_2D_ARRAY,V.__webglTexture,s.TEXTURE0+S)}function H(L,S){let V=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&V.__version!==L.version){q(V,L,S);return}t.bindTexture(s.TEXTURE_3D,V.__webglTexture,s.TEXTURE0+S)}function G(L,S){let V=n.get(L);if(L.version>0&&V.__version!==L.version){J(V,L,S);return}t.bindTexture(s.TEXTURE_CUBE_MAP,V.__webglTexture,s.TEXTURE0+S)}let se={[Kn]:s.REPEAT,[Yn]:s.CLAMP_TO_EDGE,[Ys]:s.MIRRORED_REPEAT},ue={[qt]:s.NEAREST,[nc]:s.NEAREST_MIPMAP_NEAREST,[gs]:s.NEAREST_MIPMAP_LINEAR,[nn]:s.LINEAR,[ar]:s.LINEAR_MIPMAP_NEAREST,[Tn]:s.LINEAR_MIPMAP_LINEAR},me={[nf]:s.NEVER,[lf]:s.ALWAYS,[sf]:s.LESS,[gh]:s.LEQUAL,[rf]:s.EQUAL,[cf]:s.GEQUAL,[of]:s.GREATER,[af]:s.NOTEQUAL};function Be(L,S){if(S.type===Dn&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===nn||S.magFilter===ar||S.magFilter===gs||S.magFilter===Tn||S.minFilter===nn||S.minFilter===ar||S.minFilter===gs||S.minFilter===Tn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(L,s.TEXTURE_WRAP_S,se[S.wrapS]),s.texParameteri(L,s.TEXTURE_WRAP_T,se[S.wrapT]),(L===s.TEXTURE_3D||L===s.TEXTURE_2D_ARRAY)&&s.texParameteri(L,s.TEXTURE_WRAP_R,se[S.wrapR]),s.texParameteri(L,s.TEXTURE_MAG_FILTER,ue[S.magFilter]),s.texParameteri(L,s.TEXTURE_MIN_FILTER,ue[S.minFilter]),S.compareFunction&&(s.texParameteri(L,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(L,s.TEXTURE_COMPARE_FUNC,me[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===qt||S.minFilter!==gs&&S.minFilter!==Tn||S.type===Dn&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){let V=e.get("EXT_texture_filter_anisotropic");s.texParameterf(L,V.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,i.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function Ye(L,S){let V=!1;L.__webglInit===void 0&&(L.__webglInit=!0,S.addEventListener("dispose",R));let Y=S.source,te=d.get(Y);te===void 0&&(te={},d.set(Y,te));let Z=N(S);if(Z!==L.__cacheKey){te[Z]===void 0&&(te[Z]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,V=!0),te[Z].usedTimes++;let Pe=te[L.__cacheKey];Pe!==void 0&&(te[L.__cacheKey].usedTimes--,Pe.usedTimes===0&&M(S)),L.__cacheKey=Z,L.__webglTexture=te[Z].texture}return V}function ut(L,S,V){return Math.floor(Math.floor(L/V)/S)}function Se(L,S,V,Y){let Z=L.updateRanges;if(Z.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,S.width,S.height,V,Y,S.data);else{Z.sort((oe,ve)=>oe.start-ve.start);let Pe=0;for(let oe=1;oe<Z.length;oe++){let ve=Z[Pe],Ve=Z[oe],De=ve.start+ve.count,xe=ut(Ve.start,S.width,4),et=ut(ve.start,S.width,4);Ve.start<=De+1&&xe===et&&ut(Ve.start+Ve.count-1,S.width,4)===xe?ve.count=Math.max(ve.count,Ve.start+Ve.count-ve.start):(++Pe,Z[Pe]=Ve)}Z.length=Pe+1;let he=s.getParameter(s.UNPACK_ROW_LENGTH),Re=s.getParameter(s.UNPACK_SKIP_PIXELS),Ce=s.getParameter(s.UNPACK_SKIP_ROWS);s.pixelStorei(s.UNPACK_ROW_LENGTH,S.width);for(let oe=0,ve=Z.length;oe<ve;oe++){let Ve=Z[oe],De=Math.floor(Ve.start/4),xe=Math.ceil(Ve.count/4),et=De%S.width,F=Math.floor(De/S.width),le=xe,pe=1;s.pixelStorei(s.UNPACK_SKIP_PIXELS,et),s.pixelStorei(s.UNPACK_SKIP_ROWS,F),t.texSubImage2D(s.TEXTURE_2D,0,et,F,le,pe,V,Y,S.data)}L.clearUpdateRanges(),s.pixelStorei(s.UNPACK_ROW_LENGTH,he),s.pixelStorei(s.UNPACK_SKIP_PIXELS,Re),s.pixelStorei(s.UNPACK_SKIP_ROWS,Ce)}}function q(L,S,V){let Y=s.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(Y=s.TEXTURE_2D_ARRAY),S.isData3DTexture&&(Y=s.TEXTURE_3D);let te=Ye(L,S),Z=S.source;t.bindTexture(Y,L.__webglTexture,s.TEXTURE0+V);let Pe=n.get(Z);if(Z.version!==Pe.__version||te===!0){t.activeTexture(s.TEXTURE0+V);let he=lt.getPrimaries(lt.workingColorSpace),Re=S.colorSpace===Ei?null:lt.getPrimaries(S.colorSpace),Ce=S.colorSpace===Ei||he===Re?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,S.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,S.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ce);let oe=x(S.image,!1,i.maxTextureSize);oe=Ke(S,oe);let ve=r.convert(S.format,S.colorSpace),Ve=r.convert(S.type),De=b(S.internalFormat,ve,Ve,S.colorSpace,S.isVideoTexture);Be(Y,S);let xe,et=S.mipmaps,F=S.isVideoTexture!==!0,le=Pe.__version===void 0||te===!0,pe=Z.dataReady,Te=A(S,oe);if(S.isDepthTexture)De=y(S.format===ur,S.type),le&&(F?t.texStorage2D(s.TEXTURE_2D,1,De,oe.width,oe.height):t.texImage2D(s.TEXTURE_2D,0,De,oe.width,oe.height,0,ve,Ve,null));else if(S.isDataTexture)if(et.length>0){F&&le&&t.texStorage2D(s.TEXTURE_2D,Te,De,et[0].width,et[0].height);for(let ae=0,Q=et.length;ae<Q;ae++)xe=et[ae],F?pe&&t.texSubImage2D(s.TEXTURE_2D,ae,0,0,xe.width,xe.height,ve,Ve,xe.data):t.texImage2D(s.TEXTURE_2D,ae,De,xe.width,xe.height,0,ve,Ve,xe.data);S.generateMipmaps=!1}else F?(le&&t.texStorage2D(s.TEXTURE_2D,Te,De,oe.width,oe.height),pe&&Se(S,oe,ve,Ve)):t.texImage2D(s.TEXTURE_2D,0,De,oe.width,oe.height,0,ve,Ve,oe.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){F&&le&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Te,De,et[0].width,et[0].height,oe.depth);for(let ae=0,Q=et.length;ae<Q;ae++)if(xe=et[ae],S.format!==Sn)if(ve!==null)if(F){if(pe)if(S.layerUpdates.size>0){let Ie=Sh(xe.width,xe.height,S.format,S.type);for(let $e of S.layerUpdates){let Et=xe.data.subarray($e*Ie/xe.data.BYTES_PER_ELEMENT,($e+1)*Ie/xe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ae,0,0,$e,xe.width,xe.height,1,ve,Et)}S.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ae,0,0,0,xe.width,xe.height,oe.depth,ve,xe.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,ae,De,xe.width,xe.height,oe.depth,0,xe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else F?pe&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,ae,0,0,0,xe.width,xe.height,oe.depth,ve,Ve,xe.data):t.texImage3D(s.TEXTURE_2D_ARRAY,ae,De,xe.width,xe.height,oe.depth,0,ve,Ve,xe.data)}else{F&&le&&t.texStorage2D(s.TEXTURE_2D,Te,De,et[0].width,et[0].height);for(let ae=0,Q=et.length;ae<Q;ae++)xe=et[ae],S.format!==Sn?ve!==null?F?pe&&t.compressedTexSubImage2D(s.TEXTURE_2D,ae,0,0,xe.width,xe.height,ve,xe.data):t.compressedTexImage2D(s.TEXTURE_2D,ae,De,xe.width,xe.height,0,xe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):F?pe&&t.texSubImage2D(s.TEXTURE_2D,ae,0,0,xe.width,xe.height,ve,Ve,xe.data):t.texImage2D(s.TEXTURE_2D,ae,De,xe.width,xe.height,0,ve,Ve,xe.data)}else if(S.isDataArrayTexture)if(F){if(le&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Te,De,oe.width,oe.height,oe.depth),pe)if(S.layerUpdates.size>0){let ae=Sh(oe.width,oe.height,S.format,S.type);for(let Q of S.layerUpdates){let Ie=oe.data.subarray(Q*ae/oe.data.BYTES_PER_ELEMENT,(Q+1)*ae/oe.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,Q,oe.width,oe.height,1,ve,Ve,Ie)}S.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,oe.width,oe.height,oe.depth,ve,Ve,oe.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,De,oe.width,oe.height,oe.depth,0,ve,Ve,oe.data);else if(S.isData3DTexture)F?(le&&t.texStorage3D(s.TEXTURE_3D,Te,De,oe.width,oe.height,oe.depth),pe&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,oe.width,oe.height,oe.depth,ve,Ve,oe.data)):t.texImage3D(s.TEXTURE_3D,0,De,oe.width,oe.height,oe.depth,0,ve,Ve,oe.data);else if(S.isFramebufferTexture){if(le)if(F)t.texStorage2D(s.TEXTURE_2D,Te,De,oe.width,oe.height);else{let ae=oe.width,Q=oe.height;for(let Ie=0;Ie<Te;Ie++)t.texImage2D(s.TEXTURE_2D,Ie,De,ae,Q,0,ve,Ve,null),ae>>=1,Q>>=1}}else if(et.length>0){if(F&&le){let ae=Xe(et[0]);t.texStorage2D(s.TEXTURE_2D,Te,De,ae.width,ae.height)}for(let ae=0,Q=et.length;ae<Q;ae++)xe=et[ae],F?pe&&t.texSubImage2D(s.TEXTURE_2D,ae,0,0,ve,Ve,xe):t.texImage2D(s.TEXTURE_2D,ae,De,ve,Ve,xe);S.generateMipmaps=!1}else if(F){if(le){let ae=Xe(oe);t.texStorage2D(s.TEXTURE_2D,Te,De,ae.width,ae.height)}pe&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,ve,Ve,oe)}else t.texImage2D(s.TEXTURE_2D,0,De,ve,Ve,oe);m(S)&&p(Y),Pe.__version=Z.version,S.onUpdate&&S.onUpdate(S)}L.__version=S.version}function J(L,S,V){if(S.image.length!==6)return;let Y=Ye(L,S),te=S.source;t.bindTexture(s.TEXTURE_CUBE_MAP,L.__webglTexture,s.TEXTURE0+V);let Z=n.get(te);if(te.version!==Z.__version||Y===!0){t.activeTexture(s.TEXTURE0+V);let Pe=lt.getPrimaries(lt.workingColorSpace),he=S.colorSpace===Ei?null:lt.getPrimaries(S.colorSpace),Re=S.colorSpace===Ei||Pe===he?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,S.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,S.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Re);let Ce=S.isCompressedTexture||S.image[0].isCompressedTexture,oe=S.image[0]&&S.image[0].isDataTexture,ve=[];for(let Q=0;Q<6;Q++)!Ce&&!oe?ve[Q]=x(S.image[Q],!0,i.maxCubemapSize):ve[Q]=oe?S.image[Q].image:S.image[Q],ve[Q]=Ke(S,ve[Q]);let Ve=ve[0],De=r.convert(S.format,S.colorSpace),xe=r.convert(S.type),et=b(S.internalFormat,De,xe,S.colorSpace),F=S.isVideoTexture!==!0,le=Z.__version===void 0||Y===!0,pe=te.dataReady,Te=A(S,Ve);Be(s.TEXTURE_CUBE_MAP,S);let ae;if(Ce){F&&le&&t.texStorage2D(s.TEXTURE_CUBE_MAP,Te,et,Ve.width,Ve.height);for(let Q=0;Q<6;Q++){ae=ve[Q].mipmaps;for(let Ie=0;Ie<ae.length;Ie++){let $e=ae[Ie];S.format!==Sn?De!==null?F?pe&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Ie,0,0,$e.width,$e.height,De,$e.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Ie,et,$e.width,$e.height,0,$e.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):F?pe&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Ie,0,0,$e.width,$e.height,De,xe,$e.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Ie,et,$e.width,$e.height,0,De,xe,$e.data)}}}else{if(ae=S.mipmaps,F&&le){ae.length>0&&Te++;let Q=Xe(ve[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,Te,et,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(oe){F?pe&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,ve[Q].width,ve[Q].height,De,xe,ve[Q].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,et,ve[Q].width,ve[Q].height,0,De,xe,ve[Q].data);for(let Ie=0;Ie<ae.length;Ie++){let Et=ae[Ie].image[Q].image;F?pe&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Ie+1,0,0,Et.width,Et.height,De,xe,Et.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Ie+1,et,Et.width,Et.height,0,De,xe,Et.data)}}else{F?pe&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,De,xe,ve[Q]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,et,De,xe,ve[Q]);for(let Ie=0;Ie<ae.length;Ie++){let $e=ae[Ie];F?pe&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Ie+1,0,0,De,xe,$e.image[Q]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Ie+1,et,De,xe,$e.image[Q])}}}m(S)&&p(s.TEXTURE_CUBE_MAP),Z.__version=te.version,S.onUpdate&&S.onUpdate(S)}L.__version=S.version}function _e(L,S,V,Y,te,Z){let Pe=r.convert(V.format,V.colorSpace),he=r.convert(V.type),Re=b(V.internalFormat,Pe,he,V.colorSpace),Ce=n.get(S),oe=n.get(V);if(oe.__renderTarget=S,!Ce.__hasExternalTextures){let ve=Math.max(1,S.width>>Z),Ve=Math.max(1,S.height>>Z);te===s.TEXTURE_3D||te===s.TEXTURE_2D_ARRAY?t.texImage3D(te,Z,Re,ve,Ve,S.depth,0,Pe,he,null):t.texImage2D(te,Z,Re,ve,Ve,0,Pe,he,null)}t.bindFramebuffer(s.FRAMEBUFFER,L),re(S)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Y,te,oe.__webglTexture,0,de(S)):(te===s.TEXTURE_2D||te>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&te<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,Y,te,oe.__webglTexture,Z),t.bindFramebuffer(s.FRAMEBUFFER,null)}function Le(L,S,V){if(s.bindRenderbuffer(s.RENDERBUFFER,L),S.depthBuffer){let Y=S.depthTexture,te=Y&&Y.isDepthTexture?Y.type:null,Z=y(S.stencilBuffer,te),Pe=S.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,he=de(S);re(S)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,he,Z,S.width,S.height):V?s.renderbufferStorageMultisample(s.RENDERBUFFER,he,Z,S.width,S.height):s.renderbufferStorage(s.RENDERBUFFER,Z,S.width,S.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Pe,s.RENDERBUFFER,L)}else{let Y=S.textures;for(let te=0;te<Y.length;te++){let Z=Y[te],Pe=r.convert(Z.format,Z.colorSpace),he=r.convert(Z.type),Re=b(Z.internalFormat,Pe,he,Z.colorSpace),Ce=de(S);V&&re(S)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ce,Re,S.width,S.height):re(S)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ce,Re,S.width,S.height):s.renderbufferStorage(s.RENDERBUFFER,Re,S.width,S.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function we(L,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,L),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let Y=n.get(S.depthTexture);Y.__renderTarget=S,(!Y.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),B(S.depthTexture,0);let te=Y.__webglTexture,Z=de(S);if(S.depthTexture.format===Zs)re(S)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,te,0,Z):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,te,0);else if(S.depthTexture.format===ur)re(S)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,te,0,Z):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,te,0);else throw new Error("Unknown depthTexture format")}function tt(L){let S=n.get(L),V=L.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==L.depthTexture){let Y=L.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),Y){let te=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,Y.removeEventListener("dispose",te)};Y.addEventListener("dispose",te),S.__depthDisposeCallback=te}S.__boundDepthTexture=Y}if(L.depthTexture&&!S.__autoAllocateDepthBuffer){if(V)throw new Error("target.depthTexture not supported in Cube render targets");let Y=L.texture.mipmaps;Y&&Y.length>0?we(S.__webglFramebuffer[0],L):we(S.__webglFramebuffer,L)}else if(V){S.__webglDepthbuffer=[];for(let Y=0;Y<6;Y++)if(t.bindFramebuffer(s.FRAMEBUFFER,S.__webglFramebuffer[Y]),S.__webglDepthbuffer[Y]===void 0)S.__webglDepthbuffer[Y]=s.createRenderbuffer(),Le(S.__webglDepthbuffer[Y],L,!1);else{let te=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Z=S.__webglDepthbuffer[Y];s.bindRenderbuffer(s.RENDERBUFFER,Z),s.framebufferRenderbuffer(s.FRAMEBUFFER,te,s.RENDERBUFFER,Z)}}else{let Y=L.texture.mipmaps;if(Y&&Y.length>0?t.bindFramebuffer(s.FRAMEBUFFER,S.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=s.createRenderbuffer(),Le(S.__webglDepthbuffer,L,!1);else{let te=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Z=S.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,Z),s.framebufferRenderbuffer(s.FRAMEBUFFER,te,s.RENDERBUFFER,Z)}}t.bindFramebuffer(s.FRAMEBUFFER,null)}function xt(L,S,V){let Y=n.get(L);S!==void 0&&_e(Y.__webglFramebuffer,L,L.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),V!==void 0&&tt(L)}function D(L){let S=L.texture,V=n.get(L),Y=n.get(S);L.addEventListener("dispose",C);let te=L.textures,Z=L.isWebGLCubeRenderTarget===!0,Pe=te.length>1;if(Pe||(Y.__webglTexture===void 0&&(Y.__webglTexture=s.createTexture()),Y.__version=S.version,o.memory.textures++),Z){V.__webglFramebuffer=[];for(let he=0;he<6;he++)if(S.mipmaps&&S.mipmaps.length>0){V.__webglFramebuffer[he]=[];for(let Re=0;Re<S.mipmaps.length;Re++)V.__webglFramebuffer[he][Re]=s.createFramebuffer()}else V.__webglFramebuffer[he]=s.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){V.__webglFramebuffer=[];for(let he=0;he<S.mipmaps.length;he++)V.__webglFramebuffer[he]=s.createFramebuffer()}else V.__webglFramebuffer=s.createFramebuffer();if(Pe)for(let he=0,Re=te.length;he<Re;he++){let Ce=n.get(te[he]);Ce.__webglTexture===void 0&&(Ce.__webglTexture=s.createTexture(),o.memory.textures++)}if(L.samples>0&&re(L)===!1){V.__webglMultisampledFramebuffer=s.createFramebuffer(),V.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,V.__webglMultisampledFramebuffer);for(let he=0;he<te.length;he++){let Re=te[he];V.__webglColorRenderbuffer[he]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,V.__webglColorRenderbuffer[he]);let Ce=r.convert(Re.format,Re.colorSpace),oe=r.convert(Re.type),ve=b(Re.internalFormat,Ce,oe,Re.colorSpace,L.isXRRenderTarget===!0),Ve=de(L);s.renderbufferStorageMultisample(s.RENDERBUFFER,Ve,ve,L.width,L.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+he,s.RENDERBUFFER,V.__webglColorRenderbuffer[he])}s.bindRenderbuffer(s.RENDERBUFFER,null),L.depthBuffer&&(V.__webglDepthRenderbuffer=s.createRenderbuffer(),Le(V.__webglDepthRenderbuffer,L,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(Z){t.bindTexture(s.TEXTURE_CUBE_MAP,Y.__webglTexture),Be(s.TEXTURE_CUBE_MAP,S);for(let he=0;he<6;he++)if(S.mipmaps&&S.mipmaps.length>0)for(let Re=0;Re<S.mipmaps.length;Re++)_e(V.__webglFramebuffer[he][Re],L,S,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Re);else _e(V.__webglFramebuffer[he],L,S,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+he,0);m(S)&&p(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Pe){for(let he=0,Re=te.length;he<Re;he++){let Ce=te[he],oe=n.get(Ce),ve=s.TEXTURE_2D;(L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(ve=L.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(ve,oe.__webglTexture),Be(ve,Ce),_e(V.__webglFramebuffer,L,Ce,s.COLOR_ATTACHMENT0+he,ve,0),m(Ce)&&p(ve)}t.unbindTexture()}else{let he=s.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(he=L.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(he,Y.__webglTexture),Be(he,S),S.mipmaps&&S.mipmaps.length>0)for(let Re=0;Re<S.mipmaps.length;Re++)_e(V.__webglFramebuffer[Re],L,S,s.COLOR_ATTACHMENT0,he,Re);else _e(V.__webglFramebuffer,L,S,s.COLOR_ATTACHMENT0,he,0);m(S)&&p(he),t.unbindTexture()}L.depthBuffer&&tt(L)}function ie(L){let S=L.textures;for(let V=0,Y=S.length;V<Y;V++){let te=S[V];if(m(te)){let Z=v(L),Pe=n.get(te).__webglTexture;t.bindTexture(Z,Pe),p(Z),t.unbindTexture()}}}let j=[],$=[];function K(L){if(L.samples>0){if(re(L)===!1){let S=L.textures,V=L.width,Y=L.height,te=s.COLOR_BUFFER_BIT,Z=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Pe=n.get(L),he=S.length>1;if(he)for(let Ce=0;Ce<S.length;Ce++)t.bindFramebuffer(s.FRAMEBUFFER,Pe.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,Pe.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,Pe.__webglMultisampledFramebuffer);let Re=L.texture.mipmaps;Re&&Re.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Pe.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Pe.__webglFramebuffer);for(let Ce=0;Ce<S.length;Ce++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(te|=s.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(te|=s.STENCIL_BUFFER_BIT)),he){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Pe.__webglColorRenderbuffer[Ce]);let oe=n.get(S[Ce]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,oe,0)}s.blitFramebuffer(0,0,V,Y,0,0,V,Y,te,s.NEAREST),c===!0&&(j.length=0,$.length=0,j.push(s.COLOR_ATTACHMENT0+Ce),L.depthBuffer&&L.resolveDepthBuffer===!1&&(j.push(Z),$.push(Z),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,$)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,j))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),he)for(let Ce=0;Ce<S.length;Ce++){t.bindFramebuffer(s.FRAMEBUFFER,Pe.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.RENDERBUFFER,Pe.__webglColorRenderbuffer[Ce]);let oe=n.get(S[Ce]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,Pe.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.TEXTURE_2D,oe,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Pe.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.resolveDepthBuffer===!1&&c){let S=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[S])}}}function de(L){return Math.min(i.maxSamples,L.samples)}function re(L){let S=n.get(L);return L.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function fe(L){let S=o.render.frame;h.get(L)!==S&&(h.set(L,S),L.update())}function Ke(L,S){let V=L.colorSpace,Y=L.format,te=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||V!==Yt&&V!==Ei&&(lt.getTransfer(V)===vt?(Y!==Sn||te!==Hn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",V)),S}function Xe(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(l.width=L.naturalWidth||L.width,l.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(l.width=L.displayWidth,l.height=L.displayHeight):(l.width=L.width,l.height=L.height),l}this.allocateTextureUnit=z,this.resetTextureUnits=U,this.setTexture2D=B,this.setTexture2DArray=I,this.setTexture3D=H,this.setTextureCube=G,this.rebindTextures=xt,this.setupRenderTarget=D,this.updateRenderTargetMipmap=ie,this.updateMultisampleRenderTarget=K,this.setupDepthRenderbuffer=tt,this.setupFrameBufferTexture=_e,this.useMultisampledRTT=re}function Mv(s,e){function t(n,i=Ei){let r,o=lt.getTransfer(i);if(n===Hn)return s.UNSIGNED_BYTE;if(n===sc)return s.UNSIGNED_SHORT_4_4_4_4;if(n===rc)return s.UNSIGNED_SHORT_5_5_5_1;if(n===lh)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===hh)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===ah)return s.BYTE;if(n===ch)return s.SHORT;if(n===cr)return s.UNSIGNED_SHORT;if(n===ic)return s.INT;if(n===zi)return s.UNSIGNED_INT;if(n===Dn)return s.FLOAT;if(n===lr)return s.HALF_FLOAT;if(n===uh)return s.ALPHA;if(n===dh)return s.RGB;if(n===Sn)return s.RGBA;if(n===Zs)return s.DEPTH_COMPONENT;if(n===ur)return s.DEPTH_STENCIL;if(n===oc)return s.RED;if(n===ac)return s.RED_INTEGER;if(n===fh)return s.RG;if(n===cc)return s.RG_INTEGER;if(n===lc)return s.RGBA_INTEGER;if(n===So||n===wo||n===Ao||n===Eo)if(o===vt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===So)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===wo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ao)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Eo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===So)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===wo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ao)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Eo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===hc||n===uc||n===dc||n===fc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===hc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===uc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===dc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===fc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===pc||n===mc||n===gc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===pc||n===mc)return o===vt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===gc)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===xc||n===yc||n===vc||n===_c||n===bc||n===Mc||n===Tc||n===Sc||n===wc||n===Ac||n===Ec||n===Rc||n===Cc||n===Ic)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===xc)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===yc)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===vc)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===_c)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===bc)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Mc)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Tc)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Sc)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===wc)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ac)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ec)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Rc)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Cc)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ic)return o===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Pc||n===Lc||n===Dc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Pc)return o===vt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Lc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Dc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Uc||n===Nc||n===Fc||n===Bc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Uc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Nc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Fc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Bc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===hr?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}var Tv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Sv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Bh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new to(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Zt({vertexShader:Tv,fragmentShader:Sv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new We(new Ln(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Oh=class extends $n{constructor(e,t){super();let n=this,i=null,r=1,o=null,a="local-floor",c=1,l=null,h=null,u=null,d=null,f=null,g=null,x=typeof XRWebGLBinding<"u",m=new Bh,p={},v=t.getContextAttributes(),b=null,y=null,A=[],R=[],C=new ne,T=null,M=new Nt;M.viewport=new ft;let _=new Nt;_.viewport=new ft;let P=[M,_],U=new Ga,z=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let J=A[q];return J===void 0&&(J=new js,A[q]=J),J.getTargetRaySpace()},this.getControllerGrip=function(q){let J=A[q];return J===void 0&&(J=new js,A[q]=J),J.getGripSpace()},this.getHand=function(q){let J=A[q];return J===void 0&&(J=new js,A[q]=J),J.getHandSpace()};function B(q){let J=R.indexOf(q.inputSource);if(J===-1)return;let _e=A[J];_e!==void 0&&(_e.update(q.inputSource,q.frame,l||o),_e.dispatchEvent({type:q.type,data:q.inputSource}))}function I(){i.removeEventListener("select",B),i.removeEventListener("selectstart",B),i.removeEventListener("selectend",B),i.removeEventListener("squeeze",B),i.removeEventListener("squeezestart",B),i.removeEventListener("squeezeend",B),i.removeEventListener("end",I),i.removeEventListener("inputsourceschange",H);for(let q=0;q<A.length;q++){let J=R[q];J!==null&&(R[q]=null,A[q].disconnect(J))}z=null,N=null,m.reset();for(let q in p)delete p[q];e.setRenderTarget(b),f=null,d=null,u=null,i=null,y=null,Se.stop(),n.isPresenting=!1,e.setPixelRatio(T),e.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(q){l=q},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&x&&(u=new XRWebGLBinding(i,t)),u},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(q){if(i=q,i!==null){if(b=e.getRenderTarget(),i.addEventListener("select",B),i.addEventListener("selectstart",B),i.addEventListener("selectend",B),i.addEventListener("squeeze",B),i.addEventListener("squeezestart",B),i.addEventListener("squeezeend",B),i.addEventListener("end",I),i.addEventListener("inputsourceschange",H),v.xrCompatible!==!0&&await t.makeXRCompatible(),T=e.getPixelRatio(),e.getSize(C),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let _e=null,Le=null,we=null;v.depth&&(we=v.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,_e=v.stencil?ur:Zs,Le=v.stencil?hr:zi);let tt={colorFormat:t.RGBA8,depthFormat:we,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(tt),i.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new Jn(d.textureWidth,d.textureHeight,{format:Sn,type:Hn,depthTexture:new eo(d.textureWidth,d.textureHeight,Le,void 0,void 0,void 0,void 0,void 0,void 0,_e),stencilBuffer:v.stencil,colorSpace:e.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let _e={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,t,_e),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new Jn(f.framebufferWidth,f.framebufferHeight,{format:Sn,type:Hn,colorSpace:e.outputColorSpace,stencilBuffer:v.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await i.requestReferenceSpace(a),Se.setContext(i),Se.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function H(q){for(let J=0;J<q.removed.length;J++){let _e=q.removed[J],Le=R.indexOf(_e);Le>=0&&(R[Le]=null,A[Le].disconnect(_e))}for(let J=0;J<q.added.length;J++){let _e=q.added[J],Le=R.indexOf(_e);if(Le===-1){for(let tt=0;tt<A.length;tt++)if(tt>=R.length){R.push(_e),Le=tt;break}else if(R[tt]===null){R[tt]=_e,Le=tt;break}if(Le===-1)break}let we=A[Le];we&&we.connect(_e)}}let G=new w,se=new w;function ue(q,J,_e){G.setFromMatrixPosition(J.matrixWorld),se.setFromMatrixPosition(_e.matrixWorld);let Le=G.distanceTo(se),we=J.projectionMatrix.elements,tt=_e.projectionMatrix.elements,xt=we[14]/(we[10]-1),D=we[14]/(we[10]+1),ie=(we[9]+1)/we[5],j=(we[9]-1)/we[5],$=(we[8]-1)/we[0],K=(tt[8]+1)/tt[0],de=xt*$,re=xt*K,fe=Le/(-$+K),Ke=fe*-$;if(J.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(Ke),q.translateZ(fe),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),we[10]===-1)q.projectionMatrix.copy(J.projectionMatrix),q.projectionMatrixInverse.copy(J.projectionMatrixInverse);else{let Xe=xt+fe,L=D+fe,S=de-Ke,V=re+(Le-Ke),Y=ie*D/L*Xe,te=j*D/L*Xe;q.projectionMatrix.makePerspective(S,V,Y,te,Xe,L),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function me(q,J){J===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(J.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(i===null)return;let J=q.near,_e=q.far;m.texture!==null&&(m.depthNear>0&&(J=m.depthNear),m.depthFar>0&&(_e=m.depthFar)),U.near=_.near=M.near=J,U.far=_.far=M.far=_e,(z!==U.near||N!==U.far)&&(i.updateRenderState({depthNear:U.near,depthFar:U.far}),z=U.near,N=U.far),U.layers.mask=q.layers.mask|6,M.layers.mask=U.layers.mask&3,_.layers.mask=U.layers.mask&5;let Le=q.parent,we=U.cameras;me(U,Le);for(let tt=0;tt<we.length;tt++)me(we[tt],Le);we.length===2?ue(U,M,_):U.projectionMatrix.copy(M.projectionMatrix),Be(q,U,Le)};function Be(q,J,_e){_e===null?q.matrix.copy(J.matrixWorld):(q.matrix.copy(_e.matrixWorld),q.matrix.invert(),q.matrix.multiply(J.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(J.projectionMatrix),q.projectionMatrixInverse.copy(J.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=is*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return U},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(q){c=q,d!==null&&(d.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(U)},this.getCameraTexture=function(q){return p[q]};let Ye=null;function ut(q,J){if(h=J.getViewerPose(l||o),g=J,h!==null){let _e=h.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let Le=!1;_e.length!==U.cameras.length&&(U.cameras.length=0,Le=!0);for(let D=0;D<_e.length;D++){let ie=_e[D],j=null;if(f!==null)j=f.getViewport(ie);else{let K=u.getViewSubImage(d,ie);j=K.viewport,D===0&&(e.setRenderTargetTextures(y,K.colorTexture,K.depthStencilTexture),e.setRenderTarget(y))}let $=P[D];$===void 0&&($=new Nt,$.layers.enable(D),$.viewport=new ft,P[D]=$),$.matrix.fromArray(ie.transform.matrix),$.matrix.decompose($.position,$.quaternion,$.scale),$.projectionMatrix.fromArray(ie.projectionMatrix),$.projectionMatrixInverse.copy($.projectionMatrix).invert(),$.viewport.set(j.x,j.y,j.width,j.height),D===0&&(U.matrix.copy($.matrix),U.matrix.decompose(U.position,U.quaternion,U.scale)),Le===!0&&U.cameras.push($)}let we=i.enabledFeatures;if(we&&we.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&x){u=n.getBinding();let D=u.getDepthInformation(_e[0]);D&&D.isValid&&D.texture&&m.init(D,i.renderState)}if(we&&we.includes("camera-access")&&x){e.state.unbindTexture(),u=n.getBinding();for(let D=0;D<_e.length;D++){let ie=_e[D].camera;if(ie){let j=p[ie];j||(j=new to,p[ie]=j);let $=u.getCameraImage(ie);j.sourceTexture=$}}}}for(let _e=0;_e<A.length;_e++){let Le=R[_e],we=A[_e];Le!==null&&we!==void 0&&we.update(Le,J,l||o)}Ye&&Ye(q,J),J.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:J}),g=null}let Se=new Wf;Se.setAnimationLoop(ut),this.setAnimationLoop=function(q){Ye=q},this.dispose=function(){}}},vs=new sn,wv=new Fe;function Av(s,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,_h(s)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function i(m,p,v,b,y){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,y)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),x(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?c(m,p,v,b):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===on&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===on&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let v=e.get(p),b=v.envMap,y=v.envMapRotation;b&&(m.envMap.value=b,vs.copy(y),vs.x*=-1,vs.y*=-1,vs.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(vs.y*=-1,vs.z*=-1),m.envMapRotation.value.setFromMatrix4(wv.makeRotationFromEuler(vs)),m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,v,b){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*v,m.scale.value=b*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,v){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===on&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function x(m,p){let v=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function Ev(s,e,t,n){let i={},r={},o=[],a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function c(v,b){let y=b.program;n.uniformBlockBinding(v,y)}function l(v,b){let y=i[v.id];y===void 0&&(g(v),y=h(v),i[v.id]=y,v.addEventListener("dispose",m));let A=b.program;n.updateUBOMapping(v,A);let R=e.render.frame;r[v.id]!==R&&(d(v),r[v.id]=R)}function h(v){let b=u();v.__bindingPointIndex=b;let y=s.createBuffer(),A=v.__size,R=v.usage;return s.bindBuffer(s.UNIFORM_BUFFER,y),s.bufferData(s.UNIFORM_BUFFER,A,R),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,b,y),y}function u(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(v){let b=i[v.id],y=v.uniforms,A=v.__cache;s.bindBuffer(s.UNIFORM_BUFFER,b);for(let R=0,C=y.length;R<C;R++){let T=Array.isArray(y[R])?y[R]:[y[R]];for(let M=0,_=T.length;M<_;M++){let P=T[M];if(f(P,R,M,A)===!0){let U=P.__offset,z=Array.isArray(P.value)?P.value:[P.value],N=0;for(let B=0;B<z.length;B++){let I=z[B],H=x(I);typeof I=="number"||typeof I=="boolean"?(P.__data[0]=I,s.bufferSubData(s.UNIFORM_BUFFER,U+N,P.__data)):I.isMatrix3?(P.__data[0]=I.elements[0],P.__data[1]=I.elements[1],P.__data[2]=I.elements[2],P.__data[3]=0,P.__data[4]=I.elements[3],P.__data[5]=I.elements[4],P.__data[6]=I.elements[5],P.__data[7]=0,P.__data[8]=I.elements[6],P.__data[9]=I.elements[7],P.__data[10]=I.elements[8],P.__data[11]=0):(I.toArray(P.__data,N),N+=H.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,U,P.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(v,b,y,A){let R=v.value,C=b+"_"+y;if(A[C]===void 0)return typeof R=="number"||typeof R=="boolean"?A[C]=R:A[C]=R.clone(),!0;{let T=A[C];if(typeof R=="number"||typeof R=="boolean"){if(T!==R)return A[C]=R,!0}else if(T.equals(R)===!1)return T.copy(R),!0}return!1}function g(v){let b=v.uniforms,y=0,A=16;for(let C=0,T=b.length;C<T;C++){let M=Array.isArray(b[C])?b[C]:[b[C]];for(let _=0,P=M.length;_<P;_++){let U=M[_],z=Array.isArray(U.value)?U.value:[U.value];for(let N=0,B=z.length;N<B;N++){let I=z[N],H=x(I),G=y%A,se=G%H.boundary,ue=G+se;y+=se,ue!==0&&A-ue<H.storage&&(y+=A-ue),U.__data=new Float32Array(H.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=y,y+=H.storage}}}let R=y%A;return R>0&&(y+=A-R),v.__size=y,v.__cache={},this}function x(v){let b={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(b.boundary=4,b.storage=4):v.isVector2?(b.boundary=8,b.storage=8):v.isVector3||v.isColor?(b.boundary=16,b.storage=12):v.isVector4?(b.boundary=16,b.storage=16):v.isMatrix3?(b.boundary=48,b.storage=48):v.isMatrix4?(b.boundary=64,b.storage=64):v.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",v),b}function m(v){let b=v.target;b.removeEventListener("dispose",m);let y=o.indexOf(b.__bindingPointIndex);o.splice(y,1),s.deleteBuffer(i[b.id]),delete i[b.id],delete r[b.id]}function p(){for(let v in i)s.deleteBuffer(i[v]);o=[],i={},r={}}return{bind:c,update:l,dispose:p}}var Hc=class{constructor(e={}){let{canvas:t=hf(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;let g=new Uint32Array(4),x=new Int32Array(4),m=null,p=null,v=[],b=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ai,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,A=!1;this._outputColorSpace=It;let R=0,C=0,T=null,M=-1,_=null,P=new ft,U=new ft,z=null,N=new Ae(0),B=0,I=t.width,H=t.height,G=1,se=null,ue=null,me=new ft(0,0,I,H),Be=new ft(0,0,I,H),Ye=!1,ut=new tr,Se=!1,q=!1,J=new Fe,_e=new w,Le=new ft,we={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},tt=!1;function xt(){return T===null?G:1}let D=n;function ie(E,O){return t.getContext(E,O)}try{let E={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"180"}`),t.addEventListener("webglcontextlost",pe,!1),t.addEventListener("webglcontextrestored",Te,!1),t.addEventListener("webglcontextcreationerror",ae,!1),D===null){let O="webgl2";if(D=ie(O,E),D===null)throw ie(O)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let j,$,K,de,re,fe,Ke,Xe,L,S,V,Y,te,Z,Pe,he,Re,Ce,oe,ve,Ve,De,xe,et;function F(){j=new Xx(D),j.init(),De=new Mv(D,j),$=new Ox(D,j,e,De),K=new _v(D,j),$.reversedDepthBuffer&&d&&K.buffers.depth.setReversed(!0),de=new Zx(D),re=new av,fe=new bv(D,j,K,re,$,De,de),Ke=new zx(y),Xe=new Wx(y),L=new eg(D),xe=new Fx(D,L),S=new qx(D,L,de,xe),V=new $x(D,S,L,de),oe=new Kx(D,$,fe),he=new kx(re),Y=new ov(y,Ke,Xe,j,$,xe,he),te=new Av(y,re),Z=new lv,Pe=new mv(j),Ce=new Nx(y,Ke,Xe,K,V,f,c),Re=new yv(y,V,$),et=new Ev(D,de,$,K),ve=new Bx(D,j,de),Ve=new Yx(D,j,de),de.programs=Y.programs,y.capabilities=$,y.extensions=j,y.properties=re,y.renderLists=Z,y.shadowMap=Re,y.state=K,y.info=de}F();let le=new Oh(y,D);this.xr=le,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let E=j.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=j.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(E){E!==void 0&&(G=E,this.setSize(I,H,!1))},this.getSize=function(E){return E.set(I,H)},this.setSize=function(E,O,W=!0){if(le.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}I=E,H=O,t.width=Math.floor(E*G),t.height=Math.floor(O*G),W===!0&&(t.style.width=E+"px",t.style.height=O+"px"),this.setViewport(0,0,E,O)},this.getDrawingBufferSize=function(E){return E.set(I*G,H*G).floor()},this.setDrawingBufferSize=function(E,O,W){I=E,H=O,G=W,t.width=Math.floor(E*W),t.height=Math.floor(O*W),this.setViewport(0,0,E,O)},this.getCurrentViewport=function(E){return E.copy(P)},this.getViewport=function(E){return E.copy(me)},this.setViewport=function(E,O,W,X){E.isVector4?me.set(E.x,E.y,E.z,E.w):me.set(E,O,W,X),K.viewport(P.copy(me).multiplyScalar(G).round())},this.getScissor=function(E){return E.copy(Be)},this.setScissor=function(E,O,W,X){E.isVector4?Be.set(E.x,E.y,E.z,E.w):Be.set(E,O,W,X),K.scissor(U.copy(Be).multiplyScalar(G).round())},this.getScissorTest=function(){return Ye},this.setScissorTest=function(E){K.setScissorTest(Ye=E)},this.setOpaqueSort=function(E){se=E},this.setTransparentSort=function(E){ue=E},this.getClearColor=function(E){return E.copy(Ce.getClearColor())},this.setClearColor=function(){Ce.setClearColor(...arguments)},this.getClearAlpha=function(){return Ce.getClearAlpha()},this.setClearAlpha=function(){Ce.setClearAlpha(...arguments)},this.clear=function(E=!0,O=!0,W=!0){let X=0;if(E){let k=!1;if(T!==null){let ce=T.texture.format;k=ce===lc||ce===cc||ce===ac}if(k){let ce=T.texture.type,ye=ce===Hn||ce===zi||ce===cr||ce===hr||ce===sc||ce===rc,Ee=Ce.getClearColor(),be=Ce.getClearAlpha(),ke=Ee.r,He=Ee.g,Ne=Ee.b;ye?(g[0]=ke,g[1]=He,g[2]=Ne,g[3]=be,D.clearBufferuiv(D.COLOR,0,g)):(x[0]=ke,x[1]=He,x[2]=Ne,x[3]=be,D.clearBufferiv(D.COLOR,0,x))}else X|=D.COLOR_BUFFER_BIT}O&&(X|=D.DEPTH_BUFFER_BIT),W&&(X|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(X)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",pe,!1),t.removeEventListener("webglcontextrestored",Te,!1),t.removeEventListener("webglcontextcreationerror",ae,!1),Ce.dispose(),Z.dispose(),Pe.dispose(),re.dispose(),Ke.dispose(),Xe.dispose(),V.dispose(),xe.dispose(),et.dispose(),Y.dispose(),le.dispose(),le.removeEventListener("sessionstart",Xn),le.removeEventListener("sessionend",wu),Wi.stop()};function pe(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),A=!0}function Te(){console.log("THREE.WebGLRenderer: Context Restored."),A=!1;let E=de.autoReset,O=Re.enabled,W=Re.autoUpdate,X=Re.needsUpdate,k=Re.type;F(),de.autoReset=E,Re.enabled=O,Re.autoUpdate=W,Re.needsUpdate=X,Re.type=k}function ae(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Q(E){let O=E.target;O.removeEventListener("dispose",Q),Ie(O)}function Ie(E){$e(E),re.remove(E)}function $e(E){let O=re.get(E).programs;O!==void 0&&(O.forEach(function(W){Y.releaseProgram(W)}),E.isShaderMaterial&&Y.releaseShaderCache(E))}this.renderBufferDirect=function(E,O,W,X,k,ce){O===null&&(O=we);let ye=k.isMesh&&k.matrixWorld.determinant()<0,Ee=up(E,O,W,X,k);K.setMaterial(X,ye);let be=W.index,ke=1;if(X.wireframe===!0){if(be=S.getWireframeAttribute(W),be===void 0)return;ke=2}let He=W.drawRange,Ne=W.attributes.position,ct=He.start*ke,bt=(He.start+He.count)*ke;ce!==null&&(ct=Math.max(ct,ce.start*ke),bt=Math.min(bt,(ce.start+ce.count)*ke)),be!==null?(ct=Math.max(ct,0),bt=Math.min(bt,be.count)):Ne!=null&&(ct=Math.max(ct,0),bt=Math.min(bt,Ne.count));let Ut=bt-ct;if(Ut<0||Ut===1/0)return;xe.setup(k,X,Ee,W,be);let Rt,St=ve;if(be!==null&&(Rt=L.get(be),St=Ve,St.setIndex(Rt)),k.isMesh)X.wireframe===!0?(K.setLineWidth(X.wireframeLinewidth*xt()),St.setMode(D.LINES)):St.setMode(D.TRIANGLES);else if(k.isLine){let Oe=X.linewidth;Oe===void 0&&(Oe=1),K.setLineWidth(Oe*xt()),k.isLineSegments?St.setMode(D.LINES):k.isLineLoop?St.setMode(D.LINE_LOOP):St.setMode(D.LINE_STRIP)}else k.isPoints?St.setMode(D.POINTS):k.isSprite&&St.setMode(D.TRIANGLES);if(k.isBatchedMesh)if(k._multiDrawInstances!==null)$s("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),St.renderMultiDrawInstances(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount,k._multiDrawInstances);else if(j.get("WEBGL_multi_draw"))St.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{let Oe=k._multiDrawStarts,Pt=k._multiDrawCounts,dt=k._multiDrawCount,xn=be?L.get(be).bytesPerElement:1,Es=re.get(X).currentProgram.getUniforms();for(let yn=0;yn<dt;yn++)Es.setValue(D,"_gl_DrawID",yn),St.render(Oe[yn]/xn,Pt[yn])}else if(k.isInstancedMesh)St.renderInstances(ct,Ut,k.count);else if(W.isInstancedBufferGeometry){let Oe=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,Pt=Math.min(W.instanceCount,Oe);St.renderInstances(ct,Ut,Pt)}else St.render(ct,Ut)};function Et(E,O,W){E.transparent===!0&&E.side===Ct&&E.forceSinglePass===!1?(E.side=on,E.needsUpdate=!0,ko(E,O,W),E.side=bn,E.needsUpdate=!0,ko(E,O,W),E.side=Ct):ko(E,O,W)}this.compile=function(E,O,W=null){W===null&&(W=E),p=Pe.get(W),p.init(O),b.push(p),W.traverseVisible(function(k){k.isLight&&k.layers.test(O.layers)&&(p.pushLight(k),k.castShadow&&p.pushShadow(k))}),E!==W&&E.traverseVisible(function(k){k.isLight&&k.layers.test(O.layers)&&(p.pushLight(k),k.castShadow&&p.pushShadow(k))}),p.setupLights();let X=new Set;return E.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;let ce=k.material;if(ce)if(Array.isArray(ce))for(let ye=0;ye<ce.length;ye++){let Ee=ce[ye];Et(Ee,W,k),X.add(Ee)}else Et(ce,W,k),X.add(ce)}),p=b.pop(),X},this.compileAsync=function(E,O,W=null){let X=this.compile(E,O,W);return new Promise(k=>{function ce(){if(X.forEach(function(ye){re.get(ye).currentProgram.isReady()&&X.delete(ye)}),X.size===0){k(E);return}setTimeout(ce,10)}j.get("KHR_parallel_shader_compile")!==null?ce():setTimeout(ce,10)})};let pt=null;function li(E){pt&&pt(E)}function Xn(){Wi.stop()}function wu(){Wi.start()}let Wi=new Wf;Wi.setAnimationLoop(li),typeof self<"u"&&Wi.setContext(self),this.setAnimationLoop=function(E){pt=E,le.setAnimationLoop(E),E===null?Wi.stop():Wi.start()},le.addEventListener("sessionstart",Xn),le.addEventListener("sessionend",wu),this.render=function(E,O){if(O!==void 0&&O.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(A===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),le.enabled===!0&&le.isPresenting===!0&&(le.cameraAutoUpdate===!0&&le.updateCamera(O),O=le.getCamera()),E.isScene===!0&&E.onBeforeRender(y,E,O,T),p=Pe.get(E,b.length),p.init(O),b.push(p),J.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),ut.setFromProjectionMatrix(J,Vn,O.reversedDepth),q=this.localClippingEnabled,Se=he.init(this.clippingPlanes,q),m=Z.get(E,v.length),m.init(),v.push(m),le.enabled===!0&&le.isPresenting===!0){let ce=y.xr.getDepthSensingMesh();ce!==null&&hl(ce,O,-1/0,y.sortObjects)}hl(E,O,0,y.sortObjects),m.finish(),y.sortObjects===!0&&m.sort(se,ue),tt=le.enabled===!1||le.isPresenting===!1||le.hasDepthSensing()===!1,tt&&Ce.addToRenderList(m,E),this.info.render.frame++,Se===!0&&he.beginShadows();let W=p.state.shadowsArray;Re.render(W,E,O),Se===!0&&he.endShadows(),this.info.autoReset===!0&&this.info.reset();let X=m.opaque,k=m.transmissive;if(p.setupLights(),O.isArrayCamera){let ce=O.cameras;if(k.length>0)for(let ye=0,Ee=ce.length;ye<Ee;ye++){let be=ce[ye];Eu(X,k,E,be)}tt&&Ce.render(E);for(let ye=0,Ee=ce.length;ye<Ee;ye++){let be=ce[ye];Au(m,E,be,be.viewport)}}else k.length>0&&Eu(X,k,E,O),tt&&Ce.render(E),Au(m,E,O);T!==null&&C===0&&(fe.updateMultisampleRenderTarget(T),fe.updateRenderTargetMipmap(T)),E.isScene===!0&&E.onAfterRender(y,E,O),xe.resetDefaultState(),M=-1,_=null,b.pop(),b.length>0?(p=b[b.length-1],Se===!0&&he.setGlobalState(y.clippingPlanes,p.state.camera)):p=null,v.pop(),v.length>0?m=v[v.length-1]:m=null};function hl(E,O,W,X){if(E.visible===!1)return;if(E.layers.test(O.layers)){if(E.isGroup)W=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(O);else if(E.isLight)p.pushLight(E),E.castShadow&&p.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||ut.intersectsSprite(E)){X&&Le.setFromMatrixPosition(E.matrixWorld).applyMatrix4(J);let ye=V.update(E),Ee=E.material;Ee.visible&&m.push(E,ye,Ee,W,Le.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||ut.intersectsObject(E))){let ye=V.update(E),Ee=E.material;if(X&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Le.copy(E.boundingSphere.center)):(ye.boundingSphere===null&&ye.computeBoundingSphere(),Le.copy(ye.boundingSphere.center)),Le.applyMatrix4(E.matrixWorld).applyMatrix4(J)),Array.isArray(Ee)){let be=ye.groups;for(let ke=0,He=be.length;ke<He;ke++){let Ne=be[ke],ct=Ee[Ne.materialIndex];ct&&ct.visible&&m.push(E,ye,ct,W,Le.z,Ne)}}else Ee.visible&&m.push(E,ye,Ee,W,Le.z,null)}}let ce=E.children;for(let ye=0,Ee=ce.length;ye<Ee;ye++)hl(ce[ye],O,W,X)}function Au(E,O,W,X){let k=E.opaque,ce=E.transmissive,ye=E.transparent;p.setupLightsView(W),Se===!0&&he.setGlobalState(y.clippingPlanes,W),X&&K.viewport(P.copy(X)),k.length>0&&Oo(k,O,W),ce.length>0&&Oo(ce,O,W),ye.length>0&&Oo(ye,O,W),K.buffers.depth.setTest(!0),K.buffers.depth.setMask(!0),K.buffers.color.setMask(!0),K.setPolygonOffset(!1)}function Eu(E,O,W,X){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[X.id]===void 0&&(p.state.transmissionRenderTarget[X.id]=new Jn(1,1,{generateMipmaps:!0,type:j.has("EXT_color_buffer_half_float")||j.has("EXT_color_buffer_float")?lr:Hn,minFilter:Tn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:lt.workingColorSpace}));let ce=p.state.transmissionRenderTarget[X.id],ye=X.viewport||P;ce.setSize(ye.z*y.transmissionResolutionScale,ye.w*y.transmissionResolutionScale);let Ee=y.getRenderTarget(),be=y.getActiveCubeFace(),ke=y.getActiveMipmapLevel();y.setRenderTarget(ce),y.getClearColor(N),B=y.getClearAlpha(),B<1&&y.setClearColor(16777215,.5),y.clear(),tt&&Ce.render(W);let He=y.toneMapping;y.toneMapping=Ai;let Ne=X.viewport;if(X.viewport!==void 0&&(X.viewport=void 0),p.setupLightsView(X),Se===!0&&he.setGlobalState(y.clippingPlanes,X),Oo(E,W,X),fe.updateMultisampleRenderTarget(ce),fe.updateRenderTargetMipmap(ce),j.has("WEBGL_multisampled_render_to_texture")===!1){let ct=!1;for(let bt=0,Ut=O.length;bt<Ut;bt++){let Rt=O[bt],St=Rt.object,Oe=Rt.geometry,Pt=Rt.material,dt=Rt.group;if(Pt.side===Ct&&St.layers.test(X.layers)){let xn=Pt.side;Pt.side=on,Pt.needsUpdate=!0,Ru(St,W,X,Oe,Pt,dt),Pt.side=xn,Pt.needsUpdate=!0,ct=!0}}ct===!0&&(fe.updateMultisampleRenderTarget(ce),fe.updateRenderTargetMipmap(ce))}y.setRenderTarget(Ee,be,ke),y.setClearColor(N,B),Ne!==void 0&&(X.viewport=Ne),y.toneMapping=He}function Oo(E,O,W){let X=O.isScene===!0?O.overrideMaterial:null;for(let k=0,ce=E.length;k<ce;k++){let ye=E[k],Ee=ye.object,be=ye.geometry,ke=ye.group,He=ye.material;He.allowOverride===!0&&X!==null&&(He=X),Ee.layers.test(W.layers)&&Ru(Ee,O,W,be,He,ke)}}function Ru(E,O,W,X,k,ce){E.onBeforeRender(y,O,W,X,k,ce),E.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),k.onBeforeRender(y,O,W,X,E,ce),k.transparent===!0&&k.side===Ct&&k.forceSinglePass===!1?(k.side=on,k.needsUpdate=!0,y.renderBufferDirect(W,O,X,k,E,ce),k.side=bn,k.needsUpdate=!0,y.renderBufferDirect(W,O,X,k,E,ce),k.side=Ct):y.renderBufferDirect(W,O,X,k,E,ce),E.onAfterRender(y,O,W,X,k,ce)}function ko(E,O,W){O.isScene!==!0&&(O=we);let X=re.get(E),k=p.state.lights,ce=p.state.shadowsArray,ye=k.state.version,Ee=Y.getParameters(E,k.state,ce,O,W),be=Y.getProgramCacheKey(Ee),ke=X.programs;X.environment=E.isMeshStandardMaterial?O.environment:null,X.fog=O.fog,X.envMap=(E.isMeshStandardMaterial?Xe:Ke).get(E.envMap||X.environment),X.envMapRotation=X.environment!==null&&E.envMap===null?O.environmentRotation:E.envMapRotation,ke===void 0&&(E.addEventListener("dispose",Q),ke=new Map,X.programs=ke);let He=ke.get(be);if(He!==void 0){if(X.currentProgram===He&&X.lightsStateVersion===ye)return Iu(E,Ee),He}else Ee.uniforms=Y.getUniforms(E),E.onBeforeCompile(Ee,y),He=Y.acquireProgram(Ee,be),ke.set(be,He),X.uniforms=Ee.uniforms;let Ne=X.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Ne.clippingPlanes=he.uniform),Iu(E,Ee),X.needsLights=fp(E),X.lightsStateVersion=ye,X.needsLights&&(Ne.ambientLightColor.value=k.state.ambient,Ne.lightProbe.value=k.state.probe,Ne.directionalLights.value=k.state.directional,Ne.directionalLightShadows.value=k.state.directionalShadow,Ne.spotLights.value=k.state.spot,Ne.spotLightShadows.value=k.state.spotShadow,Ne.rectAreaLights.value=k.state.rectArea,Ne.ltc_1.value=k.state.rectAreaLTC1,Ne.ltc_2.value=k.state.rectAreaLTC2,Ne.pointLights.value=k.state.point,Ne.pointLightShadows.value=k.state.pointShadow,Ne.hemisphereLights.value=k.state.hemi,Ne.directionalShadowMap.value=k.state.directionalShadowMap,Ne.directionalShadowMatrix.value=k.state.directionalShadowMatrix,Ne.spotShadowMap.value=k.state.spotShadowMap,Ne.spotLightMatrix.value=k.state.spotLightMatrix,Ne.spotLightMap.value=k.state.spotLightMap,Ne.pointShadowMap.value=k.state.pointShadowMap,Ne.pointShadowMatrix.value=k.state.pointShadowMatrix),X.currentProgram=He,X.uniformsList=null,He}function Cu(E){if(E.uniformsList===null){let O=E.currentProgram.getUniforms();E.uniformsList=mr.seqWithValue(O.seq,E.uniforms)}return E.uniformsList}function Iu(E,O){let W=re.get(E);W.outputColorSpace=O.outputColorSpace,W.batching=O.batching,W.batchingColor=O.batchingColor,W.instancing=O.instancing,W.instancingColor=O.instancingColor,W.instancingMorph=O.instancingMorph,W.skinning=O.skinning,W.morphTargets=O.morphTargets,W.morphNormals=O.morphNormals,W.morphColors=O.morphColors,W.morphTargetsCount=O.morphTargetsCount,W.numClippingPlanes=O.numClippingPlanes,W.numIntersection=O.numClipIntersection,W.vertexAlphas=O.vertexAlphas,W.vertexTangents=O.vertexTangents,W.toneMapping=O.toneMapping}function up(E,O,W,X,k){O.isScene!==!0&&(O=we),fe.resetTextureUnits();let ce=O.fog,ye=X.isMeshStandardMaterial?O.environment:null,Ee=T===null?y.outputColorSpace:T.isXRRenderTarget===!0?T.texture.colorSpace:Yt,be=(X.isMeshStandardMaterial?Xe:Ke).get(X.envMap||ye),ke=X.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,He=!!W.attributes.tangent&&(!!X.normalMap||X.anisotropy>0),Ne=!!W.morphAttributes.position,ct=!!W.morphAttributes.normal,bt=!!W.morphAttributes.color,Ut=Ai;X.toneMapped&&(T===null||T.isXRRenderTarget===!0)&&(Ut=y.toneMapping);let Rt=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,St=Rt!==void 0?Rt.length:0,Oe=re.get(X),Pt=p.state.lights;if(Se===!0&&(q===!0||E!==_)){let en=E===_&&X.id===M;he.setState(X,E,en)}let dt=!1;X.version===Oe.__version?(Oe.needsLights&&Oe.lightsStateVersion!==Pt.state.version||Oe.outputColorSpace!==Ee||k.isBatchedMesh&&Oe.batching===!1||!k.isBatchedMesh&&Oe.batching===!0||k.isBatchedMesh&&Oe.batchingColor===!0&&k.colorTexture===null||k.isBatchedMesh&&Oe.batchingColor===!1&&k.colorTexture!==null||k.isInstancedMesh&&Oe.instancing===!1||!k.isInstancedMesh&&Oe.instancing===!0||k.isSkinnedMesh&&Oe.skinning===!1||!k.isSkinnedMesh&&Oe.skinning===!0||k.isInstancedMesh&&Oe.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&Oe.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&Oe.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&Oe.instancingMorph===!1&&k.morphTexture!==null||Oe.envMap!==be||X.fog===!0&&Oe.fog!==ce||Oe.numClippingPlanes!==void 0&&(Oe.numClippingPlanes!==he.numPlanes||Oe.numIntersection!==he.numIntersection)||Oe.vertexAlphas!==ke||Oe.vertexTangents!==He||Oe.morphTargets!==Ne||Oe.morphNormals!==ct||Oe.morphColors!==bt||Oe.toneMapping!==Ut||Oe.morphTargetsCount!==St)&&(dt=!0):(dt=!0,Oe.__version=X.version);let xn=Oe.currentProgram;dt===!0&&(xn=ko(X,O,k));let Es=!1,yn=!1,br=!1,Lt=xn.getUniforms(),An=Oe.uniforms;if(K.useProgram(xn.program)&&(Es=!0,yn=!0,br=!0),X.id!==M&&(M=X.id,yn=!0),Es||_!==E){K.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),Lt.setValue(D,"projectionMatrix",E.projectionMatrix),Lt.setValue(D,"viewMatrix",E.matrixWorldInverse);let un=Lt.map.cameraPosition;un!==void 0&&un.setValue(D,_e.setFromMatrixPosition(E.matrixWorld)),$.logarithmicDepthBuffer&&Lt.setValue(D,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(X.isMeshPhongMaterial||X.isMeshToonMaterial||X.isMeshLambertMaterial||X.isMeshBasicMaterial||X.isMeshStandardMaterial||X.isShaderMaterial)&&Lt.setValue(D,"isOrthographic",E.isOrthographicCamera===!0),_!==E&&(_=E,yn=!0,br=!0)}if(k.isSkinnedMesh){Lt.setOptional(D,k,"bindMatrix"),Lt.setOptional(D,k,"bindMatrixInverse");let en=k.skeleton;en&&(en.boneTexture===null&&en.computeBoneTexture(),Lt.setValue(D,"boneTexture",en.boneTexture,fe))}k.isBatchedMesh&&(Lt.setOptional(D,k,"batchingTexture"),Lt.setValue(D,"batchingTexture",k._matricesTexture,fe),Lt.setOptional(D,k,"batchingIdTexture"),Lt.setValue(D,"batchingIdTexture",k._indirectTexture,fe),Lt.setOptional(D,k,"batchingColorTexture"),k._colorsTexture!==null&&Lt.setValue(D,"batchingColorTexture",k._colorsTexture,fe));let En=W.morphAttributes;if((En.position!==void 0||En.normal!==void 0||En.color!==void 0)&&oe.update(k,W,xn),(yn||Oe.receiveShadow!==k.receiveShadow)&&(Oe.receiveShadow=k.receiveShadow,Lt.setValue(D,"receiveShadow",k.receiveShadow)),X.isMeshGouraudMaterial&&X.envMap!==null&&(An.envMap.value=be,An.flipEnvMap.value=be.isCubeTexture&&be.isRenderTargetTexture===!1?-1:1),X.isMeshStandardMaterial&&X.envMap===null&&O.environment!==null&&(An.envMapIntensity.value=O.environmentIntensity),yn&&(Lt.setValue(D,"toneMappingExposure",y.toneMappingExposure),Oe.needsLights&&dp(An,br),ce&&X.fog===!0&&te.refreshFogUniforms(An,ce),te.refreshMaterialUniforms(An,X,G,H,p.state.transmissionRenderTarget[E.id]),mr.upload(D,Cu(Oe),An,fe)),X.isShaderMaterial&&X.uniformsNeedUpdate===!0&&(mr.upload(D,Cu(Oe),An,fe),X.uniformsNeedUpdate=!1),X.isSpriteMaterial&&Lt.setValue(D,"center",k.center),Lt.setValue(D,"modelViewMatrix",k.modelViewMatrix),Lt.setValue(D,"normalMatrix",k.normalMatrix),Lt.setValue(D,"modelMatrix",k.matrixWorld),X.isShaderMaterial||X.isRawShaderMaterial){let en=X.uniformsGroups;for(let un=0,ul=en.length;un<ul;un++){let Xi=en[un];et.update(Xi,xn),et.bind(Xi,xn)}}return xn}function dp(E,O){E.ambientLightColor.needsUpdate=O,E.lightProbe.needsUpdate=O,E.directionalLights.needsUpdate=O,E.directionalLightShadows.needsUpdate=O,E.pointLights.needsUpdate=O,E.pointLightShadows.needsUpdate=O,E.spotLights.needsUpdate=O,E.spotLightShadows.needsUpdate=O,E.rectAreaLights.needsUpdate=O,E.hemisphereLights.needsUpdate=O}function fp(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return T},this.setRenderTargetTextures=function(E,O,W){let X=re.get(E);X.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,X.__autoAllocateDepthBuffer===!1&&(X.__useRenderToTexture=!1),re.get(E.texture).__webglTexture=O,re.get(E.depthTexture).__webglTexture=X.__autoAllocateDepthBuffer?void 0:W,X.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,O){let W=re.get(E);W.__webglFramebuffer=O,W.__useDefaultFramebuffer=O===void 0};let pp=D.createFramebuffer();this.setRenderTarget=function(E,O=0,W=0){T=E,R=O,C=W;let X=!0,k=null,ce=!1,ye=!1;if(E){let be=re.get(E);if(be.__useDefaultFramebuffer!==void 0)K.bindFramebuffer(D.FRAMEBUFFER,null),X=!1;else if(be.__webglFramebuffer===void 0)fe.setupRenderTarget(E);else if(be.__hasExternalTextures)fe.rebindTextures(E,re.get(E.texture).__webglTexture,re.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let Ne=E.depthTexture;if(be.__boundDepthTexture!==Ne){if(Ne!==null&&re.has(Ne)&&(E.width!==Ne.image.width||E.height!==Ne.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");fe.setupDepthRenderbuffer(E)}}let ke=E.texture;(ke.isData3DTexture||ke.isDataArrayTexture||ke.isCompressedArrayTexture)&&(ye=!0);let He=re.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(He[O])?k=He[O][W]:k=He[O],ce=!0):E.samples>0&&fe.useMultisampledRTT(E)===!1?k=re.get(E).__webglMultisampledFramebuffer:Array.isArray(He)?k=He[W]:k=He,P.copy(E.viewport),U.copy(E.scissor),z=E.scissorTest}else P.copy(me).multiplyScalar(G).floor(),U.copy(Be).multiplyScalar(G).floor(),z=Ye;if(W!==0&&(k=pp),K.bindFramebuffer(D.FRAMEBUFFER,k)&&X&&K.drawBuffers(E,k),K.viewport(P),K.scissor(U),K.setScissorTest(z),ce){let be=re.get(E.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+O,be.__webglTexture,W)}else if(ye){let be=O;for(let ke=0;ke<E.textures.length;ke++){let He=re.get(E.textures[ke]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+ke,He.__webglTexture,W,be)}}else if(E!==null&&W!==0){let be=re.get(E.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,be.__webglTexture,W)}M=-1},this.readRenderTargetPixels=function(E,O,W,X,k,ce,ye,Ee=0){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let be=re.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&ye!==void 0&&(be=be[ye]),be){K.bindFramebuffer(D.FRAMEBUFFER,be);try{let ke=E.textures[Ee],He=ke.format,Ne=ke.type;if(!$.textureFormatReadable(He)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!$.textureTypeReadable(Ne)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=E.width-X&&W>=0&&W<=E.height-k&&(E.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Ee),D.readPixels(O,W,X,k,De.convert(He),De.convert(Ne),ce))}finally{let ke=T!==null?re.get(T).__webglFramebuffer:null;K.bindFramebuffer(D.FRAMEBUFFER,ke)}}},this.readRenderTargetPixelsAsync=async function(E,O,W,X,k,ce,ye,Ee=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let be=re.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&ye!==void 0&&(be=be[ye]),be)if(O>=0&&O<=E.width-X&&W>=0&&W<=E.height-k){K.bindFramebuffer(D.FRAMEBUFFER,be);let ke=E.textures[Ee],He=ke.format,Ne=ke.type;if(!$.textureFormatReadable(He))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!$.textureTypeReadable(Ne))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ct=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,ct),D.bufferData(D.PIXEL_PACK_BUFFER,ce.byteLength,D.STREAM_READ),E.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Ee),D.readPixels(O,W,X,k,De.convert(He),De.convert(Ne),0);let bt=T!==null?re.get(T).__webglFramebuffer:null;K.bindFramebuffer(D.FRAMEBUFFER,bt);let Ut=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await uf(D,Ut,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,ct),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,ce),D.deleteBuffer(ct),D.deleteSync(Ut),ce}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,O=null,W=0){let X=Math.pow(2,-W),k=Math.floor(E.image.width*X),ce=Math.floor(E.image.height*X),ye=O!==null?O.x:0,Ee=O!==null?O.y:0;fe.setTexture2D(E,0),D.copyTexSubImage2D(D.TEXTURE_2D,W,0,0,ye,Ee,k,ce),K.unbindTexture()};let mp=D.createFramebuffer(),gp=D.createFramebuffer();this.copyTextureToTexture=function(E,O,W=null,X=null,k=0,ce=null){ce===null&&(k!==0?($s("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ce=k,k=0):ce=0);let ye,Ee,be,ke,He,Ne,ct,bt,Ut,Rt=E.isCompressedTexture?E.mipmaps[ce]:E.image;if(W!==null)ye=W.max.x-W.min.x,Ee=W.max.y-W.min.y,be=W.isBox3?W.max.z-W.min.z:1,ke=W.min.x,He=W.min.y,Ne=W.isBox3?W.min.z:0;else{let En=Math.pow(2,-k);ye=Math.floor(Rt.width*En),Ee=Math.floor(Rt.height*En),E.isDataArrayTexture?be=Rt.depth:E.isData3DTexture?be=Math.floor(Rt.depth*En):be=1,ke=0,He=0,Ne=0}X!==null?(ct=X.x,bt=X.y,Ut=X.z):(ct=0,bt=0,Ut=0);let St=De.convert(O.format),Oe=De.convert(O.type),Pt;O.isData3DTexture?(fe.setTexture3D(O,0),Pt=D.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(fe.setTexture2DArray(O,0),Pt=D.TEXTURE_2D_ARRAY):(fe.setTexture2D(O,0),Pt=D.TEXTURE_2D),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,O.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,O.unpackAlignment);let dt=D.getParameter(D.UNPACK_ROW_LENGTH),xn=D.getParameter(D.UNPACK_IMAGE_HEIGHT),Es=D.getParameter(D.UNPACK_SKIP_PIXELS),yn=D.getParameter(D.UNPACK_SKIP_ROWS),br=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,Rt.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Rt.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,ke),D.pixelStorei(D.UNPACK_SKIP_ROWS,He),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Ne);let Lt=E.isDataArrayTexture||E.isData3DTexture,An=O.isDataArrayTexture||O.isData3DTexture;if(E.isDepthTexture){let En=re.get(E),en=re.get(O),un=re.get(En.__renderTarget),ul=re.get(en.__renderTarget);K.bindFramebuffer(D.READ_FRAMEBUFFER,un.__webglFramebuffer),K.bindFramebuffer(D.DRAW_FRAMEBUFFER,ul.__webglFramebuffer);for(let Xi=0;Xi<be;Xi++)Lt&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,re.get(E).__webglTexture,k,Ne+Xi),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,re.get(O).__webglTexture,ce,Ut+Xi)),D.blitFramebuffer(ke,He,ye,Ee,ct,bt,ye,Ee,D.DEPTH_BUFFER_BIT,D.NEAREST);K.bindFramebuffer(D.READ_FRAMEBUFFER,null),K.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(k!==0||E.isRenderTargetTexture||re.has(E)){let En=re.get(E),en=re.get(O);K.bindFramebuffer(D.READ_FRAMEBUFFER,mp),K.bindFramebuffer(D.DRAW_FRAMEBUFFER,gp);for(let un=0;un<be;un++)Lt?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,En.__webglTexture,k,Ne+un):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,En.__webglTexture,k),An?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,en.__webglTexture,ce,Ut+un):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,en.__webglTexture,ce),k!==0?D.blitFramebuffer(ke,He,ye,Ee,ct,bt,ye,Ee,D.COLOR_BUFFER_BIT,D.NEAREST):An?D.copyTexSubImage3D(Pt,ce,ct,bt,Ut+un,ke,He,ye,Ee):D.copyTexSubImage2D(Pt,ce,ct,bt,ke,He,ye,Ee);K.bindFramebuffer(D.READ_FRAMEBUFFER,null),K.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else An?E.isDataTexture||E.isData3DTexture?D.texSubImage3D(Pt,ce,ct,bt,Ut,ye,Ee,be,St,Oe,Rt.data):O.isCompressedArrayTexture?D.compressedTexSubImage3D(Pt,ce,ct,bt,Ut,ye,Ee,be,St,Rt.data):D.texSubImage3D(Pt,ce,ct,bt,Ut,ye,Ee,be,St,Oe,Rt):E.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,ce,ct,bt,ye,Ee,St,Oe,Rt.data):E.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,ce,ct,bt,Rt.width,Rt.height,St,Rt.data):D.texSubImage2D(D.TEXTURE_2D,ce,ct,bt,ye,Ee,St,Oe,Rt);D.pixelStorei(D.UNPACK_ROW_LENGTH,dt),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,xn),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Es),D.pixelStorei(D.UNPACK_SKIP_ROWS,yn),D.pixelStorei(D.UNPACK_SKIP_IMAGES,br),ce===0&&O.generateMipmaps&&D.generateMipmap(Pt),K.unbindTexture()},this.initRenderTarget=function(E){re.get(E).__webglFramebuffer===void 0&&fe.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?fe.setTextureCube(E,0):E.isData3DTexture?fe.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?fe.setTexture2DArray(E,0):fe.setTexture2D(E,0),K.unbindTexture()},this.resetState=function(){R=0,C=0,T=null,K.reset(),xe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Vn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=lt._getDrawingBufferColorSpace(e),t.unpackColorSpace=lt._getUnpackColorSpace()}};function Ms(s,e=!1){let t=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},o={},a=s[0].morphTargetsRelative,c=new mt,l=0;for(let h=0;h<s.length;++h){let u=s[h],d=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in u.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in u.morphAttributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(u.morphAttributes[f])}if(e){let f;if(t)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;c.addGroup(l,f,h),l+=f}}if(t){let h=0,u=[];for(let d=0;d<s.length;++d){let f=s[d].index;for(let g=0;g<f.count;++g)u.push(f.getX(g)+h);h+=s[d].attributes.position.count}c.setIndex(u)}for(let h in r){let u=Kf(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;c.setAttribute(h,u)}for(let h in o){let u=o[h][0].length;if(u===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[h]=[];for(let d=0;d<u;++d){let f=[];for(let x=0;x<o[h].length;++x)f.push(o[h][x][d]);let g=Kf(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;c.morphAttributes[h].push(g)}}return c}function Kf(s){let e,t,n,i=-1,r=0;for(let l=0;l<s.length;++l){let h=s[l];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}let o=new e(r),a=new Tt(o,t,n),c=0;for(let l=0;l<s.length;++l){let h=s[l];if(h.isInterleavedBufferAttribute){let u=c/t;for(let d=0,f=h.count;d<f;d++)for(let g=0;g<t;g++){let x=h.getComponent(d,g);a.setComponent(d+u,g,x)}}else o.set(h.array,c);c+=h.count*t}return i!==void 0&&(a.gpuType=i),a}function zh(s,e){if(e===ph)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===dr||e===Ro){let t=s.getIndex();if(t===null){let o=[],a=s.getAttribute("position");if(a!==void 0){for(let c=0;c<a.count;c++)o.push(c);s.setIndex(o),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}let n=t.count-2,i=[];if(e===dr)for(let o=1;o<=n;o++)i.push(t.getX(0)),i.push(t.getX(o)),i.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(i.push(t.getX(o)),i.push(t.getX(o+1)),i.push(t.getX(o+2))):(i.push(t.getX(o+2)),i.push(t.getX(o+1)),i.push(t.getX(o)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let r=s.clone();return r.setIndex(i),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}var Xc=class extends ni{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Yh(t)}),this.register(function(t){return new Zh(t)}),this.register(function(t){return new iu(t)}),this.register(function(t){return new su(t)}),this.register(function(t){return new ru(t)}),this.register(function(t){return new $h(t)}),this.register(function(t){return new Jh(t)}),this.register(function(t){return new jh(t)}),this.register(function(t){return new Qh(t)}),this.register(function(t){return new qh(t)}),this.register(function(t){return new eu(t)}),this.register(function(t){return new Kh(t)}),this.register(function(t){return new nu(t)}),this.register(function(t){return new tu(t)}),this.register(function(t){return new Wh(t)}),this.register(function(t){return new ou(t)}),this.register(function(t){return new au(t)})}load(e,t,n,i){let r=this,o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){let l=Si.extractUrlBase(e);o=Si.resolveURL(l,this.path)}else o=Si.extractUrlBase(e);this.manager.itemStart(e);let a=function(l){i?i(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},c=new or(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{r.parse(l,o,function(h){t(h),r.manager.itemEnd(e)},a)}catch(h){a(h)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r,o={},a={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===ep){try{o[at.KHR_BINARY_GLTF]=new cu(e)}catch(u){i&&i(u);return}r=JSON.parse(o[at.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let l=new mu(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){let u=this.pluginCallbacks[h](l);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[u.name]=u,o[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){let u=r.extensionsUsed[h],d=r.extensionsRequired||[];switch(u){case at.KHR_MATERIALS_UNLIT:o[u]=new Xh;break;case at.KHR_DRACO_MESH_COMPRESSION:o[u]=new lu(r,this.dracoLoader);break;case at.KHR_TEXTURE_TRANSFORM:o[u]=new hu;break;case at.KHR_MESH_QUANTIZATION:o[u]=new uu;break;default:d.indexOf(u)>=0&&a[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}l.setExtensions(o),l.setPlugins(a),l.parse(n,i)}parseAsync(e,t){let n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}};function Rv(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}var at={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},Wh=class{constructor(e){this.parser=e,this.name=at.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,i=t.cache.get(n);if(i)return i;let r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],l,h=new Ae(16777215);c.color!==void 0&&h.setRGB(c.color[0],c.color[1],c.color[2],Yt);let u=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new fs(h),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new Ti(h),l.distance=u;break;case"spot":l=new vo(h),l.distance=u,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),ri(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),i=Promise.resolve(l),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(c){return n._getNodeRef(t.cache,a,c)})}},Xh=class{constructor(){this.name=at.KHR_MATERIALS_UNLIT}getMaterialType(){return Ge}extendParams(e,t,n){let i=[];e.color=new Ae(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],Yt),e.opacity=o[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,It))}return Promise.all(i)}},qh=class{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},Yh=class{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:fn}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){let a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new ne(a,a)}return Promise.all(r)}},Zh=class{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_DISPERSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:fn}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=i.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}},Kh=class{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:fn}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}},$h=class{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_SHEEN}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:fn}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[];t.sheenColor=new Ae(0,0,0),t.sheenRoughness=0,t.sheen=1;let o=i.extensions[this.name];if(o.sheenColorFactor!==void 0){let a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],Yt)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,It)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}},Jh=class{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:fn}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}},jh=class{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_VOLUME}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:fn}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;let a=o.attenuationColor||[1,1,1];return t.attenuationColor=new Ae().setRGB(a[0],a[1],a[2],Yt),Promise.all(r)}},Qh=class{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_IOR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:fn}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=i.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}},eu=class{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_SPECULAR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:fn}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));let a=o.specularColorFactor||[1,1,1];return t.specularColor=new Ae().setRGB(a[0],a[1],a[2],Yt),o.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,It)),Promise.all(r)}},tu=class{constructor(e){this.parser=e,this.name=at.EXT_MATERIALS_BUMP}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:fn}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}},nu=class{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:fn}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}},iu=class{constructor(e){this.parser=e,this.name=at.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;let r=i.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}},su=class{constructor(e){this.parser=e,this.name=at.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=i.images[o.source],c=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);l!==null&&(c=l)}return n.loadTextureImage(e,o.source,c)}},ru=class{constructor(e){this.parser=e,this.name=at.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=i.images[o.source],c=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);l!==null&&(c=l)}return n.loadTextureImage(e,o.source,c)}},ou=class{constructor(e){this.name=at.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){let c=i.byteOffset||0,l=i.byteLength||0,h=i.count,u=i.byteStride,d=new Uint8Array(a,c,l);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(h,u,d,i.mode,i.filter).then(function(f){return f.buffer}):o.ready.then(function(){let f=new ArrayBuffer(h*u);return o.decodeGltfBuffer(new Uint8Array(f),h,u,d,i.mode,i.filter),f})})}else return null}},au=class{constructor(e){this.name=at.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let i=t.meshes[n.mesh];for(let l of i.primitives)if(l.mode!==Un.TRIANGLES&&l.mode!==Un.TRIANGLE_STRIP&&l.mode!==Un.TRIANGLE_FAN&&l.mode!==void 0)return null;let o=n.extensions[this.name].attributes,a=[],c={};for(let l in o)a.push(this.parser.getDependency("accessor",o[l]).then(h=>(c[l]=h,c[l])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(l=>{let h=l.pop(),u=h.isGroup?h.children:[h],d=l[0].count,f=[];for(let g of u){let x=new Fe,m=new w,p=new kt,v=new w(1,1,1),b=new Vt(g.geometry,g.material,d);for(let y=0;y<d;y++)c.TRANSLATION&&m.fromBufferAttribute(c.TRANSLATION,y),c.ROTATION&&p.fromBufferAttribute(c.ROTATION,y),c.SCALE&&v.fromBufferAttribute(c.SCALE,y),b.setMatrixAt(y,x.compose(m,p,v));for(let y in c)if(y==="_COLOR_0"){let A=c[y];b.instanceColor=new Gn(A.array,A.itemSize,A.normalized)}else y!=="TRANSLATION"&&y!=="ROTATION"&&y!=="SCALE"&&g.geometry.setAttribute(y,c[y]);Qe.prototype.copy.call(b,g),this.parser.assignFinalMaterial(b),f.push(b)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}},ep="glTF",Io=12,$f={JSON:1313821514,BIN:5130562},cu=class{constructor(e){this.name=at.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Io),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==ep)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let i=this.header.length-Io,r=new DataView(e,Io),o=0;for(;o<i;){let a=r.getUint32(o,!0);o+=4;let c=r.getUint32(o,!0);if(o+=4,c===$f.JSON){let l=new Uint8Array(e,Io+o,a);this.content=n.decode(l)}else if(c===$f.BIN){let l=Io+o;this.body=e.slice(l,l+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},lu=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=at.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},c={},l={};for(let h in o){let u=fu[h]||h.toLowerCase();a[u]=o[h]}for(let h in e.attributes){let u=fu[h]||h.toLowerCase();if(o[h]!==void 0){let d=n.accessors[e.attributes[h]],f=xr[d.componentType];l[u]=f.name,c[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,d){i.decodeDracoFile(h,function(f){for(let g in f.attributes){let x=f.attributes[g],m=c[g];m!==void 0&&(x.normalized=m)}u(f)},a,l,Yt,d)})})}},hu=class{constructor(){this.name=at.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}},uu=class{constructor(){this.name=at.KHR_MESH_QUANTIZATION}},qc=class extends _i{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let o=0;o!==i;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=a*2,l=a*3,h=i-t,u=(n-t)/h,d=u*u,f=d*u,g=e*l,x=g-l,m=-2*f+3*d,p=f-d,v=1-m,b=p-d+u;for(let y=0;y!==a;y++){let A=o[x+y+a],R=o[x+y+c]*h,C=o[g+y+a],T=o[g+y]*h;r[y]=v*A+b*R+m*C+p*T}return r}},Cv=new kt,du=class extends qc{interpolate_(e,t,n,i){let r=super.interpolate_(e,t,n,i);return Cv.fromArray(r).normalize().toArray(r),r}},Un={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},xr={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Jf={9728:qt,9729:nn,9984:nc,9985:ar,9986:gs,9987:Tn},jf={33071:Yn,33648:Ys,10497:Kn},Vh={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},fu={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Gi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},Iv={CUBICSPLINE:void 0,LINEAR:ns,STEP:ts},Gh={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function Pv(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new $t({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:bn})),s.DefaultMaterial}function Ts(s,e,t){for(let n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function ri(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function Lv(s,e,t){let n=!1,i=!1,r=!1;for(let l=0,h=e.length;l<h;l++){let u=e[l];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(i=!0),u.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);let o=[],a=[],c=[];for(let l=0,h=e.length;l<h;l++){let u=e[l];if(n){let d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):s.attributes.position;o.push(d)}if(i){let d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):s.attributes.normal;a.push(d)}if(r){let d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):s.attributes.color;c.push(d)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c)]).then(function(l){let h=l[0],u=l[1],d=l[2];return n&&(s.morphAttributes.position=h),i&&(s.morphAttributes.normal=u),r&&(s.morphAttributes.color=d),s.morphTargetsRelative=!0,s})}function Dv(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function Uv(s){let e,t=s.extensions&&s.extensions[at.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Hh(t.attributes):e=s.indices+":"+Hh(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+Hh(s.targets[n]);return e}function Hh(s){let e="",t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function pu(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Nv(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var Fv=new Fe,mu=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Rv,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,o=-1;if(typeof navigator<"u"){let a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;let c=a.match(/Version\/(\d+)/);i=n&&c?parseInt(c[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&o<98?this.textureLoader=new go(this.options.manager):this.textureLoader=new bo(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new or(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){let a={scene:o[0][i.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:i.asset,parser:n,userData:{}};return Ts(r,a,i),ri(a,i),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(a)})).then(function(){for(let c of a.scenes)c.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){let o=t[i].joints;for(let a=0,c=o.length;a<c;a++)e[o[a]].isBone=!0}for(let i=0,r=e.length;i<r;i++){let o=e[i];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let i=n.clone(),r=(o,a)=>{let c=this.associations.get(o);c!=null&&this.associations.set(a,c);for(let[l,h]of o.children.entries())r(h,a.children[l])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let i=e(t[n]);if(i)return i}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let i=0;i<t.length;i++){let r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[at.KHR_BINARY_GLTF].body);let i=this.options;return new Promise(function(r,o){n.load(Si.resolveURL(t.uri,i.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){let t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){let o=Vh[i.type],a=xr[i.componentType],c=i.normalized===!0,l=new a(i.count*o);return Promise.resolve(new Tt(l,o,c))}let r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(o){let a=o[0],c=Vh[i.type],l=xr[i.componentType],h=l.BYTES_PER_ELEMENT,u=h*c,d=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,g=i.normalized===!0,x,m;if(f&&f!==u){let p=Math.floor(d/f),v="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+p+":"+i.count,b=t.cache.get(v);b||(x=new l(a,p*f,i.count*f/h),b=new rs(x,f/h),t.cache.add(v,b)),m=new Fi(b,c,d%f/h,g)}else a===null?x=new l(i.count*c):x=new l(a,d,i.count*c),m=new Tt(x,c,g);if(i.sparse!==void 0){let p=Vh.SCALAR,v=xr[i.sparse.indices.componentType],b=i.sparse.indices.byteOffset||0,y=i.sparse.values.byteOffset||0,A=new v(o[1],b,i.sparse.count*p),R=new l(o[2],y,i.sparse.count*c);a!==null&&(m=new Tt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let C=0,T=A.length;C<T;C++){let M=A[C];if(m.setX(M,R[C*c]),c>=2&&m.setY(M,R[C*c+1]),c>=3&&m.setZ(M,R[C*c+2]),c>=4&&m.setW(M,R[C*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r],a=this.textureLoader;if(o.uri){let c=n.manager.getHandler(o.uri);c!==null&&(a=c)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let i=this,r=this.json,o=r.textures[e],a=r.images[t],c=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[c])return this.textureCache[c];let l=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=o.name||a.name||"",h.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(h.name=a.uri);let d=(r.samplers||{})[o.sampler]||{};return h.magFilter=Jf[d.magFilter]||nn,h.minFilter=Jf[d.minFilter]||Tn,h.wrapS=jf[d.wrapS]||Kn,h.wrapT=jf[d.wrapT]||Kn,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==qt&&h.minFilter!==nn,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){let n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());let o=i.images[e],a=self.URL||self.webkitURL,c=o.uri||"",l=!1;if(o.bufferView!==void 0)c=n.getDependency("bufferView",o.bufferView).then(function(u){l=!0;let d=new Blob([u],{type:o.mimeType});return c=a.createObjectURL(d),c});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let h=Promise.resolve(c).then(function(u){return new Promise(function(d,f){let g=d;t.isImageBitmapLoader===!0&&(g=function(x){let m=new zt(x);m.needsUpdate=!0,d(m)}),t.load(Si.resolveURL(u,r.path),g,void 0,f)})}).then(function(u){return l===!0&&a.revokeObjectURL(c),ri(u,o),u.userData.mimeType=o.mimeType||Nv(o.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){let r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[at.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[at.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let c=r.associations.get(o);o=r.extensions[at.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,c)}}return i!==void 0&&(o.colorSpace=i),e[t]=o,o})}assignFinalMaterial(e){let t=e.geometry,n=e.material,i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,c=this.cache.get(a);c||(c=new nr,rn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(a,c)),n=c}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,c=this.cache.get(a);c||(c=new vi,rn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(a,c)),n=c}if(i||r||o){let a="ClonedMaterial:"+n.uuid+":";i&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let c=this.cache.get(a);c||(c=n.clone(),r&&(c.vertexColors=!0),o&&(c.flatShading=!0),i&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(a,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return $t}loadMaterial(e){let t=this,n=this.json,i=this.extensions,r=n.materials[e],o,a={},c=r.extensions||{},l=[];if(c[at.KHR_MATERIALS_UNLIT]){let u=i[at.KHR_MATERIALS_UNLIT];o=u.getMaterialType(),l.push(u.extendParams(a,r,t))}else{let u=r.pbrMetallicRoughness||{};if(a.color=new Ae(1,1,1),a.opacity=1,Array.isArray(u.baseColorFactor)){let d=u.baseColorFactor;a.color.setRGB(d[0],d[1],d[2],Yt),a.opacity=d[3]}u.baseColorTexture!==void 0&&l.push(t.assignTexture(a,"map",u.baseColorTexture,It)),a.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,a.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(a,"metalnessMap",u.metallicRoughnessTexture)),l.push(t.assignTexture(a,"roughnessMap",u.metallicRoughnessTexture))),o=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=Ct);let h=r.alphaMode||Gh.OPAQUE;if(h===Gh.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,h===Gh.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==Ge&&(l.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new ne(1,1),r.normalTexture.scale!==void 0)){let u=r.normalTexture.scale;a.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&o!==Ge&&(l.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==Ge){let u=r.emissiveFactor;a.emissive=new Ae().setRGB(u[0],u[1],u[2],Yt)}return r.emissiveTexture!==void 0&&o!==Ge&&l.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,It)),Promise.all(l).then(function(){let u=new o(a);return r.name&&(u.name=r.name),ri(u,r),t.associations.set(u,{materials:e}),r.extensions&&Ts(i,u,r),u})}createUniqueName(e){let t=Mt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,i=this.primitiveCache;function r(a){return n[at.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(c){return Qf(c,a,t)})}let o=[];for(let a=0,c=e.length;a<c;a++){let l=e[a],h=Uv(l),u=i[h];if(u)o.push(u.promise);else{let d;l.extensions&&l.extensions[at.KHR_DRACO_MESH_COMPRESSION]?d=r(l):d=Qf(new mt,l,t),i[h]={primitive:l,promise:d},o.push(d)}}return Promise.all(o)}loadMesh(e){let t=this,n=this.json,i=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let c=0,l=o.length;c<l;c++){let h=o[c].material===void 0?Pv(this.cache):this.getDependency("material",o[c].material);a.push(h)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(c){let l=c.slice(0,c.length-1),h=c[c.length-1],u=[];for(let f=0,g=h.length;f<g;f++){let x=h[f],m=o[f],p,v=l[f];if(m.mode===Un.TRIANGLES||m.mode===Un.TRIANGLE_STRIP||m.mode===Un.TRIANGLE_FAN||m.mode===void 0)p=r.isSkinnedMesh===!0?new $r(x,v):new We(x,v),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===Un.TRIANGLE_STRIP?p.geometry=zh(p.geometry,Ro):m.mode===Un.TRIANGLE_FAN&&(p.geometry=zh(p.geometry,dr));else if(m.mode===Un.LINES)p=new Bi(x,v);else if(m.mode===Un.LINE_STRIP)p=new as(x,v);else if(m.mode===Un.LINE_LOOP)p=new jr(x,v);else if(m.mode===Un.POINTS)p=new Qr(x,v);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&Dv(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),ri(p,r),m.extensions&&Ts(i,p,m),t.assignFinalMaterial(p),u.push(p)}for(let f=0,g=u.length;f<g;f++)t.associations.set(u[f],{meshes:e,primitives:f});if(u.length===1)return r.extensions&&Ts(i,u[0],r),u[0];let d=new Je;r.extensions&&Ts(i,d,r),t.associations.set(d,{meshes:e});for(let f=0,g=u.length;f<g;f++)d.add(u[f]);return d})}loadCamera(e){let t,n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Nt(rt.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new ds(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),ri(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){let r=i.pop(),o=i,a=[],c=[];for(let l=0,h=o.length;l<h;l++){let u=o[l];if(u){a.push(u);let d=new Fe;r!==null&&d.fromArray(r.array,l*16),c.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new Jr(a,c)})}loadAnimation(e){let t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,o=[],a=[],c=[],l=[],h=[];for(let u=0,d=i.channels.length;u<d;u++){let f=i.channels[u],g=i.samplers[f.sampler],x=f.target,m=x.node,p=i.parameters!==void 0?i.parameters[g.input]:g.input,v=i.parameters!==void 0?i.parameters[g.output]:g.output;x.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",p)),c.push(this.getDependency("accessor",v)),l.push(g),h.push(x))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c),Promise.all(l),Promise.all(h)]).then(function(u){let d=u[0],f=u[1],g=u[2],x=u[3],m=u[4],p=[];for(let b=0,y=d.length;b<y;b++){let A=d[b],R=f[b],C=g[b],T=x[b],M=m[b];if(A===void 0)continue;A.updateMatrix&&A.updateMatrix();let _=n._createAnimationTracks(A,R,C,T,M);if(_)for(let P=0;P<_.length;P++)p.push(_[P])}let v=new us(r,void 0,p);return ri(v,i),v})}createNodeMesh(e){let t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){let o=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let c=0,l=i.weights.length;c<l;c++)a.morphTargetInfluences[c]=i.weights[c]}),o})}loadNode(e){let t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=i.children||[];for(let l=0,h=a.length;l<h;l++)o.push(n.getDependency("node",a[l]));let c=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(o),c]).then(function(l){let h=l[0],u=l[1],d=l[2];d!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(d,Fv)});for(let f=0,g=u.length;f<g;f++)h.add(u[f]);return h})}_loadNodeShallow(e){let t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],o=r.name?i.createUniqueName(r.name):"",a=[],c=i._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&a.push(c),r.camera!==void 0&&a.push(i.getDependency("camera",r.camera).then(function(l){return i._getNodeRef(i.cameraCache,r.camera,l)})),i._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){a.push(l)}),this.nodeCache[e]=Promise.all(a).then(function(l){let h;if(r.isBone===!0?h=new er:l.length>1?h=new Je:l.length===1?h=l[0]:h=new Qe,h!==l[0])for(let u=0,d=l.length;u<d;u++)h.add(l[u]);if(r.name&&(h.userData.name=r.name,h.name=o),ri(h,r),r.extensions&&Ts(n,h,r),r.matrix!==void 0){let u=new Fe;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!i.associations.has(h))i.associations.set(h,{});else if(r.mesh!==void 0&&i.meshCache.refs[r.mesh]>1){let u=i.associations.get(h);i.associations.set(h,{...u})}return i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],i=this,r=new Je;n.name&&(r.name=i.createUniqueName(n.name)),ri(r,n),n.extensions&&Ts(t,r,n);let o=n.nodes||[],a=[];for(let c=0,l=o.length;c<l;c++)a.push(i.getDependency("node",o[c]));return Promise.all(a).then(function(c){for(let h=0,u=c.length;h<u;h++)r.add(c[h]);let l=h=>{let u=new Map;for(let[d,f]of i.associations)(d instanceof rn||d instanceof zt)&&u.set(d,f);return h.traverse(d=>{let f=i.associations.get(d);f!=null&&u.set(d,f)}),u};return i.associations=l(r),r})}_createAnimationTracks(e,t,n,i,r){let o=[],a=e.name?e.name:e.uuid,c=[];Gi[r.path]===Gi.weights?e.traverse(function(d){d.morphTargetInfluences&&c.push(d.name?d.name:d.uuid)}):c.push(a);let l;switch(Gi[r.path]){case Gi.weights:l=Qn;break;case Gi.rotation:l=ei;break;case Gi.translation:case Gi.scale:l=ti;break;default:switch(n.itemSize){case 1:l=Qn;break;case 2:case 3:default:l=ti;break}break}let h=i.interpolation!==void 0?Iv[i.interpolation]:ns,u=this._getArrayFromAccessor(n);for(let d=0,f=c.length;d<f;d++){let g=new l(c[d]+"."+Gi[r.path],t.array,u,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=pu(t.constructor),i=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let i=this instanceof ei?du:qc;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function Bv(s,e,t){let n=e.attributes,i=new Ft;if(n.POSITION!==void 0){let a=t.json.accessors[n.POSITION],c=a.min,l=a.max;if(c!==void 0&&l!==void 0){if(i.set(new w(c[0],c[1],c[2]),new w(l[0],l[1],l[2])),a.normalized){let h=pu(xr[a.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let a=new w,c=new w;for(let l=0,h=r.length;l<h;l++){let u=r[l];if(u.POSITION!==void 0){let d=t.json.accessors[u.POSITION],f=d.min,g=d.max;if(f!==void 0&&g!==void 0){if(c.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),c.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),c.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),d.normalized){let x=pu(xr[d.componentType]);c.multiplyScalar(x)}a.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(a)}s.boundingBox=i;let o=new dn;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=o}function Qf(s,e,t){let n=e.attributes,i=[];function r(o,a){return t.getDependency("accessor",o).then(function(c){s.setAttribute(a,c)})}for(let o in n){let a=fu[o]||o.toLowerCase();a in s.attributes||i.push(r(n[o],a))}if(e.indices!==void 0&&!s.index){let o=t.getDependency("accessor",e.indices).then(function(a){s.setIndex(a)});i.push(o)}return lt.workingColorSpace!==Yt&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${lt.workingColorSpace}" not supported.`),ri(s,e),Bv(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?Lv(s,e.targets,t):s})}var Po=new w;function Nn(s,e,t,n,i,r){let o=2*Math.PI*i/4,a=Math.max(r-2*i,0),c=Math.PI/4;Po.copy(e),Po[n]=0,Po.normalize();let l=.5*o/(o+a),h=1-Po.angleTo(s)/c;return Math.sign(Po[t])===1?h*l:a/(o+a)+l+l*(1-h)}var Yc=class s extends Ue{constructor(e=1,t=1,n=1,i=2,r=.1){let o=i*2+1;if(r=Math.min(e/2,t/2,n/2,r),super(1,1,1,o,o,o),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:n,segments:i,radius:r},o===1)return;let a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;let c=new w,l=new w,h=new w(e,t,n).divideScalar(2).subScalar(r),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,g=u.length/6,x=new w,m=.5/o;for(let p=0,v=0;p<u.length;p+=3,v+=2)switch(c.fromArray(u,p),l.copy(c),l.x-=Math.sign(l.x)*m,l.y-=Math.sign(l.y)*m,l.z-=Math.sign(l.z)*m,l.normalize(),u[p+0]=h.x*Math.sign(c.x)+l.x*r,u[p+1]=h.y*Math.sign(c.y)+l.y*r,u[p+2]=h.z*Math.sign(c.z)+l.z*r,d[p+0]=l.x,d[p+1]=l.y,d[p+2]=l.z,Math.floor(p/g)){case 0:x.set(1,0,0),f[v+0]=Nn(x,l,"z","y",r,n),f[v+1]=1-Nn(x,l,"y","z",r,t);break;case 1:x.set(-1,0,0),f[v+0]=1-Nn(x,l,"z","y",r,n),f[v+1]=1-Nn(x,l,"y","z",r,t);break;case 2:x.set(0,1,0),f[v+0]=1-Nn(x,l,"x","z",r,e),f[v+1]=Nn(x,l,"z","x",r,n);break;case 3:x.set(0,-1,0),f[v+0]=1-Nn(x,l,"x","z",r,e),f[v+1]=1-Nn(x,l,"z","x",r,n);break;case 4:x.set(0,0,1),f[v+0]=1-Nn(x,l,"x","y",r,e),f[v+1]=1-Nn(x,l,"y","x",r,t);break;case 5:x.set(0,0,-1),f[v+0]=Nn(x,l,"x","y",r,e),f[v+1]=1-Nn(x,l,"y","x",r,t);break}}static fromJSON(e){return new s(e.width,e.height,e.depth,e.segments,e.radius)}};function oi(s){return new $t({color:s,roughness:.67,metalness:.36})}function Kc(s,e=1){return new Ge({color:s,transparent:e<1,opacity:e,depthWrite:e===1})}function ot(s,e,t,n){let i=new Vt(e,t,n);return i.count=0,i.instanceMatrix.setUsage(Ri),i.frustumCulled=!1,s.add(i),i}function ze(s,e){s.count=e,s.instanceMatrix.needsUpdate=!0,s.instanceColor&&(s.instanceColor.needsUpdate=!0);let t=s.geometry.getAttribute("instanceOpacity");t&&(t.needsUpdate=!0)}function an(s,e){s.geometry.setAttribute("instanceOpacity",new Gn(new Float32Array(e),1));let t=s.material;t.transparent=!0,t.depthWrite=!1,t.onBeforeCompile=n=>{n.vertexShader=n.vertexShader.replace("#include <common>",`#include <common>
attribute float instanceOpacity; varying float vInstanceOpacity;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vInstanceOpacity = instanceOpacity;`),n.fragmentShader=n.fragmentShader.replace("#include <common>",`#include <common>
varying float vInstanceOpacity;`).replace("#include <color_fragment>",`#include <color_fragment>
diffuseColor.a *= vInstanceOpacity;`)},t.customProgramCacheKey=()=>"mechalord-instance-opacity-v1"}function ht(s,e,t=0,n=0,i=0,r=0,o=0,a=0){let c=s.index?s.toNonIndexed():s;c!==s&&s.dispose(),c.rotateX(r).rotateY(o).rotateZ(a).translate(t,n,i);let l=new Ae(e),h=new Float32Array(c.getAttribute("position").count*3);for(let u=0;u<h.length;u+=3)h[u]=l.r,h[u+1]=l.g,h[u+2]=l.b;return c.setAttribute("color",new Tt(h,3)),c}function ai(s){let e=Ms(s,!1);return s.forEach(t=>t.dispose()),e}function tp(s,e){return new Zt({uniforms:{uTime:s,uSmoke:{value:e?1:0}},transparent:!0,depthWrite:!1,blending:e?yi:wt,toneMapped:!1,vertexColors:!0,vertexShader:`attribute float instanceOpacity;
      varying vec2 vUv; varying vec3 vTint; varying float vFade; varying float vSeed;
      void main(){vUv=uv;vFade=instanceOpacity;
        #ifdef USE_INSTANCING_COLOR
        vTint=instanceColor;
        #else
        vTint=vec3(1.);
        #endif
        vec4 centre=instanceMatrix*vec4(0.,0.,0.,1.);vSeed=dot(centre.xyz,vec3(2.7,4.3,1.9));
        vec2 size=vec2(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz));
        vec4 eye=modelViewMatrix*centre;eye.xy+=position.xy*size;gl_Position=projectionMatrix*eye;}`,fragmentShader:`uniform float uTime;uniform float uSmoke;varying vec2 vUv;varying vec3 vTint;varying float vFade;varying float vSeed;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){vec2 p=vUv*2.-1.;vec2 flow=p*3.6+vec2(vSeed,uTime*-1.6);
        float n=.57*noise(flow)+.28*noise(flow*2.1+uTime*.4)+.15*noise(flow*4.3);
        float d=length(p),edge=1.-smoothstep(.50+n*.24,.98,d);
        if(edge<.005)discard;
        float hot=pow(max(0.,1.-d*1.55),1.4)*(1.1-n*.35);
        vec3 fire=mix(vTint*1.55,vec3(1.,.96,.76)*2.2,hot);
        vec3 soot=vTint*(.72+n*.65);
        gl_FragColor=vec4(mix(fire,soot,uSmoke),edge*vFade*mix(.82,.33,uSmoke));}`})}function Zc(s,e){for(let t=s;t;t=t.parent){if(!t.visible)return!1;if(t===e)break}return!0}var $c=class{constructor(e){this.scene=e;this.debris=ot(e,new Ue(1,1,1),oi(16777215),this.debrisCapacity),this.debris.castShadow=!0,this.rotors=ot(e,ai([ht(new it(.4,.1,4,12),16777215),ht(new qe(.17,.17,.28,8).rotateX(Math.PI/2),16777215)]),oi(16777215),this.debrisCapacity),this.struts=ot(e,new qe(.16,.22,1,6),oi(16777215),this.debrisCapacity),this.sparkMesh=ot(e,new qe(.018,.012,1,4),new Ge({color:16777215,transparent:!0,opacity:.85,depthWrite:!1,toneMapped:!1}),128),an(this.rotors,this.debrisCapacity),an(this.struts,this.debrisCapacity),an(this.sparkMesh,128),this.smoke=ot(e,new Ln(2.7,2.7),tp(this.combustionTime,!0),this.particleCapacity),this.fire=ot(e,new Ln(3.2,3.2),tp(this.combustionTime,!1),this.particleCapacity);let t=new Ge({color:16777215,transparent:!0,opacity:.75,depthWrite:!1,blending:wt,toneMapped:!1});this.acquireRing=ot(e,new it(1,.025,3,32).rotateX(Math.PI/2),t,4);let n=ai([ht(new Ue(.025,.28,.025),16777215,-.035,.26,0,0,0,-.25),ht(new Ue(.025,.23,.025),16777215,.01,.04,0,0,0,.55),ht(new Ue(.025,.28,.025),16777215,-.02,-.19,0,0,0,-.25)]);this.acquireTrace=ot(e,n,t.clone(),32),an(this.acquireRing,4),an(this.acquireTrace,32);let i=new Ge({color:7268607,transparent:!0,opacity:.75,depthWrite:!1,blending:wt,toneMapped:!1});this.streamBodies=ot(e,new qe(.035,.035,1,6).rotateX(Math.PI/2),i,48),this.streamHeads=ot(e,new Kt(.11),i.clone(),48),an(this.streamBodies,48),an(this.streamHeads,48),an(this.debris,this.debrisCapacity);for(let r of[this.smoke,this.fire])r.geometry.setAttribute("instanceOpacity",new Gn(new Float32Array(this.particleCapacity),1))}combustionTime={value:0};debrisCapacity=384;particleCapacity=256;fragmentCapacity=24;chunks=Array.from({length:384},()=>({p:new w,v:new w,r:new w,spin:new w,size:new w,color:new Ae,life:0,max:1,bounce:0}));puffs=Array.from({length:256},()=>({p:new w,v:new w,life:0,max:1,size:1,kind:"smoke",color:new Ae}));chunkIndex=0;puffIndex=0;seed=1921;age=0;dummy=new Qe;fragments=[];hiddenBossParts=new Map;bossDestroyed=!1;bossBurn;bossBurnTime=0;bossEmission=0;commanderFragments=[];commanderFragmentCapacity=12;debris;smoke;fire;rotors;struts;sparkMesh;sparks=Array.from({length:128},()=>({p:new w,v:new w,life:0,max:1,color:new Ae}));sparkIndex=0;bursts=[];sacrificeStreams=[];streamBodies;streamHeads;acquisitions=[];acquireRing;acquireTrace;acquireDummy=new Qe;random(){return this.seed=this.seed*16807%2147483647,this.seed/2147483647}puff(e,t,n,i,r,o,a){let c=this.puffs[this.puffIndex++%this.particleCapacity];c.p.set(e,t,n),c.v.set((this.random()-.5)*1.2,.5+this.random()*1.5,(this.random()-.5)*1.2),c.kind=i,c.size=r,c.life=c.max=o,c.color.set(a)}chunk(e,t,n,i,r,o,a="plate"){let c=this.chunks[this.chunkIndex++%this.debrisCapacity];c.p.set(e,t,n);let l=this.random()*Math.PI*2;c.v.set(Math.cos(l)*o*(.35+this.random()),2+this.random()*o,Math.sin(l)*o*(.35+this.random())),c.r.set(this.random()*6,this.random()*6,this.random()*6),c.spin.set((this.random()-.5)*10,(this.random()-.5)*10,(this.random()-.5)*10),c.size.set(i*(.6+this.random()),i*(.2+this.random()*.4),i*(.55+this.random())),c.color.set(r),c.life=c.max=1.8+this.random()*.5,c.bounce=0,c.kind=a,a==="rotor"?c.size.set(i*1.5,i*1.5,i*1.5):a==="strut"&&c.size.set(i,i*1.8,i)}spark(e,t,n,i=1,r=16759381){let o=this.sparks[this.sparkIndex++%128],a=this.random()*Math.PI*2;o.p.set(e,t,n),o.v.set(Math.cos(a)*(1+this.random()*2)*i,(.8+this.random()*2)*i,Math.sin(a)*(1+this.random()*2)*i),o.life=o.max=.18+this.random()*.25,o.color.set(r)}deflect(e,t,n){this.puff(e,t,n,"flash",.13,.055,11190988);for(let i=0;i<3;i++)this.spark(e,t,n,.55,11190988)}later(e,t,n,i,r){this.bursts.length>=32&&this.bursts.shift(),this.bursts.push({p:new w(e,t,n),delay:i,strength:r})}enemyDeath(e,t,n=0,i=1,r=.6*i){let o=n>0,a=o?14:7;for(let c=0;c<a;c++)this.chunk(e+(this.random()-.5)*i,.4+this.random()*i,t+(this.random()-.5)*i,(.22+this.random()*.06)*i,c%5===0?8663842:c%5===3?9992011:c%2?2568761:3819600,o?3.3:2.3,c%7===3||c%7===4?"rotor":c%7>4?"strut":"plate");this.impact(e,r,t,o?1.65:1),o&&(this.later(e-.32*i,r-.24,t,.1,1.1),this.later(e+.32*i,r+.17,t-.1,.24,.85))}allyLoss(e,t,n){if(n<=0)return;let i=Math.min(8,Math.max(2,Math.ceil(n*1.5)));for(let r=0;r<i;r++)this.chunk(e+(this.random()-.5)*.7,.55+this.random()*.5,t+(this.random()-.5)*.7,.22,r%2?3425099:14010793,2.1);this.impact(e,.75,t,1)}impact(e,t,n,i=1){this.puff(e,t,n,"flash",Math.min(.7,.34*i),.085,16768161);for(let r=0;r<(i>.65?9:3);r++)this.spark(e,t,n,Math.min(1.5,i));if(!(i<=.65)){for(let r=0;r<3;r++)this.puff(e+(this.random()-.5)*.4,t,n+(this.random()-.5)*.4,"fire",(.16+this.random()*.19)*Math.min(i,2),.22+this.random()*.3,r%2?16751652:16730144);for(let r=0;r<2;r++)this.puff(e,t,n,"smoke",(.18+this.random()*.16)*Math.min(i,2),.65+this.random()*.45,4673882)}}muzzle(e,t,n,i=!1){this.puff(e,t,n,"flash",.22,.07,i?16739104:16766061)}bossPartBreak(e,t){if(this.bossDestroyed)return!1;e.updateWorldMatrix(!0,!0);let n={cannonL:["Barrel_L"],cannonR:["Barrel_R"],boosterL:["Pod_L","BattleizerWing_L"],boosterR:["Pod_R","BattleizerWing_R"],legL:["Leg_L"],legR:["Leg_R"]},i=0;for(let r of n[t]){let o=e.getObjectByName(r);if(!o||!Zc(o,e))continue;let a=[];o.traverse(c=>{let l=c;l.isMesh&&Zc(l,e)&&a.push(l)});for(let c of a){if(this.fragments.length>=this.fragmentCapacity)break;let l=Array.isArray(c.material)?c.material:[c.material];if(l.every(m=>m.opacity<=0||m.blending===wt))continue;c.geometry.computeBoundingBox();let h=c.geometry.boundingBox.getCenter(new w).applyMatrix4(c.matrixWorld),u=l.map(m=>m.clone()),d=new We(c.geometry,Array.isArray(c.material)?u:u[0]);d.matrixAutoUpdate=!1,d.matrix.copy(new Fe().makeTranslation(-h.x,-h.y,-h.z).multiply(c.matrixWorld)),d.castShadow=!0,d.name="Wreck_"+c.name;let f=new Je;f.position.copy(h),f.add(d),this.scene.add(f);let g=new Ft().setFromObject(f),x=t.endsWith("L")?-1:1;this.fragments.push({group:f,v:new w(x*(1.2+this.random()),1.5+this.random(),.7),spin:new w(.5,x*1.2,x*1.7),delay:0,age:0,floor:Math.max(.1,h.y-g.min.y),settled:!1,materials:u}),i<3&&this.later(h.x,h.y,h.z,i*.09,i===0?2:1.1),i++}a.length&&(this.hiddenBossParts.has(o)||this.hiddenBossParts.set(o,o.visible),o.visible=!1)}return i>0}bossDeath(e,t){if(this.bossDestroyed)return!1;for(this.bossDestroyed=!0,e.updateWorldMatrix(!0,!0);this.fragments.length>this.fragmentCapacity-8;){let h=this.fragments.shift();this.scene.remove(h.group),h.materials.forEach(u=>u.dispose()),h.ownedGeometry?.dispose()}let n=this.fragments.length,i=[],r=[];e.traverse(h=>r.push(h));let o=h=>/torso/i.test(h.name)?0:/head|face/i.test(h.name+" "+h.parent?.name)?1:2;r.sort((h,u)=>o(h)-o(u)),r.forEach(h=>{let u=h;if(!u.isMesh||!Zc(u,e)||n>=this.fragmentCapacity||!u.geometry.getAttribute("position")||u.name.toLowerCase().includes("badge"))return;u.geometry.computeBoundingBox();let d=u.geometry.boundingBox.getCenter(new w).applyMatrix4(u.matrixWorld),f=Array.isArray(u.material)?u.material:[u.material];if(f.every(C=>C.opacity<=0||C.blending===wt))return;let g=f.map(C=>{let T=C.clone();return T.transparent=!0,T}),x=new We(u.geometry,Array.isArray(u.material)?g:g[0]);x.castShadow=!0,x.name="Wreck_"+u.name,x.matrixAutoUpdate=!1,x.matrix.copy(new Fe().makeTranslation(-d.x,-d.y,-d.z).multiply(u.matrixWorld));let m=new Je;m.position.copy(d),m.add(x),this.scene.add(m);let p=(u.name+" "+u.parent?.name).toLowerCase(),v=p.includes("torso")?.72:p.includes("head")?.43:.06*(n%5),y=d.clone().sub(e.getWorldPosition(new w)).setY(0).normalize().multiplyScalar(1.1+this.random()*1.7);y.y=1+this.random()*2;let A=new Ft().setFromObject(m),R=Math.max(.12,d.y-A.min.y);this.fragments.push({group:m,v:y,spin:new w((this.random()-.5)*2.5,(this.random()-.5)*2.5,(this.random()-.5)*2.5),delay:v,age:0,floor:R,settled:!1,materials:g}),i.push(d),n++});let a=e.getWorldPosition(new w),c=e.getObjectByName("Torso")??r.find(h=>/torso/i.test(h.name)),l=t?.clone()??(c?new Ft().setFromObject(c).getCenter(new w):new w(a.x,a.y+2,a.z));l.toArray().every(Number.isFinite)||l.set(a.x,a.y+2,a.z),l.y=Math.max(.45,l.y),this.bossBurn=new w(l.x,.4,l.z),this.bossBurnTime=2.8,this.bossEmission=0,this.puff(l.x,l.y,l.z,"flash",1.02,.13,16771792);for(let h=0;h<12;h++){let u=h*Math.PI*2/12,d=.12+h%3*.16;this.puff(l.x+Math.cos(u)*d,l.y+h%3*.2,l.z+Math.sin(u)*d,"fire",.48+this.random()*.3,.4+this.random()*.34,h%3?16747045:16729376)}for(let h=0;h<24;h++)this.spark(l.x,l.y,l.z,2.2,h%4?16760161:14152959);for(let h=0;h<5;h++)this.puff(l.x+(this.random()-.5)*.65,l.y+.2,l.z+(this.random()-.5)*.65,"smoke",.4+this.random()*.16,.85+this.random()*.35,5265764);for(let h=0;h<10;h++)this.chunk(l.x,l.y,l.z,.16+this.random()*.1,h%3?6911870:14002264,3.2,h%4===0?"rotor":h%4===1?"strut":"plate");this.later(l.x-.38,l.y+.22,l.z,.12,1.8),this.later(l.x+.38,l.y+.4,l.z,.27,1.6);for(let[h,u]of i.slice(0,6).entries())this.later(u.x,Math.max(.25,u.y),u.z,.08+h*.095,h===0?2:1.2);return n>0}commanderDeath(e){if(this.commanderFragments.length)return!1;e.updateWorldMatrix(!0,!0);let t=e.getWorldPosition(new w),n=(i,r,o,a=!1)=>{if(this.commanderFragments.length>=this.commanderFragmentCapacity){a&&i.dispose();return}i.computeBoundingBox();let c=i.boundingBox.getCenter(new w).applyMatrix4(o),l=r.clone(),h=new We(i,l);h.castShadow=!0,h.matrixAutoUpdate=!1,h.matrix.copy(new Fe().makeTranslation(-c.x,-c.y,-c.z).multiply(o));let u=new Je;u.position.copy(c),u.add(h),this.scene.add(u);let d=c.clone().sub(t).setY(0);d.lengthSq()<.02&&d.set(this.random()-.5,0,this.random()-.5),d.normalize().multiplyScalar(1.7+this.random()*1.7),d.y=2.4+this.random()*1.6;let f=new Ft().setFromObject(u);this.commanderFragments.push({group:u,v:d,spin:new w((this.random()-.5)*4,(this.random()-.5)*4,(this.random()-.5)*4),delay:0,age:0,floor:Math.max(.08,c.y-f.min.y),settled:!1,materials:[l],ownedGeometry:a?i:void 0})};if(e.traverse(i=>{let r=i;if(!r.isMesh||!Zc(r,e)||this.commanderFragments.length>=this.commanderFragmentCapacity)return;let o=Array.isArray(r.material)?r.material:[r.material];if(o.every(A=>A.opacity<=0||A.blending===wt)||["RingGeometry","CircleGeometry","PlaneGeometry"].includes(r.geometry.type))return;if(!r.isSkinnedMesh){n(r.geometry,o[0],r.matrixWorld);return}let a=r;a.skeleton.update();let c=r.geometry,l=c.getAttribute("position"),h=c.getAttribute("uv"),u=c.index,d=(u?u.count:l.count)/3;if(d>15e4){n(r.geometry,o[0],r.matrixWorld);return}let f=new Float32Array(l.count*3),g=new w,x=new w(1/0,1/0,1/0),m=new w(-1/0,-1/0,-1/0);for(let A=0;A<l.count;A++)a.getVertexPosition(A,g).applyMatrix4(r.matrixWorld),g.toArray(f,A*3),x.min(g),m.max(g);let p=Math.max(.01,m.y-x.y),v=(x.x+m.x)/2,b=m.x-x.x,y=new Map;for(let A=0;A<d;A++){let R=[0,1,2].map(B=>u?u.getX(A*3+B):A*3+B),C=R.reduce((B,I)=>B+f[I*3],0)/3,T=(R.reduce((B,I)=>B+f[I*3+1],0)/3-x.y)/p,M=C<v?"L":"R",_=T>.79?"Head":T<.16?"Foot_"+M:T<.37?"Leg_"+M:Math.abs(C-v)>b*.22&&T<.78?"Arm_"+M:"Torso",U=c.groups.find(B=>A*3>=B.start&&A*3<B.start+B.count)?.materialIndex??0,z=_+"_"+U,N=y.get(z);N||(N={vertices:[],uvs:[],material:U},y.set(z,N));for(let B of R)N.vertices.push(f[B*3],f[B*3+1],f[B*3+2]),h&&N.uvs.push(h.getX(B),h.getY(B))}for(let[A,R]of y){let C=new mt;C.name="FrozenCommander_"+A,C.setAttribute("position",new Ze(R.vertices,3)),h&&C.setAttribute("uv",new Ze(R.uvs,2)),C.computeVertexNormals(),n(C,o[R.material]??o[0],new Fe,!0)}}),this.commanderFragments.length){this.impact(t.x,1.5,t.z,2.2);for(let i=0;i<10;i++)this.chunk(t.x,1+this.random(),t.z,.27,i%2?14997429:3359821,3.4)}return this.commanderFragments.length>0}sacrifice(e,t){for(let[n,i]of t.slice(0,24).entries())this.sacrificeStreams.length>=48&&this.sacrificeStreams.shift(),this.sacrificeStreams.push({root:e,from:new w(i.x,i.y??.85,i.z),age:0,delay:n*.012});t.length&&this.powerAcquire(e,"guided")}powerAcquire(e,t){e.updateWorldMatrix(!0,!0);let n=new Ft().setFromObject(e),i=n.getSize(new w),r={guided:4837375,cannons:16757322,railburst:12223487,freeze:11006207,slow:6411924,haste:16737849,escort:8250857};this.acquisitions.length>=4&&this.acquisitions.shift(),this.acquisitions.push({root:e,age:0,radius:rt.clamp(Math.max(i.x,i.z)*.45,.5,1.4),height:rt.clamp(i.y,1.5,3.5),color:new Ae(r[t])});let o=e.getWorldPosition(new w);for(let a=0;a<3;a++)this.puff(o.x,1.3+a*.3,o.z,"flash",.13,.22,r[t])}update(e){let t=Math.max(0,Math.min(e,.15));if(this.age+=t,this.combustionTime.value=this.age,t>0){for(let x of this.bursts)x.delay-=t,x.delay<=0&&this.impact(x.p.x,x.p.y,x.p.z,x.strength);this.bursts=this.bursts.filter(x=>x.delay>0)}let n=t>0?Math.ceil(t/(1/60)):0,i=n?t/n:0;for(let x=0;x<n;x++){for(let m of this.chunks){if(m.life<=0)continue;m.life-=i,m.v.y-=i*9.8,m.p.addScaledVector(m.v,i),m.r.addScaledVector(m.spin,i);let p=Math.max(.04,m.size.y*.5);m.p.y<p&&(m.p.y=p,m.v.y=Math.abs(m.v.y)*.26,m.v.x*=.67,m.v.z*=.67,m.spin.multiplyScalar(.6),m.bounce++,m.bounce>3&&(m.v.y=0))}for(let m of this.puffs)m.life<=0||(m.life-=i,m.p.addScaledVector(m.v,i),m.v.multiplyScalar(1-i*.6));for(let m of this.sparks)m.life<=0||(m.life-=i,m.v.y-=i*5,m.p.addScaledVector(m.v,i));for(let m of[this.fragments,this.commanderFragments])for(let p of m)p.settled||(p.age+=i,!(p.age<p.delay)&&(p.v.y-=i*8,p.group.position.addScaledVector(p.v,i),p.group.rotation.x+=p.spin.x*i,p.group.rotation.y+=p.spin.y*i,p.group.rotation.z+=p.spin.z*i,p.group.position.y<p.floor&&(p.group.position.y=p.floor,p.v.y=Math.abs(p.v.y)*.12,p.v.x*=.75,p.v.z*=.75,p.spin.multiplyScalar(.4))))}if(this.bossBurn&&this.bossBurnTime>0)for(this.bossBurnTime-=t,this.bossEmission+=t;this.bossEmission>=.1;){this.bossEmission-=.1;let x=this.bossBurn;this.puff(x.x+(this.random()-.5)*2,x.y,x.z+(this.random()-.5)*1.5,"fire",.38,.45,16741160),this.puff(x.x,x.y+.5,x.z,"smoke",.65,1.15,3556170)}let r=0,o=0,a=0,c=0,l=0;for(let x of this.chunks){if(x.life<=0)continue;let m=Math.min(1,x.life/.45),p=x.kind==="rotor"?this.rotors:x.kind==="strut"?this.struts:this.debris,v=x.kind==="rotor"?o++:x.kind==="strut"?a++:r++;this.dummy.position.copy(x.p),this.dummy.rotation.set(x.r.x,x.r.y,x.r.z),this.dummy.scale.copy(x.size).multiplyScalar(m),this.dummy.updateMatrix(),p.setMatrixAt(v,this.dummy.matrix),p.geometry.getAttribute("instanceOpacity").setX(v,m),p.setColorAt(v,x.color)}for(let x of this.puffs){if(x.life<=0)continue;let m=1-x.life/x.max,p=Math.min(1,x.life/.22),v=x.kind==="smoke"?this.smoke:this.fire,b=x.kind==="smoke"?c++:l++;this.dummy.position.copy(x.p),this.dummy.rotation.set(m*2,m*3,m),this.dummy.scale.setScalar(x.size*(x.kind==="smoke"?1+m*2:1-m*.55)*p),this.dummy.updateMatrix(),v.setMatrixAt(b,this.dummy.matrix),v.geometry.getAttribute("instanceOpacity").setX(b,p),v.setColorAt(b,x.color)}ze(this.debris,r),ze(this.rotors,o),ze(this.struts,a),ze(this.smoke,c),ze(this.fire,l);let h=0;for(let x of this.sparks)x.life<=0||(this.dummy.position.copy(x.p),this.dummy.quaternion.setFromUnitVectors(new w(0,1,0),x.v.clone().normalize()),this.dummy.scale.set(1,Math.max(.04,x.v.length()*.055),1),this.dummy.updateMatrix(),this.sparkMesh.setMatrixAt(h,this.dummy.matrix),this.sparkMesh.setColorAt(h,x.color),this.sparkMesh.geometry.getAttribute("instanceOpacity").setX(h++,x.life/x.max));ze(this.sparkMesh,h);let u=0,d=0;for(let x of this.acquisitions){if(x.age+=t,x.age>=.85)continue;let m=x.root.getWorldPosition(new w),p=x.age/.85,v=Math.sin(Math.PI*p)*.8;this.acquireDummy.position.set(m.x,m.y+x.height*(.25+.5*p),m.z),this.acquireDummy.rotation.set(0,0,0),this.acquireDummy.scale.setScalar(x.radius*(.78+p*.5)),this.acquireDummy.updateMatrix(),this.acquireRing.setMatrixAt(u,this.acquireDummy.matrix),this.acquireRing.setColorAt(u,x.color),this.acquireRing.geometry.getAttribute("instanceOpacity").setX(u++,v);for(let b=0;b<8;b++){let y=b/8*Math.PI*2;this.acquireDummy.position.set(m.x+Math.cos(y)*x.radius*.74,m.y+x.height*(.25+b%3*.22),m.z+Math.sin(y)*x.radius*.74),this.acquireDummy.rotation.set(0,-y,Math.sin(x.age*18+b)*.08),this.acquireDummy.scale.set(1,x.height*.45,1),this.acquireDummy.updateMatrix(),this.acquireTrace.setMatrixAt(d,this.acquireDummy.matrix),this.acquireTrace.setColorAt(d,x.color),this.acquireTrace.geometry.getAttribute("instanceOpacity").setX(d++,v)}}this.acquisitions=this.acquisitions.filter(x=>x.age<.85),ze(this.acquireRing,u),ze(this.acquireTrace,d);let f=0,g=new w(0,0,1);for(let x of this.sacrificeStreams){x.age+=t;let m=x.age-x.delay;if(m<0||m>=.75)continue;let p=x.root.getWorldPosition(new w).add(new w(0,1.6,0)),v=m/.75,b=T=>x.from.clone().lerp(p,T).add(new w(0,Math.sin(T*Math.PI)*.65,0)),y=b(v),A=b(Math.max(0,v-.16)),R=y.clone().sub(A),C=Math.max(.03,R.length());this.acquireDummy.position.copy(y).add(A).multiplyScalar(.5),this.acquireDummy.quaternion.setFromUnitVectors(g,R.normalize()),this.acquireDummy.scale.set(1,1,C),this.acquireDummy.updateMatrix(),this.streamBodies.setMatrixAt(f,this.acquireDummy.matrix),this.streamBodies.geometry.getAttribute("instanceOpacity").setX(f,.9*(1-v*.4)),this.acquireDummy.position.copy(y),this.acquireDummy.rotation.set(0,0,0),this.acquireDummy.scale.setScalar(.7+.25*Math.sin(v*Math.PI)),this.acquireDummy.updateMatrix(),this.streamHeads.setMatrixAt(f,this.acquireDummy.matrix),this.streamHeads.geometry.getAttribute("instanceOpacity").setX(f,.9*(1-v*.4)),f++}this.sacrificeStreams=this.sacrificeStreams.filter(x=>x.age-x.delay<.75),ze(this.streamBodies,f),ze(this.streamHeads,f);for(let x of[this.fragments,this.commanderFragments])for(let m of x)if(!m.settled&&m.age>=2.5){let p=new Ft().setFromObject(m.group);m.group.position.y+=.04-p.min.y,m.v.set(0,0,0),m.spin.set(0,0,0),m.settled=!0}}reset(){this.bursts=[];for(let e of this.sparks)e.life=0;ze(this.sparkMesh,0),ze(this.rotors,0),ze(this.struts,0),this.sacrificeStreams=[],ze(this.streamBodies,0),ze(this.streamHeads,0);for(let[e,t]of this.hiddenBossParts)e.visible=t;this.hiddenBossParts.clear(),this.bossDestroyed=!1,this.acquisitions=[],ze(this.acquireRing,0),ze(this.acquireTrace,0);for(let e of this.chunks)e.life=0;for(let e of this.puffs)e.life=0;for(let e of[this.fragments,this.commanderFragments])for(let t of e)this.scene.remove(t.group),t.materials.forEach(n=>n.dispose()),t.ownedGeometry?.dispose();this.fragments=[],this.commanderFragments=[],this.bossBurnTime=0,this.bossBurn=void 0,ze(this.debris,0),ze(this.smoke,0),ze(this.fire,0)}stats(){return{debris:this.debris.count+this.rotors.count+this.struts.count,smoke:this.smoke.count,fire:this.fire.count,sparks:this.sparkMesh.count,queuedBursts:this.bursts.length,bossFragments:this.fragments.length,commanderFragments:this.commanderFragments.length,acquirePulses:this.acquisitions.length,sacrificeStreams:this.sacrificeStreams.length,capacity:this.debrisCapacity+this.particleCapacity+this.fragmentCapacity+this.commanderFragmentCapacity+128+32}}dispose(){this.reset();for(let e of[this.debris,this.rotors,this.struts,this.sparkMesh,this.smoke,this.fire,this.acquireRing,this.acquireTrace,this.streamBodies,this.streamHeads])this.scene.remove(e),e.geometry.dispose(),e.material.dispose(),e.dispose()}},Jc=class{constructor(e,t=200){this.scene=e;this.capacity=t;let o=[];for(let u of[-1,1])o.push(ht(new Bt(.2,10,6),9844521,u*.31,.73,0));o.push(ht(new qe(.29,.35,.35,10),2437692,0,.46,0),ht(new Bt(.34,12,8),9844521,0,.66,0),ht(new qe(.16,.2,.25,8),2437692,0,.95,0),ht(new Ue(.35,.11,.04),2437692,0,.98,.16),ht(new qe(.065,.085,.55,8),2437692,.16,.7,.39,Math.PI/2),ht(new it(.075,.025,4,8),9860426,.16,.7,.68));let a=oi(16777215);a.vertexColors=!0,this.body=ot(e,ai(o),a,t),this.body.castShadow=!0;let c=ai([ht(new Ue(.24,.035,.045),16756279,0,.99,.19),ht(new Kt(.09),16734754,0,.67,.3)]),l=Kc(16777215);l.vertexColors=!0,l.toneMapped=!1,this.eyes=ot(e,c,l,t);let h=oi(16777215);h.vertexColors=!0,this.arms=ot(e,ai([ht(new qe(.075,.075,.28,8),9860426,0,-.1,0),ht(new In(.1,.19,3,8),2437692,0,-.29,.035),ht(new Bt(.115,8,6),9844521,0,-.23,.015),ht(new Ue(.14,.12,.18),2437692,0,-.43,.07)]),h,t*2),this.legs=ot(e,ai([ht(new In(.14,.36,3,8),2437692,0,-.25,0,Math.PI/2),ht(new qe(.105,.105,.31,8),9860426,0,-.25,.19,0,0,Math.PI/2),ht(new qe(.055,.055,.24,8),9860426,0,-.075,0),ht(new Bt(.1,8,6),9844521,0,-.13,0)]),h.clone(),t*2),this.treadMark=ot(e,new Ue(.27,.055,.065),oi(10783843),t*2)}body;eyes;treadMark;arms;legs;count=0;dummy=new Qe;local=new Qe;matrix=new Fe;poses=new Map;seen=new Set;begin(){this.count=0,this.seen.clear()}add(e,t,n=1,i=0,r=!1,o=0,a){if(this.count>=this.capacity)return;let c=o*7.5,l=1,h=i;if(a){this.seen.add(a.id);let d=this.poses.get(a.id);d||(this.poses.size>=this.capacity&&this.poses.delete(this.poses.keys().next().value),d={yaw:i,phase:o*7.5,speed:0},this.poses.set(a.id,d));let f=rt.clamp(a.dt,0,.15),g=Math.hypot(a.velocityX??0,a.velocityZ??0),x=a.aimYaw??(g>.08?Math.atan2(a.velocityX??0,a.velocityZ??0):i),m=Math.atan2(Math.sin(x-d.yaw),Math.cos(x-d.yaw));d.yaw+=m*(1-Math.exp(-f*9)),d.speed+=(rt.clamp(g/1.5,0,1.25)-d.speed)*(1-Math.exp(-f*12)),d.phase+=f*7.5*d.speed,h=d.yaw,c=d.phase,l=d.speed}this.dummy.position.set(e,.025,t),this.dummy.rotation.set(r?-.1:0,h,0),this.dummy.scale.set(n*.82,n*1.1,n),this.dummy.updateMatrix(),this.body.setMatrixAt(this.count,this.dummy.matrix),this.eyes.setMatrixAt(this.count,this.dummy.matrix);let u=(d,f,g,x,m,p)=>{this.local.position.set(g,x,m),this.local.rotation.set(p,0,0),this.local.scale.setScalar(1),this.local.updateMatrix(),this.matrix.multiplyMatrices(this.dummy.matrix,this.local.matrix),d.setMatrixAt(f,this.matrix)};for(let[d,f]of[-1,1].entries()){let g=Math.sin(c+(f>0?Math.PI:0))*l,x=this.count*2+d;u(this.arms,x,f*.34,.73,0,-g*.24-(r?.13:0)),u(this.legs,x,f*.32,.45,0,g*.1);let m=((c/(Math.PI*2)+(f>0?.5:0))%1+1)%1;u(this.treadMark,x,f*.32,.28,-.25+m*.5,0)}this.count++}end(){ze(this.body,this.count),ze(this.eyes,this.count);for(let e of[this.arms,this.legs,this.treadMark])ze(e,this.count*2);for(let e of this.poses.keys())this.seen.has(e)||this.poses.delete(e)}reset(){this.poses.clear(),this.begin(),this.end()}dispose(){for(let e of[this.body,this.eyes,this.arms,this.legs,this.treadMark])this.scene.remove(e),e.geometry.dispose(),e.material.dispose(),e.dispose();this.poses.clear()}},jc=class{constructor(e,t=16){this.scene=e;this.capacity=t;this.charges=ot(e,new it(.23,.045,4,16),new Ge({color:16756037,transparent:!0,opacity:.75,depthWrite:!1,toneMapped:!1}),t);let n=ai([-1,1].flatMap(i=>[-1,1].flatMap(r=>[ht(new Ue(.25,.018,.035),16777215,i*.32,0,r*.42),ht(new Ue(.035,.018,.25),16777215,i*.42,0,r*.32)])));this.locks=ot(e,n,new Ge({color:16741438,transparent:!0,opacity:.72,depthWrite:!1,toneMapped:!1}),t),an(this.charges,t),an(this.locks,t)}charges;locks;dummy=new Qe;update(e,t=!0,n){let i=0,r=0;for(let o of e){let a=o;if(!t||a.kind!=="enemy"||a.variant!==2||a.hp<=0||a.z<0||a.z>28)continue;let c=rt.clamp(a.charge??0,0,1);if((a.fireState==="tracking"||a.fireState==="locked"||a.fireState==="fire")&&i<this.capacity){let h=Math.atan2((a.aimX??a.x)-a.x,a.z),u=.7+c*.65,d=n?.["gunner:"+a.id];d?this.dummy.position.copy(d):this.dummy.position.set(a.x+Math.sin(h)*.62,1.65,-a.z+Math.cos(h)*.62),this.dummy.rotation.set(0,h,0),this.dummy.scale.setScalar(u),this.dummy.updateMatrix(),this.charges.setMatrixAt(i,this.dummy.matrix),this.charges.geometry.getAttribute("instanceOpacity").setX(i++,.3+.7*c)}(a.fireState==="locked"||a.fireState==="fire")&&r<this.capacity&&(this.dummy.position.set(a.aimX??a.x,.065,0),this.dummy.rotation.set(0,0,0),this.dummy.scale.setScalar(1),this.dummy.updateMatrix(),this.locks.setMatrixAt(r,this.dummy.matrix),this.locks.geometry.getAttribute("instanceOpacity").setX(r++,.82))}ze(this.charges,i),ze(this.locks,r)}reset(){ze(this.charges,0),ze(this.locks,0)}dispose(){for(let e of[this.charges,this.locks])this.scene.remove(e),e.geometry.dispose(),e.material.dispose(),e.dispose()}};function gu(s,e=0){return s==="enemy"?e>0?1.65:.78:s==="crate"?.68:s==="orb"?1.1:s==="hazard"?.7:1.1}function np(s){return s.z-Math.min(.85,Math.max(0,s.depth??0)*.8)}function xu(s,e){if(Number.isFinite(s.y))return new w(s.x,s.y,-s.z*e.depthScale);let t=s.variant===3||s.variant===4,n=e.targets?.find(r=>r.id===s.entityId),i=n?.kind??(s.variant===-1?"crate":s.variant===-3?"orb":"enemy");return new w(s.x,t?(e.bossY??0)+(e.bossImpactHeight??4.31):gu(i,s.variant),-(t?s.z-(e.bossSurfaceOffset??.85):s.z-(n?Math.min(.85,Math.max(0,n.depth??0)*.8):0))*e.depthScale)}function Ov(s,e,t){let n=s.owner==="troop",i=n?.9:s.kind==="missile"?2.08:s.kind==="cannon"?1.42:s.kind==="rail"?1.8:1.35,o=(n?e.formation?.filter(l=>Math.abs(l.x-s.x)<.18).sort((l,h)=>Math.abs(l.z-(s.z-s.dz*t))-Math.abs(h.z-(s.z-s.dz*t)))[0]:void 0)?.z??(n?Math.min(-.75,s.z-s.dz*t):.4),a={shot:{...s},originZ:o,launch:i,targetZ:10,targetHeight:1.25,boss:!1},c=e.targets?.filter(l=>l.hp>0&&l.kind!=="hazard"&&l.op!==2&&l.z>s.z-.2&&Math.abs(l.x-(s.x+s.dx*(l.z-s.z)/Math.max(1,s.dz)))<l.size+.08).sort((l,h)=>l.z-h.z)[0];return c?(a.targetId=c.id,a.targetZ=np(c),a.targetHeight=gu(c.kind,c.variant)):e.bossPhase&&(a.boss=!0,a.targetZ=(e.bossZ??12)-(e.bossSurfaceOffset??.85),a.targetHeight=(e.bossY??0)+(e.bossImpactHeight??4.31)),a}function kv(s,e,t){let n=s;if(Number.isFinite(n.y)&&Number.isFinite(n.dy))return{position:new w(s.x,n.y,-s.z*t.depthScale),direction:new w(s.dx,n.dy,-s.dz*t.depthScale).normalize()};let i=Math.max(.1,e.targetZ-e.originZ),r=rt.clamp((s.z-e.originZ)/i,0,1),o=rt.lerp(e.launch,e.targetHeight,r),a=r>0&&r<1?(e.targetHeight-e.launch)/i*s.dz:0;return{position:new w(s.x,o,-s.z*t.depthScale),direction:new w(s.dx,a,-s.dz*t.depthScale).normalize()}}var Qc=class{constructor(e){this.scene=e;let t=new fo([new ne(.115,0),new ne(.11,.09),new ne(.083,.19),new ne(.042,.29),new ne(0,.34)],12),n=[ht(new qe(.115,.115,.74,12),14801092,0,0,0,Math.PI/2),ht(t,11569746,0,0,.37,Math.PI/2),ht(new qe(.1,.13,.14,10),2636872,0,0,-.43,Math.PI/2)];for(let x of[-.25,.2])n.push(ht(new it(.118,.025,4,12),5860469,0,0,x));for(let x of[0,Math.PI/2])n.push(ht(new Ue(.43,.042,.3),3689818,0,0,-.23,0,0,x));let i=oi(16777215);i.vertexColors=!0,this.bodies=ot(e,ai(n),i,this.capacity+96);let r=new Ge({color:16777215,transparent:!0,opacity:.48,depthWrite:!1,blending:wt,toneMapped:!1});this.exhaust=ot(e,new Bt(.095,10,8).scale(1,1,2.5).translate(0,0,-.63),r,this.capacity+96);let o=oi(12531744);o.emissive.set(7608075),o.emissiveIntensity=.65,this.orbs=ot(e,new Oi(.22,1),o,96);let a=Kc(16753982);a.toneMapped=!1,this.orbCores=ot(e,new Kt(.17,1),a,96),this.bullets=ot(e,ai([ht(new qe(.07,.074,.42,8),16777215,0,0,0,Math.PI/2),ht(new Bt(.07,8,5).scale(1,1,1.35),16777215,0,0,.21),ht(new it(.076,.017,4,8),16777215,0,0,-.12)]),oi(16777215),this.capacity);let c=Kc(16777215);c.toneMapped=!1,this.tips=ot(e,new Bt(.063,8,5).translate(0,0,.27),c,this.capacity);let l=ai([ht(new qe(.075,.09,.38,10),6320506,0,0,0,Math.PI/2),ht(new Pn(.075,.14,10),14128720,0,0,.25,Math.PI/2),ht(new it(.095,.025,4,10),3161155,0,0,-.13)]),h=oi(16777215);h.vertexColors=!0,this.hostileShells=ot(e,l,h,96),this.hostileTips=ot(e,new Kt(.065).translate(0,0,.29),Kc(16754502),96);let u=new Ge({color:16742444,transparent:!0,opacity:.48,depthWrite:!1,toneMapped:!1,side:Ct});u.onBeforeCompile=x=>{x.uniforms.uCombatTime=this.plasmaTime,x.vertexShader=x.vertexShader.replace("#include <common>",`#include <common>
varying vec2 vEnergyUv;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vEnergyUv = uv;`),x.fragmentShader=x.fragmentShader.replace("#include <common>",`#include <common>
varying vec2 vEnergyUv; uniform float uCombatTime;`).replace("#include <color_fragment>",`#include <color_fragment>
float axial = 0.5 + 0.5 * sin(vEnergyUv.y * 95.0 - uCombatTime * 32.0 + vEnergyUv.x * 6.28);
float helix = pow(0.5 + 0.5 * sin(vEnergyUv.x * 18.85 + vEnergyUv.y * 42.0 - uCombatTime * 16.0), 4.0);
diffuseColor.rgb = mix(vec3(1.0, 0.20, 0.035), vec3(1.0, 0.78, 0.32), helix * 0.75 + axial * 0.15);
diffuseColor.a *= 0.25 + axial * 0.25 + helix * 0.5;`)},u.customProgramCacheKey=()=>"iron-front-flowing-plasma-v1",this.beamShells=ot(e,new qe(.5,.5,1,16,24,!0).rotateX(Math.PI/2),u,4),this.beamCores=ot(e,new qe(.23,.23,1,12).rotateX(Math.PI/2),new Ge({color:16773074,transparent:!0,opacity:.86,depthWrite:!1,toneMapped:!1}),4),this.wakes=ot(e,new In(.035,.22,2,6).rotateX(Math.PI/2).translate(0,0,-.3),new Ge({color:16777215,transparent:!0,opacity:.45,depthWrite:!1,blending:wt,toneMapped:!1}),this.capacity);let d=new Ge({color:16777215,transparent:!0,opacity:.38,depthWrite:!1,toneMapped:!1});this.trails=ot(e,new Oi(1,1),d,192),an(this.trails,192),this.hotTrails=ot(e,new Bt(1,8,6),new Ge({color:16777215,transparent:!0,opacity:.72,depthWrite:!1,blending:wt,toneMapped:!1}),192),an(this.hotTrails,192),this.shellStreaks=ot(e,new In(.035,.4,2,6).rotateX(Math.PI/2).translate(0,0,-.42),new Ge({color:16754257,transparent:!0,opacity:.48,depthWrite:!1,blending:wt,toneMapped:!1}),96),this.beamFlow=ot(e,new qe(.5,.5,1,5).rotateX(Math.PI/2),new Ge({color:16777215,transparent:!0,opacity:.88,depthWrite:!1,blending:wt,toneMapped:!1}),288),an(this.beamFlow,288),this.beamContact=ot(e,new qe(.018,.006,1,4).rotateX(Math.PI/2),new Ge({color:16777215,transparent:!0,opacity:.85,depthWrite:!1,blending:wt,toneMapped:!1}),48),an(this.beamContact,48),this.beamEmitter=ot(e,new Bt(1,12,8),new Ge({color:16768668,transparent:!0,opacity:.68,depthWrite:!1,blending:wt,toneMapped:!1}),4),this.beamCorona=ot(e,new it(1,.045,4,24,Math.PI*1.55),new Ge({color:16762997,transparent:!0,opacity:.55,depthWrite:!1,blending:wt,toneMapped:!1}),8);let f=new Zt({transparent:!0,depthWrite:!1,blending:wt,side:bn,uniforms:{uCombatTime:this.plasmaTime},vertexShader:"varying vec3 vEnergyNormal; varying vec3 vEnergyEye; varying vec2 vSheathUv; void main(){ mat4 world = modelMatrix * instanceMatrix; vec4 view = viewMatrix * world * vec4(position,1.0); vEnergyNormal = normalize(mat3(viewMatrix * world) * normal); vEnergyEye = -view.xyz; vSheathUv = uv; gl_Position = projectionMatrix * view; }",fragmentShader:"uniform float uCombatTime; varying vec3 vEnergyNormal; varying vec3 vEnergyEye; varying vec2 vSheathUv; void main(){float facing = abs(dot(normalize(vEnergyNormal),normalize(vEnergyEye))); float radialFade = pow(facing,1.6); float noise = 0.65 + 0.2*sin(vSheathUv.y*35.0-uCombatTime*18.0)+0.15*sin(vSheathUv.y*83.0+uCombatTime*13.0); float ends = smoothstep(0.0,0.08,vSheathUv.y)*smoothstep(0.0,0.08,1.0-vSheathUv.y); gl_FragColor = vec4(1.0,0.30,0.045,radialFade*noise*ends*0.34); }"});this.beamSheath=ot(e,new qe(.5,.5,1,20,32,!0).rotateX(Math.PI/2),f,4);let g=new Zt({transparent:!0,depthWrite:!1,blending:wt,side:Ct,vertexShader:"varying vec2 vContactUv; void main(){vContactUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}",fragmentShader:"varying vec2 vContactUv; void main(){float r=length(vContactUv-.5)*2.0;float a=pow(max(0.0,1.0-r),2.0);vec3 heat=mix(vec3(1.0,.19,.015),vec3(1.0,.87,.51),a);gl_FragColor=vec4(heat,a*.85);}"});this.beamGround=ot(e,new Ln(2,2).rotateX(-Math.PI/2),g,4),this.beamLightning=ot(e,new qe(.5,.5,1,5).rotateX(Math.PI/2),new Ge({color:16777215,transparent:!0,opacity:.92,depthWrite:!1,blending:wt,toneMapped:!1}),384),an(this.beamLightning,384),this.beamLight=new Ti(16747318,0,3.5,2),this.beamLight.visible=!1,e.add(this.beamLight)}bodies;exhaust;orbs;orbCores;bullets;tips;wakes;dummy=new Qe;color=new Ae;capacity=768;beamShells;beamCores;hostileLaunchZ=new Map;hostileShells;hostileTips;trails;hotTrails;shellStreaks;trailParticles=Array.from({length:192},()=>({p:new w,life:0,color:new Ae,size:0,max:.18,hot:!1,enemy:!0}));trailIndex=0;beamFlow;beamContact;beamEmitter;beamSheath;beamCorona;beamGround;beamLight;clock=0;hostileClock=0;plasmaTime={value:0};beamLightning;friendlyPaths=[];previousTime;update(e,t,n){let i=0,r=0,o=0,a=0,c=0;if(n.visible===!1){this.reset();return}let l=Math.max(0,Math.min(.25,n.simulationTime!==void 0&&this.previousTime!==void 0?n.simulationTime-this.previousTime:n.dt??0));this.clock+=l;let h=l*(n.hostileRate??1);this.hostileClock+=h,this.plasmaTime.value=this.hostileClock;for(let p of this.trailParticles)p.life=Math.max(0,p.life-(p.enemy?h:l));let u=(p,v,b,y=!1,A="pulse",R="commander",C=.2)=>{if(!y&&i+r>=this.capacity||y&&A==="rocket"&&i>=this.capacity+96)return;this.dummy.position.copy(p),this.dummy.quaternion.setFromUnitVectors(new w(0,0,1),v),this.dummy.scale.setScalar(b);let T=A==="missile"||A==="rocket";if(y&&!T){if(c>=96)return;let _=Math.max(.7,C/.12);this.dummy.scale.set(_,_,1.4+C*2.4),this.dummy.updateMatrix(),this.hostileShells.setMatrixAt(c,this.dummy.matrix),this.hostileTips.setMatrixAt(c,this.dummy.matrix),this.dummy.scale.set(_*.75,_*.75,.75+C*.7),this.dummy.updateMatrix(),this.shellStreaks.setMatrixAt(c++,this.dummy.matrix);return}if(!T){this.dummy.scale.multiplyScalar(A==="cannon"?1.25:A==="rail"?1.05:1),this.dummy.scale.z*=A==="rail"?1.65:A==="cannon"?1.2:1,this.dummy.updateMatrix(),this.bullets.setMatrixAt(r,this.dummy.matrix),this.tips.setMatrixAt(r,this.dummy.matrix),this.bullets.setColorAt(r,this.color.set(y?14183737:R==="troop"?2921421:13870414)),this.tips.setColorAt(r,this.color.set(y?16752939:R==="troop"?5491199:16763476)),r++,y||(this.dummy.scale.z*=n.overdrive?1.6:.72,this.dummy.updateMatrix(),this.wakes.setMatrixAt(o,this.dummy.matrix),this.wakes.setColorAt(o++,this.color.set(R==="troop"?6610943:n.overdrive?16769687:16760149)));return}this.dummy.updateMatrix(),this.bodies.setMatrixAt(i,this.dummy.matrix),this.bodies.setColorAt(i,this.color.set(y?16749154:R==="troop"?6929151:16765322));let M=y?this.hostileClock:this.clock;this.dummy.scale.set(b,b,b*(.85+.12*Math.sin(M*55+p.x*2))),this.dummy.updateMatrix(),this.exhaust.setMatrixAt(i,this.dummy.matrix),this.exhaust.setColorAt(i,this.color.set(y?16736292:R==="troop"?5881087:16760932)),i++};this.previousTime=n.simulationTime;let d=new Set,f=[];for(let p of e.slice(0,this.capacity)){let v,b=.3;for(let R of this.friendlyPaths){if(d.has(R)||R.shot.kind!==p.kind||R.shot.owner!==p.owner)continue;let C=p.id,T=R.shot.id;if(C!==void 0){if(C===T){v=R;break}continue}let M=Math.hypot(R.shot.x+p.dx*l-p.x,R.shot.z+p.dz*l-p.z);M<b&&(b=M,v=R)}if(v){if(d.add(v),v.boss&&n.bossPhase)v.targetZ=(n.bossZ??12)-(n.bossSurfaceOffset??.85),v.targetHeight=(n.bossY??0)+(n.bossImpactHeight??4.31);else if(v.targetId!==void 0){let R=n.targets?.find(C=>C.id===v.targetId);R&&(v.targetZ=np(R),v.targetHeight=gu(R.kind,R.variant))}}else v=Ov(p,n,l||1/60);v.shot={...p},f.push(v);let y=kv(p,v,n);u(y.position,y.direction,p.kind==="missile"?1.45:p.heavy?1.2:1,!1,p.kind??"pulse",p.owner??"commander");let A=v;p.kind==="missile"&&(A.trailClock=Math.min(.06,(A.trailClock??0)+l),A.trailP?l>0&&A.trailClock>=.025&&y.position.distanceToSquared(A.trailP)>.0064&&(A.trailClock=0,A.trailP.copy(y.position),this.leaveTrail(y.position,y.direction,!1,16764520)):A.trailP=y.position.clone())}this.friendlyPaths=f;let g=new Set;for(let p of t){if(g.size>=96)break;g.add(p.id);let v=p.sourceId??0,b=v>0?n.targets?.find(P=>P.id===v):void 0,y=p;if(!this.hostileLaunchZ.has(p.id)){let P=y.launchZ??(v>0?b?.z??p.z:n.bossZ??p.z),U=y.launchY??(v>0?1.65:n.bossPhase?(n.bossY??0)+(n.bossLaunchHeight??3):.85),z=y.launchX??p.x,N=y.emitter==="gunner"?"gunner:"+v:y.emitter??(v>0?"gunner:"+v:"core"),B=n.emitters?.[N],I=B?.y??U,H=new w(z,I,-P*n.depthScale),G=B?B.clone().sub(H).setY(0):new w;this.hostileLaunchZ.set(p.id,{z:Math.max(.1,P),height:I,x:z,offset:G,trailClock:0,lastTrail:H.clone()})}let A=this.hostileLaunchZ.get(p.id),R=Math.hypot(p.x-A.x,p.z-A.z),C=Math.max(0,1-R),T=.85+(A.height-.85)*rt.clamp(p.z/A.z,0,1),M=new w(p.x,T,-p.z*n.depthScale).addScaledVector(A.offset,C),_=new w(p.dx,(A.height-.85)/A.z*p.dz,-p.dz*n.depthScale).normalize();if(p.kind==="orb"){if(a>=96)continue;this.dummy.position.copy(M),this.dummy.rotation.set(0,0,0),this.dummy.scale.setScalar(Math.max(.8,p.radius/.18)),this.dummy.updateMatrix(),this.orbs.setMatrixAt(a,this.dummy.matrix),this.dummy.position.z+=.13*this.dummy.scale.z,this.dummy.updateMatrix(),this.orbCores.setMatrixAt(a++,this.dummy.matrix)}else u(M,_,p.kind==="rocket"?Math.max(1.1,p.radius/.17):1.8,!0,p.kind,"commander",p.radius);A.trailClock=Math.min(.07,A.trailClock+h),p.kind==="rocket"&&h>0&&A.trailClock>=.035&&M.distanceToSquared(A.lastTrail)>.0064&&(A.trailClock%=.035,A.lastTrail.copy(M),this.leaveTrail(M,_,!0,16744758))}for(let p of this.hostileLaunchZ.keys())g.has(p)||this.hostileLaunchZ.delete(p);ze(this.bodies,i),ze(this.exhaust,i),ze(this.orbs,a),ze(this.orbCores,a),ze(this.bullets,r),ze(this.tips,r),ze(this.wakes,o),ze(this.hostileShells,c),ze(this.hostileTips,c),ze(this.shellStreaks,c);let x=0,m=0;for(let p of this.trailParticles){if(p.life<=0)continue;let v=1-p.life/p.max,b=p.hot?this.hotTrails:this.trails,y=p.hot?m++:x++;this.dummy.position.copy(p.p),this.dummy.rotation.set(0,0,0),this.dummy.scale.setScalar(p.size*(p.hot?1-v*.55:1+v*.7)),this.dummy.updateMatrix(),b.setMatrixAt(y,this.dummy.matrix),b.setColorAt(y,p.color),b.geometry.getAttribute("instanceOpacity").setX(y,p.life/p.max)}ze(this.trails,x),ze(this.hotTrails,m),this.updateBeams(n)}leaveTrail(e,t,n,i){for(let r of[!0,!1]){let o=this.trailParticles[this.trailIndex++%192];o.p.copy(e).addScaledVector(t,r?-.6:-.8),o.life=o.max=r?.16:.22,o.size=r?.095:.08,o.hot=r,o.enemy=n,o.color.set(r?i:8689562)}}updateBeams(e){let t=0,n=0,i=0,r=0,o=0,a=0;this.beamLight.visible=!1;let c=(l,h,u)=>{for(let d=0;d<2;d++)this.dummy.position.copy(l).addScaledVector(h,.012+d*.035),this.dummy.quaternion.setFromUnitVectors(new w(0,0,1),h),this.dummy.rotateZ((d?-.7:1)*this.hostileClock*2+d*1.4),this.dummy.scale.setScalar((.2+d*.11)*(1+u*.32+.025*Math.sin(this.hostileClock*21))),this.dummy.updateMatrix(),this.beamCorona.setMatrixAt(o++,this.dummy.matrix)};for(let l of e.lasers??[]){if(t>=4||l.time<=0)continue;let h=e.emitters?.core?.clone()??new w(l.x,(e.bossY??0)+(e.bossLaunchHeight??3.4),-l.z*e.depthScale),u=new w(l.endX,.07,-l.endZ*e.depthScale),d=u.clone().sub(h),f=d.length();if(f<.01)continue;this.dummy.position.copy(u),this.dummy.position.y=.026,this.dummy.rotation.set(0,0,0),this.dummy.scale.set(.64,.64,.64),this.dummy.updateMatrix(),this.beamGround.setMatrixAt(t,this.dummy.matrix),this.beamLight.visible=!0,this.beamLight.position.copy(u).add(new w(0,.32,0)),this.beamLight.intensity=3.5+.4*Math.sin(this.hostileClock*33);let g=d.clone().normalize(),x=Math.max(.05,l.width),m=new w().crossVectors(g,Math.abs(g.y)<.9?new w(0,1,0):new w(1,0,0)).normalize(),p=new w().crossVectors(m,g).normalize();this.dummy.position.copy(h).add(u).multiplyScalar(.5),this.dummy.quaternion.setFromUnitVectors(new w(0,0,1),g),this.dummy.scale.set(x,x,f),this.dummy.updateMatrix(),this.beamShells.setMatrixAt(t,this.dummy.matrix),this.beamCores.setMatrixAt(t,this.dummy.matrix),this.dummy.scale.set(x*3,x*3,f),this.dummy.updateMatrix(),this.beamSheath.setMatrixAt(t,this.dummy.matrix);let v=(C,T)=>{let M=this.hostileClock,_=Math.sin(C*Math.PI),P=(Math.sin(C*27+T*2.7-M*9)+.35*Math.sin(C*61-T+M*17))*x*.2*_,U=(Math.cos(C*33+T*3.1-M*11)+.3*Math.sin(C*73+T-M*7))*x*.2*_;return h.clone().lerp(u,C).addScaledVector(m,P).addScaledVector(p,U)},b=Math.floor(this.hostileClock*16),y=C=>{let T=Math.sin(C*12.9898+b*31.13)*43758.5453;return T-Math.floor(T)},A=(C,T,M,_,P)=>{let U=T.clone().sub(C),z=U.length();a>=384||z<.001||(this.dummy.position.copy(C).add(T).multiplyScalar(.5),this.dummy.quaternion.setFromUnitVectors(new w(0,0,1),U.normalize()),this.dummy.scale.set(M,M,z+.015),this.dummy.updateMatrix(),this.beamLightning.setMatrixAt(a,this.dummy.matrix),this.beamLightning.setColorAt(a,this.color.set(_)),this.beamLightning.geometry.getAttribute("instanceOpacity").setX(a++,P))},R=(C,T)=>{let M=Math.max(.18,x*1.3)*Math.sin(C*Math.PI),_=h.clone().lerp(u,C).addScaledVector(m,(y(T)-.5)*M*1.7).addScaledVector(p,(y(T+47)-.5)*M*1.5);return _.y=Math.max(.075,_.y),_};for(let C=0;C<2;C++)for(let T=0;T<24;T++){let M=R(T/24,C*97+T*3),_=R((T+1)/24,C*97+(T+1)*3);A(M,_,Math.max(.028,x*(C?.1:.14)),C?8507135:15202303,.66+.3*y(T+C*71))}for(let C=0;C<12;C++){let T=.07+C*.075,M=R(T,C*3+97),_=y(C+613)*Math.PI*2,P=Math.max(.3,x*1.2),U=M.clone().addScaledVector(g,.11+.1*y(C+19)).addScaledVector(m,Math.cos(_)*P*.6).addScaledVector(p,Math.sin(_)*P*.6),z=U.clone().addScaledVector(g,.08).addScaledVector(m,Math.cos(_+.45)*P*.55).addScaledVector(p,Math.sin(_+.45)*P*.55);U.y=Math.max(.1,U.y),z.y=Math.max(.1,z.y),A(M,U,.034,13102591,.85),A(U,z,.022,7521791,.58+.3*y(C+102))}for(let C=0;C<8;C++){let T=.1+C*.11,M=y(C+790)*Math.PI*2,_=Math.max(.17,x*.7),P=h.clone().lerp(u,T);for(let U=0;U<3;U++){let z=M+U*.53,N=z+.53,B=P.clone().addScaledVector(m,Math.cos(z)*_).addScaledVector(p,Math.sin(z)*_),I=P.clone().addScaledVector(m,Math.cos(N)*_).addScaledVector(p,Math.sin(N)*_).addScaledVector(g,.045);B.y=Math.max(.1,B.y),I.y=Math.max(.1,I.y),A(B,I,.03,11987711,.38+.35*y(C+900))}}for(let C=0;C<3;C++)for(let T=0;T<24;T++){let M=T/24,_=(T+1)/24,P=v(M,C),U=v(_,C),z=U.clone().sub(P),N=z.length(),B=.6+.4*Math.sin(M*31+C*1.7-this.hostileClock*22);this.dummy.position.copy(P).add(U).multiplyScalar(.5),this.dummy.quaternion.setFromUnitVectors(new w(0,0,1),z.normalize());let I=x*(.06+.025*B);this.dummy.scale.set(I,I,N+.008),this.dummy.updateMatrix(),this.beamFlow.setMatrixAt(n,this.dummy.matrix),this.beamFlow.setColorAt(n,this.color.set(C===0?16773055:C===1?16758871:16740656)),this.beamFlow.geometry.getAttribute("instanceOpacity").setX(n++,.55+.4*B)}for(let C=0;C<12;C++){let T=((this.hostileClock*5.5+C*.08331)%1+1)%1,M=C*2.399+Math.sin(C*8)*.3,_=.06+T*.4,P=Math.sqrt(T)*_,U=u.clone().add(new w(Math.cos(M)*P,.03+Math.sin(T*Math.PI)*.3,Math.sin(M)*P)),z=U.clone().sub(u).normalize();this.dummy.position.copy(U),this.dummy.quaternion.setFromUnitVectors(new w(0,0,1),z),this.dummy.scale.set(1-T*.65,1-T*.65,.06+.13*(1-T)),this.dummy.updateMatrix(),this.beamContact.setMatrixAt(r,this.dummy.matrix),this.beamContact.setColorAt(r,this.color.set(C%3?16760420:16772549)),this.beamContact.geometry.getAttribute("instanceOpacity").setX(r++,1-T)}this.dummy.position.copy(h),this.dummy.scale.setScalar(Math.max(.34,x*.6)),this.dummy.updateMatrix(),this.beamEmitter.setMatrixAt(i++,this.dummy.matrix),c(h,g,1),t++}if(!t&&e.bossCharging&&e.emitters?.core){let l=rt.clamp(e.bossCharge??0,0,1),h=new w(0,-.15,1).normalize();this.dummy.position.copy(e.emitters.core),this.dummy.rotation.set(0,0,0),this.dummy.scale.setScalar(.13+l*.21),this.dummy.updateMatrix(),this.beamEmitter.setMatrixAt(i++,this.dummy.matrix),c(e.emitters.core,h,l)}ze(this.beamShells,t),ze(this.beamCores,t),ze(this.beamSheath,t),ze(this.beamFlow,n),ze(this.beamContact,r),ze(this.beamEmitter,i),ze(this.beamCorona,o),ze(this.beamLightning,a),ze(this.beamGround,t)}reset(){this.beamLight.visible=!1;for(let e of this.meshes())ze(e,0);for(let e of this.trailParticles)e.life=0;this.hostileLaunchZ.clear(),this.friendlyPaths=[],this.previousTime=void 0,this.clock=0,this.hostileClock=0,this.plasmaTime.value=0,this.trailIndex=0}meshes(){return[this.bodies,this.exhaust,this.orbs,this.orbCores,this.bullets,this.tips,this.wakes,this.beamShells,this.beamCores,this.hostileShells,this.hostileTips,this.trails,this.beamFlow,this.beamContact,this.beamEmitter,this.beamSheath,this.beamCorona,this.beamGround,this.hotTrails,this.shellStreaks,this.beamLightning]}dispose(){this.reset(),this.scene.remove(this.beamLight),this.beamLight.dispose();for(let e of this.meshes())this.scene.remove(e),e.geometry.dispose(),e.material.dispose(),e.dispose()}};var Fn=6680575,Lo=16753995,el=class{constructor(e,t,n=!1){this.scene=e;this.hero=t;this.reduced=n,this.root.name="RelicEffects",e.add(this.root),this.root.add(this.light);let i=new Zt({transparent:!0,depthWrite:!1,side:Ct,uniforms:{clock:{value:0},strength:{value:1},tint:{value:new Ae(Fn)}},vertexShader:"varying vec3 n;varying vec3 v;varying vec3 local;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-mv.xyz);local=position;gl_Position=projectionMatrix*mv;}",fragmentShader:"varying vec3 n;varying vec3 v;varying vec3 local;uniform float clock;uniform float strength;uniform vec3 tint;void main(){float edge=pow(1.-abs(dot(normalize(n),normalize(v))),2.2);float bands=pow(max(0.,sin(local.y*44.-clock*2.)),24.);float grid=pow(max(0.,sin(local.x*28.+local.z*23.)),32.);float a=(.026+edge*.26+bands*.018+grid*.014)*strength;gl_FragColor=vec4(tint*(.72+edge*.5),a);}"});this.dome=new We(new Bt(1,48,24,0,Math.PI*2,0,Math.PI/2),i),this.dome.name="WholeLegion_ShieldDome",this.dome.renderOrder=5,this.root.add(this.dome),this.rim=new We(new it(1,.022,6,96),this.energy(Fn,.85)),this.rim.rotation.x=-Math.PI/2,this.rim.name="ShieldGroundRim",this.root.add(this.rim),this.wave=new Je,this.wave.name="EMP_Shockwave",this.root.add(this.wave);for(let c=0;c<3;c++){let l=new We(new it(1,.006+c*.002,5,128),this.energy(c===1?15925247:Fn,.8));l.rotation.x=-Math.PI/2,l.position.y=.08+c*.12,l.userData.layer=c,this.wave.add(l)}let r=new We(new qe(1,1,1,96,1,!0),this.energy(Fn,.08));r.name="EMP_VerticalWave",r.position.y=.65,this.wave.add(r),this.root.add(this.overdrive,this.escort),this.overdrive.name="OverdriveWeaponEnergy",this.escort.name="FiniteEscortGuard",this.odCircuits=new Vt(new In(.045,.64,2,5),this.energy(16766339,.82),18),this.odCircuits.frustumCulled=!1,this.odCircuits.name="Overdrive_InstancedFlameStreaks",this.overdrive.add(this.odCircuits),this.odEmbers=new Vt(new Kt(.045),this.energy(Lo,.9),24),this.odEmbers.frustumCulled=!1,this.odEmbers.name="Overdrive_InstancedUpperBodyEmbers",this.overdrive.add(this.odEmbers);for(let c=0;c<3;c++){let l=new We(new it(1,.035,5,64,Math.PI*1.55),this.energy(c===1?Fn:Lo,.8));l.name="Overdrive_UpperBodyArc_"+c,this.overdrive.add(l),this.odArcs.push(l)}for(let c=0;c<2;c++){let l=new We(new it(1,.018,6,48),this.energy(c===0?Lo:Fn,.48));l.rotation.x=-Math.PI/2,l.name="OverdriveFloor_"+c,this.overdrive.add(l),this.odFloor.push(l)}for(let c=0;c<4;c++){let l=new We(new it(.26,.043,5,24),this.energy(c%2?Fn:Lo,.95));l.name="OverdrivePosedWeapon_"+c,l.visible=!1,this.root.add(l),this.weaponEnergy.push(l)}for(let c of[-1,1]){let l=new Je;l.name="EscortEmitter_"+c,l.position.set(c*1.1,1.65,.6);let h=new We(new Kt(.18),new $t({color:5400184,metalness:.55,roughness:.4})),u=new We(new it(.27,.025,6,20),this.energy(10288307,.8));l.add(h,u),this.escort.add(l)}let o=new jn(.82,1,40);for(let c=0;c<12;c++){let l=new We(o,this.energy(Fn,.9));l.visible=!1,this.root.add(l),this.sparks.push({mesh:l,life:0,duration:.48,size:.65,x:0,z:0,shield:!0})}let a=new mt;a.setAttribute("position",new Tt(this.boltPositions,3).setUsage(Ri)),a.setAttribute("color",new Tt(this.boltColors,3).setUsage(Ri)),a.setDrawRange(0,0),this.lightning=new Bi(a,new vi({vertexColors:!0,transparent:!0,opacity:.95,depthWrite:!1,toneMapped:!1,blending:wt})),this.lightning.frustumCulled=!1,this.lightning.name="EMP_ActualTargetBolts",this.root.add(this.lightning);for(let c=0;c<32;c++)this.bolts.push({start:new w,end:new w,life:0,seed:c});this.stun=new Vt(new it(.65,.025,5,24),this.energy(Fn,.7),48),this.stun.count=0,this.stun.frustumCulled=!1,this.stun.name="EMP_ActualStunnedActors",this.root.add(this.stun),this.reset()}root=new Je;dome;rim;wave;overdrive=new Je;escort=new Je;lightning;light=new Ti(Fn,0,12,2);clock=0;pulseLife=0;pulseDuration=.36;pulseType=0;empLife=0;sparks=[];bolts=[];sparkCursor=0;boltCursor=0;boltPositions=new Float32Array(384*6);boltColors=new Float32Array(384*6);stun;stamp=new Qe;center=new w;radii=new w(2.2,3.25,3);normal=new w;point=new w;upward=new w(0,0,1);disposed=!1;eventIDs=new Set;reduced=!1;impact={exposureLift:0,zoom:0};lastShield=!1;weaponEnergy=[];odCircuits;odEmbers;odArcs=[];odFloor=[];energy(e,t){return new Ge({color:e,transparent:!0,opacity:t,depthWrite:!1,toneMapped:!1,blending:wt,side:Ct})}setReducedMotion(e){this.reduced=e}get sceneImpact(){return this.impact}weaponUpgrade(e,t){return this.disposed||!Number.isInteger(e)||!Number.isInteger(t)||e<1||t>4||t<=e||this.pulseLife>0?!1:(this.pulseLife=this.pulseDuration,this.pulseType=3,this.refreshImpact(),!0)}get stats(){return{sparks:this.sparks.filter(e=>e.life>0).length,bolts:this.bolts.filter(e=>e.life>0).length,sparkCapacity:12,boltCapacity:32,clock:this.clock,pulseLife:this.pulseLife,empLife:this.empLife,stunned:this.stun.count}}trigger(e,t){if(!(this.disposed||this.eventIDs.has(e.id))){if(this.eventIDs.add(e.id),this.eventIDs.size>512&&this.eventIDs.delete(this.eventIDs.values().next().value),(e.kind==="relic"||e.kind==="pickup")&&(this.pulseLife=this.pulseDuration,this.pulseType=e.kind==="relic"?e.value:3,this.refreshImpact()),e.kind==="empPulse"&&(this.empLife=.65,this.wave.position.set(e.x,0,-e.z),this.wave.visible=!0,this.wave.scale.set(1,1,1),this.pulseLife=this.pulseDuration,this.pulseType=1,this.refreshImpact()),e.kind==="shieldHit"||e.kind==="escortBlock"){let n=this.sparks[this.sparkCursor++%12];n.life=n.duration=.48,n.x=e.x,n.z=-e.z,n.shield=e.kind==="shieldHit",n.mesh.visible=!0,n.mesh.material.color.setHex(n.shield?Fn:10288307)}if(e.kind==="empStun"||e.kind==="empClear"||e.kind==="kill"&&t?.effects?.some(n=>n.kind==="empPulse")){let n=this.bolts[this.boltCursor++%32];n.life=.25,n.seed=e.id,n.start.set(t?.x??e.x,1.8,0),n.end.set(e.x,e.kind==="empStun"&&e.entityId===0?(t?.bossY??0)+4.3:e.variant===3?3.8:1.25,-e.z),this.writeBolts()}}}update(e,t,n){if(this.disposed||t.paused)return;n=Math.max(0,Math.min(n,.1)),this.clock+=n,this.center.set(t.armyCenterX,.035,t.armyCenterZ),this.radii.set(Math.max(1.8,t.armyRadius),3.4,3.2);let i=t.visible&&e.relic===0&&e.ability>0;this.lastShield=i,this.dome.visible=this.rim.visible=i,this.dome.position.copy(this.center),this.dome.scale.copy(this.radii),this.dome.material.uniforms.clock.value=this.clock,this.dome.material.uniforms.strength.value=.9+Math.sin(this.clock*4)*.06,this.rim.position.copy(this.center),this.rim.scale.set(this.radii.x,this.radii.z,1);for(let c of this.sparks){if(c.life<=0){c.mesh.visible=!1;continue}c.life=Math.max(0,c.life-n),c.mesh.visible=t.visible&&c.life>0;let l=1-c.life/c.duration;this.point.set((c.x-this.center.x)/this.radii.x,.38,(c.z-this.center.z)/this.radii.z).normalize(),c.mesh.position.copy(this.point).multiply(this.radii).add(this.center),this.normal.set(this.point.x/this.radii.x,this.point.y/this.radii.y,this.point.z/this.radii.z).normalize(),c.mesh.quaternion.setFromUnitVectors(this.upward,this.normal),c.mesh.scale.setScalar(.12+l*c.size),c.mesh.material.opacity=(1-l)*.9}if(this.empLife=Math.max(0,this.empLife-n),this.wave.visible=t.visible&&this.empLife>0,this.wave.visible){let c=1-this.empLife/.65,l=1+25*(1-Math.pow(1-c,2));this.wave.scale.set(l,1,l);for(let h of this.wave.children){let u=h.material;u.opacity=(h.name==="EMP_VerticalWave"?.07:.85)*(1-c)}}for(let c of this.bolts)c.life=Math.max(0,c.life-n);this.writeBolts(),this.lightning.visible=t.visible;let r=0;for(let c of e.targets??[])c.stunTime>0&&r<47&&(this.stamp.position.set(c.x,2.3,-c.z),this.stamp.rotation.set(.25,0,this.clock*1.2),this.stamp.scale.setScalar(c.variant>0?1.3:.8),this.stamp.updateMatrix(),this.stun.setMatrixAt(r++,this.stamp.matrix));e.empStunTime>0&&e.phase==="boss"&&r<48&&(this.stamp.position.set(e.bossX,e.bossY+5,-e.bossZ),this.stamp.rotation.set(.25,0,this.clock*1.2),this.stamp.scale.setScalar(1.8),this.stamp.updateMatrix(),this.stun.setMatrixAt(r++,this.stamp.matrix)),this.stun.count=r,this.stun.visible=t.visible,this.stun.instanceMatrix.needsUpdate=!0;let o=t.visible&&e.relic===2&&e.ability>0;this.overdrive.visible=o,this.overdrive.position.set(e.x,0,0);for(let c=0;c<18;c++){let l=this.clock*2+c*Math.PI/9,h=(this.clock*1.3+c*.173)%1;this.stamp.position.set(Math.cos(l)*(.8+h*.22),.45+h*2.5,Math.sin(l)*.65-.1),this.stamp.rotation.set(.2*Math.sin(l),l,Math.sin(l)*.45),this.stamp.scale.set(.65,.45+Math.sin(h*Math.PI)*.7,.65),this.stamp.updateMatrix(),this.odCircuits.setMatrixAt(c,this.stamp.matrix)}this.odCircuits.instanceMatrix.needsUpdate=!0;for(let c=0;c<24;c++){let l=(this.clock*.62+c*.137)%1,h=c*2.39;this.stamp.position.set(Math.sin(h)*(.65+l*.35),.8+l*2.4,Math.cos(h)*.7-.2),this.stamp.rotation.set(h,this.clock,h*.7),this.stamp.scale.setScalar(Math.sin(l*Math.PI)*(.55+c%3*.2)),this.stamp.updateMatrix(),this.odEmbers.setMatrixAt(c,this.stamp.matrix)}this.odEmbers.instanceMatrix.needsUpdate=!0;for(let c=0;c<3;c++){let l=this.odArcs[c];l.position.set(0,1.6+c*.25,-.05),l.rotation.set(c===1?.7:-.15,this.clock*(c===1?-.9:.7)+c*1.3,c*.55),l.scale.set(1.03,1.25,1.03)}this.odFloor.forEach((c,l)=>{c.position.set(t.armyCenterX-e.x,.09+l*.04,t.armyCenterZ),c.scale.set(t.armyRadius*(l===0?1:1.07),3.2,1)});let a=["HandCannon_L","HandCannon_R","Arsenal_Hero","Arsenal_Hero"];for(let c=0;c<4;c++){let l=this.weaponEnergy[c],h=this.hero.getObjectByName(a[c]),u=!!h;for(let d=h;d;d=d.parent)u&&=d.visible;l.visible=o&&u,l.visible&&h&&(h.updateWorldMatrix(!0,!1),this.point.set(c<2?0:c===2?-.68:.68,c<2?0:2.08,c<2?.85:-.5),l.position.copy(h.localToWorld(this.point)),h.getWorldQuaternion(l.quaternion),l.rotateZ(this.clock*3),l.scale.setScalar(.85+Math.sin(this.clock*7+c)*.12))}this.escort.visible=t.visible&&e.escortShield>0&&e.powerTime>0,this.escort.position.set(e.x,0,0),this.escort.children.forEach((c,l)=>{c.position.y=1.6+Math.sin(this.clock*2+l)*.08,c.rotation.y=this.clock*.5}),this.pulseLife=Math.max(0,this.pulseLife-n),this.refreshImpact(),this.light.position.set(e.x,2,0),this.light.color.setHex(this.pulseType===2?Lo:Fn),this.light.intensity=(o?3:i?1.4:0)+this.impact.exposureLift*36}refreshImpact(){let e=this.pulseLife>0?Math.pow(this.pulseLife/this.pulseDuration,2):0;this.impact.exposureLift=e*(this.reduced?.045:.16),this.impact.zoom=this.reduced?0:e*.016}writeBolts(){let e=0;for(let t of this.bolts)if(!(t.life<=0))for(let n=0;n<12;n++)for(let i=0;i<2;i++){let r=(n+i)/12,o=Math.sin(r*Math.PI)*.35,a=t.seed*1.37+(n+i)*4.17;this.boltPositions[e]=rt.lerp(t.start.x,t.end.x,r)+Math.sin(a)*o,this.boltPositions[e+1]=rt.lerp(t.start.y,t.end.y,r)+Math.cos(a*1.9)*o,this.boltPositions[e+2]=rt.lerp(t.start.z,t.end.z,r)+Math.sin(a*.7)*o,this.boltColors[e]=.55,this.boltColors[e+1]=.8+t.life*.7,this.boltColors[e+2]=1,e+=3}this.lightning.geometry.setDrawRange(0,e/3),this.lightning.geometry.attributes.position.needsUpdate=!0,this.lightning.geometry.attributes.color.needsUpdate=!0}reset(){this.clock=this.pulseLife=this.empLife=0,this.eventIDs.clear();for(let e of this.sparks)e.life=0,e.mesh.visible=!1;for(let e of this.bolts)e.life=0;for(let e of this.weaponEnergy)e.visible=!1;this.dome.visible=this.rim.visible=this.wave.visible=this.overdrive.visible=this.escort.visible=!1,this.light.intensity=0,this.stun.count=0,this.lightning.geometry.setDrawRange(0,0),this.refreshImpact()}dispose(){if(this.disposed)return;this.disposed=!0;let e=new Set,t=new Set;this.root.traverse(n=>{if(n.geometry&&e.add(n.geometry),n.material)for(let i of Array.isArray(n.material)?n.material:[n.material])t.add(i)}),e.forEach(n=>n.dispose()),t.forEach(n=>n.dispose()),this.light.dispose(),this.root.removeFromParent()}};var tl=class{pan=0;maxPan=.65;fit=new Nt(29.52,1,.1,180);transform=new Fe;position=new w;scale=new w(.432,.72,.72);rotation=new kt;euler=new sn;point=new w;corners=[];yaws=[-.035,.035];setBounds(e){this.corners=[];for(let t of[e.min.x,e.max.x])for(let n of[e.min.y,e.max.y])for(let i of[e.min.z,e.max.z])this.corners.push(new w(t,n,i))}update(e,t,n,i){if(!(n>0))return this.pan;e.updateMatrixWorld(!0),this.fit.aspect=e.aspect,this.fit.updateProjectionMatrix(),this.fit.matrixWorldInverse.copy(e.matrixWorldInverse);let r=-1/0,o=1/0,a=-1/0,c=1/0;for(let h of t)for(let u of this.yaws){this.position.set(h.x,.075,-h.z),this.rotation.setFromEuler(this.euler.set(0,Math.PI+u,0)),this.transform.compose(this.position,this.rotation,this.scale);for(let d of this.corners){this.point.copy(d).applyMatrix4(this.transform).applyMatrix4(this.fit.matrixWorldInverse);let f=-this.point.z;if(f<=.1)continue;let g=this.fit.projectionMatrix.elements[0]*i/(2*f);this.point.applyMatrix4(this.fit.projectionMatrix);let x=(1+this.point.x)*i/2;r=Math.max(r,(x-(i-20))/g),o=Math.min(o,(x-20)/g),a=Math.max(a,(x-(i-10))/g),c=Math.min(c,(x-10)/g)}}let l=Number.isFinite(r)?rt.clamp(0,r,o):0;return this.pan+=(rt.clamp(l,-this.maxPan,this.maxPan)-this.pan)*(1-Math.exp(-n*35)),a<=c&&(this.pan=rt.clamp(this.pan,a,c)),this.pan=rt.clamp(this.pan,-this.maxPan,this.maxPan),this.pan}reset(){this.pan=0}};var nl=class{constructor(e,t){this.root=e;this.scene=t;for(let r of["Arm_L","Arm_R","Leg_L","Leg_R","Knee_L","Knee_R","Barrel_L","Barrel_R"]){let o=e.getObjectByName(r);o&&this.joints.set(r,{node:o,rest:o.quaternion.clone()})}let n=[];for(let r of[-1,1])for(let o of[-1,1]){let l=r*.89,h=o*.89;for(let[u,d,f,g]of[[l-r*.27*.5,h,.27,.065],[l,h-o*.27*.5,.065,.27]]){let x=u-f*.5,m=u+f*.5,p=d-g*.5,v=d+g*.5;n.push(x,p,0,m,p,0,m,v,0,x,p,0,m,v,0,x,v,0)}}let i=new mt;i.setAttribute("position",new Ze(n,3)),this.cues=new Vt(i,new Ge({color:16773568,transparent:!0,opacity:.95,side:Ct,depthWrite:!1,toneMapped:!1}),7),this.cues.name="AuthoritativeBossPartCues",this.cues.frustumCulled=!1,this.cues.count=0,t.add(this.cues),this.reactorCue=new We(new jn(.965,1,64),new Ge({color:16764544,transparent:!0,opacity:.8,side:Ct,depthWrite:!1,toneMapped:!1})),this.reactorCue.name="MeasuredOvalReactorCue",this.reactorCue.visible=!1,t.add(this.reactorCue)}cues;reactorCue;joints=new Map;dummy=new Qe;euler=new sn;rotation=new kt;forward=new w;disposed=!1;apply(e){if(this.disposed||!e||!zv(e))return!1;this.root.position.set(e.rootX,e.rootY,e.worldZ),this.root.rotation.set(e.pitch,e.yaw,e.roll,"XYZ"),this.root.scale.setScalar(1.4);for(let[t,n]of["L","R"].entries())this.joint("Arm_"+n,e.arm[t].pitch,e.arm[t].roll),this.joint("Leg_"+n,e.leg[t],0),this.joint("Knee_"+n,e.knee[t],0),e.barrel&&this.joint("Barrel_"+n,0,e.barrel[t]);return this.root.updateWorldMatrix(!0,!0),!0}joint(e,t,n){let i=this.joints.get(e);i&&(this.euler.set(t,0,n,"XYZ"),this.rotation.setFromEuler(this.euler),i.node.quaternion.copy(i.rest).multiply(this.rotation))}updateRegions(e,t=!0,n,i=0){if(this.disposed)return;let r=0;if(this.reactorCue.visible=!1,t)for(let o of e??[]){if(!o.vulnerable||o.hp<=0||r>=7||!Vv(o))continue;if(o.id==="core"){this.reactorCue.material.color.setHex(i>0?8843007:16764544),this.reactorCue.visible=!0,this.reactorCue.position.set(o.x,o.y,-o.z),this.reactorCue.quaternion.fromArray(o.quaternion),this.reactorCue.scale.set(o.radiusX,o.radiusY,1);continue}let a=o.id==="legL"||o.id==="legR"?n?.find(c=>c.regionId===o.id&&c.active)??o:o;this.dummy.position.set(a.x,a.y,-a.z),this.dummy.quaternion.fromArray(a.quaternion),this.dummy.scale.set(a.radiusX*1.05,a.radiusY*1.05,1),this.dummy.position.addScaledVector(this.dummy.getWorldDirection(this.forward),-(a.radiusZ+.035)),this.dummy.updateMatrix(),this.cues.setMatrixAt(r++,this.dummy.matrix)}this.cues.count=r,this.cues.instanceMatrix.needsUpdate=!0}impact(e,t=new w){if(!(!e?.hitRegion||![e.x,e.y,e.z].every(Number.isFinite)))return t.set(e.x,e.y,-e.z)}reset(){if(!this.disposed){for(let{node:e,rest:t}of this.joints.values())e.quaternion.copy(t);this.cues.count=0,this.reactorCue.visible=!1,this.cues.instanceMatrix.needsUpdate=!0}}dispose(){this.disposed||(this.disposed=!0,this.cues.removeFromParent(),this.cues.geometry.dispose(),this.cues.material.dispose(),this.cues.dispose(),this.reactorCue.removeFromParent(),this.reactorCue.geometry.dispose(),this.reactorCue.material.dispose(),this.joints.clear())}};function zv(s){return Array.isArray(s.arm)&&s.arm.length===2&&Array.isArray(s.leg)&&s.leg.length===2&&Array.isArray(s.knee)&&s.knee.length===2&&(s.barrel===void 0||Array.isArray(s.barrel)&&s.barrel.length===2)&&[s.rootX,s.rootY,s.worldZ,s.pitch,s.yaw,s.roll,s.poseClock,s.arm[0]?.pitch,s.arm[0]?.roll,s.arm[1]?.pitch,s.arm[1]?.roll,...s.leg,...s.knee,...s.barrel??[]].every(Number.isFinite)}function Vv(s){return s.quaternion?.length===4&&[s.x,s.y,s.z,s.radiusX,s.radiusY,s.radiusZ,s.hp,s.maxHp,...s.quaternion].every(Number.isFinite)&&s.radiusX>0&&s.radiusY>0&&s.radiusZ>0&&s.maxHp>0&&Math.abs(s.quaternion.reduce((e,t)=>e+t*t,0)-1)<.01}var ip=[0,1,4,2,0,5,3,4,1,5,2,3];function Gv(s,e){let t=Math.max(0,Math.floor(Number.isFinite(s)?s:0)),n=Math.max(0,Math.min(2,Math.floor(Number.isFinite(e)?e:0))),i=(Math.imul(Math.floor(t/12)+1,73244475)^Math.imul(n+1,295559667))>>>0;i=Math.imul(i^i>>>16,73244475)>>>0,i^=i>>>16;let r=(i>>>0)%6;return{section:t,stage:n,left:(ip[t%12]+r)%6,right:(ip[(t+5)%12]+r+2)%6,phase:(i>>>0)/4294967296*Math.PI*2+t*.61}}var Hv=[{sky:11914448,deck:3097428,tile:3492183,stone:2966098,edge:6058372,steel:4811634,dark:2241602,accent:3444640,light:9102811,earth:5268577},{sky:12891814,deck:3424076,tile:3950676,stone:2570052,edge:6648186,steel:5070949,dark:2503487,accent:11892294,light:16759649,earth:5328456},{sky:11386323,deck:2636625,tile:3162971,stone:2439502,edge:5795206,steel:4348278,dark:2306888,accent:7437224,light:9035508,earth:4807020}],il=class{constructor(e){this.scene=e;this.root.name="Mechalord_IndustrialCauseway";for(let c of["deck","tile","stone","edge","steel","dark","accent","light","earth"]){let l=new $t({roughness:c==="steel"?.65:.92,metalness:c==="steel"?.2:.025});c==="light"&&(l.emissiveIntensity=.65,l.roughness=.5),this.materials.set(c,l)}let[t,n,i]=this.stoneTextures();for(let c of["deck","tile","stone","edge"]){let l=this.materials.get(c);l.map=i,l.bumpMap=t,l.bumpScale=c==="deck"?.035:.045,l.roughnessMap=n}this.build(this.common,c=>{this.box(c,"stone",9.7,1.23,8,0,-.765,0,.09),this.part(c,"deck",this.keep(new Ue(9.7,.14,8.02)),0,-.07,0);for(let l of[-1,1]){this.box(c,"stone",.21,.26,8.01,l*4.86,-.02,0,.015);for(let h of[-3.35,3.35])this.box(c,"stone",1.03,4.28,1.01,l*4.56,-2.98,h,.07),this.box(c,"edge",1.32,.3,1.26,l*4.56,-1.02,h,.055),this.box(c,"edge",1.47,.38,1.46,l*4.56,-5.05,h,.055),this.box(c,"steel",1.72,.18,.23,l*5.12,-.8,h,.025,0,0,l*.35);for(let h=0;h<10;h++){let u=h*Math.PI/10+.008,d=(h+1)*Math.PI/10-.008,f=new ls;f.moveTo(Math.cos(u)*2.73,Math.sin(u)*2.73),f.lineTo(Math.cos(d)*2.73,Math.sin(d)*2.73),f.lineTo(Math.cos(d)*2.08,Math.sin(d)*2.08),f.lineTo(Math.cos(u)*2.08,Math.sin(u)*2.08),f.closePath();let g=this.keep(new rr(f,{depth:.76,bevelEnabled:!0,bevelThickness:.022,bevelSize:.022,bevelSegments:1,steps:1}));g.translate(0,0,-.38),g.rotateY(Math.PI/2),this.part(c,h===4||h===5?"edge":"stone",g,l*4.56,-3.95,0)}this.box(c,"earth",7.7,1.45,8,l*11.4,-4.57,0,.15)}this.box(c,"earth",36,.95,8,0,-5.7,0,.1)},this.segmentCount);for(let c=0;c<3;c++)for(let l=0;l<6;l++){let h=[];this.banks[c].push(h),this.build(h,u=>this.sideModule(u,c,l),this.segmentCount*2);for(let u of h)u.count=0,u.visible=!1,u.name=`Industrial_${c}_${l}`}let r=new Map;for(let c=0;c<4;c++)this.box(r,"steel",.13,.53,.055,Math.sin(c*Math.PI/2)*.23,Math.cos(c*Math.PI/2)*.23,0,.004,0,0,-c*Math.PI/2);let o=this.keep(Ms(r.get("steel"),!1));for(let c of r.get("steel"))c.dispose();let a=[[this.keep(new Ue(.29,1,.32)),"steel",24],[this.keep(new Ue(.22,1,.26)),"accent",24],[this.keep(new Bt(.22,8,5)),"dark",48],[this.keep(new Bt(.05,6,4)),"light",24],[o,"steel",24]];for(let[c,l,h]of a){let u=new Vt(c,this.materials.get(l),h);u.count=0,u.frustumCulled=!1,u.castShadow=l!=="light",u.instanceMatrix.setUsage(Ri),this.animated.push(u),this.root.add(u)}e.add(this.root),this.update(0,0,0)}root=new Je;segmentCount=12;segmentLength=8;surfaceWidth=9.7;materials=new Map;geometries=new Set;cache=new Map;textures=[];common=[];banks=[[],[],[]];plans=[];counts=new Int16Array(6);dummy=new Qe;animated=[];beamFrom=new w;beamTo=new w;direction=new w;up=new w(0,1,0);level=-1;anchor=-1;age=0;disposed=!1;sideModule(e,t,n){let i=[7.6,6,7.1,4.8,6.5,7.7],r=i[n];this.box(e,"dark",2.35,.32,r,0,-.25,0,.03),this.box(e,"steel",2.21,.065,r-.15,0,-.06,0,.006);let o=n%3===0?[[-2.5,1.4],[1.4,2.3]]:n%3===1?[[-2,2.7],[2.65,.6]]:[[-3.1,.8],[.1,2],[2.7,1.1]];for(let[a,c]of o){this.box(e,"steel",.065,.085,c,-.99,.71,a,.006);for(let l of[-1,1])this.box(e,"dark",.075,.75,.08,-.99,.32,a+l*c*.42,.007);this.box(e,"edge",.11,.017,c*.65,-1.48,.012,a,.002)}if(n%2===0)for(let a of[-2.2,2.25])this.cylinder(e,"dark",.1,.13,.61,-.83,.26,a),this.cylinder(e,"edge",.112,.112,.1,-.83,.45,a);if(n===0)this.crate(e,-.25,.46,-1.5,1.05),this.crate(e,.7,.31,.15,.76),t!==1&&this.crate(e,-.25,1.25,-1.5,.65),this.coil(e,.75,.45,2,.5),this.box(e,"accent",.07,.045,1.4,-.4,.015,2.2,.003);else if(n===1)this.cylinder(e,"dark",.34,.43,.8,.3,.35,1.2,0,0,0,12),this.cylinder(e,"steel",.38,.38,.16,.3,.75,1.2,0,0,0,12),this.box(e,"steel",1.35,.16,1.7,1.4,.4,1.2,.02),this.box(e,"dark",.15,.66,.15,1,.05,.7,.005),this.box(e,"dark",.15,.66,.15,1.8,.05,1.7,.005),this.box(e,"accent",.8,.88,.57,-.05,.44,-1.7,.035),this.box(e,"light",.36,.19,.04,-.05,.56,-1.38,.008),this.conduit(e,.85,.26,-1.7,1.15);else if(n===2){this.box(e,"dark",1.18,1.67,1.42,.35,.77,-1.2,.04),this.cylinder(e,"steel",.61,.61,.21,-.25,1.05,-1.2,0,0,Math.PI/2,12);let a=this.keep(new it(.49,.065,6,16));a.rotateY(Math.PI/2),this.part(e,"accent",a,-.38,1.05,-1.2),this.conduit(e,.72,.18,1.75,2.3),this.coil(e,.68,.47,1.65,.39);for(let c of[-1.7,-.7])this.box(e,"steel",.055,1.07,.055,-.49,1.06,c,.002)}else if(n===3){this.box(e,"dark",1.8,.23,2,.15,-.015,-.8,.025);for(let a of[-1.6,.3])this.box(e,"steel",.3,3.5,.34,.8,1.7,a,.02),this.box(e,"accent",.34,.23,.39,.8,.52,a,.015);this.box(e,"steel",2.4,.32,.38,.53,3.36,-.65,.025),this.box(e,"dark",.34,.3,.5,-.2,3.05,-.65,.015),this.cylinder(e,"dark",.027,.027,1.3,-.2,2.35,-.65,0,0,0,6),this.part(e,"steel",this.keep(new it(.14,.042,5,9,Math.PI*1.45)),-.2,1.66,-.65),this.crate(e,0,.45,-.65,1),this.conduit(e,.3,.2,2.3,1.35)}else if(n===4){for(let a of[-1.65,1.25]){this.cylinder(e,"steel",.59,.66,1.95,.38,.98,a,0,0,0,12),this.cylinder(e,"dark",.25,.34,.42,.38,2.15,a,0,0,0,10);for(let c of[.34,1.6])this.cylinder(e,"accent",.66,.66,.09,.38,c,a,0,0,0,12)}this.conduit(e,-.35,.3,-.25,3.8),this.box(e,"light",.08,.68,.07,-.3,1.05,-1.64,.005)}else if(t===0){for(let[a,c]of[[-1.7,2.3],[1.4,1.3]])this.box(e,"stone",.85,c,.83,.38,c/2,a,.06),this.box(e,"edge",1.05,.19,1.04,.38,c+.09,a,.035),this.box(e,"light",.075,c*.51,.045,-.08,c*.54,a+.43,.007);this.conduit(e,.9,.17,0,5.2)}else if(t===1){this.box(e,"dark",1.75,1.98,2.15,.35,.97,-.95,.055),this.box(e,"accent",.1,1.33,1.76,-.58,1.02,-.95,.018);for(let a of[-1.5,-.95,-.4])this.box(e,"light",.04,.4,.15,-.65,.74,a,.006);this.cylinder(e,"steel",.29,.36,1.22,.5,2.55,-1.18),this.coil(e,.62,.54,2,.61)}else{this.box(e,"stone",1.23,2.3,4.1,.42,1.1,0,.075);for(let a of[-1.45,0,1.45])this.box(e,"steel",.25,1.6,1.07,-.27,.94,a,.035),this.box(e,"light",.045,.11,.67,-.42,1.15,a,.004);this.box(e,"edge",1.4,.25,2.65,.42,2.42,-.6,.045),this.box(e,"dark",.83,.46,1.18,.42,2.62,1.15,.02)}}crate(e,t,n,i,r){this.box(e,"dark",r,r*.85,r,t,n,i,.035);for(let o of[-.28,.28])this.box(e,"steel",r*.085,r*.88,r*1.025,t+o*r,n,i,.007);this.box(e,"accent",r*.37,r*.16,.025,t,n+.06,i+r*.505,.004)}conduit(e,t,n,i,r){this.cylinder(e,"accent",.11,.11,r,t,n,i,Math.PI/2,0,0,8);for(let o of[-1,1])this.cylinder(e,"dark",.16,.16,.14,t,n,i+o*(r*.5-.1),Math.PI/2,0,0,8)}coil(e,t,n,i,r){let o=this.keep(new it(r,.054,5,14));for(let a=0;a<4;a++)this.part(e,"dark",o,t,n,i+a*.12,Math.PI/2,0,0);this.cylinder(e,"steel",r*.52,r*.52,.68,t,n,i+.18,Math.PI/2,0,0,10)}keep(e){return this.geometries.add(e),e}stoneTextures(){let t=new Uint8Array(1048576),n=new Uint8Array(t.length),i=new Uint8Array(t.length),r=81173,o=()=>(r=Math.imul(r,1664525)+1013904223>>>0,(r>>>8)/16777216);for(let l=0;l<512;l++)for(let h=0;h<512;h++){let u=(l*512+h)*4,d=o(),f=Math.sin(h*.037+l*.061)*3+Math.cos(h*.083-l*.025)*2,g=Math.round(128+(d-.5)*20+f-(d>.987?23:0)),x=Math.round(219+d*21+f),m=Math.max(150,Math.min(231,Math.round(205+(d-.5)*17+f*1.3-(d>.987?25:0))));for(let p=0;p<3;p++)t[u+p]=g,n[u+p]=x,i[u+p]=m;t[u+3]=n[u+3]=i[u+3]=255}let a=(l,h)=>{let u;if(typeof document<"u"){let d=document.createElement("canvas");d.width=d.height=512;let f=d.getContext("2d");if(!f)throw new Error("Stone texture surface unavailable");let g=f.createImageData(512,512);if(g.data.set(l),f.putImageData(g,0,0),h)for(let x=0;x<20;x++){let m=o()*512,p=o()*512,v=(o()-.5)*70,b=(o()-.5)*50;f.strokeStyle="rgb(106 106 106)",f.lineWidth=.65+o()*.75,f.beginPath(),f.moveTo(m,p),f.quadraticCurveTo(m+v*.45,p+b*.65+(o()-.5)*10,m+v,p+b),f.stroke()}u=new cs(d)}else u=new os(l,512,512),u.generateMipmaps=!0,u.minFilter=Tn;return u.wrapS=u.wrapT=Kn,u.repeat.set(.65,.65),u.anisotropy=4,u.needsUpdate=!0,this.textures.push(u),u},c=a(i,!0);return c.colorSpace=It,[a(t,!0),a(n,!1),c]}part(e,t,n,i,r,o,a=0,c=0,l=0){this.dummy.position.set(i,r,o),this.dummy.rotation.set(a,c,l),this.dummy.scale.set(1,1,1),this.dummy.updateMatrix();let h=(n.index?n.toNonIndexed():n.clone()).applyMatrix4(this.dummy.matrix);e.has(t)||e.set(t,[]),e.get(t).push(h)}box(e,t,n,i,r,o,a,c,l=.035,h=0,u=0,d=0){let f=Math.min(l,n*.2,i*.2,r*.2),g=`box:${n}:${i}:${r}:${f}`,x=this.cache.get(g);if(!x){let m=new ls;m.moveTo(-n/2+f,-i/2+f),m.lineTo(n/2-f,-i/2+f),m.lineTo(n/2-f,i/2-f),m.lineTo(-n/2+f,i/2-f),m.closePath(),x=this.keep(new rr(m,{depth:r-2*f,bevelEnabled:!0,bevelThickness:f,bevelSize:f,bevelSegments:1,steps:1})),x.translate(0,0,-r/2+f),this.cache.set(g,x)}this.part(e,t,x,o,a,c,h,u,d)}cylinder(e,t,n,i,r,o,a,c,l=0,h=0,u=0,d=10){let f=`cylinder:${n}:${i}:${r}:${d}`,g=this.cache.get(f);g||(g=this.keep(new qe(n,i,r,d)),this.cache.set(f,g)),this.part(e,t,g,o,a,c,l,h,u)}build(e,t,n=this.segmentCount){let i=new Map;t(i);for(let[r,o]of i){let a=Ms(o,!1);for(let l of o)l.dispose();if(!a)throw new Error(`Causeway geometry merge failed for ${r}`);this.keep(a);let c=new Vt(a,this.materials.get(r),n);c.castShadow=r!=="light"&&r!=="earth",c.receiveShadow=!0,c.frustumCulled=!1,c.instanceMatrix.setUsage(Ri),e.push(c),this.root.add(c)}}beam(e,t){this.direction.subVectors(this.beamTo,this.beamFrom);let n=this.direction.length();this.dummy.position.copy(this.beamFrom).addScaledVector(this.direction,.5),this.direction.multiplyScalar(1/Math.max(.001,n)),this.dummy.quaternion.setFromUnitVectors(this.up,this.direction),this.dummy.scale.set(1,n,1),this.dummy.updateMatrix(),e.setMatrixAt(t,this.dummy.matrix)}update(e,t,n){if(this.disposed)return;let i=Number.isFinite(t)?Math.max(0,Math.min(2,Math.floor(t))):0,r=Math.max(0,Number.isFinite(e)?e:0),o=Math.floor(r/this.segmentLength),a=r%this.segmentLength;if(i!==this.level){this.level=i;let h=Hv[i];for(let[u,d]of this.materials)d.color.setHex(h[u]),u==="light"&&d.emissive.setHex(h.light);for(let u=0;u<3;u++)for(let d=0;d<6;d++)for(let f of this.banks[u][d])f.visible=!1,f.count=0;this.anchor=-1}if(o!==this.anchor){this.anchor=o;for(let h=0;h<this.segmentCount;h++)this.plans[h]=Gv(o+h,i)}this.age+=Math.max(0,Math.min(.1,Number.isFinite(n)?n:0)),this.counts.fill(0);let c=0,l=0;for(let h=0;h<this.segmentCount;h++){let u=10-h*this.segmentLength+a,d=this.plans[h];this.dummy.position.set(0,0,u),this.dummy.rotation.set(0,0,0),this.dummy.scale.set(1,1,1),this.dummy.updateMatrix();for(let f of this.common)f.setMatrixAt(h,this.dummy.matrix);for(let f=0;f<2;f++){let g=f===0?-1:1,x=f===0?d.left:d.right,m=this.counts[x]++;this.dummy.position.set(g*6.3,0,u),this.dummy.rotation.set(0,g===-1?Math.PI:0,0),this.dummy.scale.set(1,1,1),this.dummy.updateMatrix();for(let p of this.banks[i][x])p.setMatrixAt(m,this.dummy.matrix);if(x===1){let p=d.phase+f*1.17,v=Math.sin(this.age*.67+p),b=u+g*1.2;this.beamFrom.set(g*6.6,.85,b),this.beamTo.set(g*(7.08+v*.15),2+Math.sin(this.age*.83+p)*.23,b+.12*Math.cos(this.age*.7+p)),this.beam(this.animated[0],c),this.dummy.position.copy(this.beamFrom),this.dummy.rotation.set(0,0,0),this.dummy.scale.set(1,1,1),this.dummy.updateMatrix(),this.animated[2].setMatrixAt(c*2,this.dummy.matrix),this.beamFrom.copy(this.beamTo),this.dummy.position.copy(this.beamFrom),this.dummy.updateMatrix(),this.animated[2].setMatrixAt(c*2+1,this.dummy.matrix),this.beamTo.set(g*(7.75+v*.18),.55+Math.cos(this.age*.83+p)*.12,b+.25*Math.sin(this.age*.71+p)),this.beam(this.animated[1],c),this.dummy.position.copy(this.beamTo),this.dummy.rotation.set(0,0,0);let y=Math.sin(this.age*13+p)>.4?1:0;this.dummy.scale.setScalar(y),this.dummy.updateMatrix(),this.animated[3].setMatrixAt(c,this.dummy.matrix),c++}x===2&&(this.dummy.position.set(g*5.83,1.05,u-g*1.2),this.dummy.rotation.set(this.age*(1.6+i*.27)+d.phase,Math.PI/2,0),this.dummy.scale.set(1,1,1),this.dummy.updateMatrix(),this.animated[4].setMatrixAt(l++,this.dummy.matrix))}}for(let h of this.common)h.instanceMatrix.needsUpdate=!0;for(let h=0;h<6;h++)for(let u of this.banks[i][h])u.count=this.counts[h],u.visible=u.count>0,u.instanceMatrix.needsUpdate=!0;for(let h=0;h<this.animated.length;h++){let u=this.animated[h];u.count=h===4?l:h===2?c*2:c,u.visible=u.count>0,u.instanceMatrix.needsUpdate=!0}}dispose(){if(!this.disposed){this.disposed=!0,this.scene.remove(this.root);for(let e of this.common)e.dispose();for(let e of this.banks)for(let t of e)for(let n of t)n.dispose();for(let e of this.animated)e.dispose();for(let e of this.geometries)e.dispose();for(let e of this.materials.values())e.dispose();for(let e of this.textures)e.dispose();this.root.clear(),this.textures.length=0,this.cache.clear(),this.geometries.clear(),this.materials.clear(),this.plans.length=0,this.common.length=0,this.animated.length=0;for(let e of this.banks){for(let t of e)t.length=0;e.length=0}this.counts.fill(0)}}};function sp(s,e){s.updateWorldMatrix(!0,!0);let t=s.matrixWorld.clone().invert(),n=new Ft,i=s.getObjectByName(e);if(i?.isMesh&&(i.geometry.computeBoundingBox(),!!i.geometry.boundingBox))return n.copy(i.geometry.boundingBox).applyMatrix4(new Fe().multiplyMatrices(t,i.matrixWorld)),n}function rp(s){for(let e=s;e;e=e.parent)if(!e.visible)return!1;return!0}var yr=class{constructor(e,t=!1){this.root=e;if(t){this.front("gunner","Barrel_R");return}this.front("armL","Barrel_L"),this.front("armR","Barrel_R"),this.front("shoulderL","Pod_L"),this.front("shoulderR","Pod_R"),this.attach("core","Torso",new w(-4470348358154297e-23,.6995289325714111,-.7253175973892212));for(let n of["L","R"]){let i=e.getObjectByName("Pod_"+n);if(!i)continue;let r=sp(i,"Pod_"+n+"_MobileMesh");if(!r)continue;let o=r.getCenter(new w);o.y=r.min.y-.035,o.z=r.max.z-.04,o.x+=n==="L"?-.72:.72,this.attach("booster"+n,"Pod_"+n,o)}}anchors=new Map;values={};front(e,t){let n=this.root.getObjectByName(t);if(!n)return;let i=sp(n,t+"_MobileMesh");if(!i)return;let r=i.getCenter(new w);r.z=i.min.z-.02,this.attach(e,t,r)}attach(e,t,n){let i=this.root.getObjectByName(t);if(!i)return;let r=new Qe;r.name="WeaponSocket_"+e,r.position.copy(n),i.add(r),this.anchors.set(e,r),this.values[e]=new w}node(e){return this.anchors.get(e)}position(e,t=new w){let n=this.anchors.get(e);if(!(!n||!rp(n)))return n.updateWorldMatrix(!0,!1),n.getWorldPosition(t)}positions(e=this.values){this.root.updateWorldMatrix(!0,!0);for(let[t,n]of this.anchors){if(!rp(n)){delete e[t];continue}let i=e[t]??new w;n.getWorldPosition(i),e[t]=i}return e}dispose(){for(let e of this.anchors.values())e.removeFromParent();this.anchors.clear(),this.values={}}};function sl(s,e,t,n,i){let r=n>0?rt.clamp((e-t)/n*.0025,-.07,.07):0;return{roll:i?rt.clamp(-s*.045,-.22,.22):rt.clamp(-s*.02,-.05,.05),pitch:i?rt.clamp(e*.018+r,-.18,.18):0,thrust:i?rt.clamp(.45+Math.hypot(s,e)*.06+Math.abs(r)*3,.45,1.5):0}}var Wv={guided:4837375,cannons:16757322,railburst:12223487,freeze:11006207,slow:6411924,haste:16737849,escort:10288307},ln=3162958,cn=14010279,mn=11568969,Do=1516332;function Me(s,e,t=0,n=0,i=0,r=0,o=0,a=0){let c=s.index?s.toNonIndexed():s;c!==s&&s.dispose(),c.rotateX(r).rotateY(o).rotateZ(a).translate(t,n,i);let l=new Ae(e),h=new Float32Array(c.getAttribute("position").count*3);for(let u=0;u<h.length;u+=3)h[u]=l.r,h[u+1]=l.g,h[u+2]=l.b;return c.setAttribute("color",new Tt(h,3)),c}function wn(s,e=!1){let t=Ms(s,!1);s.forEach(r=>r.dispose());let n=e?new Ge({color:16777215,vertexColors:!0,toneMapped:!1}):new $t({color:16777215,vertexColors:!0,roughness:.56,metalness:.44}),i=new We(t,n);return i.castShadow=!e,i.receiveShadow=!e,i}function Wn(s,e){return new We(new Oi(s,1),new Ge({color:e,transparent:!0,opacity:.65,depthWrite:!1,blending:wt,toneMapped:!1}))}function yu(s=.2,e=.85){let t=[];for(let n=0;n<6;n++){let i=n/6*Math.PI*2,r=Math.cos(i)*s,o=Math.sin(i)*s;t.push(Me(new qe(.045,.058,e,6),ln,r,o,e*.5,Math.PI/2)),t.push(Me(new it(.046,.014,3,6),mn,r,o,e))}for(let n of[.05,e*.67])t.push(Me(new it(s+.048,.04,4,12),mn,0,0,n));return wn(t)}function Xv(s,e){[["Barrel_L"],["Barrel_R"],["Pod_L","BattleizerWing_L"],["Pod_R","BattleizerWing_R"],["Leg_L"],["Leg_R"]].forEach((n,i)=>n.forEach(r=>{let o=s.getObjectByName(r);o&&(o.visible=(e&1<<i)===0)}))}var rl=class{constructor(e,t){this.hero=e;this.boss=t;this.sockets=new yr(t),this.heroRig.name="Arsenal_Hero",this.bossRig.name="Arsenal_Boss",this.heroRig.add(this.cannons,this.guided,this.rail),e.add(this.heroRig),t.add(this.bossRig);for(let a of[-1,1]){let c=new Je;c.name="HandCannon_"+(a<0?"L":"R"),c.position.set(a*.9,1.42,-.22),c.rotation.y=Math.PI,this.cannons.add(c);let l=wn([Me(new qe(.29,.32,.45,10),ln,0,0,-.12,Math.PI/2),Me(new it(.31,.055,4,12),mn,0,0,-.28),Me(new Bt(.24,8,5),cn,a*.12,.2,-.15),Me(new Ue(.18,.38,.56),cn,-a*.24,.08,-.1),Me(new qe(.12,.12,.19,8),mn,a*.33,.01,-.12,0,0,Math.PI/2),Me(new Ue(.16,.16,.26),Do,0,-.23,-.2)]);l.name="HandCannonHousing",c.add(l);let h=yu(.19,.92);h.position.z=.12,h.name="HandCannonRotatingBarrels",c.add(h);let u=Wn(.23,16764776);u.position.z=1.1,u.scale.z=1.8,c.add(u),u.visible=!1,this.hands.push({group:c,rotor:h,flash:u,side:a});let d=new Je;d.position.set(a*.68,2.08,.18),d.rotation.y=Math.PI,this.guided.add(d),d.add(wn([Me(new Ue(.35,.38,.65),ln,0,0,0),Me(new qe(.11,.11,.9,8),cn,0,.03,.18,Math.PI/2),Me(new Pn(.12,.24,8),mn,0,.03,.74,Math.PI/2),Me(new Ue(.12,.42,.15),mn,0,0,-.26)]));let f=Wn(.12,7661823);f.position.set(0,.03,.55),d.add(f),this.powerGlow.push(f)}this.rail.position.set(0,1.8,-.4),this.rail.rotation.y=Math.PI,this.rail.add(wn([Me(new Ue(.36,.32,1.1),ln,0,0,.35),Me(new qe(.11,.15,1.3,8),mn,0,0,.45,Math.PI/2),Me(new Ue(.16,.22,.92),cn,-.19,.08,.38),Me(new Ue(.16,.22,.92),cn,.19,.08,.38)]));let n=[];for(let a=0;a<4;a++)n.push(Me(new it(.16,.025,4,10),12751871,0,0,.25+a*.19));this.rail.add(wn(n,!0)),this.railFlash=Wn(.23,14991871),this.railFlash.position.z=1.2,this.rail.add(this.railFlash);let i=wn([Me(new Ue(1.1,1.15,.6),ln,0,2.7,-.62),Me(new qe(.33,.33,.8,10),mn,0,2.9,-.74),Me(new it(.31,.07,4,12),Do,0,3.03,-1,Math.PI/2)]);i.name="BattleizerBackReactor",this.bossRig.add(i),this.bossCharge=Wn(.35,16744493),this.bossCharge.position.set(0,2.9,.9),this.bossRig.add(this.bossCharge);for(let a of["L","R"]){let c=Wn(.22,16741674);c.name="LaserMuzzleCharge_"+a,c.visible=!1,this.bossRig.add(c),this.laserCharges.push(c)}for(let a of[-1,1]){let c=new Je;c.name="BattleizerWing_"+(a<0?"L":"R"),c.position.set(a*.64,3.15,-.48),this.bossRig.add(c);let l=wn([Me(new Ue(.35,.55,.62),mn,a*.25,0,0),Me(new In(.28,.67,2,8),ln,a*.61,.04,-.25),Me(new Bt(.35,8,5),8467752,a*.58,.42,-.22),Me(new qe(.25,.19,.22,8),mn,a*.61,-.68,-.25),Me(new qe(.29,.31,.55,10),Do,a*.56,.24,.24,Math.PI/2)]);l.name="BattleizerJetpackArmor",c.add(l);let h=yu(.18,.95);h.position.set(a*.56,.24,.45),h.name="BattleizerBackCannon",c.add(h);let u=Wn(.27,16746304);u.position.set(a*.56,.24,1.48),c.add(u);let d=new We(new Pn(.18,.9,8),new Ge({color:7790591,transparent:!0,opacity:.65,depthWrite:!1,blending:wt,toneMapped:!1}));d.rotation.z=Math.PI,d.position.set(a*.61,-1.05,-.25),c.add(d),this.wings.push({hinge:c,rotor:h,flash:u,jet:d,side:a})}this.faceRig.name="TyrantFaceRefinement";let r=[],o=[];for(let a of[-1,1])r.push(Me(new Ue(.18,.067,.023),Do,a*.14,.411,-.438,0,0,a*-.16)),r.push(Me(new Ue(.22,.036,.036),ln,a*.145,.482,-.449,0,0,a*-.24)),o.push(Me(new Ue(.121,.014,.012),16734251,a*.14,.416,-.456,0,0,a*-.16));r.push(Me(new Ue(.205,.116,.021),Do,0,.178,-.429));for(let a=0;a<5;a++)r.push(Me(new Ue(.013,.1,.021),mn,(a-2)*.035,.177,-.445));this.faceRig.add(wn(r),wn(o,!0)),this.faceRig.visible=!1;for(let a of["armL","armR","shoulderL","shoulderR","core"]){let c=this.sockets.node(a);if(!c)continue;let l=Wn(a==="core"?.22:.13,a==="core"?16760156:16739628);l.name="SocketCharge_"+a,l.visible=!1,c.add(l),this.socketCharges.set(a,l);let h=Wn(a==="core"?.18:.17,16769452);h.name="SocketFlash_"+a,h.visible=!1,c.add(h),this.socketFlashes.set(a,h)}for(let a of["boosterL","boosterR"]){let c=this.sockets.node(a);if(!c)continue;let l=new Je;l.name="OriginalBoosterExhaust_"+a,c.add(l);let h=a.endsWith("L")?1:-1,u=wn([Me(new it(.18,.04,5,16),mn,0,0,0,Math.PI/2),Me(new qe(.18,.23,.24,12),ln,0,.085,0),Me(new Ue(.76,.16,.2),mn,h*.36,.12,0),Me(new Ue(.16,.35,.26),ln,h*.67,.2,0)]);l.add(u);let d=[Wn(.14,15268863),Wn(.21,6676479),Wn(.28,3374553)];d.forEach((f,g)=>{f.name="BoosterPlasmaStage_"+g,f.position.y=[-.28,-.65,-1][g],f.material.opacity=[.85,.42,.12][g],f.visible=!1,l.add(f)}),this.boosters.push({group:l,plumes:d})}this.reset()}heroRig=new Je;bossRig=new Je;cannons=new Je;guided=new Je;rail=new Je;hands=[];wings=[];powerGlow=[];clock=0;bossClock=0;bossSpin=0;spin=0;unfolded=0;previousFire=0;recoil=0;lastNearShotZ;railFlash;sockets;socketCharges=new Map;socketFlashes=new Map;flashTimes=new Map;shotIDs=new Set;boosters=[];previousBoss=new w;previousVelocityZ=0;hasBossPosition=!1;bossCharge;laserCharges=[];faceRig=new Je;faceHead;emitters(e){return this.sockets.positions(e)}update(e,t){let n=this.boss.getObjectByName("Head");n&&n!==this.faceHead&&(this.faceRig.removeFromParent(),n.add(this.faceRig),this.faceHead=n),this.faceRig.visible=!!n,this.heroRig.parent!==this.hero&&this.hero.add(this.heroRig),this.bossRig.parent!==this.boss&&this.boss.add(this.bossRig);let i=e,r=Math.max(0,Math.min(t,.15));this.clock+=r;let o=(i.timePowerTime??0)>0,a=e.empStunTime>0?0:o?i.timePower==="freeze"?0:i.timePower==="slow"?.5:i.timePower==="haste"?1.35:1:1,c=r*a;this.bossClock+=c,this.bossSpin+=c*(e.bossAction==="windup"?51:30);let l=e.phase==="run"||e.phase==="boss",h=l&&((i.powerTime??0)>0||i.weaponPermanent===!0);this.cannons.visible=h&&i.weaponPower==="cannons",this.guided.visible=h&&i.weaponPower==="guided",this.rail.visible=h&&i.weaponPower==="railburst",this.heroRig.visible=l;let u=e.shots.filter(N=>N.owner!=="troop"&&N.z<2.2).sort((N,B)=>N.z-B.z)[0],d=l&&!!u;this.spin+=r*(d?34:3),this.recoil=Math.max(0,this.recoil-r*10),d&&(this.lastNearShotZ===void 0||u.z<this.lastNearShotZ-.08)&&(this.previousFire=this.clock,this.recoil=1),this.lastNearShotZ=u?.z;let f=u?Math.atan2(u.dx,-u.dz):Math.PI,g=Math.atan2(Math.sin(f-Math.PI),Math.cos(f-Math.PI)),x=u,m=x&&Number.isFinite(x.y)&&Number.isFinite(x.dy)?Math.atan2(x.dy,Math.hypot(x.dx,x.dz)):void 0,p=m??(e.phase==="boss"?Math.atan2(e.bossY+4.31-1.42,Math.max(1,e.bossZ-.85-.4)):0);for(let N of this.hands)N.rotor.rotation.z=this.spin,N.group.position.z=-.22+this.recoil*.17,N.group.rotation.y=Math.PI+rt.clamp(g,-.3,.3),N.group.rotation.x=-p+this.recoil*.065,N.flash.visible=d&&this.recoil>.3,N.flash.scale.set(1+this.recoil*.4,1+this.recoil*.4,1.8+this.recoil);this.rail.position.z=-.4+this.recoil*.2,this.rail.rotation.x=m!==void 0?-m:e.phase==="boss"?-Math.atan2(e.bossY+4.31-1.8,Math.max(1,e.bossZ-.85-.4)):0;for(let N of this.guided.children)N.rotation.x=m!==void 0?-m:e.phase==="boss"?-Math.atan2(e.bossY+4.31-2.08,Math.max(1,e.bossZ-.85-.4)):0;this.railFlash.visible=d&&this.recoil>.4,this.powerGlow.forEach((N,B)=>N.scale.setScalar(1+Math.sin(this.clock*12+B)*.15));let v=e.phase==="boss",b=e.phase==="lastStand",y=v&&((i.bossPhase??1)>=2||(i.bossRevives??0)>0||i.bossPattern==="heavy"&&(e.bossAction==="windup"||e.bossAction==="fire"));this.bossRig.visible=e.phase==="boss"||e.phase==="destroying"||(e.phase==="lost"||b)&&e.bossHp>0,this.unfolded+=((y?1:0)-this.unfolded)*(1-Math.exp(-c*5)),Xv(this.boss,i.bossPartsMask??0),this.bossCharge.visible=!1,this.laserCharges.forEach(N=>N.visible=!1);for(let N of e.enemyShots){let B=N.emitter;!this.shotIDs.has(N.id)&&B&&this.sockets.node(B)&&this.flashTimes.set(B,.1)}this.shotIDs=new Set(e.enemyShots.map(N=>N.id));let A=i.bossPartsMask??0,R=["armL","armR"].filter((N,B)=>(A&1<<B)===0),C=["shoulderL","shoulderR"].filter((N,B)=>(A&1<<B+2)===0),T=i.bossPattern==="laser"?["core"]:i.bossPattern==="rockets"?C.length?C:["core"]:R.length?R:["core"];for(let[N,B]of this.socketCharges){let I=!!this.sockets.position(N);B.visible=I&&v&&i.bossState!=="guarded"&&e.bossAction==="windup"&&T.includes(N),N==="core"&&v&&i.bossState==="exposed"&&(B.visible=I),B.scale.setScalar(N==="core"&&i.bossState==="exposed"?1:.55+Math.max(0,e.bossAttack)*1)}for(let[N,B]of this.socketFlashes){let I=Math.max(0,(this.flashTimes.get(N)??0)-c);this.flashTimes.set(N,I),B.visible=v&&I>0&&!!this.sockets.position(N),B.scale.setScalar(.6+I*9)}this.boss.updateWorldMatrix(!0,!0);let M=this.boss.getWorldPosition(new w),_=this.hasBossPosition&&r>0?(M.x-this.previousBoss.x)/r:0,P=this.hasBossPosition&&r>0?(M.z-this.previousBoss.z)/r:0,U=v&&(i.bossY??0)>.12&&(A&12)!==12,z=sl(_,P,this.previousVelocityZ,r,U);this.previousBoss.copy(M),this.previousVelocityZ=P,this.hasBossPosition=!0;for(let N of this.boosters)for(let B=0;B<N.plumes.length;B++){let I=N.plumes[B];I.visible=U;let H=1+Math.sin(this.bossClock*(23+B*4)+B)*.055;I.scale.set((1-B*.12)*H,([1.8,2.6,2.8][B]+z.thrust*.35)*H,1-B*.12)}for(let N of this.wings)N.hinge.position.x=N.side*(.64+this.unfolded*.7),N.hinge.position.y=3.15+this.unfolded*.24,N.hinge.rotation.z=N.side*(.12+this.unfolded*.95),N.hinge.rotation.x=-this.unfolded*.28,N.rotor.rotation.z=-this.bossSpin,N.flash.visible=!1,N.jet.visible=!1}reset(){this.shotIDs.clear(),this.flashTimes.clear(),this.hasBossPosition=!1,this.previousVelocityZ=0,this.socketCharges.forEach(e=>e.visible=!1),this.socketFlashes.forEach(e=>e.visible=!1);for(let e of this.boosters)e.plumes.forEach(t=>t.visible=!1);this.faceRig.visible=!1,this.clock=0,this.bossClock=0,this.bossSpin=0,this.spin=0,this.unfolded=0,this.previousFire=0,this.recoil=0,this.lastNearShotZ=void 0,this.heroRig.visible=!1,this.bossRig.visible=!1,this.bossCharge.visible=!1,this.laserCharges.forEach(e=>e.visible=!1);for(let e of this.hands)e.rotor.rotation.z=0,e.group.rotation.x=0,e.group.position.z=-.22,e.flash.visible=!1;this.railFlash.visible=!1,this.rail.position.z=-.4,this.rail.rotation.x=0;for(let e of this.guided.children)e.rotation.x=0;for(let e of this.wings)e.hinge.rotation.set(0,0,0),e.flash.visible=!1,e.jet.visible=!1}dispose(){for(let e of[...this.socketCharges.values(),...this.socketFlashes.values()])e.geometry.dispose(),e.material.dispose(),e.removeFromParent();for(let e of this.boosters)Uo(e.group),e.group.removeFromParent();this.sockets.dispose(),Uo(this.heroRig),Uo(this.bossRig),Uo(this.faceRig),this.faceRig.removeFromParent(),this.faceHead=void 0,this.hero.remove(this.heroRig),this.boss.remove(this.bossRig)}};function vu(s,e=!1){let t=new Je;t.name="PowerPickup_"+s,t.userData.pickupKind=s;let n=new Je;n.name="PickupVisual",n.position.y=e?1.1:1.35,t.add(n);let i=new Je;i.name="PickupSymbol_"+s,n.add(i);let r=Wv[s],o=[];if(s==="guided"){for(let l=0;l<3;l++){let h=(l-1)*.33,u=l===1?.12:-.1;o.push(Me(new qe(.085,.085,.58,6),cn,h,u,0,Math.PI/2)),o.push(Me(new Pn(.095,.25,6),r,h,u,.41,Math.PI/2));for(let d of[0,Math.PI/2])o.push(Me(new Ue(.29,.035,.2),ln,h,u,-.2,0,0,d))}o.push(Me(new it(.57,.025,3,24,Math.PI*1.5),r,0,0,-.25))}else if(s==="cannons"){let l=wn([Me(new qe(.34,.34,.32,10),ln,0,0,-.33,Math.PI/2),Me(new it(.34,.055,4,12),r,0,0,-.2)]);i.add(l);let h=yu(.21,.62);h.name="PickupGatlingRotor",h.position.z=-.15,i.add(h),t.userData.pickupRotor=h}else if(s==="railburst"){o.push(Me(new Ue(.14,.17,1.13),ln,-.18,0,0),Me(new Ue(.14,.17,1.13),ln,.18,0,0),Me(new Ue(.53,.21,.22),cn,0,0,-.52));for(let l of[-.35,-.07,.21])o.push(Me(new it(.22,.037,4,12),r,0,0,l));o.push(Me(new Pn(.13,.45,4),r,0,0,.72,Math.PI/2)),i.rotation.y=-.5}else if(s==="escort"){for(let l of[-1,1])o.push(Me(new Kt(.22),ln,l*.37,0,0),Me(new it(.3,.055,6,6),r,l*.37,0,.03));o.push(Me(new Ue(.48,.08,.08),cn,0,0,0),Me(new it(.56,.027,5,24,Math.PI*1.4),r,0,0,-.08))}else if(s==="freeze"){for(let l=0;l<6;l++){let h=l*Math.PI/3;o.push(Me(new Ue(.065,.7,.095),r,Math.sin(h)*.32,Math.cos(h)*.32,0,0,0,-h));for(let u of[-1,1])o.push(Me(new Ue(.045,.26,.095),cn,Math.sin(h)*.46+Math.cos(h)*u*.06,Math.cos(h)*.46-Math.sin(h)*u*.06,0,0,0,-h+u*.65))}o.push(Me(new Kt(.16),cn))}else if(s==="slow"){o.push(Me(new it(.53,.075,4,24),r),Me(new qe(.49,.49,.1,24),ln,0,0,-.03,Math.PI/2));for(let l=0;l<12;l++){let h=l/12*Math.PI*2;o.push(Me(new Ue(.035,.08,.04),cn,Math.sin(h)*.4,Math.cos(h)*.4,.06,0,0,-h))}o.push(Me(new Ue(.06,.3,.065),cn,0,.13,.1),Me(new Ue(.27,.06,.065),r,.12,0,.11),Me(new qe(.12,.12,.12,8),mn,0,.64,0,0,0,Math.PI/2))}else{for(let l of[-.2,.24])for(let h of[-1,1])o.push(Me(new Ue(.13,.45,.12),r,h*.14,l,0,0,0,h*-.66));for(let l of[-1,1])o.push(Me(new Ue(.045,.63,.08),cn,l*.39,-.02,-.05,0,0,l*-.57));o.push(Me(new Ue(.09,.2,.09),cn,0,-.58,.03),Me(new Kt(.065),cn,0,-.78,.03))}o.length&&i.add(wn(o));let a=new We(new it(.53,.026,3,24),new Ge({color:r,transparent:!0,opacity:.5,depthWrite:!1,toneMapped:!1}));a.rotation.x=Math.PI/2,a.position.y=-.75,n.add(a);let c=wn([Me(new Kt(.075),r,-.65,0,0),Me(new Kt(.075),r,.65,0,0)],!0);return n.add(c),t.userData.pickupVisual=n,t.userData.pickupCage=c,t.userData.pickupIcon=i,t.userData.pickupCore=a,t.userData.pickupHover=e?1.1:1.35,t}function _u(s,e,t=!1){let n=s.userData.pickupVisual;if(!n)return;n.position.y=s.userData.pickupHover+Math.sin(e*3.5)*.11,n.rotation.z=Math.sin(e*2)*.035,s.userData.pickupIcon.rotation.y=(s.userData.pickupKind==="railburst"?-.5:0)+Math.sin(e*1.4)*.18;let i=s.userData.pickupRotor;i&&(i.rotation.z=e*4),s.userData.pickupCage.rotation.z=e*.35,s.userData.pickupCore.scale.setScalar((t?1.15:1)+Math.sin(e*6)*.045)}function Uo(s){let e=new Set,t=new Set;s.traverse(n=>{let i=n;if(i.isMesh){e.add(i.geometry);for(let r of Array.isArray(i.material)?i.material:[i.material])t.add(r)}}),e.forEach(n=>n.dispose()),t.forEach(n=>n.dispose())}function bu(s){Uo(s),s.removeFromParent()}var Mu={escort:{name:"ESCORT GUARD",short:"ESCORT",symbol:"\u2B21",color:"#9cfcb3",effect:"Absorbs 30 damage \xB7 12s \xB7 no healing",duration:12},guided:{name:"GUIDED MISSILES",short:"GUIDED",symbol:"\u25CE",color:"#83f3ed",effect:"Missiles track enemies",duration:10},cannons:{name:"HAND CANNONS",short:"CANNONS",symbol:"\u25A5",color:"#ffce73",effect:"Twin rotating cannons",duration:10},railburst:{name:"RAIL BURST",short:"RAIL",symbol:"\u03DF",color:"#d6b5ff",effect:"Piercing straight shots",duration:10},freeze:{name:"FREEZE",short:"FREEZE",symbol:"\u2744",color:"#99e9ff",effect:"Hostiles frozen \xB7 keep firing",duration:3},slow:{name:"SLOW FIELD",short:"SLOW",symbol:"\u25F7",color:"#9df3ba",effect:"Slower threats \xB7 keep firing",duration:5},haste:{name:"HASTE \xB7 RISK",short:"HASTE !",symbol:"\xBB",color:"#ffab69",effect:"Faster threats \xB7 bonus score & XP",duration:5}},qv=["guided","cannons","railburst","freeze","slow","haste","escort"];function Ss(s){return qv[Math.round(s)-1]??"guided"}var No=s=>new $t({color:s,roughness:.82,metalness:.06});function ci(s,e,t,n,i,r,o,a){let c=new We(new Yc(e,t,n,1,Math.min(.06,e*.15,t*.15,n*.15)),a);return c.position.set(i,r,o),c.castShadow=!0,c.receiveShadow=!0,s.add(c),c}function ol(s,e,t,n,i,r,o,a,c=12){let l=new We(new qe(e,t,n,c),a);return l.position.set(i,r,o),l.castShadow=!0,l.receiveShadow=!0,s.add(l),l}var Fo=class{constructor(e=1.9,t=!1){this.plain=t;this.canvas.width=384,this.canvas.height=160,this.ctx=this.canvas.getContext("2d"),this.texture=new cs(this.canvas),this.texture.colorSpace=It,this.sprite=new Kr(new Qs({map:this.texture,transparent:!0,depthTest:!1,depthWrite:!1})),this.sprite.scale.set(e,e*160/384,1),this.sprite.renderOrder=12}canvas=document.createElement("canvas");ctx;texture;sprite;last="";set(e,t,n=""){let i=e+t+n;if(i===this.last)return;this.last=i;let r=this.ctx;r.clearRect(0,0,384,160),this.plain||(r.fillStyle="#152c36ef",r.beginPath(),r.roundRect(4,4,376,152,25),r.fill(),r.strokeStyle=t,r.lineWidth=7,r.stroke()),r.textAlign="center",r.fillStyle=this.plain?t:"white",r.font=`900 ${n?81:100}px Segoe UI`,this.plain&&(r.strokeStyle="#30261f",r.lineWidth=10,r.strokeText(e,192,n?100:117,355)),r.fillText(e,192,n?100:117,355),n&&(r.fillStyle=t,r.font="800 25px Segoe UI",r.fillText(n,192,138,355)),this.texture.needsUpdate=!0}dispose(){this.texture.dispose(),this.sprite.material.dispose()}};function Yv(s){return s.guidedArmor?"GUIDED RESIST":s.role==="battery"?"BATTERY":s.variant===2?"GUNNER":s.role==="carrier"?"SALVAGE":"REAVER"}var al=class{constructor(e){this.canvas=e;this.renderer=new Hc({canvas:e,antialias:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6)),this.renderer.setClearColor(11388359),this.renderer.outputColorSpace=It,this.renderer.toneMapping=Qa,this.renderer.toneMappingExposure=1.06,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=Xa,this.scene.fog=new Yr(11388359,65,120),this.scene.add(new xo(15530495,8414276,2));let t=new fs(16772555,3.2);t.position.set(-14,30,15),t.castShadow=!0,t.shadow.mapSize.set(2048,2048),Object.assign(t.shadow.camera,{left:-20,right:20,top:35,bottom:-20,near:1,far:80}),t.shadow.normalBias=.06,t.shadow.bias=-3e-4,this.scene.add(t),this.scene.add(new _o(16777215,.3)),this.environment=new il(this.scene),this.fx=new $c(this.scene),this.missiles=new Qc(this.scene),this.robots=new Jc(this.scene,200),this.abilities=new el(this.scene,this.hero,globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1),this.enemyCues=new jc(this.scene,16),this.scene.add(this.hero),this.heroRing=new We(new jn(.75,.83,48),new Ge({color:5433599,transparent:!0,opacity:.8,side:Ct})),this.heroRing.rotation.x=-Math.PI/2,this.heroRing.position.y=.035,this.hero.add(this.heroRing),this.shadowInstances=new Vt(new no(.36,12).rotateX(-Math.PI/2),new Ge({color:2175789,transparent:!0,opacity:.22,depthWrite:!1}),220),this.shadowInstances.frustumCulled=!1,this.scene.add(this.shadowInstances),this.scene.add(this.boss),this.resizeObserver=new ResizeObserver(()=>this.resize()),this.resizeObserver.observe(e),this.resize()}renderer;scene=new Zr;camera=new Nt(30,.56,.1,180);environment;fx;missiles;robots;abilities;formationPositions=[];commanderExploded=!1;hitNumbers=new Map;heroArms=[];bossMuzzles=[];bossExploded=!1;recoil=0;lastMuzzle=0;previousX=0;bossPreviousX=0;hero=new Je;model;mixer;run;idle;running=!1;allies;views=new Map;dummy=new Qe;eliteTemplate;elitePool=[];bossModel;bossJoints=[];bossAdapter;arsenal;pickups=new Map;boss=new Je;presentation;bossHitKick=0;bossFireKick=0;commanderHitKick=0;emitterPositions={};enemyMotion=new Map;eliteSockets=[];projectileIDs=new Set;bossPreviousZ=40;bossPreviousVz=0;bossPitch=0;bossBank=0;bossMotionReady=!1;enemyCues;enemyRecoil=new Map;heroRing;shadowInstances;floating=[];age=0;hostileAge=0;bossVisualAge=0;shake=0;cameraBossBlend=0;resizeObserver;cameraLookZ=-9.3;formationFraming=new tl;resize(){let e=Math.max(1,this.canvas.clientWidth),t=Math.max(1,this.canvas.clientHeight);this.renderer.setSize(e,t,!1),this.camera.aspect=e/t,this.camera.updateProjectionMatrix();let n=5.05/Math.min(.45,this.camera.aspect)/Math.tan(rt.degToRad(15)),i=new w(0,0,3.39),r=t-128,o=l=>(this.camera.position.set(0,n*.58,l+n*.815),this.camera.lookAt(0,.1,l),this.camera.updateMatrixWorld(!0),(1-i.clone().project(this.camera).y)*t*.5),a=-9.3,c=0;if(o(a)>r){for(let l=0;l<18;l++){let h=(a+c)*.5;o(h)>r?a=h:c=h}this.cameraLookZ=c}else this.cameraLookZ=a}async load(){let e=new Xc,[t,n,i,r]=await Promise.all([e.loadAsync("commander.glb"),e.loadAsync("troop.glb"),e.loadAsync("cinder-reaver.glb"),e.loadAsync("forge-tyrant.glb")]);this.model=t.scene,this.model.scale.setScalar(.95),this.model.rotation.y=Math.PI,this.hero.add(this.model),this.model.traverse(d=>{d.isMesh&&(d.castShadow=!0,d.receiveShadow=!0,d.material.roughness=.76,d.material.metalness=.12),d.isBone&&d.name.startsWith("upperarm")&&this.heroArms.push(d)});let o=new Set;for(let d of[i,r])d.scene.traverse(f=>{if(f.isMesh)for(let g of Array.isArray(f.material)?f.material:[f.material])o.has(g)||(o.add(g),g.color.multiplyScalar(2.2),g.metalness=.2,g.roughness=.64)});this.eliteTemplate=i.scene,this.eliteTemplate.traverse(d=>{d.isMesh&&(d.castShadow=!0,d.receiveShadow=!0)});let a=new it(.28,.045,6,24),c=new Ge({color:16760161,transparent:!0,opacity:.9,depthWrite:!1,toneMapped:!1});for(let d=0;d<16;d++){let f=this.eliteTemplate.clone(!0);f.visible=!1,this.elitePool.push(f),this.scene.add(f),this.eliteSockets.push(new yr(f,!0));let g=new We(a,c);g.name="CarrierVulnerability",g.position.set(0,1.5,.55),g.visible=!1,f.add(g)}this.boss.clear(),this.bossModel=r.scene,this.bossModel.rotation.y=Math.PI,this.boss.add(this.bossModel),this.bossModel.traverse(d=>{d.isMesh&&(d.castShadow=!0,d.receiveShadow=!0),/^(Arm_[LR]|Barrel_[LR]|Pod_[LR]|Leg_[LR]|Knee_[LR]|Head)$/.test(d.name)&&(d.userData.restQuaternion=d.quaternion.clone(),this.bossJoints.push(d))}),this.bossAdapter=new nl(this.boss,this.scene),this.arsenal=new rl(this.hero,this.boss),this.mixer=new Mo(t.scene);for(let d of t.animations)d.name==="Run"&&(this.run=this.mixer.clipAction(d)),d.name==="Idle"&&(this.idle=this.mixer.clipAction(d));this.idle?.play();let l=d=>{d.scene.updateMatrixWorld(!0);let f;d.scene.traverse(m=>{m.isMesh&&!f&&(f=m)});let g=f.geometry.clone().applyMatrix4(f.matrixWorld),x=f.material.clone();return x.roughness=.85,x.metalness=.05,[g,x]},[h,u]=l(n);h.computeBoundingBox(),h.boundingBox&&this.formationFraming.setBounds(h.boundingBox),this.allies=new Vt(h,u,64),this.allies.castShadow=!0,this.allies.frustumCulled=!1,this.scene.add(this.allies)}reset(){this.formationFraming.reset(),this.bossAdapter?.reset(),this.enemyMotion.clear(),this.projectileIDs.clear(),this.emitterPositions={},this.bossPreviousZ=40,this.bossPreviousVz=0,this.bossPitch=0,this.bossBank=0,this.bossMotionReady=!1,this.enemyRecoil.clear(),this.enemyCues.reset(),this.presentation=void 0,this.bossHitKick=0,this.bossFireKick=0,this.commanderHitKick=0,this.hostileAge=0,this.bossVisualAge=0,this.commanderExploded=!1,this.hero.visible=!0,this.formationPositions=[],this.hitNumbers.clear(),this.arsenal?.reset();for(let e of this.pickups.values())this.scene.remove(e.group),e.group.remove(e.badge.sprite),e.badge.dispose(),bu(e.group);this.pickups.clear();for(let e of this.views.values())this.disposeView(e);this.views.clear();for(let e of this.floating)this.scene.remove(e.badge.sprite),e.badge.dispose();this.floating=[],this.fx.reset(),this.missiles.reset(),this.robots.reset(),this.abilities.reset(),this.bossExploded=!1,this.renderer.toneMappingExposure=1.06,this.camera.fov=30,this.camera.updateProjectionMatrix(),this.recoil=0,this.previousX=0,this.bossPreviousX=0,this.lastMuzzle=0,this.shake=0,this.cameraBossBlend=0}set(e,t,n,i,r,o=1,a=0,c=1){this.dummy.position.set(n,i,r),this.dummy.rotation.set(0,a,0),this.dummy.scale.set(o*c,o,o),this.dummy.updateMatrix(),e.setMatrixAt(t,this.dummy.matrix)}createView(e){let t=new Je,n=new Fo(e.kind==="gate"?2.8:e.kind==="crate"?2:1.45),i=No(15290168),r=No(16496974),o=No(2308418),a=No(16773072),c;if(e.kind==="gate"){let u=e.value>=0,d=No(u?1944514:15290168);for(let x of[-1,1])ci(t,.18,2.1,.18,x*1.55,1.05,0,o),ol(t,.16,.24,.28,x*1.55,.14,0,r,8),ci(t,.08,1.95,.05,x*1.55,1.1,.12,d);let f=new We(new Ln(3,1.65),new Ge({color:u?2475500:16082242,transparent:!0,opacity:.24,side:Ct,depthWrite:!1}));f.position.y=1.1,t.add(f),ci(t,3.3,.12,.2,0,2.12,0,d),n.sprite.position.y=1.35;let g=new We(new Ln(3,.32),new Ge({color:u?4579327:16741718,transparent:!0,opacity:.65,side:Ct}));g.rotation.x=-Math.PI/2,g.position.y=.045,t.add(g),t.userData.gateTint=[d,f.material,g.material]}else if(e.kind==="orb")c=vu(Ss(e.value),!0),t.add(c),n.sprite.position.y=2.65;else if(e.kind==="crate"){ci(t,1.65,1.3,1.4,0,.68,0,r);for(let u of[-.55,.55])ci(t,.12,1.2,1.25,u,.6,0,o);for(let u of[-.52,.52])ci(t,1.4,.1,.13,0,1.05,u,a);c=new Je,c.position.y=2.05,c.scale.setScalar(1.4),t.add(c),ci(c,.7,.25,.35,0,0,0,o);for(let u of[-.18,.18])ol(c,.08,.08,.9,u,.06,-.44,o,8).rotation.x=Math.PI/2;ci(c,.18,.28,.22,.05,-.22,0,a),n.sprite.position.set(0,3,0)}else if(e.kind==="hazard"){c=new Je,c.position.y=.7,t.add(c);let u=ol(c,.56,.56,2.3,0,0,0,i,16);u.rotation.z=Math.PI/2;for(let d of[-1.12,1.12]){let f=ol(c,.63,.63,.17,d,0,0,a,16);f.rotation.z=Math.PI/2}for(let d=0;d<4;d++)for(let f=0;f<7;f++){let g=f/7*Math.PI*2,x=new We(new Pn(.16,.37,4),a);x.position.set(-.86+d*.57,Math.cos(g)*.61,Math.sin(g)*.61),x.rotation.x=g,c.add(x)}n.sprite.position.y=1.9}else n.sprite.position.y=1.65;let l=ci(t,e.kind==="gate"?2.4:1.6,.1,.06,0,e.kind==="enemy"?2.6:e.kind==="orb"?2.25:1.31,.06,new Ge({color:e.kind==="crate"?16768342:16735049}));if(e.kind==="enemy"||e.kind==="orb"){let u=ci(t,1.68,.16,.06,0,l.position.y,0,new Ge({color:1909808}));u.renderOrder=1}t.add(n.sprite),this.scene.add(t);let h={group:t,badge:n,bar:l,kind:e.kind,rotor:c};return this.views.set(e.id,h),h}disposeView(e){this.scene.remove(e.group),e.badge.dispose();let t=new Set,n=new Set;e.group.traverse(i=>{if(i.isMesh){n.add(i.geometry);for(let r of Array.isArray(i.material)?i.material:[i.material])t.add(r)}}),n.forEach(i=>i.dispose()),t.forEach(i=>i.dispose())}trigger(e,t){this.abilities.trigger(e,t);let n=-e.z,i=t;if(i?.bossPose&&(e.kind==="bossPartBreak"||e.kind==="bossDeath")&&this.bossAdapter?.apply(i.bossPose),e.kind==="hit"){let r=e.variant===3||e.variant===4,o=xu(e,{depthScale:1,bossPhase:r,bossY:t?.bossY??this.boss.position.y,bossImpactHeight:4.31,overdrive:!1,weapon:1,targets:[...t?.targets??[],...this.presentation?.targets??[]]});if(r&&e.value<=0?this.fx.deflect(o.x,o.y,o.z):this.fx.impact(o.x,o.y,o.z,.5),r&&e.value>0&&(this.bossHitKick=Math.max(this.bossHitKick,.24)),e.value>0&&e.variant>0&&!r){let a=this.hitNumbers.get(e.entityId)??{at:-1,value:0};a.value+=e.value,this.age-a.at>.22&&(this.float("-"+Math.ceil(a.value),e.x,n,"#ffe0a0",3.4,!0),a.at=this.age,a.value=0),this.hitNumbers.set(e.entityId,a)}}if(e.kind==="drop"&&this.fx.impact(e.x,1.2,n,1.2),e.kind==="pickup"&&this.fx.powerAcquire(this.hero,Ss(e.value)),e.kind==="coreExpose"){let r=i?.bossRegions?.find(o=>o.id==="core");this.fx.impact(r?.x??e.x,r?.y??(t?.bossY??this.boss.position.y)+4.31,r?-r.z:n+.85,1.6),this.shake=.17}if(e.kind==="bossRevive"&&(this.fx.impact(e.x,this.boss.position.y+2.7,n,2),this.shake=.24),e.kind==="bossPartBreak"){let r=["cannonL","cannonR","boosterL","boosterR","legL","legR"][e.value-1];r&&(this.scene.updateMatrixWorld(!0),this.fx.bossPartBreak(this.boss,r),this.shake=.24)}if(e.kind==="bossPhase"&&(this.shake=.2,this.fx.impact(e.x,2.8,n,2)),e.kind==="kill"){if(this.hitNumbers.delete(e.entityId),e.variant<0)this.fx.impact(e.x,1,n,2);else{let r=xu(e,{depthScale:1,bossPhase:!1,overdrive:!1,weapon:1,targets:[...t?.targets??[],...this.presentation?.targets??[]]});this.fx.enemyDeath(r.x,r.z,e.variant,e.variant>0?1.6:1,r.y)}this.shake=Math.max(this.shake,e.variant>0?.1:.04)}if(e.kind==="enemyFire"&&(this.enemyRecoil.size>=32&&!this.enemyRecoil.has(e.entityId)&&this.enemyRecoil.delete(this.enemyRecoil.keys().next().value),this.enemyRecoil.set(e.entityId,.24)),e.kind==="contact"&&(this.fx.impact(e.x,.6,n,1.2),this.shake=Math.max(this.shake,.045)),e.kind==="block"&&this.fx.impact(e.x,1,n,.5),(e.kind==="gate"||e.kind==="recruit")&&(this.fx.impact(e.x,.6,n,.8),e.value!==0&&this.float(e.value>0?"+"+e.value:String(e.value),e.x,n,"#73eaff")),e.kind==="troopDeath"&&this.fx.allyLoss(e.x,n,1),e.kind==="damage"&&(this.shake=.12,this.float("-"+Math.abs(e.value),e.x,n,"#ff8469",2,!0)),e.kind==="bossShot"&&(this.bossFireKick=.3,this.shake=.07),e.kind==="commanderHit"&&(this.commanderHitKick=.35,this.fx.impact(e.x,1.3,n,1.2),this.shake=.2,this.float("-"+Math.abs(e.value)+" HP",e.x,n,"#ff8469",3.1,!0)),e.kind==="hazardBreak"&&(this.fx.enemyDeath(e.x,n,1,Math.max(1.2,e.size)),this.shake=.22),e.kind==="commanderDeath"&&!this.commanderExploded&&(this.scene.updateMatrixWorld(!0),this.fx.commanderDeath(this.hero),this.commanderExploded=!0,this.hero.visible=!1,this.shake=.4),e.kind==="retreat"&&this.hitNumbers.delete(e.entityId),e.kind==="bossDeath"&&!this.bossExploded){this.scene.updateMatrixWorld(!0);let r=i?.bossRegions?.find(o=>o.id==="core");this.fx.bossDeath(this.boss,r?new w(r.x,r.y,-r.z):void 0),this.bossExploded=!0,this.shake=.45,this.float("CORE DESTROYED",e.x,n,"#ffc86b")}}weaponUpgrade(e,t){return this.abilities.weaponUpgrade(e,t)}sacrifice(e){this.fx.sacrifice(this.hero,e)}float(e,t,n,i,r=2,o=!1){if(this.floating.length>=16){let c=this.floating.shift();this.scene.remove(c.badge.sprite),c.badge.dispose()}let a=new Fo(e.length>8?3:1.5,o);a.set(e,i),this.scene.add(a.sprite),this.floating.push({badge:a,life:1,x:t,y:r,z:n})}update(e,t,n,i=!0){if(n==="paused"){i&&this.renderer.render(this.scene,this.camera);return}let r=n==="play",o=n==="intro",a=e.phase==="lastStand",c=n==="paused"?0:t;this.presentation=e,this.bossHitKick=Math.max(0,this.bossHitKick-c),this.bossFireKick=Math.max(0,this.bossFireKick-c),this.commanderHitKick=Math.max(0,this.commanderHitKick-c),this.age+=c;let l=e.timePower==="freeze"?0:e.timePower==="slow"?.5:e.timePower==="haste"?1.35:1;this.hostileAge+=c*l,e.empStunTime>0||(this.bossVisualAge+=c*l);let h=this.bossVisualAge,u=e.phase==="boss"||e.phase==="destroying"||this.bossExploded&&e.phase==="won"||(e.phase==="lost"||a)&&e.bossHp>0&&e.travelDistance>=e.travelGoal;for(let[I,H]of this.enemyRecoil){let G=H-c*l;G<=0?this.enemyRecoil.delete(I):this.enemyRecoil.set(I,G)}let d=r&&e.phase==="run";d!==this.running&&(this.run?.stop(),this.idle?.stop(),(d?this.run:this.idle)?.reset().play(),this.running=d);for(let I of this.heroArms)I.rotation.x+=I.userData.lastRecoil??0;this.mixer?.update(c*(d?1.25:1)),this.environment.update(o?this.age*.55:e.travelDistance,e.level,c);let f=5.05,g=f/Math.min(.45,this.camera.aspect)/Math.tan(rt.degToRad(15)),x=this.cameraLookZ;this.camera.position.set(0,g*.58,x+g*.815),this.camera.lookAt(0,.1,x);let m=this.formationFraming.update(this.camera,o||this.commanderExploded?[]:e.formation,c,this.canvas.clientWidth);this.camera.position.x=m,this.camera.lookAt(m,.1,x),this.shake>0&&r&&!(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1)&&(this.camera.position.x+=(Math.random()-.5)*this.shake,this.camera.position.y+=(Math.random()-.5)*this.shake,this.shake=Math.max(0,this.shake-c*.65));let p=c>0?(e.x-this.previousX)/c:0;this.previousX=e.x,this.hero.position.set(o?0:e.x,a?-.24:d?Math.abs(Math.sin(this.age*11))*.055:0,o?-3.7:0),this.recoil=Math.max(0,this.recoil-c*5),this.model&&(this.model.scale.setScalar(o?1.65:1.43),this.model.rotation.set(a?.75:-this.recoil*.075+this.commanderHitKick*.22,o?Math.PI*.87:Math.PI+rt.clamp(p*.025,-.12,.12),-rt.clamp(p*.025,-.1,.1)+Math.sin(this.age*38)*this.commanderHitKick*.08));for(let I of this.heroArms)I.userData.lastRecoil=this.recoil*.12,I.rotation.x-=I.userData.lastRecoil;this.heroRing.visible=!o,this.hero.visible=!this.commanderExploded,this.formationPositions=[];let v=0,b=0,y=0,A=o||this.commanderExploded?[]:e.formation,R=A.length?A.reduce((I,H)=>I+H.x,0)/A.length:e.x,C=A.length?Math.max(...A.map(I=>Math.abs(I.x-R))):0;if(this.allies){for(let I of A){let H=I.index,G=I.x,se=-I.z;this.formationPositions.push({index:H,x:G,z:se}),this.set(this.allies,v++,G,d?Math.abs(Math.sin(this.age*11+H*1.3))*.075:Math.sin(this.age*23+H)*.012,se,.72,Math.PI+(d?Math.sin(this.age*11+H)*.035:0),.6),this.set(this.shadowInstances,b++,G,.035,se,.95)}this.allies.count=v,this.allies.instanceMatrix.needsUpdate=!0}this.set(this.shadowInstances,b++,this.hero.position.x,.033,this.hero.position.z,2),this.robots.begin();let T=new Set,M=new Set;for(let I of Object.keys(this.emitterPositions))delete this.emitterPositions[I];for(let I of e.targets){if(I.z>90||I.z<-8||o)continue;let H=this.enemyMotion.get(I.id),G=H&&c>0?(I.x-H.x)/c:0,se=H&&c>0?(-I.z-H.z)/c:0,ue=I.stunTime>0?0:l,me=(H?.age??this.hostileAge)+c*ue,Be=I.stunTime>0?H?.yaw??0:I.op===2?Math.atan2(G,Math.max(.01,se)):["tracking","locked","fire"].includes(I.fireState)?Math.atan2(I.aimX-I.x,Math.max(1,I.z)):0,Ye=H?.yaw??Be,ut=Math.atan2(Math.sin(Be-Ye),Math.cos(Be-Ye));if(Ye+=rt.clamp(ut*(1-Math.exp(-c*12)),-c*4,c*4),I.kind==="enemy"&&(M.add(I.id),this.enemyMotion.set(I.id,{x:I.x,z:-I.z,yaw:Ye,age:me})),I.kind==="enemy"&&I.variant===0){this.robots.add(I.x,-I.z,1.02,Be,I.hit>0,(e.timePower==="freeze"&&I.z>=18?this.age:me)+I.id,{id:I.id,dt:c*ue,velocityX:G,velocityZ:se,aimYaw:Be}),b<218&&this.set(this.shadowInstances,b++,I.x,.034,-I.z,1.2);continue}T.add(I.id);let Se=this.views.get(I.id)??this.createView(I);if(Se.group.visible=!0,Se.group.position.set(I.x,0,-I.z),Se.group.scale.setScalar(I.hit>0?1.035:1),I.kind==="gate"){Se.group.scale.x*=(I.size+.1)/1.55,Se.badge.set(I.op===1?"\xD7"+I.value:(I.value>=0?"+":"")+I.value,I.value>=0?"#54ddff":"#ff7755",I.op===1?"MULTIPLY":I.value<0?"SHOOT TO FLIP":"RECRUIT"),Se.bar.visible=!1;for(let q of Se.group.userData.gateTint??[])q.color.set(I.value>=0?1944514:15290168)}else if(I.kind==="orb"){let q=Mu[Ss(I.value)];Se.badge.set(String(Math.ceil(I.hp)),q.color,q.short),Se.bar.scale.x=Math.max(.02,I.hp/I.maxHp),Se.rotor&&_u(Se.rotor,this.age,I.hit>0)}else if(I.kind==="crate")Se.badge.set(String(Math.ceil(I.hp)),"#ffc851","UPGRADE"),Se.bar.scale.x=Math.max(.02,I.hp/I.maxHp),Se.rotor&&(Se.rotor.rotation.y=this.age*.85,Se.rotor.position.y=2.05+Math.sin(this.age*3)*.12);else if(I.kind==="hazard")Se.badge.set("-"+Math.abs(I.value),"#ff795b"),Se.bar.visible=!1,Se.rotor&&(Se.rotor.rotation.x=-e.travelDistance*1.6-this.age*.8,Se.rotor.scale.x=I.size*2/2.3);else if(Se.badge.set(String(Math.ceil(I.hp)),I.guidedArmor?"#d6b875":"#ff8064",I.role==="carrier"&&I.ventOpen?"VENT OPEN":Yv(I)),Se.bar.material.color.set(I.guidedArmor?12688224:16735049),Se.bar.scale.x=Math.max(.02,I.hp/I.maxHp),Se.badge.sprite.position.y=3.05,Se.group.userData.ventOpen=I.role==="carrier"&&I.ventOpen,y<this.elitePool.length){let q=y++,J=this.elitePool[q],_e=["gunner","battery"].includes(I.role)&&["tracking","locked","fire"].includes(I.fireState),Le=this.enemyRecoil.get(I.id)??0,we=_e?Math.sin(me*5+I.id)*.008:Math.sin(me*7+I.id)*Math.min(.025,Math.hypot(G,se)*.006);J.visible=!0,J.position.set(I.x,.02+we,-I.z),J.rotation.set(-Le*.15,Math.PI+Ye,rt.clamp(-G*.018,-.07,.07)),J.scale.setScalar(I.variant===1?1.1:1),J.traverse(D=>{/^Arm_[LR]$/.test(D.name)&&(D.rotation.x=_e?-.12-Le*.25:Math.sin(me*6+I.id)*.1),/^Leg_[LR]$/.test(D.name)&&(D.rotation.x=_e?.015:Math.sin(me*7+I.id+(D.name==="Leg_R"?Math.PI:0))*(I.z>3?.16:.045)),D.name==="Barrel_R"&&(D.rotation.z=-me*(_e?12:6))});let tt=J.getObjectByName("CarrierVulnerability");tt&&(tt.visible=I.role==="carrier"&&I.ventOpen,tt.scale.setScalar(.9+Math.sin(this.age*5)*.06));let xt=this.eliteSockets[q].position("gunner");xt&&(this.emitterPositions["gunner:"+I.id]=xt)}}let _=new Set;for(let I of e.pickups){_.add(I.id);let H=this.pickups.get(I.id);if(!H){let G=vu(I.kind),se=new Fo(1.7),ue=Mu[I.kind];se.set(ue.short,ue.color),se.sprite.position.y=2.15,G.add(se.sprite),H={group:G,badge:se},this.pickups.set(I.id,H),this.scene.add(G)}H.group.visible=!o,H.group.position.set(I.x,0,-I.z),H.badge.sprite.visible=I.z<19&&I.z>-2,_u(H.group,this.age)}for(let[I,H]of this.pickups)_.has(I)||(this.scene.remove(H.group),H.group.remove(H.badge.sprite),H.badge.dispose(),bu(H.group),this.pickups.delete(I));for(let I of this.enemyMotion.keys())M.has(I)||this.enemyMotion.delete(I);this.robots.end();for(let[I,H]of this.views)T.has(I)||(this.disposeView(H),this.views.delete(I));for(let I=y;I<this.elitePool.length;I++)this.elitePool[I].visible=!1;this.boss.visible=(u||o)&&!this.bossExploded,this.boss.position.set(o?0:e.bossX,o?0:e.bossY,o?-12:-e.bossZ),this.boss.scale.setScalar(o?1.25:1.4);let P=e,U=!o&&u&&this.bossAdapter?.apply(P.bossPose)===!0;if(!U){let I=this.bossMotionReady&&c>0?(e.bossX-this.bossPreviousX)/c:0,H=this.bossMotionReady&&c>0?(this.bossPreviousZ-e.bossZ)/c:0;this.bossPreviousX=e.bossX,this.bossPreviousZ=e.bossZ,this.bossMotionReady=!0;let G=sl(I,H,this.bossPreviousVz,c,u&&e.bossY>.12&&(e.bossPartsMask&12)!==12);this.bossPreviousVz=H;let se=1-Math.exp(-c*8);this.bossPitch+=(G.pitch-this.bossPitch)*se,this.bossBank+=(G.roll-this.bossBank)*se,e.empStunTime>0||(this.boss.rotation.x=this.bossPitch-this.bossHitKick*.12+this.bossFireKick*.045,this.boss.rotation.z=this.bossBank,this.boss.rotation.y=u?rt.clamp(Math.atan2((e.bossAction==="windup"||e.bossAction==="fire"?e.bossLane:e.x)-e.bossX,Math.max(6,e.bossZ)),-.32,.32):0);let ue=e.bossState==="rebuilding",me=e.bossState==="exposed",Be=e.bossState==="guarded",Ye=e.phase==="boss"&&e.bossAction==="windup",ut=e.phase==="boss"&&e.bossAction==="fire",Se=e.phase==="lost"||a||ue||me?0:Ye?.02:.16;if(!(e.empStunTime>0))for(let q of this.bossJoints){q.quaternion.copy(q.userData.restQuaternion);let J=q.name.endsWith("R")?Math.PI:0;q.name.startsWith("Leg_")?q.rotation.x+=Math.sin(h*5.5+J)*Se:q.name.startsWith("Knee_")?q.rotation.x+=Math.max(0,Math.sin(h*5.5+J))*(me||ue?.02:.12):q.name.startsWith("Arm_")?(q.rotation.x+=(me?.35:Be?-.2:ue?-.3:Ye?-.18-Math.sin(h*26)*.015:ut?.22:Math.sin(h*3+J)*.055)+this.bossFireKick*.22-this.bossHitKick*.13,Be&&(q.rotation.z+=q.name.endsWith("L")?-.18:.18)):q.name.startsWith("Barrel_")?q.rotation.z-=h*(Ye?15:ut?22:3):q.name==="Head"&&(q.rotation.y+=rt.clamp((e.x-e.bossX)*-.06,-.18,.18))}}this.bossAdapter?.updateRegions(P.bossRegions,!!U&&r&&e.phase==="boss"&&!this.bossExploded,P.bossComponents,e.guardHp),this.arsenal?.update(e,c),this.boss.updateWorldMatrix(!0,!0),this.arsenal?.emitters(this.emitterPositions),this.enemyCues.update(e.targets,r,this.emitterPositions);let z=new Set;for(let I of e.enemyShots){if(this.projectileIDs.has(I.id))continue;let H=I.emitter==="gunner"?"gunner:"+I.sourceId:I.emitter;if(!H||H==="core"||z.has(H))continue;let G=this.emitterPositions[H];G&&r&&(this.fx.muzzle(G.x,G.y,G.z,!0),z.add(H))}if(this.projectileIDs=new Set(e.enemyShots.map(I=>I.id)),this.boss.visible&&this.set(this.shadowInstances,b++,this.boss.position.x,.032,this.boss.position.z,5.5),this.shadowInstances.count=b,this.shadowInstances.instanceMatrix.needsUpdate=!0,this.missiles.update(e.shots,e.enemyShots,{depthScale:1,bossPhase:u,bossZ:e.bossZ,bossX:e.bossX,bossY:e.bossY,bossImpactHeight:4.31,bossSurfaceOffset:.85,bossLaunchHeight:e.bossPattern==="laser"?4.31:e.bossPattern==="heavy"?4.5:3.4,targets:e.targets,formation:e.formation,dt:c,simulationTime:e.time,emitters:this.emitterPositions,bossCharging:e.phase==="boss"&&e.bossPattern==="laser"&&e.bossAction==="windup",bossCharge:e.bossAttack,hostileRate:l,lasers:e.lasers,overdrive:e.ability>0&&e.relic===2,weapon:e.weapon,visible:!o&&e.phase!=="won"&&e.phase!=="lost"}),this.abilities.update(e,{depthScale:1,armyRadius:Math.max(1.5,C+.8),armyCenterZ:1.5,armyCenterX:R,visible:!o&&e.phase!=="won"&&e.phase!=="lost"},c),r&&e.phase!=="destroying"&&this.age-this.lastMuzzle>.14&&e.shots.some(I=>I.z<2.8)){for(let I of this.formationPositions.filter(H=>e.shots.some(G=>G.owner==="troop"&&Math.abs(G.x-H.x)<.15&&G.z+H.z>=0&&G.z+H.z<1.2)).slice(0,8))this.fx.muzzle(I.x,.9,I.z-.3,!1);this.lastMuzzle=this.age,e.shots.some(I=>I.owner!=="troop"&&I.z<2.8)&&(this.recoil=1,this.fx.muzzle(e.x,e.weaponPower==="guided"?2.08:e.weaponPower==="railburst"?1.8:e.weaponPower==="cannons"?1.42:1.35,-.85,!1))}let N=this.abilities.sceneImpact;this.renderer.toneMappingExposure=1.06+N.exposureLift;let B=30*(1-N.zoom);Math.abs(this.camera.fov-B)>1e-4&&(this.camera.fov=B,this.camera.updateProjectionMatrix()),this.fx.update(c);for(let I=this.floating.length-1;I>=0;I--){let H=this.floating[I];H.life-=c,H.y+=c*1.6,H.badge.sprite.position.set(H.x,H.y,H.z),H.badge.sprite.material.opacity=Math.min(1,H.life*3),H.life<=0&&(this.scene.remove(H.badge.sprite),H.badge.dispose(),this.floating.splice(I,1))}i&&this.renderer.render(this.scene,this.camera)}};var ap=document.querySelector("canvas"),hn=new Vo,gt=new al(ap),ee,gn=!1,op=performance.now(),cl=1,As,_r=!1,Bo=!0,Tu,_t,ws=document.querySelector("output"),cp=document.querySelector("#soak-report");document.querySelector("#toggle-tools").addEventListener("click",s=>{let e=document.body.classList.toggle("clean-capture");s.currentTarget.textContent=e?"Show controls":"Hide controls"});var vr=new Map;function lp(){let s=new Set;return gt.scene.traverse(e=>{let t=e;if(!t.geometry)return;let n=t.geometry;if(s.add(n),!vr.has(n)){let i=()=>{vr.delete(n),n.removeEventListener("dispose",i)};n.addEventListener("dispose",i),vr.set(n,{owner:e.name||e.parent?.name||e.type,type:n.type,release:i})}}),[...vr].filter(([e])=>!s.has(e)).map(([e,t])=>({id:e.id,owner:t.owner,type:t.type}))}function Su(){for(let[s,e]of vr)s.removeEventListener("dispose",e.release);vr.clear()}function Zv(s){if(s.phase==="boss"){if(_r&&s.bossState==="exposed")return s.bossX>=0?-3:3;let u=s.bossZ<28?s.bossRegions?.filter(x=>x.vulnerable&&x.hp>0):void 0,d=u?.find(x=>x.id===Tu);!d&&u?.length&&(d=[...u].sort((x,m)=>Math.abs(x.x-s.x)-Math.abs(m.x-s.x))[0],Tu=d.id);let f=Math.max(-3,Math.min(3,d?.x??s.bossX)),g=s.enemyShots.filter(x=>x.z<5.5&&x.dz<-.01).map(x=>({x:x.x-x.dx*x.z/x.dz,size:x.radius+.5}));return s.bossPattern==="laser"&&s.bossAction==="windup"&&s.bossAttack>.6?s.bossLane>0?-2.8:2.8:s.lasers.length?s.lasers[0].endX>0?-2.8:2.8:[f,-2.8,2.8,-1.5,1.5,0].filter(x=>!g.some(m=>Math.abs(x-m.x)<m.size)).sort((x,m)=>Math.abs(x-f)-Math.abs(m-f))[0]??f}if(As){let u=s.pickups.filter(f=>f.kind===As&&f.z<24).sort((f,g)=>f.z-g.z)[0];if(u)return u.x;let d=s.targets.find(f=>f.kind==="orb"&&Ss(f.value)===As&&f.z<29);if(d)return d.x}let e=s.pickups.filter(u=>u.z<6).sort((u,d)=>u.z-d.z)[0],t=s.targets.filter(u=>u.z>1&&u.z<29&&(u.kind==="crate"||u.kind==="gate"||u.kind==="orb"||u.kind==="enemy"&&u.variant>0&&u.z<14)).sort((u,d)=>u.z-d.z),n=e?.x??t[0]?.x??0;function i(u){let d=s.targets.filter(f=>f.kind==="gate"&&Math.abs(f.z-u.z)<.02);return d.sort((f,g)=>(g.op?s.army*(g.value-1):g.value)-(f.op?s.army*(f.value-1):f.value)),d[0]?.x??n}t[0]?.kind==="gate"&&(n=i(t[0]));let r=s.targets.filter(u=>u.kind==="gate"&&u.z>0&&u.z<3.5).sort((u,d)=>u.z-d.z)[0];r&&(n=i(r));let o=s.targets.find(u=>u.kind==="hazard"&&u.z<3&&Math.abs(u.x-n)<u.size+.5);if(o&&(n=o.x>0?-3:3),s.level!==0)return n;let a=Math.max(.4,...s.formation.map(u=>Math.abs(u.x-s.x)+.36)),c=s.enemyShots.filter(u=>u.dz<-.01&&u.z>-4&&u.z<12),l=[Math.max(-3,Math.min(3,n)),-2.8,-1.4,0,1.4,2.8,s.x];function h(u){let d=Math.abs(u-n)*.28+Math.abs(u-s.x)*.08;for(let f of c){let g=Math.max(0,f.z/-f.dz),x=f.x+f.dx*g;Math.abs(u-x)<a+f.radius+.12&&(d+=6/(1+g))}for(let f of s.targets.filter(g=>(g.role==="gunner"||g.role==="battery")&&(g.fireState==="locked"||g.fireState==="fire")&&g.z>3&&g.z<25))Math.abs(u-f.aimX)<a+.45&&(d+=7);for(let f of s.targets.filter(g=>g.kind==="hazard"&&g.z<8&&g.z>-4))Math.abs(u-f.x)<f.size*1.048+a&&(d+=5);return d}return l.sort((u,d)=>h(u)-h(d))[0]}function Hi(s,e=!0,t=!0){if(ee.phase==="lastStand")return;let n=ee.weapon;if(Bo&&ee.energy>=100&&ee.ability<=0&&hn.activate(),hn.step(s,Zv(ee)),ee=hn.snapshot(),e){for(let i of ee.effects)gt.trigger(i,ee);ee.weapon>n&&gt.weaponUpgrade(n,ee.weapon),gt.update(ee,s,"play",t),_t&&lp()}}function At(){Bo=!0,As=void 0,_r=!1,Tu=void 0,hn.start(Number(document.querySelector("#relic").value),Number(document.querySelector("#level").value),Number(document.querySelector("#rank").value)),ee=hn.snapshot(),gt.reset(),gn=!1}document.querySelector("#start").addEventListener("click",()=>{_t=void 0,Su(),Bo=!0,At()});document.querySelector("#pause").addEventListener("click",()=>{gn=!gn});document.querySelector("#step").addEventListener("click",()=>{gn=!0,Hi(1/30)});document.querySelector("#advance").addEventListener("click",()=>{gn=!0;for(let s=0;s<150;s++)Hi(1/30,!0,s===149)});document.querySelector("#second").addEventListener("click",()=>{gn=!0;for(let s=0;s<18;s++)Hi(1/30,!0,s===17)});document.querySelector("#speed").addEventListener("change",s=>cl=Number(s.target.value));document.querySelector("#boss").addEventListener("click",()=>{At();for(let s=0;s<24e3&&ee.phase==="run";s++)Hi(1/60,!1);gt.reset(),gt.update(ee,0,"play"),gn=!0});document.querySelector("#death").addEventListener("click",()=>{At();let s=ee;for(let e=0;e<3e4&&["run","boss"].includes(ee.phase);e++)s=ee,Hi(1/60,!1);gt.reset(),gt.update(s,0,"play");for(let e of ee.effects)gt.trigger(e,ee);gt.update(ee,0,"play"),gn=!0});document.querySelector("#defeat").addEventListener("click",()=>{At();let s=ee;for(let e=0;e<3e4&&["run","boss"].includes(ee.phase);e++)s=ee,hn.step(1/60,0),ee=hn.snapshot();gt.reset(),gt.update(s,0,"play");for(let e of ee.effects)gt.trigger(e,ee);gt.update(ee,0,"play"),gn=!0});function Wt(s){let e=ee;for(let t=0;t<18e3&&["run","boss"].includes(ee.phase)&&!s(ee);t++)e=ee,Hi(1/60,!1);gt.reset(),gt.update(e,0,"play");for(let t of ee.effects)gt.trigger(t,ee);ee.weapon>e.weapon&&gt.weaponUpgrade(e.weapon,ee.weapon),gt.update(ee,.12,"play"),gn=!0}document.querySelector("#core").addEventListener("click",()=>{At(),Wt(s=>s.bossState==="exposed")});document.querySelector("#gunner").addEventListener("click",()=>{At(),Wt(s=>s.targets.some(e=>(e.role==="gunner"||e.role==="battery")&&e.fireState==="locked"&&e.z<25))});document.querySelector("#elite").addEventListener("click",()=>{At(),Wt(s=>s.effects.some(e=>e.kind==="kill"&&(e.variant===1||e.variant===2)))});document.querySelector("#guard").addEventListener("click",()=>{At(),_r=!0,Wt(s=>s.bossState==="guarded"),_r=!1});document.querySelector("#revive").addEventListener("click",()=>{At(),_r=!0,Wt(s=>s.bossState==="rebuilding"),_r=!1});document.querySelector("#collect").addEventListener("click",()=>{At(),As=document.querySelector("#pickup").value,Wt(s=>s.effects.some(e=>e.kind==="pickup"&&Ss(e.value)===As)),As=void 0});document.querySelector("#part").addEventListener("click",()=>{At(),Wt(s=>s.effects.some(e=>e.kind==="bossPartBreak"))});document.querySelector("#part-hit").addEventListener("click",()=>{At(),Wt(s=>s.phase==="boss"&&s.bossZ<18&&s.effects.some(e=>e.kind==="hit"&&e.value>0&&typeof e.hitRegion=="string"))});document.querySelector("#laser").addEventListener("click",()=>{At(),Wt(s=>s.lasers.length>0)});document.querySelector("#arrival").addEventListener("click",()=>{At(),Wt(s=>s.phase==="boss"&&s.bossZ<22&&s.bossZ>13)});document.querySelector("#rockets").addEventListener("click",()=>{At(),Wt(s=>s.phase==="boss"&&s.enemyShots.some(e=>e.kind==="rocket"))});document.querySelector("#shells").addEventListener("click",()=>{At(),Wt(s=>s.enemyShots.some(e=>e.sourceId>0&&e.z<22))});document.querySelector("#charge").addEventListener("click",()=>{At(),Wt(s=>s.phase==="boss"&&s.bossPattern==="laser"&&s.bossAction==="windup"&&s.bossAttack>.7)});document.querySelector("#powered").addEventListener("click",()=>{At(),Wt(s=>s.phase==="boss"&&s.bossZ<22&&s.ability>0&&s.shots.length>0)});document.querySelector("#upgrade").addEventListener("click",()=>{At(),Wt(s=>s.weapon>1)});document.querySelector("#relic-start").addEventListener("click",()=>{At(),Wt(s=>s.ability>0)});document.querySelector("#relic-ready").addEventListener("click",()=>{At(),Bo=!1,Wt(s=>s.energy>=100)});document.querySelector("#activate").addEventListener("click",()=>ll(()=>hn.activate()));document.querySelector("#carrier-open").addEventListener("click",()=>{At(),Wt(s=>s.targets.some(e=>e.role==="carrier"&&e.ventOpen&&e.z<24))});document.querySelector("#shield-impact").addEventListener("click",()=>{document.querySelector("#relic").value="0",At(),Wt(s=>s.effects.some(e=>e.kind==="shieldHit"))});document.querySelector("#soak").addEventListener("click",()=>{Su(),Bo=!0,cl=4,document.querySelector("#speed").value="4",_t={remaining:12,results:[],frames:0,longFrames:0,peakCalls:0,peakTriangles:0,peakGeometries:0,peakTextures:0,started:performance.now()},cp.textContent="Running 12 real-render repeats\u2026",At()});document.querySelector("#stand").addEventListener("click",()=>{At();for(let e=0;e<18e3&&ee.phase==="run";e++)Hi(1/60,!1);let s=ee;for(let e=0;e<18e3&&ee.phase==="boss";e++)s=ee,hn.step(1/60,0),ee=hn.snapshot();gt.reset(),gt.update(s,0,"play");for(let e of ee.effects)gt.trigger(e,ee);gt.update(ee,0,"play"),gn=!0});function ll(s){s(),ee=hn.snapshot();let e=[];for(let t of ee.effects)gt.trigger(t,ee),t.kind==="troopSacrifice"&&e.push({x:t.x,z:-t.z});e.length&&gt.sacrifice(e),gt.update(ee,.15,"play"),gn=!0}document.querySelector("#transfer").addEventListener("click",()=>ll(()=>hn.heal()));document.querySelector("#save").addEventListener("click",()=>ll(()=>hn.revive()));document.querySelector("#decline").addEventListener("click",()=>ll(()=>hn.declineRevive()));await Promise.all([hn.load(),gt.load()]);At();function hp(s){let e=Math.min(.06,(s-op)/1e3);if(op=s,gn)gt.update(ee,0,"paused");else{let i=Math.max(1,Math.ceil(cl));for(let r=0;r<i;r++)Hi(e*cl/i,!0,r===i-1)}ws.textContent=`${ee.phase} \xB7 ${ee.time.toFixed(1)}s \xB7 army ${ee.army} (${ee.formation.length} visible) \xB7 Marshal ${ee.commanderHp.toFixed(0)}HP \xB7 kills ${ee.kills} \xB7 weapon ${ee.weapon} \xB7 ${ee.weaponPower} ${ee.weaponPermanent?"full run":ee.powerTime.toFixed(1)+"s"} \xB7 ${ee.timePower} ${ee.timePowerTime.toFixed(1)}s \xB7 ${ee.bossState} ${ee.bossCoreTime.toFixed(1)}s \xB7 armor ${ee.bossArmor.toFixed(0)} \xB7 core ${ee.bossCoreHp.toFixed(0)} \xB7 broken mask ${ee.bossPartsMask} \xB7 next ${ee.bossPart} \xB7 beams ${ee.lasers.length} \xB7 heal ${ee.canHeal} \xB7 revive ${ee.reviveAvailable} \xB7 revives ${ee.bossRevives} \xB7 phase ${ee.bossPhase} ${ee.bossPattern}`,ws.textContent+=` \xB7 relic active ${ee.ability.toFixed(1)}s \xB7 energy ${ee.energy.toFixed(0)}`,ws.textContent+=` \xB7 EMP stun ${(ee.empStunTime??0).toFixed(1)}s \xB7 escort ${ee.escortShield??0}/${ee.escortMax??30} \xB7 carrier ${ee.targets.filter(i=>i.role==="carrier").map(i=>i.ventOpen?"OPEN":"armored").join(",")||"absent"}`,ws.textContent+=` \xB7 airborne ${ee.bossY.toFixed(2)}m \xB7 enemy rounds ${ee.enemyShots.length} \xB7 ${[...new Set(ee.enemyShots.map(i=>i.emitter??"legacy"))].join(", ")}`,ws.textContent+=` \xB7 attack admission ${ee.safetyAdmitted??0} / deferred ${ee.safetyDeferred??0} / unsupported ${ee.safetyUnsupported??0} / capacity ${ee.safetyCapacity??0}`;let t=ee.bossRegions;t?.length&&(ws.textContent+=` \xB7 vulnerable ${t.filter(i=>i.vulnerable&&i.hp>0).map(i=>i.id+" "+Math.ceil(i.hp)+"HP").join(", ")||"none"}`);let n=gt.renderer.info;ws.textContent+=` \xB7 draw calls ${n.render.calls} \xB7 triangles ${n.render.triangles} \xB7 geometries ${n.memory.geometries} \xB7 textures ${n.memory.textures}`,_t&&(_t.frames++,e>.034&&_t.longFrames++,_t.peakCalls=Math.max(_t.peakCalls,n.render.calls),_t.peakTriangles=Math.max(_t.peakTriangles,n.render.triangles),_t.peakGeometries=Math.max(_t.peakGeometries,n.memory.geometries),_t.peakTextures=Math.max(_t.peakTextures,n.memory.textures),(["won","lost","lastStand"].includes(ee.phase)||ee.time>=240)&&(_t.results.push({result:ee.time>=240?"timeout":ee.phase,seconds:ee.time,rank:Number(document.querySelector("#rank").value),relic:ee.relic,geometries:n.memory.geometries,textures:n.memory.textures,boss:{partsMask:ee.bossPartsMask,coreHp:ee.bossCoreHp,sweepUnresolved:ee.sweepUnresolved??0},attackAdmission:{admitted:ee.safetyAdmitted,deferred:ee.safetyDeferred,unsupported:ee.safetyUnsupported,existingUnsafe:ee.safetyExistingUnsafe,capacity:ee.safetyCapacity,authoredRockets:ee.safetyAuthoredRockets,horizon:ee.safetyHorizon},orphanGeometry:lp()}),_t.remaining--,cp.textContent=JSON.stringify({scope:"Desktop real WebGL replay, 4x simulation speed. Not mobile FPS.",completed:_t.results.length,remaining:_t.remaining,wallSeconds:(performance.now()-_t.started)/1e3,frames:_t.frames,framesAbove34ms:_t.longFrames,peakCalls:_t.peakCalls,peakTriangles:_t.peakTriangles,peakGeometries:_t.peakGeometries,peakTextures:_t.peakTextures,runs:_t.results},null,2),_t.remaining?(document.querySelector("#relic").value=String(_t.results.length%3),At()):(gn=!0,_t=void 0,Su()))),ap.dataset.phase=ee.phase,requestAnimationFrame(hp)}requestAnimationFrame(hp);
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
