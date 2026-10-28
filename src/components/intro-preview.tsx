'use client';
import {useEffect,useRef,useState} from 'react';
import {MovingStreet} from '@/components/moving-man';

// Preview only (?intro=1…3): three loading intros that sit over the homepage while it loads,
// count to 100, then wait for a scroll, swipe, tap or key before moving the visitor in.
type Stage='loading'|'ready'|'leaving'|'done';
const loadTime=2200,leaveTime=1300;

function useIntro(){
  const [stage,setStage]=useState<Stage>('loading');const [pct,setPct]=useState(0);
  const stageRef=useRef(stage);stageRef.current=stage;
  useEffect(()=>{
    const root=document.documentElement;root.style.overflow='hidden';
    const start=performance.now();let raf=0;
    const tick=(t:number)=>{const p=Math.min(1,(t-start)/loadTime);setPct(Math.round((1-Math.pow(1-p,3))*100));if(p<1)raf=requestAnimationFrame(tick);else setStage('ready')};
    raf=requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(raf);root.style.overflow=''};
  },[]);
  const enter=()=>{if(stageRef.current!=='ready')return;setStage('leaving');setTimeout(()=>{
    setStage('done');document.documentElement.style.overflow='';window.scrollTo(0,0);
    const hero=document.querySelector<HTMLElement>('.home-entrance');if(hero){hero.style.animation='none';void hero.offsetWidth;hero.style.animation=''}
  },leaveTime)};
  const skip=()=>{stageRef.current='ready';enter()};
  useEffect(()=>{
    let y0=0;
    const wheel=(e:WheelEvent)=>{if(e.deltaY>4)enter()};
    const ts=(e:TouchEvent)=>{y0=e.touches[0].clientY};const tm=(e:TouchEvent)=>{if(y0-e.touches[0].clientY>24)enter()};
    const key=(e:KeyboardEvent)=>{if(['ArrowDown','PageDown',' ','Enter'].includes(e.key))enter()};
    addEventListener('wheel',wheel,{passive:true});addEventListener('touchstart',ts,{passive:true});addEventListener('touchmove',tm,{passive:true});addEventListener('keydown',key);
    return ()=>{removeEventListener('wheel',wheel);removeEventListener('touchstart',ts);removeEventListener('touchmove',tm);removeEventListener('keydown',key)};
  });
  return {stage,pct,enter,skip};
}

function Shell({id,stage,pct,enter,skip,children,hint='SCROLL TO ENTER'}:{id:number;stage:Stage;pct:number;enter:()=>void;skip:()=>void;children:React.ReactNode;hint?:string}){
  return <div className={`intro intro-${id} is-${stage}`} data-lenis-prevent onClick={enter} style={{['--pct' as string]:pct/100}}>
    {children}
    <div className="intro-foot"><span className="intro-count">{stage==='loading'?`${pct}%`:hint}</span></div>
    <button className="intro-skip" onClick={e=>{e.stopPropagation();skip()}}>SKIP</button>
  </div>;
}

// 1 · "Created to Create." writes itself in the handwriting font, then the words zoom past you.
function Written(){const s=useIntro();if(s.stage==='done')return null;return <Shell id={1} {...s}>
  <div className="intro1-corners"><span>I DO ALOT OF THINGS</span><span>I AM A BORING PERSON</span></div>
  <p className="intro1-line"><span>Created</span> <span>to Create.</span></p>
  <p className="intro1-name">REAGAN MARFO</p>
</Shell>}

// 2 · An ON AIR sign over a waveform that fills as it loads; at 100% the sign lights up.
function OnAir(){const s=useIntro();if(s.stage==='done')return null;const bars=48;return <Shell id={2} {...s}>
  <div className="intro2-sign"><span>ON AIR</span></div>
  <div className="intro2-wave" aria-hidden="true">{Array.from({length:bars},(_,i)=><i key={i} className={i/bars<s.pct/100?'on':''} style={{['--h' as string]:`${20+Math.round(Math.abs(Math.sin(i*1.7)*Math.cos(i*.45))*80)}%`,['--d' as string]:`${(i%7)*-.15}s`}}/>)}</div>
  <p className="intro2-show">UNSCRIPTED WITH RAYGAN</p>
</Shell>}

// 3 · The support page's street, full screen: Reagan walks while the neighbourhood passes and the
// day's distance fills in; entering pushes the camera in on him and into the homepage.
function WalkIn(){const s=useIntro();if(s.stage==='done')return null;return <Shell id={3} {...s} hint="SCROLL TO WALK IN">
  <div className="intro3-head"><p className="eyebrow">REAGAN MARFO</p><p className="handwritten">Still moving. Still creating.</p></div>
  <div className="intro3-stage"><div className="moving-scene intro3-scene" aria-hidden="true"><MovingStreet/></div></div>
  <div className="intro3-progress" aria-hidden="true"><i/></div>
</Shell>}

export function IntroPreview({variant:v}:{variant?:string}){
  if(v==='1')return <Written/>;if(v==='2')return <OnAir/>;if(v==='3')return <WalkIn/>;return null;
}
