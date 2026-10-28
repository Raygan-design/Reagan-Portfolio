// The hero sentence, broken at its natural phrases: three lines on wider screens, sized so the
// first line fills the width, and five shorter lines on phones.
export function HeroHeadline() {
  return (
    <h1 className="hero-headline">
      <span className="hl"><span>I’m Reagan Marfo,</span> <span>a <span className="hero-underline">creative entrepreneur</span></span></span>{' '}
      <span className="hl"><span>telling stories,</span> <span>building communities</span></span>{' '}
      <span className="hl">and designing products.</span>
    </h1>
  );
}
