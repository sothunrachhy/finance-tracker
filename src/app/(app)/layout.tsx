import { Suspense } from "react";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { NavLinks } from "@/components/app-shell/nav-links";
import { UserMenu } from "@/components/app-shell/user-menu";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth";

// The shell (sidebar, header) is static and prerenders instantly. Only the parts
// that read the session stream in behind <Suspense>.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <aside className="bg-muted/30 sticky top-0 hidden h-svh w-60 shrink-0 flex-col gap-6 border-r p-4 md:flex">
        <Logo href="/dashboard" className="px-2" />
        <NavLinks />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/95 sticky top-0 z-10 flex h-14 items-center gap-2 border-b px-4 backdrop-blur md:px-8">
          <MobileNav />
          <div className="flex-1" />
          <ThemeToggle />
          <Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
            <CurrentUserMenu />
          </Suspense>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}

async function CurrentUserMenu() {
  const user = await getCurrentUser();
  return <UserMenu name={user.name} email={user.email} />;
}
