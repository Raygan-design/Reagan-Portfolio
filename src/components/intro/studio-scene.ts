import * as THREE from 'three';
import {box,canvasTexture,clamp01,coverDistance,cyl,disposeAll,ease,fontsReady,glow,hand,heroTexture,makeRenderer,mesh,rod,sans,span,std,type IntroScene} from './three-kit';

// "On Air": the Unscripted with Raygan studio in 3D. The lights come up when loading finishes,
// the ON AIR sign flickers on, and scrolling dollies the camera past the mics into the laptop on
// the desk, whose screen shows the homepage, so the real page takes over from that frame.
export async function createStudio(canvas:HTMLCanvasElement):Promise<IntroScene>{
  await fontsReady();
  const small=innerWidth<760;
  const renderer=makeRenderer(canvas,!small);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#05052a');scene.fog=new THREE.Fog('#05052a',9,20);
  const cam=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.02,60);

  // Room
  const wall=std('#10104a',{roughness:.95}),floor=std('#2a2230',{roughness:.6});
  box(12,.1,12,floor,0,-.05,0,scene);
  box(12,5,.1,wall,0,2.5,-4,scene);box(.1,5,12,wall,-5,2.5,0,scene);box(.1,5,12,wall,5,2.5,0,scene);box(12,.1,12,std('#07072a'),0,4.6,0,scene);
  // Acoustic panels on the back wall
  const panelA=std('#1c1c62',{roughness:1}),panelB=std('#262678',{roughness:1});
  for(let r=0;r<3;r++)for(let c=0;c<8;c++){if(r===2&&c>2&&c<5)continue;const d=.06+((r*3+c)%3)*.03;box(.82,.82,d,(r+c)%2?panelA:panelB,-3.15+c*.9,.9+r*.9,-3.95+d/2,scene)}
  // Rug
  mesh(new THREE.CircleGeometry(2.4,48),std('#3a2f72',{roughness:1}),0,.005,.2,scene).rotation.x=-Math.PI/2;

  // ON AIR sign
  const onAirTex=canvasTexture(1024,320,(c,w,h)=>{c.fillStyle='#ad93ff';c.fillRect(0,0,w,h);c.fillStyle='#000047';c.font=`800 190px ${sans}`;c.textAlign='center';c.textBaseline='middle';c.fillText('ON AIR',w/2,h/2+8)});
  const onAirMat=new THREE.MeshBasicMaterial({map:onAirTex,toneMapped:false});
  box(1.72,.6,.08,std('#0a0a0a'),0,3.65,-3.92,scene);
  const onAir=mesh(new THREE.PlaneGeometry(1.6,.5),onAirMat,0,3.65,-3.87,scene);onAir.castShadow=false;
  const onAirLight=new THREE.PointLight('#ad93ff',0,7,1.6);onAirLight.position.set(0,3.5,-3.4);scene.add(onAirLight);

  // Neon show name on the left wall
  const neonTex=canvasTexture(1400,360,(c,w,h)=>{c.textAlign='center';c.textBaseline='middle';c.shadowColor='#c7b4ff';c.shadowBlur=36;c.fillStyle='#e6dcff';c.font=`400 150px ${hand}`;c.fillText('Unscripted',w/2,h*.42);c.shadowBlur=18;c.font=`700 52px ${sans}`;c.fillText('WITH RAYGAN',w/2,h*.82)});
  const neon=mesh(new THREE.PlaneGeometry(2.6,.67),new THREE.MeshBasicMaterial({map:neonTex,transparent:true,toneMapped:false,depthWrite:false}),-4.93,2.7,-.6,scene);neon.rotation.y=Math.PI/2;neon.castShadow=false;
  const neonLight=new THREE.PointLight('#b9a2ff',0,5,1.8);neonLight.position.set(-4.3,2.6,-.6);scene.add(neonLight);

  // Framed print on the right wall
  const printTex=canvasTexture(600,800,(c,w,h)=>{c.fillStyle='#f4f1ea';c.fillRect(0,0,w,h);c.fillStyle='#000047';c.font=`400 96px ${hand}`;c.textAlign='center';c.fillText('Created',w/2,h*.44);c.fillText('to Create.',w/2,h*.6);c.font=`700 22px ${sans}`;c.fillText('RAYGAN.',w/2,h*.86)});
  box(.06,1.2,.92,std('#111'),4.93,2.4,-1.4,scene);
  const print=mesh(new THREE.PlaneGeometry(.8,1.07),new THREE.MeshStandardMaterial({map:printTex,roughness:.9}),4.89,2.4,-1.4,scene);print.rotation.y=-Math.PI/2;

  // Shelf with books on the right wall
  const shelf=std('#b88d63',{roughness:.7});
  [1.25,1.85].forEach(y=>{box(.3,.04,1.6,shelf,4.8,y,1.3,scene);let z=.6;['#ad93ff','#e8e1d4','#000047','#c9e98e','#f2b8a0','#8a8fa8'].forEach((col,i)=>{const hgt=.26+(i%3)*.05;box(.22,hgt,.07,std(col),4.78,y+.02+hgt/2,z,scene);z+=.1+(i%2)*.03})});

  // Desk
  const wood=std('#c9a27a',{roughness:.55});
  cyl(1.35,1.35,.07,wood,0,.8,0,scene,64);cyl(.11,.14,.76,std('#1b1b22',{metalness:.6,roughness:.4}),0,.4,0,scene);cyl(.55,.6,.04,std('#1b1b22',{metalness:.6,roughness:.4}),0,.02,0,scene,48);

  // Chairs facing each other across the desk
  const seatMat=std('#2d2d48',{roughness:.9}),metal=std('#1b1b22',{metalness:.7,roughness:.35});
  [-1,1].forEach(side=>{
    const g=new THREE.Group();g.position.set(side*1.75,0,.15);g.rotation.y=side*Math.PI/2;scene.add(g);
    box(.62,.12,.6,seatMat,0,.52,0,g);box(.62,.72,.1,seatMat,0,.95,.3,g);cyl(.035,.035,.44,metal,0,.27,0,g,12);
    for(let k=0;k<5;k++){const a=k/5*Math.PI*2;const leg=box(.36,.03,.05,metal,Math.cos(a)*.17,.05,Math.sin(a)*.17,g);leg.rotation.y=-a}
  });

  // Microphones on boom arms, angled at each chair
  const micBody=std('#16161c',{metalness:.5,roughness:.45}),foam=std('#0b0b0d',{roughness:1});
  [-1,1].forEach(side=>{
    const base=new THREE.Vector3(side*.95,.84,-.55),elbow=new THREE.Vector3(side*1.05,1.42,-.3),tip=new THREE.Vector3(side*1.12,1.2,.05);
    cyl(.05,.05,.06,metal,base.x,base.y,base.z,scene,12);rod(base,elbow,.018,metal,scene);rod(elbow,tip,.018,metal,scene);
    const mic=new THREE.Group();mic.position.copy(tip);mic.rotation.z=side*.9;scene.add(mic);
    cyl(.05,.05,.24,micBody,0,-.08,0,mic,20);mesh(new THREE.SphereGeometry(.066,20,14),foam,0,-.22,0,mic);
  });

  // Headphones and a mug
  const hp=new THREE.Group();hp.position.set(-.55,.84,.45);hp.rotation.set(-Math.PI/2,0,.4);scene.add(hp);
  mesh(new THREE.TorusGeometry(.11,.012,8,24,Math.PI),metal,0,0,0,hp);
  [-.11,.11].forEach(x=>cyl(.045,.045,.035,std('#2a2a2a'),x,0,0,hp,16).rotation.z=Math.PI/2);
  cyl(.045,.04,.1,std('#f4f1ea',{roughness:.4}),.6,.88,.35,scene,20);

  // Laptop. Its screen carries the homepage and is where the camera hands over.
  const lap=new THREE.Group();lap.position.set(0,.835,.42);scene.add(lap);
  box(.56,.02,.38,std('#c9ccd3',{metalness:.6,roughness:.35}),0,0,0,lap);
  const hinge=new THREE.Group();hinge.position.set(0,.01,-.18);hinge.rotation.x=-.18;lap.add(hinge);
  box(.56,.36,.014,std('#c9ccd3',{metalness:.6,roughness:.35}),0,.18,-.008,hinge);
  const screenW=.52,screenH=.325;
  const screen=mesh(new THREE.PlaneGeometry(screenW,screenH),new THREE.MeshBasicMaterial({map:heroTexture(),toneMapped:false}),0,.18,.0015,hinge);screen.castShadow=false;

  // Studio camera on a tripod, front left
  const tri=new THREE.Group();tri.position.set(-2.6,0,2.3);tri.rotation.y=-.75;scene.add(tri);
  const top=new THREE.Vector3(0,1.35,0);[0,1,2].forEach(k=>{const a=k/3*Math.PI*2;rod(new THREE.Vector3(Math.cos(a)*.45,0,Math.sin(a)*.45),top,.016,metal,tri)});
  box(.3,.2,.42,std('#1e1e24',{roughness:.5}),0,1.48,0,tri);cyl(.07,.08,.22,std('#111'),0,1.48,-.3,tri,20).rotation.x=Math.PI/2;
  const rec=mesh(new THREE.SphereGeometry(.018,10,8),glow('#ff4d4d'),.1,1.6,.1,tri);rec.castShadow=false;

  // Softboxes on stands
  [[-3.3,-1.2],[3.4,-1.6]].forEach(([x,z])=>{
    const g=new THREE.Group();g.position.set(x,0,z);g.lookAt(0,1.2,0);scene.add(g);
    rod(new THREE.Vector3(0,0,0),new THREE.Vector3(0,1.9,0),.02,metal,g);
    box(.9,.65,.3,std('#141418'),0,2.1,-.05,g);const face=mesh(new THREE.PlaneGeometry(.84,.6),glow('#f6f2ff'),0,2.1,.105,g);face.castShadow=false;
  });

  // Plant in the corner
  cyl(.22,.17,.42,std('#d8cfc0'),-4.3,.21,-3.3,scene,20);
  for(let k=0;k<9;k++){const leaf=mesh(new THREE.SphereGeometry(.24,10,8),std(k%2?'#4f7a4a':'#5f8c55',{flatShading:true}),-4.3+Math.cos(k*2.1)*.25,.62+k*.11,-3.3+Math.sin(k*2.1)*.25,scene);leaf.scale.set(.6,1.3,.35);leaf.rotation.set(k,.3*k,.4)}

  // Lights
  const hemi=new THREE.HemisphereLight('#bdb6ff','#1a1426',0);scene.add(hemi);
  const key=new THREE.SpotLight('#ffe7c8',0,14,.62,.55,1.2);key.position.set(.6,4.4,1.6);key.target.position.set(0,.8,0);key.castShadow=!small;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0005;scene.add(key,key.target);
  const fill=new THREE.PointLight('#cfc4ff',0,12,1.5);fill.position.set(-2.5,2.6,2.6);scene.add(fill);

  // Camera path: wide establishing shot, across the desk, then square onto the laptop screen.
  const screenCenter=new THREE.Vector3(),screenNormal=new THREE.Vector3(),q=new THREE.Quaternion();
  const path=(aspect:number)=>{
    screen.updateWorldMatrix(true,false);screen.getWorldPosition(screenCenter);screen.getWorldQuaternion(q);screenNormal.set(0,0,1).applyQuaternion(q);
    cam.fov=aspect<1?64:42;cam.aspect=aspect;cam.updateProjectionMatrix();
    const end=screenCenter.clone().addScaledVector(screenNormal,coverDistance(cam,screenW,screenH));
    return {
      pos:new THREE.CatmullRomCurve3([new THREE.Vector3(aspect<1?5.4:4.6,2.7,aspect<1?7.6:5.8),new THREE.Vector3(1.2,2.3,4.6),new THREE.Vector3(-2.4,1.9,3.2),new THREE.Vector3(-1.2,1.45,2.2),screenCenter.clone().addScaledVector(screenNormal,.75),end],false,'centripetal'),
      look:new THREE.CatmullRomCurve3([new THREE.Vector3(0,1.7,-1.4),new THREE.Vector3(-.6,2.2,-2.4),new THREE.Vector3(.4,1.6,-1.6),new THREE.Vector3(0,1.05,.1),screenCenter.clone(),screenCenter.clone()],false,'centripetal'),
    };
  };
  let curves=path(innerWidth/innerHeight);
  const look=new THREE.Vector3();

  return {
    render(p,time,since){
      const lit=since<0?0:ease(clamp01(since/1.4));
      // The sign flickers before it settles.
      const flick=since<0?0:since<.9?(Math.sin(since*60)>.1?1:.15)*(since>.25?1:.4):1;
      onAirMat.color.setScalar(.25+flick*.95);onAirLight.intensity=flick*7;
      neonLight.intensity=lit*3;neon.material.opacity=.3+lit*.7;
      hemi.intensity=.15+lit*.95;key.intensity=lit*70;fill.intensity=lit*10;
      rec.visible=Math.sin(time*3)>0;
      const e=p<.7?.62*ease(p/.7):.62+.38*ease((p-.7)/.3);const sway=(1-e)*(1-e);
      cam.position.copy(curves.pos.getPoint(e));cam.position.x+=Math.sin(time*.25)*.25*sway;cam.position.y+=Math.sin(time*.35)*.08*sway;
      cam.lookAt(look.copy(curves.look.getPoint(e)));
      renderer.render(scene,cam);
    },
    resize(){renderer.setSize(innerWidth,innerHeight,false);curves=path(innerWidth/innerHeight)},
    dispose(){disposeAll(scene,renderer)},
  };
}
