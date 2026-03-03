import { describe, it, expect, afterEach } from "vitest";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadCrons } from "./config.js";

describe("loadCrons", () => {
  const tmpDirs: string[] = [];

  async function writeTempVercelJson(content: unknown): Promise<string> {
    const dir = await mkdtemp(join(tmpdir(), "vercel-cron-test-"));
    tmpDirs.push(dir);
    const filePath = join(dir, "vercel.json");
    await writeFile(filePath, JSON.stringify(content));
    return filePath;
  }

  afterEach(async () => {
    for (const dir of tmpDirs) {
      await rm(dir, { recursive: true, force: true });
    }
    tmpDirs.length = 0;
  });

  it("parses valid vercel.json with a single cron", async () => {
    const path = await writeTempVercelJson({
      crons: [{ path: "/api/test", schedule: "0 7 * * *" }],
    });
    const crons = await loadCrons(path);
    expect(crons).toEqual([{ path: "/api/test", schedule: "0 7 * * *" }]);
  });

  it("parses valid vercel.json with multiple crons", async () => {
    const path = await writeTempVercelJson({
      crons: [
        { path: "/api/one", schedule: "0 7 * * *" },
        { path: "/api/two", schedule: "*/5 * * * *" },
      ],
    });
    const crons = await loadCrons(path);
    expect(crons).toHaveLength(2);
    expect(crons[0].path).toBe("/api/one");
    expect(crons[1].path).toBe("/api/two");
  });

  it("throws when file does not exist", async () => {
    await expect(loadCrons("/tmp/nonexistent/vercel.json")).rejects.toThrow();
  });

  it("throws when no crons array", async () => {
    const path = await writeTempVercelJson({ builds: [] });
    await expect(loadCrons(path)).rejects.toThrow('No "crons" array');
  });

  it("throws when crons is empty", async () => {
    const path = await writeTempVercelJson({ crons: [] });
    await expect(loadCrons(path)).rejects.toThrow("empty");
  });

  it("throws when entry missing path", async () => {
    const path = await writeTempVercelJson({
      crons: [{ schedule: "0 7 * * *" }],
    });
    await expect(loadCrons(path)).rejects.toThrow('missing "path"');
  });

  it("throws when entry missing schedule", async () => {
    const path = await writeTempVercelJson({
      crons: [{ path: "/api/test" }],
    });
    await expect(loadCrons(path)).rejects.toThrow('missing "schedule"');
  });
});
