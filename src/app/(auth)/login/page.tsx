import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DemoButton } from "@/components/auth/demo-button";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Log in to see your spending and budgets.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* searchParams is request data, so the form streams in behind a boundary */}
        <Suspense fallback={<FormSkeleton />}>
          <LoginFormWithRedirect searchParams={searchParams} />
        </Suspense>
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          <Separator className="flex-1" />
          or
          <Separator className="flex-1" />
        </div>
        <DemoButton size="lg" className="w-full" />
        <p className="text-muted-foreground text-center text-sm">
          No account yet?{" "}
          <Link
            href="/register"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

async function LoginFormWithRedirect({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : undefined} />;
}

function FormSkeleton() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-14" />
      <Skeleton className="h-14" />
      <Skeleton className="h-9" />
    </div>
  );
}
