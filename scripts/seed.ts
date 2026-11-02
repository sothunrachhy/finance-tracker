// Rebuilds the demo account with fresh sample data: `npm run db:seed`
import "dotenv/config";
import { resetDemoUser, DEMO_EMAIL } from "@/server/demo";

async function main() {
  const id = await resetDemoUser();
  console.log(`Demo account ready: ${DEMO_EMAIL} (${id})`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
