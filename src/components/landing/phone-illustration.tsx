import { Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";

const BARS = [38, 52, 46, 68, 60, 84];

/**
 * Decorative art for the closing banner: a phone showing a growing bar chart, a
 * receipt and a bank card, on a glowing ring. Pure CSS, so it stays crisp at any size.
 */
export function PhoneIllustration({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none relative h-[22rem] w-[26rem]", className)}>
      {/* Glow and the ring the phone stands on */}
      <div className="absolute inset-x-6 bottom-6 h-40 rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="absolute inset-x-2 bottom-4 h-24 rounded-[50%] border-[6px] border-white/50 shadow-[0_0_30px_rgb(167_243_208/0.8)]" />

      {/* Bank card, behind the phone */}
      <div className="absolute top-[36%] right-2 h-28 w-44 rotate-[-16deg] rounded-2xl bg-linear-to-br from-emerald-700 to-teal-500 p-4 shadow-xl ring-1 ring-white/20 ring-inset">
        <div className="h-5 w-7 rounded-md bg-linear-to-br from-amber-200 to-amber-400" />
        <div className="mt-8 flex gap-2">
          <span className="h-1.5 w-8 rounded-full bg-white/50" />
          <span className="h-1.5 w-8 rounded-full bg-white/50" />
          <span className="h-1.5 w-8 rounded-full bg-white/50" />
        </div>
      </div>

      {/* Phone */}
      <div className="absolute top-0 left-[38%] h-[19rem] w-[9.5rem] rotate-[12deg] rounded-[2rem] border-[6px] border-slate-800 bg-white shadow-2xl shadow-teal-950/40">
        <div className="mx-auto mt-1.5 h-3.5 w-14 rounded-full bg-slate-800" />
        <div className="grid gap-2 px-3 pt-4">
          <div className="flex items-center gap-1.5">
            <span className="size-4 rounded-md bg-linear-to-br from-emerald-400 to-teal-600" />
            <span className="h-1.5 w-12 rounded-full bg-slate-200" />
          </div>
          <span className="h-2.5 w-20 rounded-full bg-slate-800/80" />
          <span className="h-1.5 w-14 rounded-full bg-emerald-300" />
          <div className="mt-3 flex h-24 items-end gap-1.5 rounded-xl bg-emerald-50 p-2">
            {BARS.map((height, index) => (
              <span
                key={index}
                className="flex-1 rounded-t-md bg-linear-to-t from-emerald-600 to-emerald-300"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="mt-2 grid gap-1.5">
            <span className="h-1.5 w-full rounded-full bg-slate-100" />
            <span className="h-1.5 w-3/4 rounded-full bg-slate-100" />
            <span className="h-1.5 w-5/6 rounded-full bg-slate-100" />
          </div>
        </div>
      </div>

      {/* Receipt, in front */}
      <div className="absolute bottom-12 left-[16%] w-28 rotate-[-12deg] drop-shadow-xl">
        <div className="grid gap-2 rounded-t-lg bg-white px-3 pt-4 pb-5 [clip-path:polygon(0_0,100%_0,100%_100%,90%_94%,80%_100%,70%_94%,60%_100%,50%_94%,40%_100%,30%_94%,20%_100%,10%_94%,0_100%)]">
          <span className="h-2 w-12 rounded-full bg-slate-300" />
          <span className="h-1.5 w-full rounded-full bg-slate-200" />
          <span className="h-1.5 w-5/6 rounded-full bg-slate-200" />
          <span className="h-1.5 w-full rounded-full bg-slate-200" />
          <span className="mt-1 h-2 w-10 self-end rounded-full bg-emerald-400" />
        </div>
      </div>

      <Sparkle className="absolute top-6 right-16 size-6 fill-white text-white" />
      <Sparkle className="absolute top-24 left-10 size-4 fill-white/80 text-white/80" />
      <Sparkle className="absolute right-4 bottom-24 size-3 fill-white/70 text-white/70" />
    </div>
  );
}
