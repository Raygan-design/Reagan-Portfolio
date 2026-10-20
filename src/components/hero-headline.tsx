'use client';

import {useEffect, useRef} from 'react';

const headline = 'I’m Reagan Marfo, creative entrepreneur building products, media, stories and communities.';

export function HeroHeadline() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const heading = headingRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!heading || preference.matches) return;

    const letters = Array.from(heading.querySelectorAll<HTMLElement>('.hero-letter'));
    const started = performance.now();
    let timer: ReturnType<typeof setInterval>;
    const finish = () => {
      clearInterval(timer);
      letters.forEach(letter => { letter.style.visibility = 'visible'; });
    };
    letters.forEach(letter => { letter.style.visibility = 'hidden'; });
    timer = setInterval(() => {
      const count = Math.floor((performance.now() - started) / 28);
      letters.slice(0, count).forEach(letter => { letter.style.visibility = 'visible'; });
      if (count >= letters.length) finish();
    }, 28);
    // Always reveal the complete heading, even after background-tab throttling.
    const deadline = setTimeout(finish, 2800);
    const onVisibility = () => { if (document.hidden) finish(); };
    preference.addEventListener('change', finish);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      finish();
      clearTimeout(deadline);
      preference.removeEventListener('change', finish);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <h1 ref={headingRef} className="hero-headline" aria-label={headline}>
      <span aria-hidden="true">
        {headline.split(' ').map((word, wordIndex) => {
          const highlighted = word === 'creative' || word === 'entrepreneur';

          return (
            <span key={wordIndex}>
              {wordIndex > 0 && ' '}
              <span className="hero-word">
                {Array.from(word).map((letter, index) => (
                  <span
                    key={index}
                    className={`hero-letter${highlighted ? ' hero-letter-underlined' : ''}`}
                  >{letter}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </h1>
  );
}
