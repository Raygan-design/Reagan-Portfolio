'use client';

import {useEffect, useState, type CSSProperties} from 'react';
import {createPortal} from 'react-dom';

export function SupportCelebration() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 4800);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return createPortal(<div className="support-confetti" aria-hidden="true">
    {Array.from({length:64}, (_, index) => <i key={index} style={{
      left:`${(index * 37 + 11) % 100}%`,
      background:['#ad93ff','#000047','#d9cef7','#d9c49e','#b6c9b0'][index % 5],
      width:`${5 + index % 5}px`, height:`${8 + index % 7}px`,
      borderRadius:index % 3 === 0 ? '50%' : '1px',
      '--confetti-drift':`${(index * 47 % 220) - 110}px`,
      '--confetti-turn':`${(index % 2 ? 1 : -1) * (360 + index * 29)}deg`,
      animationDelay:`${(index % 11) * .065}s`, animationDuration:`${3.1 + (index % 7) * .12}s`,
    } as CSSProperties}/>)}
  </div>, document.body);
}
