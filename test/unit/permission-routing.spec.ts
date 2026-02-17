import { describe, expect, it } from "vitest";
import {
  getFirstAllowedPath,
  getMappedModuleId,
  isGuestRoute,
  normalizeRoutePath,
  resolveRoutePermission,
} from "@/utils/permission-routing";

describe("permission routing utils", () => {
  it("normalizes localized route path and strips query/hash", () => {
    const result = normalizeRoutePath(
      "/th/segment/facebookAudience?tab=1#title",
      ["th", "en"],
    );

    expect(result).toBe("/segment/facebookAudience");
  });

  it("resolves the most specific module mapping", () => {
    const moduleId = getMappedModuleId("/automate/journey/detail");

    expect(moduleId).toBe("MODULE_JOURNEY_AUTOMATION");
  });

  it("denies mapped route when module permission is missing", () => {
    const permission = resolveRoutePermission("/campaign", ["MODULE_HOME"]);

    expect(permission.isMapped).toBe(true);
    expect(permission.allowed).toBe(false);
    expect(permission.moduleId).toBe("MODULE_CAMPAIGN");
  });

  it("returns first allowed navigation path", () => {
    const firstAllowedPath = getFirstAllowedPath(["MODULE_COOKIE_CONSENT"]);

    expect(firstAllowedPath).toBe("/cookie-consent");
  });

  it("detects guest route with locale prefix", () => {
    const guest = isGuestRoute("/en/login", ["en", "th"]);

    expect(guest).toBe(true);
  });
});
