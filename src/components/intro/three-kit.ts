import * as THREE from 'three';

// Small helpers shared by the 3D intros: quick materials, primitives, canvas-drawn textures and a
// texture that looks like the homepage hero (used where the camera hands over to the real page).
export type IntroScene={render:(p:number,time:number,sinceReady:number)=>void;resize:()=>void;dispose:()=>void};

export const ease=(x:number)=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
export const clamp01=(x:number)=>Math.max(0,Math.min(1,x));
export const span=(p:number,a:number,b:number)=>clamp01((p-a)/(b-a));

export function std(color:string,o:THREE.MeshStandardMaterialParameters={}){return new THREE.MeshStandardMaterial({color,roughness:.75,metalness:0,...o})}
export function glow(color:string){return new THREE.MeshBasicMaterial({color,toneMapped:false})}

export function mesh(geo:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0,parent?:THREE.Object3D){
  const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent?.add(m);return m;
}
export const box=(w:number,h:number,d:number,mat:THREE.Material,x=0,y=0,z=0,parent?:THREE.Object3D)=>mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);
export const cyl=(rt:number,rb:number,h:number,mat:THREE.Material,x=0,y=0,z=0,parent?:THREE.Object3D,seg=24)=>mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat,x,y,z,parent);

// A thin rod between two points, for boom arms, stands and tripod legs.
export function rod(a:THREE.Vector3,b:THREE.Vector3,r:number,mat:THREE.Material,parent:THREE.Object3D){
  const len=a.distanceTo(b);const m=cyl(r,r,len,mat,0,0,0,parent,10);
  m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());return m;
}

export function canvasTexture(w:number,h:number,draw:(c:CanvasRenderingContext2D,w:number,h:number)=>void){
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d')!;draw(ctx,w,h);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;return tex;
}

export const sans='"Bricolage Grotesque Variable", sans-serif';
export const hand='"Oooh Baby", cursive';
export async function fontsReady(){
  try{await Promise.all([document.fonts.load(`800 120px ${sans}`),document.fonts.load(`400 80px ${hand}`)])}catch{}
}

// A miniature of the homepage's first screen, drawn on a canvas.
export function heroTexture(w=1600,h=1000){
  return canvasTexture(w,h,(c)=>{
    c.fillStyle='#fff';c.fillRect(0,0,w,h);
    const u=w/1600;
    c.fillStyle='#000047';c.font=`800 ${26*u}px ${sans}`;c.fillText('RAYGAN.',70*u,74*u);
    c.font=`500 ${17*u}px ${sans}`;c.fillStyle='#444';['About','Speaking','Consulting'].forEach((t,i)=>c.fillText(t,(1080+i*120)*u,72*u));
    c.fillStyle='#000047';c.font=`700 ${13*u}px ${sans}`;c.fillText('I DO ALOT OF THINGS',70*u,200*u);
    c.fillStyle='#111';c.font=`600 ${92*u}px ${sans}`;
    ['I’m Reagan Marfo, a creative','entrepreneur building products,','media, stories and communities.'].forEach((t,i)=>c.fillText(t,64*u,(330+i*104)*u));
    c.fillStyle='#ad93ff';c.fillRect(1035*u,350*u,470*u,6*u);c.fillRect(64*u,454*u,560*u,6*u);
    c.fillStyle='#555';c.font=`400 ${46*u}px ${hand}`;c.fillText('Created to Create.',70*u,690*u);
    c.fillStyle='#d8d8d4';c.fillRect(64*u,760*u,w-128*u,2*u);
  });
}

export function makeRenderer(canvas:HTMLCanvasElement,shadows:boolean){
  const r=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  r.setPixelRatio(Math.min(devicePixelRatio,1.75));r.setSize(innerWidth,innerHeight,false);
  r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.NeutralToneMapping;
  r.shadowMap.enabled=shadows;r.shadowMap.type=THREE.PCFSoftShadowMap;return r;
}

// Distance at which a w×h rectangle just covers the whole viewport for this camera.
export function coverDistance(cam:THREE.PerspectiveCamera,w:number,h:number){
  const t=Math.tan(THREE.MathUtils.degToRad(cam.fov/2));
  return Math.min((h/2)/t,(w/2)/(t*cam.aspect))*.94;
}

export function disposeAll(scene:THREE.Scene,renderer:THREE.WebGLRenderer){
  scene.traverse(o=>{const m=o as THREE.Mesh;m.geometry?.dispose();const mats=Array.isArray(m.material)?m.material:m.material?[m.material]:[];mats.forEach(x=>{Object.values(x).forEach(v=>{if(v instanceof THREE.Texture)v.dispose()});x.dispose()})});
  renderer.dispose();
}
