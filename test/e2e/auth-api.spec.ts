import { fetch, setup } from "@nuxt/test-utils/e2e";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

process.env.NUXT_AUTH_BACKEND_BASE_URL = "https://backend.test";

await setup({
  rootDir: process.cwd(),
  server: true,
  browser: false,
  setupTimeout: 600_000,
});

const originalFetch = globalThis.fetch;

function createJwt(payload: Record<string, unknown>) {
  const encode = (value: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(value))
      .toString("base64url")
      .replace(/=/g, "");

  return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.signature`;
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
    },
    ...init,
  });
}

describe("auth and register API", () => {
  let backendHandler: ((
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>) | null = null;

  beforeEach(() => {
    backendHandler = null;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;

        if (url.startsWith("https://backend.test")) {
          if (!backendHandler) {
            throw new Error(`Unhandled backend request: ${url}`);
          }

          return await backendHandler(input, init);
        }

        return originalFetch(input, init);
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it("returns authenticated state and sets normal cookie when backend profile succeeds", async () => {
    backendHandler = async (input) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url === "https://backend.test/login/user") {
        return jsonResponse({
          _id: "user-1",
          email: "registered@example.com",
          company_id: "company-1",
          permission: ["MODULE_HOME"],
          brand: [{ _id: "brand-1", brand_name: "Brand One" }],
        });
      }

      throw new Error(`Unexpected backend request: ${url}`);
    };

    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        idToken: "header.payload.signature",
      }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      state: "authenticated",
    });
    expect(response.headers.get("set-cookie")).toContain("sable.session=");
  });

  it("returns onboarding_required state and sets onboarding cookie for No brand", async () => {
    backendHandler = async (input) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url === "https://backend.test/login/user") {
        return jsonResponse(
          {
            message: "No brand",
          },
          { status: 401, statusText: "Unauthorized" },
        );
      }

      throw new Error(`Unexpected backend request: ${url}`);
    };

    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        idToken: "header.payload.signature",
      }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      state: "onboarding_required",
    });
    expect(response.headers.get("set-cookie")).toContain(
      "sable.onboarding-session=",
    );
  });

  it("returns 401 for /api/auth/me without session cookie", async () => {
    const response = await fetch("/api/auth/me");

    expect(response.status).toBe(401);
  });

  it("returns 401 for /api/auth/onboarding/me without onboarding session cookie", async () => {
    const response = await fetch("/api/auth/onboarding/me");

    expect(response.status).toBe(401);
  });

  it("maps register user payload to the legacy backend contract", async () => {
    let capturedBody: unknown = null;

    backendHandler = async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url === "https://backend.test/register/user/app") {
        capturedBody = init?.body ? JSON.parse(String(init.body)) : null;
        return jsonResponse({
          payment_link: "https://payments.test/checkout",
        });
      }

      throw new Error(`Unexpected backend request: ${url}`);
    };

    const response = await fetch("/api/register/user", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "new@example.com",
        password: "password123",
        packageId: "package-1",
        subscriptionPlan: "ANNUAL",
      }),
    });

    expect(response.status).toBe(200);
    expect(capturedBody).toEqual({
      email: "new@example.com",
      password: "password123",
      package: {
        id: "package-1",
        subscription_plan: "ANNUAL",
      },
    });
    expect(await response.json()).toMatchObject({
      paymentLink: "https://payments.test/checkout",
    });
  });

  it("forwards verify transaction responses", async () => {
    backendHandler = async (input) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url === "https://backend.test/register/user/verify/txn-123") {
        return jsonResponse({
          email: "verified@example.com",
        });
      }

      throw new Error(`Unexpected backend request: ${url}`);
    };

    const response = await fetch("/api/register/verify/txn-123", {
      method: "PATCH",
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      valid: true,
      email: "verified@example.com",
    });
  });

  it("requires onboarding cookie for update-user-info", async () => {
    const response = await fetch("/api/register/update-user-info", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        firstName: "Jane",
      }),
    });

    expect(response.status).toBe(401);
  });

  it("promotes onboarding cookie into normal auth cookie after update-user-info", async () => {
    backendHandler = async (input) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url === "https://backend.test/register/user/app/update-user-info") {
        return jsonResponse({
          ok: true,
        });
      }

      throw new Error(`Unexpected backend request: ${url}`);
    };

    const onboardingToken = createJwt({
      email: "onboarding@example.com",
    });

    const response = await fetch("/api/register/update-user-info", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `sable.onboarding-session=${onboardingToken}`,
      },
      body: JSON.stringify({
        firstName: "Jane",
        lastName: "Doe",
        companyName: "Acme",
        phoneNumber: "0123456789",
        email: "onboarding@example.com",
        brandLogoUrl: "https://cdn.test/logo.png",
        brandName: "Acme Brand",
        webUrl: "https://acme.test",
        webFormat: "NODEJS",
        webMaintainer: "SELF",
      }),
    });

    expect(response.status).toBe(200);
    const setCookie = response.headers.get("set-cookie") || "";
    expect(setCookie).toContain("sable.session=");
    expect(setCookie).toContain("sable.onboarding-session=");
  });
});
