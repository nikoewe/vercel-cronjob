export interface CronResult {
  path: string;
  status: number;
  ok: boolean;
  durationMs: number;
}

export async function executeCron(
  baseUrl: string,
  path: string,
  cronSecret?: string
): Promise<CronResult> {
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    "User-Agent": "vercel-cron/1.0",
  };

  if (cronSecret) {
    headers["Authorization"] = `Bearer ${cronSecret}`;
  }

  const start = performance.now();

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  const durationMs = Math.round(performance.now() - start);

  return {
    path,
    status: response.status,
    ok: response.ok,
    durationMs,
  };
}
