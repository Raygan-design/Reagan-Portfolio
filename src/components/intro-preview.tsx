'use client';
import {useEffect,useRef,useState} from 'react';
import {useScrollIntro,type IntroStage} from '@/components/intro/use-scroll-intro';
import type {IntroScene} from '@/components/intro/three-kit';

// Preview only (?intro=1…3): three scroll-driven loading intros over the homepage. Scrolling
// moves through each one and its last frame matches the homepage, so the site takes over
// without a cut.

function Hud({stage,pct,play,hint,tone}:{stage:IntroStage;pct:number;play:(s?:number)=>void;hint:string;tone:'dark'|'light'}){
  return <div className={`intro-hud intro-hud-${tone}`}>
    <p className="intro-name">REAGAN MARFO</p>
    <div className="intro-foot"><span className="intro-count">{stage==='loading'?`${String(pct).padStart(2,'0')}%`:hint}</span>{stage!=='loading'&&<span className="intro-cue" aria-hidden="true"/>}</div>
    <button className="intro-skip" onClick={e=>{e.stopPropagation();play(1.2)}}>SKIP</button>
  </div>;
}

// 1 · Through the letters: RAYGAN is cut out of a navy screen, so the homepage shows through the
// letters. Scrolling zooms into the R until its stroke fills the screen and the page is just there.
function Letters(){
  const zoom=useRef<SVGGElement>(null),outlineZoom=useRef<SVGGElement>(null),hole=useRef<SVGTextElement>(null),outline=useRef<SVGTextElement>(null);
  const [size,setSize]=useState({w:1440,h:900});const origin=useRef({x:0,y:0});
  useEffect(()=>{const fit=()=>setSize({w:innerWidth,h:innerHeight});fit();addEventListener('resize',fit);return ()=>removeEventListener('resize',fit)},[]);
  const measured=useRef('');
  useEffect(()=>{measured.current=''},[size]);
  const {stage,pct,overlayRef,play}=useScrollIntro({sceneReady:true,replayAt:'ready',onFrame:(p,_t,since)=>{
    // Aim at the middle of the R's stem, measured once the font has loaded.
    const key=`${size.w}x${size.h}`;
    if(measured.current!==key&&hole.current&&document.fonts.check(`800 40px 'Bricolage Grotesque Variable'`)){const r=hole.current.getExtentOfChar(0);origin.current={x:r.x+r.width*.17,y:r.y+r.height*.6};measured.current=key}
    const s=1+Math.pow(p,2.4)*160,{x,y}=origin.current;const tr=`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`;
    zoom.current?.setAttribute('transform',tr);outlineZoom.current?.setAttribute('transform',tr);
    const open=since<0?0:Math.min(1,since/.9);const v=Math.round(255*(1-open));
    hole.current?.setAttribute('fill',`rgb(${v},${v},${v})`);
    outline.current?.setAttribute('opacity',String(Math.max(0,1-open*1.4)));
  }});
  if(stage==='done')return null;
  const fs=Math.min(size.w*(size.w<760?.21:.19),size.h*.34);
  const text={x:size.w/2,y:size.h*.5,textAnchor:'middle',dominantBaseline:'central',fontSize:fs,fontWeight:800,letterSpacing:-fs*.03,fontFamily:"'Bricolage Grotesque Variable', sans-serif"} as const;
  return <div ref={overlayRef} className="intro intro-1" data-lenis-prevent onClick={()=>play()}>
    <svg className="intro1-svg" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs><mask id="intro1-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={size.w} height={size.h}>
        <rect width={size.w} height={size.h} fill="#fff"/>
        <g ref={zoom}><text ref={hole} {...text} fill="#fff">RAYGAN</text></g>
      </mask></defs>
      <rect width={size.w} height={size.h} fill="#000047" mask="url(#intro1-mask)"/>
      <g ref={outlineZoom}><text ref={outline} {...text} fill="none" stroke="#fff" strokeWidth={1.2} strokeDasharray={`${pct*16} 2400`} vectorEffect="non-scaling-stroke">RAYGAN</text></g>
    </svg>
    <p className="intro1-hand" style={{top:`calc(50% + ${fs*.5}px)`}}>Created to Create.</p>
    <Hud stage={stage} pct={pct} play={play} hint="SCROLL" tone="dark"/>
  </div>;
}

// 2 and 3 · Three.js scenes, loaded only when they are shown.
type Loader=()=>Promise<(c:HTMLCanvasElement)=>Promise<IntroScene>>;
function ThreeIntro({id,load,hint,tone}:{id:number;load:Loader;hint:string;tone:'dark'|'light'}){
  const canvas=useRef<HTMLCanvasElement>(null);const scene=useRef<IntroScene|null>(null);const [ready,setReady]=useState(false);
  useEffect(()=>{let live=true;let made:IntroScene|null=null;
    load().then(create=>create(canvas.current!)).then(s=>{made=s;if(!live){s.dispose();return}scene.current=s;setReady(true)});
    const fit=()=>scene.current?.resize();addEventListener('resize',fit);
    return ()=>{live=false;removeEventListener('resize',fit);made?.dispose();scene.current=null};
  },[load]);
  const {stage,pct,overlayRef,play}=useScrollIntro({sceneReady:ready,onFrame:(p,t,since)=>scene.current?.render(p,t,since)});
  if(stage==='done')return null;
  return <div ref={overlayRef} className={`intro intro-${id} intro-3d`} data-lenis-prevent onClick={()=>play()}>
    <canvas ref={canvas} className="intro-canvas"/>
    <Hud stage={stage} pct={pct} play={play} hint={hint} tone={tone}/>
  </div>;
}
const loadStudio:Loader=()=>import('@/components/intro/studio-scene').then(m=>m.createStudio);
const loadStreet:Loader=()=>import('@/components/intro/street-scene').then(m=>m.createStreet);

export function IntroPreview({variant:v}:{variant?:string}){
  if(v==='1')return <Letters/>;
  if(v==='2')return <ThreeIntro id={2} load={loadStudio} hint="SCROLL TO GO ON AIR" tone="dark"/>;
  if(v==='3')return <ThreeIntro id={3} load={loadStreet} hint="SCROLL TO WALK" tone="light"/>;
  return null;
}
