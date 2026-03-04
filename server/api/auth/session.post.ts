import {
  clearAuthSessionCookie,
  clearOnboardingSessionCookie,
  getSessionCookieConfig,
  setOnboardingSessionCookie,
  setAuthSessionCookie,
} from "../../utils/auth-session";
import {
  fetchBackendProfile,
  isNoBrandError,
} from "../../utils/backend-profile";
import { createBadRequestError } from "../../utils/http-errors";

interface SessionRequestBody {
  idToken?: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SessionRequestBody>(event);
  const idToken = body?.idToken;

  if (!idToken || typeof idToken !== "string") {
    throw createBadRequestError("idToken is required.");
  }

  const { maxAge } = getSessionCookieConfig(event);
  const expiresIn = maxAge * 1000;
  const expiresAt = new Date(Date.now() + expiresIn).toISOString();

  try {
    await fetchBackendProfile(event, idToken);
    setAuthSessionCookie(event, idToken);
    clearOnboardingSessionCookie(event);
    setResponseHeader(event, "Cache-Control", "no-store");

    return {
      ok: true,
      state: "authenticated",
      expiresAt,
    } as const;
  } catch (error) {
    if (isNoBrandError(error)) {
      clearAuthSessionCookie(event);
      setOnboardingSessionCookie(event, idToken);
      setResponseHeader(event, "Cache-Control", "no-store");

      return {
        ok: true,
        state: "onboarding_required",
        expiresAt,
      } as const;
    }

    clearAuthSessionCookie(event);
    clearOnboardingSessionCookie(event);
    throw error;
  }
});
