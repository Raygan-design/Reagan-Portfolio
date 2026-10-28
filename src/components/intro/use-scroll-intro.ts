'use client';
import {useEffect,useRef,useState} from 'react';

// Shared driver for the homepage intros. While the scene loads it counts to 100; after that the
// visitor's scroll (wheel, swipe or arrow keys) scrubs a progress value from 0 to 1, smoothed so
// the camera glides rather than jumps. A tap or SKIP plays the rest on its own. Each frame calls
// onFrame(progress, seconds, secondsSinceReady) and writes --p on the overlay for CSS fades.
// The homepage's own entrance replays near the end so the hand-off has no visible cut.
export type IntroStage='loading'|'ready'|'done';

export function replayHomeEntrance(){
  const hero=document.querySelector<HTMLElement>('.home-entrance');
  if(!hero)return;hero.style.animation='none';void hero.offsetWidth;hero.style.animation='';
}

export function useScrollIntro({sceneReady,onFrame,replayAt=.8,loadTime=1800}:{sceneReady:boolean;onFrame:(p:number,time:number,sinceReady:number)=>void;replayAt?:number|'ready';loadTime?:number}){
  const [stage,setStage]=useState<IntroStage>('loading');
  const [pct,setPct]=useState(0);
  const overlayRef=useRef<HTMLDivElement>(null);
  const frame=useRef(onFrame);frame.current=onFrame;
  const ready=useRef(sceneReady);ready.current=sceneReady;
  const state=useRef({target:0,p:0,auto:0,readyAt:-1,start:0,replayed:false,done:false});

  useEffect(()=>{
    const root=document.documentElement;root.style.overflow='hidden';
    const s=state.current;const start=performance.now();s.start=start;let last=start,raf=0,shownPct=-1;
    const finish=()=>{s.done=true;root.style.overflow='';window.scrollTo(0,0);setStage('done')};
    const loop=(now:number)=>{
      const dt=Math.min(.05,(now-last)/1000);last=now;const t=(now-start)/1000;
      if(s.readyAt<0){
        const eased=1-Math.pow(1-Math.min(1,(now-start)/loadTime),3);
        const value=Math.round(Math.min(ready.current?1:.9,eased)*100);
        if(value!==shownPct){shownPct=value;setPct(value)}
        if(value>=100){s.readyAt=t;setStage('ready');if(replayAt==='ready'){s.replayed=true;replayHomeEntrance()}}
      }else{
        if(s.auto)s.target=Math.min(1,s.target+dt/s.auto);
        s.p+=(s.target-s.p)*Math.min(1,dt*5);
        if(s.target>=1&&s.p>.996)s.p=1;
        const hold=(window as unknown as {__introHold?:number}).__introHold;if(typeof hold==='number')s.p=s.target=hold;
        if(typeof replayAt==='number'&&!s.replayed&&s.p>=replayAt){s.replayed=true;replayHomeEntrance()}
      }
      overlayRef.current?.style.setProperty('--p',s.p.toFixed(4));
      frame.current(s.p,t,s.readyAt<0?-1:t-s.readyAt);
      if(s.p>=1){finish();return}
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);

    // Scroll input only counts once the scene is ready; scrolling back up rewinds.
    const nudge=(d:number)=>{if(s.readyAt<0||s.done)return;s.auto=0;s.target=Math.max(0,Math.min(1,s.target+d))};
    let touchY=0;
    const wheel=(e:WheelEvent)=>nudge(e.deltaY/(innerHeight*2.4));
    const touchStart=(e:TouchEvent)=>{touchY=e.touches[0].clientY};
    const touchMove=(e:TouchEvent)=>{const y=e.touches[0].clientY;nudge((touchY-y)/(innerHeight*1.6));touchY=y};
    const key=(e:KeyboardEvent)=>{if(['ArrowDown','PageDown',' '].includes(e.key))nudge(.12);if(e.key==='ArrowUp'||e.key==='PageUp')nudge(-.12)};
    addEventListener('wheel',wheel,{passive:true});addEventListener('touchstart',touchStart,{passive:true});addEventListener('touchmove',touchMove,{passive:true});addEventListener('keydown',key);
    return ()=>{cancelAnimationFrame(raf);root.style.overflow='';removeEventListener('wheel',wheel);removeEventListener('touchstart',touchStart);removeEventListener('touchmove',touchMove);removeEventListener('keydown',key)};
  },[loadTime,replayAt]);

  // A tap plays the rest through; SKIP does the same, faster.
  const play=(seconds=2.4)=>{const s=state.current;if(s.readyAt<0){s.readyAt=(performance.now()-s.start)/1000;setStage('ready')}s.auto=seconds};
  return {stage,pct,overlayRef,play};
}
