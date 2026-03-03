import { loadCrons } from "./config.js";
import { defaultLogger } from "./logger.js";
import { startScheduler } from "./scheduler.js";

export { loadCrons } from "./config.js";
export type { CronEntry } from "./config.js";
export { executeCron } from "./executor.js";
export type { CronResult } from "./executor.js";
export { startScheduler } from "./scheduler.js";
export type { SchedulerConfig } from "./scheduler.js";
export type { Logger } from "./logger.js";

export interface RunCronsOptions {
  url: string;
  cronSecret?: string;
  vercelJsonPath?: string;
  logger?: { info: (message: string) => void; error: (message: string, ...args: unknown[]) => void };
}

export async function runCrons(options: RunCronsOptions) {
  const { url, cronSecret, vercelJsonPath, logger = defaultLogger } = options;

  const crons = await loadCrons(vercelJsonPath);

  logger.info(`vercel-cronjob starting...`);
  logger.info(`  URL: ${url}`);
  logger.info(`  CRON_SECRET: ${cronSecret ? "***" : "(not set)"}`);
  logger.info(`\nRegistered ${crons.length} cron(s):`);
  for (const entry of crons) {
    logger.info(`  ${entry.schedule}  →  ${entry.path}`);
  }

  const tasks = startScheduler({ crons, baseUrl: url, cronSecret, logger });

  logger.info("\nScheduler running. Waiting for triggers...\n");

  return tasks;
}
