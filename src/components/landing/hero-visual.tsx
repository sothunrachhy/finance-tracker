import Image, { type StaticImageData } from "next/image";
import { ChartBarIcon } from "@/components/icons/mingcute";
import { cn } from "@/lib/utils";

/**
 * The real dashboard screenshot, tilted in 3D inside a glossy ring, with a floating
 * chart badge. Only the screenshot carries meaning; the rest is decoration.
 */
export function HeroVisual({
  light,
  dark,
  alt,
}: {
  light: StaticImageData;
  dark: StaticImageData;
  alt: string;
}) {
  const sizes = "(min-width: 1024px) 640px, 100vw";

  return (
    <div className="relative mx-auto w-full max-w-2xl py-8 lg:max-w-none">
      {/* Mint glow under everything */}
      <div
        aria-hidden
        className="absolute inset-x-[-8%] inset-y-[5%] rounded-full bg-[radial-gradient(closest-side,var(--mint),transparent)] blur-2xl"
      />

      {/* The ring passes behind the screenshot at the top and in front of it at the bottom */}
      <Ring part="back" />

      <div className="relative [perspective:1800px]">
        <div className="rounded-[1.25rem] border border-white/80 bg-white/70 p-2 shadow-[0_40px_80px_-30px_rgb(13_94_84/0.45)] backdrop-blur transition-transform duration-700 ease-out lg:[transform:rotateY(-16deg)_rotateX(7deg)_rotateZ(2deg)] lg:hover:[transform:rotateY(-6deg)_rotateX(2deg)] dark:border-white/10 dark:bg-white/5 dark:shadow-black/60">
          <Image
            src={light}
            alt={alt}
            placeholder="blur"
            sizes={sizes}
            preload
            className="rounded-xl dark:hidden"
          />
          <Image src={dark} alt={alt} sizes={sizes} className="hidden rounded-xl dark:block" />
        </div>
      </div>

      <Ring part="front" />

      <div
        aria-hidden
        className="landing-float absolute top-0 right-[6%] flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-teal-600 text-white shadow-xl ring-1 shadow-emerald-600/40 ring-white/30 ring-inset sm:size-20"
      >
        <ChartBarIcon className="size-8 sm:size-10" />
      </div>
    </div>
  );
}

/** One half of a tilted, glowing ellipse. Two halves let the ring wrap around the screenshot. */
function Ring({ part }: { part: "back" | "front" }) {
  const id = `hero-ring-${part}`;
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 240"
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute inset-x-[-10%] top-[16%] bottom-[-14%] h-auto w-[120%] overflow-visible",
        part === "front" && "drop-shadow-[0_10px_14px_rgb(13_148_136/0.35)]",
      )}
    >
      <defs>
        <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6ee7b7" />
          <stop offset="0.45" stopColor="#ccfbf1" />
          <stop offset="0.7" stopColor="#5eead4" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
        {/* Top half for the back part, bottom half for the front part */}
        <clipPath id={`${id}-clip`}>
          <rect
            x="-50"
            y={part === "back" ? -50 : 128}
            width="500"
            height={part === "back" ? 178 : 200}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`} transform="rotate(-10 200 128)">
        {/* A soft halo, then the bright band, then a thin highlight along it */}
        <ellipse
          cx="200"
          cy="128"
          rx="196"
          ry="74"
          fill="none"
          stroke={`url(#${id}-stroke)`}
          strokeWidth="22"
          strokeOpacity="0.25"
          vectorEffect="non-scaling-stroke"
        />
        <ellipse
          cx="200"
          cy="128"
          rx="196"
          ry="74"
          fill="none"
          stroke={`url(#${id}-stroke)`}
          strokeWidth="11"
          vectorEffect="non-scaling-stroke"
        />
        <ellipse
          cx="200"
          cy="125"
          rx="194"
          ry="71"
          fill="none"
          stroke="white"
          strokeOpacity="0.7"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}
