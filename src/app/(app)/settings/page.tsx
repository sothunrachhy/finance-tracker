import { Download, Info } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";
import { PasswordForm } from "@/components/settings/password-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_EMAIL } from "@/server/demo";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, password and data." />
      <Suspense fallback={<Skeleton className="h-96 max-w-3xl" />}>
        <Settings />
      </Suspense>
    </>
  );
}

async function Settings() {
  const user = await getCurrentUser();
  const isDemo = user.email === DEMO_EMAIL;

  return (
    <div className="grid max-w-3xl gap-6">
      {isDemo && (
        <p className="bg-muted flex items-start gap-2 rounded-lg px-3 py-2 text-sm">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          You&apos;re in the shared demo account, so password changes and account deletion are
          turned off. Create your own account to try them.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Signed in as {user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm name={user.name} currency={user.currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Use at least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm disabled={isDemo} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your data</CardTitle>
          <CardDescription>
            Download every transaction as a CSV file for Excel or Sheets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* A plain link: the route handler responds with a file download */}
          <a href="/api/export" className={buttonVariants({ variant: "outline" })} download>
            <Download aria-hidden />
            Export all transactions
          </a>
        </CardContent>
      </Card>

      <Card className="ring-destructive/30">
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>
            Permanently remove your account and all of its data. This can&apos;t be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountButton disabled={isDemo} />
        </CardContent>
      </Card>
    </div>
  );
}
