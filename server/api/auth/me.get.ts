import {
  clearAuthSessionCookie,
  getSessionCookieConfig,
  getAuthSessionCookie,
} from "../../utils/auth-session";
import {
  type BackendProfile,
  fetchBackendProfile,
} from "../../utils/backend-profile";
import { createUnauthorizedError } from "../../utils/http-errors";

export default defineEventHandler(async (event) => {
  const sessionCookie = getAuthSessionCookie(event);

  if (!sessionCookie) {
    throw createUnauthorizedError("Missing session cookie.");
  }

  const { maxAge } = getSessionCookieConfig(event);
  let profile: BackendProfile;

  try {
    profile = await fetchBackendProfile(event, sessionCookie);
  } catch (error) {
    if (isError(error) && error.statusCode === 401) {
      clearAuthSessionCookie(event);
    }

    throw error;
  }

  setResponseHeader(event, "Cache-Control", "no-store");

  const expiresAt = new Date(
    (Math.floor(Date.now() / 1000) + maxAge) * 1000,
  ).toISOString();

  return {
    session: {
      uid: profile.user.id,
      email: profile.user.email,
      expiresAt,
    },
    user: profile.user,
    brands: profile.brands,
    brandConfig: null,
    permissions: Array.from(new Set(profile.permissions)),
  };
});
