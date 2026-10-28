'use client';
import Image from 'next/image';
import {useState} from 'react';
import {testimonials} from '@/lib/testimonials';

// The About page's mentorship testimonials, one at a time with previous/next controls. All quotes
// share one grid cell so the block keeps the height of the longest and never jumps.
export function MentorQuotes(){
  const [n,setN]=useState(0);const count=testimonials.length;const go=(d:number)=>setN(x=>(x+d+count)%count);
  return <div className="mentor-quotes" aria-roledescription="carousel" aria-label="Testimonials">
    <div className="mentor-quotes-stack">{testimonials.map((q,i)=><figure key={q.name} className={i===n?'on':''} aria-hidden={i!==n}>
      <blockquote>“{q.quote}”</blockquote>
      <figcaption>{q.photo&&<Image src={q.photo} alt="" width={40} height={40}/>}<span>{q.href?<a href={q.href} target="_blank" rel="noopener noreferrer" tabIndex={i===n?undefined:-1}>{q.name}</a>:q.name}<small>{q.role}</small></span></figcaption>
    </figure>)}</div>
    {count>1&&<div className="mentor-quotes-nav">
      <button type="button" aria-label="Previous testimonial" onClick={()=>go(-1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
      <span aria-live="polite">{n+1} / {count}</span>
      <button type="button" aria-label="Next testimonial" onClick={()=>go(1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
    </div>}
  </div>;
}
