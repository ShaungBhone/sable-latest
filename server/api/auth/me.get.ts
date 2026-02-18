import {
  clearAuthSessionCookie,
  getSessionCookieConfig,
  getAuthSessionCookie,
} from "../../utils/auth-session";
import {
  decodeIdTokenUnsafe,
  fetchBackendProfile,
} from "../../utils/backend-profile";
import { createUnauthorizedError } from "../../utils/http-errors";

export default defineEventHandler(async (event) => {
  const sessionCookie = getAuthSessionCookie(event);

  if (!sessionCookie) {
    throw createUnauthorizedError("Missing session cookie.");
  }

  const decodedToken = decodeIdTokenUnsafe(sessionCookie);
  const { maxAge } = getSessionCookieConfig(event);
  let profile;

  try {
    profile = await fetchBackendProfile(event, sessionCookie);
  } catch (error) {
    if (isError(error) && error.statusCode === 401) {
      clearAuthSessionCookie(event);
    }

    throw error;
  }

  setResponseHeader(event, "Cache-Control", "no-store");

  return {
    session: {
      uid: profile.user.id || decodedToken.uid,
      email: profile.user.email ?? decodedToken.email,
      expiresAt: new Date(
        (decodedToken.exp ?? Math.floor(Date.now() / 1000) + maxAge) * 1000,
      ).toISOString(),
    },
    user: profile.user,
    brandConfig: profile.brandConfig,
    permissions: Array.from(new Set(profile.permissions)),
  };
});
