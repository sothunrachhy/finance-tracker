import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("auth.registerTitle") };
}

export default async function RegisterPage() {
  const { locale, t } = await getI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t("auth.createAccount")}</CardTitle>
        <CardDescription>{t("auth.registerDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <RegisterForm />
        <p className="text-muted-foreground text-center text-sm">
          {t("auth.haveAccount")}{" "}
          <Link
            href={localePath(locale, "/login")}
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            {t("auth.logInLink")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
