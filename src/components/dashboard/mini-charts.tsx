import { cn } from "@/lib/utils";

/**
 * A tiny line-and-area chart of recent values. Decorative: the tile next to it
 * states the actual numbers. Nothing is drawn without at least two non-zero points.
 */
export function Sparkline({
  id,
  values,
  color,
  className,
}: {
  /** Unique on the page; names the SVG gradient */
  id: string;
  values: number[];
  color: string;
  className?: string;
}) {
  if (values.length < 2 || values.every((value) => value === 0)) return null;

  const width = 96;
  const height = 36;
  const pad = 3;
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const points = values.map((value, index) => [
    (index / (values.length - 1)) * width,
    height - pad - ((value - min) / range) * (height - pad * 2),
  ]);
  const line = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
      className={cn("h-9 w-24 overflow-visible", className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** A ring filled to `value` (0 to 1). Decorative: the percentage is printed beside it. */
export function ProgressRing({ value, className }: { value: number; className?: string }) {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const filled = Math.min(Math.max(value, 0), 1) * circumference;

  return (
    <svg viewBox="0 0 36 36" aria-hidden className={cn("size-12 -rotate-90", className)}>
      <defs>
        <linearGradient id="savings-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r={radius} fill="none" strokeWidth="4.5" className="stroke-muted" />
      {filled > 0 && (
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="url(#savings-ring)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
      )}
    </svg>
  );
}
