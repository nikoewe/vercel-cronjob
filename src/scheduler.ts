import cron from "node-cron";
import type { CronEntry } from "./config.js";
import type { Logger } from "./logger.js";
import { defaultLogger } from "./logger.js";
import { executeCron } from "./executor.js";

export interface SchedulerConfig {
  crons: CronEntry[];
  baseUrl: string;
  cronSecret?: string;
  logger?: Logger;
}

export function startScheduler(config: SchedulerConfig): cron.ScheduledTask[] {
  const { crons, baseUrl, cronSecret, logger = defaultLogger } = config;
  const tasks: cron.ScheduledTask[] = [];

  for (const entry of crons) {
    const task = cron.schedule(entry.schedule, async () => {
      const timestamp = new Date().toISOString();
      logger.info(`[${timestamp}] Triggering ${entry.path}`);

      try {
        const result = await executeCron(baseUrl, entry.path, cronSecret);
        logger.info(
          `[${timestamp}] ${result.path} → ${result.status} (${result.durationMs}ms)`
        );
      } catch (err) {
        logger.error(`[${timestamp}] ${entry.path} → FAILED:`, err);
      }
    });

    tasks.push(task);
  }

  const shutdown = () => {
    logger.info("\nShutting down scheduler...");
    for (const task of tasks) {
      task.stop();
    }
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return tasks;
}
