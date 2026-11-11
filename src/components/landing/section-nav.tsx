"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Section = { id: string; label: string };

/**
 * In-page links for the landing header. The section currently on screen gets the
 * highlighted pill (and aria-current), updated as the visitor scrolls.
 */
export function SectionNav({ sections, label }: { sections: Section[]; label: string }) {
  const [current, setCurrent] = useState(sections[0]?.id);
  // A string, so the effect doesn't re-run when the parent passes a new array
  const ids = sections.map((section) => section.id).join(" ");

  useEffect(() => {
    const targets = ids
      .split(" ")
      .map((id) => document.getElementById(id))
      .filter((target): target is HTMLElement => target !== null);
    let frame = 0;

    // The current section is the last one whose top has passed a line about a third of the
    // way down the screen. Measuring (rather than watching for crossings) stays right when
    // a link or the scrollbar jumps over sections, and keeps FAQ current in the footer.
    function update() {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let next = targets[0]?.id;
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= line) next = target.id;
      }
      setCurrent(next);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ids]);

  return (
    <nav aria-label={label} className="hidden items-center gap-1 md:flex">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-current={current === section.id ? "location" : undefined}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            current === section.id
              ? "bg-mint text-teal-800 dark:text-teal-200"
              : "hover:text-landing-ink text-slate-600 dark:text-slate-300",
          )}
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
