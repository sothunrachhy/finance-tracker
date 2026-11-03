import { DotField } from "@/components/dot-field";

/**
 * The moving background behind the landing and sign-in pages: three soft glows
 * drifting slowly (pure CSS, see .aurora in globals.css) and a dot grid that
 * reacts to the mouse. Stops moving for visitors who prefer reduced motion.
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
      <DotField />
    </>
  );
}
