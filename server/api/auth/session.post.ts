import {
  getSessionCookieConfig,
  setAuthSessionCookie,
} from "../../utils/auth-session";
import { fetchBackendProfile } from "../../utils/backend-profile";
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

  // Validate token against backend before minting local app cookie.
  await fetchBackendProfile(event, idToken);

  const { maxAge } = getSessionCookieConfig(event);
  const expiresIn = maxAge * 1000;

  setAuthSessionCookie(event, idToken);
  setResponseHeader(event, "Cache-Control", "no-store");

  return {
    ok: true,
    expiresAt: new Date(Date.now() + expiresIn).toISOString(),
  };
});
