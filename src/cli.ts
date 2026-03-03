import { runCrons } from "./index.js";

async function main() {
  const url = process.env.BASE_URL;
  if (!url) {
    console.error("ERROR: BASE_URL environment variable is required");
    process.exit(1);
  }

  await runCrons({
    url,
    cronSecret: process.env.CRON_SECRET,
    vercelJsonPath: process.env.VERCEL_JSON_PATH,
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
