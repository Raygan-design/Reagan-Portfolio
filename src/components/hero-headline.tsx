const headline = 'I’m Reagan Marfo, creative entrepreneur building products, media, stories and communities.';

export function HeroHeadline() {
  let offset = 0;

  return (
    <h1 className="hero-headline" aria-label={headline}>
      <span aria-hidden="true">
        {headline.split(' ').map((word, wordIndex) => {
          const start = offset;
          offset += word.length + 1;
          const highlighted = word === 'creative' || word === 'entrepreneur';

          return (
            <span key={wordIndex}>
              {wordIndex > 0 && ' '}
              <span className="hero-word">
                {Array.from(word).map((letter, index) => (
                  <span
                    key={index}
                    className={`hero-letter${highlighted ? ' hero-letter-underlined' : ''}`}
                    style={{animationDelay: `${150 + (start + index) * 28}ms`}}
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
