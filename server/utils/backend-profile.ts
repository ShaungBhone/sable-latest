import { type H3Event, type RouterMethod } from "h3";
import { $fetch } from "ofetch";
import { useRuntimeConfig } from "nitropack/runtime/internal/config";
import { createBadGatewayError } from "./http-errors";

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

  const id = readString(data?._id);

  const name = readString(data?.brand_name);

  return {
    id,
    name,
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

function readAllBrands(candidates: unknown[]): BackendProfileBrand[] {
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
  
  console.log('asdf', selectedBrandId);

  let brands = readAllBrands([
    data?.brand,
    data?.brands,
    data?.brand_list,
    data?.all_brands,
    data?.allBrands,
    data?.user_brands,
  ]);

  if (brands.length === 0 && selectedBrandId) {
    brands = [{ id: selectedBrandId, name: selectedBrandId }];
  }

  if (!selectedBrandId && brands.length > 0) {
    selectedBrandId = brands[0]?.id ?? null;
  }

  brands = reorderBrandsBySelected(brands, selectedBrandId);

  return {
    user: {
      id: userId,
      email: userEmail,
      companyId,
      selectedBrandId,
    },
    brands,
    permissions,
  } satisfies BackendProfile;
}

export async function fetchBackendProfile(event: H3Event, idToken: string) {
  const config = useRuntimeConfig(event);
  const backendBaseUrl = config.auth.backendBaseUrl;
  const profilePath = config.auth.backendProfilePath || "/login/user";
  const profileMethod = normalizeFetchMethod(config.auth.backendProfileMethod);

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

    return normalizeBackendProfile(response);
  } catch (error) {
    console.error("[auth] Failed to fetch backend profile", error);
    throw createBadGatewayError("Unable to load user profile from backend.");
  }
}
