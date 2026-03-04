import type { H3Event } from "h3";
import {
  fetchBackend,
  interpolatePath,
  normalizeFetchMethod,
} from "./backend-http";

interface BackendBrandConfigResponse {
  brandConfig: Record<string, unknown> | null;
  permissions: string[];
}

const DEFAULT_BACKEND_BRAND_CONFIG_PATH = "/brand-config/:brandId";
const DEFAULT_BACKEND_BRAND_CONFIG_METHOD = "GET";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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
  const pathTemplate = DEFAULT_BACKEND_BRAND_CONFIG_PATH;
  const method = normalizeFetchMethod(DEFAULT_BACKEND_BRAND_CONFIG_METHOD, "GET");
  const backendPath = interpolatePath(pathTemplate, "brandId", brandId);

  const response = await fetchBackend<unknown>(event, backendPath, {
    method,
    headers: {
      Authorization: `Bearer ${idToken}`,
      "x-firebase-id-token": idToken,
    },
    fallbackMessage: "Unable to load brand config from backend.",
    logPrefix: "[auth] Failed to fetch backend brand config",
  });

  return normalizeBackendBrandConfig(response);
}
