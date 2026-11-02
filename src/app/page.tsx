import { Button } from "@/components/ui/button";

// Placeholder until the real landing page is built in Phase 2.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Finance Tracker</h1>
      <p className="text-muted-foreground max-w-md">
        Track income and expenses, set monthly budgets, and see where your money goes.
      </p>
      <Button disabled>Coming soon</Button>
    </main>
  );
}
