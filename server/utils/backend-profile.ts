import { type H3Event, type RouterMethod } from "h3";
import { $fetch } from "ofetch";
import { useRuntimeConfig } from "nitropack/runtime/internal/config";
import {
  createBadGatewayError,
  createServerConfigurationError,
  createUnauthorizedError,
} from "./http-errors";

interface TokenClaimsFallback {
  uid: string;
  email: string | null;
  name: string | null;
  exp: number | null;
}

interface BackendProfileUser {
  id: string;
  email: string | null;
  displayName: string | null;
  companyId: string | null;
  selectedBrandId: string | null;
}

export interface BackendProfile {
  user: BackendProfileUser;
  brandConfig: Record<string, unknown> | null;
  permissions: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readPermissions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = value
    .map((permission) =>
      typeof permission === "string" ? permission.trim() : "",
    )
    .filter((permission) => permission.length > 0);

  return Array.from(new Set(normalized));
}

function getErrorStatus(error: unknown) {
  if (isRecord(error)) {
    const statusCode = Number(error.statusCode);
    if (!Number.isNaN(statusCode) && statusCode > 0) {
      return statusCode;
    }
    const response = isRecord(error.response) ? error.response : null;
    const status = response ? Number(response.status) : Number.NaN;
    if (!Number.isNaN(status) && status > 0) {
      return status;
    }
  }

  return 500;
}

function buildBackendUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(normalizedPath, normalizedBase).toString();
}

const FETCH_METHODS = new Set<Uppercase<RouterMethod>>([
  "GET",
  "HEAD",
  "PATCH",
  "POST",
  "PUT",
  "DELETE",
  "CONNECT",
  "OPTIONS",
  "TRACE",
]);

function normalizeFetchMethod(value: unknown): Uppercase<RouterMethod> {
  if (typeof value !== "string") {
    return "POST";
  }

  const normalized = value.trim().toUpperCase();

  if (FETCH_METHODS.has(normalized as Uppercase<RouterMethod>)) {
    return normalized as Uppercase<RouterMethod>;
  }

  return "POST";
}

export function decodeIdTokenUnsafe(idToken: string): TokenClaimsFallback {
  try {
    const segments = idToken.split(".");
    const payload = segments[1];

    if (!payload) {
      return {
        uid: "",
        email: null,
        name: null,
        exp: null,
      };
    }

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Record<string, unknown>;

    return {
      uid:
        readString(decoded.user_id) ??
        readString(decoded.uid) ??
        readString(decoded.sub) ??
        "",
      email: readString(decoded.email),
      name: readString(decoded.name),
      exp: typeof decoded.exp === "number" ? decoded.exp : null,
    };
  } catch {
    return {
      uid: "",
      email: null,
      name: null,
      exp: null,
    };
  }
}

function normalizeBackendProfile(
  payload: unknown,
  fallback: TokenClaimsFallback,
) {
  const source = isRecord(payload) ? payload : {};
  const data = isRecord(source.data) ? source.data : source;
  const userSource = isRecord(data.user) ? data.user : data;
  const brandConfigCandidate = data.brandConfig ?? data.brand_config ?? null;
  const brandConfig = isRecord(brandConfigCandidate)
    ? brandConfigCandidate
    : null;

  let permissions = readPermissions(data.permissions);

  if (permissions.length === 0) {
    permissions = readPermissions(data.permission_menu);
  }

  if (permissions.length === 0) {
    permissions = readPermissions(brandConfig?.permission_menu);
  }

  if (permissions.length === 0) {
    permissions = ["MODULE_HOME"];
  }

  return {
    user: {
      id:
        readString(userSource.id) ??
        readString(userSource.userId) ??
        readString(userSource.user_id) ??
        fallback.uid,
      email: readString(userSource.email) ?? fallback.email,
      displayName:
        readString(userSource.displayName) ??
        readString(userSource.display_name) ??
        readString(userSource.name) ??
        fallback.name,
      companyId:
        readString(userSource.companyId) ??
        readString(userSource.company_id) ??
        null,
      selectedBrandId:
        readString(userSource.selectedBrandId) ??
        readString(userSource.selected_brand_id) ??
        readString(userSource.brandId) ??
        readString(userSource.brand_id) ??
        null,
    },
    brandConfig,
    permissions,
  } satisfies BackendProfile;
}

export async function fetchBackendProfile(event: H3Event, idToken: string) {
  const config = useRuntimeConfig(event);
  const backendBaseUrl = config.auth.backendBaseUrl;
  const profilePath = config.auth.backendProfilePath || "/login/user";
  const profileMethod = normalizeFetchMethod(config.auth.backendProfileMethod);

  if (!backendBaseUrl) {
    throw createServerConfigurationError("Missing NUXT_AUTH_BACKEND_BASE_URL.");
  }

  const fallbackClaims = decodeIdTokenUnsafe(idToken);

  try {
    const response = await $fetch<unknown>(
      buildBackendUrl(backendBaseUrl, profilePath),
      {
        method: profileMethod,
        headers: {
          Authorization: `Bearer ${idToken}`,
          "x-firebase-id-token": idToken,
        },
      },
    );

    return normalizeBackendProfile(response, fallbackClaims);
  } catch (error) {
    const status = getErrorStatus(error);

    if (status === 401 || status === 403) {
      throw createUnauthorizedError("Invalid authentication token.");
    }

    console.error("[auth] Failed to fetch backend profile", error);
    throw createBadGatewayError("Unable to load user profile from backend.");
  }
}
