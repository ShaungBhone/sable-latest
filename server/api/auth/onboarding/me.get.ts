import {
  getOnboardingSessionCookie,
} from "../../../utils/auth-session";
import { createUnauthorizedError } from "../../../utils/http-errors";
import { readJwtPayload } from "../../../utils/jwt";

export default defineEventHandler(async (event) => {
  const sessionCookie = getOnboardingSessionCookie(event);

  if (!sessionCookie) {
    throw createUnauthorizedError("Missing onboarding session cookie.");
  }

  const payload = readJwtPayload(sessionCookie);
  const email =
    typeof payload?.email === "string" && payload.email.trim().length > 0
      ? payload.email
      : null;

  setResponseHeader(event, "Cache-Control", "no-store");

  return {
    authenticated: true,
    email,
  } as const;
});
