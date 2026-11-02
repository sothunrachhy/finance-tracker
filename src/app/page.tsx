import { ChartColumn, ShieldCheck, Target, Wallet } from "lucide-react";
import Link from "next/link";
import { DemoButton } from "@/components/auth/demo-button";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Wallet,
    title: "Track every transaction",
    text: "Log income and expenses in seconds, then search and filter by month or category.",
  },
  {
    icon: ChartColumn,
    title: "See where it goes",
    text: "Your dashboard ranks spending by category and compares income to expenses over time.",
  },
  {
    icon: Target,
    title: "Stay on budget",
    text: "Set monthly limits per category and get a warning before you go over.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    text: "Passwords are hashed with bcrypt and sessions live in secure, httpOnly cookies.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
            Log in
          </Link>
          <Link href="/register" className={buttonVariants()}>
            Sign up
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-16 md:py-24">
        <section className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            Know exactly where your money goes
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg text-pretty">
            Track income and expenses, set monthly budgets, and see your spending at a glance.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              Get started free
            </Link>
            <DemoButton size="lg">Try the demo, no sign-up</DemoButton>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 rounded-xl border p-5">
              <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="grid gap-1">
                <h2 className="font-medium">{title}</h2>
                <p className="text-muted-foreground text-sm">{text}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="text-muted-foreground border-t py-6 text-center text-sm">
        Built with Next.js, PostgreSQL and Drizzle ORM.
      </footer>
    </div>
  );
}
