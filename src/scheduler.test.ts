import { describe, it, expect, vi, beforeEach } from "vitest";
import cron from "node-cron";
import { startScheduler } from "./scheduler.js";

vi.mock("node-cron", () => ({
  default: {
    schedule: vi.fn(() => ({ stop: vi.fn() })),
  },
}));

describe("startScheduler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a cron task for each entry", () => {
    const tasks = startScheduler({
      crons: [
        { path: "/api/one", schedule: "0 7 * * *" },
        { path: "/api/two", schedule: "*/5 * * * *" },
      ],
      baseUrl: "http://localhost:3000",
    });

    expect(cron.schedule).toHaveBeenCalledTimes(2);
    expect(cron.schedule).toHaveBeenCalledWith(
      "0 7 * * *",
      expect.any(Function)
    );
    expect(cron.schedule).toHaveBeenCalledWith(
      "*/5 * * * *",
      expect.any(Function)
    );
    expect(tasks).toHaveLength(2);
  });

  it("returns tasks that can be stopped", () => {
    const tasks = startScheduler({
      crons: [{ path: "/api/test", schedule: "0 7 * * *" }],
      baseUrl: "http://localhost:3000",
    });

    expect(tasks[0].stop).toBeDefined();
    tasks[0].stop();
  });
});
