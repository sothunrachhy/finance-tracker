// Rebuilds the demo accounts (English and Khmer) with fresh sample data: `npm run db:seed`
import "dotenv/config";
import { LOCALES } from "@/i18n/config";
import { DEMO_ACCOUNTS, resetDemoUser } from "@/server/demo";

async function main() {
  for (const locale of LOCALES) {
    const id = await resetDemoUser(locale);
    console.log(`Demo account ready: ${DEMO_ACCOUNTS[locale].email} (${id})`);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
