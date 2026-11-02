import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

// Placeholder: charts and totals arrive in Phase 4.
export default function DashboardPage() {
  return (
    <Suspense fallback={<Skeleton className="h-16 w-72" />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const user = await getCurrentUser();
  return <PageHeader title={`Welcome back, ${user.name.split(" ")[0]}`} />;
}
