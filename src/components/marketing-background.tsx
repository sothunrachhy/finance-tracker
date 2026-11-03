/**
 * The moving background behind the landing and sign-in pages: three soft glows
 * drifting slowly over a dot grid. Pure CSS (see .aurora in globals.css), so it
 * needs no JavaScript and stops for visitors who prefer reduced motion.
 * Place it first inside a `relative overflow-hidden` container.
 */
export function MarketingBackground() {
  return (
    <>
      <div className="aurora" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
    </>
  );
}
