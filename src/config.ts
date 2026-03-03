import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export interface CronEntry {
  path: string;
  schedule: string;
}

interface VercelJson {
  crons?: CronEntry[];
}

export async function loadCrons(
  vercelJsonPath?: string
): Promise<CronEntry[]> {
  const filePath = resolve(vercelJsonPath ?? "./vercel.json");
  const raw = await readFile(filePath, "utf-8");
  const parsed: VercelJson = JSON.parse(raw);

  if (!parsed.crons || !Array.isArray(parsed.crons)) {
    throw new Error(`No "crons" array found in ${filePath}`);
  }

  const crons: CronEntry[] = [];

  for (const entry of parsed.crons) {
    if (!entry.path || typeof entry.path !== "string") {
      throw new Error(`Invalid cron entry: missing "path"`);
    }
    if (!entry.schedule || typeof entry.schedule !== "string") {
      throw new Error(
        `Invalid cron entry for ${entry.path}: missing "schedule"`
      );
    }
    crons.push({ path: entry.path, schedule: entry.schedule });
  }

  if (crons.length === 0) {
    throw new Error(`"crons" array is empty in ${filePath}`);
  }

  return crons;
}
