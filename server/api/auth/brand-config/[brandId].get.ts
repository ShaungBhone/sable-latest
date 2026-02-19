import { fetchBackendBrandConfig } from "../../../utils/backend-brand-config";
import {
  clearAuthSessionCookie,
  getAuthSessionCookie,
} from "../../../utils/auth-session";
import {
  createBadRequestError,
  createUnauthorizedError,
} from "../../../utils/http-errors";

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== "object") {
    return null;
  }

  const maybeError = error as {
    statusCode?: unknown;
    response?: { status?: unknown };
  };
  const statusCode = Number(maybeError.statusCode);
  if (!Number.isNaN(statusCode) && statusCode > 0) {
    return statusCode;
  }

  const responseStatus = Number(maybeError.response?.status);
  if (!Number.isNaN(responseStatus) && responseStatus > 0) {
    return responseStatus;
  }

  return null;
}

export default defineEventHandler(async (event) => {
  const sessionCookie = getAuthSessionCookie(event);

  if (!sessionCookie) {
    throw createUnauthorizedError("Missing session cookie.");
  }

  const rawBrandId = getRouterParam(event, "brandId");
  const brandId =
    typeof rawBrandId === "string" && rawBrandId.trim().length > 0
      ? rawBrandId
      : null;

  if (!brandId) {
    throw createBadRequestError("Missing brand id.");
  }

  try {
    const result = await fetchBackendBrandConfig(event, sessionCookie, brandId);
    setResponseHeader(event, "Cache-Control", "no-store");

    return {
      brandConfig: result.brandConfig,
      permissions: Array.from(new Set(result.permissions)),
    };
  } catch (error) {
    const status = getErrorStatus(error);
    if (status === 401) {
      clearAuthSessionCookie(event);
    }

    throw error;
  }
});
