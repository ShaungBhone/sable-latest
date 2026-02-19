import { type H3Event, type RouterMethod } from "h3";
import { $fetch } from "ofetch";
import { useRuntimeConfig } from "nitropack/runtime/internal/config";
import { createBadGatewayError } from "./http-errors";

interface BackendBrandConfigResponse {
  brandConfig: Record<string, unknown> | null;
  permissions: string[];
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeFetchMethod(value: unknown): Uppercase<RouterMethod> {
  if (typeof value !== "string") {
    return "GET";
  }

  const normalized = value.trim().toUpperCase();

  if (FETCH_METHODS.has(normalized as Uppercase<RouterMethod>)) {
    return normalized as Uppercase<RouterMethod>;
  }

  return "GET";
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

function readPermissionsFromCandidates(candidates: unknown[]) {
  for (const candidate of candidates) {
    const permissions = readPermissions(candidate);
    if (permissions.length > 0) {
      return permissions;
    }
  }

  return [];
}

function buildBackendUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(normalizedPath, normalizedBase).toString();
}

function interpolatePath(pathTemplate: string, brandId: string) {
  const encodedBrandId = encodeURIComponent(brandId);
  if (pathTemplate.includes(":brandId")) {
    return pathTemplate.replace(":brandId", encodedBrandId);
  }

  return `${pathTemplate.replace(/\/$/, "")}/${encodedBrandId}`;
}

function normalizeBackendBrandConfig(
  payload: unknown,
): BackendBrandConfigResponse {
  const root = isRecord(payload) ? payload : {};
  const nestedData = isRecord(root.data) ? root.data : null;
  const nestedBrandConfig = nestedData
    ? isRecord(nestedData.brandConfig)
      ? nestedData.brandConfig
      : isRecord(nestedData.brand_config)
        ? nestedData.brand_config
        : null
    : null;
  const topLevelBrandConfig = isRecord(root.brandConfig)
    ? root.brandConfig
    : isRecord(root.brand_config)
      ? root.brand_config
      : null;
  const brandConfig =
    nestedBrandConfig ?? topLevelBrandConfig ?? nestedData ?? root;

  const permissions = readPermissionsFromCandidates([
    brandConfig.permission_menu,
    brandConfig.permissions,
    topLevelBrandConfig?.permission_menu,
    topLevelBrandConfig?.permissions,
    nestedBrandConfig?.permission_menu,
    nestedBrandConfig?.permissions,
    root.permission_menu,
    root.permissions,
    nestedData?.permission_menu,
    nestedData?.permissions,
  ]);

  return {
    brandConfig: isRecord(brandConfig) ? brandConfig : null,
    permissions,
  };
}

export async function fetchBackendBrandConfig(
  event: H3Event,
  idToken: string,
  brandId: string,
) {
  const config = useRuntimeConfig(event);
  const backendBaseUrl = config.auth.backendBaseUrl;
  const pathTemplate = config.auth.backendBrandConfigPath;
  const method = normalizeFetchMethod(config.auth.backendBrandConfigMethod);
  const backendPath = interpolatePath(pathTemplate, brandId);

  try {
    const response = await $fetch<unknown>(
      buildBackendUrl(backendBaseUrl, backendPath),
      {
        method,
        headers: {
          Authorization: `Bearer ${idToken}`,
          "x-firebase-id-token": idToken,
        },
      },
    );

    return normalizeBackendBrandConfig(response);
  } catch (error) {
    console.error("[auth] Failed to fetch backend brand config", error);
    throw createBadGatewayError("Unable to load brand config from backend.");
  }
}
