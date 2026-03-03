import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { executeCron } from "./executor.js";

describe("executeCron", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
      })
    );
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("sends GET request to correct URL", async () => {
    await executeCron("http://localhost:3000", "/api/test");
    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/api/test", {
      method: "GET",
      headers: expect.objectContaining({
        "User-Agent": "vercel-cron/1.0",
      }),
    });
  });

  it("includes Authorization header when cronSecret is provided", async () => {
    await executeCron("http://localhost:3000", "/api/test", "my-secret");
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-secret",
        }),
      })
    );
  });

  it("omits Authorization header when no cronSecret", async () => {
    await executeCron("http://localhost:3000", "/api/test");
    const call = vi.mocked(fetch).mock.calls[0];
    const headers = (call[1] as RequestInit).headers as Record<string, string>;
    expect(headers).not.toHaveProperty("Authorization");
  });

  it("returns path, status, ok, and durationMs", async () => {
    const result = await executeCron("http://localhost:3000", "/api/test");
    expect(result).toEqual({
      path: "/api/test",
      status: 200,
      ok: true,
      durationMs: expect.any(Number),
    });
  });

  it("handles non-200 responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 500,
        ok: false,
      })
    );
    const result = await executeCron("http://localhost:3000", "/api/test");
    expect(result.status).toBe(500);
    expect(result.ok).toBe(false);
  });
});
