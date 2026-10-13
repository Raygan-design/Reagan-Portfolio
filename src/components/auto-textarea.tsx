'use client';
import {useLayoutEffect,useRef,type ComponentProps} from 'react';
export function AutoTextarea(props:ComponentProps<'textarea'>){
 const ref=useRef<HTMLTextAreaElement>(null);
 useLayoutEffect(()=>{
  const el=ref.current;if(!el)return;
  function resize(){if(!el)return;el.style.height='auto';const css=getComputedStyle(el);el.style.height=`${el.scrollHeight+parseFloat(css.borderTopWidth)+parseFloat(css.borderBottomWidth)}px`;}
  resize();window.addEventListener('resize',resize);
  return()=>window.removeEventListener('resize',resize);
 },[props.value]);
 return <textarea {...props} ref={ref} style={{...props.style,overflowY:'hidden'}}/>;
}
