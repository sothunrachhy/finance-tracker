// Deletes every demo account and its data: `npm run db:clean-demo`
// (Expired demo copies are also cleaned up automatically whenever someone starts a demo.)
import "dotenv/config";
import { deleteExpiredDemoUsers } from "@/server/demo";

async function main() {
  const count = await deleteExpiredDemoUsers(0);
  console.log(`Deleted ${count} demo account(s)`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
