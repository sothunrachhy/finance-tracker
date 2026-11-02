import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { locale, t } = await getI18n();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo href={localePath(locale, "/")} />
      <div className="grid gap-2">
        <p className="text-muted-foreground text-sm font-medium">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">{t("notFound.title")}</h1>
        <p className="text-muted-foreground">{t("notFound.description")}</p>
      </div>
      <Link href={localePath(locale, "/dashboard")} className={buttonVariants()}>
        {t("notFound.goToDashboard")}
      </Link>
    </main>
  );
}
