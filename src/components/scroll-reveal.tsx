'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
// Content stays visible without JS. Only below-fold editorial blocks animate once.
export function ScrollReveal(){const pathname=usePathname();useEffect(()=>{
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(reduced.matches||!('IntersectionObserver' in window))return;
 const elements=Array.from(document.querySelectorAll<HTMLElement>('#main > .section, #main > .home-film, .site-footer')).filter(el=>!el.querySelector('form')&&el.getBoundingClientRect().top>=window.innerHeight);
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.remove('reveal-pending');observer.unobserve(entry.target)}},{threshold:0,rootMargin:'0px 0px -24px 0px'});
 const revealAll=()=>{observer.disconnect();elements.forEach(el=>el.classList.remove('reveal-pending'))};
 const onFocus=(event:FocusEvent)=>{const el=event.target instanceof Element?event.target.closest('.reveal-pending'):null;el?.classList.remove('reveal-pending')};
 elements.forEach(el=>{el.classList.add('scroll-reveal','reveal-pending');observer.observe(el)});
 reduced.addEventListener('change',revealAll);document.addEventListener('focusin',onFocus);
 return()=>{revealAll();elements.forEach(el=>el.classList.remove('scroll-reveal'));reduced.removeEventListener('change',revealAll);document.removeEventListener('focusin',onFocus)};
 },[pathname]);return null;}
