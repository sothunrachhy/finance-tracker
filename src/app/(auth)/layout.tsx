import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/40 flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-10">
      <Logo />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
