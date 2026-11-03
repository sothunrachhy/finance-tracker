/**
 * The moving background behind the landing and sign-in pages: three soft glows
 * drifting slowly (pure CSS, see .aurora in globals.css). They stay still for
 * visitors who prefer reduced motion.
 * Place it first inside a `relative overflow-hidden` container.
 */
export function MarketingBackground() {
  return (
    <div className="aurora" aria-hidden>
      <span />
      <span />
      <span />
    </div>
  );
}
