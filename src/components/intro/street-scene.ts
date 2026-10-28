import * as THREE from 'three';
import {box,canvasTexture,clamp01,cyl,disposeAll,ease,fontsReady,glow,hand,makeRenderer,mesh,sans,span,std,type IntroScene} from './three-kit';

// "The Walk In": the support page's traveller on a 3D street. Scrolling walks him along the
// pavement (his stride follows the scroll, so he stops when you stop) past houses, trees and
// traffic to the RAYGAN studio at the end of the road. The camera then pushes through its lit
// doorway into a white room the same colour as the homepage, which takes over from there.
const palette=[['#e3d3b5','#8a6f63'],['#c3d0d9','#5f6f86'],['#d8ccc4','#8b6d68'],['#cfdac6','#6c7d64'],['#e2d8ec','#7a6c93']];
const END=26,START=-4,WALK_END=.62;

function house(x:number,i:number,parent:THREE.Object3D){
  const [wallC,roofC]=palette[i%palette.length];const w=3+(i%2)*.4,h=2.3+(i%3)*.3,d=3;
  const g=new THREE.Group();g.position.set(x,0,-1-d/2);parent.add(g);
  box(w,h,d,std(wallC,{roughness:.9}),0,h/2,0,g);
  const roof=new THREE.Shape();roof.moveTo(-w/2-.2,0);roof.lineTo(0,1.1+(i%2)*.2);roof.lineTo(w/2+.2,0);roof.lineTo(-w/2-.2,0);
  const rg=new THREE.ExtrudeGeometry(roof,{depth:d+.3,bevelEnabled:false});rg.translate(0,0,-(d+.3)/2);
  mesh(rg,std(roofC,{roughness:.8,flatShading:true}),0,h,0,g);
  const front=d/2+.01;
  box(.62,1.25,.06,std('#4a3d45'),i%2?.7:-.7,.62,front,g);
  const glass=std('#eef1fb',{roughness:.2,emissive:'#fff6e4',emissiveIntensity:.15});
  [[i%2?-.7:.7,1.35]].forEach(([wx,wy])=>{box(.78,.7,.05,std('#fff'),wx,wy,front,g);box(.66,.58,.06,glass,wx,wy,front+.005,g)});
  if(h>2.5)box(.6,.5,.06,glass,0,h-.45,front,g);
  // Picket fence along the front yard
  const picket=std('#f6f3ec');for(let k=-6;k<=6;k++)if(Math.abs(k)>1)box(.07,.5,.04,picket,k*.24,.25,front+.9,g);
  box(w,.05,.04,picket,0,.38,front+.9,g);
}

function tree(x:number,z:number,s:number,parent:THREE.Object3D){
  cyl(.07*s,.1*s,1.2*s,std('#7a5a44'),x,.6*s,z,parent,8);
  const leaf=std(s>1?'#93b47e':'#a5c48e',{flatShading:true,roughness:1});
  [[0,1.5,0,.62],[.3,1.25,.1,.45],[-.28,1.3,-.05,.48],[0,1.9,.05,.42]].forEach(([dx,dy,dz,r])=>mesh(new THREE.IcosahedronGeometry(r*s,0),leaf,x+dx*s,dy*s,z+dz*s,parent));
}

function car(color:string,parent:THREE.Object3D){
  const g=new THREE.Group();parent.add(g);
  box(2,.45,.9,std(color,{roughness:.4,metalness:.2}),0,.42,0,g);box(1.1,.38,.82,std(color,{roughness:.4,metalness:.2}),-.1,.82,0,g);
  box(1.02,.3,.84,std('#cfd9e6',{roughness:.1,metalness:.3}),-.1,.83,0,g);
  const tyre=std('#1c1c20');[[-.62,.45],[.62,.45],[-.62,-.45],[.62,-.45]].forEach(([x,z])=>cyl(.2,.2,.14,tyre,x,.2,z,g,16).rotation.x=Math.PI/2);
  return g;
}

export async function createStreet(canvas:HTMLCanvasElement):Promise<IntroScene>{
  await fontsReady();
  const small=innerWidth<760;
  const renderer=makeRenderer(canvas,!small);
  const sky='#f6f4fc';
  const scene=new THREE.Scene();scene.background=new THREE.Color(sky);scene.fog=new THREE.Fog(sky,16,46);
  const cam=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.03,120);

  // Ground: yards, pavement, kerb and road
  box(90,.1,8,std('#cfe0bd',{roughness:1}),11,-.05,-4,scene);
  box(90,.06,1.6,std('#ece8df',{roughness:.95}),11,.03,.7,scene);
  for(let x=-30;x<52;x+=1.3)box(.03,.062,1.6,std('#d9d3c7'),x,.032,.7,scene);
  box(90,.14,.12,std('#d6d2cc'),11,.07,1.52,scene);
  box(90,.04,7,std('#8f8d97',{roughness:.9}),11,.0,5.1,scene);
  for(let x=-30;x<52;x+=3)box(1.5,.045,.12,glow('#f4f2ee'),x,.003,5.1,scene);

  // Houses and trees along the street, then the studio at the end
  let i=0;for(let x=-16;x<END-3;x+=4.6,i++){house(x,i,scene);if(i%2===0)tree(x+2.3,-.35,1.1,scene)}
  for(let x=-14;x<END;x+=7.5)tree(x,-6.5,1.5,scene);

  // Street lamps on the pavement edge
  const lampMat=std('#3c3a46',{metalness:.5,roughness:.4});
  for(let x=-12;x<END;x+=8){cyl(.04,.05,2.6,lampMat,x,1.3,1.35,scene,10);box(.5,.06,.12,lampMat,x-.2,2.6,1.35,scene);mesh(new THREE.SphereGeometry(.09,12,8),glow('#fff4d8'),x-.42,2.53,1.35,scene).castShadow=false}

  // The studio: navy, taller, an awning in the site's purple and a lit open doorway.
  const studio=new THREE.Group();studio.position.set(END,0,-2.6);scene.add(studio);
  const navy=std('#000047',{roughness:.8});
  box(5.6,4.2,3.2,navy,0,2.1,0,studio);box(5.8,.2,3.4,std('#0c0c5a'),0,4.25,0,studio);
  const awning=box(2.2,.08,1,std('#ad93ff',{roughness:.7}),0,2.45,2.05,studio);awning.rotation.x=.18;
  const sign=canvasTexture(1024,256,(c,w,h)=>{c.fillStyle='#000047';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font=`800 120px ${sans}`;c.textAlign='center';c.textBaseline='middle';c.fillText('RAYGAN.',w/2,h/2+6)});
  mesh(new THREE.PlaneGeometry(2.4,.6),new THREE.MeshBasicMaterial({map:sign,toneMapped:false}),0,3.35,1.62,studio).castShadow=false;
  const note=canvasTexture(900,200,(c,w,h)=>{c.fillStyle='#000047';c.fillRect(0,0,w,h);c.fillStyle='#ad93ff';c.font=`400 120px ${hand}`;c.textAlign='center';c.textBaseline='middle';c.fillText('Created to Create.',w/2,h/2)});
  mesh(new THREE.PlaneGeometry(1.8,.4),new THREE.MeshBasicMaterial({map:note,toneMapped:false}),1.85,1.3,1.62,studio).castShadow=false;
  // Doorway: a white room behind an opening, lit like the homepage.
  const doorW=1.2,doorH=2.15;
  const frame=std('#f6f3ec');box(.12,doorH,.14,frame,-doorW/2-.06,doorH/2,1.68,studio);box(.12,doorH,.14,frame,doorW/2+.06,doorH/2,1.68,studio);box(doorW+.24,.12,.14,frame,0,doorH+.06,1.68,studio);
  const room=mesh(new THREE.BoxGeometry(5.4,4,3),new THREE.MeshBasicMaterial({color:'#ffffff',side:THREE.BackSide,toneMapped:false}),0,2,0,studio);room.castShadow=false;room.receiveShadow=false;
  // Cut the opening: hide the navy wall where the door is by layering the wall as four pieces.
  studio.children[0].visible=false;
  const fw=5.6,fh=4.2,front=1.6;
  box((fw-doorW)/2,fh,.1,navy,-(doorW/2+(fw-doorW)/4),fh/2,front-.05,studio);box((fw-doorW)/2,fh,.1,navy,doorW/2+(fw-doorW)/4,fh/2,front-.05,studio);
  box(doorW,fh-doorH,.1,navy,0,doorH+(fh-doorH)/2,front-.05,studio);
  box(fw,fh,.1,navy,0,fh/2,-1.6,studio);box(.1,fh,3.2,navy,-2.8,fh/2,0,studio);box(.1,fh,3.2,navy,2.8,fh/2,0,studio);
  const doorLight=new THREE.PointLight('#fff8ec',0,6,1.5);doorLight.position.set(0,1.2,2.3);studio.add(doorLight);
  box(1.4,.08,1.4,std('#ece8df'),0,.04,2.3,studio);

  // Distant hills and a soft lavender sun
  [[-10,-26,16],[12,-30,20],[34,-27,15]].forEach(([x,z,r])=>{const hill=mesh(new THREE.SphereGeometry(r,24,12),std('#e3dff0',{roughness:1}),x,-r*.72,z,scene);hill.castShadow=false});
  mesh(new THREE.CircleGeometry(2.2,40),glow('#ddd2fb'),END-6,11,-40,scene).castShadow=false;
  const clouds:THREE.Group[]=[];
  for(let k=0;k<6;k++){const c=new THREE.Group();c.position.set(-10+k*8,7+(k%3)*1.2,-18-(k%2)*6);scene.add(c);[[0,0,1.4],[1.3,.2,1],[-1.2,-.1,1.05],[.4,.6,.9]].forEach(([x,y,r])=>{const m=mesh(new THREE.SphereGeometry(r,14,10),std('#ffffff',{roughness:1}),x,y,0,c);m.castShadow=false;m.scale.y=.6});clouds.push(c)}

  // Traffic
  const cars=[{g:car('#9d86e9',scene),z:3.6,dir:1,speed:5,off:0},{g:car('#9db59b',scene),z:6.4,dir:-1,speed:6.5,off:20},{g:car('#e6c7a8',scene),z:3.6,dir:1,speed:4.2,off:33}];
  cars.forEach(c=>{if(c.dir<0)c.g.rotation.y=Math.PI});

  // The traveller: the support page's five-frame walking sprite on a plane.
  const tex=await new THREE.TextureLoader().loadAsync('/images/moving-man/walking-sprite.svg');
  tex.colorSpace=THREE.SRGBColorSpace;tex.repeat.set(1/5,1);tex.magFilter=THREE.LinearFilter;
  const man=mesh(new THREE.PlaneGeometry(1.2,1.8),new THREE.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.4,toneMapped:false}),START,.92,.7,scene);
  man.castShadow=false;
  const shadow=mesh(new THREE.CircleGeometry(.36,24),new THREE.MeshBasicMaterial({color:'#000',transparent:true,opacity:.14,depthWrite:false}),START,.065,.7,scene);shadow.rotation.x=-Math.PI/2;shadow.scale.y=.35;shadow.castShadow=false;shadow.receiveShadow=false;

  // Light
  const hemi=new THREE.HemisphereLight('#ffffff','#d9d2c4',1.6);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#fff3e0',2.2);sun.position.set(-8,14,10);sun.castShadow=!small;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-14,right:14,top:10,bottom:-6,near:1,far:50});sun.shadow.bias=-.0006;scene.add(sun,sun.target);

  const doorWorld=new THREE.Vector3(END,1.15,-2.6+1.6);
  const camPos=new THREE.Vector3(),look=new THREE.Vector3(),from=new THREE.Vector3(),fromLook=new THREE.Vector3();
  let aspect=innerWidth/innerHeight;
  const setLens=()=>{cam.fov=aspect<1?58:38;cam.aspect=aspect;cam.updateProjectionMatrix()};setLens();
  let lastX=START,lastMove=-1;

  return {
    render(p,time,since){
      // Walk phase: his position (and so his stride) follows the scroll.
      const w=ease(span(p,0,WALK_END));
      const x=since<0?START:START+(END-1.15-START)*w;
      // While loading he walks on the spot; afterwards his legs only move as he covers ground.
      if(Math.abs(x-lastX)>.002)lastMove=time;lastX=x;
      const frameIndex=since<0?Math.floor(time*7)%5:time-lastMove>.18?0:Math.floor(((x-START)/1.15)*5)%5;
      tex.offset.x=frameIndex/5;
      man.position.x=x;shadow.position.x=x;
      // Camera: a side-on tracking shot, then a push through the studio doorway.
      const sideZ=aspect<1?9:9.4,sideY=aspect<1?2.1:2.3;
      from.set(x+(aspect<1?.2:.9)+Math.sin(time*.3)*.15,sideY,sideZ);fromLook.set(x+(aspect<1?.4:1.6),1.3,-.8);
      const push=ease(span(p,WALK_END-.06,1));
      camPos.copy(from).lerp(new THREE.Vector3(END,1.15,-2.6+.2),push);
      look.copy(fromLook).lerp(new THREE.Vector3(END,1.15,-6),push);
      if(push>0){const mid=Math.sin(push*Math.PI);camPos.y+=mid*.35;look.lerp(doorWorld,mid*.5)}
      cam.position.copy(camPos);cam.lookAt(look);
      doorLight.intensity=4+push*10;
      // Traffic and clouds keep their own time.
      cars.forEach(c=>{const span=60;const pos=((time*c.speed*c.dir+c.off)%span+span)%span-24;c.g.position.set(pos,0,c.z)});
      clouds.forEach((c,k)=>{c.position.x=-10+k*8+((time*.25)%8)});
      renderer.render(scene,cam);
    },
    resize(){renderer.setSize(innerWidth,innerHeight,false);aspect=innerWidth/innerHeight;setLens()},
    dispose(){disposeAll(scene,renderer)},
  };
}
