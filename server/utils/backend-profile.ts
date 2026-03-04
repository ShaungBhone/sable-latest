import type { H3Event } from "h3";
import {
  fetchBackend,
  getUpstreamErrorInfo,
  normalizeFetchMethod,
} from "./backend-http";

interface BackendProfileUser {
  id: string | null;
  email: string | null;
  companyId: string | null;
  selectedBrandId: string | null;
}

interface BackendProfileBrand {
  id: string | null;
  name: string | null;
}

export interface BackendProfile {
  user: BackendProfileUser;
  brands: BackendProfileBrand[];
  permissions: string[];
}

const DEFAULT_BACKEND_PROFILE_PATH = "/login/user";
const DEFAULT_BACKEND_PROFILE_METHOD = "POST";

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

function readBrandFromRecord(value: unknown): BackendProfileBrand | null {
  const data = value as Record<string, unknown>;

  return {
    id: readString(data?._id),
    name: readString(data?.brand_name),
  };
}

function readBrandList(value: unknown): BackendProfileBrand[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const brands: BackendProfileBrand[] = [];

  for (const item of value) {
    const brand = readBrandFromRecord(item);
    if (!brand) {
      continue;
    }

    const key = `${brand.id}:${brand.name}`;
    if (!brand.id || seen.has(key)) {
      continue;
    }

    seen.add(key);
    brands.push(brand);
  }

  return brands;
}

function readAllBrands(candidates: unknown[]) {
  const merged: BackendProfileBrand[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const brands = readBrandList(candidate);
    for (const brand of brands) {
      if (!brand.id || seen.has(brand.id)) {
        continue;
      }

      seen.add(brand.id);
      merged.push(brand);
    }
  }

  return merged;
}

function reorderBrandsBySelected(
  brands: BackendProfileBrand[],
  selectedBrandId: string | null,
) {
  if (!selectedBrandId || brands.length <= 1) {
    return brands;
  }

  const selectedIndex = brands.findIndex(
    (brand) => brand.id === selectedBrandId,
  );
  if (selectedIndex <= 0) {
    return brands;
  }

  const [selectedBrand] = brands.splice(selectedIndex, 1);
  if (!selectedBrand) {
    return brands;
  }

  brands.unshift(selectedBrand);
  return brands;
}

function normalizeBackendProfile(payload: unknown) {
  const data = isRecord(payload) ? payload : {};

  let permissions = readPermissions(data.permission);
  if (permissions.length === 0) {
    permissions = ["MODULE_HOME"];
  }

  const userId = readString(data?._id);
  const userEmail = readString(data?.email);
  const companyId = readString(data?.company_id);
  let selectedBrandId =
    readString(data?.selectedBrandId) ??
    readString(data?.selected_brand_id) ??
    readString(data?.brandId) ??
    readString(data?.brand_id) ??
    null;

  let brands = readAllBrands([data?.brand, data?.brands]);
  if (brands.length === 0 && selectedBrandId) {
    brands = [{ id: selectedBrandId, name: selectedBrandId }];
  }

  if (!selectedBrandId && brands.length > 0) {
    selectedBrandId = brands[0]?.id ?? null;
  }

  return {
    user: {
      id: userId,
      email: userEmail,
      companyId,
      selectedBrandId,
    },
    brands: reorderBrandsBySelected(brands, selectedBrandId),
    permissions,
  } satisfies BackendProfile;
}

export function isNoBrandError(error: unknown) {
  const upstream = getUpstreamErrorInfo(error);
  return upstream?.statusCode === 401 && upstream.message === "No brand";
}

export async function fetchBackendProfile(event: H3Event, idToken: string) {
  const profilePath = DEFAULT_BACKEND_PROFILE_PATH;
  const profileMethod = normalizeFetchMethod(
    DEFAULT_BACKEND_PROFILE_METHOD,
    "POST",
  );

  const response = await fetchBackend<unknown>(event, profilePath, {
    method: profileMethod,
    headers: {
      Authorization: `Bearer ${idToken}`,
      "x-firebase-id-token": idToken,
    },
    fallbackMessage: "Unable to load user profile from backend.",
    logPrefix: "[auth] Failed to fetch backend profile",
  });

  return normalizeBackendProfile(response);
}
