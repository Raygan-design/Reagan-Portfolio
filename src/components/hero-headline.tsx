'use client';

import {useLayoutEffect, useRef} from 'react';

const headline = 'I’m Reagan Marfo, creative entrepreneur building products, media, stories and communities.';

export function HeroHeadline() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const heading = headingRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!heading) return;
    if (preference.matches) {
      heading.classList.add('hero-typing-ready');
      return;
    }

    const letters = Array.from(heading.querySelectorAll<HTMLElement>('.hero-letter'));
    const started = performance.now() + 180;
    let timer: ReturnType<typeof setInterval>;
    const finish = () => {
      clearInterval(timer);
      letters.forEach(letter => { letter.style.visibility = 'visible'; });
    };
    letters.forEach(letter => { letter.style.visibility = 'hidden'; });
    heading.classList.add('hero-typing-ready');
    timer = setInterval(() => {
      const count = Math.max(0, Math.floor((performance.now() - started) / 28));
      letters.slice(0, count).forEach(letter => { letter.style.visibility = 'visible'; });
      if (count >= letters.length) finish();
    }, 28);
    // Always reveal the complete heading, even after background-tab throttling.
    const deadline = setTimeout(finish, 3000);
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
