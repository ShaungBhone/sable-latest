import { fetch, setup } from "@nuxt/test-utils/e2e";
import { describe, expect, it } from "vitest";

await setup({
  rootDir: process.cwd(),
  server: true,
  browser: false,
  setupTimeout: 600_000,
});

describe("auth API", () => {
  it("returns 400 when idToken is missing in session request", async () => {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
  });

  it("returns 401 for /api/auth/me without session cookie", async () => {
    const response = await fetch("/api/auth/me");

    expect(response.status).toBe(401);
  });
});
