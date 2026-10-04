(()=>{var jd=["ready","run","boss","won","lost"],Qd=["enemy","crate","gate","hazard"],ef=["hit","kill","recruit","gate","damage","relic","bossShot","win"],tf=["shell","rocket","orb"],oo=class{api;async load(){let e=await fetch("assault.wasm");if(!e.ok)throw new Error("Combat core could not be loaded.");let t=await WebAssembly.compile(await e.arrayBuffer()),n={};for(let r of WebAssembly.Module.imports(t)){if(r.kind!=="function")throw new Error("Unsupported core import: "+r.name);n[r.module]??={},n[r.module][r.name]=(...o)=>{if(r.name==="proc_exit")throw new Error("Combat core exited: "+o[0]);return 0}}let i=await WebAssembly.instantiate(t,n);this.api=i.exports,this.api._initialize?.()}start(e,t=0){this.api.start_run(e,t)}step(e,t){this.api.step(e,t)}activate(){return!!this.api.use_relic()}pause(e){this.api.set_paused(e?1:0)}read(e,t){return new Float32Array(this.api.memory.buffer,this.api[e](),t)}snapshot(){let e=this.read("state",22).slice(),t=[],n=[],i=[],r=[],o=this.read("targets",this.api.target_count()*11);for(let _=0;_<o.length;_+=11)t.push({id:o[_],kind:Qd[o[_+1]],x:o[_+2],z:o[_+3],hp:o[_+4],maxHp:o[_+5],value:o[_+6],op:o[_+7],size:o[_+8],hit:o[_+9],variant:o[_+10]});let a=this.read("shots",this.api.shot_count()*3);for(let _=0;_<a.length;_+=3)n.push({x:a[_],z:a[_+1],heavy:!!a[_+2]});let c=this.read("enemy_shots",this.api.enemy_shot_count()*8);for(let _=0;_<c.length;_+=8)i.push({id:c[_],x:c[_+1],z:c[_+2],dx:c[_+3],dz:c[_+4],radius:c[_+5],kind:tf[c[_+6]]});let l=this.api.effect_count(),u=this.read("drain_effects",l*6);for(let _=0;_<u.length;_+=6)r.push({id:u[_],kind:ef[u[_+1]],x:u[_+2],z:u[_+3],value:u[_+4]});let h=new Uint8Array(this.api.memory.buffer),d=this.api.level_name(),f=d;for(;f<h.length&&h[f]!==0;)++f;let g=new TextDecoder().decode(h.subarray(d,f));return{phase:jd[e[0]],time:e[1],duration:e[2],level:e[18],levelName:g,x:e[3],army:e[4],energy:e[5],ability:e[6],relic:e[7],weapon:e[8],weaponXP:e[19],weaponNeed:e[20],kills:e[9],bossHp:e[10],bossMax:e[11],bossAttack:e[12],bossLane:e[13],score:e[14],targets:t,shots:n,enemyShots:i,effects:r}}};var au=0,Yc=1,cu=2;var Zc=1,na=2,Nn=3,_n=0,Ht=1,bt=2,Qn=0,Ai=1,Bs=2,Kc=3,$c=4,lu=5,li=100,hu=101,uu=102,du=103,fu=104,pu=200,mu=201,gu=202,_u=203,Fo=204,Oo=205,xu=206,yu=207,vu=208,Mu=209,Su=210,bu=211,Tu=212,wu=213,Eu=214,ia=0,sa=1,ra=2,Ri=3,oa=4,aa=5,ca=6,la=7,Jc=0,Au=1,Ru=2,ei=0,Cu=1,Iu=2,Pu=3,ha=4,Lu=5,Du=6,Nu=7,zc="attached",Uu="detached",jc=300,Oi=301,Bi=302,ua=303,da=304,Xr=306,An=1e3,wn=1001,_s=1002,Ct=1003,fa=1004;var zi=1005;var kt=1006,zs=1007;var Mn=1008;var Sn=1009,Qc=1010,el=1011,ks=1012,pa=1013,pi=1014,an=1015,Vs=1016,ma=1017,ga=1018,Hs=1020,tl=35902,nl=35899,il=1021,sl=1022,tn=1023,xs=1026,Gs=1027,_a=1028,xa=1029,rl=1030,ya=1031;var va=1033,qr=33776,Yr=33777,Zr=33778,Kr=33779,Ma=35840,Sa=35841,ba=35842,Ta=35843,wa=36196,Ea=37492,Aa=37496,Ra=37808,Ca=37809,Ia=37810,Pa=37811,La=37812,Da=37813,Na=37814,Ua=37815,Fa=37816,Oa=37817,Ba=37818,za=37819,ka=37820,Va=37821,Ha=36492,Ga=36494,Wa=36495,Xa=36283,qa=36284,Ya=36285,Za=36286,Fu=2200,Ou=2201,Bu=2202,Ci=2300,Ii=2301,Uo=2302,wi=2400,Ei=2401,dr=2402,Ka=2500,zu=2501,ol=0,$r=1,Ws=2,ku=3200,Vu=3201;var al=0,Hu=1,ti="",mt="srgb",It="srgb-linear",fr="linear",et="srgb";var Ti=7680;var kc=519,Gu=512,Wu=513,Xu=514,cl=515,qu=516,Yu=517,Zu=518,Ku=519,Bo=35044;var ll="300 es",mn=2e3,pr=2001;var Rn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let i=n[e];if(i!==void 0){let r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,e);e.target=null}}},Dt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],bh=1234567,hr=Math.PI/180,Pi=180/Math.PI;function gn(){let s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Dt[s&255]+Dt[s>>8&255]+Dt[s>>16&255]+Dt[s>>24&255]+"-"+Dt[e&255]+Dt[e>>8&255]+"-"+Dt[e>>16&15|64]+Dt[e>>24&255]+"-"+Dt[t&63|128]+Dt[t>>8&255]+"-"+Dt[t>>16&255]+Dt[t>>24&255]+Dt[n&255]+Dt[n>>8&255]+Dt[n>>16&255]+Dt[n>>24&255]).toLowerCase()}function Ve(s,e,t){return Math.max(e,Math.min(t,s))}function hl(s,e){return(s%e+e)%e}function nf(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function sf(s,e,t){return s!==e?(t-s)/(e-s):0}function ur(s,e,t){return(1-t)*s+t*e}function rf(s,e,t,n){return ur(s,e,1-Math.exp(-t*n))}function of(s,e=1){return e-Math.abs(hl(s,e*2)-e)}function af(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function cf(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function lf(s,e){return s+Math.floor(Math.random()*(e-s+1))}function hf(s,e){return s+Math.random()*(e-s)}function uf(s){return s*(.5-Math.random())}function df(s){s!==void 0&&(bh=s);let e=bh+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function ff(s){return s*hr}function pf(s){return s*Pi}function mf(s){return(s&s-1)===0&&s!==0}function gf(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function _f(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function xf(s,e,t,n,i){let r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),l=r((e+n)/2),u=o((e+n)/2),h=r((e-n)/2),d=o((e-n)/2),f=r((n-e)/2),g=o((n-e)/2);switch(i){case"XYX":s.set(a*u,c*h,c*d,a*l);break;case"YZY":s.set(c*d,a*u,c*h,a*l);break;case"ZXZ":s.set(c*h,c*d,a*u,a*l);break;case"XZX":s.set(a*u,c*g,c*f,a*l);break;case"YXY":s.set(c*f,a*u,c*g,a*l);break;case"ZYZ":s.set(c*g,c*f,a*u,a*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function pn(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function Qe(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}var ul={DEG2RAD:hr,RAD2DEG:Pi,generateUUID:gn,clamp:Ve,euclideanModulo:hl,mapLinear:nf,inverseLerp:sf,lerp:ur,damp:rf,pingpong:of,smoothstep:af,smootherstep:cf,randInt:lf,randFloat:hf,randFloatSpread:uf,seededRandom:df,degToRad:ff,radToDeg:pf,isPowerOfTwo:mf,ceilPowerOfTwo:gf,floorPowerOfTwo:_f,setQuaternionFromProperEuler:xf,normalize:Qe,denormalize:pn},Ae=class s{constructor(e=0,t=0){s.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ve(this.x,e.x,t.x),this.y=Ve(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ve(this.x,e,t),this.y=Ve(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ve(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ve(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*i+e.x,this.y=r*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},zt=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,o,a){let c=n[i+0],l=n[i+1],u=n[i+2],h=n[i+3],d=r[o+0],f=r[o+1],g=r[o+2],_=r[o+3];if(a===0){e[t+0]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=g,e[t+3]=_;return}if(h!==_||c!==d||l!==f||u!==g){let m=1-a,p=c*d+l*f+u*g+h*_,b=p>=0?1:-1,w=1-p*p;if(w>Number.EPSILON){let C=Math.sqrt(w),A=Math.atan2(C,p*b);m=Math.sin(m*A)/C,a=Math.sin(a*A)/C}let v=a*b;if(c=c*m+d*v,l=l*m+f*v,u=u*m+g*v,h=h*m+_*v,m===1-a){let C=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=C,l*=C,u*=C,h*=C}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,i,r,o){let a=n[i],c=n[i+1],l=n[i+2],u=n[i+3],h=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+u*h+c*f-l*d,e[t+1]=c*g+u*d+l*h-a*f,e[t+2]=l*g+u*f+a*d-c*h,e[t+3]=u*g-a*h-c*d-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,i=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(n/2),u=a(i/2),h=a(r/2),d=c(n/2),f=c(i/2),g=c(r/2);switch(o){case"XYZ":this._x=d*u*h+l*f*g,this._y=l*f*h-d*u*g,this._z=l*u*g+d*f*h,this._w=l*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+l*f*g,this._y=l*f*h-d*u*g,this._z=l*u*g-d*f*h,this._w=l*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-l*f*g,this._y=l*f*h+d*u*g,this._z=l*u*g+d*f*h,this._w=l*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-l*f*g,this._y=l*f*h+d*u*g,this._z=l*u*g-d*f*h,this._w=l*u*h+d*f*g;break;case"YZX":this._x=d*u*h+l*f*g,this._y=l*f*h+d*u*g,this._z=l*u*g-d*f*h,this._w=l*u*h-d*f*g;break;case"XZY":this._x=d*u*h-l*f*g,this._y=l*f*h-d*u*g,this._z=l*u*g+d*f*h,this._w=l*u*h+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],u=t[6],h=t[10],d=n+a+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-c)*f,this._y=(r-l)*f,this._z=(o-i)*f}else if(n>a&&n>h){let f=2*Math.sqrt(1+n-a-h);this._w=(u-c)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(r+l)/f}else if(a>h){let f=2*Math.sqrt(1+a-n-h);this._w=(r-l)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(c+u)/f}else{let f=2*Math.sqrt(1+h-n-a);this._w=(o-i)/f,this._x=(r+l)/f,this._y=(c+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ve(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,i=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,u=t._w;return this._x=n*u+o*a+i*l-r*c,this._y=i*u+o*c+r*a-n*l,this._z=r*u+o*l+n*c-i*a,this._w=o*u-n*a-i*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,i=this._y,r=this._z,o=this._w,a=o*e._w+n*e._x+i*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=i,this._z=r,this;let c=1-a*a;if(c<=Number.EPSILON){let f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*i+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}let l=Math.sqrt(c),u=Math.atan2(l,a),h=Math.sin((1-t)*u)/l,d=Math.sin(t*u)/l;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=i*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},L=class s{constructor(e=0,t=0,n=0){s.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Th.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Th.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*i-a*n),u=2*(a*t-r*i),h=2*(r*n-o*t);return this.x=t+c*l+o*h-a*u,this.y=n+c*u+a*l-r*h,this.z=i+c*h+r*u-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ve(this.x,e.x,t.x),this.y=Ve(this.y,e.y,t.y),this.z=Ve(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ve(this.x,e,t),this.y=Ve(this.y,e,t),this.z=Ve(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ve(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,i=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=i*c-r*a,this.y=r*o-n*c,this.z=n*a-i*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return uc.copy(this).projectOnVector(e),this.sub(uc)}reflect(e){return this.sub(uc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ve(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},uc=new L,Th=new zt,Fe=class s{constructor(e,t,n,i,r,o,a,c,l){s.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,c,l)}set(e,t,n,i,r,o,a,c,l){let u=this.elements;return u[0]=e,u[1]=i,u[2]=a,u[3]=t,u[4]=r,u[5]=c,u[6]=n,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],u=n[4],h=n[7],d=n[2],f=n[5],g=n[8],_=i[0],m=i[3],p=i[6],b=i[1],w=i[4],v=i[7],C=i[2],A=i[5],S=i[8];return r[0]=o*_+a*b+c*C,r[3]=o*m+a*w+c*A,r[6]=o*p+a*v+c*S,r[1]=l*_+u*b+h*C,r[4]=l*m+u*w+h*A,r[7]=l*p+u*v+h*S,r[2]=d*_+f*b+g*C,r[5]=d*m+f*w+g*A,r[8]=d*p+f*v+g*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8];return t*o*u-t*a*l-n*r*u+n*a*c+i*r*l-i*o*c}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=u*o-a*l,d=a*c-u*r,f=l*r-o*c,g=t*h+n*d+i*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return e[0]=h*_,e[1]=(i*l-u*n)*_,e[2]=(a*n-i*o)*_,e[3]=d*_,e[4]=(u*t-i*c)*_,e[5]=(i*r-a*t)*_,e[6]=f*_,e[7]=(n*c-l*t)*_,e[8]=(o*t-n*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,o,a){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+e,-i*l,i*c,-i*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(dc.makeScale(e,t)),this}rotate(e){return this.premultiply(dc.makeRotation(-e)),this}translate(e,t){return this.premultiply(dc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},dc=new Fe;function dl(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function ys(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function $u(){let s=ys("canvas");return s.style.display="block",s}var wh={};function vs(s){s in wh||(wh[s]=!0,console.warn(s))}function Ju(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Eh=new Fe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ah=new Fe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function yf(){let s={enabled:!0,workingColorSpace:It,spaces:{},convert:function(i,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===et&&(i.r=Yn(i.r),i.g=Yn(i.g),i.b=Yn(i.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===et&&(i.r=gs(i.r),i.g=gs(i.g),i.b=gs(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===ti?fr:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,o){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return vs("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return vs("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[It]:{primaries:e,whitePoint:n,transfer:fr,toXYZ:Eh,fromXYZ:Ah,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:mt},outputColorSpaceConfig:{drawingBufferColorSpace:mt}},[mt]:{primaries:e,whitePoint:n,transfer:et,toXYZ:Eh,fromXYZ:Ah,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:mt}}}),s}var We=yf();function Yn(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function gs(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var ji,zo=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ji===void 0&&(ji=ys("canvas")),ji.width=e.width,ji.height=e.height;let i=ji.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=ji}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ys("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=Yn(r[o]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Yn(t[n]/255)*255):t[n]=Yn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},vf=0,Ms=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:vf++}),this.uuid=gn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(fc(i[o].image)):r.push(fc(i[o]))}else r=fc(i);n.url=r}return t||(e.images[this.uuid]=n),n}};function fc(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?zo.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Mf=0,pc=new L,St=class s extends Rn{constructor(e=s.DEFAULT_IMAGE,t=s.DEFAULT_MAPPING,n=wn,i=wn,r=kt,o=Mn,a=tn,c=Sn,l=s.DEFAULT_ANISOTROPY,u=ti){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Mf++}),this.uuid=gn(),this.name="",this.source=new Ms(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new Ae(0,0),this.repeat=new Ae(1,1),this.center=new Ae(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Fe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(pc).x}get height(){return this.source.getSize(pc).y}get depth(){return this.source.getSize(pc).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==jc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case An:e.x=e.x-Math.floor(e.x);break;case wn:e.x=e.x<0?0:1;break;case _s:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case An:e.y=e.y-Math.floor(e.y);break;case wn:e.y=e.y<0?0:1;break;case _s:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};St.DEFAULT_IMAGE=null;St.DEFAULT_MAPPING=jc;St.DEFAULT_ANISOTROPY=1;var $e=class s{constructor(e=0,t=0,n=0,i=1){s.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r,c=e.elements,l=c[0],u=c[4],h=c[8],d=c[1],f=c[5],g=c[9],_=c[2],m=c[6],p=c[10];if(Math.abs(u-d)<.01&&Math.abs(h-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+_)<.1&&Math.abs(g+m)<.1&&Math.abs(l+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let w=(l+1)/2,v=(f+1)/2,C=(p+1)/2,A=(u+d)/4,S=(h+_)/4,R=(g+m)/4;return w>v&&w>C?w<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(w),i=A/n,r=S/n):v>C?v<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(v),n=A/i,r=R/i):C<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(C),n=S/r,i=R/r),this.set(n,i,r,t),this}let b=Math.sqrt((m-g)*(m-g)+(h-_)*(h-_)+(d-u)*(d-u));return Math.abs(b)<.001&&(b=1),this.x=(m-g)/b,this.y=(h-_)/b,this.z=(d-u)/b,this.w=Math.acos((l+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ve(this.x,e.x,t.x),this.y=Ve(this.y,e.y,t.y),this.z=Ve(this.z,e.z,t.z),this.w=Ve(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ve(this.x,e,t),this.y=Ve(this.y,e,t),this.z=Ve(this.z,e,t),this.w=Ve(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ve(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ko=class extends Rn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:kt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new $e(0,0,e,t),this.scissorTest=!1,this.viewport=new $e(0,0,e,t);let i={width:e,height:t,depth:n.depth},r=new St(i);this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:kt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isArrayTexture=this.textures[i].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let i=Object.assign({},e.textures[t].image);this.textures[t].source=new Ms(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Cn=class extends ko{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},mr=class extends St{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Ct,this.minFilter=Ct,this.wrapR=wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Vo=class extends St{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Ct,this.minFilter=Ct,this.wrapR=wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var en=class{constructor(e=new L(1/0,1/0,1/0),t=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(un.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(un.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=un.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,un):un.fromBufferAttribute(r,o),un.applyMatrix4(e.matrixWorld),this.expandByPoint(un);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ao.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ao.copy(n.boundingBox)),ao.applyMatrix4(e.matrixWorld),this.union(ao)}let i=e.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,un),un.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Qs),co.subVectors(this.max,Qs),Qi.subVectors(e.a,Qs),es.subVectors(e.b,Qs),ts.subVectors(e.c,Qs),ii.subVectors(es,Qi),si.subVectors(ts,es),vi.subVectors(Qi,ts);let t=[0,-ii.z,ii.y,0,-si.z,si.y,0,-vi.z,vi.y,ii.z,0,-ii.x,si.z,0,-si.x,vi.z,0,-vi.x,-ii.y,ii.x,0,-si.y,si.x,0,-vi.y,vi.x,0];return!mc(t,Qi,es,ts,co)||(t=[1,0,0,0,1,0,0,0,1],!mc(t,Qi,es,ts,co))?!1:(lo.crossVectors(ii,si),t=[lo.x,lo.y,lo.z],mc(t,Qi,es,ts,co))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,un).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(un).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(kn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),kn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),kn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),kn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),kn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),kn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),kn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),kn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(kn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},kn=[new L,new L,new L,new L,new L,new L,new L,new L],un=new L,ao=new en,Qi=new L,es=new L,ts=new L,ii=new L,si=new L,vi=new L,Qs=new L,co=new L,lo=new L,Mi=new L;function mc(s,e,t,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){Mi.fromArray(s,r);let a=i.x*Math.abs(Mi.x)+i.y*Math.abs(Mi.y)+i.z*Math.abs(Mi.z),c=e.dot(Mi),l=t.dot(Mi),u=n.dot(Mi);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}var Sf=new en,er=new L,gc=new L,Wt=class{constructor(e=new L,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Sf.setFromPoints(e).getCenter(n);let i=0;for(let r=0,o=e.length;r<o;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;er.subVectors(e,this.center);let t=er.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(er,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(gc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(er.copy(e.center).add(gc)),this.expandByPoint(er.copy(e.center).sub(gc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Vn=new L,_c=new L,ho=new L,ri=new L,xc=new L,uo=new L,yc=new L,Li=class{constructor(e=new L,t=new L(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Vn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Vn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Vn.copy(this.origin).addScaledVector(this.direction,t),Vn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){_c.copy(e).add(t).multiplyScalar(.5),ho.copy(t).sub(e).normalize(),ri.copy(this.origin).sub(_c);let r=e.distanceTo(t)*.5,o=-this.direction.dot(ho),a=ri.dot(this.direction),c=-ri.dot(ho),l=ri.lengthSq(),u=Math.abs(1-o*o),h,d,f,g;if(u>0)if(h=o*c-a,d=o*a-c,g=r*u,h>=0)if(d>=-g)if(d<=g){let _=1/u;h*=_,d*=_,f=h*(h+o*d+2*a)+d*(o*h+d+2*c)+l}else d=r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;else d=-r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;else d<=-g?(h=Math.max(0,-(-o*r+a)),d=h>0?-r:Math.min(Math.max(-r,-c),r),f=-h*h+d*(d+2*c)+l):d<=g?(h=0,d=Math.min(Math.max(-r,-c),r),f=d*(d+2*c)+l):(h=Math.max(0,-(o*r+a)),d=h>0?r:Math.min(Math.max(-r,-c),r),f=-h*h+d*(d+2*c)+l);else d=o>0?-r:r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,h),i&&i.copy(_c).addScaledVector(ho,d),f}intersectSphere(e,t){Vn.subVectors(e.center,this.origin);let n=Vn.dot(this.direction),i=Vn.dot(Vn)-n*n,r=e.radius*e.radius;if(i>r)return null;let o=Math.sqrt(r-i),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,o,a,c,l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return l>=0?(n=(e.min.x-d.x)*l,i=(e.max.x-d.x)*l):(n=(e.max.x-d.x)*l,i=(e.min.x-d.x)*l),u>=0?(r=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),h>=0?(a=(e.min.z-d.z)*h,c=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,c=(e.min.z-d.z)*h),n>c||a>i)||((a>n||n!==n)&&(n=a),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Vn)!==null}intersectTriangle(e,t,n,i,r){xc.subVectors(t,e),uo.subVectors(n,e),yc.crossVectors(xc,uo);let o=this.direction.dot(yc),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;ri.subVectors(this.origin,e);let c=a*this.direction.dot(uo.crossVectors(ri,uo));if(c<0)return null;let l=a*this.direction.dot(xc.cross(ri));if(l<0||c+l>o)return null;let u=-a*ri.dot(yc);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ue=class s{constructor(e,t,n,i,r,o,a,c,l,u,h,d,f,g,_,m){s.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,c,l,u,h,d,f,g,_,m)}set(e,t,n,i,r,o,a,c,l,u,h,d,f,g,_,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=r,p[5]=o,p[9]=a,p[13]=c,p[2]=l,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new s().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,i=1/ns.setFromMatrixColumn(e,0).length(),r=1/ns.setFromMatrixColumn(e,1).length(),o=1/ns.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,i=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(i),l=Math.sin(i),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let d=o*u,f=o*h,g=a*u,_=a*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=f+g*l,t[5]=d-_*l,t[9]=-a*c,t[2]=_-d*l,t[6]=g+f*l,t[10]=o*c}else if(e.order==="YXZ"){let d=c*u,f=c*h,g=l*u,_=l*h;t[0]=d+_*a,t[4]=g*a-f,t[8]=o*l,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=f*a-g,t[6]=_+d*a,t[10]=o*c}else if(e.order==="ZXY"){let d=c*u,f=c*h,g=l*u,_=l*h;t[0]=d-_*a,t[4]=-o*h,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*u,t[9]=_-d*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){let d=o*u,f=o*h,g=a*u,_=a*h;t[0]=c*u,t[4]=g*l-f,t[8]=d*l+_,t[1]=c*h,t[5]=_*l+d,t[9]=f*l-g,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){let d=o*c,f=o*l,g=a*c,_=a*l;t[0]=c*u,t[4]=_-d*h,t[8]=g*h+f,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-l*u,t[6]=f*h+g,t[10]=d-_*h}else if(e.order==="XZY"){let d=o*c,f=o*l,g=a*c,_=a*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=d*h+_,t[5]=o*u,t[9]=f*h-g,t[2]=g*h-f,t[6]=a*u,t[10]=_*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(bf,e,Tf)}lookAt(e,t,n){let i=this.elements;return jt.subVectors(e,t),jt.lengthSq()===0&&(jt.z=1),jt.normalize(),oi.crossVectors(n,jt),oi.lengthSq()===0&&(Math.abs(n.z)===1?jt.x+=1e-4:jt.z+=1e-4,jt.normalize(),oi.crossVectors(n,jt)),oi.normalize(),fo.crossVectors(jt,oi),i[0]=oi.x,i[4]=fo.x,i[8]=jt.x,i[1]=oi.y,i[5]=fo.y,i[9]=jt.y,i[2]=oi.z,i[6]=fo.z,i[10]=jt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],u=n[1],h=n[5],d=n[9],f=n[13],g=n[2],_=n[6],m=n[10],p=n[14],b=n[3],w=n[7],v=n[11],C=n[15],A=i[0],S=i[4],R=i[8],x=i[12],M=i[1],P=i[5],U=i[9],B=i[13],H=i[2],q=i[6],W=i[10],te=i[14],V=i[3],oe=i[7],he=i[11],be=i[15];return r[0]=o*A+a*M+c*H+l*V,r[4]=o*S+a*P+c*q+l*oe,r[8]=o*R+a*U+c*W+l*he,r[12]=o*x+a*B+c*te+l*be,r[1]=u*A+h*M+d*H+f*V,r[5]=u*S+h*P+d*q+f*oe,r[9]=u*R+h*U+d*W+f*he,r[13]=u*x+h*B+d*te+f*be,r[2]=g*A+_*M+m*H+p*V,r[6]=g*S+_*P+m*q+p*oe,r[10]=g*R+_*U+m*W+p*he,r[14]=g*x+_*B+m*te+p*be,r[3]=b*A+w*M+v*H+C*V,r[7]=b*S+w*P+v*q+C*oe,r[11]=b*R+w*U+v*W+C*he,r[15]=b*x+w*B+v*te+C*be,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],u=e[2],h=e[6],d=e[10],f=e[14],g=e[3],_=e[7],m=e[11],p=e[15];return g*(+r*c*h-i*l*h-r*a*d+n*l*d+i*a*f-n*c*f)+_*(+t*c*f-t*l*d+r*o*d-i*o*f+i*l*u-r*c*u)+m*(+t*l*h-t*a*f-r*o*h+n*o*f+r*a*u-n*l*u)+p*(-i*a*u-t*c*h+t*a*d+i*o*h-n*o*d+n*c*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=e[9],d=e[10],f=e[11],g=e[12],_=e[13],m=e[14],p=e[15],b=h*m*l-_*d*l+_*c*f-a*m*f-h*c*p+a*d*p,w=g*d*l-u*m*l-g*c*f+o*m*f+u*c*p-o*d*p,v=u*_*l-g*h*l+g*a*f-o*_*f-u*a*p+o*h*p,C=g*h*c-u*_*c-g*a*d+o*_*d+u*a*m-o*h*m,A=t*b+n*w+i*v+r*C;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/A;return e[0]=b*S,e[1]=(_*d*r-h*m*r-_*i*f+n*m*f+h*i*p-n*d*p)*S,e[2]=(a*m*r-_*c*r+_*i*l-n*m*l-a*i*p+n*c*p)*S,e[3]=(h*c*r-a*d*r-h*i*l+n*d*l+a*i*f-n*c*f)*S,e[4]=w*S,e[5]=(u*m*r-g*d*r+g*i*f-t*m*f-u*i*p+t*d*p)*S,e[6]=(g*c*r-o*m*r-g*i*l+t*m*l+o*i*p-t*c*p)*S,e[7]=(o*d*r-u*c*r+u*i*l-t*d*l-o*i*f+t*c*f)*S,e[8]=v*S,e[9]=(g*h*r-u*_*r-g*n*f+t*_*f+u*n*p-t*h*p)*S,e[10]=(o*_*r-g*a*r+g*n*l-t*_*l-o*n*p+t*a*p)*S,e[11]=(u*a*r-o*h*r-u*n*l+t*h*l+o*n*f-t*a*f)*S,e[12]=C*S,e[13]=(u*_*i-g*h*i+g*n*d-t*_*d-u*n*m+t*h*m)*S,e[14]=(g*a*i-o*_*i-g*n*c+t*_*c+o*n*m-t*a*m)*S,e[15]=(o*h*i-u*a*i+u*n*c-t*h*c-o*n*d+t*a*d)*S,this}scale(e){let t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),r=1-n,o=e.x,a=e.y,c=e.z,l=r*o,u=r*a;return this.set(l*o+n,l*a-i*c,l*c+i*a,0,l*a+i*c,u*a+n,u*c-i*o,0,l*c-i*a,u*c+i*o,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,o){return this.set(1,n,r,0,e,1,o,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,u=o+o,h=a+a,d=r*l,f=r*u,g=r*h,_=o*u,m=o*h,p=a*h,b=c*l,w=c*u,v=c*h,C=n.x,A=n.y,S=n.z;return i[0]=(1-(_+p))*C,i[1]=(f+v)*C,i[2]=(g-w)*C,i[3]=0,i[4]=(f-v)*A,i[5]=(1-(d+p))*A,i[6]=(m+b)*A,i[7]=0,i[8]=(g+w)*S,i[9]=(m-b)*S,i[10]=(1-(d+_))*S,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements,r=ns.set(i[0],i[1],i[2]).length(),o=ns.set(i[4],i[5],i[6]).length(),a=ns.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),e.x=i[12],e.y=i[13],e.z=i[14],dn.copy(this);let l=1/r,u=1/o,h=1/a;return dn.elements[0]*=l,dn.elements[1]*=l,dn.elements[2]*=l,dn.elements[4]*=u,dn.elements[5]*=u,dn.elements[6]*=u,dn.elements[8]*=h,dn.elements[9]*=h,dn.elements[10]*=h,t.setFromRotationMatrix(dn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,i,r,o,a=mn,c=!1){let l=this.elements,u=2*r/(t-e),h=2*r/(n-i),d=(t+e)/(t-e),f=(n+i)/(n-i),g,_;if(c)g=r/(o-r),_=o*r/(o-r);else if(a===mn)g=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===pr)g=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,r,o,a=mn,c=!1){let l=this.elements,u=2/(t-e),h=2/(n-i),d=-(t+e)/(t-e),f=-(n+i)/(n-i),g,_;if(c)g=1/(o-r),_=o/(o-r);else if(a===mn)g=-2/(o-r),_=-(o+r)/(o-r);else if(a===pr)g=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=h,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=g,l[14]=_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},ns=new L,dn=new Ue,bf=new L(0,0,0),Tf=new L(1,1,1),oi=new L,fo=new L,jt=new L,Rh=new Ue,Ch=new zt,xn=class s{constructor(e=0,t=0,n=0,i=s.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,r=i[0],o=i[4],a=i[8],c=i[1],l=i[5],u=i[9],h=i[2],d=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(Ve(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Ve(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ve(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Ve(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(Ve(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Ve(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Rh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Rh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ch.setFromEuler(this),this.setFromQuaternion(Ch,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};xn.DEFAULT_ORDER="XYZ";var gr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},wf=0,Ih=new L,is=new zt,Hn=new Ue,po=new L,tr=new L,Ef=new L,Af=new zt,Ph=new L(1,0,0),Lh=new L(0,1,0),Dh=new L(0,0,1),Nh={type:"added"},Rf={type:"removed"},ss={type:"childadded",child:null},vc={type:"childremoved",child:null},rt=class s extends Rn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:wf++}),this.uuid=gn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let e=new L,t=new xn,n=new zt,i=new L(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Ue},normalMatrix:{value:new Fe}}),this.matrix=new Ue,this.matrixWorld=new Ue,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new gr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return is.setFromAxisAngle(e,t),this.quaternion.multiply(is),this}rotateOnWorldAxis(e,t){return is.setFromAxisAngle(e,t),this.quaternion.premultiply(is),this}rotateX(e){return this.rotateOnAxis(Ph,e)}rotateY(e){return this.rotateOnAxis(Lh,e)}rotateZ(e){return this.rotateOnAxis(Dh,e)}translateOnAxis(e,t){return Ih.copy(e).applyQuaternion(this.quaternion),this.position.add(Ih.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ph,e)}translateY(e){return this.translateOnAxis(Lh,e)}translateZ(e){return this.translateOnAxis(Dh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Hn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?po.copy(e):po.set(e,t,n);let i=this.parent;this.updateWorldMatrix(!0,!1),tr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Hn.lookAt(tr,po,this.up):Hn.lookAt(po,tr,this.up),this.quaternion.setFromRotationMatrix(Hn),i&&(Hn.extractRotation(i.matrixWorld),is.setFromRotationMatrix(Hn),this.quaternion.premultiply(is.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Nh),ss.child=e,this.dispatchEvent(ss),ss.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Rf),vc.child=e,this.dispatchEvent(vc),vc.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Hn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Hn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Hn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Nh),ss.child=e,this.dispatchEvent(ss),ss.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tr,e,Ef),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tr,Af,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(a=>({...a})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){let h=c[l];r(e.shapes,h)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));i.material=a}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];i.animations.push(r(e.animations,c))}}if(t){let a=o(e.geometries),c=o(e.materials),l=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){let c=[];for(let l in a){let u=a[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}};rt.DEFAULT_UP=new L(0,1,0);rt.DEFAULT_MATRIX_AUTO_UPDATE=!0;rt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var fn=new L,Gn=new L,Mc=new L,Wn=new L,rs=new L,os=new L,Uh=new L,Sc=new L,bc=new L,Tc=new L,wc=new $e,Ec=new $e,Ac=new $e,qn=class s{constructor(e=new L,t=new L,n=new L){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),fn.subVectors(e,t),i.cross(fn);let r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){fn.subVectors(i,t),Gn.subVectors(n,t),Mc.subVectors(e,t);let o=fn.dot(fn),a=fn.dot(Gn),c=fn.dot(Mc),l=Gn.dot(Gn),u=Gn.dot(Mc),h=o*l-a*a;if(h===0)return r.set(0,0,0),null;let d=1/h,f=(l*c-a*u)*d,g=(o*u-a*c)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Wn)===null?!1:Wn.x>=0&&Wn.y>=0&&Wn.x+Wn.y<=1}static getInterpolation(e,t,n,i,r,o,a,c){return this.getBarycoord(e,t,n,i,Wn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Wn.x),c.addScaledVector(o,Wn.y),c.addScaledVector(a,Wn.z),c)}static getInterpolatedAttribute(e,t,n,i,r,o){return wc.setScalar(0),Ec.setScalar(0),Ac.setScalar(0),wc.fromBufferAttribute(e,t),Ec.fromBufferAttribute(e,n),Ac.fromBufferAttribute(e,i),o.setScalar(0),o.addScaledVector(wc,r.x),o.addScaledVector(Ec,r.y),o.addScaledVector(Ac,r.z),o}static isFrontFacing(e,t,n,i){return fn.subVectors(n,t),Gn.subVectors(e,t),fn.cross(Gn).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return fn.subVectors(this.c,this.b),Gn.subVectors(this.a,this.b),fn.cross(Gn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return s.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return s.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return s.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return s.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return s.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,r=this.c,o,a;rs.subVectors(i,n),os.subVectors(r,n),Sc.subVectors(e,n);let c=rs.dot(Sc),l=os.dot(Sc);if(c<=0&&l<=0)return t.copy(n);bc.subVectors(e,i);let u=rs.dot(bc),h=os.dot(bc);if(u>=0&&h<=u)return t.copy(i);let d=c*h-u*l;if(d<=0&&c>=0&&u<=0)return o=c/(c-u),t.copy(n).addScaledVector(rs,o);Tc.subVectors(e,r);let f=rs.dot(Tc),g=os.dot(Tc);if(g>=0&&f<=g)return t.copy(r);let _=f*l-c*g;if(_<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(n).addScaledVector(os,a);let m=u*g-f*h;if(m<=0&&h-u>=0&&f-g>=0)return Uh.subVectors(r,i),a=(h-u)/(h-u+(f-g)),t.copy(i).addScaledVector(Uh,a);let p=1/(m+_+d);return o=_*p,a=d*p,t.copy(n).addScaledVector(rs,o).addScaledVector(os,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},ju={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ai={h:0,s:0,l:0},mo={h:0,s:0,l:0};function Rc(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}var we=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=mt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,We.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=We.workingColorSpace){return this.r=e,this.g=t,this.b=n,We.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=We.workingColorSpace){if(e=hl(e,1),t=Ve(t,0,1),n=Ve(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Rc(o,r,e+1/3),this.g=Rc(o,r,e),this.b=Rc(o,r,e-1/3)}return We.colorSpaceToWorking(this,i),this}setStyle(e,t=mt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=mt){let n=ju[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Yn(e.r),this.g=Yn(e.g),this.b=Yn(e.b),this}copyLinearToSRGB(e){return this.r=gs(e.r),this.g=gs(e.g),this.b=gs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=mt){return We.workingToColorSpace(Nt.copy(this),e),Math.round(Ve(Nt.r*255,0,255))*65536+Math.round(Ve(Nt.g*255,0,255))*256+Math.round(Ve(Nt.b*255,0,255))}getHexString(e=mt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=We.workingColorSpace){We.workingToColorSpace(Nt.copy(this),t);let n=Nt.r,i=Nt.g,r=Nt.b,o=Math.max(n,i,r),a=Math.min(n,i,r),c,l,u=(a+o)/2;if(a===o)c=0,l=0;else{let h=o-a;switch(l=u<=.5?h/(o+a):h/(2-o-a),o){case n:c=(i-r)/h+(i<r?6:0);break;case i:c=(r-n)/h+2;break;case r:c=(n-i)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=We.workingColorSpace){return We.workingToColorSpace(Nt.copy(this),t),e.r=Nt.r,e.g=Nt.g,e.b=Nt.b,e}getStyle(e=mt){We.workingToColorSpace(Nt.copy(this),e);let t=Nt.r,n=Nt.g,i=Nt.b;return e!==mt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(ai),this.setHSL(ai.h+e,ai.s+t,ai.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ai),e.getHSL(mo);let n=ur(ai.h,mo.h,t),i=ur(ai.s,mo.s,t),r=ur(ai.l,mo.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Nt=new we;we.NAMES=ju;var Cf=0,Vt=class extends Rn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Cf++}),this.uuid=gn(),this.name="",this.type="Material",this.blending=Ai,this.side=_n,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Fo,this.blendDst=Oo,this.blendEquation=li,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new we(0,0,0),this.blendAlpha=0,this.depthFunc=Ri,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=kc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ti,this.stencilZFail=Ti,this.stencilZPass=Ti,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ai&&(n.blending=this.blending),this.side!==_n&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Fo&&(n.blendSrc=this.blendSrc),this.blendDst!==Oo&&(n.blendDst=this.blendDst),this.blendEquation!==li&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ri&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==kc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ti&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ti&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ti&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){let o=[];for(let a in r){let c=r[a];delete c.metadata,o.push(c)}return o}if(t){let r=i(e.textures),o=i(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},tt=class extends Vt{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new we(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new xn,this.combine=Jc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var vt=new L,go=new Ae,If=0,Mt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:If++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Bo,this.updateRanges=[],this.gpuType=an,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)go.fromBufferAttribute(this,t),go.applyMatrix3(e),this.setXY(t,go.x,go.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix3(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix4(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyNormalMatrix(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.transformDirection(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=pn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Qe(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=pn(t,this.array)),t}setX(e,t){return this.normalized&&(t=Qe(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=pn(t,this.array)),t}setY(e,t){return this.normalized&&(t=Qe(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=pn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Qe(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=pn(t,this.array)),t}setW(e,t){return this.normalized&&(t=Qe(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Qe(t,this.array),n=Qe(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=Qe(t,this.array),n=Qe(n,this.array),i=Qe(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=Qe(t,this.array),n=Qe(n,this.array),i=Qe(i,this.array),r=Qe(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Bo&&(e.usage=this.usage),e}};var _r=class extends Mt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var xr=class extends Mt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Ye=class extends Mt{constructor(e,t,n){super(new Float32Array(e),t,n)}},Pf=0,rn=new Ue,Cc=new rt,as=new L,Qt=new en,nr=new en,At=new L,yt=class s extends Rn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Pf++}),this.uuid=gn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(dl(e)?xr:_r)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Fe().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return rn.makeRotationFromQuaternion(e),this.applyMatrix4(rn),this}rotateX(e){return rn.makeRotationX(e),this.applyMatrix4(rn),this}rotateY(e){return rn.makeRotationY(e),this.applyMatrix4(rn),this}rotateZ(e){return rn.makeRotationZ(e),this.applyMatrix4(rn),this}translate(e,t,n){return rn.makeTranslation(e,t,n),this.applyMatrix4(rn),this}scale(e,t,n){return rn.makeScale(e,t,n),this.applyMatrix4(rn),this}lookAt(e){return Cc.lookAt(e),Cc.updateMatrix(),this.applyMatrix4(Cc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(as).negate(),this.translate(as.x,as.y,as.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let i=0,r=e.length;i<r;i++){let o=e[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Ye(n,3))}else{let n=Math.min(e.length,t.count);for(let i=0;i<n;i++){let r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new en);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let r=t[n];Qt.setFromBufferAttribute(r),this.morphTargetsRelative?(At.addVectors(this.boundingBox.min,Qt.min),this.boundingBox.expandByPoint(At),At.addVectors(this.boundingBox.max,Qt.max),this.boundingBox.expandByPoint(At)):(this.boundingBox.expandByPoint(Qt.min),this.boundingBox.expandByPoint(Qt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Wt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(e){let n=this.boundingSphere.center;if(Qt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];nr.setFromBufferAttribute(a),this.morphTargetsRelative?(At.addVectors(Qt.min,nr.min),Qt.expandByPoint(At),At.addVectors(Qt.max,nr.max),Qt.expandByPoint(At)):(Qt.expandByPoint(nr.min),Qt.expandByPoint(nr.max))}Qt.getCenter(n);let i=0;for(let r=0,o=e.count;r<o;r++)At.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(At));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)At.fromBufferAttribute(a,l),c&&(as.fromBufferAttribute(e,l),At.add(as)),i=Math.max(i,n.distanceToSquared(At))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,i=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Mt(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],c=[];for(let R=0;R<n.count;R++)a[R]=new L,c[R]=new L;let l=new L,u=new L,h=new L,d=new Ae,f=new Ae,g=new Ae,_=new L,m=new L;function p(R,x,M){l.fromBufferAttribute(n,R),u.fromBufferAttribute(n,x),h.fromBufferAttribute(n,M),d.fromBufferAttribute(r,R),f.fromBufferAttribute(r,x),g.fromBufferAttribute(r,M),u.sub(l),h.sub(l),f.sub(d),g.sub(d);let P=1/(f.x*g.y-g.x*f.y);isFinite(P)&&(_.copy(u).multiplyScalar(g.y).addScaledVector(h,-f.y).multiplyScalar(P),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(P),a[R].add(_),a[x].add(_),a[M].add(_),c[R].add(m),c[x].add(m),c[M].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let R=0,x=b.length;R<x;++R){let M=b[R],P=M.start,U=M.count;for(let B=P,H=P+U;B<H;B+=3)p(e.getX(B+0),e.getX(B+1),e.getX(B+2))}let w=new L,v=new L,C=new L,A=new L;function S(R){C.fromBufferAttribute(i,R),A.copy(C);let x=a[R];w.copy(x),w.sub(C.multiplyScalar(C.dot(x))).normalize(),v.crossVectors(A,x);let P=v.dot(c[R])<0?-1:1;o.setXYZW(R,w.x,w.y,w.z,P)}for(let R=0,x=b.length;R<x;++R){let M=b[R],P=M.start,U=M.count;for(let B=P,H=P+U;B<H;B+=3)S(e.getX(B+0)),S(e.getX(B+1)),S(e.getX(B+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Mt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let i=new L,r=new L,o=new L,a=new L,c=new L,l=new L,u=new L,h=new L;if(e)for(let d=0,f=e.count;d<f;d+=3){let g=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);i.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),u.subVectors(o,r),h.subVectors(i,r),u.cross(h),a.fromBufferAttribute(n,g),c.fromBufferAttribute(n,_),l.fromBufferAttribute(n,m),a.add(u),c.add(u),l.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let d=0,f=t.count;d<f;d+=3)i.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,r),h.subVectors(i,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)At.fromBufferAttribute(e,t),At.normalize(),e.setXYZ(t,At.x,At.y,At.z)}toNonIndexed(){function e(a,c){let l=a.array,u=a.itemSize,h=a.normalized,d=new l.constructor(c.length*u),f=0,g=0;for(let _=0,m=c.length;_<m;_++){a.isInterleavedBufferAttribute?f=c[_]*a.data.stride+a.offset:f=c[_]*u;for(let p=0;p<u;p++)d[g++]=l[f++]}return new Mt(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new s,n=this.index.array,i=this.attributes;for(let a in i){let c=i[a],l=e(c,n);t.setAttribute(a,l)}let r=this.morphAttributes;for(let a in r){let c=[],l=r[a];for(let u=0,h=l.length;u<h;u++){let d=l[u],f=e(d,n);c.push(f)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let l=n[c];e.data.attributes[c]=l.toJSON(e.data)}let i={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let h=0,d=l.length;h<d;h++){let f=l[h];u.push(f.toJSON(e.data))}u.length>0&&(i[c]=u,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let i=e.attributes;for(let l in i){let u=i[l];this.setAttribute(l,u.clone(t))}let r=e.morphAttributes;for(let l in r){let u=[],h=r[l];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let l=0,u=o.length;l<u;l++){let h=o[l];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Fh=new Ue,Si=new Li,_o=new Wt,Oh=new L,xo=new L,yo=new L,vo=new L,Ic=new L,Mo=new L,Bh=new L,So=new L,Ze=class extends rt{constructor(e=new yt,t=new tt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let a=this.morphTargetInfluences;if(r&&a){Mo.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let u=a[c],h=r[c];u!==0&&(Ic.fromBufferAttribute(h,e),o?Mo.addScaledVector(Ic,u):Mo.addScaledVector(Ic.sub(t),u))}t.add(Mo)}return t}raycast(e,t){let n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),_o.copy(n.boundingSphere),_o.applyMatrix4(r),Si.copy(e.ray).recast(e.near),!(_o.containsPoint(Si.origin)===!1&&(Si.intersectSphere(_o,Oh)===null||Si.origin.distanceToSquared(Oh)>(e.far-e.near)**2))&&(Fh.copy(r).invert(),Si.copy(e.ray).applyMatrix4(Fh),!(n.boundingBox!==null&&Si.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Si)))}_computeIntersections(e,t,n){let i,r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=o[m.materialIndex],b=Math.max(m.start,f.start),w=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let v=b,C=w;v<C;v+=3){let A=a.getX(v),S=a.getX(v+1),R=a.getX(v+2);i=bo(this,p,e,n,l,u,h,A,S,R),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{let g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let b=a.getX(m),w=a.getX(m+1),v=a.getX(m+2);i=bo(this,o,e,n,l,u,h,b,w,v),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=o[m.materialIndex],b=Math.max(m.start,f.start),w=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let v=b,C=w;v<C;v+=3){let A=v,S=v+1,R=v+2;i=bo(this,p,e,n,l,u,h,A,S,R),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{let g=Math.max(0,f.start),_=Math.min(c.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let b=m,w=m+1,v=m+2;i=bo(this,o,e,n,l,u,h,b,w,v),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}}};function Lf(s,e,t,n,i,r,o,a){let c;if(e.side===Ht?c=n.intersectTriangle(o,r,i,!0,a):c=n.intersectTriangle(i,r,o,e.side===_n,a),c===null)return null;So.copy(a),So.applyMatrix4(s.matrixWorld);let l=t.ray.origin.distanceTo(So);return l<t.near||l>t.far?null:{distance:l,point:So.clone(),object:s}}function bo(s,e,t,n,i,r,o,a,c,l){s.getVertexPosition(a,xo),s.getVertexPosition(c,yo),s.getVertexPosition(l,vo);let u=Lf(s,e,t,n,xo,yo,vo,Bh);if(u){let h=new L;qn.getBarycoord(Bh,xo,yo,vo,h),i&&(u.uv=qn.getInterpolatedAttribute(i,a,c,l,h,new Ae)),r&&(u.uv1=qn.getInterpolatedAttribute(r,a,c,l,h,new Ae)),o&&(u.normal=qn.getInterpolatedAttribute(o,a,c,l,h,new L),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let d={a,b:c,c:l,normal:new L,materialIndex:0};qn.getNormal(xo,yo,vo,d.normal),u.face=d,u.barycoord=h}return u}var hi=class s extends yt{constructor(e=1,t=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};let a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);let c=[],l=[],u=[],h=[],d=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,i,o,2),g("x","z","y",1,-1,e,n,-t,i,o,3),g("x","y","z",1,-1,e,t,n,i,r,4),g("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(c),this.setAttribute("position",new Ye(l,3)),this.setAttribute("normal",new Ye(u,3)),this.setAttribute("uv",new Ye(h,2));function g(_,m,p,b,w,v,C,A,S,R,x){let M=v/S,P=C/R,U=v/2,B=C/2,H=A/2,q=S+1,W=R+1,te=0,V=0,oe=new L;for(let he=0;he<W;he++){let be=he*P-B;for(let ke=0;ke<q;ke++){let ot=ke*M-U;oe[_]=ot*b,oe[m]=be*w,oe[p]=H,l.push(oe.x,oe.y,oe.z),oe[_]=0,oe[m]=0,oe[p]=A>0?1:-1,u.push(oe.x,oe.y,oe.z),h.push(ke/S),h.push(1-he/R),te+=1}}for(let he=0;he<R;he++)for(let be=0;be<S;be++){let ke=d+be+q*he,ot=d+be+q*(he+1),lt=d+(be+1)+q*(he+1),Je=d+(be+1)+q*he;c.push(ke,ot,Je),c.push(ot,lt,Je),V+=6}a.addGroup(f,V,x),f+=V,d+=te}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function ki(s){let e={};for(let t in s){e[t]={};for(let n in s[t]){let i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function Ut(s){let e={};for(let t=0;t<s.length;t++){let n=ki(s[t]);for(let i in n)e[i]=n[i]}return e}function Df(s){let e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function fl(s){let e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:We.workingColorSpace}var Qu={clone:ki,merge:Ut},Nf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Uf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,yn=class extends Vt{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Nf,this.fragmentShader=Uf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ki(e.uniforms),this.uniformsGroups=Df(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:"m4",value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},yr=class extends rt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ue,this.projectionMatrix=new Ue,this.projectionMatrixInverse=new Ue,this.coordinateSystem=mn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},ci=new L,zh=new Ae,kh=new Ae,Rt=class extends yr{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Pi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(hr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Pi*2*Math.atan(Math.tan(hr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ci.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ci.x,ci.y).multiplyScalar(-e/ci.z),ci.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ci.x,ci.y).multiplyScalar(-e/ci.z)}getViewSize(e,t){return this.getViewBounds(e,zh,kh),t.subVectors(kh,zh)}setViewOffset(e,t,n,i,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(hr*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*i/c,t-=o.offsetY*n/l,i*=o.width/c,n*=o.height/l}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},cs=-90,ls=1,Ho=class extends rt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new Rt(cs,ls,e,t);i.layers=this.layers,this.add(i);let r=new Rt(cs,ls,e,t);r.layers=this.layers,this.add(r);let o=new Rt(cs,ls,e,t);o.layers=this.layers,this.add(o);let a=new Rt(cs,ls,e,t);a.layers=this.layers,this.add(a);let c=new Rt(cs,ls,e,t);c.layers=this.layers,this.add(c);let l=new Rt(cs,ls,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,i,r,o,a,c]=t;for(let l of t)this.remove(l);if(e===mn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===pr)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,c,l,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,r),e.setRenderTarget(n,1,i),e.render(t,o),e.setRenderTarget(n,2,i),e.render(t,a),e.setRenderTarget(n,3,i),e.render(t,c),e.setRenderTarget(n,4,i),e.render(t,l),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,i),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},vr=class extends St{constructor(e=[],t=Oi,n,i,r,o,a,c,l,u){super(e,t,n,i,r,o,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Go=class extends Cn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new vr(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new hi(5,5,5),r=new yn({name:"CubemapFromEquirect",uniforms:ki(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ht,blending:Qn});r.uniforms.tEquirect.value=t;let o=new Ze(i,r),a=t.minFilter;return t.minFilter===Mn&&(t.minFilter=kt),new Ho(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(r)}},dt=class extends rt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Ff={type:"move"},Ss=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new dt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new dt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new dt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(let _ of e.hand.values()){let m=t.getJointPose(_,n),p=this._getHandJoint(l,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;l.inputState.pinching&&d>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Ff)))}return a!==null&&(a.visible=i!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new dt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}};var Mr=class s{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new we(e),this.near=t,this.far=n}clone(){return new s(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Sr=class extends rt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new xn,this.environmentIntensity=1,this.environmentRotation=new xn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Di=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Bo,this.updateRanges=[],this.version=0,this.uuid=gn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=gn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=gn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Bt=new L,ui=class s{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.applyMatrix4(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.applyNormalMatrix(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.transformDirection(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=pn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Qe(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Qe(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Qe(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Qe(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Qe(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=pn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=pn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=pn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=pn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Qe(t,this.array),n=Qe(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Qe(t,this.array),n=Qe(n,this.array),i=Qe(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Qe(t,this.array),n=Qe(n,this.array),i=Qe(i,this.array),r=Qe(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new Mt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new s(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},bs=class extends Vt{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new we(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},hs,ir=new L,us=new L,ds=new L,fs=new Ae,sr=new Ae,ed=new Ue,To=new L,rr=new L,wo=new L,Vh=new Ae,Pc=new Ae,Hh=new Ae,br=class extends rt{constructor(e=new bs){if(super(),this.isSprite=!0,this.type="Sprite",hs===void 0){hs=new yt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Di(t,5);hs.setIndex([0,1,2,0,2,3]),hs.setAttribute("position",new ui(n,3,0,!1)),hs.setAttribute("uv",new ui(n,2,3,!1))}this.geometry=hs,this.material=e,this.center=new Ae(.5,.5),this.count=1}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),us.setFromMatrixScale(this.matrixWorld),ed.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),ds.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&us.multiplyScalar(-ds.z);let n=this.material.rotation,i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));let o=this.center;Eo(To.set(-.5,-.5,0),ds,o,us,i,r),Eo(rr.set(.5,-.5,0),ds,o,us,i,r),Eo(wo.set(.5,.5,0),ds,o,us,i,r),Vh.set(0,0),Pc.set(1,0),Hh.set(1,1);let a=e.ray.intersectTriangle(To,rr,wo,!1,ir);if(a===null&&(Eo(rr.set(-.5,.5,0),ds,o,us,i,r),Pc.set(0,1),a=e.ray.intersectTriangle(To,wo,rr,!1,ir),a===null))return;let c=e.ray.origin.distanceTo(ir);c<e.near||c>e.far||t.push({distance:c,point:ir.clone(),uv:qn.getInterpolation(ir,To,rr,wo,Vh,Pc,Hh,new Ae),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Eo(s,e,t,n,i,r){fs.subVectors(s,t).addScalar(.5).multiply(n),i!==void 0?(sr.x=r*fs.x-i*fs.y,sr.y=i*fs.x+r*fs.y):sr.copy(fs),s.copy(e),s.x+=sr.x,s.y+=sr.y,s.applyMatrix4(ed)}var Gh=new L,Wh=new $e,Xh=new $e,Of=new L,qh=new Ue,Ao=new L,Lc=new Wt,Yh=new Ue,Dc=new Li,Tr=class extends Ze{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=zc,this.bindMatrix=new Ue,this.bindMatrixInverse=new Ue,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new en),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ao),this.boundingBox.expandByPoint(Ao)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Wt),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ao),this.boundingSphere.expandByPoint(Ao)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Lc.copy(this.boundingSphere),Lc.applyMatrix4(i),e.ray.intersectsSphere(Lc)!==!1&&(Yh.copy(i).invert(),Dc.copy(e.ray).applyMatrix4(Yh),!(this.boundingBox!==null&&Dc.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Dc)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new $e,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===zc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Uu?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,i=this.geometry;Wh.fromBufferAttribute(i.attributes.skinIndex,e),Xh.fromBufferAttribute(i.attributes.skinWeight,e),Gh.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){let o=Xh.getComponent(r);if(o!==0){let a=Wh.getComponent(r);qh.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Of.copy(Gh).applyMatrix4(qh),o)}}return t.applyMatrix4(this.bindMatrixInverse)}},Ts=class extends rt{constructor(){super(),this.isBone=!0,this.type="Bone"}},wr=class extends St{constructor(e=null,t=1,n=1,i,r,o,a,c,l=Ct,u=Ct,h,d){super(null,o,a,c,l,u,i,r,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Zh=new Ue,Bf=new Ue,Er=class s{constructor(e=[],t=[]){this.uuid=gn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Ue)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new Ue;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:Bf;Zh.multiplyMatrices(a,t[r]),Zh.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new s(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new wr(t,e,e,tn,an);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){let r=e.bones[n],o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new Ts),this.bones.push(o),this.boneInverses.push(new Ue().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){let o=t[i];e.bones.push(o.uuid);let a=n[i];e.boneInverses.push(a.toArray())}return e}},di=class extends Mt{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ps=new Ue,Kh=new Ue,Ro=[],$h=new en,zf=new Ue,or=new Ze,ar=new Wt,Xt=class extends Ze{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new di(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,zf)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new en),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ps),$h.copy(e.boundingBox).applyMatrix4(ps),this.boundingBox.union($h)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Wt),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ps),ar.copy(e.boundingSphere).applyMatrix4(ps),this.boundingSphere.union(ar)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(e,t){let n=this.matrixWorld,i=this.count;if(or.geometry=this.geometry,or.material=this.material,or.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ar.copy(this.boundingSphere),ar.applyMatrix4(n),e.ray.intersectsSphere(ar)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,ps),Kh.multiplyMatrices(n,ps),or.matrixWorld=Kh,or.raycast(e,Ro);for(let o=0,a=Ro.length;o<a;o++){let c=Ro[o];c.instanceId=r,c.object=this,t.push(c)}Ro.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new di(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new wr(new Float32Array(i*this.count),i,this.count,_a,an));let r=this.morphTexture.source.data.data,o=0;for(let l=0;l<n.length;l++)o+=n[l];let a=this.geometry.morphTargetsRelative?1:1-o,c=i*e;r[c]=a,r.set(n,c+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Nc=new L,kf=new L,Vf=new Fe,Tn=class{constructor(e=new L(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=Nc.subVectors(n,t).cross(kf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Nc),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Vf.getNormalMatrix(e),i=this.coplanarPoint(Nc).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},bi=new Wt,Hf=new Ae(.5,.5),Co=new L,ws=class{constructor(e=new Tn,t=new Tn,n=new Tn,i=new Tn,r=new Tn,o=new Tn){this.planes=[e,t,n,i,r,o]}set(e,t,n,i,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=mn,n=!1){let i=this.planes,r=e.elements,o=r[0],a=r[1],c=r[2],l=r[3],u=r[4],h=r[5],d=r[6],f=r[7],g=r[8],_=r[9],m=r[10],p=r[11],b=r[12],w=r[13],v=r[14],C=r[15];if(i[0].setComponents(l-o,f-u,p-g,C-b).normalize(),i[1].setComponents(l+o,f+u,p+g,C+b).normalize(),i[2].setComponents(l+a,f+h,p+_,C+w).normalize(),i[3].setComponents(l-a,f-h,p-_,C-w).normalize(),n)i[4].setComponents(c,d,m,v).normalize(),i[5].setComponents(l-c,f-d,p-m,C-v).normalize();else if(i[4].setComponents(l-c,f-d,p-m,C-v).normalize(),t===mn)i[5].setComponents(l+c,f+d,p+m,C+v).normalize();else if(t===pr)i[5].setComponents(c,d,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),bi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),bi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(bi)}intersectsSprite(e){bi.center.set(0,0,0);let t=Hf.distanceTo(e.center);return bi.radius=.7071067811865476+t,bi.applyMatrix4(e.matrixWorld),this.intersectsSphere(bi)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(Co.x=i.normal.x>0?e.max.x:e.min.x,Co.y=i.normal.y>0?e.max.y:e.min.y,Co.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Co)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Es=class extends Vt{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new we(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Wo=new L,Xo=new L,Jh=new Ue,cr=new Li,Io=new Wt,Uc=new L,jh=new L,Ni=class extends rt{constructor(e=new yt,t=new Es){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)Wo.fromBufferAttribute(t,i-1),Xo.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Wo.distanceTo(Xo);e.setAttribute("lineDistance",new Ye(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Io.copy(n.boundingSphere),Io.applyMatrix4(i),Io.radius+=r,e.ray.intersectsSphere(Io)===!1)return;Jh.copy(i).invert(),cr.copy(e.ray).applyMatrix4(Jh);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){let f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=l){let p=u.getX(_),b=u.getX(_+1),w=Po(this,e,cr,c,p,b,_);w&&t.push(w)}if(this.isLineLoop){let _=u.getX(g-1),m=u.getX(f),p=Po(this,e,cr,c,_,m,g-1);p&&t.push(p)}}else{let f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=l){let p=Po(this,e,cr,c,_,_+1,_);p&&t.push(p)}if(this.isLineLoop){let _=Po(this,e,cr,c,g-1,f,g-1);_&&t.push(_)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Po(s,e,t,n,i,r,o){let a=s.geometry.attributes.position;if(Wo.fromBufferAttribute(a,i),Xo.fromBufferAttribute(a,r),t.distanceSqToSegment(Wo,Xo,Uc,jh)>n)return;Uc.applyMatrix4(s.matrixWorld);let l=e.ray.origin.distanceTo(Uc);if(!(l<e.near||l>e.far))return{distance:l,point:jh.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}var Qh=new L,eu=new L,Ar=class extends Ni{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)Qh.fromBufferAttribute(t,i),eu.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Qh.distanceTo(eu);e.setAttribute("lineDistance",new Ye(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Rr=class extends Ni{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},As=class extends Vt{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new we(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},tu=new Ue,Vc=new Li,Lo=new Wt,Do=new L,Cr=class extends rt{constructor(e=new yt,t=new As){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Lo.copy(n.boundingSphere),Lo.applyMatrix4(i),Lo.radius+=r,e.ray.intersectsSphere(Lo)===!1)return;tu.copy(i).invert(),Vc.copy(e.ray).applyMatrix4(tu);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=n.index,h=n.attributes.position;if(l!==null){let d=Math.max(0,o.start),f=Math.min(l.count,o.start+o.count);for(let g=d,_=f;g<_;g++){let m=l.getX(g);Do.fromBufferAttribute(h,m),nu(Do,m,c,i,e,t,this)}}else{let d=Math.max(0,o.start),f=Math.min(h.count,o.start+o.count);for(let g=d,_=f;g<_;g++)Do.fromBufferAttribute(h,g),nu(Do,g,c,i,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function nu(s,e,t,n,i,r,o){let a=Vc.distanceSqToPoint(s);if(a<t){let c=new L;Vc.closestPointToPoint(s,c),c.applyMatrix4(n);let l=i.ray.origin.distanceTo(c);if(l<i.near||l>i.far)return;r.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var Rs=class extends St{constructor(e,t,n,i,r,o,a,c,l){super(e,t,n,i,r,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}},Ir=class extends St{constructor(e,t,n=pi,i,r,o,a=Ct,c=Ct,l,u=xs,h=1){if(u!==xs&&u!==Gs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:h};super(d,i,r,o,a,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ms(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Pr=class extends St{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Lr=class s extends yt{constructor(e=1,t=1,n=4,i=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:n,radialSegments:i,heightSegments:r},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),i=Math.max(3,Math.floor(i)),r=Math.max(1,Math.floor(r));let o=[],a=[],c=[],l=[],u=t/2,h=Math.PI/2*e,d=t,f=2*h+d,g=n*2+r,_=i+1,m=new L,p=new L;for(let b=0;b<=g;b++){let w=0,v=0,C=0,A=0;if(b<=n){let x=b/n,M=x*Math.PI/2;v=-u-e*Math.cos(M),C=e*Math.sin(M),A=-e*Math.cos(M),w=x*h}else if(b<=n+r){let x=(b-n)/r;v=-u+x*t,C=e,A=0,w=h+x*d}else{let x=(b-n-r)/n,M=x*Math.PI/2;v=u+e*Math.sin(M),C=e*Math.cos(M),A=e*Math.sin(M),w=h+d+x*h}let S=Math.max(0,Math.min(1,w/f)),R=0;b===0?R=.5/i:b===g&&(R=-.5/i);for(let x=0;x<=i;x++){let M=x/i,P=M*Math.PI*2,U=Math.sin(P),B=Math.cos(P);p.x=-C*B,p.y=v,p.z=C*U,a.push(p.x,p.y,p.z),m.set(-C*B,A,C*U),m.normalize(),c.push(m.x,m.y,m.z),l.push(M+R,S)}if(b>0){let x=(b-1)*_;for(let M=0;M<i;M++){let P=x+M,U=x+M+1,B=b*_+M,H=b*_+M+1;o.push(P,U,B),o.push(U,H,B)}}}this.setIndex(o),this.setAttribute("position",new Ye(a,3)),this.setAttribute("normal",new Ye(c,3)),this.setAttribute("uv",new Ye(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}},Dr=class s extends yt{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);let r=[],o=[],a=[],c=[],l=new L,u=new Ae;o.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let h=0,d=3;h<=t;h++,d+=3){let f=n+h/t*i;l.x=e*Math.cos(f),l.y=e*Math.sin(f),o.push(l.x,l.y,l.z),a.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,c.push(u.x,u.y)}for(let h=1;h<=t;h++)r.push(h,h+1,0);this.setIndex(r),this.setAttribute("position",new Ye(o,3)),this.setAttribute("normal",new Ye(a,3)),this.setAttribute("uv",new Ye(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Cs=class s extends yt{constructor(e=1,t=1,n=1,i=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};let l=this;i=Math.floor(i),r=Math.floor(r);let u=[],h=[],d=[],f=[],g=0,_=[],m=n/2,p=0;b(),o===!1&&(e>0&&w(!0),t>0&&w(!1)),this.setIndex(u),this.setAttribute("position",new Ye(h,3)),this.setAttribute("normal",new Ye(d,3)),this.setAttribute("uv",new Ye(f,2));function b(){let v=new L,C=new L,A=0,S=(t-e)/n;for(let R=0;R<=r;R++){let x=[],M=R/r,P=M*(t-e)+e;for(let U=0;U<=i;U++){let B=U/i,H=B*c+a,q=Math.sin(H),W=Math.cos(H);C.x=P*q,C.y=-M*n+m,C.z=P*W,h.push(C.x,C.y,C.z),v.set(q,S,W).normalize(),d.push(v.x,v.y,v.z),f.push(B,1-M),x.push(g++)}_.push(x)}for(let R=0;R<i;R++)for(let x=0;x<r;x++){let M=_[x][R],P=_[x+1][R],U=_[x+1][R+1],B=_[x][R+1];(e>0||x!==0)&&(u.push(M,P,B),A+=3),(t>0||x!==r-1)&&(u.push(P,U,B),A+=3)}l.addGroup(p,A,0),p+=A}function w(v){let C=g,A=new Ae,S=new L,R=0,x=v===!0?e:t,M=v===!0?1:-1;for(let U=1;U<=i;U++)h.push(0,m*M,0),d.push(0,M,0),f.push(.5,.5),g++;let P=g;for(let U=0;U<=i;U++){let H=U/i*c+a,q=Math.cos(H),W=Math.sin(H);S.x=x*W,S.y=m*M,S.z=x*q,h.push(S.x,S.y,S.z),d.push(0,M,0),A.x=q*.5+.5,A.y=W*.5*M+.5,f.push(A.x,A.y),g++}for(let U=0;U<i;U++){let B=C+U,H=P+U;v===!0?u.push(H,H+1,B):u.push(H+1,H,B),R+=3}l.addGroup(p,R,v===!0?1:2),p+=R}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Is=class s extends Cs{constructor(e=1,t=1,n=32,i=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,i,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new s(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Ps=class s extends yt{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};let r=[],o=[];a(i),l(n),u(),this.setAttribute("position",new Ye(r,3)),this.setAttribute("normal",new Ye(r.slice(),3)),this.setAttribute("uv",new Ye(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(b){let w=new L,v=new L,C=new L;for(let A=0;A<t.length;A+=3)f(t[A+0],w),f(t[A+1],v),f(t[A+2],C),c(w,v,C,b)}function c(b,w,v,C){let A=C+1,S=[];for(let R=0;R<=A;R++){S[R]=[];let x=b.clone().lerp(v,R/A),M=w.clone().lerp(v,R/A),P=A-R;for(let U=0;U<=P;U++)U===0&&R===A?S[R][U]=x:S[R][U]=x.clone().lerp(M,U/P)}for(let R=0;R<A;R++)for(let x=0;x<2*(A-R)-1;x++){let M=Math.floor(x/2);x%2===0?(d(S[R][M+1]),d(S[R+1][M]),d(S[R][M])):(d(S[R][M+1]),d(S[R+1][M+1]),d(S[R+1][M]))}}function l(b){let w=new L;for(let v=0;v<r.length;v+=3)w.x=r[v+0],w.y=r[v+1],w.z=r[v+2],w.normalize().multiplyScalar(b),r[v+0]=w.x,r[v+1]=w.y,r[v+2]=w.z}function u(){let b=new L;for(let w=0;w<r.length;w+=3){b.x=r[w+0],b.y=r[w+1],b.z=r[w+2];let v=m(b)/2/Math.PI+.5,C=p(b)/Math.PI+.5;o.push(v,1-C)}g(),h()}function h(){for(let b=0;b<o.length;b+=6){let w=o[b+0],v=o[b+2],C=o[b+4],A=Math.max(w,v,C),S=Math.min(w,v,C);A>.9&&S<.1&&(w<.2&&(o[b+0]+=1),v<.2&&(o[b+2]+=1),C<.2&&(o[b+4]+=1))}}function d(b){r.push(b.x,b.y,b.z)}function f(b,w){let v=b*3;w.x=e[v+0],w.y=e[v+1],w.z=e[v+2]}function g(){let b=new L,w=new L,v=new L,C=new L,A=new Ae,S=new Ae,R=new Ae;for(let x=0,M=0;x<r.length;x+=9,M+=6){b.set(r[x+0],r[x+1],r[x+2]),w.set(r[x+3],r[x+4],r[x+5]),v.set(r[x+6],r[x+7],r[x+8]),A.set(o[M+0],o[M+1]),S.set(o[M+2],o[M+3]),R.set(o[M+4],o[M+5]),C.copy(b).add(w).add(v).divideScalar(3);let P=m(C);_(A,M+0,b,P),_(S,M+2,w,P),_(R,M+4,v,P)}}function _(b,w,v,C){C<0&&b.x===1&&(o[w]=b.x-1),v.x===0&&v.z===0&&(o[w]=C/2/Math.PI+.5)}function m(b){return Math.atan2(b.z,-b.x)}function p(b){return Math.atan2(-b.y,Math.sqrt(b.x*b.x+b.z*b.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.vertices,e.indices,e.radius,e.details)}},Ls=class s extends Ps{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}};var Ds=class s extends Ps{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}};var Ns=class s extends Ps{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},vn=class s extends yt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let r=e/2,o=t/2,a=Math.floor(n),c=Math.floor(i),l=a+1,u=c+1,h=e/a,d=t/c,f=[],g=[],_=[],m=[];for(let p=0;p<u;p++){let b=p*d-o;for(let w=0;w<l;w++){let v=w*h-r;g.push(v,-b,0),_.push(0,0,1),m.push(w/a),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let b=0;b<a;b++){let w=b+l*p,v=b+l*(p+1),C=b+1+l*(p+1),A=b+1+l*p;f.push(w,v,A),f.push(v,C,A)}this.setIndex(f),this.setAttribute("position",new Ye(g,3)),this.setAttribute("normal",new Ye(_,3)),this.setAttribute("uv",new Ye(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.width,e.height,e.widthSegments,e.heightSegments)}},Nr=class s extends yt{constructor(e=.5,t=1,n=32,i=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:o},n=Math.max(3,n),i=Math.max(1,i);let a=[],c=[],l=[],u=[],h=e,d=(t-e)/i,f=new L,g=new Ae;for(let _=0;_<=i;_++){for(let m=0;m<=n;m++){let p=r+m/n*o;f.x=h*Math.cos(p),f.y=h*Math.sin(p),c.push(f.x,f.y,f.z),l.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,u.push(g.x,g.y)}h+=d}for(let _=0;_<i;_++){let m=_*(n+1);for(let p=0;p<n;p++){let b=p+m,w=b,v=b+n+1,C=b+n+2,A=b+1;a.push(w,v,A),a.push(v,C,A)}}this.setIndex(a),this.setAttribute("position",new Ye(c,3)),this.setAttribute("normal",new Ye(l,3)),this.setAttribute("uv",new Ye(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var Us=class s extends yt{constructor(e=1,t=32,n=16,i=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let c=Math.min(o+a,Math.PI),l=0,u=[],h=new L,d=new L,f=[],g=[],_=[],m=[];for(let p=0;p<=n;p++){let b=[],w=p/n,v=0;p===0&&o===0?v=.5/t:p===n&&c===Math.PI&&(v=-.5/t);for(let C=0;C<=t;C++){let A=C/t;h.x=-e*Math.cos(i+A*r)*Math.sin(o+w*a),h.y=e*Math.cos(o+w*a),h.z=e*Math.sin(i+A*r)*Math.sin(o+w*a),g.push(h.x,h.y,h.z),d.copy(h).normalize(),_.push(d.x,d.y,d.z),m.push(A+v,1-w),b.push(l++)}u.push(b)}for(let p=0;p<n;p++)for(let b=0;b<t;b++){let w=u[p][b+1],v=u[p][b],C=u[p+1][b],A=u[p+1][b+1];(p!==0||o>0)&&f.push(w,v,A),(p!==n-1||c<Math.PI)&&f.push(v,C,A)}this.setIndex(f),this.setAttribute("position",new Ye(g,3)),this.setAttribute("normal",new Ye(_,3)),this.setAttribute("uv",new Ye(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Fs=class s extends yt{constructor(e=1,t=.4,n=12,i=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);let o=[],a=[],c=[],l=[],u=new L,h=new L,d=new L;for(let f=0;f<=n;f++)for(let g=0;g<=i;g++){let _=g/i*r,m=f/n*Math.PI*2;h.x=(e+t*Math.cos(m))*Math.cos(_),h.y=(e+t*Math.cos(m))*Math.sin(_),h.z=t*Math.sin(m),a.push(h.x,h.y,h.z),u.x=e*Math.cos(_),u.y=e*Math.sin(_),d.subVectors(h,u).normalize(),c.push(d.x,d.y,d.z),l.push(g/i),l.push(f/n)}for(let f=1;f<=n;f++)for(let g=1;g<=i;g++){let _=(i+1)*f+g-1,m=(i+1)*(f-1)+g-1,p=(i+1)*(f-1)+g,b=(i+1)*f+g;o.push(_,m,b),o.push(m,p,b)}this.setIndex(o),this.setAttribute("position",new Ye(a,3)),this.setAttribute("normal",new Ye(c,3)),this.setAttribute("uv",new Ye(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var on=class extends Vt{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new we(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new we(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=al,this.normalScale=new Ae(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new xn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},qt=class extends on{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Ae(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Ve(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new we(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new we(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new we(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var qo=class extends Vt{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=ku,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Yo=class extends Vt{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function No(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function Gf(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Wf(s){function e(i,r){return s[i]-s[r]}let t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function iu(s,e,t){let n=s.length,i=new s.constructor(n);for(let r=0,o=0;o!==n;++r){let a=t[r]*e;for(let c=0;c!==e;++c)i[o++]=s[a+c]}return i}function td(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push(...o)),r=s[i++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=s[i++];while(r!==void 0)}var Zn=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let o;n:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=t[++n],e<i)break t}o=t.length;break n}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(i=r,r=t[--n-1],e>=r)break t}o=n,n=0;break n}break e}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let o=0;o!==i;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Zo=class extends Zn{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:wi,endingEnd:wi}}intervalChanged_(e,t,n){let i=this.parameterPositions,r=e-2,o=e+1,a=i[r],c=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case Ei:r=e,a=2*t-n;break;case dr:r=i.length-2,a=t+i[r]-i[r+1];break;default:r=e,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Ei:o=e,c=2*n-t;break;case dr:o=1,c=n+i[1]-i[0];break;default:o=e-1,c=t}let l=(n-t)*.5,u=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(i-t),_=g*g,m=_*g,p=-d*m+2*d*_-d*g,b=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*g+1,w=(-1-f)*m+(1.5+f)*_+.5*g,v=f*m-f*_;for(let C=0;C!==a;++C)r[C]=p*o[u+C]+b*o[l+C]+w*o[c+C]+v*o[h+C];return r}},Ur=class extends Zn{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=(n-t)/(i-t),h=1-u;for(let d=0;d!==a;++d)r[d]=o[l+d]*h+o[c+d]*u;return r}},Ko=class extends Zn{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},Yt=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=No(t,this.TimeBufferType),this.values=No(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:No(e.times,Array),values:No(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ko(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ur(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Zo(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Ci:t=this.InterpolantFactoryMethodDiscrete;break;case Ii:t=this.InterpolantFactoryMethodLinear;break;case Uo:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ci;case this.InterpolantFactoryMethodLinear:return Ii;case this.InterpolantFactoryMethodSmooth:return Uo}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){let n=this.times,i=n.length,r=0,o=i-1;for(;r!==i&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,i=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let c=n[a];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(i!==void 0&&Gf(i))for(let a=0,c=i.length;a!==c;++a){let l=i[a];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Uo,r=e.length-1,o=1;for(let a=1;a<r;++a){let c=!1,l=e[a],u=e[a+1];if(l!==u&&(a!==1||l!==e[0]))if(i)c=!0;else{let h=a*n,d=h-n,f=h+n;for(let g=0;g!==n;++g){let _=t[h+g];if(_!==t[d+g]||_!==t[f+g]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];let h=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[h+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,c=o*n,l=0;l!==n;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}};Yt.prototype.ValueTypeName="";Yt.prototype.TimeBufferType=Float32Array;Yt.prototype.ValueBufferType=Float32Array;Yt.prototype.DefaultInterpolation=Ii;var Kn=class extends Yt{constructor(e,t,n){super(e,t,n)}};Kn.prototype.ValueTypeName="bool";Kn.prototype.ValueBufferType=Array;Kn.prototype.DefaultInterpolation=Ci;Kn.prototype.InterpolantFactoryMethodLinear=void 0;Kn.prototype.InterpolantFactoryMethodSmooth=void 0;var Fr=class extends Yt{constructor(e,t,n,i){super(e,t,n,i)}};Fr.prototype.ValueTypeName="color";var In=class extends Yt{constructor(e,t,n,i){super(e,t,n,i)}};In.prototype.ValueTypeName="number";var $o=class extends Zn{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-t)/(i-t),l=e*a;for(let u=l+a;l!==u;l+=4)zt.slerpFlat(r,0,o,l-a,o,l,c);return r}},Pn=class extends Yt{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new $o(this.times,this.values,this.getValueSize(),e)}};Pn.prototype.ValueTypeName="quaternion";Pn.prototype.InterpolantFactoryMethodSmooth=void 0;var $n=class extends Yt{constructor(e,t,n){super(e,t,n)}};$n.prototype.ValueTypeName="string";$n.prototype.ValueBufferType=Array;$n.prototype.DefaultInterpolation=Ci;$n.prototype.InterpolantFactoryMethodLinear=void 0;$n.prototype.InterpolantFactoryMethodSmooth=void 0;var Ln=class extends Yt{constructor(e,t,n,i){super(e,t,n,i)}};Ln.prototype.ValueTypeName="vector";var Ui=class{constructor(e="",t=-1,n=[],i=Ka){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=gn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,i=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(qf(n[o]).scale(i));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=n.length;r!==o;++r)t.push(Yt.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){let r=t.length,o=[];for(let a=0;a<r;a++){let c=[],l=[];c.push((a+r-1)%r,a,(a+1)%r),l.push(0,1,0);let u=Wf(c);c=iu(c,1,u),l=iu(l,1,u),!i&&c[0]===0&&(c.push(r),l.push(l[0])),o.push(new In(".morphTargetInfluences["+t[a].name+"]",c,l).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let i={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,c=e.length;a<c;a++){let l=e[a],u=l.name.match(r);if(u&&u.length>1){let h=u[1],d=i[h];d||(i[h]=d=[]),d.push(l)}}let o=[];for(let a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return o}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let n=function(h,d,f,g,_){if(f.length!==0){let m=[],p=[];td(f,m,p,g),m.length!==0&&_.push(new h(d,m,p))}},i=[],r=e.name||"default",o=e.fps||30,a=e.blendMode,c=e.length||-1,l=e.hierarchy||[];for(let h=0;h<l.length;h++){let d=l[h].keys;if(!(!d||d.length===0))if(d[0].morphTargets){let f={},g;for(g=0;g<d.length;g++)if(d[g].morphTargets)for(let _=0;_<d[g].morphTargets.length;_++)f[d[g].morphTargets[_]]=-1;for(let _ in f){let m=[],p=[];for(let b=0;b!==d[g].morphTargets.length;++b){let w=d[g];m.push(w.time),p.push(w.morphTarget===_?1:0)}i.push(new In(".morphTargetInfluence["+_+"]",m,p))}c=f.length*o}else{let f=".bones["+t[h].name+"]";n(Ln,f+".position",d,"pos",i),n(Pn,f+".quaternion",d,"rot",i),n(Ln,f+".scale",d,"scl",i)}}return i.length===0?null:new this(r,c,i,a)}resetDuration(){let e=this.tracks,t=0;for(let n=0,i=e.length;n!==i;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function Xf(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return In;case"vector":case"vector2":case"vector3":case"vector4":return Ln;case"color":return Fr;case"quaternion":return Pn;case"bool":case"boolean":return Kn;case"string":return $n}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function qf(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=Xf(s.type);if(s.times===void 0){let t=[],n=[];td(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}var En={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}},Jo=class{constructor(e,t,n){let i=this,r=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(u){a++,r===!1&&i.onStart!==void 0&&i.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,i.onProgress!==void 0&&i.onProgress(u,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(u){i.onError!==void 0&&i.onError(u)},this.resolveURL=function(u){return c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){let h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=l.length;h<d;h+=2){let f=l[h],g=l[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},nd=new Jo,Dn=class{constructor(e){this.manager=e!==void 0?e:nd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Dn.DEFAULT_MATERIAL_NAME="__DEFAULT";var Xn={},Hc=class extends Error{constructor(e,t){super(e),this.response=t}},Os=class extends Dn{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=En.get(`file:${e}`);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(Xn[e]!==void 0){Xn[e].push({onLoad:t,onProgress:n,onError:i});return}Xn[e]=[],Xn[e].push({onLoad:t,onProgress:n,onError:i});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,c=this.responseType;fetch(o).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;let u=Xn[e],h=l.body.getReader(),d=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),f=d?parseInt(d):0,g=f!==0,_=0,m=new ReadableStream({start(p){b();function b(){h.read().then(({done:w,value:v})=>{if(w)p.close();else{_+=v.byteLength;let C=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:f});for(let A=0,S=u.length;A<S;A++){let R=u[A];R.onProgress&&R.onProgress(C)}p.enqueue(v),b()}},w=>{p.error(w)})}}});return new Response(m)}else throw new Hc(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return l.json();default:if(a==="")return l.text();{let h=/charset="?([^;"\s]*)"?/i.exec(a),d=h&&h[1]?h[1].toLowerCase():void 0,f=new TextDecoder(d);return l.arrayBuffer().then(g=>f.decode(g))}}}).then(l=>{En.add(`file:${e}`,l);let u=Xn[e];delete Xn[e];for(let h=0,d=u.length;h<d;h++){let f=u[h];f.onLoad&&f.onLoad(l)}}).catch(l=>{let u=Xn[e];if(u===void 0)throw this.manager.itemError(e),l;delete Xn[e];for(let h=0,d=u.length;h<d;h++){let f=u[h];f.onError&&f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var ms=new WeakMap,jo=class extends Dn{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=En.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let h=ms.get(o);h===void 0&&(h=[],ms.set(o,h)),h.push({onLoad:t,onError:i})}return o}let a=ys("img");function c(){u(),t&&t(this);let h=ms.get(this)||[];for(let d=0;d<h.length;d++){let f=h[d];f.onLoad&&f.onLoad(this)}ms.delete(this),r.manager.itemEnd(e)}function l(h){u(),i&&i(h),En.remove(`image:${e}`);let d=ms.get(this)||[];for(let f=0;f<d.length;f++){let g=d[f];g.onError&&g.onError(h)}ms.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){a.removeEventListener("load",c,!1),a.removeEventListener("error",l,!1)}return a.addEventListener("load",c,!1),a.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),En.add(`image:${e}`,a),r.manager.itemStart(e),a.src=e,a}};var Or=class extends Dn{constructor(e){super(e)}load(e,t,n,i){let r=new St,o=new jo(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}},fi=class extends rt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new we(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},Br=class extends fi{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(rt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new we(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Fc=new Ue,su=new L,ru=new L,zr=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ae(512,512),this.mapType=Sn,this.map=null,this.mapPass=null,this.matrix=new Ue,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ws,this._frameExtents=new Ae(1,1),this._viewportCount=1,this._viewports=[new $e(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;su.setFromMatrixPosition(e.matrixWorld),t.position.copy(su),ru.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ru),t.updateMatrixWorld(),Fc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Fc,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Fc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Gc=class extends zr{constructor(){super(new Rt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Pi*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},kr=class extends fi{constructor(e,t,n=0,i=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(rt.DEFAULT_UP),this.updateMatrix(),this.target=new rt,this.distance=n,this.angle=i,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Gc}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},ou=new Ue,lr=new L,Oc=new L,Wc=class extends zr{constructor(){super(new Rt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Ae(4,2),this._viewportCount=6,this._viewports=[new $e(2,1,1,1),new $e(0,1,1,1),new $e(3,1,1,1),new $e(1,1,1,1),new $e(3,0,1,1),new $e(1,0,1,1)],this._cubeDirections=[new L(1,0,0),new L(-1,0,0),new L(0,0,1),new L(0,0,-1),new L(0,1,0),new L(0,-1,0)],this._cubeUps=[new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,0,1),new L(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,i=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),lr.setFromMatrixPosition(e.matrixWorld),n.position.copy(lr),Oc.copy(n.position),Oc.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Oc),n.updateMatrixWorld(),i.makeTranslation(-lr.x,-lr.y,-lr.z),ou.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ou,n.coordinateSystem,n.reversedDepth)}},Vr=class extends fi{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Wc}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Jn=class extends yr{constructor(e=-1,t=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,r=n-e,o=n+e,a=i+t,c=i-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Xc=class extends zr{constructor(){super(new Jn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Fi=class extends fi{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(rt.DEFAULT_UP),this.updateMatrix(),this.target=new rt,this.shadow=new Xc}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Hr=class extends fi{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var jn=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var Bc=new WeakMap,Gr=class extends Dn{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=En.get(`image-bitmap:${e}`);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(l=>{if(Bc.has(o)===!0)i&&i(Bc.get(o)),r.manager.itemError(e),r.manager.itemEnd(e);else return t&&t(l),r.manager.itemEnd(e),l});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}let a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let c=fetch(e,a).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(l){return En.add(`image-bitmap:${e}`,l),t&&t(l),r.manager.itemEnd(e),l}).catch(function(l){i&&i(l),Bc.set(c,l),En.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});En.add(`image-bitmap:${e}`,c),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Qo=class extends Rt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var ea=class{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,r,o;switch(t){case"quaternion":i=this._slerp,r=this._slerpAdditive,o=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,r=this._select,o=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,r=this._lerpAdditive,o=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=o,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,i=this.valueSize,r=e*i+i,o=this.cumulativeWeight;if(o===0){for(let a=0;a!==i;++a)n[r+a]=n[a];o=t}else{o+=t;let a=t/o;this._mixBufferRegion(n,r,0,a,i)}this.cumulativeWeight=o}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,i=e*t+t,r=this.cumulativeWeight,o=this.cumulativeWeightAdditive,a=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let c=t*this._origIndex;this._mixBufferRegion(n,i,c,1-r,t)}o>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let c=t,l=t+t;c!==l;++c)if(n[c]!==n[c+t]){a.setValue(n,i);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let r=n,o=i;r!==o;++r)t[r]=t[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,r){if(i>=.5)for(let o=0;o!==r;++o)e[t+o]=e[n+o]}_slerp(e,t,n,i){zt.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,r){let o=this._workIndex*r;zt.multiplyQuaternionsFlat(e,o,e,t,e,n),zt.slerpFlat(e,t,e,t,e,o,i)}_lerp(e,t,n,i,r){let o=1-i;for(let a=0;a!==r;++a){let c=t+a;e[c]=e[c]*o+e[n+a]*i}}_lerpAdditive(e,t,n,i,r){for(let o=0;o!==r;++o){let a=t+o;e[a]=e[a]+e[n+o]*i}}},pl="\\[\\]\\.:\\/",Yf=new RegExp("["+pl+"]","g"),ml="[^"+pl+"]",Zf="[^"+pl.replace("\\.","")+"]",Kf=/((?:WC+[\/:])*)/.source.replace("WC",ml),$f=/(WCOD+)?/.source.replace("WCOD",Zf),Jf=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ml),jf=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ml),Qf=new RegExp("^"+Kf+$f+Jf+jf+"$"),ep=["material","materials","bones","map"],qc=class{constructor(e,t,n){let i=n||it.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},it=class s{constructor(e,t,n){this.path=t,this.parsedPath=n||s.parseTrackName(t),this.node=s.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new s.Composite(e,t,n):new s(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Yf,"")}static parseTrackName(e){let t=Qf.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let r=n.nodeName.substring(i+1);ep.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let c=n(a.children);if(c)return c}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,i=t.propertyName,r=t.propertyIndex;if(e||(e=s.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let o=e[i];if(o===void 0){let l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};it.Composite=qc;it.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};it.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};it.prototype.GetterByBindingType=[it.prototype._getValue_direct,it.prototype._getValue_array,it.prototype._getValue_arrayElement,it.prototype._getValue_toArray];it.prototype.SetterByBindingTypeAndVersioning=[[it.prototype._setValue_direct,it.prototype._setValue_direct_setNeedsUpdate,it.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[it.prototype._setValue_array,it.prototype._setValue_array_setNeedsUpdate,it.prototype._setValue_array_setMatrixWorldNeedsUpdate],[it.prototype._setValue_arrayElement,it.prototype._setValue_arrayElement_setNeedsUpdate,it.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[it.prototype._setValue_fromArray,it.prototype._setValue_fromArray_setNeedsUpdate,it.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var ta=class{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;let r=t.tracks,o=r.length,a=new Array(o),c={endingStart:wi,endingEnd:wi};for(let l=0;l!==o;++l){let u=r[l].createInterpolant(null);a[l]=u,u.settings=c}this._interpolantSettings=c,this._interpolants=a,this._propertyBindings=new Array(o),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=Ou,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){let i=this._clip.duration,r=e._clip.duration,o=r/i,a=i/r;e.warp(1,o,t),this.warp(a,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let i=this._mixer,r=i.time,o=this.timeScale,a=this._timeScaleInterpolant;a===null&&(a=i._lendControlInterpolant(),this._timeScaleInterpolant=a);let c=a.parameterPositions,l=a.sampleValues;return c[0]=r,c[1]=r+n,l[0]=e/o,l[1]=t/o,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}let r=this._startTime;if(r!==null){let c=(e-r)*n;c<0||n===0?t=0:(this._startTime=null,t=n*c)}t*=this._updateTimeScale(e);let o=this._updateTime(t),a=this._updateWeight(e);if(a>0){let c=this._interpolants,l=this._propertyBindings;switch(this.blendMode){case zu:for(let u=0,h=c.length;u!==h;++u)c[u].evaluate(o),l[u].accumulateAdditive(a);break;case Ka:default:for(let u=0,h=c.length;u!==h;++u)c[u].evaluate(o),l[u].accumulate(i,a)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,i=this.time+e,r=this._loopCount,o=n===Bu;if(e===0)return r===-1?i:o&&(r&1)===1?t-i:i;if(n===Fu){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,o)):this._setEndings(this.repetitions===0,!0,o)),i>=t||i<0){let a=Math.floor(i/t);i-=t*a,r+=Math.abs(a);let c=this.repetitions-r;if(c<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(c===1){let l=e<0;this._setEndings(l,!l,o)}else this._setEndings(!1,!1,o);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:a})}}else this.time=i;if(o&&(r&1)===1)return t-i}return i}_setEndings(e,t,n){let i=this._interpolantSettings;n?(i.endingStart=Ei,i.endingEnd=Ei):(e?i.endingStart=this.zeroSlopeAtStart?Ei:wi:i.endingStart=dr,t?i.endingEnd=this.zeroSlopeAtEnd?Ei:wi:i.endingEnd=dr)}_scheduleFading(e,t,n){let i=this._mixer,r=i.time,o=this._weightInterpolant;o===null&&(o=i._lendControlInterpolant(),this._weightInterpolant=o);let a=o.parameterPositions,c=o.sampleValues;return a[0]=r,c[0]=t,a[1]=r+e,c[1]=n,this}},tp=new Float32Array(1),Wr=class extends Rn{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){let n=e._localRoot||this._root,i=e._clip.tracks,r=i.length,o=e._propertyBindings,a=e._interpolants,c=n.uuid,l=this._bindingsByRootAndName,u=l[c];u===void 0&&(u={},l[c]=u);for(let h=0;h!==r;++h){let d=i[h],f=d.name,g=u[f];if(g!==void 0)++g.referenceCount,o[h]=g;else{if(g=o[h],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,c,f));continue}let _=t&&t._propertyBindings[h].binding.parsedPath;g=new ea(it.create(n,f,_),d.ValueTypeName,d.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,c,f),o[h]=g}a[h].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,i=e._clip.uuid,r=this._actionsByClip[i];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,i,n)}let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let i=this._actions,r=this._actionsByClip,o=r[t];if(o===void 0)o={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=o;else{let a=o.knownActions;e._byClipCacheIndex=a.length,a.push(e)}e._cacheIndex=i.length,i.push(e),o.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;let r=e._clip.uuid,o=this._actionsByClip,a=o[r],c=a.knownActions,l=c[c.length-1],u=e._byClipCacheIndex;l._byClipCacheIndex=u,c[u]=l,c.pop(),e._byClipCacheIndex=null;let h=a.actionByRoot,d=(e._localRoot||this._root).uuid;delete h[d],c.length===0&&delete o[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){let i=this._bindingsByRootAndName,r=this._bindings,o=i[t];o===void 0&&(o={},i[t]=o),o[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,i=n.rootNode.uuid,r=n.path,o=this._bindingsByRootAndName,a=o[i],c=t[t.length-1],l=e._cacheIndex;c._cacheIndex=l,t[l]=c,t.pop(),delete a[r],Object.keys(a).length===0&&delete o[i]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];return n===void 0&&(n=new Ur(new Float32Array(2),new Float32Array(2),1,tp),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,r=t[i];e.__cacheIndex=i,t[i]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){let i=t||this._root,r=i.uuid,o=typeof e=="string"?Ui.findByName(i,e):e,a=o!==null?o.uuid:e,c=this._actionsByClip[a],l=null;if(n===void 0&&(o!==null?n=o.blendMode:n=Ka),c!==void 0){let h=c.actionByRoot[r];if(h!==void 0&&h.blendMode===n)return h;l=c.knownActions[0],o===null&&(o=l._clip)}if(o===null)return null;let u=new ta(this,o,t,n);return this._bindAction(u,l),this._addInactiveAction(u,a,r),u}existingAction(e,t){let n=t||this._root,i=n.uuid,r=typeof e=="string"?Ui.findByName(n,e):e,o=r?r.uuid:e,a=this._actionsByClip[o];return a!==void 0&&a.actionByRoot[i]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,i=this.time+=e,r=Math.sign(e),o=this._accuIndex^=1;for(let l=0;l!==n;++l)t[l]._update(i,e,r,o);let a=this._bindings,c=this._nActiveBindings;for(let l=0;l!==c;++l)a[l].apply(o);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){let o=r.knownActions;for(let a=0,c=o.length;a!==c;++a){let l=o[a];this._deactivateAction(l);let u=l._cacheIndex,h=t[t.length-1];l._cacheIndex=null,l._byClipCacheIndex=null,h._cacheIndex=u,t[u]=h,t.pop(),this._removeInactiveBindingsForAction(l)}delete i[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let o in n){let a=n[o].actionByRoot,c=a[t];c!==void 0&&(this._deactivateAction(c),this._removeInactiveAction(c))}let i=this._bindingsByRootAndName,r=i[t];if(r!==void 0)for(let o in r){let a=r[o];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(e,t){let n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}};function gl(s,e,t,n){let i=np(n);switch(t){case il:return s*e;case _a:return s*e/i.components*i.byteLength;case xa:return s*e/i.components*i.byteLength;case rl:return s*e*2/i.components*i.byteLength;case ya:return s*e*2/i.components*i.byteLength;case sl:return s*e*3/i.components*i.byteLength;case tn:return s*e*4/i.components*i.byteLength;case va:return s*e*4/i.components*i.byteLength;case qr:case Yr:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Zr:case Kr:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Sa:case Ta:return Math.max(s,16)*Math.max(e,8)/4;case Ma:case ba:return Math.max(s,8)*Math.max(e,8)/2;case wa:case Ea:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Aa:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Ra:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Ca:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case Ia:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case Pa:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case La:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Da:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Na:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case Ua:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case Fa:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case Oa:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case Ba:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case za:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case ka:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Va:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case Ha:case Ga:case Wa:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Xa:case qa:return Math.ceil(s/4)*Math.ceil(e/4)*8;case Ya:case Za:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function np(s){switch(s){case Sn:case Qc:return{byteLength:1,components:1};case ks:case el:case Vs:return{byteLength:2,components:1};case ma:case ga:return{byteLength:2,components:4};case pi:case pa:case an:return{byteLength:4,components:1};case tl:case nl:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");function Ed(){let s=null,e=!1,t=null,n=null;function i(r,o){t(r,o),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function sp(s){let e=new WeakMap;function t(a,c){let l=a.array,u=a.usage,h=l.byteLength,d=s.createBuffer();s.bindBuffer(c,d),s.bufferData(c,l,u),a.onUploadCallback();let f;if(l instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=s.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=s.SHORT;else if(l instanceof Uint32Array)f=s.UNSIGNED_INT;else if(l instanceof Int32Array)f=s.INT;else if(l instanceof Int8Array)f=s.BYTE;else if(l instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,c,l){let u=c.array,h=c.updateRanges;if(s.bindBuffer(l,a),h.length===0)s.bufferSubData(l,0,u);else{h.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<h.length;f++){let g=h[d],_=h[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,h[d]=_)}h.length=d+1;for(let f=0,g=h.length;f<g;f++){let _=h[f];s.bufferSubData(l,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}c.clearUpdateRanges()}c.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=e.get(a);c&&(s.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:i,remove:r,update:o}}var rp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,op=`#ifdef USE_ALPHAHASH
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
#endif`,ap=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,cp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,lp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,hp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,up=`#ifdef USE_AOMAP
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
#endif`,dp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,fp=`#ifdef USE_BATCHING
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
#endif`,pp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,mp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,gp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,_p=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,xp=`#ifdef USE_IRIDESCENCE
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
#endif`,yp=`#ifdef USE_BUMPMAP
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
#endif`,vp=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Mp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Sp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,bp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Tp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,wp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Ep=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Ap=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Rp=`#define PI 3.141592653589793
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
} // validated`,Cp=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Ip=`vec3 transformedNormal = objectNormal;
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
#endif`,Pp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Lp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Dp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Np=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Up="gl_FragColor = linearToOutputTexel( gl_FragColor );",Fp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Op=`#ifdef USE_ENVMAP
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
#endif`,Bp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,zp=`#ifdef USE_ENVMAP
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
#endif`,kp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Vp=`#ifdef USE_ENVMAP
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
#endif`,Hp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Gp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Wp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Xp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,qp=`#ifdef USE_GRADIENTMAP
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
}`,Yp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Zp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Kp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,$p=`uniform bool receiveShadow;
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
#endif`,Jp=`#ifdef USE_ENVMAP
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
#endif`,jp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Qp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,em=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,tm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,nm=`PhysicalMaterial material;
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
#endif`,im=`struct PhysicalMaterial {
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
}`,sm=`
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
#endif`,rm=`#if defined( RE_IndirectDiffuse )
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
#endif`,om=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,am=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,cm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,lm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,hm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,um=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,dm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,fm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,pm=`#if defined( USE_POINTS_UV )
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
#endif`,mm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,gm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,_m=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,xm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,ym=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,vm=`#ifdef USE_MORPHTARGETS
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
#endif`,Mm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Sm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,bm=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Tm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,wm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Em=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Am=`#ifdef USE_NORMALMAP
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
#endif`,Rm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Cm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Im=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Pm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Lm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Dm=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Nm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Um=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Fm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Om=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Bm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,zm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,km=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Vm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Hm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Gm=`float getShadowMask() {
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
}`,Wm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Xm=`#ifdef USE_SKINNING
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
#endif`,qm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Ym=`#ifdef USE_SKINNING
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
#endif`,Zm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Km=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,$m=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Jm=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,jm=`#ifdef USE_TRANSMISSION
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
#endif`,Qm=`#ifdef USE_TRANSMISSION
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
#endif`,eg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,tg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ng=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ig=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,sg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,rg=`uniform sampler2D t2D;
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
}`,og=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ag=`#ifdef ENVMAP_TYPE_CUBE
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
}`,cg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,lg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hg=`#include <common>
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
}`,ug=`#if DEPTH_PACKING == 3200
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
}`,dg=`#define DISTANCE
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
}`,fg=`#define DISTANCE
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
}`,pg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,mg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gg=`uniform float scale;
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
}`,_g=`uniform vec3 diffuse;
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
}`,xg=`#include <common>
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
}`,yg=`uniform vec3 diffuse;
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
}`,vg=`#define LAMBERT
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
}`,Mg=`#define LAMBERT
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
}`,Sg=`#define MATCAP
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
}`,bg=`#define MATCAP
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
}`,Tg=`#define NORMAL
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
}`,wg=`#define NORMAL
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
}`,Eg=`#define PHONG
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
}`,Ag=`#define PHONG
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
}`,Rg=`#define STANDARD
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
}`,Cg=`#define STANDARD
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
}`,Ig=`#define TOON
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
}`,Pg=`#define TOON
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
}`,Lg=`uniform float size;
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
}`,Dg=`uniform vec3 diffuse;
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
}`,Ng=`#include <common>
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
}`,Ug=`uniform vec3 color;
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
}`,Fg=`uniform float rotation;
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
}`,Og=`uniform vec3 diffuse;
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
}`,ze={alphahash_fragment:rp,alphahash_pars_fragment:op,alphamap_fragment:ap,alphamap_pars_fragment:cp,alphatest_fragment:lp,alphatest_pars_fragment:hp,aomap_fragment:up,aomap_pars_fragment:dp,batching_pars_vertex:fp,batching_vertex:pp,begin_vertex:mp,beginnormal_vertex:gp,bsdfs:_p,iridescence_fragment:xp,bumpmap_pars_fragment:yp,clipping_planes_fragment:vp,clipping_planes_pars_fragment:Mp,clipping_planes_pars_vertex:Sp,clipping_planes_vertex:bp,color_fragment:Tp,color_pars_fragment:wp,color_pars_vertex:Ep,color_vertex:Ap,common:Rp,cube_uv_reflection_fragment:Cp,defaultnormal_vertex:Ip,displacementmap_pars_vertex:Pp,displacementmap_vertex:Lp,emissivemap_fragment:Dp,emissivemap_pars_fragment:Np,colorspace_fragment:Up,colorspace_pars_fragment:Fp,envmap_fragment:Op,envmap_common_pars_fragment:Bp,envmap_pars_fragment:zp,envmap_pars_vertex:kp,envmap_physical_pars_fragment:Jp,envmap_vertex:Vp,fog_vertex:Hp,fog_pars_vertex:Gp,fog_fragment:Wp,fog_pars_fragment:Xp,gradientmap_pars_fragment:qp,lightmap_pars_fragment:Yp,lights_lambert_fragment:Zp,lights_lambert_pars_fragment:Kp,lights_pars_begin:$p,lights_toon_fragment:jp,lights_toon_pars_fragment:Qp,lights_phong_fragment:em,lights_phong_pars_fragment:tm,lights_physical_fragment:nm,lights_physical_pars_fragment:im,lights_fragment_begin:sm,lights_fragment_maps:rm,lights_fragment_end:om,logdepthbuf_fragment:am,logdepthbuf_pars_fragment:cm,logdepthbuf_pars_vertex:lm,logdepthbuf_vertex:hm,map_fragment:um,map_pars_fragment:dm,map_particle_fragment:fm,map_particle_pars_fragment:pm,metalnessmap_fragment:mm,metalnessmap_pars_fragment:gm,morphinstance_vertex:_m,morphcolor_vertex:xm,morphnormal_vertex:ym,morphtarget_pars_vertex:vm,morphtarget_vertex:Mm,normal_fragment_begin:Sm,normal_fragment_maps:bm,normal_pars_fragment:Tm,normal_pars_vertex:wm,normal_vertex:Em,normalmap_pars_fragment:Am,clearcoat_normal_fragment_begin:Rm,clearcoat_normal_fragment_maps:Cm,clearcoat_pars_fragment:Im,iridescence_pars_fragment:Pm,opaque_fragment:Lm,packing:Dm,premultiplied_alpha_fragment:Nm,project_vertex:Um,dithering_fragment:Fm,dithering_pars_fragment:Om,roughnessmap_fragment:Bm,roughnessmap_pars_fragment:zm,shadowmap_pars_fragment:km,shadowmap_pars_vertex:Vm,shadowmap_vertex:Hm,shadowmask_pars_fragment:Gm,skinbase_vertex:Wm,skinning_pars_vertex:Xm,skinning_vertex:qm,skinnormal_vertex:Ym,specularmap_fragment:Zm,specularmap_pars_fragment:Km,tonemapping_fragment:$m,tonemapping_pars_fragment:Jm,transmission_fragment:jm,transmission_pars_fragment:Qm,uv_pars_fragment:eg,uv_pars_vertex:tg,uv_vertex:ng,worldpos_vertex:ig,background_vert:sg,background_frag:rg,backgroundCube_vert:og,backgroundCube_frag:ag,cube_vert:cg,cube_frag:lg,depth_vert:hg,depth_frag:ug,distanceRGBA_vert:dg,distanceRGBA_frag:fg,equirect_vert:pg,equirect_frag:mg,linedashed_vert:gg,linedashed_frag:_g,meshbasic_vert:xg,meshbasic_frag:yg,meshlambert_vert:vg,meshlambert_frag:Mg,meshmatcap_vert:Sg,meshmatcap_frag:bg,meshnormal_vert:Tg,meshnormal_frag:wg,meshphong_vert:Eg,meshphong_frag:Ag,meshphysical_vert:Rg,meshphysical_frag:Cg,meshtoon_vert:Ig,meshtoon_frag:Pg,points_vert:Lg,points_frag:Dg,shadow_vert:Ng,shadow_frag:Ug,sprite_vert:Fg,sprite_frag:Og},re={common:{diffuse:{value:new we(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Fe}},envmap:{envMap:{value:null},envMapRotation:{value:new Fe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Fe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Fe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Fe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Fe},normalScale:{value:new Ae(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Fe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Fe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Fe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Fe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new we(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new we(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0},uvTransform:{value:new Fe}},sprite:{diffuse:{value:new we(16777215)},opacity:{value:1},center:{value:new Ae(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}}},Un={basic:{uniforms:Ut([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.fog]),vertexShader:ze.meshbasic_vert,fragmentShader:ze.meshbasic_frag},lambert:{uniforms:Ut([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new we(0)}}]),vertexShader:ze.meshlambert_vert,fragmentShader:ze.meshlambert_frag},phong:{uniforms:Ut([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new we(0)},specular:{value:new we(1118481)},shininess:{value:30}}]),vertexShader:ze.meshphong_vert,fragmentShader:ze.meshphong_frag},standard:{uniforms:Ut([re.common,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.roughnessmap,re.metalnessmap,re.fog,re.lights,{emissive:{value:new we(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag},toon:{uniforms:Ut([re.common,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.gradientmap,re.fog,re.lights,{emissive:{value:new we(0)}}]),vertexShader:ze.meshtoon_vert,fragmentShader:ze.meshtoon_frag},matcap:{uniforms:Ut([re.common,re.bumpmap,re.normalmap,re.displacementmap,re.fog,{matcap:{value:null}}]),vertexShader:ze.meshmatcap_vert,fragmentShader:ze.meshmatcap_frag},points:{uniforms:Ut([re.points,re.fog]),vertexShader:ze.points_vert,fragmentShader:ze.points_frag},dashed:{uniforms:Ut([re.common,re.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ze.linedashed_vert,fragmentShader:ze.linedashed_frag},depth:{uniforms:Ut([re.common,re.displacementmap]),vertexShader:ze.depth_vert,fragmentShader:ze.depth_frag},normal:{uniforms:Ut([re.common,re.bumpmap,re.normalmap,re.displacementmap,{opacity:{value:1}}]),vertexShader:ze.meshnormal_vert,fragmentShader:ze.meshnormal_frag},sprite:{uniforms:Ut([re.sprite,re.fog]),vertexShader:ze.sprite_vert,fragmentShader:ze.sprite_frag},background:{uniforms:{uvTransform:{value:new Fe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ze.background_vert,fragmentShader:ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Fe}},vertexShader:ze.backgroundCube_vert,fragmentShader:ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ze.cube_vert,fragmentShader:ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ze.equirect_vert,fragmentShader:ze.equirect_frag},distanceRGBA:{uniforms:Ut([re.common,re.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ze.distanceRGBA_vert,fragmentShader:ze.distanceRGBA_frag},shadow:{uniforms:Ut([re.lights,re.fog,{color:{value:new we(0)},opacity:{value:1}}]),vertexShader:ze.shadow_vert,fragmentShader:ze.shadow_frag}};Un.physical={uniforms:Ut([Un.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Fe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Fe},clearcoatNormalScale:{value:new Ae(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Fe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Fe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Fe},sheen:{value:0},sheenColor:{value:new we(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Fe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Fe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Fe},transmissionSamplerSize:{value:new Ae},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Fe},attenuationDistance:{value:0},attenuationColor:{value:new we(0)},specularColor:{value:new we(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Fe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Fe},anisotropyVector:{value:new Ae},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Fe}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag};var $a={r:0,b:0,g:0},Vi=new xn,Bg=new Ue;function zg(s,e,t,n,i,r,o){let a=new we(0),c=r===!0?0:1,l,u,h=null,d=0,f=null;function g(w){let v=w.isScene===!0?w.background:null;return v&&v.isTexture&&(v=(w.backgroundBlurriness>0?t:e).get(v)),v}function _(w){let v=!1,C=g(w);C===null?p(a,c):C&&C.isColor&&(p(C,1),v=!0);let A=s.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,o):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(s.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function m(w,v){let C=g(v);C&&(C.isCubeTexture||C.mapping===Xr)?(u===void 0&&(u=new Ze(new hi(1,1,1),new yn({name:"BackgroundCubeMaterial",uniforms:ki(Un.backgroundCube.uniforms),vertexShader:Un.backgroundCube.vertexShader,fragmentShader:Un.backgroundCube.fragmentShader,side:Ht,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(A,S,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),Vi.copy(v.backgroundRotation),Vi.x*=-1,Vi.y*=-1,Vi.z*=-1,C.isCubeTexture&&C.isRenderTargetTexture===!1&&(Vi.y*=-1,Vi.z*=-1),u.material.uniforms.envMap.value=C,u.material.uniforms.flipEnvMap.value=C.isCubeTexture&&C.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Bg.makeRotationFromEuler(Vi)),u.material.toneMapped=We.getTransfer(C.colorSpace)!==et,(h!==C||d!==C.version||f!==s.toneMapping)&&(u.material.needsUpdate=!0,h=C,d=C.version,f=s.toneMapping),u.layers.enableAll(),w.unshift(u,u.geometry,u.material,0,0,null)):C&&C.isTexture&&(l===void 0&&(l=new Ze(new vn(2,2),new yn({name:"BackgroundMaterial",uniforms:ki(Un.background.uniforms),vertexShader:Un.background.vertexShader,fragmentShader:Un.background.fragmentShader,side:_n,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=C,l.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,l.material.toneMapped=We.getTransfer(C.colorSpace)!==et,C.matrixAutoUpdate===!0&&C.updateMatrix(),l.material.uniforms.uvTransform.value.copy(C.matrix),(h!==C||d!==C.version||f!==s.toneMapping)&&(l.material.needsUpdate=!0,h=C,d=C.version,f=s.toneMapping),l.layers.enableAll(),w.unshift(l,l.geometry,l.material,0,0,null))}function p(w,v){w.getRGB($a,fl(s)),n.buffers.color.setClear($a.r,$a.g,$a.b,v,o)}function b(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(w,v=1){a.set(w),c=v,p(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(w){c=w,p(a,c)},render:_,addToRenderList:m,dispose:b}}function kg(s,e){let t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=d(null),r=i,o=!1;function a(M,P,U,B,H){let q=!1,W=h(B,U,P);r!==W&&(r=W,l(r.object)),q=f(M,B,U,H),q&&g(M,B,U,H),H!==null&&e.update(H,s.ELEMENT_ARRAY_BUFFER),(q||o)&&(o=!1,v(M,P,U,B),H!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(H).buffer))}function c(){return s.createVertexArray()}function l(M){return s.bindVertexArray(M)}function u(M){return s.deleteVertexArray(M)}function h(M,P,U){let B=U.wireframe===!0,H=n[M.id];H===void 0&&(H={},n[M.id]=H);let q=H[P.id];q===void 0&&(q={},H[P.id]=q);let W=q[B];return W===void 0&&(W=d(c()),q[B]=W),W}function d(M){let P=[],U=[],B=[];for(let H=0;H<t;H++)P[H]=0,U[H]=0,B[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:U,attributeDivisors:B,object:M,attributes:{},index:null}}function f(M,P,U,B){let H=r.attributes,q=P.attributes,W=0,te=U.getAttributes();for(let V in te)if(te[V].location>=0){let he=H[V],be=q[V];if(be===void 0&&(V==="instanceMatrix"&&M.instanceMatrix&&(be=M.instanceMatrix),V==="instanceColor"&&M.instanceColor&&(be=M.instanceColor)),he===void 0||he.attribute!==be||be&&he.data!==be.data)return!0;W++}return r.attributesNum!==W||r.index!==B}function g(M,P,U,B){let H={},q=P.attributes,W=0,te=U.getAttributes();for(let V in te)if(te[V].location>=0){let he=q[V];he===void 0&&(V==="instanceMatrix"&&M.instanceMatrix&&(he=M.instanceMatrix),V==="instanceColor"&&M.instanceColor&&(he=M.instanceColor));let be={};be.attribute=he,he&&he.data&&(be.data=he.data),H[V]=be,W++}r.attributes=H,r.attributesNum=W,r.index=B}function _(){let M=r.newAttributes;for(let P=0,U=M.length;P<U;P++)M[P]=0}function m(M){p(M,0)}function p(M,P){let U=r.newAttributes,B=r.enabledAttributes,H=r.attributeDivisors;U[M]=1,B[M]===0&&(s.enableVertexAttribArray(M),B[M]=1),H[M]!==P&&(s.vertexAttribDivisor(M,P),H[M]=P)}function b(){let M=r.newAttributes,P=r.enabledAttributes;for(let U=0,B=P.length;U<B;U++)P[U]!==M[U]&&(s.disableVertexAttribArray(U),P[U]=0)}function w(M,P,U,B,H,q,W){W===!0?s.vertexAttribIPointer(M,P,U,H,q):s.vertexAttribPointer(M,P,U,B,H,q)}function v(M,P,U,B){_();let H=B.attributes,q=U.getAttributes(),W=P.defaultAttributeValues;for(let te in q){let V=q[te];if(V.location>=0){let oe=H[te];if(oe===void 0&&(te==="instanceMatrix"&&M.instanceMatrix&&(oe=M.instanceMatrix),te==="instanceColor"&&M.instanceColor&&(oe=M.instanceColor)),oe!==void 0){let he=oe.normalized,be=oe.itemSize,ke=e.get(oe);if(ke===void 0)continue;let ot=ke.buffer,lt=ke.type,Je=ke.bytesPerElement,Y=lt===s.INT||lt===s.UNSIGNED_INT||oe.gpuType===pa;if(oe.isInterleavedBufferAttribute){let $=oe.data,fe=$.stride,Le=oe.offset;if($.isInstancedInterleavedBuffer){for(let Se=0;Se<V.locationSize;Se++)p(V.location+Se,$.meshPerAttribute);M.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let Se=0;Se<V.locationSize;Se++)m(V.location+Se);s.bindBuffer(s.ARRAY_BUFFER,ot);for(let Se=0;Se<V.locationSize;Se++)w(V.location+Se,be/V.locationSize,lt,he,fe*Je,(Le+be/V.locationSize*Se)*Je,Y)}else{if(oe.isInstancedBufferAttribute){for(let $=0;$<V.locationSize;$++)p(V.location+$,oe.meshPerAttribute);M.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let $=0;$<V.locationSize;$++)m(V.location+$);s.bindBuffer(s.ARRAY_BUFFER,ot);for(let $=0;$<V.locationSize;$++)w(V.location+$,be/V.locationSize,lt,he,be*Je,be/V.locationSize*$*Je,Y)}}else if(W!==void 0){let he=W[te];if(he!==void 0)switch(he.length){case 2:s.vertexAttrib2fv(V.location,he);break;case 3:s.vertexAttrib3fv(V.location,he);break;case 4:s.vertexAttrib4fv(V.location,he);break;default:s.vertexAttrib1fv(V.location,he)}}}}b()}function C(){R();for(let M in n){let P=n[M];for(let U in P){let B=P[U];for(let H in B)u(B[H].object),delete B[H];delete P[U]}delete n[M]}}function A(M){if(n[M.id]===void 0)return;let P=n[M.id];for(let U in P){let B=P[U];for(let H in B)u(B[H].object),delete B[H];delete P[U]}delete n[M.id]}function S(M){for(let P in n){let U=n[P];if(U[M.id]===void 0)continue;let B=U[M.id];for(let H in B)u(B[H].object),delete B[H];delete U[M.id]}}function R(){x(),o=!0,r!==i&&(r=i,l(r.object))}function x(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:R,resetDefaultState:x,dispose:C,releaseStatesOfGeometry:A,releaseStatesOfProgram:S,initAttributes:_,enableAttribute:m,disableUnusedAttributes:b}}function Vg(s,e,t){let n;function i(l){n=l}function r(l,u){s.drawArrays(n,l,u),t.update(u,n,1)}function o(l,u,h){h!==0&&(s.drawArraysInstanced(n,l,u,h),t.update(u,n,h))}function a(l,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,u,0,h);let f=0;for(let g=0;g<h;g++)f+=u[g];t.update(f,n,1)}function c(l,u,h,d){if(h===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<l.length;g++)o(l[g],u[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(n,l,0,u,0,d,0,h);let g=0;for(let _=0;_<h;_++)g+=u[_]*d[_];t.update(g,n,1)}}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function Hg(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){let S=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(S.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(S){return!(S!==tn&&n.convert(S)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(S){let R=S===Vs&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(S!==Sn&&n.convert(S)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&S!==an&&!R)}function c(S){if(S==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";S="mediump"}return S==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",u=c(l);u!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);let h=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),b=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),w=s.getParameter(s.MAX_VARYING_VECTORS),v=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),C=g>0,A=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:b,maxVaryings:w,maxFragmentUniforms:v,vertexTextures:C,maxSamples:A}}function Gg(s){let e=this,t=null,n=0,i=!1,r=!1,o=new Tn,a=new Fe,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let f=h.length!==0||d||n!==0||i;return i=d,n=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){let g=h.clippingPlanes,_=h.clipIntersection,m=h.clipShadows,p=s.get(h);if(!i||g===null||g.length===0||r&&!m)r?u(null):l();else{let b=r?0:n,w=b*4,v=p.clippingState||null;c.value=v,v=u(g,d,w,f);for(let C=0;C!==w;++C)v[C]=t[C];p.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=b}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,f,g){let _=h!==null?h.length:0,m=null;if(_!==0){if(m=c.value,g!==!0||m===null){let p=f+_*4,b=d.matrixWorldInverse;a.getNormalMatrix(b),(m===null||m.length<p)&&(m=new Float32Array(p));for(let w=0,v=f;w!==_;++w,v+=4)o.copy(h[w]).applyMatrix4(b,a),o.normal.toArray(m,v),m[v+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function Wg(s){let e=new WeakMap;function t(o,a){return a===ua?o.mapping=Oi:a===da&&(o.mapping=Bi),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===ua||a===da)if(e.has(o)){let c=e.get(o).texture;return t(c,o.mapping)}else{let c=o.image;if(c&&c.height>0){let l=new Go(c.height);return l.fromEquirectangularTexture(s,o),e.set(o,l),o.addEventListener("dispose",i),t(l.texture,o.mapping)}else return null}}return o}function i(o){let a=o.target;a.removeEventListener("dispose",i);let c=e.get(a);c!==void 0&&(e.delete(a),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var qs=4,id=[.125,.215,.35,.446,.526,.582],Wi=20,_l=new Jn,sd=new we,xl=null,yl=0,vl=0,Ml=!1,Gi=(1+Math.sqrt(5))/2,Xs=1/Gi,rd=[new L(-Gi,Xs,0),new L(Gi,Xs,0),new L(-Xs,0,Gi),new L(Xs,0,Gi),new L(0,Gi,-Xs),new L(0,Gi,Xs),new L(-1,1,-1),new L(1,1,-1),new L(-1,1,1),new L(1,1,1)],Xg=new L,Qa=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100,r={}){let{size:o=256,position:a=Xg}=r;xl=this._renderer.getRenderTarget(),yl=this._renderer.getActiveCubeFace(),vl=this._renderer.getActiveMipmapLevel(),Ml=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,i,c,a),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=cd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ad(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(xl,yl,vl),this._renderer.xr.enabled=Ml,e.scissorTest=!1,Ja(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Oi||e.mapping===Bi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),xl=this._renderer.getRenderTarget(),yl=this._renderer.getActiveCubeFace(),vl=this._renderer.getActiveMipmapLevel(),Ml=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:kt,minFilter:kt,generateMipmaps:!1,type:Vs,format:tn,colorSpace:It,depthBuffer:!1},i=od(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=od(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=qg(r)),this._blurMaterial=Yg(r,e,t)}return i}_compileMaterial(e){let t=new Ze(this._lodPlanes[0],e);this._renderer.compile(t,_l)}_sceneToCubeUV(e,t,n,i,r){let c=new Rt(90,1,t,n),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(sd),h.toneMapping=ei,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(i),h.clearDepth(),h.setRenderTarget(null));let _=new tt({name:"PMREM.Background",side:Ht,depthWrite:!1,depthTest:!1}),m=new Ze(new hi,_),p=!1,b=e.background;b?b.isColor&&(_.color.copy(b),e.background=null,p=!0):(_.color.copy(sd),p=!0);for(let w=0;w<6;w++){let v=w%3;v===0?(c.up.set(0,l[w],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+u[w],r.y,r.z)):v===1?(c.up.set(0,0,l[w]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+u[w],r.z)):(c.up.set(0,l[w],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+u[w]));let C=this._cubeSize;Ja(i,v*C,w>2?C:0,C,C),h.setRenderTarget(i),p&&h.render(m,c),h.render(e,c)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=f,h.autoClear=d,e.background=b}_textureToCubeUV(e,t){let n=this._renderer,i=e.mapping===Oi||e.mapping===Bi;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=cd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ad());let r=i?this._cubemapMaterial:this._equirectMaterial,o=new Ze(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let c=this._cubeSize;Ja(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(o,_l)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let i=this._lodPlanes.length;for(let r=1;r<i;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=rd[(i-r-1)%rd.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,i,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,i,"latitudinal",r),this._halfBlur(o,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,o,a){let c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new Ze(this._lodPlanes[i],l),d=l.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Wi-1),_=r/g,m=isFinite(r)?1+Math.floor(u*_):Wi;m>Wi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Wi}`);let p=[],b=0;for(let S=0;S<Wi;++S){let R=S/_,x=Math.exp(-R*R/2);p.push(x),S===0?b+=x:S<m&&(b+=2*x)}for(let S=0;S<p.length;S++)p[S]=p[S]/b;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:w}=this;d.dTheta.value=g,d.mipInt.value=w-n;let v=this._sizeLods[i],C=3*v*(i>w-qs?i-w+qs:0),A=4*(this._cubeSize-v);Ja(t,C,A,3*v,2*v),c.setRenderTarget(t),c.render(h,_l)}};function qg(s){let e=[],t=[],n=[],i=s,r=s-qs+1+id.length;for(let o=0;o<r;o++){let a=Math.pow(2,i);t.push(a);let c=1/a;o>s-qs?c=id[o-s+qs-1]:o===0&&(c=0),n.push(c);let l=1/(a-2),u=-l,h=1+l,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,_=3,m=2,p=1,b=new Float32Array(_*g*f),w=new Float32Array(m*g*f),v=new Float32Array(p*g*f);for(let A=0;A<f;A++){let S=A%3*2/3-1,R=A>2?0:-1,x=[S,R,0,S+2/3,R,0,S+2/3,R+1,0,S,R,0,S+2/3,R+1,0,S,R+1,0];b.set(x,_*g*A),w.set(d,m*g*A);let M=[A,A,A,A,A,A];v.set(M,p*g*A)}let C=new yt;C.setAttribute("position",new Mt(b,_)),C.setAttribute("uv",new Mt(w,m)),C.setAttribute("faceIndex",new Mt(v,p)),e.push(C),i>qs&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function od(s,e,t){let n=new Cn(s,e,t);return n.texture.mapping=Xr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ja(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function Yg(s,e,t){let n=new Float32Array(Wi),i=new L(0,1,0);return new yn({name:"SphericalGaussianBlur",defines:{n:Wi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Pl(),fragmentShader:`

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
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function ad(){return new yn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Pl(),fragmentShader:`

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
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function cd(){return new yn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Pl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function Pl(){return`

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
	`}function Zg(s){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let c=a.mapping,l=c===ua||c===da,u=c===Oi||c===Bi;if(l||u){let h=e.get(a),d=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return t===null&&(t=new Qa(s)),h=l?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{let f=a.image;return l&&f&&f.height>0||u&&f&&i(f)?(t===null&&(t=new Qa(s)),h=l?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function i(a){let c=0,l=6;for(let u=0;u<l;u++)a[u]!==void 0&&c++;return c===l}function r(a){let c=a.target;c.removeEventListener("dispose",r);let l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Kg(s){let e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let i=t(n);return i===null&&vs("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function $g(s,e,t,n){let i={},r=new WeakMap;function o(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete i[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return i[d.id]===!0||(d.addEventListener("dispose",o),i[d.id]=!0,t.memory.geometries++),d}function c(h){let d=h.attributes;for(let f in d)e.update(d[f],s.ARRAY_BUFFER)}function l(h){let d=[],f=h.index,g=h.attributes.position,_=0;if(f!==null){let b=f.array;_=f.version;for(let w=0,v=b.length;w<v;w+=3){let C=b[w+0],A=b[w+1],S=b[w+2];d.push(C,A,A,S,S,C)}}else if(g!==void 0){let b=g.array;_=g.version;for(let w=0,v=b.length/3-1;w<v;w+=3){let C=w+0,A=w+1,S=w+2;d.push(C,A,A,S,S,C)}}else return;let m=new(dl(d)?xr:_r)(d,1);m.version=_;let p=r.get(h);p&&e.remove(p),r.set(h,m)}function u(h){let d=r.get(h);if(d){let f=h.index;f!==null&&d.version<f.version&&l(h)}else l(h);return r.get(h)}return{get:a,update:c,getWireframeAttribute:u}}function Jg(s,e,t){let n;function i(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function c(d,f){s.drawElements(n,f,r,d*o),t.update(f,n,1)}function l(d,f,g){g!==0&&(s.drawElementsInstanced(n,f,r,d*o,g),t.update(f,n,g))}function u(d,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,n,1)}function h(d,f,g,_){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<d.length;p++)l(d[p]/o,f[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,_,0,g);let p=0;for(let b=0;b<g;b++)p+=f[b]*_[b];t.update(p,n,1)}}this.setMode=i,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function jg(s){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case s.TRIANGLES:t.triangles+=a*(r/3);break;case s.LINES:t.lines+=a*(r/2);break;case s.LINE_STRIP:t.lines+=a*(r-1);break;case s.LINE_LOOP:t.lines+=a*r;break;case s.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function Qg(s,e,t){let n=new WeakMap,i=new $e;function r(o,a,c){let l=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,d=n.get(a);if(d===void 0||d.count!==h){let x=function(){S.dispose(),n.delete(a),a.removeEventListener("dispose",x)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],b=a.morphAttributes.color||[],w=0;f===!0&&(w=1),g===!0&&(w=2),_===!0&&(w=3);let v=a.attributes.position.count*w,C=1;v>e.maxTextureSize&&(C=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let A=new Float32Array(v*C*4*h),S=new mr(A,v,C,h);S.type=an,S.needsUpdate=!0;let R=w*4;for(let M=0;M<h;M++){let P=m[M],U=p[M],B=b[M],H=v*C*4*M;for(let q=0;q<P.count;q++){let W=q*R;f===!0&&(i.fromBufferAttribute(P,q),A[H+W+0]=i.x,A[H+W+1]=i.y,A[H+W+2]=i.z,A[H+W+3]=0),g===!0&&(i.fromBufferAttribute(U,q),A[H+W+4]=i.x,A[H+W+5]=i.y,A[H+W+6]=i.z,A[H+W+7]=0),_===!0&&(i.fromBufferAttribute(B,q),A[H+W+8]=i.x,A[H+W+9]=i.y,A[H+W+10]=i.z,A[H+W+11]=B.itemSize===4?i.w:1)}}d={count:h,texture:S,size:new Ae(v,C)},n.set(a,d),a.addEventListener("dispose",x)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(s,"morphTexture",o.morphTexture,t);else{let f=0;for(let _=0;_<l.length;_++)f+=l[_];let g=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(s,"morphTargetBaseInfluence",g),c.getUniforms().setValue(s,"morphTargetInfluences",l)}c.getUniforms().setValue(s,"morphTargetsTexture",d.texture,t),c.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function e_(s,e,t,n){let i=new WeakMap;function r(c){let l=n.render.frame,u=c.geometry,h=e.get(c,u);if(i.get(h)!==l&&(e.update(h),i.set(h,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),i.get(c)!==l&&(t.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,s.ARRAY_BUFFER),i.set(c,l))),c.isSkinnedMesh){let d=c.skeleton;i.get(d)!==l&&(d.update(),i.set(d,l))}return h}function o(){i=new WeakMap}function a(c){let l=c.target;l.removeEventListener("dispose",a),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:o}}var Ad=new St,ld=new Ir(1,1),Rd=new mr,Cd=new Vo,Id=new vr,hd=[],ud=[],dd=new Float32Array(16),fd=new Float32Array(9),pd=new Float32Array(4);function Zs(s,e,t){let n=s[0];if(n<=0||n>0)return s;let i=e*t,r=hd[i];if(r===void 0&&(r=new Float32Array(i),hd[i]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,s[o].toArray(r,a)}return r}function Tt(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function wt(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function tc(s,e){let t=ud[e];t===void 0&&(t=new Int32Array(e),ud[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function t_(s,e){let t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function n_(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;s.uniform2fv(this.addr,e),wt(t,e)}}function i_(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Tt(t,e))return;s.uniform3fv(this.addr,e),wt(t,e)}}function s_(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;s.uniform4fv(this.addr,e),wt(t,e)}}function r_(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,n))return;pd.set(n),s.uniformMatrix2fv(this.addr,!1,pd),wt(t,n)}}function o_(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,n))return;fd.set(n),s.uniformMatrix3fv(this.addr,!1,fd),wt(t,n)}}function a_(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,n))return;dd.set(n),s.uniformMatrix4fv(this.addr,!1,dd),wt(t,n)}}function c_(s,e){let t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function l_(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;s.uniform2iv(this.addr,e),wt(t,e)}}function h_(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Tt(t,e))return;s.uniform3iv(this.addr,e),wt(t,e)}}function u_(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;s.uniform4iv(this.addr,e),wt(t,e)}}function d_(s,e){let t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function f_(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;s.uniform2uiv(this.addr,e),wt(t,e)}}function p_(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Tt(t,e))return;s.uniform3uiv(this.addr,e),wt(t,e)}}function m_(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;s.uniform4uiv(this.addr,e),wt(t,e)}}function g_(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(ld.compareFunction=cl,r=ld):r=Ad,t.setTexture2D(e||r,i)}function __(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Cd,i)}function x_(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Id,i)}function y_(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Rd,i)}function v_(s){switch(s){case 5126:return t_;case 35664:return n_;case 35665:return i_;case 35666:return s_;case 35674:return r_;case 35675:return o_;case 35676:return a_;case 5124:case 35670:return c_;case 35667:case 35671:return l_;case 35668:case 35672:return h_;case 35669:case 35673:return u_;case 5125:return d_;case 36294:return f_;case 36295:return p_;case 36296:return m_;case 35678:case 36198:case 36298:case 36306:case 35682:return g_;case 35679:case 36299:case 36307:return __;case 35680:case 36300:case 36308:case 36293:return x_;case 36289:case 36303:case 36311:case 36292:return y_}}function M_(s,e){s.uniform1fv(this.addr,e)}function S_(s,e){let t=Zs(e,this.size,2);s.uniform2fv(this.addr,t)}function b_(s,e){let t=Zs(e,this.size,3);s.uniform3fv(this.addr,t)}function T_(s,e){let t=Zs(e,this.size,4);s.uniform4fv(this.addr,t)}function w_(s,e){let t=Zs(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function E_(s,e){let t=Zs(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function A_(s,e){let t=Zs(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function R_(s,e){s.uniform1iv(this.addr,e)}function C_(s,e){s.uniform2iv(this.addr,e)}function I_(s,e){s.uniform3iv(this.addr,e)}function P_(s,e){s.uniform4iv(this.addr,e)}function L_(s,e){s.uniform1uiv(this.addr,e)}function D_(s,e){s.uniform2uiv(this.addr,e)}function N_(s,e){s.uniform3uiv(this.addr,e)}function U_(s,e){s.uniform4uiv(this.addr,e)}function F_(s,e,t){let n=this.cache,i=e.length,r=tc(t,i);Tt(n,r)||(s.uniform1iv(this.addr,r),wt(n,r));for(let o=0;o!==i;++o)t.setTexture2D(e[o]||Ad,r[o])}function O_(s,e,t){let n=this.cache,i=e.length,r=tc(t,i);Tt(n,r)||(s.uniform1iv(this.addr,r),wt(n,r));for(let o=0;o!==i;++o)t.setTexture3D(e[o]||Cd,r[o])}function B_(s,e,t){let n=this.cache,i=e.length,r=tc(t,i);Tt(n,r)||(s.uniform1iv(this.addr,r),wt(n,r));for(let o=0;o!==i;++o)t.setTextureCube(e[o]||Id,r[o])}function z_(s,e,t){let n=this.cache,i=e.length,r=tc(t,i);Tt(n,r)||(s.uniform1iv(this.addr,r),wt(n,r));for(let o=0;o!==i;++o)t.setTexture2DArray(e[o]||Rd,r[o])}function k_(s){switch(s){case 5126:return M_;case 35664:return S_;case 35665:return b_;case 35666:return T_;case 35674:return w_;case 35675:return E_;case 35676:return A_;case 5124:case 35670:return R_;case 35667:case 35671:return C_;case 35668:case 35672:return I_;case 35669:case 35673:return P_;case 5125:return L_;case 36294:return D_;case 36295:return N_;case 36296:return U_;case 35678:case 36198:case 36298:case 36306:case 35682:return F_;case 35679:case 36299:case 36307:return O_;case 35680:case 36300:case 36308:case 36293:return B_;case 36289:case 36303:case 36311:case 36292:return z_}}var bl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=v_(t.type)}},Tl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=k_(t.type)}},wl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let i=this.seq;for(let r=0,o=i.length;r!==o;++r){let a=i[r];a.setValue(e,t[a.id],n)}}},Sl=/(\w+)(\])?(\[|\.)?/g;function md(s,e){s.seq.push(e),s.map[e.id]=e}function V_(s,e,t){let n=s.name,i=n.length;for(Sl.lastIndex=0;;){let r=Sl.exec(n),o=Sl.lastIndex,a=r[1],c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===i){md(t,l===void 0?new bl(a,s,e):new Tl(a,s,e));break}else{let h=t.map[a];h===void 0&&(h=new wl(a),md(t,h)),t=h}}}var Ys=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){let r=e.getActiveUniform(t,i),o=e.getUniformLocation(t,r.name);V_(r,o,this)}}setValue(e,t,n,i){let r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){let i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,o=t.length;r!==o;++r){let a=t[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,i)}}static seqWithValue(e,t){let n=[];for(let i=0,r=e.length;i!==r;++i){let o=e[i];o.id in t&&n.push(o)}return n}};function gd(s,e,t){let n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}var H_=37297,G_=0;function W_(s,e){let t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=i;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var _d=new Fe;function X_(s){We._getMatrix(_d,We.workingColorSpace,s);let e=`mat3( ${_d.elements.map(t=>t.toFixed(4))} )`;switch(We.getTransfer(s)){case fr:return[e,"LinearTransferOETF"];case et:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function xd(s,e,t){let n=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+W_(s.getShaderSource(e),a)}else return r}function q_(s,e){let t=X_(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Y_(s,e){let t;switch(e){case Cu:t="Linear";break;case Iu:t="Reinhard";break;case Pu:t="Cineon";break;case ha:t="ACESFilmic";break;case Du:t="AgX";break;case Nu:t="Neutral";break;case Lu:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var ja=new L;function Z_(){We.getLuminanceCoefficients(ja);let s=ja.x.toFixed(4),e=ja.y.toFixed(4),t=ja.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function K_(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Jr).join(`
`)}function $_(s){let e=[];for(let t in s){let n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function J_(s,e){let t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){let r=s.getActiveAttrib(e,i),o=r.name,a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:s.getAttribLocation(e,o),locationSize:a}}return t}function Jr(s){return s!==""}function yd(s,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function vd(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var j_=/^[ \t]*#include +<([\w\d./]+)>/gm;function El(s){return s.replace(j_,e0)}var Q_=new Map;function e0(s,e){let t=ze[e];if(t===void 0){let n=Q_.get(e);if(n!==void 0)t=ze[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return El(t)}var t0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Md(s){return s.replace(t0,n0)}function n0(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function Sd(s){let e=`precision ${s.precision} float;
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
#define LOW_PRECISION`),e}function i0(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===Zc?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===na?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Nn&&(e="SHADOWMAP_TYPE_VSM"),e}function s0(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Oi:case Bi:e="ENVMAP_TYPE_CUBE";break;case Xr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function r0(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case Bi:e="ENVMAP_MODE_REFRACTION";break}return e}function o0(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Jc:e="ENVMAP_BLENDING_MULTIPLY";break;case Au:e="ENVMAP_BLENDING_MIX";break;case Ru:e="ENVMAP_BLENDING_ADD";break}return e}function a0(s){let e=s.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function c0(s,e,t,n){let i=s.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,c=i0(t),l=s0(t),u=r0(t),h=o0(t),d=a0(t),f=K_(t),g=$_(r),_=i.createProgram(),m,p,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Jr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Jr).join(`
`),p.length>0&&(p+=`
`)):(m=[Sd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Jr).join(`
`),p=[Sd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ei?"#define TONE_MAPPING":"",t.toneMapping!==ei?ze.tonemapping_pars_fragment:"",t.toneMapping!==ei?Y_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ze.colorspace_pars_fragment,q_("linearToOutputTexel",t.outputColorSpace),Z_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Jr).join(`
`)),o=El(o),o=yd(o,t),o=vd(o,t),a=El(a),a=yd(a,t),a=vd(a,t),o=Md(o),a=Md(a),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===ll?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ll?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let w=b+m+o,v=b+p+a,C=gd(i,i.VERTEX_SHADER,w),A=gd(i,i.FRAGMENT_SHADER,v);i.attachShader(_,C),i.attachShader(_,A),t.index0AttributeName!==void 0?i.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(_,0,"position"),i.linkProgram(_);function S(P){if(s.debug.checkShaderErrors){let U=i.getProgramInfoLog(_)||"",B=i.getShaderInfoLog(C)||"",H=i.getShaderInfoLog(A)||"",q=U.trim(),W=B.trim(),te=H.trim(),V=!0,oe=!0;if(i.getProgramParameter(_,i.LINK_STATUS)===!1)if(V=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,_,C,A);else{let he=xd(i,C,"vertex"),be=xd(i,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(_,i.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+q+`
`+he+`
`+be)}else q!==""?console.warn("THREE.WebGLProgram: Program Info Log:",q):(W===""||te==="")&&(oe=!1);oe&&(P.diagnostics={runnable:V,programLog:q,vertexShader:{log:W,prefix:m},fragmentShader:{log:te,prefix:p}})}i.deleteShader(C),i.deleteShader(A),R=new Ys(i,_),x=J_(i,_)}let R;this.getUniforms=function(){return R===void 0&&S(this),R};let x;this.getAttributes=function(){return x===void 0&&S(this),x};let M=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=i.getProgramParameter(_,H_)),M},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=G_++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=C,this.fragmentShader=A,this}var l0=0,Al=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Rl(e),t.set(e,n)),n}},Rl=class{constructor(e){this.id=l0++,this.code=e,this.usedTimes=0}};function h0(s,e,t,n,i,r,o){let a=new gr,c=new Al,l=new Set,u=[],h=i.logarithmicDepthBuffer,d=i.vertexTextures,f=i.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(x){return l.add(x),x===0?"uv":`uv${x}`}function m(x,M,P,U,B){let H=U.fog,q=B.geometry,W=x.isMeshStandardMaterial?U.environment:null,te=(x.isMeshStandardMaterial?t:e).get(x.envMap||W),V=te&&te.mapping===Xr?te.image.height:null,oe=g[x.type];x.precision!==null&&(f=i.getMaxPrecision(x.precision),f!==x.precision&&console.warn("THREE.WebGLProgram.getParameters:",x.precision,"not supported, using",f,"instead."));let he=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,be=he!==void 0?he.length:0,ke=0;q.morphAttributes.position!==void 0&&(ke=1),q.morphAttributes.normal!==void 0&&(ke=2),q.morphAttributes.color!==void 0&&(ke=3);let ot,lt,Je,Y;if(oe){let je=Un[oe];ot=je.vertexShader,lt=je.fragmentShader}else ot=x.vertexShader,lt=x.fragmentShader,c.update(x),Je=c.getVertexShaderID(x),Y=c.getFragmentShaderID(x);let $=s.getRenderTarget(),fe=s.state.buffers.depth.getReversed(),Le=B.isInstancedMesh===!0,Se=B.isBatchedMesh===!0,qe=!!x.map,Lt=!!x.matcap,I=!!te,ht=!!x.aoMap,Ne=!!x.lightMap,Ie=!!x.bumpMap,ge=!!x.normalMap,ut=!!x.displacementMap,_e=!!x.emissiveMap,Be=!!x.metalnessMap,Et=!!x.roughnessMap,xt=x.anisotropy>0,E=x.clearcoat>0,y=x.dispersion>0,O=x.iridescence>0,X=x.sheen>0,K=x.transmission>0,G=xt&&!!x.anisotropyMap,Me=E&&!!x.clearcoatMap,ne=E&&!!x.clearcoatNormalMap,xe=E&&!!x.clearcoatRoughnessMap,ye=O&&!!x.iridescenceMap,Q=O&&!!x.iridescenceThicknessMap,le=X&&!!x.sheenColorMap,Ce=X&&!!x.sheenRoughnessMap,ve=!!x.specularMap,ae=!!x.specularColorMap,Oe=!!x.specularIntensityMap,D=K&&!!x.transmissionMap,ee=K&&!!x.thicknessMap,ie=!!x.gradientMap,de=!!x.alphaMap,J=x.alphaTest>0,Z=!!x.alphaHash,me=!!x.extensions,De=ei;x.toneMapped&&($===null||$.isXRRenderTarget===!0)&&(De=s.toneMapping);let at={shaderID:oe,shaderType:x.type,shaderName:x.name,vertexShader:ot,fragmentShader:lt,defines:x.defines,customVertexShaderID:Je,customFragmentShaderID:Y,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:f,batching:Se,batchingColor:Se&&B._colorsTexture!==null,instancing:Le,instancingColor:Le&&B.instanceColor!==null,instancingMorph:Le&&B.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:$===null?s.outputColorSpace:$.isXRRenderTarget===!0?$.texture.colorSpace:It,alphaToCoverage:!!x.alphaToCoverage,map:qe,matcap:Lt,envMap:I,envMapMode:I&&te.mapping,envMapCubeUVHeight:V,aoMap:ht,lightMap:Ne,bumpMap:Ie,normalMap:ge,displacementMap:d&&ut,emissiveMap:_e,normalMapObjectSpace:ge&&x.normalMapType===Hu,normalMapTangentSpace:ge&&x.normalMapType===al,metalnessMap:Be,roughnessMap:Et,anisotropy:xt,anisotropyMap:G,clearcoat:E,clearcoatMap:Me,clearcoatNormalMap:ne,clearcoatRoughnessMap:xe,dispersion:y,iridescence:O,iridescenceMap:ye,iridescenceThicknessMap:Q,sheen:X,sheenColorMap:le,sheenRoughnessMap:Ce,specularMap:ve,specularColorMap:ae,specularIntensityMap:Oe,transmission:K,transmissionMap:D,thicknessMap:ee,gradientMap:ie,opaque:x.transparent===!1&&x.blending===Ai&&x.alphaToCoverage===!1,alphaMap:de,alphaTest:J,alphaHash:Z,combine:x.combine,mapUv:qe&&_(x.map.channel),aoMapUv:ht&&_(x.aoMap.channel),lightMapUv:Ne&&_(x.lightMap.channel),bumpMapUv:Ie&&_(x.bumpMap.channel),normalMapUv:ge&&_(x.normalMap.channel),displacementMapUv:ut&&_(x.displacementMap.channel),emissiveMapUv:_e&&_(x.emissiveMap.channel),metalnessMapUv:Be&&_(x.metalnessMap.channel),roughnessMapUv:Et&&_(x.roughnessMap.channel),anisotropyMapUv:G&&_(x.anisotropyMap.channel),clearcoatMapUv:Me&&_(x.clearcoatMap.channel),clearcoatNormalMapUv:ne&&_(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&_(x.clearcoatRoughnessMap.channel),iridescenceMapUv:ye&&_(x.iridescenceMap.channel),iridescenceThicknessMapUv:Q&&_(x.iridescenceThicknessMap.channel),sheenColorMapUv:le&&_(x.sheenColorMap.channel),sheenRoughnessMapUv:Ce&&_(x.sheenRoughnessMap.channel),specularMapUv:ve&&_(x.specularMap.channel),specularColorMapUv:ae&&_(x.specularColorMap.channel),specularIntensityMapUv:Oe&&_(x.specularIntensityMap.channel),transmissionMapUv:D&&_(x.transmissionMap.channel),thicknessMapUv:ee&&_(x.thicknessMap.channel),alphaMapUv:de&&_(x.alphaMap.channel),vertexTangents:!!q.attributes.tangent&&(ge||xt),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!q.attributes.uv&&(qe||de),fog:!!H,useFog:x.fog===!0,fogExp2:!!H&&H.isFogExp2,flatShading:x.flatShading===!0&&x.wireframe===!1,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:fe,skinning:B.isSkinnedMesh===!0,morphTargets:q.morphAttributes.position!==void 0,morphNormals:q.morphAttributes.normal!==void 0,morphColors:q.morphAttributes.color!==void 0,morphTargetsCount:be,morphTextureStride:ke,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:x.dithering,shadowMapEnabled:s.shadowMap.enabled&&P.length>0,shadowMapType:s.shadowMap.type,toneMapping:De,decodeVideoTexture:qe&&x.map.isVideoTexture===!0&&We.getTransfer(x.map.colorSpace)===et,decodeVideoTextureEmissive:_e&&x.emissiveMap.isVideoTexture===!0&&We.getTransfer(x.emissiveMap.colorSpace)===et,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===bt,flipSided:x.side===Ht,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:me&&x.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(me&&x.extensions.multiDraw===!0||Se)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return at.vertexUv1s=l.has(1),at.vertexUv2s=l.has(2),at.vertexUv3s=l.has(3),l.clear(),at}function p(x){let M=[];if(x.shaderID?M.push(x.shaderID):(M.push(x.customVertexShaderID),M.push(x.customFragmentShaderID)),x.defines!==void 0)for(let P in x.defines)M.push(P),M.push(x.defines[P]);return x.isRawShaderMaterial===!1&&(b(M,x),w(M,x),M.push(s.outputColorSpace)),M.push(x.customProgramCacheKey),M.join()}function b(x,M){x.push(M.precision),x.push(M.outputColorSpace),x.push(M.envMapMode),x.push(M.envMapCubeUVHeight),x.push(M.mapUv),x.push(M.alphaMapUv),x.push(M.lightMapUv),x.push(M.aoMapUv),x.push(M.bumpMapUv),x.push(M.normalMapUv),x.push(M.displacementMapUv),x.push(M.emissiveMapUv),x.push(M.metalnessMapUv),x.push(M.roughnessMapUv),x.push(M.anisotropyMapUv),x.push(M.clearcoatMapUv),x.push(M.clearcoatNormalMapUv),x.push(M.clearcoatRoughnessMapUv),x.push(M.iridescenceMapUv),x.push(M.iridescenceThicknessMapUv),x.push(M.sheenColorMapUv),x.push(M.sheenRoughnessMapUv),x.push(M.specularMapUv),x.push(M.specularColorMapUv),x.push(M.specularIntensityMapUv),x.push(M.transmissionMapUv),x.push(M.thicknessMapUv),x.push(M.combine),x.push(M.fogExp2),x.push(M.sizeAttenuation),x.push(M.morphTargetsCount),x.push(M.morphAttributeCount),x.push(M.numDirLights),x.push(M.numPointLights),x.push(M.numSpotLights),x.push(M.numSpotLightMaps),x.push(M.numHemiLights),x.push(M.numRectAreaLights),x.push(M.numDirLightShadows),x.push(M.numPointLightShadows),x.push(M.numSpotLightShadows),x.push(M.numSpotLightShadowsWithMaps),x.push(M.numLightProbes),x.push(M.shadowMapType),x.push(M.toneMapping),x.push(M.numClippingPlanes),x.push(M.numClipIntersection),x.push(M.depthPacking)}function w(x,M){a.disableAll(),M.supportsVertexTextures&&a.enable(0),M.instancing&&a.enable(1),M.instancingColor&&a.enable(2),M.instancingMorph&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),M.dispersion&&a.enable(20),M.batchingColor&&a.enable(21),M.gradientMap&&a.enable(22),x.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.reversedDepthBuffer&&a.enable(4),M.skinning&&a.enable(5),M.morphTargets&&a.enable(6),M.morphNormals&&a.enable(7),M.morphColors&&a.enable(8),M.premultipliedAlpha&&a.enable(9),M.shadowMapEnabled&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),M.decodeVideoTextureEmissive&&a.enable(20),M.alphaToCoverage&&a.enable(21),x.push(a.mask)}function v(x){let M=g[x.type],P;if(M){let U=Un[M];P=Qu.clone(U.uniforms)}else P=x.uniforms;return P}function C(x,M){let P;for(let U=0,B=u.length;U<B;U++){let H=u[U];if(H.cacheKey===M){P=H,++P.usedTimes;break}}return P===void 0&&(P=new c0(s,M,x,r),u.push(P)),P}function A(x){if(--x.usedTimes===0){let M=u.indexOf(x);u[M]=u[u.length-1],u.pop(),x.destroy()}}function S(x){c.remove(x)}function R(){c.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:v,acquireProgram:C,releaseProgram:A,releaseShaderCache:S,programs:u,dispose:R}}function u0(){let s=new WeakMap;function e(o){return s.has(o)}function t(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function n(o){s.delete(o)}function i(o,a,c){s.get(o)[a]=c}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function d0(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function bd(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Td(){let s=[],e=0,t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function o(h,d,f,g,_,m){let p=s[e];return p===void 0?(p={id:h.id,object:h,geometry:d,material:f,groupOrder:g,renderOrder:h.renderOrder,z:_,group:m},s[e]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=h.renderOrder,p.z=_,p.group=m),e++,p}function a(h,d,f,g,_,m){let p=o(h,d,f,g,_,m);f.transmission>0?n.push(p):f.transparent===!0?i.push(p):t.push(p)}function c(h,d,f,g,_,m){let p=o(h,d,f,g,_,m);f.transmission>0?n.unshift(p):f.transparent===!0?i.unshift(p):t.unshift(p)}function l(h,d){t.length>1&&t.sort(h||d0),n.length>1&&n.sort(d||bd),i.length>1&&i.sort(d||bd)}function u(){for(let h=e,d=s.length;h<d;h++){let f=s[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:a,unshift:c,finish:u,sort:l}}function f0(){let s=new WeakMap;function e(n,i){let r=s.get(n),o;return r===void 0?(o=new Td,s.set(n,[o])):i>=r.length?(o=new Td,r.push(o)):o=r[i],o}function t(){s=new WeakMap}return{get:e,dispose:t}}function p0(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new L,color:new we};break;case"SpotLight":t={position:new L,direction:new L,color:new we,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new L,color:new we,distance:0,decay:0};break;case"HemisphereLight":t={direction:new L,skyColor:new we,groundColor:new we};break;case"RectAreaLight":t={color:new we,position:new L,halfWidth:new L,halfHeight:new L};break}return s[e.id]=t,t}}}function m0(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ae};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ae};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ae,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}var g0=0;function _0(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function x0(s){let e=new p0,t=m0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new L);let i=new L,r=new Ue,o=new Ue;function a(l){let u=0,h=0,d=0;for(let x=0;x<9;x++)n.probe[x].set(0,0,0);let f=0,g=0,_=0,m=0,p=0,b=0,w=0,v=0,C=0,A=0,S=0;l.sort(_0);for(let x=0,M=l.length;x<M;x++){let P=l[x],U=P.color,B=P.intensity,H=P.distance,q=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)u+=U.r*B,h+=U.g*B,d+=U.b*B;else if(P.isLightProbe){for(let W=0;W<9;W++)n.probe[W].addScaledVector(P.sh.coefficients[W],B);S++}else if(P.isDirectionalLight){let W=e.get(P);if(W.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let te=P.shadow,V=t.get(P);V.shadowIntensity=te.intensity,V.shadowBias=te.bias,V.shadowNormalBias=te.normalBias,V.shadowRadius=te.radius,V.shadowMapSize=te.mapSize,n.directionalShadow[f]=V,n.directionalShadowMap[f]=q,n.directionalShadowMatrix[f]=P.shadow.matrix,b++}n.directional[f]=W,f++}else if(P.isSpotLight){let W=e.get(P);W.position.setFromMatrixPosition(P.matrixWorld),W.color.copy(U).multiplyScalar(B),W.distance=H,W.coneCos=Math.cos(P.angle),W.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),W.decay=P.decay,n.spot[_]=W;let te=P.shadow;if(P.map&&(n.spotLightMap[C]=P.map,C++,te.updateMatrices(P),P.castShadow&&A++),n.spotLightMatrix[_]=te.matrix,P.castShadow){let V=t.get(P);V.shadowIntensity=te.intensity,V.shadowBias=te.bias,V.shadowNormalBias=te.normalBias,V.shadowRadius=te.radius,V.shadowMapSize=te.mapSize,n.spotShadow[_]=V,n.spotShadowMap[_]=q,v++}_++}else if(P.isRectAreaLight){let W=e.get(P);W.color.copy(U).multiplyScalar(B),W.halfWidth.set(P.width*.5,0,0),W.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=W,m++}else if(P.isPointLight){let W=e.get(P);if(W.color.copy(P.color).multiplyScalar(P.intensity),W.distance=P.distance,W.decay=P.decay,P.castShadow){let te=P.shadow,V=t.get(P);V.shadowIntensity=te.intensity,V.shadowBias=te.bias,V.shadowNormalBias=te.normalBias,V.shadowRadius=te.radius,V.shadowMapSize=te.mapSize,V.shadowCameraNear=te.camera.near,V.shadowCameraFar=te.camera.far,n.pointShadow[g]=V,n.pointShadowMap[g]=q,n.pointShadowMatrix[g]=P.shadow.matrix,w++}n.point[g]=W,g++}else if(P.isHemisphereLight){let W=e.get(P);W.skyColor.copy(P.color).multiplyScalar(B),W.groundColor.copy(P.groundColor).multiplyScalar(B),n.hemi[p]=W,p++}}m>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=re.LTC_FLOAT_1,n.rectAreaLTC2=re.LTC_FLOAT_2):(n.rectAreaLTC1=re.LTC_HALF_1,n.rectAreaLTC2=re.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;let R=n.hash;(R.directionalLength!==f||R.pointLength!==g||R.spotLength!==_||R.rectAreaLength!==m||R.hemiLength!==p||R.numDirectionalShadows!==b||R.numPointShadows!==w||R.numSpotShadows!==v||R.numSpotMaps!==C||R.numLightProbes!==S)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.pointShadow.length=w,n.pointShadowMap.length=w,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=b,n.pointShadowMatrix.length=w,n.spotLightMatrix.length=v+C-A,n.spotLightMap.length=C,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=S,R.directionalLength=f,R.pointLength=g,R.spotLength=_,R.rectAreaLength=m,R.hemiLength=p,R.numDirectionalShadows=b,R.numPointShadows=w,R.numSpotShadows=v,R.numSpotMaps=C,R.numLightProbes=S,n.version=g0++)}function c(l,u){let h=0,d=0,f=0,g=0,_=0,m=u.matrixWorldInverse;for(let p=0,b=l.length;p<b;p++){let w=l[p];if(w.isDirectionalLight){let v=n.directional[h];v.direction.setFromMatrixPosition(w.matrixWorld),i.setFromMatrixPosition(w.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),h++}else if(w.isSpotLight){let v=n.spot[f];v.position.setFromMatrixPosition(w.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(w.matrixWorld),i.setFromMatrixPosition(w.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),f++}else if(w.isRectAreaLight){let v=n.rectArea[g];v.position.setFromMatrixPosition(w.matrixWorld),v.position.applyMatrix4(m),o.identity(),r.copy(w.matrixWorld),r.premultiply(m),o.extractRotation(r),v.halfWidth.set(w.width*.5,0,0),v.halfHeight.set(0,w.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(w.isPointLight){let v=n.point[d];v.position.setFromMatrixPosition(w.matrixWorld),v.position.applyMatrix4(m),d++}else if(w.isHemisphereLight){let v=n.hemi[_];v.direction.setFromMatrixPosition(w.matrixWorld),v.direction.transformDirection(m),_++}}}return{setup:a,setupView:c,state:n}}function wd(s){let e=new x0(s),t=[],n=[];function i(u){l.camera=u,t.length=0,n.length=0}function r(u){t.push(u)}function o(u){n.push(u)}function a(){e.setup(t)}function c(u){e.setupView(t,u)}let l={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:a,setupLightsView:c,pushLight:r,pushShadow:o}}function y0(s){let e=new WeakMap;function t(i,r=0){let o=e.get(i),a;return o===void 0?(a=new wd(s),e.set(i,[a])):r>=o.length?(a=new wd(s),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var v0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,M0=`uniform sampler2D shadow_pass;
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
}`;function S0(s,e,t){let n=new ws,i=new Ae,r=new Ae,o=new $e,a=new qo({depthPacking:Vu}),c=new Yo,l={},u=t.maxTextureSize,h={[_n]:Ht,[Ht]:_n,[bt]:bt},d=new yn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ae},radius:{value:4}},vertexShader:v0,fragmentShader:M0}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new yt;g.setAttribute("position",new Mt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Ze(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Zc;let p=this.type;this.render=function(A,S,R){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;let x=s.getRenderTarget(),M=s.getActiveCubeFace(),P=s.getActiveMipmapLevel(),U=s.state;U.setBlending(Qn),U.buffers.depth.getReversed()===!0?U.buffers.color.setClear(0,0,0,0):U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);let B=p!==Nn&&this.type===Nn,H=p===Nn&&this.type!==Nn;for(let q=0,W=A.length;q<W;q++){let te=A[q],V=te.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",te,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;i.copy(V.mapSize);let oe=V.getFrameExtents();if(i.multiply(oe),r.copy(V.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(r.x=Math.floor(u/oe.x),i.x=r.x*oe.x,V.mapSize.x=r.x),i.y>u&&(r.y=Math.floor(u/oe.y),i.y=r.y*oe.y,V.mapSize.y=r.y)),V.map===null||B===!0||H===!0){let be=this.type!==Nn?{minFilter:Ct,magFilter:Ct}:{};V.map!==null&&V.map.dispose(),V.map=new Cn(i.x,i.y,be),V.map.texture.name=te.name+".shadowMap",V.camera.updateProjectionMatrix()}s.setRenderTarget(V.map),s.clear();let he=V.getViewportCount();for(let be=0;be<he;be++){let ke=V.getViewport(be);o.set(r.x*ke.x,r.y*ke.y,r.x*ke.z,r.y*ke.w),U.viewport(o),V.updateMatrices(te,be),n=V.getFrustum(),v(S,R,V.camera,te,this.type)}V.isPointLightShadow!==!0&&this.type===Nn&&b(V,R),V.needsUpdate=!1}p=this.type,m.needsUpdate=!1,s.setRenderTarget(x,M,P)};function b(A,S){let R=e.update(_);d.defines.VSM_SAMPLES!==A.blurSamples&&(d.defines.VSM_SAMPLES=A.blurSamples,f.defines.VSM_SAMPLES=A.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new Cn(i.x,i.y)),d.uniforms.shadow_pass.value=A.map.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,s.setRenderTarget(A.mapPass),s.clear(),s.renderBufferDirect(S,null,R,d,_,null),f.uniforms.shadow_pass.value=A.mapPass.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,s.setRenderTarget(A.map),s.clear(),s.renderBufferDirect(S,null,R,f,_,null)}function w(A,S,R,x){let M=null,P=R.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(P!==void 0)M=P;else if(M=R.isPointLight===!0?c:a,s.localClippingEnabled&&S.clipShadows===!0&&Array.isArray(S.clippingPlanes)&&S.clippingPlanes.length!==0||S.displacementMap&&S.displacementScale!==0||S.alphaMap&&S.alphaTest>0||S.map&&S.alphaTest>0||S.alphaToCoverage===!0){let U=M.uuid,B=S.uuid,H=l[U];H===void 0&&(H={},l[U]=H);let q=H[B];q===void 0&&(q=M.clone(),H[B]=q,S.addEventListener("dispose",C)),M=q}if(M.visible=S.visible,M.wireframe=S.wireframe,x===Nn?M.side=S.shadowSide!==null?S.shadowSide:S.side:M.side=S.shadowSide!==null?S.shadowSide:h[S.side],M.alphaMap=S.alphaMap,M.alphaTest=S.alphaToCoverage===!0?.5:S.alphaTest,M.map=S.map,M.clipShadows=S.clipShadows,M.clippingPlanes=S.clippingPlanes,M.clipIntersection=S.clipIntersection,M.displacementMap=S.displacementMap,M.displacementScale=S.displacementScale,M.displacementBias=S.displacementBias,M.wireframeLinewidth=S.wireframeLinewidth,M.linewidth=S.linewidth,R.isPointLight===!0&&M.isMeshDistanceMaterial===!0){let U=s.properties.get(M);U.light=R}return M}function v(A,S,R,x,M){if(A.visible===!1)return;if(A.layers.test(S.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&M===Nn)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,A.matrixWorld);let B=e.update(A),H=A.material;if(Array.isArray(H)){let q=B.groups;for(let W=0,te=q.length;W<te;W++){let V=q[W],oe=H[V.materialIndex];if(oe&&oe.visible){let he=w(A,oe,x,M);A.onBeforeShadow(s,A,S,R,B,he,V),s.renderBufferDirect(R,null,B,he,A,V),A.onAfterShadow(s,A,S,R,B,he,V)}}}else if(H.visible){let q=w(A,H,x,M);A.onBeforeShadow(s,A,S,R,B,q,null),s.renderBufferDirect(R,null,B,q,A,null),A.onAfterShadow(s,A,S,R,B,q,null)}}let U=A.children;for(let B=0,H=U.length;B<H;B++)v(U[B],S,R,x,M)}function C(A){A.target.removeEventListener("dispose",C);for(let R in l){let x=l[R],M=A.target.uuid;M in x&&(x[M].dispose(),delete x[M])}}}var b0={[ia]:sa,[ra]:ca,[oa]:la,[Ri]:aa,[sa]:ia,[ca]:ra,[la]:oa,[aa]:Ri};function T0(s,e){function t(){let D=!1,ee=new $e,ie=null,de=new $e(0,0,0,0);return{setMask:function(J){ie!==J&&!D&&(s.colorMask(J,J,J,J),ie=J)},setLocked:function(J){D=J},setClear:function(J,Z,me,De,at){at===!0&&(J*=De,Z*=De,me*=De),ee.set(J,Z,me,De),de.equals(ee)===!1&&(s.clearColor(J,Z,me,De),de.copy(ee))},reset:function(){D=!1,ie=null,de.set(-1,0,0,0)}}}function n(){let D=!1,ee=!1,ie=null,de=null,J=null;return{setReversed:function(Z){if(ee!==Z){let me=e.get("EXT_clip_control");Z?me.clipControlEXT(me.LOWER_LEFT_EXT,me.ZERO_TO_ONE_EXT):me.clipControlEXT(me.LOWER_LEFT_EXT,me.NEGATIVE_ONE_TO_ONE_EXT),ee=Z;let De=J;J=null,this.setClear(De)}},getReversed:function(){return ee},setTest:function(Z){Z?$(s.DEPTH_TEST):fe(s.DEPTH_TEST)},setMask:function(Z){ie!==Z&&!D&&(s.depthMask(Z),ie=Z)},setFunc:function(Z){if(ee&&(Z=b0[Z]),de!==Z){switch(Z){case ia:s.depthFunc(s.NEVER);break;case sa:s.depthFunc(s.ALWAYS);break;case ra:s.depthFunc(s.LESS);break;case Ri:s.depthFunc(s.LEQUAL);break;case oa:s.depthFunc(s.EQUAL);break;case aa:s.depthFunc(s.GEQUAL);break;case ca:s.depthFunc(s.GREATER);break;case la:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}de=Z}},setLocked:function(Z){D=Z},setClear:function(Z){J!==Z&&(ee&&(Z=1-Z),s.clearDepth(Z),J=Z)},reset:function(){D=!1,ie=null,de=null,J=null,ee=!1}}}function i(){let D=!1,ee=null,ie=null,de=null,J=null,Z=null,me=null,De=null,at=null;return{setTest:function(je){D||(je?$(s.STENCIL_TEST):fe(s.STENCIL_TEST))},setMask:function(je){ee!==je&&!D&&(s.stencilMask(je),ee=je)},setFunc:function(je,zn,bn){(ie!==je||de!==zn||J!==bn)&&(s.stencilFunc(je,zn,bn),ie=je,de=zn,J=bn)},setOp:function(je,zn,bn){(Z!==je||me!==zn||De!==bn)&&(s.stencilOp(je,zn,bn),Z=je,me=zn,De=bn)},setLocked:function(je){D=je},setClear:function(je){at!==je&&(s.clearStencil(je),at=je)},reset:function(){D=!1,ee=null,ie=null,de=null,J=null,Z=null,me=null,De=null,at=null}}}let r=new t,o=new n,a=new i,c=new WeakMap,l=new WeakMap,u={},h={},d=new WeakMap,f=[],g=null,_=!1,m=null,p=null,b=null,w=null,v=null,C=null,A=null,S=new we(0,0,0),R=0,x=!1,M=null,P=null,U=null,B=null,H=null,q=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),W=!1,te=0,V=s.getParameter(s.VERSION);V.indexOf("WebGL")!==-1?(te=parseFloat(/^WebGL (\d)/.exec(V)[1]),W=te>=1):V.indexOf("OpenGL ES")!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),W=te>=2);let oe=null,he={},be=s.getParameter(s.SCISSOR_BOX),ke=s.getParameter(s.VIEWPORT),ot=new $e().fromArray(be),lt=new $e().fromArray(ke);function Je(D,ee,ie,de){let J=new Uint8Array(4),Z=s.createTexture();s.bindTexture(D,Z),s.texParameteri(D,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(D,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let me=0;me<ie;me++)D===s.TEXTURE_3D||D===s.TEXTURE_2D_ARRAY?s.texImage3D(ee,0,s.RGBA,1,1,de,0,s.RGBA,s.UNSIGNED_BYTE,J):s.texImage2D(ee+me,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,J);return Z}let Y={};Y[s.TEXTURE_2D]=Je(s.TEXTURE_2D,s.TEXTURE_2D,1),Y[s.TEXTURE_CUBE_MAP]=Je(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[s.TEXTURE_2D_ARRAY]=Je(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),Y[s.TEXTURE_3D]=Je(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),$(s.DEPTH_TEST),o.setFunc(Ri),Ie(!1),ge(Yc),$(s.CULL_FACE),ht(Qn);function $(D){u[D]!==!0&&(s.enable(D),u[D]=!0)}function fe(D){u[D]!==!1&&(s.disable(D),u[D]=!1)}function Le(D,ee){return h[D]!==ee?(s.bindFramebuffer(D,ee),h[D]=ee,D===s.DRAW_FRAMEBUFFER&&(h[s.FRAMEBUFFER]=ee),D===s.FRAMEBUFFER&&(h[s.DRAW_FRAMEBUFFER]=ee),!0):!1}function Se(D,ee){let ie=f,de=!1;if(D){ie=d.get(ee),ie===void 0&&(ie=[],d.set(ee,ie));let J=D.textures;if(ie.length!==J.length||ie[0]!==s.COLOR_ATTACHMENT0){for(let Z=0,me=J.length;Z<me;Z++)ie[Z]=s.COLOR_ATTACHMENT0+Z;ie.length=J.length,de=!0}}else ie[0]!==s.BACK&&(ie[0]=s.BACK,de=!0);de&&s.drawBuffers(ie)}function qe(D){return g!==D?(s.useProgram(D),g=D,!0):!1}let Lt={[li]:s.FUNC_ADD,[hu]:s.FUNC_SUBTRACT,[uu]:s.FUNC_REVERSE_SUBTRACT};Lt[du]=s.MIN,Lt[fu]=s.MAX;let I={[pu]:s.ZERO,[mu]:s.ONE,[gu]:s.SRC_COLOR,[Fo]:s.SRC_ALPHA,[Su]:s.SRC_ALPHA_SATURATE,[vu]:s.DST_COLOR,[xu]:s.DST_ALPHA,[_u]:s.ONE_MINUS_SRC_COLOR,[Oo]:s.ONE_MINUS_SRC_ALPHA,[Mu]:s.ONE_MINUS_DST_COLOR,[yu]:s.ONE_MINUS_DST_ALPHA,[bu]:s.CONSTANT_COLOR,[Tu]:s.ONE_MINUS_CONSTANT_COLOR,[wu]:s.CONSTANT_ALPHA,[Eu]:s.ONE_MINUS_CONSTANT_ALPHA};function ht(D,ee,ie,de,J,Z,me,De,at,je){if(D===Qn){_===!0&&(fe(s.BLEND),_=!1);return}if(_===!1&&($(s.BLEND),_=!0),D!==lu){if(D!==m||je!==x){if((p!==li||v!==li)&&(s.blendEquation(s.FUNC_ADD),p=li,v=li),je)switch(D){case Ai:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Bs:s.blendFunc(s.ONE,s.ONE);break;case Kc:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case $c:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case Ai:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Bs:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case Kc:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case $c:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}b=null,w=null,C=null,A=null,S.set(0,0,0),R=0,m=D,x=je}return}J=J||ee,Z=Z||ie,me=me||de,(ee!==p||J!==v)&&(s.blendEquationSeparate(Lt[ee],Lt[J]),p=ee,v=J),(ie!==b||de!==w||Z!==C||me!==A)&&(s.blendFuncSeparate(I[ie],I[de],I[Z],I[me]),b=ie,w=de,C=Z,A=me),(De.equals(S)===!1||at!==R)&&(s.blendColor(De.r,De.g,De.b,at),S.copy(De),R=at),m=D,x=!1}function Ne(D,ee){D.side===bt?fe(s.CULL_FACE):$(s.CULL_FACE);let ie=D.side===Ht;ee&&(ie=!ie),Ie(ie),D.blending===Ai&&D.transparent===!1?ht(Qn):ht(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),o.setFunc(D.depthFunc),o.setTest(D.depthTest),o.setMask(D.depthWrite),r.setMask(D.colorWrite);let de=D.stencilWrite;a.setTest(de),de&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),_e(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?$(s.SAMPLE_ALPHA_TO_COVERAGE):fe(s.SAMPLE_ALPHA_TO_COVERAGE)}function Ie(D){M!==D&&(D?s.frontFace(s.CW):s.frontFace(s.CCW),M=D)}function ge(D){D!==au?($(s.CULL_FACE),D!==P&&(D===Yc?s.cullFace(s.BACK):D===cu?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):fe(s.CULL_FACE),P=D}function ut(D){D!==U&&(W&&s.lineWidth(D),U=D)}function _e(D,ee,ie){D?($(s.POLYGON_OFFSET_FILL),(B!==ee||H!==ie)&&(s.polygonOffset(ee,ie),B=ee,H=ie)):fe(s.POLYGON_OFFSET_FILL)}function Be(D){D?$(s.SCISSOR_TEST):fe(s.SCISSOR_TEST)}function Et(D){D===void 0&&(D=s.TEXTURE0+q-1),oe!==D&&(s.activeTexture(D),oe=D)}function xt(D,ee,ie){ie===void 0&&(oe===null?ie=s.TEXTURE0+q-1:ie=oe);let de=he[ie];de===void 0&&(de={type:void 0,texture:void 0},he[ie]=de),(de.type!==D||de.texture!==ee)&&(oe!==ie&&(s.activeTexture(ie),oe=ie),s.bindTexture(D,ee||Y[D]),de.type=D,de.texture=ee)}function E(){let D=he[oe];D!==void 0&&D.type!==void 0&&(s.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function y(){try{s.compressedTexImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function O(){try{s.compressedTexImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function X(){try{s.texSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function K(){try{s.texSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function G(){try{s.compressedTexSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Me(){try{s.compressedTexSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ne(){try{s.texStorage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function xe(){try{s.texStorage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ye(){try{s.texImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Q(){try{s.texImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function le(D){ot.equals(D)===!1&&(s.scissor(D.x,D.y,D.z,D.w),ot.copy(D))}function Ce(D){lt.equals(D)===!1&&(s.viewport(D.x,D.y,D.z,D.w),lt.copy(D))}function ve(D,ee){let ie=l.get(ee);ie===void 0&&(ie=new WeakMap,l.set(ee,ie));let de=ie.get(D);de===void 0&&(de=s.getUniformBlockIndex(ee,D.name),ie.set(D,de))}function ae(D,ee){let de=l.get(ee).get(D);c.get(ee)!==de&&(s.uniformBlockBinding(ee,de,D.__bindingPointIndex),c.set(ee,de))}function Oe(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),u={},oe=null,he={},h={},d=new WeakMap,f=[],g=null,_=!1,m=null,p=null,b=null,w=null,v=null,C=null,A=null,S=new we(0,0,0),R=0,x=!1,M=null,P=null,U=null,B=null,H=null,ot.set(0,0,s.canvas.width,s.canvas.height),lt.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:$,disable:fe,bindFramebuffer:Le,drawBuffers:Se,useProgram:qe,setBlending:ht,setMaterial:Ne,setFlipSided:Ie,setCullFace:ge,setLineWidth:ut,setPolygonOffset:_e,setScissorTest:Be,activeTexture:Et,bindTexture:xt,unbindTexture:E,compressedTexImage2D:y,compressedTexImage3D:O,texImage2D:ye,texImage3D:Q,updateUBOMapping:ve,uniformBlockBinding:ae,texStorage2D:ne,texStorage3D:xe,texSubImage2D:X,texSubImage3D:K,compressedTexSubImage2D:G,compressedTexSubImage3D:Me,scissor:le,viewport:Ce,reset:Oe}}function w0(s,e,t,n,i,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Ae,u=new WeakMap,h,d=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(E,y){return f?new OffscreenCanvas(E,y):ys("canvas")}function _(E,y,O){let X=1,K=xt(E);if((K.width>O||K.height>O)&&(X=O/Math.max(K.width,K.height)),X<1)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){let G=Math.floor(X*K.width),Me=Math.floor(X*K.height);h===void 0&&(h=g(G,Me));let ne=y?g(G,Me):h;return ne.width=G,ne.height=Me,ne.getContext("2d").drawImage(E,0,0,G,Me),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+G+"x"+Me+")."),ne}else return"data"in E&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),E;return E}function m(E){return E.generateMipmaps}function p(E){s.generateMipmap(E)}function b(E){return E.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:E.isWebGL3DRenderTarget?s.TEXTURE_3D:E.isWebGLArrayRenderTarget||E.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function w(E,y,O,X,K=!1){if(E!==null){if(s[E]!==void 0)return s[E];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let G=y;if(y===s.RED&&(O===s.FLOAT&&(G=s.R32F),O===s.HALF_FLOAT&&(G=s.R16F),O===s.UNSIGNED_BYTE&&(G=s.R8)),y===s.RED_INTEGER&&(O===s.UNSIGNED_BYTE&&(G=s.R8UI),O===s.UNSIGNED_SHORT&&(G=s.R16UI),O===s.UNSIGNED_INT&&(G=s.R32UI),O===s.BYTE&&(G=s.R8I),O===s.SHORT&&(G=s.R16I),O===s.INT&&(G=s.R32I)),y===s.RG&&(O===s.FLOAT&&(G=s.RG32F),O===s.HALF_FLOAT&&(G=s.RG16F),O===s.UNSIGNED_BYTE&&(G=s.RG8)),y===s.RG_INTEGER&&(O===s.UNSIGNED_BYTE&&(G=s.RG8UI),O===s.UNSIGNED_SHORT&&(G=s.RG16UI),O===s.UNSIGNED_INT&&(G=s.RG32UI),O===s.BYTE&&(G=s.RG8I),O===s.SHORT&&(G=s.RG16I),O===s.INT&&(G=s.RG32I)),y===s.RGB_INTEGER&&(O===s.UNSIGNED_BYTE&&(G=s.RGB8UI),O===s.UNSIGNED_SHORT&&(G=s.RGB16UI),O===s.UNSIGNED_INT&&(G=s.RGB32UI),O===s.BYTE&&(G=s.RGB8I),O===s.SHORT&&(G=s.RGB16I),O===s.INT&&(G=s.RGB32I)),y===s.RGBA_INTEGER&&(O===s.UNSIGNED_BYTE&&(G=s.RGBA8UI),O===s.UNSIGNED_SHORT&&(G=s.RGBA16UI),O===s.UNSIGNED_INT&&(G=s.RGBA32UI),O===s.BYTE&&(G=s.RGBA8I),O===s.SHORT&&(G=s.RGBA16I),O===s.INT&&(G=s.RGBA32I)),y===s.RGB&&(O===s.UNSIGNED_INT_5_9_9_9_REV&&(G=s.RGB9_E5),O===s.UNSIGNED_INT_10F_11F_11F_REV&&(G=s.R11F_G11F_B10F)),y===s.RGBA){let Me=K?fr:We.getTransfer(X);O===s.FLOAT&&(G=s.RGBA32F),O===s.HALF_FLOAT&&(G=s.RGBA16F),O===s.UNSIGNED_BYTE&&(G=Me===et?s.SRGB8_ALPHA8:s.RGBA8),O===s.UNSIGNED_SHORT_4_4_4_4&&(G=s.RGBA4),O===s.UNSIGNED_SHORT_5_5_5_1&&(G=s.RGB5_A1)}return(G===s.R16F||G===s.R32F||G===s.RG16F||G===s.RG32F||G===s.RGBA16F||G===s.RGBA32F)&&e.get("EXT_color_buffer_float"),G}function v(E,y){let O;return E?y===null||y===pi||y===Hs?O=s.DEPTH24_STENCIL8:y===an?O=s.DEPTH32F_STENCIL8:y===ks&&(O=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===pi||y===Hs?O=s.DEPTH_COMPONENT24:y===an?O=s.DEPTH_COMPONENT32F:y===ks&&(O=s.DEPTH_COMPONENT16),O}function C(E,y){return m(E)===!0||E.isFramebufferTexture&&E.minFilter!==Ct&&E.minFilter!==kt?Math.log2(Math.max(y.width,y.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?y.mipmaps.length:1}function A(E){let y=E.target;y.removeEventListener("dispose",A),R(y),y.isVideoTexture&&u.delete(y)}function S(E){let y=E.target;y.removeEventListener("dispose",S),M(y)}function R(E){let y=n.get(E);if(y.__webglInit===void 0)return;let O=E.source,X=d.get(O);if(X){let K=X[y.__cacheKey];K.usedTimes--,K.usedTimes===0&&x(E),Object.keys(X).length===0&&d.delete(O)}n.remove(E)}function x(E){let y=n.get(E);s.deleteTexture(y.__webglTexture);let O=E.source,X=d.get(O);delete X[y.__cacheKey],o.memory.textures--}function M(E){let y=n.get(E);if(E.depthTexture&&(E.depthTexture.dispose(),n.remove(E.depthTexture)),E.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(y.__webglFramebuffer[X]))for(let K=0;K<y.__webglFramebuffer[X].length;K++)s.deleteFramebuffer(y.__webglFramebuffer[X][K]);else s.deleteFramebuffer(y.__webglFramebuffer[X]);y.__webglDepthbuffer&&s.deleteRenderbuffer(y.__webglDepthbuffer[X])}else{if(Array.isArray(y.__webglFramebuffer))for(let X=0;X<y.__webglFramebuffer.length;X++)s.deleteFramebuffer(y.__webglFramebuffer[X]);else s.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&s.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&s.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let X=0;X<y.__webglColorRenderbuffer.length;X++)y.__webglColorRenderbuffer[X]&&s.deleteRenderbuffer(y.__webglColorRenderbuffer[X]);y.__webglDepthRenderbuffer&&s.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let O=E.textures;for(let X=0,K=O.length;X<K;X++){let G=n.get(O[X]);G.__webglTexture&&(s.deleteTexture(G.__webglTexture),o.memory.textures--),n.remove(O[X])}n.remove(E)}let P=0;function U(){P=0}function B(){let E=P;return E>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+i.maxTextures),P+=1,E}function H(E){let y=[];return y.push(E.wrapS),y.push(E.wrapT),y.push(E.wrapR||0),y.push(E.magFilter),y.push(E.minFilter),y.push(E.anisotropy),y.push(E.internalFormat),y.push(E.format),y.push(E.type),y.push(E.generateMipmaps),y.push(E.premultiplyAlpha),y.push(E.flipY),y.push(E.unpackAlignment),y.push(E.colorSpace),y.join()}function q(E,y){let O=n.get(E);if(E.isVideoTexture&&Be(E),E.isRenderTargetTexture===!1&&E.isExternalTexture!==!0&&E.version>0&&O.__version!==E.version){let X=E.image;if(X===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(O,E,y);return}}else E.isExternalTexture&&(O.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,O.__webglTexture,s.TEXTURE0+y)}function W(E,y){let O=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&O.__version!==E.version){Y(O,E,y);return}t.bindTexture(s.TEXTURE_2D_ARRAY,O.__webglTexture,s.TEXTURE0+y)}function te(E,y){let O=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&O.__version!==E.version){Y(O,E,y);return}t.bindTexture(s.TEXTURE_3D,O.__webglTexture,s.TEXTURE0+y)}function V(E,y){let O=n.get(E);if(E.version>0&&O.__version!==E.version){$(O,E,y);return}t.bindTexture(s.TEXTURE_CUBE_MAP,O.__webglTexture,s.TEXTURE0+y)}let oe={[An]:s.REPEAT,[wn]:s.CLAMP_TO_EDGE,[_s]:s.MIRRORED_REPEAT},he={[Ct]:s.NEAREST,[fa]:s.NEAREST_MIPMAP_NEAREST,[zi]:s.NEAREST_MIPMAP_LINEAR,[kt]:s.LINEAR,[zs]:s.LINEAR_MIPMAP_NEAREST,[Mn]:s.LINEAR_MIPMAP_LINEAR},be={[Gu]:s.NEVER,[Ku]:s.ALWAYS,[Wu]:s.LESS,[cl]:s.LEQUAL,[Xu]:s.EQUAL,[Zu]:s.GEQUAL,[qu]:s.GREATER,[Yu]:s.NOTEQUAL};function ke(E,y){if(y.type===an&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===kt||y.magFilter===zs||y.magFilter===zi||y.magFilter===Mn||y.minFilter===kt||y.minFilter===zs||y.minFilter===zi||y.minFilter===Mn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(E,s.TEXTURE_WRAP_S,oe[y.wrapS]),s.texParameteri(E,s.TEXTURE_WRAP_T,oe[y.wrapT]),(E===s.TEXTURE_3D||E===s.TEXTURE_2D_ARRAY)&&s.texParameteri(E,s.TEXTURE_WRAP_R,oe[y.wrapR]),s.texParameteri(E,s.TEXTURE_MAG_FILTER,he[y.magFilter]),s.texParameteri(E,s.TEXTURE_MIN_FILTER,he[y.minFilter]),y.compareFunction&&(s.texParameteri(E,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(E,s.TEXTURE_COMPARE_FUNC,be[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Ct||y.minFilter!==zi&&y.minFilter!==Mn||y.type===an&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){let O=e.get("EXT_texture_filter_anisotropic");s.texParameterf(E,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,i.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function ot(E,y){let O=!1;E.__webglInit===void 0&&(E.__webglInit=!0,y.addEventListener("dispose",A));let X=y.source,K=d.get(X);K===void 0&&(K={},d.set(X,K));let G=H(y);if(G!==E.__cacheKey){K[G]===void 0&&(K[G]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,O=!0),K[G].usedTimes++;let Me=K[E.__cacheKey];Me!==void 0&&(K[E.__cacheKey].usedTimes--,Me.usedTimes===0&&x(y)),E.__cacheKey=G,E.__webglTexture=K[G].texture}return O}function lt(E,y,O){return Math.floor(Math.floor(E/O)/y)}function Je(E,y,O,X){let G=E.updateRanges;if(G.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,y.width,y.height,O,X,y.data);else{G.sort((Q,le)=>Q.start-le.start);let Me=0;for(let Q=1;Q<G.length;Q++){let le=G[Me],Ce=G[Q],ve=le.start+le.count,ae=lt(Ce.start,y.width,4),Oe=lt(le.start,y.width,4);Ce.start<=ve+1&&ae===Oe&&lt(Ce.start+Ce.count-1,y.width,4)===ae?le.count=Math.max(le.count,Ce.start+Ce.count-le.start):(++Me,G[Me]=Ce)}G.length=Me+1;let ne=s.getParameter(s.UNPACK_ROW_LENGTH),xe=s.getParameter(s.UNPACK_SKIP_PIXELS),ye=s.getParameter(s.UNPACK_SKIP_ROWS);s.pixelStorei(s.UNPACK_ROW_LENGTH,y.width);for(let Q=0,le=G.length;Q<le;Q++){let Ce=G[Q],ve=Math.floor(Ce.start/4),ae=Math.ceil(Ce.count/4),Oe=ve%y.width,D=Math.floor(ve/y.width),ee=ae,ie=1;s.pixelStorei(s.UNPACK_SKIP_PIXELS,Oe),s.pixelStorei(s.UNPACK_SKIP_ROWS,D),t.texSubImage2D(s.TEXTURE_2D,0,Oe,D,ee,ie,O,X,y.data)}E.clearUpdateRanges(),s.pixelStorei(s.UNPACK_ROW_LENGTH,ne),s.pixelStorei(s.UNPACK_SKIP_PIXELS,xe),s.pixelStorei(s.UNPACK_SKIP_ROWS,ye)}}function Y(E,y,O){let X=s.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(X=s.TEXTURE_2D_ARRAY),y.isData3DTexture&&(X=s.TEXTURE_3D);let K=ot(E,y),G=y.source;t.bindTexture(X,E.__webglTexture,s.TEXTURE0+O);let Me=n.get(G);if(G.version!==Me.__version||K===!0){t.activeTexture(s.TEXTURE0+O);let ne=We.getPrimaries(We.workingColorSpace),xe=y.colorSpace===ti?null:We.getPrimaries(y.colorSpace),ye=y.colorSpace===ti||ne===xe?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,y.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,y.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);let Q=_(y.image,!1,i.maxTextureSize);Q=Et(y,Q);let le=r.convert(y.format,y.colorSpace),Ce=r.convert(y.type),ve=w(y.internalFormat,le,Ce,y.colorSpace,y.isVideoTexture);ke(X,y);let ae,Oe=y.mipmaps,D=y.isVideoTexture!==!0,ee=Me.__version===void 0||K===!0,ie=G.dataReady,de=C(y,Q);if(y.isDepthTexture)ve=v(y.format===Gs,y.type),ee&&(D?t.texStorage2D(s.TEXTURE_2D,1,ve,Q.width,Q.height):t.texImage2D(s.TEXTURE_2D,0,ve,Q.width,Q.height,0,le,Ce,null));else if(y.isDataTexture)if(Oe.length>0){D&&ee&&t.texStorage2D(s.TEXTURE_2D,de,ve,Oe[0].width,Oe[0].height);for(let J=0,Z=Oe.length;J<Z;J++)ae=Oe[J],D?ie&&t.texSubImage2D(s.TEXTURE_2D,J,0,0,ae.width,ae.height,le,Ce,ae.data):t.texImage2D(s.TEXTURE_2D,J,ve,ae.width,ae.height,0,le,Ce,ae.data);y.generateMipmaps=!1}else D?(ee&&t.texStorage2D(s.TEXTURE_2D,de,ve,Q.width,Q.height),ie&&Je(y,Q,le,Ce)):t.texImage2D(s.TEXTURE_2D,0,ve,Q.width,Q.height,0,le,Ce,Q.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){D&&ee&&t.texStorage3D(s.TEXTURE_2D_ARRAY,de,ve,Oe[0].width,Oe[0].height,Q.depth);for(let J=0,Z=Oe.length;J<Z;J++)if(ae=Oe[J],y.format!==tn)if(le!==null)if(D){if(ie)if(y.layerUpdates.size>0){let me=gl(ae.width,ae.height,y.format,y.type);for(let De of y.layerUpdates){let at=ae.data.subarray(De*me/ae.data.BYTES_PER_ELEMENT,(De+1)*me/ae.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,J,0,0,De,ae.width,ae.height,1,le,at)}y.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,J,0,0,0,ae.width,ae.height,Q.depth,le,ae.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,J,ve,ae.width,ae.height,Q.depth,0,ae.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else D?ie&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,J,0,0,0,ae.width,ae.height,Q.depth,le,Ce,ae.data):t.texImage3D(s.TEXTURE_2D_ARRAY,J,ve,ae.width,ae.height,Q.depth,0,le,Ce,ae.data)}else{D&&ee&&t.texStorage2D(s.TEXTURE_2D,de,ve,Oe[0].width,Oe[0].height);for(let J=0,Z=Oe.length;J<Z;J++)ae=Oe[J],y.format!==tn?le!==null?D?ie&&t.compressedTexSubImage2D(s.TEXTURE_2D,J,0,0,ae.width,ae.height,le,ae.data):t.compressedTexImage2D(s.TEXTURE_2D,J,ve,ae.width,ae.height,0,ae.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):D?ie&&t.texSubImage2D(s.TEXTURE_2D,J,0,0,ae.width,ae.height,le,Ce,ae.data):t.texImage2D(s.TEXTURE_2D,J,ve,ae.width,ae.height,0,le,Ce,ae.data)}else if(y.isDataArrayTexture)if(D){if(ee&&t.texStorage3D(s.TEXTURE_2D_ARRAY,de,ve,Q.width,Q.height,Q.depth),ie)if(y.layerUpdates.size>0){let J=gl(Q.width,Q.height,y.format,y.type);for(let Z of y.layerUpdates){let me=Q.data.subarray(Z*J/Q.data.BYTES_PER_ELEMENT,(Z+1)*J/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,Z,Q.width,Q.height,1,le,Ce,me)}y.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,le,Ce,Q.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,ve,Q.width,Q.height,Q.depth,0,le,Ce,Q.data);else if(y.isData3DTexture)D?(ee&&t.texStorage3D(s.TEXTURE_3D,de,ve,Q.width,Q.height,Q.depth),ie&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,le,Ce,Q.data)):t.texImage3D(s.TEXTURE_3D,0,ve,Q.width,Q.height,Q.depth,0,le,Ce,Q.data);else if(y.isFramebufferTexture){if(ee)if(D)t.texStorage2D(s.TEXTURE_2D,de,ve,Q.width,Q.height);else{let J=Q.width,Z=Q.height;for(let me=0;me<de;me++)t.texImage2D(s.TEXTURE_2D,me,ve,J,Z,0,le,Ce,null),J>>=1,Z>>=1}}else if(Oe.length>0){if(D&&ee){let J=xt(Oe[0]);t.texStorage2D(s.TEXTURE_2D,de,ve,J.width,J.height)}for(let J=0,Z=Oe.length;J<Z;J++)ae=Oe[J],D?ie&&t.texSubImage2D(s.TEXTURE_2D,J,0,0,le,Ce,ae):t.texImage2D(s.TEXTURE_2D,J,ve,le,Ce,ae);y.generateMipmaps=!1}else if(D){if(ee){let J=xt(Q);t.texStorage2D(s.TEXTURE_2D,de,ve,J.width,J.height)}ie&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,le,Ce,Q)}else t.texImage2D(s.TEXTURE_2D,0,ve,le,Ce,Q);m(y)&&p(X),Me.__version=G.version,y.onUpdate&&y.onUpdate(y)}E.__version=y.version}function $(E,y,O){if(y.image.length!==6)return;let X=ot(E,y),K=y.source;t.bindTexture(s.TEXTURE_CUBE_MAP,E.__webglTexture,s.TEXTURE0+O);let G=n.get(K);if(K.version!==G.__version||X===!0){t.activeTexture(s.TEXTURE0+O);let Me=We.getPrimaries(We.workingColorSpace),ne=y.colorSpace===ti?null:We.getPrimaries(y.colorSpace),xe=y.colorSpace===ti||Me===ne?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,y.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,y.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe);let ye=y.isCompressedTexture||y.image[0].isCompressedTexture,Q=y.image[0]&&y.image[0].isDataTexture,le=[];for(let Z=0;Z<6;Z++)!ye&&!Q?le[Z]=_(y.image[Z],!0,i.maxCubemapSize):le[Z]=Q?y.image[Z].image:y.image[Z],le[Z]=Et(y,le[Z]);let Ce=le[0],ve=r.convert(y.format,y.colorSpace),ae=r.convert(y.type),Oe=w(y.internalFormat,ve,ae,y.colorSpace),D=y.isVideoTexture!==!0,ee=G.__version===void 0||X===!0,ie=K.dataReady,de=C(y,Ce);ke(s.TEXTURE_CUBE_MAP,y);let J;if(ye){D&&ee&&t.texStorage2D(s.TEXTURE_CUBE_MAP,de,Oe,Ce.width,Ce.height);for(let Z=0;Z<6;Z++){J=le[Z].mipmaps;for(let me=0;me<J.length;me++){let De=J[me];y.format!==tn?ve!==null?D?ie&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,me,0,0,De.width,De.height,ve,De.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,me,Oe,De.width,De.height,0,De.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,me,0,0,De.width,De.height,ve,ae,De.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,me,Oe,De.width,De.height,0,ve,ae,De.data)}}}else{if(J=y.mipmaps,D&&ee){J.length>0&&de++;let Z=xt(le[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,de,Oe,Z.width,Z.height)}for(let Z=0;Z<6;Z++)if(Q){D?ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,le[Z].width,le[Z].height,ve,ae,le[Z].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,Oe,le[Z].width,le[Z].height,0,ve,ae,le[Z].data);for(let me=0;me<J.length;me++){let at=J[me].image[Z].image;D?ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,me+1,0,0,at.width,at.height,ve,ae,at.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,me+1,Oe,at.width,at.height,0,ve,ae,at.data)}}else{D?ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,ve,ae,le[Z]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,Oe,ve,ae,le[Z]);for(let me=0;me<J.length;me++){let De=J[me];D?ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,me+1,0,0,ve,ae,De.image[Z]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,me+1,Oe,ve,ae,De.image[Z])}}}m(y)&&p(s.TEXTURE_CUBE_MAP),G.__version=K.version,y.onUpdate&&y.onUpdate(y)}E.__version=y.version}function fe(E,y,O,X,K,G){let Me=r.convert(O.format,O.colorSpace),ne=r.convert(O.type),xe=w(O.internalFormat,Me,ne,O.colorSpace),ye=n.get(y),Q=n.get(O);if(Q.__renderTarget=y,!ye.__hasExternalTextures){let le=Math.max(1,y.width>>G),Ce=Math.max(1,y.height>>G);K===s.TEXTURE_3D||K===s.TEXTURE_2D_ARRAY?t.texImage3D(K,G,xe,le,Ce,y.depth,0,Me,ne,null):t.texImage2D(K,G,xe,le,Ce,0,Me,ne,null)}t.bindFramebuffer(s.FRAMEBUFFER,E),_e(y)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,X,K,Q.__webglTexture,0,ut(y)):(K===s.TEXTURE_2D||K>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,X,K,Q.__webglTexture,G),t.bindFramebuffer(s.FRAMEBUFFER,null)}function Le(E,y,O){if(s.bindRenderbuffer(s.RENDERBUFFER,E),y.depthBuffer){let X=y.depthTexture,K=X&&X.isDepthTexture?X.type:null,G=v(y.stencilBuffer,K),Me=y.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ne=ut(y);_e(y)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ne,G,y.width,y.height):O?s.renderbufferStorageMultisample(s.RENDERBUFFER,ne,G,y.width,y.height):s.renderbufferStorage(s.RENDERBUFFER,G,y.width,y.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Me,s.RENDERBUFFER,E)}else{let X=y.textures;for(let K=0;K<X.length;K++){let G=X[K],Me=r.convert(G.format,G.colorSpace),ne=r.convert(G.type),xe=w(G.internalFormat,Me,ne,G.colorSpace),ye=ut(y);O&&_e(y)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,ye,xe,y.width,y.height):_e(y)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ye,xe,y.width,y.height):s.renderbufferStorage(s.RENDERBUFFER,xe,y.width,y.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Se(E,y){if(y&&y.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,E),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let X=n.get(y.depthTexture);X.__renderTarget=y,(!X.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),q(y.depthTexture,0);let K=X.__webglTexture,G=ut(y);if(y.depthTexture.format===xs)_e(y)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,K,0,G):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,K,0);else if(y.depthTexture.format===Gs)_e(y)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,K,0,G):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,K,0);else throw new Error("Unknown depthTexture format")}function qe(E){let y=n.get(E),O=E.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==E.depthTexture){let X=E.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),X){let K=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,X.removeEventListener("dispose",K)};X.addEventListener("dispose",K),y.__depthDisposeCallback=K}y.__boundDepthTexture=X}if(E.depthTexture&&!y.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");let X=E.texture.mipmaps;X&&X.length>0?Se(y.__webglFramebuffer[0],E):Se(y.__webglFramebuffer,E)}else if(O){y.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(t.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer[X]),y.__webglDepthbuffer[X]===void 0)y.__webglDepthbuffer[X]=s.createRenderbuffer(),Le(y.__webglDepthbuffer[X],E,!1);else{let K=E.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,G=y.__webglDepthbuffer[X];s.bindRenderbuffer(s.RENDERBUFFER,G),s.framebufferRenderbuffer(s.FRAMEBUFFER,K,s.RENDERBUFFER,G)}}else{let X=E.texture.mipmaps;if(X&&X.length>0?t.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=s.createRenderbuffer(),Le(y.__webglDepthbuffer,E,!1);else{let K=E.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,G=y.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,G),s.framebufferRenderbuffer(s.FRAMEBUFFER,K,s.RENDERBUFFER,G)}}t.bindFramebuffer(s.FRAMEBUFFER,null)}function Lt(E,y,O){let X=n.get(E);y!==void 0&&fe(X.__webglFramebuffer,E,E.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),O!==void 0&&qe(E)}function I(E){let y=E.texture,O=n.get(E),X=n.get(y);E.addEventListener("dispose",S);let K=E.textures,G=E.isWebGLCubeRenderTarget===!0,Me=K.length>1;if(Me||(X.__webglTexture===void 0&&(X.__webglTexture=s.createTexture()),X.__version=y.version,o.memory.textures++),G){O.__webglFramebuffer=[];for(let ne=0;ne<6;ne++)if(y.mipmaps&&y.mipmaps.length>0){O.__webglFramebuffer[ne]=[];for(let xe=0;xe<y.mipmaps.length;xe++)O.__webglFramebuffer[ne][xe]=s.createFramebuffer()}else O.__webglFramebuffer[ne]=s.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){O.__webglFramebuffer=[];for(let ne=0;ne<y.mipmaps.length;ne++)O.__webglFramebuffer[ne]=s.createFramebuffer()}else O.__webglFramebuffer=s.createFramebuffer();if(Me)for(let ne=0,xe=K.length;ne<xe;ne++){let ye=n.get(K[ne]);ye.__webglTexture===void 0&&(ye.__webglTexture=s.createTexture(),o.memory.textures++)}if(E.samples>0&&_e(E)===!1){O.__webglMultisampledFramebuffer=s.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let ne=0;ne<K.length;ne++){let xe=K[ne];O.__webglColorRenderbuffer[ne]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,O.__webglColorRenderbuffer[ne]);let ye=r.convert(xe.format,xe.colorSpace),Q=r.convert(xe.type),le=w(xe.internalFormat,ye,Q,xe.colorSpace,E.isXRRenderTarget===!0),Ce=ut(E);s.renderbufferStorageMultisample(s.RENDERBUFFER,Ce,le,E.width,E.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ne,s.RENDERBUFFER,O.__webglColorRenderbuffer[ne])}s.bindRenderbuffer(s.RENDERBUFFER,null),E.depthBuffer&&(O.__webglDepthRenderbuffer=s.createRenderbuffer(),Le(O.__webglDepthRenderbuffer,E,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(G){t.bindTexture(s.TEXTURE_CUBE_MAP,X.__webglTexture),ke(s.TEXTURE_CUBE_MAP,y);for(let ne=0;ne<6;ne++)if(y.mipmaps&&y.mipmaps.length>0)for(let xe=0;xe<y.mipmaps.length;xe++)fe(O.__webglFramebuffer[ne][xe],E,y,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,xe);else fe(O.__webglFramebuffer[ne],E,y,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0);m(y)&&p(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Me){for(let ne=0,xe=K.length;ne<xe;ne++){let ye=K[ne],Q=n.get(ye),le=s.TEXTURE_2D;(E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(le=E.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(le,Q.__webglTexture),ke(le,ye),fe(O.__webglFramebuffer,E,ye,s.COLOR_ATTACHMENT0+ne,le,0),m(ye)&&p(le)}t.unbindTexture()}else{let ne=s.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(ne=E.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(ne,X.__webglTexture),ke(ne,y),y.mipmaps&&y.mipmaps.length>0)for(let xe=0;xe<y.mipmaps.length;xe++)fe(O.__webglFramebuffer[xe],E,y,s.COLOR_ATTACHMENT0,ne,xe);else fe(O.__webglFramebuffer,E,y,s.COLOR_ATTACHMENT0,ne,0);m(y)&&p(ne),t.unbindTexture()}E.depthBuffer&&qe(E)}function ht(E){let y=E.textures;for(let O=0,X=y.length;O<X;O++){let K=y[O];if(m(K)){let G=b(E),Me=n.get(K).__webglTexture;t.bindTexture(G,Me),p(G),t.unbindTexture()}}}let Ne=[],Ie=[];function ge(E){if(E.samples>0){if(_e(E)===!1){let y=E.textures,O=E.width,X=E.height,K=s.COLOR_BUFFER_BIT,G=E.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Me=n.get(E),ne=y.length>1;if(ne)for(let ye=0;ye<y.length;ye++)t.bindFramebuffer(s.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ye,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,Me.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ye,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,Me.__webglMultisampledFramebuffer);let xe=E.texture.mipmaps;xe&&xe.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Me.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Me.__webglFramebuffer);for(let ye=0;ye<y.length;ye++){if(E.resolveDepthBuffer&&(E.depthBuffer&&(K|=s.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&(K|=s.STENCIL_BUFFER_BIT)),ne){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Me.__webglColorRenderbuffer[ye]);let Q=n.get(y[ye]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Q,0)}s.blitFramebuffer(0,0,O,X,0,0,O,X,K,s.NEAREST),c===!0&&(Ne.length=0,Ie.length=0,Ne.push(s.COLOR_ATTACHMENT0+ye),E.depthBuffer&&E.resolveDepthBuffer===!1&&(Ne.push(G),Ie.push(G),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Ie)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,Ne))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),ne)for(let ye=0;ye<y.length;ye++){t.bindFramebuffer(s.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ye,s.RENDERBUFFER,Me.__webglColorRenderbuffer[ye]);let Q=n.get(y[ye]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,Me.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ye,s.TEXTURE_2D,Q,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Me.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.resolveDepthBuffer===!1&&c){let y=E.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[y])}}}function ut(E){return Math.min(i.maxSamples,E.samples)}function _e(E){let y=n.get(E);return E.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function Be(E){let y=o.render.frame;u.get(E)!==y&&(u.set(E,y),E.update())}function Et(E,y){let O=E.colorSpace,X=E.format,K=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||O!==It&&O!==ti&&(We.getTransfer(O)===et?(X!==tn||K!==Sn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),y}function xt(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(l.width=E.naturalWidth||E.width,l.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(l.width=E.displayWidth,l.height=E.displayHeight):(l.width=E.width,l.height=E.height),l}this.allocateTextureUnit=B,this.resetTextureUnits=U,this.setTexture2D=q,this.setTexture2DArray=W,this.setTexture3D=te,this.setTextureCube=V,this.rebindTextures=Lt,this.setupRenderTarget=I,this.updateRenderTargetMipmap=ht,this.updateMultisampleRenderTarget=ge,this.setupDepthRenderbuffer=qe,this.setupFrameBufferTexture=fe,this.useMultisampledRTT=_e}function E0(s,e){function t(n,i=ti){let r,o=We.getTransfer(i);if(n===Sn)return s.UNSIGNED_BYTE;if(n===ma)return s.UNSIGNED_SHORT_4_4_4_4;if(n===ga)return s.UNSIGNED_SHORT_5_5_5_1;if(n===tl)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===nl)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===Qc)return s.BYTE;if(n===el)return s.SHORT;if(n===ks)return s.UNSIGNED_SHORT;if(n===pa)return s.INT;if(n===pi)return s.UNSIGNED_INT;if(n===an)return s.FLOAT;if(n===Vs)return s.HALF_FLOAT;if(n===il)return s.ALPHA;if(n===sl)return s.RGB;if(n===tn)return s.RGBA;if(n===xs)return s.DEPTH_COMPONENT;if(n===Gs)return s.DEPTH_STENCIL;if(n===_a)return s.RED;if(n===xa)return s.RED_INTEGER;if(n===rl)return s.RG;if(n===ya)return s.RG_INTEGER;if(n===va)return s.RGBA_INTEGER;if(n===qr||n===Yr||n===Zr||n===Kr)if(o===et)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===qr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Yr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Zr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Kr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===qr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Yr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Zr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Kr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ma||n===Sa||n===ba||n===Ta)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ma)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Sa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ba)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ta)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===wa||n===Ea||n===Aa)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===wa||n===Ea)return o===et?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Aa)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Ra||n===Ca||n===Ia||n===Pa||n===La||n===Da||n===Na||n===Ua||n===Fa||n===Oa||n===Ba||n===za||n===ka||n===Va)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ra)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ca)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ia)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Pa)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===La)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Da)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Na)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ua)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Fa)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Oa)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ba)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===za)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ka)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Va)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ha||n===Ga||n===Wa)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Ha)return o===et?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ga)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Wa)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Xa||n===qa||n===Ya||n===Za)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Xa)return r.COMPRESSED_RED_RGTC1_EXT;if(n===qa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ya)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Za)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Hs?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}var A0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,R0=`
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

}`,Cl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Pr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new yn({vertexShader:A0,fragmentShader:R0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ze(new vn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Il=class extends Rn{constructor(e,t){super();let n=this,i=null,r=1,o=null,a="local-floor",c=1,l=null,u=null,h=null,d=null,f=null,g=null,_=typeof XRWebGLBinding<"u",m=new Cl,p={},b=t.getContextAttributes(),w=null,v=null,C=[],A=[],S=new Ae,R=null,x=new Rt;x.viewport=new $e;let M=new Rt;M.viewport=new $e;let P=[x,M],U=new Qo,B=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let $=C[Y];return $===void 0&&($=new Ss,C[Y]=$),$.getTargetRaySpace()},this.getControllerGrip=function(Y){let $=C[Y];return $===void 0&&($=new Ss,C[Y]=$),$.getGripSpace()},this.getHand=function(Y){let $=C[Y];return $===void 0&&($=new Ss,C[Y]=$),$.getHandSpace()};function q(Y){let $=A.indexOf(Y.inputSource);if($===-1)return;let fe=C[$];fe!==void 0&&(fe.update(Y.inputSource,Y.frame,l||o),fe.dispatchEvent({type:Y.type,data:Y.inputSource}))}function W(){i.removeEventListener("select",q),i.removeEventListener("selectstart",q),i.removeEventListener("selectend",q),i.removeEventListener("squeeze",q),i.removeEventListener("squeezestart",q),i.removeEventListener("squeezeend",q),i.removeEventListener("end",W),i.removeEventListener("inputsourceschange",te);for(let Y=0;Y<C.length;Y++){let $=A[Y];$!==null&&(A[Y]=null,C[Y].disconnect($))}B=null,H=null,m.reset();for(let Y in p)delete p[Y];e.setRenderTarget(w),f=null,d=null,h=null,i=null,v=null,Je.stop(),n.isPresenting=!1,e.setPixelRatio(R),e.setSize(S.width,S.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(Y){l=Y},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h===null&&_&&(h=new XRWebGLBinding(i,t)),h},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(Y){if(i=Y,i!==null){if(w=e.getRenderTarget(),i.addEventListener("select",q),i.addEventListener("selectstart",q),i.addEventListener("selectend",q),i.addEventListener("squeeze",q),i.addEventListener("squeezestart",q),i.addEventListener("squeezeend",q),i.addEventListener("end",W),i.addEventListener("inputsourceschange",te),b.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(S),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let fe=null,Le=null,Se=null;b.depth&&(Se=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,fe=b.stencil?Gs:xs,Le=b.stencil?Hs:pi);let qe={colorFormat:t.RGBA8,depthFormat:Se,scaleFactor:r};h=this.getBinding(),d=h.createProjectionLayer(qe),i.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),v=new Cn(d.textureWidth,d.textureHeight,{format:tn,type:Sn,depthTexture:new Ir(d.textureWidth,d.textureHeight,Le,void 0,void 0,void 0,void 0,void 0,void 0,fe),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let fe={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,t,fe),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new Cn(f.framebufferWidth,f.framebufferHeight,{format:tn,type:Sn,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await i.requestReferenceSpace(a),Je.setContext(i),Je.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function te(Y){for(let $=0;$<Y.removed.length;$++){let fe=Y.removed[$],Le=A.indexOf(fe);Le>=0&&(A[Le]=null,C[Le].disconnect(fe))}for(let $=0;$<Y.added.length;$++){let fe=Y.added[$],Le=A.indexOf(fe);if(Le===-1){for(let qe=0;qe<C.length;qe++)if(qe>=A.length){A.push(fe),Le=qe;break}else if(A[qe]===null){A[qe]=fe,Le=qe;break}if(Le===-1)break}let Se=C[Le];Se&&Se.connect(fe)}}let V=new L,oe=new L;function he(Y,$,fe){V.setFromMatrixPosition($.matrixWorld),oe.setFromMatrixPosition(fe.matrixWorld);let Le=V.distanceTo(oe),Se=$.projectionMatrix.elements,qe=fe.projectionMatrix.elements,Lt=Se[14]/(Se[10]-1),I=Se[14]/(Se[10]+1),ht=(Se[9]+1)/Se[5],Ne=(Se[9]-1)/Se[5],Ie=(Se[8]-1)/Se[0],ge=(qe[8]+1)/qe[0],ut=Lt*Ie,_e=Lt*ge,Be=Le/(-Ie+ge),Et=Be*-Ie;if($.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(Et),Y.translateZ(Be),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),Se[10]===-1)Y.projectionMatrix.copy($.projectionMatrix),Y.projectionMatrixInverse.copy($.projectionMatrixInverse);else{let xt=Lt+Be,E=I+Be,y=ut-Et,O=_e+(Le-Et),X=ht*I/E*xt,K=Ne*I/E*xt;Y.projectionMatrix.makePerspective(y,O,X,K,xt,E),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function be(Y,$){$===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices($.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(i===null)return;let $=Y.near,fe=Y.far;m.texture!==null&&(m.depthNear>0&&($=m.depthNear),m.depthFar>0&&(fe=m.depthFar)),U.near=M.near=x.near=$,U.far=M.far=x.far=fe,(B!==U.near||H!==U.far)&&(i.updateRenderState({depthNear:U.near,depthFar:U.far}),B=U.near,H=U.far),U.layers.mask=Y.layers.mask|6,x.layers.mask=U.layers.mask&3,M.layers.mask=U.layers.mask&5;let Le=Y.parent,Se=U.cameras;be(U,Le);for(let qe=0;qe<Se.length;qe++)be(Se[qe],Le);Se.length===2?he(U,x,M):U.projectionMatrix.copy(x.projectionMatrix),ke(Y,U,Le)};function ke(Y,$,fe){fe===null?Y.matrix.copy($.matrixWorld):(Y.matrix.copy(fe.matrixWorld),Y.matrix.invert(),Y.matrix.multiply($.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy($.projectionMatrix),Y.projectionMatrixInverse.copy($.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Pi*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return U},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(Y){c=Y,d!==null&&(d.fixedFoveation=Y),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Y)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(U)},this.getCameraTexture=function(Y){return p[Y]};let ot=null;function lt(Y,$){if(u=$.getViewerPose(l||o),g=$,u!==null){let fe=u.views;f!==null&&(e.setRenderTargetFramebuffer(v,f.framebuffer),e.setRenderTarget(v));let Le=!1;fe.length!==U.cameras.length&&(U.cameras.length=0,Le=!0);for(let I=0;I<fe.length;I++){let ht=fe[I],Ne=null;if(f!==null)Ne=f.getViewport(ht);else{let ge=h.getViewSubImage(d,ht);Ne=ge.viewport,I===0&&(e.setRenderTargetTextures(v,ge.colorTexture,ge.depthStencilTexture),e.setRenderTarget(v))}let Ie=P[I];Ie===void 0&&(Ie=new Rt,Ie.layers.enable(I),Ie.viewport=new $e,P[I]=Ie),Ie.matrix.fromArray(ht.transform.matrix),Ie.matrix.decompose(Ie.position,Ie.quaternion,Ie.scale),Ie.projectionMatrix.fromArray(ht.projectionMatrix),Ie.projectionMatrixInverse.copy(Ie.projectionMatrix).invert(),Ie.viewport.set(Ne.x,Ne.y,Ne.width,Ne.height),I===0&&(U.matrix.copy(Ie.matrix),U.matrix.decompose(U.position,U.quaternion,U.scale)),Le===!0&&U.cameras.push(Ie)}let Se=i.enabledFeatures;if(Se&&Se.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&_){h=n.getBinding();let I=h.getDepthInformation(fe[0]);I&&I.isValid&&I.texture&&m.init(I,i.renderState)}if(Se&&Se.includes("camera-access")&&_){e.state.unbindTexture(),h=n.getBinding();for(let I=0;I<fe.length;I++){let ht=fe[I].camera;if(ht){let Ne=p[ht];Ne||(Ne=new Pr,p[ht]=Ne);let Ie=h.getCameraImage(ht);Ne.sourceTexture=Ie}}}}for(let fe=0;fe<C.length;fe++){let Le=A[fe],Se=C[fe];Le!==null&&Se!==void 0&&Se.update(Le,$,l||o)}ot&&ot(Y,$),$.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:$}),g=null}let Je=new Ed;Je.setAnimationLoop(lt),this.setAnimationLoop=function(Y){ot=Y},this.dispose=function(){}}},Hi=new xn,C0=new Ue;function I0(s,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,fl(s)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function i(m,p,b,w,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),h(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,v)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?c(m,p,b,w):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Ht&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Ht&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let b=e.get(p),w=b.envMap,v=b.envMapRotation;w&&(m.envMap.value=w,Hi.copy(v),Hi.x*=-1,Hi.y*=-1,Hi.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(Hi.y*=-1,Hi.z*=-1),m.envMapRotation.value.setFromMatrix4(C0.makeRotationFromEuler(Hi)),m.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,b,w){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*b,m.scale.value=w*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,b){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Ht&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){let b=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function P0(s,e,t,n){let i={},r={},o=[],a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function c(b,w){let v=w.program;n.uniformBlockBinding(b,v)}function l(b,w){let v=i[b.id];v===void 0&&(g(b),v=u(b),i[b.id]=v,b.addEventListener("dispose",m));let C=w.program;n.updateUBOMapping(b,C);let A=e.render.frame;r[b.id]!==A&&(d(b),r[b.id]=A)}function u(b){let w=h();b.__bindingPointIndex=w;let v=s.createBuffer(),C=b.__size,A=b.usage;return s.bindBuffer(s.UNIFORM_BUFFER,v),s.bufferData(s.UNIFORM_BUFFER,C,A),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,w,v),v}function h(){for(let b=0;b<a;b++)if(o.indexOf(b)===-1)return o.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(b){let w=i[b.id],v=b.uniforms,C=b.__cache;s.bindBuffer(s.UNIFORM_BUFFER,w);for(let A=0,S=v.length;A<S;A++){let R=Array.isArray(v[A])?v[A]:[v[A]];for(let x=0,M=R.length;x<M;x++){let P=R[x];if(f(P,A,x,C)===!0){let U=P.__offset,B=Array.isArray(P.value)?P.value:[P.value],H=0;for(let q=0;q<B.length;q++){let W=B[q],te=_(W);typeof W=="number"||typeof W=="boolean"?(P.__data[0]=W,s.bufferSubData(s.UNIFORM_BUFFER,U+H,P.__data)):W.isMatrix3?(P.__data[0]=W.elements[0],P.__data[1]=W.elements[1],P.__data[2]=W.elements[2],P.__data[3]=0,P.__data[4]=W.elements[3],P.__data[5]=W.elements[4],P.__data[6]=W.elements[5],P.__data[7]=0,P.__data[8]=W.elements[6],P.__data[9]=W.elements[7],P.__data[10]=W.elements[8],P.__data[11]=0):(W.toArray(P.__data,H),H+=te.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,U,P.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(b,w,v,C){let A=b.value,S=w+"_"+v;if(C[S]===void 0)return typeof A=="number"||typeof A=="boolean"?C[S]=A:C[S]=A.clone(),!0;{let R=C[S];if(typeof A=="number"||typeof A=="boolean"){if(R!==A)return C[S]=A,!0}else if(R.equals(A)===!1)return R.copy(A),!0}return!1}function g(b){let w=b.uniforms,v=0,C=16;for(let S=0,R=w.length;S<R;S++){let x=Array.isArray(w[S])?w[S]:[w[S]];for(let M=0,P=x.length;M<P;M++){let U=x[M],B=Array.isArray(U.value)?U.value:[U.value];for(let H=0,q=B.length;H<q;H++){let W=B[H],te=_(W),V=v%C,oe=V%te.boundary,he=V+oe;v+=oe,he!==0&&C-he<te.storage&&(v+=C-he),U.__data=new Float32Array(te.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=v,v+=te.storage}}}let A=v%C;return A>0&&(v+=C-A),b.__size=v,b.__cache={},this}function _(b){let w={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(w.boundary=4,w.storage=4):b.isVector2?(w.boundary=8,w.storage=8):b.isVector3||b.isColor?(w.boundary=16,w.storage=12):b.isVector4?(w.boundary=16,w.storage=16):b.isMatrix3?(w.boundary=48,w.storage=48):b.isMatrix4?(w.boundary=64,w.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),w}function m(b){let w=b.target;w.removeEventListener("dispose",m);let v=o.indexOf(w.__bindingPointIndex);o.splice(v,1),s.deleteBuffer(i[w.id]),delete i[w.id],delete r[w.id]}function p(){for(let b in i)s.deleteBuffer(i[b]);o=[],i={},r={}}return{bind:c,update:l,dispose:p}}var ec=class{constructor(e={}){let{canvas:t=$u(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;let g=new Uint32Array(4),_=new Int32Array(4),m=null,p=null,b=[],w=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ei,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let v=this,C=!1;this._outputColorSpace=mt;let A=0,S=0,R=null,x=-1,M=null,P=new $e,U=new $e,B=null,H=new we(0),q=0,W=t.width,te=t.height,V=1,oe=null,he=null,be=new $e(0,0,W,te),ke=new $e(0,0,W,te),ot=!1,lt=new ws,Je=!1,Y=!1,$=new Ue,fe=new L,Le=new $e,Se={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},qe=!1;function Lt(){return R===null?V:1}let I=n;function ht(T,N){return t.getContext(T,N)}try{let T={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"180"}`),t.addEventListener("webglcontextlost",ie,!1),t.addEventListener("webglcontextrestored",de,!1),t.addEventListener("webglcontextcreationerror",J,!1),I===null){let N="webgl2";if(I=ht(N,T),I===null)throw ht(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let Ne,Ie,ge,ut,_e,Be,Et,xt,E,y,O,X,K,G,Me,ne,xe,ye,Q,le,Ce,ve,ae,Oe;function D(){Ne=new Kg(I),Ne.init(),ve=new E0(I,Ne),Ie=new Hg(I,Ne,e,ve),ge=new T0(I,Ne),Ie.reversedDepthBuffer&&d&&ge.buffers.depth.setReversed(!0),ut=new jg(I),_e=new u0,Be=new w0(I,Ne,ge,_e,Ie,ve,ut),Et=new Wg(v),xt=new Zg(v),E=new sp(I),ae=new kg(I,E),y=new $g(I,E,ut,ae),O=new e_(I,y,E,ut),Q=new Qg(I,Ie,Be),ne=new Gg(_e),X=new h0(v,Et,xt,Ne,Ie,ae,ne),K=new I0(v,_e),G=new f0,Me=new y0(Ne),ye=new zg(v,Et,xt,ge,O,f,c),xe=new S0(v,O,Ie),Oe=new P0(I,ut,Ie,ge),le=new Vg(I,Ne,ut),Ce=new Jg(I,Ne,ut),ut.programs=X.programs,v.capabilities=Ie,v.extensions=Ne,v.properties=_e,v.renderLists=G,v.shadowMap=xe,v.state=ge,v.info=ut}D();let ee=new Il(v,I);this.xr=ee,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){let T=Ne.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=Ne.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(T){T!==void 0&&(V=T,this.setSize(W,te,!1))},this.getSize=function(T){return T.set(W,te)},this.setSize=function(T,N,z=!0){if(ee.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}W=T,te=N,t.width=Math.floor(T*V),t.height=Math.floor(N*V),z===!0&&(t.style.width=T+"px",t.style.height=N+"px"),this.setViewport(0,0,T,N)},this.getDrawingBufferSize=function(T){return T.set(W*V,te*V).floor()},this.setDrawingBufferSize=function(T,N,z){W=T,te=N,V=z,t.width=Math.floor(T*z),t.height=Math.floor(N*z),this.setViewport(0,0,T,N)},this.getCurrentViewport=function(T){return T.copy(P)},this.getViewport=function(T){return T.copy(be)},this.setViewport=function(T,N,z,k){T.isVector4?be.set(T.x,T.y,T.z,T.w):be.set(T,N,z,k),ge.viewport(P.copy(be).multiplyScalar(V).round())},this.getScissor=function(T){return T.copy(ke)},this.setScissor=function(T,N,z,k){T.isVector4?ke.set(T.x,T.y,T.z,T.w):ke.set(T,N,z,k),ge.scissor(U.copy(ke).multiplyScalar(V).round())},this.getScissorTest=function(){return ot},this.setScissorTest=function(T){ge.setScissorTest(ot=T)},this.setOpaqueSort=function(T){oe=T},this.setTransparentSort=function(T){he=T},this.getClearColor=function(T){return T.copy(ye.getClearColor())},this.setClearColor=function(){ye.setClearColor(...arguments)},this.getClearAlpha=function(){return ye.getClearAlpha()},this.setClearAlpha=function(){ye.setClearAlpha(...arguments)},this.clear=function(T=!0,N=!0,z=!0){let k=0;if(T){let F=!1;if(R!==null){let j=R.texture.format;F=j===va||j===ya||j===xa}if(F){let j=R.texture.type,ce=j===Sn||j===pi||j===ks||j===Hs||j===ma||j===ga,pe=ye.getClearColor(),ue=ye.getClearAlpha(),Re=pe.r,Pe=pe.g,Te=pe.b;ce?(g[0]=Re,g[1]=Pe,g[2]=Te,g[3]=ue,I.clearBufferuiv(I.COLOR,0,g)):(_[0]=Re,_[1]=Pe,_[2]=Te,_[3]=ue,I.clearBufferiv(I.COLOR,0,_))}else k|=I.COLOR_BUFFER_BIT}N&&(k|=I.DEPTH_BUFFER_BIT),z&&(k|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ie,!1),t.removeEventListener("webglcontextrestored",de,!1),t.removeEventListener("webglcontextcreationerror",J,!1),ye.dispose(),G.dispose(),Me.dispose(),_e.dispose(),Et.dispose(),xt.dispose(),O.dispose(),ae.dispose(),Oe.dispose(),X.dispose(),ee.dispose(),ee.removeEventListener("sessionstart",bn),ee.removeEventListener("sessionend",_h),xi.stop()};function ie(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),C=!0}function de(){console.log("THREE.WebGLRenderer: Context Restored."),C=!1;let T=ut.autoReset,N=xe.enabled,z=xe.autoUpdate,k=xe.needsUpdate,F=xe.type;D(),ut.autoReset=T,xe.enabled=N,xe.autoUpdate=z,xe.needsUpdate=k,xe.type=F}function J(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function Z(T){let N=T.target;N.removeEventListener("dispose",Z),me(N)}function me(T){De(T),_e.remove(T)}function De(T){let N=_e.get(T).programs;N!==void 0&&(N.forEach(function(z){X.releaseProgram(z)}),T.isShaderMaterial&&X.releaseShaderCache(T))}this.renderBufferDirect=function(T,N,z,k,F,j){N===null&&(N=Se);let ce=F.isMesh&&F.matrixWorld.determinant()<0,pe=qd(T,N,z,k,F);ge.setMaterial(k,ce);let ue=z.index,Re=1;if(k.wireframe===!0){if(ue=y.getWireframeAttribute(z),ue===void 0)return;Re=2}let Pe=z.drawRange,Te=z.attributes.position,Ge=Pe.start*Re,nt=(Pe.start+Pe.count)*Re;j!==null&&(Ge=Math.max(Ge,j.start*Re),nt=Math.min(nt,(j.start+j.count)*Re)),ue!==null?(Ge=Math.max(Ge,0),nt=Math.min(nt,ue.count)):Te!=null&&(Ge=Math.max(Ge,0),nt=Math.min(nt,Te.count));let _t=nt-Ge;if(_t<0||_t===1/0)return;ae.setup(F,k,pe,z,ue);let ct,st=le;if(ue!==null&&(ct=E.get(ue),st=Ce,st.setIndex(ct)),F.isMesh)k.wireframe===!0?(ge.setLineWidth(k.wireframeLinewidth*Lt()),st.setMode(I.LINES)):st.setMode(I.TRIANGLES);else if(F.isLine){let Ee=k.linewidth;Ee===void 0&&(Ee=1),ge.setLineWidth(Ee*Lt()),F.isLineSegments?st.setMode(I.LINES):F.isLineLoop?st.setMode(I.LINE_LOOP):st.setMode(I.LINE_STRIP)}else F.isPoints?st.setMode(I.POINTS):F.isSprite&&st.setMode(I.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)vs("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),st.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Ne.get("WEBGL_multi_draw"))st.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{let Ee=F._multiDrawStarts,ft=F._multiDrawCounts,Ke=F._multiDrawCount,$t=ue?E.get(ue).bytesPerElement:1,Ji=_e.get(k).currentProgram.getUniforms();for(let Jt=0;Jt<Ke;Jt++)Ji.setValue(I,"_gl_DrawID",Jt),st.render(Ee[Jt]/$t,ft[Jt])}else if(F.isInstancedMesh)st.renderInstances(Ge,_t,F.count);else if(z.isInstancedBufferGeometry){let Ee=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,ft=Math.min(z.instanceCount,Ee);st.renderInstances(Ge,_t,ft)}else st.render(Ge,_t)};function at(T,N,z){T.transparent===!0&&T.side===bt&&T.forceSinglePass===!1?(T.side=Ht,T.needsUpdate=!0,ro(T,N,z),T.side=_n,T.needsUpdate=!0,ro(T,N,z),T.side=bt):ro(T,N,z)}this.compile=function(T,N,z=null){z===null&&(z=T),p=Me.get(z),p.init(N),w.push(p),z.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(p.pushLight(F),F.castShadow&&p.pushShadow(F))}),T!==z&&T.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(p.pushLight(F),F.castShadow&&p.pushShadow(F))}),p.setupLights();let k=new Set;return T.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;let j=F.material;if(j)if(Array.isArray(j))for(let ce=0;ce<j.length;ce++){let pe=j[ce];at(pe,z,F),k.add(pe)}else at(j,z,F),k.add(j)}),p=w.pop(),k},this.compileAsync=function(T,N,z=null){let k=this.compile(T,N,z);return new Promise(F=>{function j(){if(k.forEach(function(ce){_e.get(ce).currentProgram.isReady()&&k.delete(ce)}),k.size===0){F(T);return}setTimeout(j,10)}Ne.get("KHR_parallel_shader_compile")!==null?j():setTimeout(j,10)})};let je=null;function zn(T){je&&je(T)}function bn(){xi.stop()}function _h(){xi.start()}let xi=new Ed;xi.setAnimationLoop(zn),typeof self<"u"&&xi.setContext(self),this.setAnimationLoop=function(T){je=T,ee.setAnimationLoop(T),T===null?xi.stop():xi.start()},ee.addEventListener("sessionstart",bn),ee.addEventListener("sessionend",_h),this.render=function(T,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),ee.enabled===!0&&ee.isPresenting===!0&&(ee.cameraAutoUpdate===!0&&ee.updateCamera(N),N=ee.getCamera()),T.isScene===!0&&T.onBeforeRender(v,T,N,R),p=Me.get(T,w.length),p.init(N),w.push(p),$.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),lt.setFromProjectionMatrix($,mn,N.reversedDepth),Y=this.localClippingEnabled,Je=ne.init(this.clippingPlanes,Y),m=G.get(T,b.length),m.init(),b.push(m),ee.enabled===!0&&ee.isPresenting===!0){let j=v.xr.getDepthSensingMesh();j!==null&&lc(j,N,-1/0,v.sortObjects)}lc(T,N,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(oe,he),qe=ee.enabled===!1||ee.isPresenting===!1||ee.hasDepthSensing()===!1,qe&&ye.addToRenderList(m,T),this.info.render.frame++,Je===!0&&ne.beginShadows();let z=p.state.shadowsArray;xe.render(z,T,N),Je===!0&&ne.endShadows(),this.info.autoReset===!0&&this.info.reset();let k=m.opaque,F=m.transmissive;if(p.setupLights(),N.isArrayCamera){let j=N.cameras;if(F.length>0)for(let ce=0,pe=j.length;ce<pe;ce++){let ue=j[ce];yh(k,F,T,ue)}qe&&ye.render(T);for(let ce=0,pe=j.length;ce<pe;ce++){let ue=j[ce];xh(m,T,ue,ue.viewport)}}else F.length>0&&yh(k,F,T,N),qe&&ye.render(T),xh(m,T,N);R!==null&&S===0&&(Be.updateMultisampleRenderTarget(R),Be.updateRenderTargetMipmap(R)),T.isScene===!0&&T.onAfterRender(v,T,N),ae.resetDefaultState(),x=-1,M=null,w.pop(),w.length>0?(p=w[w.length-1],Je===!0&&ne.setGlobalState(v.clippingPlanes,p.state.camera)):p=null,b.pop(),b.length>0?m=b[b.length-1]:m=null};function lc(T,N,z,k){if(T.visible===!1)return;if(T.layers.test(N.layers)){if(T.isGroup)z=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(N);else if(T.isLight)p.pushLight(T),T.castShadow&&p.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||lt.intersectsSprite(T)){k&&Le.setFromMatrixPosition(T.matrixWorld).applyMatrix4($);let ce=O.update(T),pe=T.material;pe.visible&&m.push(T,ce,pe,z,Le.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||lt.intersectsObject(T))){let ce=O.update(T),pe=T.material;if(k&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Le.copy(T.boundingSphere.center)):(ce.boundingSphere===null&&ce.computeBoundingSphere(),Le.copy(ce.boundingSphere.center)),Le.applyMatrix4(T.matrixWorld).applyMatrix4($)),Array.isArray(pe)){let ue=ce.groups;for(let Re=0,Pe=ue.length;Re<Pe;Re++){let Te=ue[Re],Ge=pe[Te.materialIndex];Ge&&Ge.visible&&m.push(T,ce,Ge,z,Le.z,Te)}}else pe.visible&&m.push(T,ce,pe,z,Le.z,null)}}let j=T.children;for(let ce=0,pe=j.length;ce<pe;ce++)lc(j[ce],N,z,k)}function xh(T,N,z,k){let F=T.opaque,j=T.transmissive,ce=T.transparent;p.setupLightsView(z),Je===!0&&ne.setGlobalState(v.clippingPlanes,z),k&&ge.viewport(P.copy(k)),F.length>0&&so(F,N,z),j.length>0&&so(j,N,z),ce.length>0&&so(ce,N,z),ge.buffers.depth.setTest(!0),ge.buffers.depth.setMask(!0),ge.buffers.color.setMask(!0),ge.setPolygonOffset(!1)}function yh(T,N,z,k){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[k.id]===void 0&&(p.state.transmissionRenderTarget[k.id]=new Cn(1,1,{generateMipmaps:!0,type:Ne.has("EXT_color_buffer_half_float")||Ne.has("EXT_color_buffer_float")?Vs:Sn,minFilter:Mn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:We.workingColorSpace}));let j=p.state.transmissionRenderTarget[k.id],ce=k.viewport||P;j.setSize(ce.z*v.transmissionResolutionScale,ce.w*v.transmissionResolutionScale);let pe=v.getRenderTarget(),ue=v.getActiveCubeFace(),Re=v.getActiveMipmapLevel();v.setRenderTarget(j),v.getClearColor(H),q=v.getClearAlpha(),q<1&&v.setClearColor(16777215,.5),v.clear(),qe&&ye.render(z);let Pe=v.toneMapping;v.toneMapping=ei;let Te=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),p.setupLightsView(k),Je===!0&&ne.setGlobalState(v.clippingPlanes,k),so(T,z,k),Be.updateMultisampleRenderTarget(j),Be.updateRenderTargetMipmap(j),Ne.has("WEBGL_multisampled_render_to_texture")===!1){let Ge=!1;for(let nt=0,_t=N.length;nt<_t;nt++){let ct=N[nt],st=ct.object,Ee=ct.geometry,ft=ct.material,Ke=ct.group;if(ft.side===bt&&st.layers.test(k.layers)){let $t=ft.side;ft.side=Ht,ft.needsUpdate=!0,vh(st,z,k,Ee,ft,Ke),ft.side=$t,ft.needsUpdate=!0,Ge=!0}}Ge===!0&&(Be.updateMultisampleRenderTarget(j),Be.updateRenderTargetMipmap(j))}v.setRenderTarget(pe,ue,Re),v.setClearColor(H,q),Te!==void 0&&(k.viewport=Te),v.toneMapping=Pe}function so(T,N,z){let k=N.isScene===!0?N.overrideMaterial:null;for(let F=0,j=T.length;F<j;F++){let ce=T[F],pe=ce.object,ue=ce.geometry,Re=ce.group,Pe=ce.material;Pe.allowOverride===!0&&k!==null&&(Pe=k),pe.layers.test(z.layers)&&vh(pe,N,z,ue,Pe,Re)}}function vh(T,N,z,k,F,j){T.onBeforeRender(v,N,z,k,F,j),T.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),F.onBeforeRender(v,N,z,k,T,j),F.transparent===!0&&F.side===bt&&F.forceSinglePass===!1?(F.side=Ht,F.needsUpdate=!0,v.renderBufferDirect(z,N,k,F,T,j),F.side=_n,F.needsUpdate=!0,v.renderBufferDirect(z,N,k,F,T,j),F.side=bt):v.renderBufferDirect(z,N,k,F,T,j),T.onAfterRender(v,N,z,k,F,j)}function ro(T,N,z){N.isScene!==!0&&(N=Se);let k=_e.get(T),F=p.state.lights,j=p.state.shadowsArray,ce=F.state.version,pe=X.getParameters(T,F.state,j,N,z),ue=X.getProgramCacheKey(pe),Re=k.programs;k.environment=T.isMeshStandardMaterial?N.environment:null,k.fog=N.fog,k.envMap=(T.isMeshStandardMaterial?xt:Et).get(T.envMap||k.environment),k.envMapRotation=k.environment!==null&&T.envMap===null?N.environmentRotation:T.envMapRotation,Re===void 0&&(T.addEventListener("dispose",Z),Re=new Map,k.programs=Re);let Pe=Re.get(ue);if(Pe!==void 0){if(k.currentProgram===Pe&&k.lightsStateVersion===ce)return Sh(T,pe),Pe}else pe.uniforms=X.getUniforms(T),T.onBeforeCompile(pe,v),Pe=X.acquireProgram(pe,ue),Re.set(ue,Pe),k.uniforms=pe.uniforms;let Te=k.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Te.clippingPlanes=ne.uniform),Sh(T,pe),k.needsLights=Zd(T),k.lightsStateVersion=ce,k.needsLights&&(Te.ambientLightColor.value=F.state.ambient,Te.lightProbe.value=F.state.probe,Te.directionalLights.value=F.state.directional,Te.directionalLightShadows.value=F.state.directionalShadow,Te.spotLights.value=F.state.spot,Te.spotLightShadows.value=F.state.spotShadow,Te.rectAreaLights.value=F.state.rectArea,Te.ltc_1.value=F.state.rectAreaLTC1,Te.ltc_2.value=F.state.rectAreaLTC2,Te.pointLights.value=F.state.point,Te.pointLightShadows.value=F.state.pointShadow,Te.hemisphereLights.value=F.state.hemi,Te.directionalShadowMap.value=F.state.directionalShadowMap,Te.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Te.spotShadowMap.value=F.state.spotShadowMap,Te.spotLightMatrix.value=F.state.spotLightMatrix,Te.spotLightMap.value=F.state.spotLightMap,Te.pointShadowMap.value=F.state.pointShadowMap,Te.pointShadowMatrix.value=F.state.pointShadowMatrix),k.currentProgram=Pe,k.uniformsList=null,Pe}function Mh(T){if(T.uniformsList===null){let N=T.currentProgram.getUniforms();T.uniformsList=Ys.seqWithValue(N.seq,T.uniforms)}return T.uniformsList}function Sh(T,N){let z=_e.get(T);z.outputColorSpace=N.outputColorSpace,z.batching=N.batching,z.batchingColor=N.batchingColor,z.instancing=N.instancing,z.instancingColor=N.instancingColor,z.instancingMorph=N.instancingMorph,z.skinning=N.skinning,z.morphTargets=N.morphTargets,z.morphNormals=N.morphNormals,z.morphColors=N.morphColors,z.morphTargetsCount=N.morphTargetsCount,z.numClippingPlanes=N.numClippingPlanes,z.numIntersection=N.numClipIntersection,z.vertexAlphas=N.vertexAlphas,z.vertexTangents=N.vertexTangents,z.toneMapping=N.toneMapping}function qd(T,N,z,k,F){N.isScene!==!0&&(N=Se),Be.resetTextureUnits();let j=N.fog,ce=k.isMeshStandardMaterial?N.environment:null,pe=R===null?v.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:It,ue=(k.isMeshStandardMaterial?xt:Et).get(k.envMap||ce),Re=k.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Pe=!!z.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),Te=!!z.morphAttributes.position,Ge=!!z.morphAttributes.normal,nt=!!z.morphAttributes.color,_t=ei;k.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(_t=v.toneMapping);let ct=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,st=ct!==void 0?ct.length:0,Ee=_e.get(k),ft=p.state.lights;if(Je===!0&&(Y===!0||T!==M)){let Ot=T===M&&k.id===x;ne.setState(k,T,Ot)}let Ke=!1;k.version===Ee.__version?(Ee.needsLights&&Ee.lightsStateVersion!==ft.state.version||Ee.outputColorSpace!==pe||F.isBatchedMesh&&Ee.batching===!1||!F.isBatchedMesh&&Ee.batching===!0||F.isBatchedMesh&&Ee.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Ee.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Ee.instancing===!1||!F.isInstancedMesh&&Ee.instancing===!0||F.isSkinnedMesh&&Ee.skinning===!1||!F.isSkinnedMesh&&Ee.skinning===!0||F.isInstancedMesh&&Ee.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Ee.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Ee.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Ee.instancingMorph===!1&&F.morphTexture!==null||Ee.envMap!==ue||k.fog===!0&&Ee.fog!==j||Ee.numClippingPlanes!==void 0&&(Ee.numClippingPlanes!==ne.numPlanes||Ee.numIntersection!==ne.numIntersection)||Ee.vertexAlphas!==Re||Ee.vertexTangents!==Pe||Ee.morphTargets!==Te||Ee.morphNormals!==Ge||Ee.morphColors!==nt||Ee.toneMapping!==_t||Ee.morphTargetsCount!==st)&&(Ke=!0):(Ke=!0,Ee.__version=k.version);let $t=Ee.currentProgram;Ke===!0&&($t=ro(k,N,F));let Ji=!1,Jt=!1,js=!1,pt=$t.getUniforms(),nn=Ee.uniforms;if(ge.useProgram($t.program)&&(Ji=!0,Jt=!0,js=!0),k.id!==x&&(x=k.id,Jt=!0),Ji||M!==T){ge.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),pt.setValue(I,"projectionMatrix",T.projectionMatrix),pt.setValue(I,"viewMatrix",T.matrixWorldInverse);let Gt=pt.map.cameraPosition;Gt!==void 0&&Gt.setValue(I,fe.setFromMatrixPosition(T.matrixWorld)),Ie.logarithmicDepthBuffer&&pt.setValue(I,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&pt.setValue(I,"isOrthographic",T.isOrthographicCamera===!0),M!==T&&(M=T,Jt=!0,js=!0)}if(F.isSkinnedMesh){pt.setOptional(I,F,"bindMatrix"),pt.setOptional(I,F,"bindMatrixInverse");let Ot=F.skeleton;Ot&&(Ot.boneTexture===null&&Ot.computeBoneTexture(),pt.setValue(I,"boneTexture",Ot.boneTexture,Be))}F.isBatchedMesh&&(pt.setOptional(I,F,"batchingTexture"),pt.setValue(I,"batchingTexture",F._matricesTexture,Be),pt.setOptional(I,F,"batchingIdTexture"),pt.setValue(I,"batchingIdTexture",F._indirectTexture,Be),pt.setOptional(I,F,"batchingColorTexture"),F._colorsTexture!==null&&pt.setValue(I,"batchingColorTexture",F._colorsTexture,Be));let sn=z.morphAttributes;if((sn.position!==void 0||sn.normal!==void 0||sn.color!==void 0)&&Q.update(F,z,$t),(Jt||Ee.receiveShadow!==F.receiveShadow)&&(Ee.receiveShadow=F.receiveShadow,pt.setValue(I,"receiveShadow",F.receiveShadow)),k.isMeshGouraudMaterial&&k.envMap!==null&&(nn.envMap.value=ue,nn.flipEnvMap.value=ue.isCubeTexture&&ue.isRenderTargetTexture===!1?-1:1),k.isMeshStandardMaterial&&k.envMap===null&&N.environment!==null&&(nn.envMapIntensity.value=N.environmentIntensity),Jt&&(pt.setValue(I,"toneMappingExposure",v.toneMappingExposure),Ee.needsLights&&Yd(nn,js),j&&k.fog===!0&&K.refreshFogUniforms(nn,j),K.refreshMaterialUniforms(nn,k,V,te,p.state.transmissionRenderTarget[T.id]),Ys.upload(I,Mh(Ee),nn,Be)),k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(Ys.upload(I,Mh(Ee),nn,Be),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&pt.setValue(I,"center",F.center),pt.setValue(I,"modelViewMatrix",F.modelViewMatrix),pt.setValue(I,"normalMatrix",F.normalMatrix),pt.setValue(I,"modelMatrix",F.matrixWorld),k.isShaderMaterial||k.isRawShaderMaterial){let Ot=k.uniformsGroups;for(let Gt=0,hc=Ot.length;Gt<hc;Gt++){let yi=Ot[Gt];Oe.update(yi,$t),Oe.bind(yi,$t)}}return $t}function Yd(T,N){T.ambientLightColor.needsUpdate=N,T.lightProbe.needsUpdate=N,T.directionalLights.needsUpdate=N,T.directionalLightShadows.needsUpdate=N,T.pointLights.needsUpdate=N,T.pointLightShadows.needsUpdate=N,T.spotLights.needsUpdate=N,T.spotLightShadows.needsUpdate=N,T.rectAreaLights.needsUpdate=N,T.hemisphereLights.needsUpdate=N}function Zd(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return R},this.setRenderTargetTextures=function(T,N,z){let k=_e.get(T);k.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),_e.get(T.texture).__webglTexture=N,_e.get(T.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:z,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,N){let z=_e.get(T);z.__webglFramebuffer=N,z.__useDefaultFramebuffer=N===void 0};let Kd=I.createFramebuffer();this.setRenderTarget=function(T,N=0,z=0){R=T,A=N,S=z;let k=!0,F=null,j=!1,ce=!1;if(T){let ue=_e.get(T);if(ue.__useDefaultFramebuffer!==void 0)ge.bindFramebuffer(I.FRAMEBUFFER,null),k=!1;else if(ue.__webglFramebuffer===void 0)Be.setupRenderTarget(T);else if(ue.__hasExternalTextures)Be.rebindTextures(T,_e.get(T.texture).__webglTexture,_e.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let Te=T.depthTexture;if(ue.__boundDepthTexture!==Te){if(Te!==null&&_e.has(Te)&&(T.width!==Te.image.width||T.height!==Te.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Be.setupDepthRenderbuffer(T)}}let Re=T.texture;(Re.isData3DTexture||Re.isDataArrayTexture||Re.isCompressedArrayTexture)&&(ce=!0);let Pe=_e.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Pe[N])?F=Pe[N][z]:F=Pe[N],j=!0):T.samples>0&&Be.useMultisampledRTT(T)===!1?F=_e.get(T).__webglMultisampledFramebuffer:Array.isArray(Pe)?F=Pe[z]:F=Pe,P.copy(T.viewport),U.copy(T.scissor),B=T.scissorTest}else P.copy(be).multiplyScalar(V).floor(),U.copy(ke).multiplyScalar(V).floor(),B=ot;if(z!==0&&(F=Kd),ge.bindFramebuffer(I.FRAMEBUFFER,F)&&k&&ge.drawBuffers(T,F),ge.viewport(P),ge.scissor(U),ge.setScissorTest(B),j){let ue=_e.get(T.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+N,ue.__webglTexture,z)}else if(ce){let ue=N;for(let Re=0;Re<T.textures.length;Re++){let Pe=_e.get(T.textures[Re]);I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0+Re,Pe.__webglTexture,z,ue)}}else if(T!==null&&z!==0){let ue=_e.get(T.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,ue.__webglTexture,z)}x=-1},this.readRenderTargetPixels=function(T,N,z,k,F,j,ce,pe=0){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ue=_e.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&ce!==void 0&&(ue=ue[ce]),ue){ge.bindFramebuffer(I.FRAMEBUFFER,ue);try{let Re=T.textures[pe],Pe=Re.format,Te=Re.type;if(!Ie.textureFormatReadable(Pe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ie.textureTypeReadable(Te)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=T.width-k&&z>=0&&z<=T.height-F&&(T.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+pe),I.readPixels(N,z,k,F,ve.convert(Pe),ve.convert(Te),j))}finally{let Re=R!==null?_e.get(R).__webglFramebuffer:null;ge.bindFramebuffer(I.FRAMEBUFFER,Re)}}},this.readRenderTargetPixelsAsync=async function(T,N,z,k,F,j,ce,pe=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ue=_e.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&ce!==void 0&&(ue=ue[ce]),ue)if(N>=0&&N<=T.width-k&&z>=0&&z<=T.height-F){ge.bindFramebuffer(I.FRAMEBUFFER,ue);let Re=T.textures[pe],Pe=Re.format,Te=Re.type;if(!Ie.textureFormatReadable(Pe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ie.textureTypeReadable(Te))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Ge=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,Ge),I.bufferData(I.PIXEL_PACK_BUFFER,j.byteLength,I.STREAM_READ),T.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+pe),I.readPixels(N,z,k,F,ve.convert(Pe),ve.convert(Te),0);let nt=R!==null?_e.get(R).__webglFramebuffer:null;ge.bindFramebuffer(I.FRAMEBUFFER,nt);let _t=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await Ju(I,_t,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,Ge),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,j),I.deleteBuffer(Ge),I.deleteSync(_t),j}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,N=null,z=0){let k=Math.pow(2,-z),F=Math.floor(T.image.width*k),j=Math.floor(T.image.height*k),ce=N!==null?N.x:0,pe=N!==null?N.y:0;Be.setTexture2D(T,0),I.copyTexSubImage2D(I.TEXTURE_2D,z,0,0,ce,pe,F,j),ge.unbindTexture()};let $d=I.createFramebuffer(),Jd=I.createFramebuffer();this.copyTextureToTexture=function(T,N,z=null,k=null,F=0,j=null){j===null&&(F!==0?(vs("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),j=F,F=0):j=0);let ce,pe,ue,Re,Pe,Te,Ge,nt,_t,ct=T.isCompressedTexture?T.mipmaps[j]:T.image;if(z!==null)ce=z.max.x-z.min.x,pe=z.max.y-z.min.y,ue=z.isBox3?z.max.z-z.min.z:1,Re=z.min.x,Pe=z.min.y,Te=z.isBox3?z.min.z:0;else{let sn=Math.pow(2,-F);ce=Math.floor(ct.width*sn),pe=Math.floor(ct.height*sn),T.isDataArrayTexture?ue=ct.depth:T.isData3DTexture?ue=Math.floor(ct.depth*sn):ue=1,Re=0,Pe=0,Te=0}k!==null?(Ge=k.x,nt=k.y,_t=k.z):(Ge=0,nt=0,_t=0);let st=ve.convert(N.format),Ee=ve.convert(N.type),ft;N.isData3DTexture?(Be.setTexture3D(N,0),ft=I.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(Be.setTexture2DArray(N,0),ft=I.TEXTURE_2D_ARRAY):(Be.setTexture2D(N,0),ft=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,N.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,N.unpackAlignment);let Ke=I.getParameter(I.UNPACK_ROW_LENGTH),$t=I.getParameter(I.UNPACK_IMAGE_HEIGHT),Ji=I.getParameter(I.UNPACK_SKIP_PIXELS),Jt=I.getParameter(I.UNPACK_SKIP_ROWS),js=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,ct.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,ct.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Re),I.pixelStorei(I.UNPACK_SKIP_ROWS,Pe),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Te);let pt=T.isDataArrayTexture||T.isData3DTexture,nn=N.isDataArrayTexture||N.isData3DTexture;if(T.isDepthTexture){let sn=_e.get(T),Ot=_e.get(N),Gt=_e.get(sn.__renderTarget),hc=_e.get(Ot.__renderTarget);ge.bindFramebuffer(I.READ_FRAMEBUFFER,Gt.__webglFramebuffer),ge.bindFramebuffer(I.DRAW_FRAMEBUFFER,hc.__webglFramebuffer);for(let yi=0;yi<ue;yi++)pt&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,_e.get(T).__webglTexture,F,Te+yi),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,_e.get(N).__webglTexture,j,_t+yi)),I.blitFramebuffer(Re,Pe,ce,pe,Ge,nt,ce,pe,I.DEPTH_BUFFER_BIT,I.NEAREST);ge.bindFramebuffer(I.READ_FRAMEBUFFER,null),ge.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(F!==0||T.isRenderTargetTexture||_e.has(T)){let sn=_e.get(T),Ot=_e.get(N);ge.bindFramebuffer(I.READ_FRAMEBUFFER,$d),ge.bindFramebuffer(I.DRAW_FRAMEBUFFER,Jd);for(let Gt=0;Gt<ue;Gt++)pt?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,sn.__webglTexture,F,Te+Gt):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,sn.__webglTexture,F),nn?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Ot.__webglTexture,j,_t+Gt):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,Ot.__webglTexture,j),F!==0?I.blitFramebuffer(Re,Pe,ce,pe,Ge,nt,ce,pe,I.COLOR_BUFFER_BIT,I.NEAREST):nn?I.copyTexSubImage3D(ft,j,Ge,nt,_t+Gt,Re,Pe,ce,pe):I.copyTexSubImage2D(ft,j,Ge,nt,Re,Pe,ce,pe);ge.bindFramebuffer(I.READ_FRAMEBUFFER,null),ge.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else nn?T.isDataTexture||T.isData3DTexture?I.texSubImage3D(ft,j,Ge,nt,_t,ce,pe,ue,st,Ee,ct.data):N.isCompressedArrayTexture?I.compressedTexSubImage3D(ft,j,Ge,nt,_t,ce,pe,ue,st,ct.data):I.texSubImage3D(ft,j,Ge,nt,_t,ce,pe,ue,st,Ee,ct):T.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,j,Ge,nt,ce,pe,st,Ee,ct.data):T.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,j,Ge,nt,ct.width,ct.height,st,ct.data):I.texSubImage2D(I.TEXTURE_2D,j,Ge,nt,ce,pe,st,Ee,ct);I.pixelStorei(I.UNPACK_ROW_LENGTH,Ke),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,$t),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Ji),I.pixelStorei(I.UNPACK_SKIP_ROWS,Jt),I.pixelStorei(I.UNPACK_SKIP_IMAGES,js),j===0&&N.generateMipmaps&&I.generateMipmap(ft),ge.unbindTexture()},this.initRenderTarget=function(T){_e.get(T).__webglFramebuffer===void 0&&Be.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?Be.setTextureCube(T,0):T.isData3DTexture?Be.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?Be.setTexture2DArray(T,0):Be.setTexture2D(T,0),ge.unbindTexture()},this.resetState=function(){A=0,S=0,R=null,ge.reset(),ae.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return mn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=We._getDrawingBufferColorSpace(e),t.unpackColorSpace=We._getUnpackColorSpace()}};function Ll(s,e){if(e===ol)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===Ws||e===$r){let t=s.getIndex();if(t===null){let o=[],a=s.getAttribute("position");if(a!==void 0){for(let c=0;c<a.count;c++)o.push(c);s.setIndex(o),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}let n=t.count-2,i=[];if(e===Ws)for(let o=1;o<=n;o++)i.push(t.getX(0)),i.push(t.getX(o)),i.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(i.push(t.getX(o)),i.push(t.getX(o+1)),i.push(t.getX(o+2))):(i.push(t.getX(o+2)),i.push(t.getX(o+1)),i.push(t.getX(o)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let r=s.clone();return r.setIndex(i),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}var nc=class extends Dn{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new zl(t)}),this.register(function(t){return new kl(t)}),this.register(function(t){return new Kl(t)}),this.register(function(t){return new $l(t)}),this.register(function(t){return new Jl(t)}),this.register(function(t){return new Hl(t)}),this.register(function(t){return new Gl(t)}),this.register(function(t){return new Wl(t)}),this.register(function(t){return new Xl(t)}),this.register(function(t){return new Bl(t)}),this.register(function(t){return new ql(t)}),this.register(function(t){return new Vl(t)}),this.register(function(t){return new Zl(t)}),this.register(function(t){return new Yl(t)}),this.register(function(t){return new Fl(t)}),this.register(function(t){return new jl(t)}),this.register(function(t){return new Ql(t)})}load(e,t,n,i){let r=this,o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){let l=jn.extractUrlBase(e);o=jn.resolveURL(l,this.path)}else o=jn.extractUrlBase(e);this.manager.itemStart(e);let a=function(l){i?i(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},c=new Os(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{r.parse(l,o,function(u){t(u),r.manager.itemEnd(e)},a)}catch(u){a(u)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r,o={},a={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===Ud){try{o[He.KHR_BINARY_GLTF]=new eh(e)}catch(h){i&&i(h);return}r=JSON.parse(o[He.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let l=new ah(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){let h=this.pluginCallbacks[u](l);h.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[h.name]=h,o[h.name]=!0}if(r.extensionsUsed)for(let u=0;u<r.extensionsUsed.length;++u){let h=r.extensionsUsed[u],d=r.extensionsRequired||[];switch(h){case He.KHR_MATERIALS_UNLIT:o[h]=new Ol;break;case He.KHR_DRACO_MESH_COMPRESSION:o[h]=new th(r,this.dracoLoader);break;case He.KHR_TEXTURE_TRANSFORM:o[h]=new nh;break;case He.KHR_MESH_QUANTIZATION:o[h]=new ih;break;default:d.indexOf(h)>=0&&a[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}l.setExtensions(o),l.setPlugins(a),l.parse(n,i)}parseAsync(e,t){let n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}};function D0(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}var He={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},Fl=class{constructor(e){this.parser=e,this.name=He.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,i=t.cache.get(n);if(i)return i;let r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],l,u=new we(16777215);c.color!==void 0&&u.setRGB(c.color[0],c.color[1],c.color[2],It);let h=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new Fi(u),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new Vr(u),l.distance=h;break;case"spot":l=new kr(u),l.distance=h,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),Fn(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),i=Promise.resolve(l),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(c){return n._getNodeRef(t.cache,a,c)})}},Ol=class{constructor(){this.name=He.KHR_MATERIALS_UNLIT}getMaterialType(){return tt}extendParams(e,t,n){let i=[];e.color=new we(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],It),e.opacity=o[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,mt))}return Promise.all(i)}},Bl=class{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},zl=class{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){let a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Ae(a,a)}return Promise.all(r)}},kl=class{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_DISPERSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=i.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}},Vl=class{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}},Hl=class{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_SHEEN}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[];t.sheenColor=new we(0,0,0),t.sheenRoughness=0,t.sheen=1;let o=i.extensions[this.name];if(o.sheenColorFactor!==void 0){let a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],It)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,mt)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}},Gl=class{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}},Wl=class{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_VOLUME}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;let a=o.attenuationColor||[1,1,1];return t.attenuationColor=new we().setRGB(a[0],a[1],a[2],It),Promise.all(r)}},Xl=class{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_IOR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=i.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}},ql=class{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_SPECULAR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));let a=o.specularColorFactor||[1,1,1];return t.specularColor=new we().setRGB(a[0],a[1],a[2],It),o.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,mt)),Promise.all(r)}},Yl=class{constructor(e){this.parser=e,this.name=He.EXT_MATERIALS_BUMP}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}},Zl=class{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}},Kl=class{constructor(e){this.parser=e,this.name=He.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;let r=i.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}},$l=class{constructor(e){this.parser=e,this.name=He.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=i.images[o.source],c=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);l!==null&&(c=l)}return n.loadTextureImage(e,o.source,c)}},Jl=class{constructor(e){this.parser=e,this.name=He.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=i.images[o.source],c=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);l!==null&&(c=l)}return n.loadTextureImage(e,o.source,c)}},jl=class{constructor(e){this.name=He.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){let c=i.byteOffset||0,l=i.byteLength||0,u=i.count,h=i.byteStride,d=new Uint8Array(a,c,l);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(u,h,d,i.mode,i.filter).then(function(f){return f.buffer}):o.ready.then(function(){let f=new ArrayBuffer(u*h);return o.decodeGltfBuffer(new Uint8Array(f),u,h,d,i.mode,i.filter),f})})}else return null}},Ql=class{constructor(e){this.name=He.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let i=t.meshes[n.mesh];for(let l of i.primitives)if(l.mode!==cn.TRIANGLES&&l.mode!==cn.TRIANGLE_STRIP&&l.mode!==cn.TRIANGLE_FAN&&l.mode!==void 0)return null;let o=n.extensions[this.name].attributes,a=[],c={};for(let l in o)a.push(this.parser.getDependency("accessor",o[l]).then(u=>(c[l]=u,c[l])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(l=>{let u=l.pop(),h=u.isGroup?u.children:[u],d=l[0].count,f=[];for(let g of h){let _=new Ue,m=new L,p=new zt,b=new L(1,1,1),w=new Xt(g.geometry,g.material,d);for(let v=0;v<d;v++)c.TRANSLATION&&m.fromBufferAttribute(c.TRANSLATION,v),c.ROTATION&&p.fromBufferAttribute(c.ROTATION,v),c.SCALE&&b.fromBufferAttribute(c.SCALE,v),w.setMatrixAt(v,_.compose(m,p,b));for(let v in c)if(v==="_COLOR_0"){let C=c[v];w.instanceColor=new di(C.array,C.itemSize,C.normalized)}else v!=="TRANSLATION"&&v!=="ROTATION"&&v!=="SCALE"&&g.geometry.setAttribute(v,c[v]);rt.prototype.copy.call(w,g),this.parser.assignFinalMaterial(w),f.push(w)}return u.isGroup?(u.clear(),u.add(...f),u):f[0]}))}},Ud="glTF",jr=12,Pd={JSON:1313821514,BIN:5130562},eh=class{constructor(e){this.name=He.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,jr),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Ud)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let i=this.header.length-jr,r=new DataView(e,jr),o=0;for(;o<i;){let a=r.getUint32(o,!0);o+=4;let c=r.getUint32(o,!0);if(o+=4,c===Pd.JSON){let l=new Uint8Array(e,jr+o,a);this.content=n.decode(l)}else if(c===Pd.BIN){let l=jr+o;this.body=e.slice(l,l+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},th=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=He.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},c={},l={};for(let u in o){let h=rh[u]||u.toLowerCase();a[h]=o[u]}for(let u in e.attributes){let h=rh[u]||u.toLowerCase();if(o[u]!==void 0){let d=n.accessors[e.attributes[u]],f=Ks[d.componentType];l[h]=f.name,c[h]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(u){return new Promise(function(h,d){i.decodeDracoFile(u,function(f){for(let g in f.attributes){let _=f.attributes[g],m=c[g];m!==void 0&&(_.normalized=m)}h(f)},a,l,It,d)})})}},nh=class{constructor(){this.name=He.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}},ih=class{constructor(){this.name=He.KHR_MESH_QUANTIZATION}},ic=class extends Zn{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let o=0;o!==i;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=a*2,l=a*3,u=i-t,h=(n-t)/u,d=h*h,f=d*h,g=e*l,_=g-l,m=-2*f+3*d,p=f-d,b=1-m,w=p-d+h;for(let v=0;v!==a;v++){let C=o[_+v+a],A=o[_+v+c]*u,S=o[g+v+a],R=o[g+v]*u;r[v]=b*C+w*A+m*S+p*R}return r}},N0=new zt,sh=class extends ic{interpolate_(e,t,n,i){let r=super.interpolate_(e,t,n,i);return N0.fromArray(r).normalize().toArray(r),r}},cn={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},Ks={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Ld={9728:Ct,9729:kt,9984:fa,9985:zs,9986:zi,9987:Mn},Dd={33071:wn,33648:_s,10497:An},Dl={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},rh={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},mi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},U0={CUBICSPLINE:void 0,LINEAR:Ii,STEP:Ci},Nl={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function F0(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new on({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:_n})),s.DefaultMaterial}function Xi(s,e,t){for(let n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Fn(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function O0(s,e,t){let n=!1,i=!1,r=!1;for(let l=0,u=e.length;l<u;l++){let h=e[l];if(h.POSITION!==void 0&&(n=!0),h.NORMAL!==void 0&&(i=!0),h.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);let o=[],a=[],c=[];for(let l=0,u=e.length;l<u;l++){let h=e[l];if(n){let d=h.POSITION!==void 0?t.getDependency("accessor",h.POSITION):s.attributes.position;o.push(d)}if(i){let d=h.NORMAL!==void 0?t.getDependency("accessor",h.NORMAL):s.attributes.normal;a.push(d)}if(r){let d=h.COLOR_0!==void 0?t.getDependency("accessor",h.COLOR_0):s.attributes.color;c.push(d)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c)]).then(function(l){let u=l[0],h=l[1],d=l[2];return n&&(s.morphAttributes.position=u),i&&(s.morphAttributes.normal=h),r&&(s.morphAttributes.color=d),s.morphTargetsRelative=!0,s})}function B0(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function z0(s){let e,t=s.extensions&&s.extensions[He.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Ul(t.attributes):e=s.indices+":"+Ul(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+Ul(s.targets[n]);return e}function Ul(s){let e="",t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function oh(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function k0(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var V0=new Ue,ah=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new D0,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,o=-1;if(typeof navigator<"u"){let a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;let c=a.match(/Version\/(\d+)/);i=n&&c?parseInt(c[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&o<98?this.textureLoader=new Or(this.options.manager):this.textureLoader=new Gr(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Os(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){let a={scene:o[0][i.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:i.asset,parser:n,userData:{}};return Xi(r,a,i),Fn(a,i),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(a)})).then(function(){for(let c of a.scenes)c.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){let o=t[i].joints;for(let a=0,c=o.length;a<c;a++)e[o[a]].isBone=!0}for(let i=0,r=e.length;i<r;i++){let o=e[i];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let i=n.clone(),r=(o,a)=>{let c=this.associations.get(o);c!=null&&this.associations.set(a,c);for(let[l,u]of o.children.entries())r(u,a.children[l])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let i=e(t[n]);if(i)return i}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let i=0;i<t.length;i++){let r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[He.KHR_BINARY_GLTF].body);let i=this.options;return new Promise(function(r,o){n.load(jn.resolveURL(t.uri,i.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){let t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){let o=Dl[i.type],a=Ks[i.componentType],c=i.normalized===!0,l=new a(i.count*o);return Promise.resolve(new Mt(l,o,c))}let r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(o){let a=o[0],c=Dl[i.type],l=Ks[i.componentType],u=l.BYTES_PER_ELEMENT,h=u*c,d=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,g=i.normalized===!0,_,m;if(f&&f!==h){let p=Math.floor(d/f),b="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+p+":"+i.count,w=t.cache.get(b);w||(_=new l(a,p*f,i.count*f/u),w=new Di(_,f/u),t.cache.add(b,w)),m=new ui(w,c,d%f/u,g)}else a===null?_=new l(i.count*c):_=new l(a,d,i.count*c),m=new Mt(_,c,g);if(i.sparse!==void 0){let p=Dl.SCALAR,b=Ks[i.sparse.indices.componentType],w=i.sparse.indices.byteOffset||0,v=i.sparse.values.byteOffset||0,C=new b(o[1],w,i.sparse.count*p),A=new l(o[2],v,i.sparse.count*c);a!==null&&(m=new Mt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let S=0,R=C.length;S<R;S++){let x=C[S];if(m.setX(x,A[S*c]),c>=2&&m.setY(x,A[S*c+1]),c>=3&&m.setZ(x,A[S*c+2]),c>=4&&m.setW(x,A[S*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r],a=this.textureLoader;if(o.uri){let c=n.manager.getHandler(o.uri);c!==null&&(a=c)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let i=this,r=this.json,o=r.textures[e],a=r.images[t],c=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[c])return this.textureCache[c];let l=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=o.name||a.name||"",u.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(u.name=a.uri);let d=(r.samplers||{})[o.sampler]||{};return u.magFilter=Ld[d.magFilter]||kt,u.minFilter=Ld[d.minFilter]||Mn,u.wrapS=Dd[d.wrapS]||An,u.wrapT=Dd[d.wrapT]||An,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==Ct&&u.minFilter!==kt,i.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){let n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());let o=i.images[e],a=self.URL||self.webkitURL,c=o.uri||"",l=!1;if(o.bufferView!==void 0)c=n.getDependency("bufferView",o.bufferView).then(function(h){l=!0;let d=new Blob([h],{type:o.mimeType});return c=a.createObjectURL(d),c});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let u=Promise.resolve(c).then(function(h){return new Promise(function(d,f){let g=d;t.isImageBitmapLoader===!0&&(g=function(_){let m=new St(_);m.needsUpdate=!0,d(m)}),t.load(jn.resolveURL(h,r.path),g,void 0,f)})}).then(function(h){return l===!0&&a.revokeObjectURL(c),Fn(h,o),h.userData.mimeType=o.mimeType||k0(o.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),h});return this.sourceCache[e]=u,u}assignTexture(e,t,n,i){let r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[He.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[He.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let c=r.associations.get(o);o=r.extensions[He.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,c)}}return i!==void 0&&(o.colorSpace=i),e[t]=o,o})}assignFinalMaterial(e){let t=e.geometry,n=e.material,i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,c=this.cache.get(a);c||(c=new As,Vt.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(a,c)),n=c}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,c=this.cache.get(a);c||(c=new Es,Vt.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(a,c)),n=c}if(i||r||o){let a="ClonedMaterial:"+n.uuid+":";i&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let c=this.cache.get(a);c||(c=n.clone(),r&&(c.vertexColors=!0),o&&(c.flatShading=!0),i&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(a,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return on}loadMaterial(e){let t=this,n=this.json,i=this.extensions,r=n.materials[e],o,a={},c=r.extensions||{},l=[];if(c[He.KHR_MATERIALS_UNLIT]){let h=i[He.KHR_MATERIALS_UNLIT];o=h.getMaterialType(),l.push(h.extendParams(a,r,t))}else{let h=r.pbrMetallicRoughness||{};if(a.color=new we(1,1,1),a.opacity=1,Array.isArray(h.baseColorFactor)){let d=h.baseColorFactor;a.color.setRGB(d[0],d[1],d[2],It),a.opacity=d[3]}h.baseColorTexture!==void 0&&l.push(t.assignTexture(a,"map",h.baseColorTexture,mt)),a.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,a.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(a,"metalnessMap",h.metallicRoughnessTexture)),l.push(t.assignTexture(a,"roughnessMap",h.metallicRoughnessTexture))),o=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=bt);let u=r.alphaMode||Nl.OPAQUE;if(u===Nl.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,u===Nl.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==tt&&(l.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new Ae(1,1),r.normalTexture.scale!==void 0)){let h=r.normalTexture.scale;a.normalScale.set(h,h)}if(r.occlusionTexture!==void 0&&o!==tt&&(l.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==tt){let h=r.emissiveFactor;a.emissive=new we().setRGB(h[0],h[1],h[2],It)}return r.emissiveTexture!==void 0&&o!==tt&&l.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,mt)),Promise.all(l).then(function(){let h=new o(a);return r.name&&(h.name=r.name),Fn(h,r),t.associations.set(h,{materials:e}),r.extensions&&Xi(i,h,r),h})}createUniqueName(e){let t=it.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,i=this.primitiveCache;function r(a){return n[He.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(c){return Nd(c,a,t)})}let o=[];for(let a=0,c=e.length;a<c;a++){let l=e[a],u=z0(l),h=i[u];if(h)o.push(h.promise);else{let d;l.extensions&&l.extensions[He.KHR_DRACO_MESH_COMPRESSION]?d=r(l):d=Nd(new yt,l,t),i[u]={primitive:l,promise:d},o.push(d)}}return Promise.all(o)}loadMesh(e){let t=this,n=this.json,i=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let c=0,l=o.length;c<l;c++){let u=o[c].material===void 0?F0(this.cache):this.getDependency("material",o[c].material);a.push(u)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(c){let l=c.slice(0,c.length-1),u=c[c.length-1],h=[];for(let f=0,g=u.length;f<g;f++){let _=u[f],m=o[f],p,b=l[f];if(m.mode===cn.TRIANGLES||m.mode===cn.TRIANGLE_STRIP||m.mode===cn.TRIANGLE_FAN||m.mode===void 0)p=r.isSkinnedMesh===!0?new Tr(_,b):new Ze(_,b),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===cn.TRIANGLE_STRIP?p.geometry=Ll(p.geometry,$r):m.mode===cn.TRIANGLE_FAN&&(p.geometry=Ll(p.geometry,Ws));else if(m.mode===cn.LINES)p=new Ar(_,b);else if(m.mode===cn.LINE_STRIP)p=new Ni(_,b);else if(m.mode===cn.LINE_LOOP)p=new Rr(_,b);else if(m.mode===cn.POINTS)p=new Cr(_,b);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&B0(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),Fn(p,r),m.extensions&&Xi(i,p,m),t.assignFinalMaterial(p),h.push(p)}for(let f=0,g=h.length;f<g;f++)t.associations.set(h[f],{meshes:e,primitives:f});if(h.length===1)return r.extensions&&Xi(i,h[0],r),h[0];let d=new dt;r.extensions&&Xi(i,d,r),t.associations.set(d,{meshes:e});for(let f=0,g=h.length;f<g;f++)d.add(h[f]);return d})}loadCamera(e){let t,n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Rt(ul.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new Jn(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Fn(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){let r=i.pop(),o=i,a=[],c=[];for(let l=0,u=o.length;l<u;l++){let h=o[l];if(h){a.push(h);let d=new Ue;r!==null&&d.fromArray(r.array,l*16),c.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new Er(a,c)})}loadAnimation(e){let t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,o=[],a=[],c=[],l=[],u=[];for(let h=0,d=i.channels.length;h<d;h++){let f=i.channels[h],g=i.samplers[f.sampler],_=f.target,m=_.node,p=i.parameters!==void 0?i.parameters[g.input]:g.input,b=i.parameters!==void 0?i.parameters[g.output]:g.output;_.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",p)),c.push(this.getDependency("accessor",b)),l.push(g),u.push(_))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c),Promise.all(l),Promise.all(u)]).then(function(h){let d=h[0],f=h[1],g=h[2],_=h[3],m=h[4],p=[];for(let w=0,v=d.length;w<v;w++){let C=d[w],A=f[w],S=g[w],R=_[w],x=m[w];if(C===void 0)continue;C.updateMatrix&&C.updateMatrix();let M=n._createAnimationTracks(C,A,S,R,x);if(M)for(let P=0;P<M.length;P++)p.push(M[P])}let b=new Ui(r,void 0,p);return Fn(b,i),b})}createNodeMesh(e){let t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){let o=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let c=0,l=i.weights.length;c<l;c++)a.morphTargetInfluences[c]=i.weights[c]}),o})}loadNode(e){let t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=i.children||[];for(let l=0,u=a.length;l<u;l++)o.push(n.getDependency("node",a[l]));let c=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(o),c]).then(function(l){let u=l[0],h=l[1],d=l[2];d!==null&&u.traverse(function(f){f.isSkinnedMesh&&f.bind(d,V0)});for(let f=0,g=h.length;f<g;f++)u.add(h[f]);return u})}_loadNodeShallow(e){let t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],o=r.name?i.createUniqueName(r.name):"",a=[],c=i._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&a.push(c),r.camera!==void 0&&a.push(i.getDependency("camera",r.camera).then(function(l){return i._getNodeRef(i.cameraCache,r.camera,l)})),i._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){a.push(l)}),this.nodeCache[e]=Promise.all(a).then(function(l){let u;if(r.isBone===!0?u=new Ts:l.length>1?u=new dt:l.length===1?u=l[0]:u=new rt,u!==l[0])for(let h=0,d=l.length;h<d;h++)u.add(l[h]);if(r.name&&(u.userData.name=r.name,u.name=o),Fn(u,r),r.extensions&&Xi(n,u,r),r.matrix!==void 0){let h=new Ue;h.fromArray(r.matrix),u.applyMatrix4(h)}else r.translation!==void 0&&u.position.fromArray(r.translation),r.rotation!==void 0&&u.quaternion.fromArray(r.rotation),r.scale!==void 0&&u.scale.fromArray(r.scale);if(!i.associations.has(u))i.associations.set(u,{});else if(r.mesh!==void 0&&i.meshCache.refs[r.mesh]>1){let h=i.associations.get(u);i.associations.set(u,{...h})}return i.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],i=this,r=new dt;n.name&&(r.name=i.createUniqueName(n.name)),Fn(r,n),n.extensions&&Xi(t,r,n);let o=n.nodes||[],a=[];for(let c=0,l=o.length;c<l;c++)a.push(i.getDependency("node",o[c]));return Promise.all(a).then(function(c){for(let u=0,h=c.length;u<h;u++)r.add(c[u]);let l=u=>{let h=new Map;for(let[d,f]of i.associations)(d instanceof Vt||d instanceof St)&&h.set(d,f);return u.traverse(d=>{let f=i.associations.get(d);f!=null&&h.set(d,f)}),h};return i.associations=l(r),r})}_createAnimationTracks(e,t,n,i,r){let o=[],a=e.name?e.name:e.uuid,c=[];mi[r.path]===mi.weights?e.traverse(function(d){d.morphTargetInfluences&&c.push(d.name?d.name:d.uuid)}):c.push(a);let l;switch(mi[r.path]){case mi.weights:l=In;break;case mi.rotation:l=Pn;break;case mi.translation:case mi.scale:l=Ln;break;default:switch(n.itemSize){case 1:l=In;break;case 2:case 3:default:l=Ln;break}break}let u=i.interpolation!==void 0?U0[i.interpolation]:Ii,h=this._getArrayFromAccessor(n);for(let d=0,f=c.length;d<f;d++){let g=new l(c[d]+"."+mi[r.path],t.array,h,u);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=oh(t.constructor),i=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let i=this instanceof Pn?sh:ic;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function H0(s,e,t){let n=e.attributes,i=new en;if(n.POSITION!==void 0){let a=t.json.accessors[n.POSITION],c=a.min,l=a.max;if(c!==void 0&&l!==void 0){if(i.set(new L(c[0],c[1],c[2]),new L(l[0],l[1],l[2])),a.normalized){let u=oh(Ks[a.componentType]);i.min.multiplyScalar(u),i.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let a=new L,c=new L;for(let l=0,u=r.length;l<u;l++){let h=r[l];if(h.POSITION!==void 0){let d=t.json.accessors[h.POSITION],f=d.min,g=d.max;if(f!==void 0&&g!==void 0){if(c.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),c.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),c.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),d.normalized){let _=oh(Ks[d.componentType]);c.multiplyScalar(_)}a.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(a)}s.boundingBox=i;let o=new Wt;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=o}function Nd(s,e,t){let n=e.attributes,i=[];function r(o,a){return t.getDependency("accessor",o).then(function(c){s.setAttribute(a,c)})}for(let o in n){let a=rh[o]||o.toLowerCase();a in s.attributes||i.push(r(n[o],a))}if(e.indices!==void 0&&!s.index){let o=t.getDependency("accessor",e.indices).then(function(a){s.setIndex(a)});i.push(o)}return We.workingColorSpace!==It&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${We.workingColorSpace}" not supported.`),Fn(s,e),H0(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?O0(s,e.targets,t):s})}var gt=s=>new on({color:s,roughness:.82,metalness:.06});function Xe(s,e,t,n,i,r,o,a){let c=new Ze(new hi(e,t,n),a);return c.position.set(i,r,o),c.castShadow=!0,c.receiveShadow=!0,s.add(c),c}function Zt(s,e,t,n,i,r,o,a,c=12){let l=new Ze(new Cs(e,t,n,c),a);return l.position.set(i,r,o),l.castShadow=!0,l.receiveShadow=!0,s.add(l),l}var Qr=class{canvas=document.createElement("canvas");ctx;texture;sprite;last="";constructor(e=1.9){this.canvas.width=384,this.canvas.height=160,this.ctx=this.canvas.getContext("2d"),this.texture=new Rs(this.canvas),this.texture.colorSpace=mt,this.sprite=new br(new bs({map:this.texture,transparent:!0,depthTest:!1,depthWrite:!1})),this.sprite.scale.set(e,e*160/384,1),this.sprite.renderOrder=12}set(e,t,n=""){let i=e+t+n;if(i===this.last)return;this.last=i;let r=this.ctx;r.clearRect(0,0,384,160),r.fillStyle="#152c36ef",r.beginPath(),r.roundRect(4,4,376,152,25),r.fill(),r.strokeStyle=t,r.lineWidth=7,r.stroke(),r.textAlign="center",r.fillStyle="white",r.font=`900 ${n?81:100}px Segoe UI`,r.fillText(e,192,n?100:117,355),n&&(r.fillStyle=t,r.font="800 25px Segoe UI",r.fillText(n,192,138,355)),this.texture.needsUpdate=!0}dispose(){this.texture.dispose(),this.sprite.material.dispose()}},sc=class{constructor(e){this.canvas=e;this.renderer=new ec({canvas:e,antialias:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6)),this.renderer.setClearColor(11388359),this.renderer.outputColorSpace=mt,this.renderer.toneMapping=ha,this.renderer.toneMappingExposure=1.25,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=na,this.scene.fog=new Mr(11388359,65,120),this.scene.add(new Br(15530495,9204564,2.65));let t=new Fi(16772555,3.2);t.position.set(-14,30,15),t.castShadow=!0,t.shadow.mapSize.set(2048,2048),Object.assign(t.shadow.camera,{left:-20,right:20,top:35,bottom:-20,near:1,far:80}),t.shadow.normalBias=.06,t.shadow.bias=-3e-4,this.scene.add(t),this.scene.add(new Hr(16777215,.3)),this.makeTerrain(),this.scene.add(this.hero);for(let c of[-1,1]){let l=new dt;l.position.set(c*.9,1.15,-.1),Xe(l,.28,.32,.55,0,0,0,gt(3166045)),Zt(l,.095,.13,.7,0,.04,-.48,gt(12884297),8).rotation.x=Math.PI/2;let u=Zt(l,.12,.12,.09,0,.04,-.79,new tt({color:6809343}),8);u.rotation.x=Math.PI/2,this.hero.add(l),this.weaponRigs.push(l)}let n=new dt;n.position.set(0,2,.15),Xe(n,.65,.42,.75,0,0,0,gt(3166045));for(let c of[-1,1]){let l=Zt(n,.14,.18,1.05,c*.23,0,-.72,gt(12884297),10);l.rotation.x=Math.PI/2;let u=Zt(n,.12,.12,.08,c*.23,0,-1.24,new tt({color:16758847}),10);u.rotation.x=Math.PI/2}this.hero.add(n),this.weaponRigs.push(n),this.heroRing=new Ze(new Nr(.75,.83,48),new tt({color:5433599,transparent:!0,opacity:.8,side:bt})),this.heroRing.rotation.x=-Math.PI/2,this.heroRing.position.y=.035,this.hero.add(this.heroRing),this.shield=new Ze(new Us(1.3,20,16),new tt({color:5562111,transparent:!0,opacity:.2,depthWrite:!1})),this.shield.position.y=.9,this.hero.add(this.shield),this.bullets=new Xt(new Lr(.045,.55,2,5).rotateX(Math.PI/2),new tt({color:16775876}),600),this.bullets.count=0,this.bullets.frustumCulled=!1,this.scene.add(this.bullets),this.bulletGlow=new Xt(new Us(.1,6,4),new tt({color:16758082,transparent:!0,opacity:.65,blending:Bs,depthWrite:!1}),100),this.bulletGlow.count=0,this.bulletGlow.frustumCulled=!1,this.scene.add(this.bulletGlow),this.hostileShots=new Xt(new Ds(1,1),new tt({color:16777215}),96),this.hostileShots.count=0,this.hostileShots.frustumCulled=!1,this.scene.add(this.hostileShots),this.hostileTrails=new Xt(new Is(.17,1.9,6).rotateX(Math.PI/2),new tt({color:16742949,transparent:!0,opacity:.65,depthWrite:!1,blending:Bs}),96),this.hostileTrails.count=0,this.hostileTrails.frustumCulled=!1,this.scene.add(this.hostileTrails),this.shadowInstances=new Xt(new Dr(.36,12).rotateX(-Math.PI/2),new tt({color:2175789,transparent:!0,opacity:.22,depthWrite:!1}),220),this.shadowInstances.frustumCulled=!1,this.scene.add(this.shadowInstances),this.particleMesh=new Xt(new Ds(.12,0),new tt({color:16777215}),350),this.particleMesh.frustumCulled=!1,this.scene.add(this.particleMesh);let i=gt(3359564),r=gt(12409656),o=gt(15841899),a=gt(1844523);for(let c of[-1,1]){Xe(this.boss,1.3,.7,1.8,c*1.1,.35,.2,a),Xe(this.boss,.8,1.5,1,c*1.1,1.3,0,i),Xe(this.boss,1,.9,1.1,c*1.1,1.6,.3,r);let l=new dt;l.position.set(c*1.9,3.1,0),this.boss.add(l),this.bossArms.push(l),Xe(l,1.2,1.2,1.25,0,0,0,r),Zt(l,.45,.45,.25,c*.65,0,0,o,10).rotation.z=Math.PI/2,Zt(l,.38,.48,1.9,0,-.3,1.05,a,10).rotation.x=Math.PI/2,Zt(l,.48,.48,.2,0,-.3,1.8,o,10).rotation.x=Math.PI/2;for(let u of[-.17,.17])for(let h of[-.17,.17])Zt(l,.09,.09,.1,u,h-.3,2.05,o,8).rotation.x=Math.PI/2}Xe(this.boss,2.65,1.85,1.5,0,2.9,0,i),Xe(this.boss,2.9,.3,1.8,0,3.8,0,r),Xe(this.boss,1.5,.9,1.3,0,4.3,.1,r),Xe(this.boss,1.4,.18,.1,0,4.35,.8,a),Xe(this.boss,1,.1,.13,0,4.35,.87,new tt({color:16767840})),this.bossCore=new Ze(new Ns(.55,1),new on({color:16756791,emissive:15093778,emissiveIntensity:1.8,roughness:.3})),this.bossCore.position.set(0,3,1),this.boss.add(this.bossCore),this.bossRing=new Ze(new Fs(.67,.12,5,12),o),this.bossRing.position.set(0,3,.95),this.boss.add(this.bossRing),this.bossBadge.sprite.position.set(0,5.25,0),this.boss.add(this.bossBadge.sprite),this.scene.add(this.boss),this.warning=new Ze(new vn(2.7,28),new tt({color:16729385,transparent:!0,opacity:.35,side:bt,depthWrite:!1})),this.warning.rotation.x=-Math.PI/2,this.warning.position.y=.08,this.scene.add(this.warning);for(let c=-2;c<=2;c++){let l=new Ze(new vn(1.1,13.7),new tt({color:15291378,transparent:!0,opacity:.25,side:bt,depthWrite:!1}));l.rotation.x=-Math.PI/2,l.position.set(c*1.025,.07,-6.75),l.rotation.z=Math.atan2(c*.75,13.5),l.visible=!1,this.scene.add(l),this.fanWarnings.push(l)}this.resizeObserver=new ResizeObserver(()=>this.resize()),this.resizeObserver.observe(e),this.resize()}renderer;scene=new Sr;camera=new Jn(-7,7,12,-12,.1,150);hero=new dt;model;mixer;run;idle;running=!1;allies;enemyInstances;groundTiles=[];views=new Map;dummy=new rt;eliteTemplate;elitePool=[];bossModel;bossJoints=[];hostileShots;hostileTrails;terrainMaterials=[];terrainLevel=-1;levelProps=[];weaponRigs=[];boss=new dt;bossArms=[];bossCore;bossRing;bossBadge=new Qr(2.5);warning;shield;heroRing;shadowInstances;fanWarnings=[];bullets;bulletGlow;particles=[];particleMesh;floating=[];age=0;shake=0;wasBoss=!1;depthScale=1;cameraWidth=5.9;cameraBossBlend=0;seed=78;resizeObserver;random(){return this.seed=this.seed*16807%2147483647,this.seed/2147483647}makeTerrain(){let e=gt(7899796),t=gt(5137001),n=gt(15258018),i=gt(12164214),r=gt(4945253),o=gt(14730647),a=gt(4941930),c=gt(3317680),l=gt(10920330);this.terrainMaterials=[e,t,n,i,r,o,a,c,l];let u=document.createElement("canvas");u.width=u.height=512;let h=u.getContext("2d");h.fillStyle="#91a2a8",h.fillRect(0,0,512,512);for(let f=0;f<15e3;f++){let g=100+this.random()*80;h.fillStyle=`rgba(${g},${g+8},${g+9},.12)`,h.fillRect(this.random()*512,this.random()*512,1+this.random()*3,1+this.random()*3)}for(let f=0;f<18;f++){let g=this.random()*512,_=this.random()*512;h.strokeStyle="#526a7425",h.lineWidth=2,h.beginPath(),h.moveTo(g,_),h.lineTo(g+25,_+8),h.lineTo(g+40,_-2),h.stroke()}let d=new Rs(u);d.colorSpace=mt,d.wrapS=d.wrapT=An,d.repeat.set(2,2),e.map=d;for(let f=0;f<12;f++){let g=new dt;Xe(g,10,.4,8,0,-.25,0,t),Xe(g,9.4,.08,7.96,0,-.01,0,e);for(let p of[-1,1]){Xe(g,.3,.26,8,p*4.85,.07,0,n),Xe(g,.055,.06,7.9,p*4.55,.055,0,c),Xe(g,14,.55,8,p*12,-.38,0,i),Xe(g,1.3,.1,8,p*5.65,-.03,0,o);for(let b=0;b<3;b++){let w=new Ze(new Ls(.6,0),l);w.position.set(p*(6.2+this.random()*3),.2,-3+this.random()*6),w.scale.set(1+this.random(),.5+this.random(),1+this.random()),w.rotation.set(0,this.random()*6,.2),w.castShadow=!0,g.add(w)}for(let b=0;b<7;b++){let w=new Ze(new Ls(.28,0),r);w.position.set(p*(5.5+this.random()*5),.12,-4+this.random()*8),w.scale.set(1,.5,1),g.add(w)}if(f%2===0){let b=new dt;b.position.set(p*5.6,0,-2),Xe(b,.8,.35,.8,0,.1,0,l),Zt(b,.14,.2,1.9,0,1.1,0,a,8),Xe(b,.9,.1,.12,p*.3,2.05,0,n);let w=new Ze(new vn(.72,1.04),new on({color:2587528,side:bt,roughness:1}));w.position.set(p*.38,1.53,.04),b.add(w),g.add(b)}if(f%3===1)for(let b=0;b<3;b++)Xe(g,.75,.45,.55,p*(7.4+b*.35),.25+b*.16,2.4-b*.4,n)}for(let p of[-3.6,3.6])for(let b=0;b<2;b++)Xe(g,.13,.013,.35,p,.04,-3+b*.2,n).rotation.y=.4;Xe(g,9.4,.014,.035,0,.045,3.95,t),this.groundTiles.push(g),this.scene.add(g);for(let p=0;p<4;p++)Xe(g,.075,.016,.8,0,.052,-3+p*2,n);let _=new dt,m=new dt;_.visible=!1,m.visible=!1,g.add(_,m),this.levelProps.push(_,m);for(let p of[-1,1]){let b=Zt(_,.34,.34,7.8,p*5.9,.35,0,gt(9133111),12);b.rotation.x=Math.PI/2;for(let C of[-2,2]){let A=new Ze(new Fs(.39,.065,5,12),a);A.position.set(p*5.9,.35,C),_.add(A),Xe(_,1.25,.13,1.2,p*6,.05,C,a)}Xe(_,.48,.03,7.7,p*5.23,.08,0,new tt({color:15702837}));let w=Xe(m,1.1,.42,1.1,p*5.8,.2,0,t),v=new Ze(new Ns(.65),new on({color:7391199,emissive:1340308,emissiveIntensity:.5,roughness:.25}));v.position.set(p*5.8,1.15,0),v.scale.y=1.8,m.add(v)}}}resize(){let e=Math.max(1,this.canvas.clientWidth),t=Math.max(1,this.canvas.clientHeight);this.renderer.setSize(e,t,!1);let n=5.9,i=n*t/e;this.camera.left=-n,this.camera.right=n,this.camera.top=i,this.camera.bottom=-i,this.camera.updateProjectionMatrix()}async load(){let e=new nc,[t,n,i,r,o]=await Promise.all([e.loadAsync("commander.glb"),e.loadAsync("troop.glb"),e.loadAsync("crawler.glb"),e.loadAsync("cinder-reaver.glb"),e.loadAsync("forge-tyrant.glb")]);this.model=t.scene,this.model.scale.setScalar(.95),this.model.rotation.y=Math.PI,this.hero.add(this.model),this.model.traverse(f=>{f.isMesh&&(f.castShadow=!0,f.receiveShadow=!0,f.material.roughness=.76,f.material.metalness=.05)});let a=new Set;for(let f of[r,o])f.scene.traverse(g=>{if(g.isMesh)for(let _ of Array.isArray(g.material)?g.material:[g.material])a.has(_)||(a.add(_),_.color.multiplyScalar(2.5),_.metalness=.16,_.roughness=.78)});this.eliteTemplate=r.scene,this.eliteTemplate.traverse(f=>{f.isMesh&&(f.castShadow=!0,f.receiveShadow=!0)});for(let f=0;f<16;f++){let g=this.eliteTemplate.clone(!0);g.visible=!1,this.elitePool.push(g),this.scene.add(g)}this.boss.clear(),this.bossModel=o.scene,this.bossModel.rotation.y=Math.PI,this.boss.add(this.bossModel),this.bossModel.traverse(f=>{f.isMesh&&(f.castShadow=!0,f.receiveShadow=!0),/^(Arm_|Barrel_|Pod_)/.test(f.name)&&this.bossJoints.push(f)}),this.mixer=new Wr(t.scene);for(let f of t.animations)f.name==="Run"&&(this.run=this.mixer.clipAction(f)),f.name==="Idle"&&(this.idle=this.mixer.clipAction(f));this.idle?.play();let c=f=>{f.scene.updateMatrixWorld(!0);let g;f.scene.traverse(p=>{p.isMesh&&!g&&(g=p)});let _=g.geometry.clone().applyMatrix4(g.matrixWorld),m=g.material.clone();return m.roughness=.85,m.metalness=.05,[_,m]},[l,u]=c(n),[h,d]=c(i);d.color.set(16742229),this.allies=new Xt(l,u,80),this.allies.castShadow=!0,this.allies.frustumCulled=!1,this.scene.add(this.allies),this.enemyInstances=new Xt(h,d,200),this.enemyInstances.castShadow=!0,this.enemyInstances.frustumCulled=!1,this.scene.add(this.enemyInstances)}reset(){for(let e of this.views.values())this.disposeView(e);this.views.clear(),this.particles=[];for(let e of this.floating)this.scene.remove(e.badge.sprite),e.badge.dispose();this.floating=[],this.shake=0,this.wasBoss=!1,this.cameraBossBlend=0,this.cameraWidth=5.9,this.depthScale=1}set(e,t,n,i,r,o=1,a=0){this.dummy.position.set(n,i,r),this.dummy.rotation.set(0,a,0),this.dummy.scale.setScalar(o),this.dummy.updateMatrix(),e.setMatrixAt(t,this.dummy.matrix)}createView(e){let t=new dt,n=new Qr(e.kind==="gate"?2.8:e.kind==="crate"?1.65:1.25),i=gt(15290168),r=gt(16496974),o=gt(2308418),a=gt(16773072),c;if(e.kind==="gate"){let h=e.value>=0,d=gt(h?1944514:15290168);for(let _ of[-1,1])Xe(t,.18,2.1,.18,_*1.55,1.05,0,o),Zt(t,.16,.24,.28,_*1.55,.14,0,r,8),Xe(t,.08,1.95,.05,_*1.55,1.1,.12,d);let f=new Ze(new vn(3,1.65),new tt({color:h?2475500:16082242,transparent:!0,opacity:.24,side:bt,depthWrite:!1}));f.position.y=1.1,t.add(f),Xe(t,3.3,.12,.2,0,2.12,0,d),n.sprite.position.y=1.35;let g=new Ze(new vn(3,.32),new tt({color:h?4579327:16741718,transparent:!0,opacity:.65,side:bt}));g.rotation.x=-Math.PI/2,g.position.y=.045,t.add(g),t.userData.gateTint=[d,f.material,g.material]}else if(e.kind==="crate"){Xe(t,1.35,1.12,1.15,0,.6,0,r);for(let h of[-.55,.55])Xe(t,.12,1.2,1.25,h,.6,0,o);for(let h of[-.52,.52])Xe(t,1.4,.1,.13,0,1.05,h,a);c=new dt,c.position.y=1.75,t.add(c),Xe(c,.7,.25,.35,0,0,0,o);for(let h of[-.18,.18])Zt(c,.08,.08,.9,h,.06,-.44,o,8).rotation.x=Math.PI/2;Xe(c,.18,.28,.22,.05,-.22,0,a),n.sprite.position.set(0,2.65,0)}else if(e.kind==="hazard"){c=new dt,c.position.y=.7,t.add(c);let h=Zt(c,.56,.56,2.3,0,0,0,i,16);h.rotation.z=Math.PI/2;for(let d of[-1.12,1.12]){let f=Zt(c,.63,.63,.17,d,0,0,a,16);f.rotation.z=Math.PI/2}for(let d=0;d<4;d++)for(let f=0;f<7;f++){let g=f/7*Math.PI*2,_=new Ze(new Is(.16,.37,4),a);_.position.set(-.86+d*.57,Math.cos(g)*.61,Math.sin(g)*.61),_.rotation.x=g,c.add(_)}n.sprite.position.y=1.9}else n.sprite.position.y=1.65;let l=Xe(t,e.kind==="gate"?2.4:1.2,.07,.05,0,e.kind==="crate"?1.31:.13,.6,new tt({color:e.kind==="crate"?16768342:16735049}));t.add(n.sprite),this.scene.add(t);let u={group:t,badge:n,bar:l,kind:e.kind,rotor:c};return this.views.set(e.id,u),u}disposeView(e){this.scene.remove(e.group),e.badge.dispose(),e.group.traverse(t=>{if(t.isMesh){t.geometry.dispose();for(let n of Array.isArray(t.material)?t.material:[t.material])n.dispose()}})}trigger(e){let t=-e.z*this.depthScale;e.kind==="hit"&&this.burst(e.x,.6,t,4,16766074,.7),e.kind==="kill"&&(this.burst(e.x,.55,t,26,16745022,1.8),this.shake=Math.max(this.shake,.09)),(e.kind==="gate"||e.kind==="recruit")&&(this.burst(e.x,.3,t,32,6939903,2),e.value!==0&&this.float(e.value>0?"+"+e.value:String(e.value),e.x,t,"#73eaff")),e.kind==="damage"&&(this.burst(e.x,.6,t,20,16340796,1.4),this.shake=.19,this.float("\u2212"+Math.abs(e.value),e.x,0,"#ff8469")),e.kind==="relic"&&(this.burst(e.x,.8,0,45,6875647,3.5),this.shake=.05),e.kind==="bossShot"&&(this.burst(e.x,e.z>16?3.2:1.2,t,22,16750912,2),this.shake=.08),e.kind==="win"&&(this.burst(0,2,-17,100,16764248,4),this.shake=.3)}burst(e,t,n,i,r,o){for(let a=0;a<i&&this.particles.length<350;a++){let c=.25+Math.random()*.45;this.particles.push({p:new L(e,t,n),v:new L((Math.random()-.5)*o,Math.random()*o+1,(Math.random()-.5)*o),life:c,max:c,color:new we(r),size:.5+Math.random()})}}float(e,t,n,i){let r=new Qr(1.5);r.set(e,i),this.scene.add(r.sprite),this.floating.push({badge:r,life:.8,x:t,y:2,z:n})}update(e,t,n){let i=n==="play",r=n==="intro",o=n==="paused"?0:t;if(this.age+=o,e.level!==this.terrainLevel){this.terrainLevel=e.level;let S=[[7899796,5137001,15258018,12164214,4945253,14730647,4941930,3317680,10920330],[7567226,4212812,13480833,6708306,5003089,10254165,5068121,14192962,9010795],[8231336,3755873,12768731,5468026,4217703,7837861,4611699,6342896,7967393]][e.level]??[];this.terrainMaterials.forEach((R,x)=>R.color.set(S[x])),this.levelProps.forEach((R,x)=>R.visible=e.level===(x%2===0?1:2))}i!==this.running&&(this.run?.stop(),this.idle?.stop(),(i?this.run:this.idle)?.reset().play(),this.running=i),this.mixer?.update(o*(i?1.5:1)),e.phase==="boss"&&(this.wasBoss=!0);let a=this.wasBoss&&(e.phase==="boss"||e.phase==="won"||e.phase==="lost");this.depthScale=a?.75:1,this.cameraBossBlend+=((a?1:0)-this.cameraBossBlend)*(1-Math.exp(-o*3)),this.cameraWidth=5.9+.9*this.cameraBossBlend;let c=this.cameraWidth*this.canvas.clientHeight/this.canvas.clientWidth,l=-(c*(.55+.23*this.cameraBossBlend));this.camera.left=-this.cameraWidth,this.camera.right=this.cameraWidth,this.camera.top=c,this.camera.bottom=-c,this.camera.updateProjectionMatrix(),this.camera.position.set(0,28-6*this.cameraBossBlend,l+24+4*this.cameraBossBlend),this.camera.lookAt(0,0,l),this.shake>0&&i&&(this.camera.position.x+=(Math.random()-.5)*this.shake,this.camera.position.y+=(Math.random()-.5)*this.shake,this.shake=Math.max(0,this.shake-t*.6));let u=r?this.age*.8:e.time*3.4;for(let S=0;S<this.groundTiles.length;S++)this.groundTiles[S].position.z=12-S*8+u%8;this.hero.position.set(r?0:e.x,0,r?-5:0),this.model&&(this.model.rotation.y=r?Math.PI*.85:Math.PI,this.model.scale.setScalar(r?1.5:1.25),this.model.rotation.z=i?Math.sin(this.age*13)*.012:0),this.weaponRigs.forEach((S,R)=>S.visible=!r&&e.weapon>=R+2),this.shield.visible=e.ability>0&&!r&&e.relic===0,this.shield.scale.setScalar(1+.015*Math.sin(this.age*12)),this.heroRing.visible=!r,this.heroRing.scale.setScalar(e.ability>0&&e.relic===1?1+this.age*2%1*3:1),this.heroRing.material.color.set(e.ability>0?e.relic===1?12752127:e.relic===2?16758333:5433599:5433599);let h=0,d=0,f=0,g=0,_=r?0:Math.min(80,Math.max(0,e.army-1));if(this.allies){for(let S=0;S<_;S++){let R=.3*Math.sqrt(S+.5),x=S*2.39996323,M=.3*Math.sqrt(_),P=Math.max(.5,Math.min(1,(4.4-Math.abs(e.x))/Math.max(.5,M))),U=e.x+Math.sin(x)*R*P,B=.45+M+Math.cos(x)*R;this.set(this.allies,h++,U,i?Math.abs(Math.sin(this.age*13+S))*.055:0,B,.55,Math.PI),this.set(this.shadowInstances,f++,U,.04,B,.85)}this.allies.count=h,this.allies.instanceMatrix.needsUpdate=!0}let m=new Set,p=e.targets.filter(S=>S.z<=36&&S.z>=-4).sort((S,R)=>S.z-R.z),b=p.filter(S=>S.kind==="enemy"&&S.variant===0).length>100?1:2;for(let S of p){if(S.kind==="enemy"&&S.variant===0){for(let x=0;x<b&&d<200;x++){let M=S.x+(x-(b-1)/2)*.36,P=-S.z*this.depthScale;this.enemyInstances&&this.set(this.enemyInstances,d++,M,.025*Math.sin(this.age*18+x),P,S.hit>0?.69:.66,0),f<220&&this.set(this.shadowInstances,f++,M,.04,P,.85)}continue}m.add(S.id);let R=this.views.get(S.id)??this.createView(S);if(R.group.visible=!r,R.group.position.set(S.x,0,-S.z*this.depthScale),R.group.scale.setScalar(S.hit>0?1.04:1),S.kind==="gate"&&(R.group.scale.x*=(S.size+.1)/1.55),S.kind==="gate"){R.badge.set(S.op===1?"\xD7"+S.value:(S.value>=0?"+":"")+S.value,S.value>=0?"#54ddff":"#ff7755",S.op===1?"MULTIPLY":S.value<0?"SHOOT TO FLIP":"RECRUIT"),R.bar.visible=!1;for(let x of R.group.userData.gateTint??[])x.color.set(S.value>=0?1944514:15290168)}else if(S.kind==="crate")R.badge.set(String(Math.ceil(S.hp)),"#ffc851","WEAPON"),R.rotor&&(R.rotor.rotation.y=this.age*1.1),R.bar.scale.x=Math.max(.02,S.hp/S.maxHp);else if(S.kind==="hazard")R.badge.set("\u2212"+Math.abs(S.value),"#ff795b"),R.bar.visible=!1,R.rotor&&(R.rotor.rotation.x=this.age*4,R.rotor.scale.x=S.size*2/2.3);else if(R.badge.set(String(Math.ceil(S.hp)),"#ff8064",S.variant===2?"GUNNER":S.variant===1?"REAVER":""),R.bar.scale.x=Math.max(.02,S.hp/S.maxHp),R.badge.sprite.visible=S.variant>0,R.badge.sprite.position.y=S.variant>0?2.7:1.65,R.bar.visible=S.variant>0,S.variant>0&&g<this.elitePool.length){let x=this.elitePool[g++];x.visible=!r,x.position.set(S.x,.03,-S.z*this.depthScale),x.rotation.set(0,Math.PI,Math.sin(this.age*5+S.id)*.025),x.scale.setScalar(S.variant===1?1.02:.9),x.traverse(M=>{(M.name==="Arm_L"||M.name==="Arm_R")&&(M.rotation.x=Math.sin(this.age*5+S.id)*.09),(M.name==="Leg_L"||M.name==="Leg_R")&&(M.rotation.x=Math.sin(this.age*7+S.id+(M.name==="Leg_R"?Math.PI:0))*.1)})}else for(let P=0;P<2&&d<200;P++){let U=S.x+(P%2-.5)*.36,B=-S.z*this.depthScale-Math.floor(P/2)*.4;this.enemyInstances&&this.set(this.enemyInstances,d++,U,.025*Math.sin(this.age*18+P),B,.66,0),f<220&&this.set(this.shadowInstances,f++,U,.04,B,.85)}}for(let[S,R]of this.views)m.has(S)||(this.disposeView(R),this.views.delete(S));for(let S=g;S<this.elitePool.length;S++)this.elitePool[S].visible=!1;this.enemyInstances&&(this.enemyInstances.count=r?0:d,this.enemyInstances.instanceMatrix.needsUpdate=!0),this.shadowInstances.count=f,this.shadowInstances.instanceMatrix.needsUpdate=!0,this.boss.visible=a||r,this.boss.position.set(0,0,r?-12:-18*this.depthScale),this.boss.rotation.z=e.phase==="won"?.16:Math.sin(this.age*2)*.009,this.boss.scale.setScalar(r?1.1:1.3),this.bossBadge.set(Math.ceil(e.bossHp).toString(),"#ff8263","FORGE COLOSSUS"),this.bossBadge.sprite.visible=!1,this.bossCore.rotation.y=this.age;for(let S=0;S<this.bossArms.length;S++)this.bossArms[S].rotation.x=e.bossAttack>0?-.2*Math.sin(e.bossAttack*Math.PI):Math.sin(this.age*2+S)*.035;for(let S of this.bossJoints)S.name.startsWith("Barrel")?S.rotation.z=-this.age*(e.bossAttack>0?10:2):S.rotation.x=e.bossAttack>0?-.12*Math.sin(e.bossAttack*Math.PI):Math.sin(this.age*2)*.02;this.warning.visible=e.phase==="boss"&&e.bossAttack>0&&e.level!==1,this.warning.position.set(e.bossLane,.065,-11),this.warning.material.opacity=.13+e.bossAttack*.25+Math.sin(this.age*25)*.05;for(let S of this.fanWarnings)S.visible=e.phase==="boss"&&e.bossAttack>0&&e.level===1,S.material.opacity=.12+e.bossAttack*.22+Math.sin(this.age*18)*.04;let w=0;for(let S of e.shots){if(w>=600)break;this.set(this.bullets,w++,S.x,.75,-S.z*this.depthScale,S.heavy?1.6:1)}this.bullets.count=r||e.phase==="won"||e.phase==="lost"?0:w,this.bullets.instanceMatrix.needsUpdate=!0,this.bullets.material.color.set(e.weapon>=4?16760144:e.weapon===3?8386047:16775876);let v=0;for(let S of e.enemyShots){if(v>=96)break;let R=.85+(a?2.35*Math.max(0,Math.min(1,S.z/18)):0);this.set(this.hostileShots,v,S.x,R,-S.z*this.depthScale,S.radius),this.hostileShots.setColorAt(v,new we(S.kind==="orb"?15689215:S.kind==="rocket"?16737843:16764998));let x=Math.atan2(S.dx,-S.dz);this.set(this.hostileTrails,v,S.x-S.dx*.04,R,-(S.z-S.dz*.04)*this.depthScale,S.kind==="orb"?.65:1,x),v++}this.hostileShots.count=this.hostileTrails.count=r?0:v,this.hostileShots.instanceMatrix.needsUpdate=!0,this.hostileTrails.instanceMatrix.needsUpdate=!0,this.hostileShots.instanceColor&&(this.hostileShots.instanceColor.needsUpdate=!0);let C=0;if(i&&Math.sin(this.age*30)>.15){let S=Math.min(12,Math.ceil(e.army/3));for(let R=0;R<S;R++){let x=Math.min(S,6),M=e.x+(R%x-(x-1)/2)*.4;this.set(this.bulletGlow,C++,M,.75,-.65,1+Math.random()*.3)}}this.bulletGlow.count=C,this.bulletGlow.instanceMatrix.needsUpdate=!0;let A=0;this.particles=this.particles.filter(S=>S.life>0);for(let S of this.particles)S.life-=o,S.v.y-=o*5,S.p.addScaledVector(S.v,o),this.set(this.particleMesh,A,S.p.x,Math.max(.07,S.p.y),S.p.z,S.size*Math.max(.01,S.life/S.max)),this.particleMesh.setColorAt(A++,S.color);this.particleMesh.count=A,this.particleMesh.instanceMatrix.needsUpdate=!0,this.particleMesh.instanceColor&&(this.particleMesh.instanceColor.needsUpdate=!0);for(let S=this.floating.length-1;S>=0;S--){let R=this.floating[S];R.life-=o,R.y+=o*2.3,R.badge.sprite.position.set(R.x,R.y,R.z),R.badge.sprite.material.opacity=Math.min(1,R.life*3),R.life<=0&&(this.scene.remove(R.badge.sprite),R.badge.dispose(),this.floating.splice(S,1))}this.renderer.render(this.scene,this.camera)}};var se=s=>{let e=document.getElementById(s);if(!e)throw new Error(`Missing game control: ${s}`);return e},hn=se("world"),ni=new oo,Ki,no=!1,eo=!0,Kt=!1,$s=!1,Yi=0,Pt=!1,Zi=0,lh=8,hh=1,to=performance.now(),Bn=null,Od=0,Bd=0,gi=!0,ln,Fd=0,uh=-1,dh,qi=new Set,zd=["SHIELD","EMP","OVERDRIVE"],G0=["\u25C8","\u03DF","\xBB"],W0=["Earn charge in combat. Shield blocks a burst of damage.","EMP slows incoming attacks and delivers a disruption pulse.","Earn charge in combat. Overdrive boosts firing speed."],fh=["PULSE","TWIN","ARC","SIEGE"],X0=["Relic Causeway","Roller Foundry","Citadel Breach"],q0=["Read. Recruit. Overcome. Pick gates and grow your legion.","Roll. Dodge. Adapt. Moving dangers test your timing.","Aim. Upgrade. Breach. Break through heavier defenses."],Y0=["GATES & GROWTH","MOVING DANGERS","HEAVY DEFENSES"],Ft={cleared:[!1,!1,!1],best:[0,0,0],gateHint:!1,lastLevel:0};try{let s=JSON.parse(localStorage.getItem("mechalord-iron-front-progress-v1")||"null");if(s?.schema===1){for(let e=0;e<3;++e){Ft.cleared[e]=s.cleared?.[e]===!0;let t=s.best?.[e];Ft.best[e]=Number.isFinite(t)?Math.max(0,Math.min(1e6,Math.round(t))):0}Ft.gateHint=s.gateHint===!0,Ft.lastLevel=Number.isInteger(s.lastLevel)?Math.max(0,Math.min(2,s.lastLevel)):0}}catch{}var _i=Ft.lastLevel,rc=new Set,oc=[];function ph(){try{localStorage.setItem("mechalord-iron-front-progress-v1",JSON.stringify({schema:1,...Ft}))}catch{}}function ac(){document.querySelectorAll("[data-level]").forEach(s=>{let e=Number(s.dataset.level);s.setAttribute("aria-pressed",String(e===_i)),s.classList.toggle("cleared",Ft.cleared[e]),se(`level-status-${e}`).textContent=Ft.cleared[e]?`CLEARED \xB7 BEST ${Ft.best[e]}`:Y0[e]}),se("level-challenge").textContent=q0[_i]}function cc(){ac(),no&&(ni.start(Yi,_i),ni.pause(!0),Ki.reset(),Zi=0)}var kd=s=>Math.max(-3,Math.min(3,s));function On(s,e=.08,t="triangle",n=.025){if(!gi||!ln||ln.state!=="running")return;let i=ln.createOscillator(),r=ln.createGain();i.type=t,i.frequency.setValueAtTime(s,ln.currentTime),i.frequency.exponentialRampToValueAtTime(Math.max(45,s*.58),ln.currentTime+e),r.gain.setValueAtTime(n,ln.currentTime),r.gain.exponentialRampToValueAtTime(.001,ln.currentTime+e),i.connect(r).connect(ln.destination),i.start(),i.stop(ln.currentTime+e),i.onended=()=>{i.disconnect(),r.disconnect()}}function Vd(){try{ln??=new AudioContext,ln.resume().catch(()=>{})}catch{gi=!1}}function mh(s,e){s.classList.remove(e),s.offsetWidth,s.classList.add(e)}function ch(s){se("gate-flash").textContent=s,mh(se("gate-flash"),"show-gate")}function Hd(s,e=1e3){clearTimeout(dh),se("toast").textContent=s,se("toast").classList.add("show-toast"),dh=setTimeout(()=>se("toast").classList.remove("show-toast"),e)}function Js(){qi.clear(),Bn!==null&&hn.hasPointerCapture(Bn)&&hn.releasePointerCapture(Bn),Bn=null}function io(){if(!(!no||$s)){Js(),Vd(),ni.start(Yi,_i),ni.pause(!1),Ki.reset(),Ft.lastLevel=_i,ph(),rc.clear(),oc.length=0,eo=!1,Pt=!0,Kt=!1,Zi=0,lh=8,hh=1,uh=-1,to=performance.now();for(let s of["intro","result","paused","boss-hud","danger"])se(s).hidden=!0;se("hud").hidden=!1,se("abilities").hidden=!1,se("error").hidden=!0,se("gate-flash").classList.remove("show-gate"),se("damage-flash").classList.remove("show-damage"),se("toast").classList.remove("show-toast"),clearTimeout(dh),document.body.classList.remove("boss-warning"),se("ability-name").textContent=zd[Yi],se("ability-symbol").textContent=G0[Yi],On(410,.18,"triangle",.04)}}function $i(s=!Kt){Pt&&(Kt=s,ni.pause(s),Js(),se("paused").hidden=!Kt)}function Gd(){Pt&&!Kt&&!$s&&ni.activate()&&(On(660,.22,"sine",.04),Hd(`${zd[Yi]} ACTIVATED`,900))}function Wd(){Js(),eo=!0,Pt=!1,Kt=!1,cc();for(let s of["hud","abilities","result","paused","boss-hud","danger"])se(s).hidden=!0;se("intro").hidden=!1,se("toast").classList.remove("show-toast"),se("gate-flash").classList.remove("show-gate"),document.body.classList.remove("boss-warning")}function Z0(s){Pt=!1,Kt=!1,Js();for(let i of["hud","abilities","paused","boss-hud","danger"])se(i).hidden=!0;document.body.classList.remove("boss-warning");let e=s.phase==="won",t=Math.max(0,Math.min(2,s.level));e&&(Ft.cleared[t]=!0,Ft.best[t]=Math.max(Ft.best[t],Math.round(s.score)),ph(),ac());let n=e&&t<2;se("next-level").hidden=!n,se("result").classList.toggle("has-next",n),se("result-eyebrow").textContent=`${s.levelName||X0[t]} ${e?"CLEARED":"ASSAULT"}`,se("result-title").textContent=e?"VICTORY!":"REGROUP",se("result-copy").textContent=e?`Best score ${Ft.best[t]}. ${n?"The next front is ready.":"All three fronts are ready to replay."}`:"Shoot gates to improve your choice. Break crates for weapon XP.",se("result-kills").textContent=String(s.kills),se("result-score").textContent=String(s.score),se("result").hidden=!1,On(e?640:110,.35,"triangle",.045)}function K0(s){Pt&&!Kt&&s.time-uh>.09&&s.shots.some(i=>i.z<1)&&(On(s.weapon>=3?140:220,.035,"square",.006),uh=s.time);let e=0,t=!1,n=!1;for(let i of s.effects)if(!rc.has(i.id))if(rc.add(i.id),oc.push(i.id),oc.length>512&&rc.delete(oc.shift()),Ki.trigger(i),i.kind==="recruit"&&i.value>0)e+=i.value;else if(i.kind==="gate")t=!0;else if(i.kind==="damage")n=!0;else if(i.kind==="hit"||i.kind==="kill"){let r=performance.now();r-Fd>70&&(On(i.kind==="kill"?160:210,.045,"triangle",.012),Fd=r)}else i.kind==="bossShot"&&On(75,.18,"sawtooth",.025);n&&(mh(se("damage-flash"),"show-damage"),On(90,.14,"sawtooth",.025)),s.weapon>hh?(ch(`${fh[Math.min(3,s.weapon-1)]} CANNON UNLOCKED`),On(950,.25,"triangle",.04),hh=s.weapon):e>0?(ch(`+${e} TROOPS`),On(720,.12)):t&&(ch("GATE CLEARED!"),On(840,.14)),!Ft.gateHint&&Pt&&!Kt&&s.targets.filter(i=>i.kind==="gate"&&i.z>0&&i.z<26).length>=2&&(Hd("Blue = gain. Red = danger. Shoot to improve gates.",2700),Ft.gateHint=!0,ph())}function $0(s){let e=s.phase==="boss",t=Math.max(0,Math.ceil(s.duration-s.time));se("phase-label").textContent=e?"BOSS FIGHT":s.levelName.toUpperCase(),se("objective").textContent=e?"BREAK THE TYRANT":`${t}s TO BOSS`;let n=e&&s.bossMax>0?1-s.bossHp/s.bossMax:s.time/Math.max(1,s.duration);se("route-fill").style.width=`${Math.max(0,Math.min(1,n))*100}%`,se("army-count").textContent=String(s.army),se("kills").textContent=String(s.kills),se("weapon-level").textContent=String(s.weapon),se("weapon-name").textContent=fh[Math.max(0,Math.min(3,s.weapon-1))];let i=s.weapon>=4||s.weaponNeed<=0;se("weapon-xp-fill").style.width=`${i?100:Math.max(0,Math.min(100,s.weaponXP/s.weaponNeed*100))}%`,se("weapon-xp").textContent=i?"MAX ARSENAL":`${Math.floor(s.weaponXP)}/${s.weaponNeed} XP \u2192 ${fh[Math.min(3,s.weapon)]}`;let r;for(let h of s.targets)h.kind==="crate"&&h.z>=0&&h.z<24&&(!r||h.z<r.z)&&(r=h);se("crate-progress").hidden=!r,r&&(se("crate-hp").textContent=`${Math.max(0,Math.ceil(r.hp))}/${Math.ceil(r.maxHp)} HP`,se("crate-fill").style.width=`${Math.max(0,Math.min(100,r.hp/Math.max(1,r.maxHp)*100))}%`),lh!==s.army&&(mh(se("army-count").parentElement,"pop"),lh=s.army),se("boss-hud").hidden=!e;let o=s.bossMax>0?Math.max(0,Math.round(100*s.bossHp/s.bossMax)):0;se("boss-fill").style.width=`${o}%`,se("boss-health").textContent=`${o}%`;let a=!e&&t<=6&&t>0,c=e&&s.enemyShots.some(h=>h.z>-.5&&h.z<10),l=e&&(s.bossAttack>0||c);se("danger").hidden=!(a||l),se("danger-text").textContent=l?s.bossAttack>0?s.level===1?"FIND A GAP BETWEEN ORBS!":"DODGE THE RED LANE!":"DODGE INCOMING FIRE!":`BOSS INCOMING \xB7 ${t}s`,se("danger").classList.toggle("danger-live",l),document.body.classList.toggle("boss-warning",e);let u=se("ability");u.disabled=Kt||s.energy<100||s.ability>0,u.classList.toggle("ready",!u.disabled),se("energy-fill").style.width=`${Math.max(0,Math.min(100,s.energy))}%`,se("ability-caption").textContent=s.ability>0?`ACTIVE \xB7 ${s.ability.toFixed(1)}s`:s.energy>=100?"READY \xB7 TAP / SPACE":`CHARGING ${Math.floor(s.energy)}%`}document.querySelectorAll("[data-relic]").forEach(s=>s.addEventListener("click",()=>{Yi=Number(s.dataset.relic),document.querySelectorAll("[data-relic]").forEach(e=>e.setAttribute("aria-pressed",String(e===s))),se("relic-description").textContent=W0[Yi],cc()}));document.querySelectorAll("[data-level]").forEach(s=>s.addEventListener("click",()=>{_i=Math.max(0,Math.min(2,Number(s.dataset.level))),cc()}));ac();se("start").addEventListener("click",io);se("retry").addEventListener("click",io);se("pause-retry").addEventListener("click",io);se("back").addEventListener("click",Wd);se("next-level").addEventListener("click",()=>{_i=Math.min(2,_i+1),ac(),io()});se("pause-levels").addEventListener("click",Wd);se("pause").addEventListener("click",()=>$i());se("resume").addEventListener("click",()=>$i(!1));se("ability").addEventListener("click",Gd);se("sound").addEventListener("click",()=>{gi=!gi,gi&&Vd(),se("sound").textContent=gi?"SOUND ON":"SOUND OFF",se("sound").setAttribute("aria-pressed",String(gi)),se("sound").setAttribute("aria-label",gi?"Mute sound":"Enable sound")});hn.addEventListener("pointerdown",s=>{!Pt||Kt||$s||Bn!==null||(Bn=s.pointerId,Od=s.clientX,Bd=Zi,hn.setPointerCapture(Bn))});hn.addEventListener("pointermove",s=>{Bn!==s.pointerId||!Pt||Kt||(Zi=kd(Bd+(s.clientX-Od)*6/Math.max(1,hn.getBoundingClientRect().width)))});var gh=s=>{Bn===s.pointerId&&(Bn=null)};hn.addEventListener("pointerup",gh);hn.addEventListener("pointercancel",gh);hn.addEventListener("lostpointercapture",gh);window.addEventListener("keydown",s=>{let e=s.key.toLowerCase();Pt&&["arrowleft","arrowright"," ","escape"].includes(e)&&s.preventDefault(),!s.repeat&&(qi.add(e),e===" "?Gd():e==="escape"?$i():e==="r"&&no&&!eo&&io())});window.addEventListener("keyup",s=>qi.delete(s.key.toLowerCase()));window.addEventListener("blur",()=>{Js(),Pt&&$i(!0)});document.addEventListener("visibilitychange",()=>{document.hidden&&(Js(),Pt&&$i(!0))});hn.addEventListener("webglcontextlost",s=>{s.preventDefault(),$s=!0,Pt&&$i(!0),se("error").hidden=!1,se("error").textContent="Graphics interrupted. Your run is paused while the battlefield recovers."});hn.addEventListener("webglcontextrestored",()=>{$s=!1,Ki.reset(),se("error").hidden=!0,to=performance.now(),Pt&&$i(!0)});function Xd(s){let e=Math.max(0,Math.min(.1,(s-to)/1e3));if(to=s,no&&!$s){if(Pt&&!Kt){let n=qi.has("arrowleft")||qi.has("a"),i=qi.has("arrowright")||qi.has("d");(n||i)&&(Zi=kd(Zi+(Number(i)-Number(n))*e*5.4)),ni.step(e,Zi)}let t=ni.snapshot();eo||K0(t),Pt&&($0(t),(t.phase==="won"||t.phase==="lost")&&Z0(t)),Ki.update(t,e,eo?"intro":Kt?"paused":Pt?"play":"result")}requestAnimationFrame(Xd)}async function J0(){try{Ki=new sc(hn),await Promise.all([ni.load(),Ki.load()]),no=!0,cc(),se("start").disabled=!1,se("start").textContent="PLAY",se("loading").textContent="All relics free \xB7 instant retries",to=performance.now(),requestAnimationFrame(Xd)}catch(s){console.error(s),se("error").hidden=!1,se("error").textContent=`Battlefield could not load. ${s instanceof Error?s.message:String(s)} Refresh to retry.`,se("loading").textContent="Loading stopped."}}J0();})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
//# sourceMappingURL=game.js.map
