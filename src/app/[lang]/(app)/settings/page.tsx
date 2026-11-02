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
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { isDemoEmail } from "@/server/demo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("settings.title") };
}

export default async function SettingsPage() {
  const { t } = await getI18n();

  return (
    <>
      <PageHeader title={t("settings.title")} description={t("settings.description")} />
      <Suspense fallback={<Skeleton className="h-96 max-w-3xl" />}>
        <Settings />
      </Suspense>
    </>
  );
}

async function Settings() {
  const user = await getCurrentUser();
  const { t } = await getI18n();
  const isDemo = isDemoEmail(user.email);

  return (
    <div className="grid max-w-3xl gap-6">
      {isDemo && (
        <p className="bg-muted flex items-start gap-2 rounded-lg px-3 py-2 text-sm">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t("settings.demoNotice")}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.profile")}</CardTitle>
          <CardDescription>{t("settings.signedInAs", { email: user.email })}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm name={user.name} currency={user.currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.password")}</CardTitle>
          <CardDescription>{t("settings.passwordDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm disabled={isDemo} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.data")}</CardTitle>
          <CardDescription>{t("settings.dataDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* A plain link: the route handler responds with a file download */}
          <a href="/api/export" className={buttonVariants({ variant: "outline" })} download>
            <Download aria-hidden />
            {t("settings.exportAll")}
          </a>
        </CardContent>
      </Card>

      <Card className="ring-destructive/30">
        <CardHeader>
          <CardTitle>{t("settings.deleteAccount")}</CardTitle>
          <CardDescription>{t("settings.deleteAccountDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountButton disabled={isDemo} />
        </CardContent>
      </Card>
    </div>
  );
}
